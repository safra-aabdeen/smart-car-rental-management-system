import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaCheckCircle,
  FaFileInvoice,
  FaClipboardList,
  FaCarSide,
} from "react-icons/fa";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const paymentInfo = location.state || {};

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {/* SUCCESS CONTENT */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-10 sm:py-16">
        <div className="bg-white shadow-lg border border-gray-200 rounded-2xl sm:rounded-3xl p-6 sm:p-10 max-w-lg w-full text-center">
          {/* Animated Checkmark */}
          <div className="flex justify-center mb-5 sm:mb-6">
            <div
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
                animation: "pulseGlow 2s ease-in-out infinite",
              }}
            >
              <FaCheckCircle className="text-white text-4xl sm:text-5xl" />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">
            Payment Successful!
          </h1>

          <p className="text-gray-500 text-sm sm:text-base mb-6 sm:mb-8 leading-relaxed">
            Your car booking has been confirmed. You will receive a
            confirmation email shortly.
          </p>

          {/* Action Buttons */}
          <div className="space-y-3 sm:space-y-4">
            {/* View Invoice */}
            <button
              onClick={() =>
                navigate("/invoice", {
                  state: paymentInfo,
                })
              }
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300 py-3 sm:py-3.5 rounded-xl font-semibold text-sm sm:text-base flex items-center justify-center gap-2 sm:gap-3 transition-all shadow-sm hover:shadow"
            >
              <FaFileInvoice className="text-lg" />
              View Invoice
            </button>

            {/* View My Bookings */}
            <button
              onClick={() => navigate("/dashboard")}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 sm:py-3.5 rounded-xl font-semibold text-sm sm:text-base flex items-center justify-center gap-2 sm:gap-3 transition-all shadow-sm hover:shadow"
            >
              <FaClipboardList className="text-lg" />
              View My Bookings
            </button>

            {/* Browse More Cars */}
            <button
              onClick={() => navigate("/cars")}
              className="w-full border border-gray-300 hover:border-indigo-500/50 hover:bg-indigo-50 text-gray-700 hover:text-indigo-600 py-3 sm:py-3.5 rounded-xl font-semibold text-sm sm:text-base flex items-center justify-center gap-2 sm:gap-3 transition-all"
            >
              <FaCarSide className="text-lg" />
              Browse More Cars
            </button>
          </div>

          {/* Order ID */}
          {paymentInfo.orderId && (
            <div className="mt-6 pt-5 border-t border-gray-200">
              <p className="text-gray-500 text-xs sm:text-sm">
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

      <Footer />
    </div>
  );
};

export default PaymentSuccess;
