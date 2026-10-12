import React from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  FaCar,
  FaHome,
  FaPhone,
  FaInfoCircle,
  FaSignOutAlt,
  FaCheckCircle,
  FaFileInvoice,
  FaClipboardList,
  FaCarSide,
} from "react-icons/fa";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const paymentInfo = location.state || {};

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
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
          <button
            onClick={handleLogout}
            className="bg-gray-700 hover:bg-red-600 border border-gray-300 px-5 py-2 rounded-lg text-white flex items-center gap-2 transition"
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </nav>

      {/* SUCCESS CONTENT */}
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="bg-white shadow-lg border border-gray-200 rounded-3xl p-12 max-w-lg w-full text-center">
          {/* Animated Checkmark */}
          <div className="flex justify-center mb-6">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
                animation: "pulseGlow 2s ease-in-out infinite",
              }}
            >
              <FaCheckCircle className="text-white text-5xl" />
            </div>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Payment Successful!
          </h1>

          <p className="text-gray-500 text-lg mb-10 leading-relaxed">
            Your car booking has been confirmed. You will receive a
            confirmation email shortly.
          </p>

          {/* Action Buttons */}
          <div className="space-y-4">
            {/* View Invoice */}
            <button
              onClick={() =>
                navigate("/invoice", {
                  state: paymentInfo,
                })
              }
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-900 border border-gray-300 py-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-3 transition-all shadow-md hover:shadow-lg"
            >
              <FaFileInvoice className="text-xl" />
              View Invoice
            </button>

            {/* View My Bookings */}
            <button
              onClick={() => navigate("/dashboard")}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-3 transition-all shadow-md hover:shadow-lg"
            >
              <FaClipboardList className="text-xl" />
              View My Bookings
            </button>

            {/* Browse More Cars */}
            <button
              onClick={() => navigate("/cars")}
              className="w-full border border-gray-300 hover:border-indigo-500/50 hover:bg-indigo-50 text-gray-600 hover:text-indigo-600 py-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-3 transition-all"
            >
              <FaCarSide className="text-xl" />
              Browse More Cars
            </button>
          </div>

          {/* Order ID */}
          {paymentInfo.orderId && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-gray-500 text-sm">
                Order ID:{" "}
                <span className="font-semibold text-gray-900">
                  {paymentInfo.orderId}
                </span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Keyframe animation */}
      <style>{`
        @keyframes pulseGlow {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
          50% { transform: scale(1.05); box-shadow: 0 0 20px 10px rgba(16, 185, 129, 0.15); }
        }
      `}</style>

      {/* FOOTER */}
      <footer className="bg-gray-900 border-t border-gray-200 text-white py-14 px-10">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-10">
          <div>
            <h2 className="text-3xl font-bold flex items-center gap-3 mb-5">
              <FaCar className="text-indigo-600" /> CarRental
            </h2>
            <p className="text-gray-500 leading-8">
              Your trusted partner for car rentals. Quality vehicles at
              affordable prices.
            </p>
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-5 text-white">Contact Us</h2>
            <div className="space-y-3 text-gray-500">
              <p>Email: info@carrental.com</p>
              <p>Phone: +94 77 123 4567</p>
              <p>Address: Colombo, Sri Lanka</p>
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-5 text-white">Follow Us</h2>
            <div className="flex gap-5 text-gray-500">
              <span className="hover:text-indigo-600 cursor-pointer transition">Facebook</span>
              <span className="hover:text-indigo-600 cursor-pointer transition">Twitter</span>
              <span className="hover:text-indigo-600 cursor-pointer transition">Instagram</span>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200 my-8"></div>
        <div className="text-center text-gray-400">
          © 2026 CarRental. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default PaymentSuccess;
