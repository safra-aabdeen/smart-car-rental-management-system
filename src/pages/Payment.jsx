// Payment.jsx

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
} from "react-icons/fa";

import {
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";

import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import { db, auth } from "../firebase/firebase";

import localCars from "../data/Cars";
import md5 from "../utils/md5";
import { sendBookingEmail } from "../services/email";

// PayHere Credentials (Sandbox)
const PAYHERE_MERCHANT_ID = "1236866";
const PAYHERE_APP_ID = "4OVyvV9iqBc4JH5FFqlRRO3LI";
const PAYHERE_MERCHANT_SECRET = "MjIwMzgzOTQ3NTM4Njg0MzI2NTIzODg1ODU1MzY1MjU3MjgyMjYzNA==";

const Payment = () => {

  const navigate = useNavigate();

  const location = useLocation();

  const bookingData = location.state || {};
  const missingBookingData = !location.state || !location.state.carId;

  const [user, setUser] = useState(null);

  const [userName, setUserName] = useState("");
  const [walletBalance, setWalletBalance] = useState(0);
  const [useWallet, setUseWallet] = useState(false);

  const [loading, setLoading] = useState(false);

  const [paymentData, setPaymentData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  /* ================= AUTH ================= */

useEffect(() => {

  const unsubscribe = onAuthStateChanged(
    auth,
    async (currentUser) => {

      if (currentUser) {

        setUser(currentUser);

        try {

          const userRef = doc(
            db,
            "users",
            currentUser.uid
          );

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

          console.log(error);

          setUserName(currentUser.email);

        }

      } else {

        navigate("/login");

      }

    }
  );

  return () => unsubscribe();

}, [navigate]);

  /* ================= INPUT CHANGE ================= */

  const handleChange = (e) => {

    setPaymentData({
      ...paymentData,
      [e.target.name]: e.target.value,
    });

  };

  /* ================= LOGOUT ================= */

  const handleLogout = async () => {

    try {

      await signOut(auth);

      navigate("/");

    } catch (error) {

      console.log(error);

    }

  };

  /* ================= PAYMENT ================= */

  const handlePayment = async (e) => {

    e.preventDefault();

    if (
      !paymentData.firstName ||
      !paymentData.lastName ||
      !paymentData.email ||
      !paymentData.phone
    ) {
      return alert("Please fill all fields");
    }

    if (!bookingData || !bookingData.carId) {
      alert("Booking information is missing. Please return to the booking page.");
      navigate("/cars");
      return;
    }

    if (!window.payhere || typeof window.payhere.startPayment !== "function") {
      alert("Payment gateway is not available. Please refresh the page and try again.");
      return;
    }

    setLoading(true);

    const totalBookingAmount = parseFloat(bookingData.totalAmount) || 0;
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

    const processPaymentSuccess = async (orderId) => {
      console.log("✓ Payment Success. OrderID:", orderId);
      setLoading(false);

      try {
        // SAVE PAYMENT
        await addDoc(collection(db, "payments"), {
          userId: user.uid,
          userEmail: user.email,
          carId: bookingData.carId,
          carName: bookingData.carName,
          carImage: bookingData.carImage,
          pickupDate: bookingData.pickupDate,
          returnDate: bookingData.returnDate,
          pickupLocation: bookingData.pickupLocation,
          totalDays: bookingData.totalDays,
          pricePerDay: bookingData.pricePerDay,
          totalAmount: bookingData.totalAmount, // Keep original total
          amountPaidViaGateway: finalAmountToPay,
          amountPaidViaWallet: walletAmountUsed,
          needDriver: bookingData.needDriver,
          paymentMethod: finalAmountToPay === 0 ? "Wallet" : "PayHere + Wallet",
          paymentStatus: "Paid",
          bookingStatus: "Confirmed",
          orderId: orderId,
          createdAt: serverTimestamp(),
        });

        // UPDATE EXISTING BOOKING
        if (bookingData.bookingId) {
          await updateDoc(doc(db, "bookings", bookingData.bookingId), {
            paymentStatus: "Paid",
            status: "confirmed",
            orderId: orderId,
          });
        }

        // UPDATE WALLET
        if (walletAmountUsed > 0) {
          const userRef = doc(db, "users", user.uid);
          await updateDoc(userRef, {
            walletBalance: walletBalance - walletAmountUsed,
          });
          
          await addDoc(collection(db, "walletTransactions"), {
            userId: user.uid,
            type: "payment",
            amount: walletAmountUsed,
            bookingId: bookingData.bookingId || "",
            carName: bookingData.carName,
            createdAt: serverTimestamp(),
          });
        }

        // SEND EMAIL
        const emailData = {
          name: paymentData.firstName || userName || user.email,
          to_name: paymentData.firstName || userName || user.email,
          to_email: paymentData.email || user.email,
          user_email: paymentData.email || user.email,
          email: paymentData.email || user.email,
          userEmail: paymentData.email || user.email,
          toEmail: paymentData.email || user.email,
          recipient_email: paymentData.email || user.email,
          car_name: bookingData.carName,
          pickup_date: bookingData.pickupDate,
          return_date: bookingData.returnDate,
          total_amount: bookingData.totalAmount,
          booking_id: orderId,
          order_id: orderId,
          status: "Confirmed",
          message: `Your booking for ${bookingData.carName} has been confirmed. Order ID: ${orderId}`,
        };
        
        await sendBookingEmail(emailData);

        navigate("/payment-success", {
          state: {
            orderId: orderId,
            carName: bookingData.carName,
            carImage: bookingData.carImage,
            pickupDate: bookingData.pickupDate,
            returnDate: bookingData.returnDate,
            pickupLocation: bookingData.pickupLocation,
            totalDays: bookingData.totalDays,
            pricePerDay: bookingData.pricePerDay,
            totalAmount: bookingData.totalAmount,
            needDriver: bookingData.needDriver,
            driverCharge: bookingData.driverCharge || 1750,
            customerName: paymentData.firstName + " " + paymentData.lastName,
            customerEmail: paymentData.email || user.email,
          },
        });
      } catch (error) {
        console.error("Error saving booking:", error);
        alert("Payment successful but error saving booking. Please contact support.");
      }
    };

    try {
      const orderId = "ORD-" + Date.now();

      // If fully covered by wallet, bypass PayHere
      if (finalAmountToPay === 0) {
        await processPaymentSuccess(orderId);
        return;
      }

      const formattedAmount = finalAmountToPay.toFixed(2);
      const merchantSecretMd5 = md5(PAYHERE_MERCHANT_SECRET).toUpperCase();
      const hashInput = `${PAYHERE_MERCHANT_ID}${orderId}${formattedAmount}LKR${merchantSecretMd5}`;
      const hash = md5(hashInput).toUpperCase();

      // Create payment object for PayHere
      const payment = {
        sandbox: true,
        merchant_id: PAYHERE_MERCHANT_ID,
        app_id: PAYHERE_APP_ID,
        return_url: `${window.location.origin}/payment`,
        cancel_url: `${window.location.origin}/payment`,
        notify_url: import.meta.env.VITE_BACKEND_URL 
          ? `${import.meta.env.VITE_BACKEND_URL}/api/payhere-notify` 
          : "http://localhost:5000/api/payhere-notify",
        order_id: orderId,
        items: bookingData.carName || "Car Rental",
        amount: formattedAmount,
        currency: "LKR",
        hash: hash,
        first_name: paymentData.firstName,
        last_name: paymentData.lastName,
        email: paymentData.email,
        phone: paymentData.phone,
        address: "Car Rental Booking",
        city: bookingData.pickupLocation || "Colombo",
        country: "Sri Lanka",
      };

      console.log("💳 Starting PayHere payment with:", payment);

      // Set up callbacks
      window.payhere.onCompleted = async (returnedOrderId) => {
        await processPaymentSuccess(returnedOrderId);
      };

      window.payhere.onError = (error) => {
        console.log("✗ Payment Error:", error);
        setLoading(false);
        alert("Payment failed: " + (error || "Unknown error"));
      };

      window.payhere.onDismissed = () => {
        console.log("Payment dismissed by user");
        setLoading(false);
      };

      window.payhere.startPayment(payment);

    } catch (error) {
      console.error("Payment error:", error);
      setLoading(false);
      alert("Error: " + error.message);
    }

    // Safety reset after 5 seconds
    setTimeout(() => {
      if (loading) {
        setLoading(false);
        console.warn("⏱️ Payment timeout - resetting loading state");
      }
    }, 5000);
  };

  return (

    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* ================= NAVBAR ================= */}

      <nav className="bg-white shadow-md px-10 py-4 flex justify-between items-center">

        {/* LOGO */}

        <div className="flex items-center gap-3">

          <FaCar className="text-3xl text-indigo-600" />

          <h1 className="text-3xl font-bold text-gray-900">
            CarRental
          </h1>

        </div>

        {/* LINKS */}

        <div className="hidden md:flex items-center gap-8 text-gray-600 font-medium">

          <Link
            to="/"
            className="flex items-center gap-2 hover:text-indigo-600 transition"
          >
            <FaHome />
            Home
          </Link>

          <Link
            to="/cars"
            className="flex items-center gap-2 hover:text-indigo-600 transition"
          >
            <FaCar />
            Cars
          </Link>

          <Link
            to="/about"
            className="flex items-center gap-2 hover:text-indigo-600 transition"
          >
            <FaInfoCircle />
            About
          </Link>

          <Link
            to="/contact"
            className="flex items-center gap-2 hover:text-indigo-600 transition"
          >
            <FaPhone />
            Contact
          </Link>

        </div>

        {/* USER */}

        <div className="flex items-center gap-5">

          {
            user && (
              <>

                <button
                  onClick={handleLogout}
                  className="bg-gray-700 hover:bg-red-600 border border-gray-300 px-5 py-2 rounded-lg text-white flex items-center gap-2 transition"
                >
                  <FaSignOutAlt />
                  Logout
                </button>
              </>
            )
          }

        </div>

      </nav>

      {/* ================= PAGE ================= */}

      <div className="max-w-7xl mx-auto w-full px-6 py-12 flex-1">

        <h1 className="text-5xl font-bold text-gray-900 mb-10">
          Payment
        </h1>

        {missingBookingData ? (
          <div className="bg-white shadow-lg border border-gray-200 rounded-3xl p-10 shadow-sm max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Booking information missing</h2>
            <p className="text-gray-500 mb-6">
              Please return to the booking page and try again.
            </p>
            <Link
              to="/cars"
              className="inline-block bg-indigo-600 text-white px-8 py-4 rounded-2xl hover:bg-indigo-700 transition"
            >
              Back to Cars
            </Link>
          </div>
        ) : (
          <div className="flex justify-center">

          {/* ================= LEFT SIDE ================= */}

          <div className="w-full max-w-3xl bg-white shadow-lg border border-gray-200 rounded-3xl p-10 shadow-sm">

            <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">

              <FaCreditCard className="text-indigo-600" />

              Payment Details

            </h2>

            <form
              onSubmit={handlePayment}
              className="space-y-6"
            >

              {/* FIRST NAME */}

              <div>

                <label className="block text-gray-600 font-semibold mb-3">
                  First Name
                </label>

                <input
                  type="text"
                  name="firstName"
                  placeholder="John"
                  value={paymentData.firstName}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 text-gray-900 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

              </div>

              {/* LAST NAME */}

              <div>

                <label className="block text-gray-600 font-semibold mb-3">
                  Last Name
                </label>

                <input
                  type="text"
                  name="lastName"
                  placeholder="Doe"
                  value={paymentData.lastName}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 text-gray-900 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

              </div>

              {/* EMAIL */}

              <div>

                <label className="block text-gray-600 font-semibold mb-3">
                  Email Address
                </label>

                <input
                  type="email"
                  name="email"
                  placeholder="john@example.com"
                  value={paymentData.email}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 text-gray-900 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

              </div>

              {/* PHONE */}

              <div>

                <label className="block text-gray-600 font-semibold mb-3">
                  Phone Number
                </label>

                <input
                  type="tel"
                  name="phone"
                  placeholder="+94 77 123 4567"
                  value={paymentData.phone}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 text-gray-900 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

              </div>

              {/* BOOKING SUMMARY */}

              <div className="bg-gray-100 p-6 rounded-2xl border border-gray-300">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Booking Summary
                </h3>
                <div className="space-y-2 text-gray-600">
                  <p className="flex justify-between">
                    <span>Car:</span>
                    <span className="font-semibold">{bookingData.carName}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Pickup Date:</span>
                    <span className="font-semibold">{bookingData.pickupDate}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Return Date:</span>
                    <span className="font-semibold">{bookingData.returnDate}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Total Days:</span>
                    <span className="font-semibold">{bookingData.totalDays}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Price Per Day:</span>
                    <span className="font-semibold">LKR {bookingData.pricePerDay}</span>
                  </p>
                  <hr className="my-3 border-gray-300" />
                  <p className="flex justify-between text-lg">
                    <span className="font-bold">Total Amount:</span>
                    <span className="font-bold text-indigo-600">LKR {bookingData.totalAmount}</span>
                  </p>
                  
                  {walletBalance > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-300">
                      <label className="flex items-center gap-3 cursor-pointer p-3 bg-white shadow-lg rounded-xl border border-gray-300 hover:border-emerald-400 transition">
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
                        <div className="mt-3 text-sm text-gray-500 flex justify-between px-2">
                          <span>Amount to pay from Wallet:</span>
                          <span className="font-semibold text-red-600">
                            - LKR {Math.min(walletBalance, parseFloat(bookingData.totalAmount) || 0).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* BUTTON */}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed py-4 rounded-2xl text-white text-2xl font-bold transition flex items-center justify-center gap-3"
              >
                {loading
                  ? "Processing..."
                  : `Pay LKR ${(
                      useWallet
                        ? Math.max(0, (parseFloat(bookingData.totalAmount) || 0) - walletBalance)
                        : (parseFloat(bookingData.totalAmount) || 0)
                    ).toLocaleString()}`
                }
              </button>

              {/* INFO */}

              <div className="bg-indigo-50 border border-emerald-500/30 text-indigo-600 p-5 rounded-2xl">

                <p className="font-semibold mb-2">✓ Sandbox Mode Enabled</p>
                This is a test payment gateway. You can complete the payment using PayHere sandbox credentials.

              </div>

            </form>

          </div>

        </div>

      )}

      </div>

      {/* ================= FOOTER ================= */}

      <footer className="bg-gray-900 text-white py-14 px-10">

        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-10">

          {/* BOX 1 */}

          <div>

            <h2 className="text-3xl font-bold flex items-center gap-3 mb-5">

              <FaCar />

              CarRental

            </h2>

            <p className="text-gray-400 leading-8">

              Your trusted partner for car rentals.
              Quality vehicles at affordable prices.

            </p>

          </div>

          {/* BOX 2 */}

          <div>

            <h2 className="text-3xl font-bold mb-5">
              Contact Us
            </h2>

            <div className="space-y-3 text-gray-400">

              <p>Email: info@carrental.com</p>

              <p>Phone: +94 77 123 4567</p>

              <p>Address: Colombo, Sri Lanka</p>

            </div>

          </div>

          {/* BOX 3 */}

          <div>

            <h2 className="text-3xl font-bold mb-5">
              Follow Us
            </h2>

            <div className="flex gap-5 text-gray-400">

              <span className="hover:text-white cursor-pointer">
                Facebook
              </span>

              <span className="hover:text-white cursor-pointer">
                Twitter
              </span>

              <span className="hover:text-white cursor-pointer">
                Instagram
              </span>

            </div>

          </div>

        </div>

      </footer>

    </div>

  );
};

export default Payment;