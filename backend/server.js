const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const md5 = require('md5');
const admin = require('firebase-admin');

dotenv.config();

const app = express();
app.use(cors());
// PayHere sends data as application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

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
 * 1. PAYHERE WEBHOOK
 * PayHere sends a POST request here when a payment is successful.
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

    console.log(`Received webhook for order: ${order_id}, status: ${status_code}`);

    // Verify signature
    const merchantSecretMd5 = md5(process.env.PAYHERE_MERCHANT_SECRET).toUpperCase();
    const localMd5sig = md5(`${merchant_id}${order_id}${payhere_amount}${payhere_currency}${status_code}${merchantSecretMd5}`).toUpperCase();

    if (localMd5sig !== md5sig) {
      console.error("Invalid md5 signature!");
      return res.status(400).send("Invalid signature");
    }

    if (status_code === '2') { // 2 = Success
      console.log(`Payment successful for order ${order_id}. Payment ID: ${payment_id}`);

      // Update Payments collection
      const paymentsRef = db.collection('payments');
      const q = paymentsRef.where('orderId', '==', order_id).limit(1);
      const paymentSnap = await q.get();

      if (!paymentSnap.empty) {
        const paymentDoc = paymentSnap.docs[0];
        await paymentDoc.ref.update({
          paymentId: payment_id,
          payhereWebhookReceived: true,
          status_code: status_code
        });
      }

      // Update Bookings collection
      const bookingsRef = db.collection('bookings');
      const bq = bookingsRef.where('orderId', '==', order_id).limit(1);
      const bookingSnap = await bq.get();

      if (!bookingSnap.empty) {
        const bookingDoc = bookingSnap.docs[0];
        await bookingDoc.ref.update({
          paymentId: payment_id
        });
      }
    }

    res.status(200).send("OK");
  } catch (error) {
    console.error("Webhook Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

/**
 * Helper to get PayHere Access Token
 */
const getPayhereToken = async () => {
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
 * 2. PROCESS REFUND
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
    
    // We only refund if paymentStatus is Paid or booking status is confirmed
    if (bookingData.paymentStatus !== 'Paid' && bookingData.status !== 'confirmed') {
      return res.status(400).json({ error: "Booking is not in a paid/confirmed state" });
    }

    // 3. Find associated paymentId
    let paymentId = bookingData.paymentId;
    let paymentRefToUpdate = null;
    let refundAmount = bookingData.totalAmount || bookingData.totalPrice || 0;

    // Check payments collection if paymentId not in booking
    const paymentsQ = db.collection('payments').where('orderId', '==', bookingData.orderId).limit(1);
    const paymentSnap = await paymentsQ.get();
    
    if (!paymentSnap.empty) {
      const paymentData = paymentSnap.docs[0].data();
      paymentRefToUpdate = paymentSnap.docs[0].ref;
      if (!paymentId) paymentId = paymentData.paymentId;
      if (paymentData.amountPaidViaGateway !== undefined) {
        refundAmount = paymentData.amountPaidViaGateway;
      }
    }

    // Handle case where wallet paid for the full amount (no PayHere payment)
    if (refundAmount === 0 && paymentId == null) {
      // Direct wallet refund
      await handleWalletOnlyRefund(bookingId, bookingData, paymentRefToUpdate);
      return res.status(200).json({ success: true, message: "Refunded securely to wallet (0 LKR PayHere charge)" });
    }

    if (!paymentId) {
      return res.status(400).json({ error: "Payment ID not found for this booking. Cannot process PayHere refund." });
    }

    if (!process.env.PAYHERE_APP_SECRET) {
      return res.status(500).json({ error: "PAYHERE_APP_SECRET is not configured in backend" });
    }

    // 4. Process PayHere Refund
    const token = await getPayhereToken();

    console.log(`Processing refund for Payment ID: ${paymentId}`);

    const refundPayload = {
      payment_id: paymentId,
      description: `Refund for booking ${bookingId}`
    };

    const payhereResponse = await axios.post(
      'https://sandbox.payhere.lk/merchant/v1/payment/refund',
      refundPayload,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (payhereResponse.data.status !== 1) {
      console.error("PayHere refund failed:", payhereResponse.data);
      return res.status(400).json({ error: "PayHere refund failed", details: payhereResponse.data.msg });
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
        refundId: payhereResponse.data.data ? payhereResponse.data.data.refund_id : null,
      });
    }

    const refundRecordRef = db.collection('refunds').doc();
    batch.set(refundRecordRef, {
      refundId: payhereResponse.data.data ? payhereResponse.data.data.refund_id : "MANUAL",
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
    res.status(200).json({ success: true, message: "Refund processed successfully" });

  } catch (error) {
    console.error("Refund API Error:", error.response ? error.response.data : error.message);
    res.status(500).json({ error: "Failed to process refund. Check backend logs." });
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
