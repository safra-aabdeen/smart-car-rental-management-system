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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* NAVBAR - hidden on print */}
      <nav className="bg-white shadow-md px-10 py-4 flex justify-between items-center print:hidden">
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

      {/* CONTENT */}
      <div className="flex-1 px-6 py-12 max-w-4xl mx-auto w-full">
        {missingData ? (
          <div className="bg-white shadow-lg border border-gray-200 rounded-3xl p-10 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Invoice not available</h2>
            <p className="text-gray-500 mb-6">
              No booking data found. Please check your bookings.
            </p>
            <Link
              to="/dashboard"
              className="inline-block bg-indigo-600 text-white px-8 py-4 rounded-2xl hover:bg-indigo-700 transition"
            >
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <>
            {/* Action Buttons - hidden on print */}
            <div className="flex justify-between items-center mb-8 print:hidden">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-medium transition"
              >
                <FaArrowLeft /> Back
              </button>
              <button
                onClick={handlePrint}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition shadow-md"
              >
                <FaPrint /> Print Invoice
              </button>
            </div>

            {/* INVOICE CARD */}
            <div className="bg-white shadow-lg border border-gray-200 rounded-3xl p-10 print:shadow-none print:rounded-none">
              {/* Header */}
              <div className="flex justify-between items-start border-b border-gray-300 pb-8 mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <FaCar className="text-3xl text-indigo-600" />
                    <h1 className="text-3xl font-bold text-gray-900">CarRental</h1>
                  </div>
                  <p className="text-gray-500">Colombo, Sri Lanka</p>
                  <p className="text-gray-500">info@carrental.com</p>
                  <p className="text-gray-500">+94 77 123 4567</p>
                </div>
                <div className="text-right">
                  <h2 className="text-4xl font-bold text-indigo-600 mb-2">INVOICE</h2>
                  <p className="text-gray-500">
                    <span className="font-semibold text-gray-600">Date: </span>
                    {today}
                  </p>
                  <p className="text-gray-500 mt-1">
                    <span className="font-semibold text-gray-600">Order ID: </span>
                    {invoiceData.orderId}
                  </p>
                </div>
              </div>

              {/* Customer Info */}
              <div className="grid md:grid-cols-2 gap-8 mb-8 pb-8 border-b border-gray-300">
                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
                    Billed To
                  </h3>
                  <p className="text-lg font-semibold text-gray-900">
                    {invoiceData.customerName || userName || "Customer"}
                  </p>
                  <p className="text-gray-500">
                    {invoiceData.customerEmail || user?.email || ""}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
                    Payment Status
                  </h3>
                  <span className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full font-semibold">
                    <FaCheckCircle /> Paid
                  </span>
                  <p className="text-gray-500 mt-2">Via PayHere</p>
                </div>
              </div>

              {/* Booking Details */}
              <div className="mb-8 pb-8 border-b border-gray-300">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
                  Booking Details
                </h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-gray-100 border border-gray-300/50 p-4 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                      <FaCar /> Car
                    </div>
                    <p className="font-bold text-gray-900 text-lg">
                      {invoiceData.carName || "N/A"}
                    </p>
                  </div>
                  <div className="bg-gray-100 border border-gray-300/50 p-4 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                      <FaCalendarAlt /> Pickup Date
                    </div>
                    <p className="font-bold text-gray-900 text-lg">
                      {invoiceData.pickupDate || "N/A"}
                    </p>
                  </div>
                  <div className="bg-gray-100 border border-gray-300/50 p-4 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                      <FaCalendarAlt /> Return Date
                    </div>
                    <p className="font-bold text-gray-900 text-lg">
                      {invoiceData.returnDate || "N/A"}
                    </p>
                  </div>
                  <div className="bg-gray-100 border border-gray-300/50 p-4 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                      <FaMapMarkerAlt /> Location
                    </div>
                    <p className="font-bold text-gray-900 text-lg">
                      {invoiceData.pickupLocation || "N/A"}
                    </p>
                  </div>
                  <div className="bg-gray-100 border border-gray-300/50 p-4 rounded-xl">
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                      <FaUserTie /> Driver
                    </div>
                    <p className="font-bold text-gray-900 text-lg">
                      {invoiceData.needDriver ? "Yes" : "No"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Price Breakdown Table */}
              <div className="mb-8">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
                  Price Breakdown
                </h3>
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-300">
                      <th className="text-left py-3 text-gray-500 font-semibold">Description</th>
                      <th className="text-center py-3 text-gray-500 font-semibold">Days</th>
                      <th className="text-center py-3 text-gray-500 font-semibold">Rate</th>
                      <th className="text-right py-3 text-gray-500 font-semibold">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-300">
                      <td className="py-4 text-gray-900 font-medium">
                        {invoiceData.carName || "Car Rental"}
                      </td>
                      <td className="py-4 text-center text-gray-500">
                        {invoiceData.totalDays || 0}
                      </td>
                      <td className="py-4 text-center text-gray-500">
                        LKR {(invoiceData.pricePerDay || 0).toLocaleString()}
                      </td>
                      <td className="py-4 text-right text-gray-900 font-semibold">
                        LKR {carTotal.toLocaleString()}
                      </td>
                    </tr>
                    {invoiceData.needDriver && (
                      <tr className="border-b border-gray-300">
                        <td className="py-4 text-gray-900 font-medium">
                          Driver Service
                        </td>
                        <td className="py-4 text-center text-gray-500">
                          {invoiceData.totalDays || 0}
                        </td>
                        <td className="py-4 text-center text-gray-500">
                          LKR {(invoiceData.driverCharge || 1750).toLocaleString()}
                        </td>
                        <td className="py-4 text-right text-gray-900 font-semibold">
                          LKR {driverTotal.toLocaleString()}
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-300">
                      <td
                        colSpan="3"
                        className="py-5 text-right text-xl font-bold text-gray-900"
                      >
                        Total Amount:
                      </td>
                      <td className="py-5 text-right text-2xl font-bold text-indigo-600">
                        LKR {(invoiceData.totalAmount || 0).toLocaleString()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Footer Note */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6 text-center">
                <p className="text-indigo-600 font-medium">
                  Thank you for choosing CarRental! We wish you a safe and pleasant journey.
                </p>
                <p className="text-indigo-500 text-sm mt-2">
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
          body { background: white !important; }
        }
      `}</style>

      {/* FOOTER - hidden on print */}
      <footer className="bg-gray-900 border-t border-gray-200 text-white py-14 px-10 print:hidden">
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

export default Invoice;
