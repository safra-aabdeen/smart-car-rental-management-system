import AdminSidebar from "../components/AdminSidebar";
import React, { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, deleteDoc, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase/firebase";
import { signOut } from "firebase/auth";
import { useNavigate, useLocation } from "react-router-dom";
import { sendBookingEmail } from "../services/email";
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
        const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
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
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Manage Bookings</h1>
            <p className="text-gray-500 mt-2">Approve, cancel, or delete customer bookings</p>
          </div>
        </div>

        <div className="bg-white shadow-lg border border-gray-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-500 border-b border-gray-300">
                  <th className="p-4 font-semibold">Customer</th>
                  <th className="p-4 font-semibold">Car</th>
                  <th className="p-4 font-semibold">Dates</th>
                  <th className="p-4 font-semibold">Location</th>
                  <th className="p-4 font-semibold">Driver</th>
                  <th className="p-4 font-semibold">Price</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
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
                    <tr key={booking.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                      <td className="p-4">
                        <p className="font-semibold text-gray-900">{booking.userName || "N/A"}</p>
                        <p className="text-sm text-gray-400">{booking.userEmail}</p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {booking.carImage ? (
                            <img src={booking.carImage} alt={booking.carName} className="w-12 h-12 object-cover rounded-lg shadow-sm shrink-0" />
                          ) : (
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 shrink-0">
                              <FaCar />
                            </div>
                          )}
                          <span className="font-medium text-gray-600 leading-tight">{booking.carName}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-500">
                        {booking.pickupDate} <br/> to <br/> {booking.returnDate}
                      </td>
                      <td className="p-4 text-sm text-gray-500">{booking.location}</td>

                      <td className="p-4">
                        {booking.needDriver ? (
                          booking.driverAssigned ? (
                            <div className="flex flex-col">
                              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold mb-1 w-fit">Assigned: {booking.driverName}</span>
                              <span className="text-xs text-gray-400">{booking.driverPhone}</span>
                            </div>
                          ) : (
                            <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-semibold">Requested</span>
                          )
                        ) : (
                          <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">Not Required</span>
                        )}
                      </td>

                      <td className="p-4 font-bold text-green-600">LKR {parseFloat(booking.totalPrice || booking.totalAmount || 0).toLocaleString()}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          booking.status === "pending" ? "bg-amber-100 text-amber-700" :
                          booking.status === "confirmed" ? "bg-green-100 text-green-700" :
                          booking.status === "cancelled" ? "bg-red-100 text-red-700" :
                          booking.status === "completed" ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-700"
                        }`}>
                          {booking.status?.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center gap-3">

                          {booking.needDriver && !booking.driverAssigned && (
                            <button onClick={() => openDriverModal(booking)} className="text-xl text-blue-500 transition hover:scale-110" title="Assign Driver">
                              <FaIdBadge />
                            </button>
                          )}
                          <button onClick={() => handleApprove(booking)} className={`text-xl transition hover:scale-110 ${

                            booking.status === "pending" ? "text-yellow-500" :
                            booking.status === "confirmed" ? "text-green-500" :
                            booking.status === "completed" ? "text-blue-500" : "text-gray-300"
                          }`} title="Approve/Complete">
                            <FaCheckCircle />
                          </button>
                          <button onClick={() => handleCancel(booking)} className="text-xl text-red-500 transition hover:scale-110" title="Cancel Booking">
                            <FaTimesCircle />
                          </button>
                          <button onClick={() => handleDelete(booking.id)} className="text-xl text-gray-400 hover:text-red-700 transition hover:scale-110" title="Delete Booking">
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

        {showDriverModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white border border-gray-300 p-6 rounded-2xl w-[400px]">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Assign Driver</h2>
              <p className="text-gray-500 mb-4">Select an available driver for this booking.</p>
              
              <select
                className="w-full bg-white border border-gray-300 p-2 rounded-xl text-gray-900 mb-4"
                value={selectedDriverId}
                onChange={(e) => setSelectedDriverId(e.target.value)}
              >
                <option value="">-- Select Driver --</option>
                {availableDrivers.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.phone})</option>
                ))}
              </select>

              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowDriverModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignDriver}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
                >
                  Assign
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