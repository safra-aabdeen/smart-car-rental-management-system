import AdminSidebar from "../components/AdminSidebar";
import React, { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, deleteDoc, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase/firebase";
import { signOut } from "firebase/auth";
import { useNavigate, useLocation } from "react-router-dom";
import { sendBookingEmail } from "../services/email";
import getBackendUrl from "../utils/backendUrl";
import getCarImage from "../utils/carImage";
import {
  FaCheckCircle, FaTrashAlt, FaTimesCircle, FaCar, FaCalendarAlt,
  FaUsers, FaChartBar, FaTachometerAlt, FaSignOutAlt, FaMoneyCheckAlt, FaIdBadge
} from "react-icons/fa";

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [selectedBookingForDriver, setSelectedBookingForDriver] = useState(null);
  const [selectedDriverId, setSelectedDriverId] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "bookings"));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort bookings by date descending
      data.sort((a, b) => new Date(b.createdAt?.toDate ? b.createdAt.toDate() : 0) - new Date(a.createdAt?.toDate ? a.createdAt.toDate() : 0));
      setBookings(data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleApprove = async (booking) => {
    let newStatus = booking.status;
    if (booking.status === "pending") newStatus = "confirmed";
    else if (booking.status === "confirmed") newStatus = "completed";
    else return;

    try {
      await updateDoc(doc(db, "bookings", booking.id), {
        status: newStatus,
        statusMode: "manual"
      });


      if (newStatus === "completed" && booking.driverId) {
        try {
          await updateDoc(doc(db, "drivers", booking.driverId), { status: "Available" });
        } catch (err) { console.error(err); }
      }
      if (newStatus === "confirmed") {

        await sendBookingEmail({
          name: booking.userName,
          to_name: booking.userName,
          email: booking.userEmail,
          to_email: booking.userEmail,
          subject: "Booking Confirmed",
          status: "Confirmed",
          car_name: booking.carName,
          booking_id: booking.id,
          pickup_date: booking.pickupDate,
          return_date: booking.returnDate,
          message: "Your booking has been confirmed successfully."
        });
      }
      fetchBookings();
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status.");
    }
  };

  const handleCancel = async (booking) => {
    if (booking.status === "completed") {
      alert("Completed bookings cannot be cancelled.");
      return;
    }
    if (booking.status === "cancelled") {
      alert("Booking is already cancelled.");
      return;
    }
    if (!window.confirm("Cancel this booking?")) return;

    const cancelLocally = async () => {
      try {
        await updateDoc(doc(db, "bookings", booking.id), {
          status: "cancelled",
          statusMode: "manual",
          paymentStatus: "Refunded to Wallet"
        });
        

        if (booking.driverId) {
          try {
            await updateDoc(doc(db, "drivers", booking.driverId), { status: "Available" });
          } catch (err) { console.error(err); }
        }
        const refundAmount = parseFloat(booking.totalPrice || booking.totalAmount || 0);

        if (booking.userId) {
          const userRef = doc(db, "users", booking.userId);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
             const userData = userSnap.data();
             const newBalance = (userData.walletBalance || 0) + refundAmount;
             await updateDoc(userRef, { walletBalance: newBalance });
          }
        }
        
        await sendBookingEmail({
          name: booking.userName,
          to_name: booking.userName,
          email: booking.userEmail,
          to_email: booking.userEmail,
          subject: "Booking Cancelled",
          status: "Cancelled",
          car_name: booking.carName,
          booking_id: booking.id,
          pickup_date: booking.pickupDate,
          return_date: booking.returnDate,
          message: "Your booking has been cancelled by the administrator."
        });

        fetchBookings();
        alert("Booking cancelled locally.");
      } catch (fallbackError) {
        console.error("Local cancellation failed:", fallbackError);
        alert("Failed to cancel booking.");
      }
    };

    if (booking.paymentStatus === 'Paid' || booking.status === 'confirmed') {
      try {
        const backendUrl = getBackendUrl();
        alert("Processing refund via backend... Please wait.");
        
        const response = await fetch(`${backendUrl}/api/refund`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId: booking.id })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to process refund");

        alert("Booking cancelled and refunded successfully!");
        fetchBookings();
      } catch (error) {
        console.warn("Backend refund failed, falling back to local manual cancellation:", error);
        await cancelLocally();
      }
    } else {
      await cancelLocally();
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete Booking?")) {
      await deleteDoc(doc(db, "bookings", id));
      fetchBookings();
    }
  };


  const fetchAvailableDrivers = async () => {
    try {
      const snap = await getDocs(collection(db, "drivers"));
      const drvs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setAvailableDrivers(drvs.filter(d => d.status === "Available"));
    } catch (err) {
      console.error(err);
    }
  };

  const openDriverModal = (booking) => {
    setSelectedBookingForDriver(booking);
    fetchAvailableDrivers();
    setShowDriverModal(true);
  };

  const handleAssignDriver = async () => {
    if (!selectedDriverId) return alert("Please select a driver");
    
    const driverToAssign = availableDrivers.find(d => d.id === selectedDriverId);
    if (!driverToAssign) return;

    try {
      await updateDoc(doc(db, "bookings", selectedBookingForDriver.id), {
        driverAssigned: true,
        driverId: driverToAssign.id,
        driverName: driverToAssign.name,
        driverPhone: driverToAssign.phone,
        driverStatus: "assigned"
      });

      await updateDoc(doc(db, "drivers", driverToAssign.id), {
        status: "Unavailable"
      });

      await sendBookingEmail({
        to_name: driverToAssign.name,
        to_email: driverToAssign.email,
        email: driverToAssign.email,

        subject: "New Trip Assignment",
        status: "Assigned",

        car_name: selectedBookingForDriver.carName,
        booking_id: selectedBookingForDriver.id,

        pickup_date: selectedBookingForDriver.pickupDate,
        return_date: selectedBookingForDriver.returnDate,

        message: `
        You have been assigned for a new trip.

        Customer Name: ${selectedBookingForDriver.userName}
        Pickup Location: ${selectedBookingForDriver.location}

        Please contact the customer or administrator for further details.
        `
      });

      alert("Driver assigned successfully!");
      setShowDriverModal(false);
      setSelectedBookingForDriver(null);
      setSelectedDriverId("");
      fetchBookings();
    } catch (error) {
      console.error(error);
      alert("Failed to assign driver.");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const menuItems = [
    { name: "Dashboard", icon: <FaTachometerAlt />, path: "/admin/dashboard" },
    { name: "Manage Cars", icon: <FaCar />, path: "/admin/cars" },
    { name: "Bookings", icon: <FaCalendarAlt />, path: "/admin/bookings" },
    { name: "Users", icon: <FaUsers />, path: "/admin/users" },
    { name: "Refunds", icon: <FaMoneyCheckAlt />, path: "/admin/refunds" },
    { name: "Reports", icon: <FaChartBar />, path: "/admin/reports" }
  ];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Sidebar */}
      <AdminSidebar />

      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Manage Bookings</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Approve, cancel, or delete customer bookings</p>
          </div>
          <div className="text-xs sm:text-sm text-gray-500 bg-white border border-gray-200 px-3 py-1.5 rounded-lg w-fit shadow-xs">
            Total: <span className="font-bold text-gray-900">{bookings.length}</span>
          </div>
        </div>

        <div className="bg-white shadow-sm border border-gray-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead>
                <tr className="bg-gray-50 text-gray-500 border-b border-gray-200 text-xs font-semibold uppercase tracking-wider">
                  <th className="px-4 py-3.5">Customer</th>
                  <th className="px-4 py-3.5">Car</th>
                  <th className="px-4 py-3.5">Dates</th>
                  <th className="px-4 py-3.5">Location</th>
                  <th className="px-4 py-3.5">Driver</th>
                  <th className="px-4 py-3.5">Price</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="p-8 text-center text-gray-400">Loading bookings...</td>
                  </tr>
                ) : bookings.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-8 text-center text-gray-400">No bookings found.</td>
                  </tr>
                ) : (
                  bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50/80 transition">
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-gray-900 text-sm truncate max-w-[150px]">{booking.userName || "N/A"}</p>
                        <p className="text-xs text-gray-400 truncate max-w-[150px]">{booking.userEmail}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          {booking.carImage || booking.carName ? (
                            <img
                              src={getCarImage(booking.carImage || booking.carName)}
                              alt={booking.carName}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/images/Home-image.jpg";
                              }}
                              className="w-10 h-10 object-cover rounded-lg shadow-xs shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 shrink-0">
                              <FaCar />
                            </div>
                          )}
                          <span className="font-medium text-gray-800 text-sm whitespace-nowrap">{booking.carName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-gray-600 whitespace-nowrap">
                        <span className="font-medium">{booking.pickupDate}</span>
                        <span className="text-gray-400 mx-1">→</span>
                        <span>{booking.returnDate}</span>
                      </td>
                      <td className="px-4 py-3.5 text-xs sm:text-sm text-gray-600 whitespace-nowrap">{booking.location}</td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {booking.needDriver ? (
                          booking.driverAssigned ? (
                            <div className="flex flex-col">
                              <span className="bg-blue-50 border border-blue-200 text-blue-700 px-2.5 py-0.5 rounded-full text-xs font-semibold mb-0.5 w-fit">
                                {booking.driverName}
                              </span>
                              <span className="text-xs text-gray-400">{booking.driverPhone}</span>
                            </div>
                          ) : (
                            <span className="bg-amber-50 border border-amber-200 text-amber-700 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                              Requested
                            </span>
                          )
                        ) : (
                          <span className="bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full text-xs font-medium">
                            Not Required
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 font-bold text-emerald-600 whitespace-nowrap text-sm">
                        LKR {parseFloat(booking.totalPrice || booking.totalAmount || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          booking.status === "pending" ? "bg-amber-100 text-amber-700" :
                          booking.status === "confirmed" ? "bg-emerald-100 text-emerald-700" :
                          booking.status === "cancelled" ? "bg-red-100 text-red-700" :
                          booking.status === "completed" ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-700"
                        }`}>
                          {booking.status?.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2.5 text-base sm:text-lg">
                          {booking.needDriver && !booking.driverAssigned && (
                            <button
                              onClick={() => openDriverModal(booking)}
                              className="text-blue-600 hover:text-blue-800 p-1.5 hover:bg-blue-50 rounded-lg transition"
                              title="Assign Driver"
                            >
                              <FaIdBadge />
                            </button>
                          )}
                          <button
                            onClick={() => handleApprove(booking)}
                            className={`p-1.5 rounded-lg transition ${
                              booking.status === "pending" ? "text-amber-500 hover:bg-amber-50" :
                              booking.status === "confirmed" ? "text-emerald-600 hover:bg-emerald-50" :
                              booking.status === "completed" ? "text-blue-600 hover:bg-blue-50" : "text-gray-300"
                            }`}
                            title="Approve / Complete"
                          >
                            <FaCheckCircle />
                          </button>
                          <button
                            onClick={() => handleCancel(booking)}
                            className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg transition"
                            title="Cancel Booking"
                          >
                            <FaTimesCircle />
                          </button>
                          <button
                            onClick={() => handleDelete(booking.id)}
                            className="text-gray-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition"
                            title="Delete Booking"
                          >
                            <FaTrashAlt />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ASSIGN DRIVER MODAL */}
        {showDriverModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-white border border-gray-200 p-5 sm:p-6 rounded-2xl w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Assign Driver</h2>
              <p className="text-xs sm:text-sm text-gray-500 mb-4">Select an available driver for this booking.</p>
              
              <select
                className="w-full bg-white border border-gray-300 p-3 rounded-xl text-sm text-gray-900 mb-5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={selectedDriverId}
                onChange={(e) => setSelectedDriverId(e.target.value)}
              >
                <option value="">-- Select Driver --</option>
                {availableDrivers.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.phone})</option>
                ))}
              </select>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDriverModal(false)}
                  className="px-4 py-2 text-sm font-semibold bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignDriver}
                  className="px-5 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition"
                >
                  Assign Driver
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default AdminBookings;