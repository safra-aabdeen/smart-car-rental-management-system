import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  FaCar,
  FaHome,
  FaPhone,
  FaInfoCircle,
  FaSignOutAlt,
  FaPrint,
  FaArrowLeft,
  FaCheckCircle,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUserTie,
} from "react-icons/fa";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Invoice = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const invoiceData = location.state || {};
  const missingData = !location.state || !location.state.orderId;

  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userSnap = await getDoc(doc(db, "users", currentUser.uid));
          if (userSnap.exists()) {
            const data = userSnap.data();
            setUserName(data.name || data.userName || currentUser.email);
          } else {
            setUserName(currentUser.email);
          }
        } catch {
          setUserName(currentUser.email);
        }
      } else {
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const handlePrint = () => {
    window.print();
  };

  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const carTotal = (invoiceData.pricePerDay || 0) * (invoiceData.totalDays || 0);
  const driverTotal = invoiceData.needDriver
    ? (invoiceData.driverCharge || 1750) * (invoiceData.totalDays || 0)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col overflow-x-hidden">
      {/* NAVBAR - hidden on print */}
      <div className="print:hidden">
        <Navbar />
      </div>

      {/* CONTENT */}
      <div className="flex-1 px-4 sm:px-6 md:px-10 py-6 sm:py-10 max-w-4xl mx-auto w-full">
        {missingData ? (
          <div className="bg-white shadow-sm border border-gray-200 rounded-2xl p-8 max-w-md mx-auto text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Invoice Not Available</h2>
            <p className="text-gray-500 text-sm mb-6">
              No booking data found. Please check your bookings in dashboard.
            </p>
            <Link
              to="/dashboard"
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition shadow-sm"
            >
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <>
            {/* Action Buttons - hidden on print */}
            <div className="flex justify-between items-center mb-6 print:hidden">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold text-sm transition cursor-pointer"
              >
                <FaArrowLeft /> Back
              </button>
              <button
                onClick={handlePrint}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 transition shadow-sm cursor-pointer"
              >
                <FaPrint /> Print Invoice
              </button>
            </div>

            {/* INVOICE CARD */}
            <div className="bg-white shadow-sm border border-gray-200 rounded-2xl p-5 sm:p-8 md:p-10 print:shadow-none print:rounded-none print:border-none">
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-gray-200 pb-6 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <FaCar className="text-2xl text-indigo-600" />
                    <span className="text-2xl font-bold text-gray-900">CarRental</span>
                  </div>
                  <p className="text-gray-500 text-xs sm:text-sm">Colombo, Sri Lanka</p>
                  <p className="text-gray-500 text-xs sm:text-sm">info@carrental.com</p>
                  <p className="text-gray-500 text-xs sm:text-sm">+94 77 123 4567</p>
                </div>
                <div className="text-left sm:text-right">
                  <h2 className="text-2xl sm:text-3xl font-bold text-indigo-600 mb-1">INVOICE</h2>
                  <p className="text-gray-500 text-xs sm:text-sm">
                    <span className="font-semibold text-gray-700">Date: </span>
                    {today}
                  </p>
                  <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
                    <span className="font-semibold text-gray-700">Order ID: </span>
                    <span className="font-mono text-xs">{invoiceData.orderId}</span>
                  </p>
                </div>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 pb-6 border-b border-gray-200">
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Billed To
                  </h3>
                  <p className="text-base font-semibold text-gray-900">
                    {invoiceData.customerName || userName || "Customer"}
                  </p>
                  <p className="text-gray-500 text-xs sm:text-sm">
                    {invoiceData.customerEmail || user?.email || ""}
                  </p>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Payment Status
                  </h3>
                  <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                    <FaCheckCircle className="text-[10px]" /> Paid
                  </span>
                  <p className="text-gray-500 text-xs mt-1">
                    Via {invoiceData.paymentMethod || "Stripe Sandbox"}
                  </p>
                </div>
              </div>

              {/* Booking Details */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Booking Details
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="bg-gray-50 border border-gray-200 p-3 rounded-xl">
                    <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-0.5">
                      <FaCar className="text-indigo-600 text-xs" /> Car
                    </div>
                    <p className="font-bold text-gray-900 text-sm truncate">
                      {invoiceData.carName || "N/A"}
                    </p>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 p-3 rounded-xl">
                    <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-0.5">
                      <FaCalendarAlt className="text-indigo-600 text-xs" /> Pickup
                    </div>
                    <p className="font-bold text-gray-900 text-sm">
                      {invoiceData.pickupDate || "N/A"}
                    </p>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 p-3 rounded-xl">
                    <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-0.5">
                      <FaCalendarAlt className="text-indigo-600 text-xs" /> Return
                    </div>
                    <p className="font-bold text-gray-900 text-sm">
                      {invoiceData.returnDate || "N/A"}
                    </p>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 p-3 rounded-xl">
                    <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-0.5">
                      <FaMapMarkerAlt className="text-indigo-600 text-xs" /> Location
                    </div>
                    <p className="font-bold text-gray-900 text-sm truncate">
                      {invoiceData.pickupLocation || "N/A"}
                    </p>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 p-3 rounded-xl">
                    <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-0.5">
                      <FaUserTie className="text-indigo-600 text-xs" /> Driver
                    </div>
                    <p className="font-bold text-gray-900 text-sm">
                      {invoiceData.needDriver ? "Included" : "Self-drive"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Price Breakdown Table */}
              <div className="mb-6">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Price Breakdown
                </h3>
                <div className="overflow-x-auto w-full">
                  <table className="w-full min-w-[460px] text-sm">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-2.5 text-gray-500 font-semibold text-xs">Description</th>
                        <th className="text-center py-2.5 text-gray-500 font-semibold text-xs">Days</th>
                        <th className="text-center py-2.5 text-gray-500 font-semibold text-xs">Rate</th>
                        <th className="text-right py-2.5 text-gray-500 font-semibold text-xs">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr>
                        <td className="py-3.5 text-gray-900 font-medium">
                          {invoiceData.carName || "Car Rental"}
                        </td>
                        <td className="py-3.5 text-center text-gray-500">
                          {invoiceData.totalDays || 0}
                        </td>
                        <td className="py-3.5 text-center text-gray-500">
                          LKR {(invoiceData.pricePerDay || 0).toLocaleString()}
                        </td>
                        <td className="py-3.5 text-right text-gray-900 font-semibold">
                          LKR {carTotal.toLocaleString()}
                        </td>
                      </tr>
                      {invoiceData.needDriver && (
                        <tr>
                          <td className="py-3.5 text-gray-900 font-medium">
                            Driver Service
                          </td>
                          <td className="py-3.5 text-center text-gray-500">
                            {invoiceData.totalDays || 0}
                          </td>
                          <td className="py-3.5 text-center text-gray-500">
                            LKR {(invoiceData.driverCharge || 1750).toLocaleString()}
                          </td>
                          <td className="py-3.5 text-right text-gray-900 font-semibold">
                            LKR {driverTotal.toLocaleString()}
                          </td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-gray-200">
                        <td
                          colSpan="3"
                          className="py-4 text-right text-base sm:text-lg font-bold text-gray-900"
                        >
                          Total Amount:
                        </td>
                        <td className="py-4 text-right text-xl sm:text-2xl font-bold text-indigo-600">
                          LKR {(invoiceData.totalAmount || 0).toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Footer Note */}
              <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-4 sm:p-5 text-center">
                <p className="text-indigo-700 font-semibold text-xs sm:text-sm">
                  Thank you for choosing CarRental! We wish you a safe and pleasant journey.
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  For support, contact us at info@carrental.com or +94 77 123 4567
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          .print\\:hidden { display: none !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:rounded-none { border-radius: 0 !important; }
          .print\\:border-none { border: none !important; }
          body { background: white !important; }
        }
      `}</style>

      {/* FOOTER - hidden on print */}
      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
};

export default Invoice;
