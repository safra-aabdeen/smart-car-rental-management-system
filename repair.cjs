const fs = require('fs');
let code = fs.readFileSync('src/pages/AdminBooking.jsx', 'utf8');

const topPart = code.split('let newStatus = booking.status;')[0];
const bottomPartSplit = code.split('    {\n      name: "Bookings",');
const bottomPart = '    {\n      name: "Bookings",' + bottomPartSplit[1];

const middlePart = `let newStatus = booking.status;

  if (booking.status === "pending") {
    newStatus = "confirmed";
  } else if (booking.status === "confirmed") {
    newStatus = "completed";
  }

  await updateDoc(doc(db, "bookings", booking.id), {
    status: newStatus,
    statusMode: "manual"
  });

  if (newStatus === "confirmed") {
    await sendBookingEmail({
      name: booking.userName,
      to_name: booking.userName,
      email: booking.userEmail,
      to_email: booking.userEmail,
      user_email: booking.userEmail,
      userEmail: booking.userEmail,
      toEmail: booking.userEmail,
      recipient_email: booking.userEmail,
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
      
      const refundAmount = parseFloat(booking.totalPrice || booking.totalAmount || 0);
      if (booking.userId) {
        // Need getDoc but we'll import it at the top later, actually just add it if missing.
        const { getDoc } = await import('firebase/firestore');
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
        user_email: booking.userEmail,
        userEmail: booking.userEmail,
        toEmail: booking.userEmail,
        recipient_email: booking.userEmail,
        subject: "Booking Cancelled",
        status: "Cancelled",
        car_name: booking.carName,
        booking_id: booking.id,
        pickup_date: booking.pickupDate,
        return_date: booking.returnDate,
        message: "Your booking has been cancelled by the administrator."
      });
      fetchBookings();
      alert("Booking cancelled locally (Backend unavailable).");
    } catch (fallbackError) {
      console.error("Local cancellation failed:", fallbackError);
      alert("Failed to cancel booking. Please check logs.");
    }
  };

  if (booking.paymentStatus === 'Paid' || booking.status === 'confirmed') {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
      alert("Processing refund via backend... Please wait.");
      const response = await fetch(\`\${backendUrl}/api/refund\`, {
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

const handleLogout = async () => {
  await signOut(auth);
  navigate("/");
};

const menuItems = [
    {
      name: "Dashboard",
      icon: <FaTachometerAlt />,
      path: "/admin/dashboard"
    },
    {
      name: "Manage Cars",
      icon: <FaCar />,
      path: "/admin/cars"
    },
`;

const newCode = topPart + middlePart + bottomPart;
fs.writeFileSync('src/pages/AdminBooking.jsx', newCode);
console.log('Successfully repaired AdminBooking.jsx');
