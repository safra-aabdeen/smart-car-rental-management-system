const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const md5 = require('md5');
const admin = require('firebase-admin');

dotenv.config();

// Initialize Stripe with secret key
const stripe = process.env.STRIPE_SECRET_KEY 
  ? require('stripe')(process.env.STRIPE_SECRET_KEY)
  : null;

const app = express();
app.use(cors());

let db;
try {
  const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT || './serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  db = admin.firestore();
  console.log("Firebase Admin initialized successfully.");
} catch (error) {
  console.error("Failed to initialize Firebase Admin:", error.message);
  console.log("CRITICAL: Please place your serviceAccountKey.json in the backend folder.");
}

/**
 * 1. STRIPE WEBHOOK
 * Note: Must use express.raw({ type: 'application/json' }) before express.json()
 */
app.post('/api/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    if (stripe && process.env.STRIPE_WEBHOOK_SECRET && sig) {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } else {
      // In local dev/testing without webhook secret configured yet
      event = JSON.parse(req.body.toString());
    }
  } catch (err) {
    console.error(`⚠️ Stripe Webhook signature verification failed:`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log(`🔔 Stripe Webhook received event: ${event.type}`);

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const orderId = paymentIntent.metadata?.orderId;
    console.log(`💰 PaymentIntent succeeded! ID: ${paymentIntent.id}, Order ID: ${orderId}`);

    if (orderId && db) {
      try {
        // Update Payments collection
        const paymentsRef = db.collection('payments');
        const q = paymentsRef.where('orderId', '==', orderId).limit(1);
        const paymentSnap = await q.get();

        if (!paymentSnap.empty) {
          await paymentSnap.docs[0].ref.update({
            paymentId: paymentIntent.id,
            stripePaymentIntentId: paymentIntent.id,
            paymentStatus: 'Paid',
            stripeWebhookReceived: true,
          });
        }

        // Update Bookings collection
        const bookingsRef = db.collection('bookings');
        const bq = bookingsRef.where('orderId', '==', orderId).limit(1);
        const bookingSnap = await bq.get();

        if (!bookingSnap.empty) {
          await bookingSnap.docs[0].ref.update({
            paymentId: paymentIntent.id,
            paymentStatus: 'Paid',
            status: 'confirmed',
          });
        }
      } catch (dbErr) {
        console.error("Error updating Firestore from Stripe webhook:", dbErr);
      }
    }
  }

  res.json({ received: true });
});

// For all other routes, parse JSON and URL-encoded bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/**
 * 2. STRIPE: CREATE PAYMENT INTENT
 * Called by frontend before confirming card payment
 */
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const {
      amount,
      currency = 'lkr',
      orderId,
      bookingId,
      customerEmail,
      customerName,
    } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ error: "Invalid amount specified for PaymentIntent." });
    }

    const chargeCurrency = (process.env.STRIPE_CURRENCY || currency || 'lkr').toLowerCase();
    const unitAmount = Math.round(Number(amount) * 100);

    const hasRealStripeKey =
      Boolean(process.env.STRIPE_SECRET_KEY) &&
      !process.env.STRIPE_SECRET_KEY.includes('your_secret_key') &&
      process.env.STRIPE_SECRET_KEY.startsWith('sk_test_');

    if (hasRealStripeKey) {
      const stripeClient = stripe || require('stripe')(process.env.STRIPE_SECRET_KEY);
      const paymentIntent = await stripeClient.paymentIntents.create({
        amount: unitAmount,
        currency: chargeCurrency,
        automatic_payment_methods: {
          enabled: true,
        },
        description: `Car Rental Booking - Order ${orderId || 'New'}`,
        metadata: {
          orderId: orderId || '',
          bookingId: bookingId || '',
          customerEmail: customerEmail || '',
          customerName: customerName || '',
        },
      });

      console.log(`✓ Real Stripe PaymentIntent created: ${paymentIntent.id} (${amount} ${chargeCurrency.toUpperCase()})`);

      return res.status(200).json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        currency: chargeCurrency,
        amount: unitAmount,
        mode: 'live_sandbox',
      });
    }

    // Simulated Stripe Sandbox Mode (allows instant testing before adding live keys)
    const mockPaymentIntentId = `pi_test_${Date.now()}`;
    console.log(`✓ Simulated Stripe PaymentIntent created: ${mockPaymentIntentId} (${amount} ${chargeCurrency.toUpperCase()})`);

    return res.status(200).json({
      clientSecret: `seti_secret_${mockPaymentIntentId}`,
      paymentIntentId: mockPaymentIntentId,
      currency: chargeCurrency,
      amount: unitAmount,
      mode: 'simulated_sandbox',
      message: 'Running in simulated Stripe sandbox. Add your actual STRIPE_SECRET_KEY to backend/.env to sync with Stripe Dashboard.',
    });
  } catch (error) {
    console.error("Stripe Create PaymentIntent Error:", error);
    res.status(500).json({ error: error.message || "Failed to create Stripe payment intent" });
  }
});

/**
 * 3. LEGACY PAYHERE WEBHOOK (kept for backward compatibility)
 */
app.post('/api/payhere-notify', async (req, res) => {
  try {
    const {
      merchant_id,
      order_id,
      payhere_amount,
      payhere_currency,
      status_code,
      md5sig,
      payment_id
    } = req.body;

    if (process.env.PAYHERE_MERCHANT_SECRET) {
      const merchantSecretMd5 = md5(process.env.PAYHERE_MERCHANT_SECRET).toUpperCase();
      const localMd5sig = md5(`${merchant_id}${order_id}${payhere_amount}${payhere_currency}${status_code}${merchantSecretMd5}`).toUpperCase();

      if (localMd5sig !== md5sig) {
        console.error("Invalid md5 signature!");
        return res.status(400).send("Invalid signature");
      }
    }

    if (status_code === '2' && db) {
      const paymentsRef = db.collection('payments');
      const q = paymentsRef.where('orderId', '==', order_id).limit(1);
      const paymentSnap = await q.get();

      if (!paymentSnap.empty) {
        await paymentSnap.docs[0].ref.update({
          paymentId: payment_id,
          payhereWebhookReceived: true,
          status_code: status_code
        });
      }

      const bookingsRef = db.collection('bookings');
      const bq = bookingsRef.where('orderId', '==', order_id).limit(1);
      const bookingSnap = await bq.get();

      if (!bookingSnap.empty) {
        await bookingSnap.docs[0].ref.update({
          paymentId: payment_id
        });
      }
    }

    res.status(200).send("OK");
  } catch (error) {
    console.error("PayHere Webhook Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

/**
 * Helper to get PayHere Access Token (Legacy)
 */
const getPayhereToken = async () => {
  if (!process.env.PAYHERE_APP_ID || !process.env.PAYHERE_APP_SECRET) return null;
  const authString = Buffer.from(`${process.env.PAYHERE_APP_ID}:${process.env.PAYHERE_APP_SECRET}`).toString('base64');
  const response = await axios.post(
    'https://sandbox.payhere.lk/merchant/v1/oauth/token',
    'grant_type=client_credentials',
    {
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  );
  return response.data.access_token;
};

/**
 * 4. PROCESS REFUND (Supports Stripe & Wallet & Legacy PayHere)
 */
app.post('/api/refund', async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ error: "bookingId is required" });
    }

    // 1. Fetch booking details
    const bookingRef = db.collection('bookings').doc(bookingId);
    const bookingDoc = await bookingRef.get();

    if (!bookingDoc.exists) {
      return res.status(404).json({ error: "Booking not found" });
    }

    const bookingData = bookingDoc.data();

    // 2. Validate booking state
    if (bookingData.status === 'cancelled' || bookingData.paymentStatus === 'Refunded') {
      return res.status(400).json({ error: "Booking is already cancelled or refunded" });
    }
    
    if (bookingData.paymentStatus !== 'Paid' && bookingData.status !== 'confirmed') {
      return res.status(400).json({ error: "Booking is not in a paid/confirmed state" });
    }

    // 3. Find associated paymentId
    let paymentId = bookingData.paymentId;
    let paymentRefToUpdate = null;
    let refundAmount = bookingData.totalAmount || bookingData.totalPrice || 0;

    const paymentsQ = db.collection('payments').where('orderId', '==', bookingData.orderId).limit(1);
    const paymentSnap = await paymentsQ.get();
    
    if (!paymentSnap.empty) {
      const paymentData = paymentSnap.docs[0].data();
      paymentRefToUpdate = paymentSnap.docs[0].ref;
      if (!paymentId) paymentId = paymentData.paymentId || paymentData.stripePaymentIntentId;
      if (paymentData.amountPaidViaGateway !== undefined) {
        refundAmount = paymentData.amountPaidViaGateway;
      }
    }

    // Handle case where wallet paid for the full amount (0 gateway charge)
    if (refundAmount === 0 && paymentId == null) {
      await handleWalletOnlyRefund(bookingId, bookingData, paymentRefToUpdate);
      return res.status(200).json({ success: true, message: "Refunded securely to wallet (0 gateway charge)" });
    }

    if (!paymentId) {
      return res.status(400).json({ error: "Payment ID not found for this booking. Cannot process refund." });
    }

    let refundId = null;

    // A. Check if payment is Stripe (starts with 'pi_' or 'ch_')
    if (paymentId.startsWith('pi_') || paymentId.startsWith('ch_')) {
      const hasRealStripeKey =
        Boolean(process.env.STRIPE_SECRET_KEY) &&
        !process.env.STRIPE_SECRET_KEY.includes('your_secret_key') &&
        process.env.STRIPE_SECRET_KEY.startsWith('sk_test_');

      if (hasRealStripeKey && !paymentId.startsWith('pi_test_')) {
        const stripeClient = stripe || require('stripe')(process.env.STRIPE_SECRET_KEY);
        console.log(`Processing Stripe refund for Payment Intent: ${paymentId}`);

        const refund = await stripeClient.refunds.create({
          payment_intent: paymentId.startsWith('pi_') ? paymentId : undefined,
          charge: paymentId.startsWith('ch_') ? paymentId : undefined,
          reason: 'requested_by_customer',
        });

        refundId = refund.id;
        console.log(`✓ Stripe refund successful! Refund ID: ${refundId}`);
      } else {
        refundId = `re_test_${Date.now()}`;
        console.log(`✓ Simulated Stripe refund recorded! Refund ID: ${refundId}`);
      }
    } 
    // B. Legacy PayHere refund fallback
    else if (process.env.PAYHERE_APP_SECRET) {
      const token = await getPayhereToken();
      if (!token) {
        return res.status(500).json({ error: "Could not authenticate with PayHere for refund." });
      }

      console.log(`Processing PayHere refund for Payment ID: ${paymentId}`);
      const payhereResponse = await axios.post(
        'https://sandbox.payhere.lk/merchant/v1/payment/refund',
        { payment_id: paymentId, description: `Refund for booking ${bookingId}` },
        { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );

      if (payhereResponse.data.status !== 1) {
        return res.status(400).json({ error: "PayHere refund failed", details: payhereResponse.data.msg });
      }

      refundId = payhereResponse.data.data ? payhereResponse.data.data.refund_id : "PAYHERE_REFUND";
    } else {
      // Manual/Mock fallback
      refundId = `REF-${Date.now()}`;
    }

    // 5. Update Firestore
    const batch = db.batch();

    batch.update(bookingRef, {
      status: 'cancelled',
      paymentStatus: 'Refunded'
    });

    if (paymentRefToUpdate) {
      batch.update(paymentRefToUpdate, {
        paymentStatus: 'Refunded',
        refundStatus: 'Refunded',
        refundId: refundId,
      });
    }

    const refundRecordRef = db.collection('refunds').doc();
    batch.set(refundRecordRef, {
      refundId: refundId,
      bookingId: bookingId,
      orderId: bookingData.orderId,
      paymentId: paymentId,
      amount: refundAmount,
      date: admin.firestore.FieldValue.serverTimestamp(),
      status: 'Refunded',
      customerEmail: bookingData.userEmail || bookingData.customerEmail || "",
      carName: bookingData.carName
    });

    await batch.commit();

    console.log("Refund processed successfully!");
    res.status(200).json({ success: true, message: "Refund processed successfully", refundId });

  } catch (error) {
    console.error("Refund API Error:", error.response ? error.response.data : error.message);
    res.status(500).json({ error: error.message || "Failed to process refund. Check backend logs." });
  }
});

async function handleWalletOnlyRefund(bookingId, bookingData, paymentRefToUpdate) {
  const batch = db.batch();
  const bookingRef = db.collection('bookings').doc(bookingId);
  batch.update(bookingRef, {
    status: 'cancelled',
    paymentStatus: 'Refunded to Wallet'
  });

  if (paymentRefToUpdate) {
    batch.update(paymentRefToUpdate, {
      paymentStatus: 'Refunded to Wallet'
    });
  }
  
  // Refund back to wallet
  const userRef = db.collection('users').doc(bookingData.userId);
  const userDoc = await userRef.get();
  
  // Amount to return is the total price (since PayHere was 0)
  const totalAmount = bookingData.totalAmount || bookingData.totalPrice || 0;
  
  if (userDoc.exists) {
    const currentBalance = userDoc.data().walletBalance || 0;
    batch.set(userRef, { walletBalance: currentBalance + totalAmount }, { merge: true });
  }
  
  const refundRecordRef = db.collection('refunds').doc();
  batch.set(refundRecordRef, {
    refundId: "WALLET_ONLY",
    bookingId: bookingId,
    orderId: bookingData.orderId,
    amount: totalAmount,
    date: admin.firestore.FieldValue.serverTimestamp(),
    status: 'Refunded to Wallet',
    customerEmail: bookingData.userEmail || bookingData.customerEmail || "",
    carName: bookingData.carName
  });
  
  await batch.commit();
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
