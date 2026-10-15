// Payment.jsx - Stripe Sandbox Integration

import React, { useEffect, useState } from "react";
import {
  FaCar,
  FaHome,
  FaPhone,
  FaInfoCircle,
  FaSignOutAlt,
  FaCreditCard,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaUser,
  FaWallet,
  FaLock,
  FaExclamationTriangle,
  FaCheckCircle,
} from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

import { db, auth } from "../firebase/firebase";
import { sendBookingEmail } from "../services/email";

// Stripe Sandbox Publishable Key
const RAW_STRIPE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "";
const STRIPE_PUBLISHABLE_KEY = RAW_STRIPE_KEY.trim();

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

// Check if publishable key is valid (not empty and not the placeholder)
const isKeyConfigured =
  Boolean(STRIPE_PUBLISHABLE_KEY) &&
  !STRIPE_PUBLISHABLE_KEY.includes("your_publishable_key") &&
  STRIPE_PUBLISHABLE_KEY.startsWith("pk_test_");

// Initialize Stripe instance only if valid test key is provided
const stripePromise = isKeyConfigured
  ? loadStripe(STRIPE_PUBLISHABLE_KEY)
  : null;

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: "#111827",
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSmoothing: "antialiased",
      fontSize: "16px",
      "::placeholder": {
        color: "#9ca3af",
      },
    },
    invalid: {
      color: "#ef4444",
      iconColor: "#ef4444",
    },
  },
  hidePostalCode: false,
};

/* ========================================================
   ERROR BOUNDARY (Prevents any blank screen crash)
======================================================== */
class PaymentErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Payment error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-white shadow-lg border border-red-200 rounded-3xl p-10 max-w-2xl mx-auto text-center my-12">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
            !
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4 text-sm">
            {this.state.error?.message || "An unexpected error occurred while loading the checkout."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition font-medium mr-3 cursor-pointer"
          >
            Refresh Page
          </button>
          <a
            href="/cars"
            className="inline-block bg-gray-200 text-gray-800 px-6 py-3 rounded-xl hover:bg-gray-300 transition font-medium"
          >
            Back to Cars
          </a>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ========================================================
   INNER PAYMENT FORM (Uses Stripe Elements Hooks)
======================================================== */
const PaymentForm = ({
  user,
  userName,
  walletBalance,
  bookingData,
  navigate,
}) => {
  const stripe = useStripe();
  const elements = useElements();

  const [useWallet, setUseWallet] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [paymentData, setPaymentData] = useState({
    firstName: "",
    lastName: "",
    email: user?.email || "",
    phone: "",
  });

  useEffect(() => {
    if (user?.email && !paymentData.email) {
      setPaymentData((prev) => ({ ...prev, email: user.email }));
    }
  }, [user]);

  const handleChange = (e) => {
    setPaymentData({
      ...paymentData,
      [e.target.name]: e.target.value,
    });
    if (errorMessage) setErrorMessage("");
  };

  const totalBookingAmount = parseFloat(bookingData?.totalAmount || bookingData?.totalPrice) || 0;
  let finalAmountToPay = totalBookingAmount;
  let walletAmountUsed = 0;

  if (useWallet && walletBalance > 0) {
    if (walletBalance >= totalBookingAmount) {
      finalAmountToPay = 0;
      walletAmountUsed = totalBookingAmount;
    } else {
      finalAmountToPay = totalBookingAmount - walletBalance;
      walletAmountUsed = walletBalance;
    }
  }

  const processPaymentSuccess = async (orderId, paymentId = "WALLET") => {
    console.log("✓ Payment Success. OrderID:", orderId, "PaymentID:", paymentId);

    try {
      const paymentMethodName =
        finalAmountToPay === 0
          ? "Wallet"
          : walletAmountUsed > 0
          ? "Stripe + Wallet"
          : "Stripe";

      // 1. SAVE PAYMENT DOCUMENT
      await addDoc(collection(db, "payments"), {
        userId: user?.uid || "",
        userEmail: user?.email || paymentData.email,
        carId: bookingData.carId || "",
        carName: bookingData.carName || "Car Rental",
        carImage: bookingData.carImage || "",
        pickupDate: bookingData.pickupDate || "",
        returnDate: bookingData.returnDate || "",
        pickupLocation: bookingData.pickupLocation || bookingData.location || "Colombo",
        totalDays: bookingData.totalDays || bookingData.days || 1,
        pricePerDay: bookingData.pricePerDay || 0,
        totalAmount: totalBookingAmount,
        amountPaidViaGateway: finalAmountToPay,
        amountPaidViaWallet: walletAmountUsed,
        needDriver: Boolean(bookingData.needDriver),
        paymentMethod: paymentMethodName,
        paymentId: paymentId,
        stripePaymentIntentId: paymentId !== "WALLET" ? paymentId : null,
        paymentStatus: "Paid",
        bookingStatus: "Confirmed",
        orderId: orderId,
        createdAt: serverTimestamp(),
      });

      // 2. UPDATE EXISTING BOOKING
      if (bookingData.bookingId) {
        await updateDoc(doc(db, "bookings", bookingData.bookingId), {
          paymentStatus: "Paid",
          status: "confirmed",
          orderId: orderId,
          paymentId: paymentId,
          paymentMethod: paymentMethodName,
        });
      }

      // 3. DEDUCT WALLET BALANCE IF USED
      if (walletAmountUsed > 0 && user?.uid) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          walletBalance: walletBalance - walletAmountUsed,
        });

        await addDoc(collection(db, "walletTransactions"), {
          userId: user.uid,
          type: "payment",
          amount: walletAmountUsed,
          bookingId: bookingData.bookingId || "",
          carName: bookingData.carName || "",
          createdAt: serverTimestamp(),
        });
      }

      // 4. SEND EMAIL NOTIFICATION
      const emailData = {
        name: paymentData.firstName || userName || user?.email,
        to_name: paymentData.firstName || userName || user?.email,
        to_email: paymentData.email || user?.email,
        user_email: paymentData.email || user?.email,
        email: paymentData.email || user?.email,
        userEmail: paymentData.email || user?.email,
        toEmail: paymentData.email || user?.email,
        recipient_email: paymentData.email || user?.email,
        car_name: bookingData.carName || "Car Rental",
        pickup_date: bookingData.pickupDate || "",
        return_date: bookingData.returnDate || "",
        total_amount: totalBookingAmount,
        booking_id: orderId,
        order_id: orderId,
        status: "Confirmed",
        payment_method: paymentMethodName,
        message: `Your booking for ${bookingData.carName} has been confirmed. Order ID: ${orderId}`,
      };

      try {
        await sendBookingEmail(emailData);
      } catch (mailErr) {
        console.warn("Email sending failed or skipped:", mailErr);
      }

      // Clear cached booking from session
      sessionStorage.removeItem("currentBooking");

      // 5. NAVIGATE TO SUCCESS SCREEN
      navigate("/payment-success", {
        state: {
          orderId: orderId,
          carName: bookingData.carName,
          carImage: bookingData.carImage,
          pickupDate: bookingData.pickupDate,
          returnDate: bookingData.returnDate,
          pickupLocation: bookingData.pickupLocation || bookingData.location,
          totalDays: bookingData.totalDays || bookingData.days,
          pricePerDay: bookingData.pricePerDay,
          totalAmount: totalBookingAmount,
          needDriver: bookingData.needDriver,
          driverCharge: bookingData.driverCharge || 1750,
          customerName: `${paymentData.firstName} ${paymentData.lastName}`.trim(),
          customerEmail: paymentData.email || user?.email,
          paymentMethod: paymentMethodName,
        },
      });
    } catch (error) {
      console.error("Error saving booking/payment:", error);
      setErrorMessage("Payment was charged, but error saving booking to database. Please contact support.");
    } finally {
      setLoading(false);
    }
  };

  /* ================= HANDLE PAYMENT SUBMISSION ================= */
  const handlePayment = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (
      !paymentData.firstName ||
      !paymentData.lastName ||
      !paymentData.email ||
      !paymentData.phone
    ) {
      setErrorMessage("Please fill all required personal details.");
      return;
    }

    if (!bookingData || !bookingData.carId) {
      alert("Booking information is missing. Please return to the booking page.");
      navigate("/cars");
      return;
    }

    const orderId = "ORD-" + Date.now();
    setLoading(true);

    try {
      // SCENARIO 1: FULL AMOUNT COVERED BY WALLET
      if (finalAmountToPay === 0) {
        await processPaymentSuccess(orderId, "WALLET");
        return;
      }

      // Step A: Create PaymentIntent on the backend
      let intentRes;
      try {
        intentRes = await fetch(`${BACKEND_URL}/api/create-payment-intent`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: finalAmountToPay,
            currency: "lkr",
            orderId: orderId,
            bookingId: bookingData.bookingId || "",
            customerEmail: paymentData.email || user?.email || "",
            customerName: `${paymentData.firstName} ${paymentData.lastName}`.trim(),
          }),
        });
      } catch (networkErr) {
        throw new Error(
          `Unable to connect to the backend at ${BACKEND_URL}. Please ensure your backend server is running ('cd backend' then 'node server.js').`
        );
      }

      const intentData = await intentRes.json();

      if (!intentRes.ok || !intentData.clientSecret) {
        throw new Error(
          intentData.error || "Failed to initialize Stripe Payment Intent on the server."
        );
      }

      // Step B: If live Stripe keys are configured and Stripe Elements is loaded
      if (isKeyConfigured && stripe && elements) {
        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
          throw new Error("Credit Card input is not ready. Please refresh the page.");
        }

        const { error: stripeError, paymentIntent } =
          await stripe.confirmCardPayment(intentData.clientSecret, {
            payment_method: {
              card: cardElement,
              billing_details: {
                name: `${paymentData.firstName} ${paymentData.lastName}`.trim(),
                email: paymentData.email || user?.email || "",
                phone: paymentData.phone,
              },
            },
          });

        if (stripeError) {
          console.error("Stripe Card Error:", stripeError);
          setErrorMessage(stripeError.message || "Card payment failed. Please check details.");
          setLoading(false);
          return;
        }

        if (paymentIntent && paymentIntent.status === "succeeded") {
          console.log("Stripe payment confirmed:", paymentIntent.id);
          await processPaymentSuccess(orderId, paymentIntent.id);
        } else {
          setErrorMessage(`Payment status: ${paymentIntent?.status || "Unknown"}`);
          setLoading(false);
        }
      } else {
        // Step C: Simulated Stripe Sandbox Mode (instant test payment without blocking user)
        console.log("Processing simulated Stripe Sandbox payment:", intentData.paymentIntentId);
        await new Promise((r) => setTimeout(r, 1200)); // realistic processing pause
        await processPaymentSuccess(orderId, intentData.paymentIntentId);
      }
    } catch (err) {
      console.error("Payment processing error:", err);
      setErrorMessage(err.message || "An unexpected error occurred during payment.");
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-3xl bg-white shadow-lg border border-gray-200 rounded-3xl p-8 md:p-10">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <FaCreditCard className="text-indigo-600" />
          Payment Details
        </h2>

        {/* ERROR BANNER */}
        {errorMessage && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl flex items-start gap-3">
            <FaExclamationTriangle className="text-xl mt-0.5 shrink-0 text-red-500" />
            <div className="text-sm">
              <p className="font-semibold">Payment Notice</p>
              <p>{errorMessage}</p>
            </div>
          </div>
        )}

        {/* SANDBOX READY BANNER */}
        {!isKeyConfigured && (
          <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-900 px-5 py-4 rounded-2xl text-sm flex items-start gap-3">
            <FaInfoCircle className="text-xl mt-0.5 shrink-0 text-blue-600" />
            <div>
              <p className="font-bold text-blue-950 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block animate-pulse"></span>
                Stripe Sandbox Ready
              </p>
              <p className="mt-1 text-gray-700">
                You can test online payments right now using the pre-filled test card below!
                To link payments directly with your Stripe Dashboard, add your <code>pk_test_...</code> key to <code>.env</code>.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handlePayment} className="space-y-6">
          {/* PERSONAL DETAILS GRID */}
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                placeholder="John"
                value={paymentData.firstName}
                onChange={handleChange}
                className="w-full bg-white border border-gray-300 text-gray-900 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                placeholder="Doe"
                value={paymentData.lastName}
                onChange={handleChange}
                className="w-full bg-white border border-gray-300 text-gray-900 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                placeholder="john@example.com"
                value={paymentData.email}
                onChange={handleChange}
                className="w-full bg-white border border-gray-300 text-gray-900 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                placeholder="+94 77 123 4567"
                value={paymentData.phone}
                onChange={handleChange}
                className="w-full bg-white border border-gray-300 text-gray-900 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          {/* BOOKING SUMMARY */}
          <div className="bg-gray-100 p-6 rounded-2xl border border-gray-300">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center justify-between">
              <span>Booking Summary</span>
              <span className="text-sm font-normal text-gray-500">
                {bookingData.pickupLocation || bookingData.location || "Colombo"}
              </span>
            </h3>
            <div className="space-y-2 text-gray-600">
              <p className="flex justify-between">
                <span>Vehicle:</span>
                <span className="font-semibold text-gray-900">
                  {bookingData.carName || "Selected Vehicle"}
                </span>
              </p>
              <p className="flex justify-between">
                <span>Pickup Date:</span>
                <span className="font-semibold text-gray-900">
                  {bookingData.pickupDate || "N/A"}
                </span>
              </p>
              <p className="flex justify-between">
                <span>Return Date:</span>
                <span className="font-semibold text-gray-900">
                  {bookingData.returnDate || "N/A"}
                </span>
              </p>
              <p className="flex justify-between">
                <span>Total Duration:</span>
                <span className="font-semibold text-gray-900">
                  {bookingData.totalDays || bookingData.days || 1} {((bookingData.totalDays || bookingData.days) === 1) ? "day" : "days"}
                </span>
              </p>
              <p className="flex justify-between">
                <span>Daily Rate:</span>
                <span className="font-semibold text-gray-900">
                  LKR {Number(bookingData.pricePerDay || 0).toLocaleString()}
                </span>
              </p>
              {bookingData.needDriver && (
                <p className="flex justify-between text-indigo-600">
                  <span>Driver Included:</span>
                  <span className="font-semibold">
                    + LKR {(bookingData.driverCharge || 1750).toLocaleString()} / day
                  </span>
                </p>
              )}
              <hr className="my-3 border-gray-300" />
              <p className="flex justify-between text-lg">
                <span className="font-bold text-gray-900">Total Price:</span>
                <span className="font-bold text-indigo-600">
                  LKR {totalBookingAmount.toLocaleString()}
                </span>
              </p>

              {/* WALLET TOGGLE */}
              {walletBalance > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-300">
                  <label className="flex items-center gap-3 cursor-pointer p-3 bg-white shadow-sm rounded-xl border border-gray-300 hover:border-indigo-400 transition">
                    <input
                      type="checkbox"
                      checked={useWallet}
                      onChange={(e) => setUseWallet(e.target.checked)}
                      className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 bg-gray-200 border-gray-300"
                    />
                    <div className="flex-1 flex justify-between items-center">
                      <span className="flex items-center gap-2 font-semibold text-gray-900">
                        <FaWallet className="text-indigo-600" /> Use Wallet Balance
                      </span>
                      <span className="text-indigo-600 font-bold">
                        LKR {walletBalance.toLocaleString()} available
                      </span>
                    </div>
                  </label>

                  {useWallet && (
                    <div className="mt-3 text-sm text-gray-600 flex justify-between px-2">
                      <span>Deducted from Wallet:</span>
                      <span className="font-semibold text-emerald-600">
                        - LKR {Math.min(walletBalance, totalBookingAmount).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* STRIPE CARD SECTION */}
          {finalAmountToPay > 0 ? (
            <div className="space-y-3">
              <label className="block text-gray-700 font-semibold flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FaCreditCard className="text-indigo-600" />
                  Credit or Debit Card
                </span>
                <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                  <FaLock className="text-xs" /> 256-bit Encrypted
                </span>
              </label>

              <div className="p-4 bg-white border border-gray-300 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 transition min-h-[50px] flex items-center">
                {isKeyConfigured && stripe ? (
                  <div className="w-full">
                    <CardElement options={CARD_ELEMENT_OPTIONS} />
                  </div>
                ) : (
                  <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
                    <div className="md:col-span-2 flex items-center gap-2">
                      <span className="text-indigo-600 font-bold text-xs bg-indigo-50 px-2 py-1 rounded">TEST</span>
                      <input
                        type="text"
                        value="4242 • 4242 • 4242 • 4242"
                        readOnly
                        className="w-full text-gray-900 font-mono text-sm focus:outline-none bg-transparent cursor-default"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value="12 / 28"
                        readOnly
                        className="w-full text-gray-900 font-mono text-sm focus:outline-none bg-transparent cursor-default"
                      />
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value="123"
                        readOnly
                        className="w-12 text-gray-900 font-mono text-sm focus:outline-none bg-transparent cursor-default"
                      />
                      <input
                        type="text"
                        value="10001"
                        readOnly
                        className="w-16 text-gray-900 font-mono text-sm focus:outline-none bg-transparent cursor-default"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* TEST CARD HELPER */}
              <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3 text-xs text-indigo-800 flex items-center gap-2">
                <FaInfoCircle className="text-indigo-600 shrink-0 text-sm" />
                <span>
                  <strong>Stripe Sandbox Test Card:</strong> <code>4242 • 4242 • 4242 • 4242</code>, Exp: <code>12/28</code>, CVC: <code>123</code>.
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center gap-3">
              <FaCheckCircle className="text-emerald-600 text-xl" />
              <div>
                <p className="font-semibold">Fully Covered by Wallet</p>
                <p className="text-sm">No card payment required. Click button below to complete booking.</p>
              </div>
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed py-4 rounded-2xl text-white text-xl font-bold transition flex items-center justify-center gap-3 shadow-lg hover:shadow-indigo-500/25 cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing Payment...
              </span>
            ) : finalAmountToPay === 0 ? (
              "Complete Booking with Wallet (LKR 0)"
            ) : (
              `Pay LKR ${finalAmountToPay.toLocaleString()} with Stripe`
            )}
          </button>

          {/* SANDBOX INFO FOOTER */}
          <div className="bg-gray-100 border border-gray-300 text-gray-600 p-4 rounded-2xl text-xs flex items-center justify-between">
            <span className="flex items-center gap-2 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              Stripe Sandbox Mode Active
            </span>
            <span className="text-gray-500">Test environment — No real charges</span>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ========================================================
   MAIN PAYMENT COMPONENT (Provides Elements Provider)
======================================================== */
const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve bookingData from location state, or fallback to sessionStorage
  const [bookingData, setBookingData] = useState(() => {
    if (location.state && location.state.carId) {
      sessionStorage.setItem("currentBooking", JSON.stringify(location.state));
      return location.state;
    }
    const cached = sessionStorage.getItem("currentBooking");
    return cached ? JSON.parse(cached) : {};
  });

  const missingBookingData = !bookingData || !bookingData.carId;

  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState("");
  const [walletBalance, setWalletBalance] = useState(0);

  /* Update cache when location state changes */
  useEffect(() => {
    if (location.state?.carId) {
      sessionStorage.setItem("currentBooking", JSON.stringify(location.state));
      setBookingData(location.state);
    }
  }, [location.state]);

  /* ================= AUTH LISTENER ================= */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const data = userSnap.data();
            setUserName(data.userName || data.email || currentUser.email);
            setWalletBalance(data.walletBalance || 0);
          } else {
            setUserName(currentUser.email);
            setWalletBalance(0);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setUserName(currentUser.email);
        }
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  /* ================= LOGOUT ================= */
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* NAVBAR */}
      <nav className="bg-white shadow-md px-10 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <FaCar className="text-3xl text-indigo-600" />
          <h1 className="text-3xl font-bold text-gray-900">CarRental</h1>
        </div>

        <div className="hidden md:flex items-center gap-8 text-gray-600 font-medium">
          <Link to="/" className="flex items-center gap-2 hover:text-indigo-600 transition">
            <FaHome /> Home
          </Link>
          <Link to="/cars" className="flex items-center gap-2 hover:text-indigo-600 transition">
            <FaCar /> Cars
          </Link>
          <Link to="/about" className="flex items-center gap-2 hover:text-indigo-600 transition">
            <FaInfoCircle /> About
          </Link>
          <Link to="/contact" className="flex items-center gap-2 hover:text-indigo-600 transition">
            <FaPhone /> Contact
          </Link>
        </div>

        <div className="flex items-center gap-5">
          {user && (
            <button
              onClick={handleLogout}
              className="bg-gray-700 hover:bg-red-600 border border-gray-300 px-5 py-2 rounded-lg text-white flex items-center gap-2 transition cursor-pointer"
            >
              <FaSignOutAlt /> Logout
            </button>
          )}
        </div>
      </nav>

      {/* PAGE CONTAINER */}
      <div className="max-w-7xl mx-auto w-full px-6 py-12 flex-1">
        <h1 className="text-5xl font-bold text-gray-900 mb-10">Checkout</h1>

        <PaymentErrorBoundary>
          {missingBookingData ? (
            <div className="bg-white shadow-lg border border-gray-200 rounded-3xl p-10 max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Booking information missing
              </h2>
              <p className="text-gray-500 mb-6">
                Please return to the car selection page and pick a vehicle.
              </p>
              <Link
                to="/cars"
                className="inline-block bg-indigo-600 text-white px-8 py-4 rounded-2xl hover:bg-indigo-700 transition"
              >
                Back to Cars
              </Link>
            </div>
          ) : (
            <Elements stripe={stripePromise}>
              <PaymentForm
                user={user}
                userName={userName}
                walletBalance={walletBalance}
                bookingData={bookingData}
                navigate={navigate}
              />
            </Elements>
          )}
        </PaymentErrorBoundary>
      </div>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white py-14 px-10">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-10">
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-3 mb-5">
              <FaCar /> CarRental
            </h2>
            <p className="text-gray-400 leading-8">
              Your trusted partner for car rentals. Quality vehicles at affordable prices.
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-5">Contact Us</h2>
            <div className="space-y-3 text-gray-400">
              <p>Email: info@carrental.com</p>
              <p>Phone: +94 77 123 4567</p>
              <p>Address: Colombo, Sri Lanka</p>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-5">Follow Us</h2>
            <div className="flex gap-5 text-gray-400">
              <span className="hover:text-white cursor-pointer">Facebook</span>
              <span className="hover:text-white cursor-pointer">Twitter</span>
              <span className="hover:text-white cursor-pointer">Instagram</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Payment;