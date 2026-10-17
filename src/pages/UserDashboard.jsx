import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { db, auth } from "../firebase/firebase";
import getBackendUrl from "../utils/backendUrl";
import getCarImage from "../utils/carImage";
import {
  FaCar,
  FaHome,
  FaPhone,
  FaInfoCircle,
  FaSignOutAlt,
  FaUser,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaClipboardList,
  FaFileInvoice,
  FaCarSide,
  FaEnvelope,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaChartLine,
  FaMapMarkerAlt,
  FaStar,
  FaRegStar,
  FaStarHalfAlt,
  FaPen,
  FaCommentDots,
  FaWallet,
} from "react-icons/fa";

const UserDashboard = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userCreated, setUserCreated] = useState("");
  const [walletBalance, setWalletBalance] = useState(0);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("bookings");
  const [reviews, setReviews] = useState([]);
  const [reviewedBookingIds, setReviewedBookingIds] = useState(new Set());
  const [reviewFormOpen, setReviewFormOpen] = useState(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  /* ================= AUTH ================= */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setUserEmail(currentUser.email);
        setUserCreated(
          currentUser.metadata?.creationTime
            ? new Date(currentUser.metadata.creationTime).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : "N/A"
        );

        try {
          const userSnap = await getDoc(doc(db, "users", currentUser.uid));
          if (userSnap.exists()) {
            const data = userSnap.data();
            setUserName(data.name || data.userName || currentUser.email);
            setWalletBalance(data.walletBalance || 0);
          } else {
            setUserName(currentUser.email);
            setWalletBalance(0);
          }
        } catch {
          setUserName(currentUser.email);
        }

        // Fetch bookings
        try {
          const bookingsQuery = query(
            collection(db, "bookings"),
            where("userId", "==", currentUser.uid)
          );
          const bookingsSnap = await getDocs(bookingsQuery);
          const bookingsData = [];
          bookingsSnap.forEach((doc) => {
            bookingsData.push({ id: doc.id, ...doc.data() });
          });
          // Sort by createdAt descending
          bookingsData.sort((a, b) => {
            const aTime = a.createdAt?.toDate?.() || new Date(0);
            const bTime = b.createdAt?.toDate?.() || new Date(0);
            return bTime - aTime;
          });
          setBookings(bookingsData);
        } catch (error) {
          console.error("Error fetching bookings:", error);
        }

        // Fetch payments
        try {
          const paymentsQuery = query(
            collection(db, "payments"),
            where("userId", "==", currentUser.uid)
          );
          const paymentsSnap = await getDocs(paymentsQuery);
          const paymentsData = [];
          paymentsSnap.forEach((doc) => {
            paymentsData.push({ id: doc.id, ...doc.data() });
          });
          paymentsData.sort((a, b) => {
            const aTime = a.createdAt?.toDate?.() || new Date(0);
            const bTime = b.createdAt?.toDate?.() || new Date(0);
            return bTime - aTime;
          });
          setPayments(paymentsData);
        } catch (error) {
          console.error("Error fetching payments:", error);
        }

        // Fetch reviews
        try {
          const reviewsQuery = query(
            collection(db, "reviews"),
            where("userId", "==", currentUser.uid)
          );
          const reviewsSnap = await getDocs(reviewsQuery);
          const reviewsData = [];
          const reviewedIds = new Set();
          reviewsSnap.forEach((doc) => {
            const data = { id: doc.id, ...doc.data() };
            reviewsData.push(data);
            if (data.bookingId) reviewedIds.add(data.bookingId);
          });
          reviewsData.sort((a, b) => {
            const aTime = a.createdAt?.toDate?.() || new Date(0);
            const bTime = b.createdAt?.toDate?.() || new Date(0);
            return bTime - aTime;
          });
          setReviews(reviewsData);
          setReviewedBookingIds(reviewedIds);
        } catch (error) {
          console.error("Error fetching reviews:", error);
        }

        setLoading(false);
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

  /* ================= SUBMIT REVIEW ================= */
  const handleSubmitReview = async (booking) => {
    if (reviewRating === 0) {
      alert("Please select a star rating.");
      return;
    }
    if (!reviewText.trim()) {
      alert("Please write a review.");
      return;
    }
    setSubmittingReview(true);
    try {
      await addDoc(collection(db, "reviews"), {
        userId: user.uid,
        userName: userName,
        carId: booking.carId,
        carName: booking.carName || "Car",
        carImage: booking.carImage || "",
        bookingId: booking.id,
        rating: reviewRating,
        reviewText: reviewText.trim(),
        createdAt: serverTimestamp(),
      });
      // Update local state
      setReviewedBookingIds((prev) => new Set([...prev, booking.id]));
      setReviews((prev) => [
        {
          id: Date.now().toString(),
          userId: user.uid,
          userName,
          carId: booking.carId,
          carName: booking.carName || "Car",
          carImage: booking.carImage || "",
          bookingId: booking.id,
          rating: reviewRating,
          reviewText: reviewText.trim(),
          createdAt: { toDate: () => new Date() },
        },
        ...prev,
      ]);
      setReviewFormOpen(null);
      setReviewRating(0);
      setReviewHover(0);
      setReviewText("");
      alert("Review submitted successfully!");
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review. Please try again.");
    }
    setSubmittingReview(false);
  };

  /* ================= CANCEL BOOKING ================= */
  const handleCancelBooking = async (booking) => {
    const confirmCancel = window.confirm(
      `Are you sure you want to cancel this booking? The amount of LKR ${(
        booking.totalPrice ||
        booking.totalAmount ||
        0
      ).toLocaleString()} will be refunded to your original payment method or wallet.`
    );
    
    if (!confirmCancel) return;

    try {
      // Use the backend refund API
      const backendUrl = getBackendUrl();
      
      alert("Processing refund... Please wait.");
      
      const response = await fetch(`${backendUrl}/api/refund`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ bookingId: booking.id })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process refund");
      }

      alert("Booking cancelled successfully! " + (data.message || "Refund processed."));

      // Update local state to reflect cancellation
      setBookings((prev) =>
        prev.map((b) =>
          b.id === booking.id
            ? { ...b, status: "cancelled", paymentStatus: "Refunded" }
            : b
        )
      );
      
      // If the refund went to wallet, we should update local wallet balance. 
      // But we can just reload the page or fetch user data again to get the true balance.
      window.location.reload();

    } catch (error) {
      console.warn("Backend refund failed, falling back to local wallet refund:", error);
      
      try {
        const refundAmount = parseFloat(booking.totalPrice || booking.totalAmount || 0);

        // 1. Update Booking status
        const bookingRef = doc(db, "bookings", booking.id);
        await updateDoc(bookingRef, {
          status: "cancelled",
          paymentStatus: "Refunded to Wallet",
        });

        // 2. Update User Wallet
        const userRef = doc(db, "users", user.uid);
        const newBalance = walletBalance + refundAmount;
        await setDoc(userRef, {
          walletBalance: newBalance,
        }, { merge: true });

        // 3. (Optional) Add a wallet transaction record
        await addDoc(collection(db, "walletTransactions"), {
          userId: user.uid,
          type: "refund",
          amount: refundAmount,
          bookingId: booking.id,
          carName: booking.carName,
          createdAt: serverTimestamp(),
        });

        // Update local state
        setWalletBalance(newBalance);
        setBookings((prev) =>
          prev.map((b) =>
            b.id === booking.id
              ? { ...b, status: "cancelled", paymentStatus: "Refunded to Wallet" }
              : b
          )
        );

        alert("Booking cancelled successfully. Amount refunded to your wallet.");
      } catch (fallbackError) {
        console.error("Error cancelling booking locally:", fallbackError);
        alert("Failed to cancel booking. Please try again.");
      }
    }
  };

  /* ================= RENDER STARS ================= */
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<FaStar key={i} className="text-yellow-400" />);
      } else if (i - 0.5 <= rating) {
        stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-yellow-400" />);
      }
    }
    return <div className="flex gap-0.5">{stars}</div>;
  };

  /* ================= STATS ================= */
  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter(
    (b) => b.status === "confirmed" || b.paymentStatus === "Paid"
  ).length;
  const pendingBookings = bookings.filter(
    (b) => b.status === "pending" && b.paymentStatus !== "Paid"
  ).length;
  const totalSpent = payments.reduce(
    (sum, p) => sum + (parseFloat(p.totalAmount) || 0),
    0
  );

  const getStatusBadge = (booking) => {
    if (booking.status === "confirmed" || booking.paymentStatus === "Paid") {
      return (
        <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-sm font-semibold">
          <FaCheckCircle className="text-xs" /> Confirmed
        </span>
      );
    }
    if (booking.status === "cancelled") {
      return (
        <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-700 px-3 py-1.5 rounded-full text-sm font-semibold">
          <FaTimesCircle className="text-xs" /> Cancelled
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-400 px-3 py-1.5 rounded-full text-sm font-semibold">
        <FaHourglassHalf className="text-xs" /> Pending
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div
            className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"
            style={{ animation: "spin 1s linear infinite" }}
          ></div>
          <p className="text-gray-500 text-lg">Loading dashboard...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

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

      {/* CONTENT */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">My Dashboard</h1>

        {/* PROFILE CARD */}
        <div className="bg-white shadow-lg border border-gray-200 rounded-2xl shadow-sm p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              {userName ? userName.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{userName}</h2>
              <div className="flex flex-wrap gap-4 mt-2 text-gray-500">
                <span className="flex items-center gap-2">
                  <FaEnvelope className="text-indigo-600" /> {userEmail}
                </span>
                <span className="flex items-center gap-2">
                  <FaClock className="text-indigo-600" /> Member since {userCreated}
                </span>
                <span className="flex items-center gap-2 text-indigo-600 font-semibold bg-indigo-50 px-3 py-1 rounded-lg">
                  <FaWallet className="text-indigo-600" /> Wallet Balance: LKR {walletBalance.toLocaleString()}
                </span>
              </div>
            </div>
            <Link
              to="/cars"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition"
            >
              <FaCarSide /> Book a Car
            </Link>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white shadow-lg border border-gray-200 rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <FaClipboardList className="text-blue-400" />
              </div>
              <span className="text-gray-500 text-sm font-medium">Total Bookings</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{totalBookings}</p>
          </div>
          <div className="bg-white shadow-lg border border-gray-200 rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                <FaCheckCircle className="text-indigo-600" />
              </div>
              <span className="text-gray-500 text-sm font-medium">Confirmed</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{confirmedBookings}</p>
          </div>
          <div className="bg-white shadow-lg border border-gray-200 rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <FaHourglassHalf className="text-amber-400" />
              </div>
              <span className="text-gray-500 text-sm font-medium">Pending</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{pendingBookings}</p>
          </div>
          <div className="bg-white shadow-lg border border-gray-200 rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                <FaMoneyBillWave className="text-purple-600" />
              </div>
              <span className="text-gray-500 text-sm font-medium">Total Spent</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              LKR {totalSpent.toLocaleString()}
            </p>
          </div>
        </div>

        {/* TABS */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("bookings")}
            className={`px-6 py-3 rounded-xl font-semibold transition ${
              activeTab === "bookings"
                ? "bg-indigo-600 text-white shadow-md"
                : "bg-white shadow-lg text-gray-500 hover:bg-gray-800 border border-gray-200"
            }`}
          >
            <FaClipboardList className="inline mr-2" />
            My Bookings
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`px-6 py-3 rounded-xl font-semibold transition ${
              activeTab === "payments"
                ? "bg-indigo-600 text-white shadow-md"
                : "bg-white shadow-lg text-gray-500 hover:bg-gray-800 border border-gray-200"
            }`}
          >
            <FaMoneyBillWave className="inline mr-2" />
            Payment History
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`px-6 py-3 rounded-xl font-semibold transition ${
              activeTab === "reviews"
                ? "bg-indigo-600 text-white shadow-md"
                : "bg-white shadow-lg text-gray-500 hover:bg-gray-800 border border-gray-200"
            }`}
          >
            <FaStar className="inline mr-2" />
            My Reviews
          </button>
        </div>

        {/* BOOKINGS TAB */}
        {activeTab === "bookings" && (
          <div className="space-y-4">
            {bookings.length === 0 ? (
              <div className="bg-white shadow-lg border border-gray-200 rounded-2xl shadow-sm p-12 text-center">
                <FaCarSide className="text-6xl text-gray-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No bookings yet</h3>
                <p className="text-gray-500 mb-6">Start by booking your first car!</p>
                <Link
                  to="/cars"
                  className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition"
                >
                  Browse Cars
                </Link>
              </div>
            ) : (
              bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white shadow-lg border border-gray-200 rounded-2xl shadow-sm p-6 hover:shadow-lg hover:shadow-emerald-500/5 transition"
                >
                  {/* Top row: Image + Info + Price */}
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
                    {/* Car Image */}
                    <div className="w-full md:w-36 h-24 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0">
                      {booking.carImage || booking.carName ? (
                        <img
                          src={getCarImage(booking.carImage || booking.carName)}
                          alt={booking.carName}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/images/Home-image.jpg";
                          }}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <FaCar className="text-3xl" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          {booking.carName || "Car"}
                        </h3>
                        {getStatusBadge(booking)}
                      </div>
                      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <FaCalendarAlt className="text-indigo-600" />
                          {booking.pickupDate} → {booking.returnDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaMapMarkerAlt className="text-indigo-600" />
                          {booking.location || booking.pickupLocation || "N/A"}
                        </span>
                        {booking.needDriver && (
                          <span className="flex items-center gap-1">
                            <FaUser className="text-indigo-600" /> 
                            {booking.driverAssigned 
                              ? `Driver: ${booking.driverName} (${booking.driverPhone})` 
                              : 'Driver Requested (Pending)'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Price & Actions */}
                    <div className="flex flex-col items-end gap-2">
                      <p className="text-2xl font-bold text-indigo-600">
                        LKR{" "}
                        {(
                          booking.totalPrice ||
                          booking.totalAmount ||
                          0
                        ).toLocaleString()}
                      </p>
                      {(booking.status === "confirmed" || booking.paymentStatus === "Paid") &&
                        booking.orderId && (
                          <button
                            onClick={() =>
                              navigate("/invoice", {
                                state: {
                                  orderId: booking.orderId,
                                  carName: booking.carName,
                                  carImage: booking.carImage,
                                  pickupDate: booking.pickupDate,
                                  returnDate: booking.returnDate,
                                  pickupLocation:
                                    booking.location || booking.pickupLocation,
                                  totalDays: booking.days || booking.totalDays,
                                  pricePerDay:
                                    booking.pricePerDay || booking.pricePerDay,
                                  totalAmount:
                                    booking.totalPrice || booking.totalAmount,
                                  needDriver: booking.needDriver,
                                  driverCharge:
                                    booking.driverChargePerDay || 1750,
                                  customerName: userName,
                                  customerEmail: userEmail,
                                },
                              })
                            }
                            className="bg-gray-200 hover:bg-emerald-500/10 text-indigo-600 border border-gray-300 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition"
                          >
                            <FaFileInvoice /> View Invoice
                          </button>
                        )}
                      
                      {/* Cancel Button */}
                      {(booking.status === "confirmed" || booking.paymentStatus === "Paid") && 
                       (new Date(booking.pickupDate) >= new Date(new Date().setHours(0,0,0,0))) && (
                        <button
                          onClick={() => handleCancelBooking(booking)}
                          className="bg-red-500/10 hover:bg-red-100 text-red-700 border border-red-500/20 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition mt-1"
                        >
                          <FaTimesCircle /> Cancel Booking
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Review Button / Form — sits below the row */}
                  {(booking.status === "confirmed" || booking.paymentStatus === "Paid" || booking.status === "completed") && (
                    <div className="mt-4 border-t border-gray-200 pt-4">
                      {reviewedBookingIds.has(booking.id) ? (
                        <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg text-sm font-semibold">
                          <FaCheckCircle className="text-xs" /> Already Reviewed
                        </span>
                      ) : reviewFormOpen === booking.id ? (
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                          <h4 className="font-bold text-gray-900 mb-3">Rate your experience</h4>
                          {/* Star selector */}
                          <div className="flex gap-1 mb-4">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setReviewRating(star)}
                                onMouseEnter={() => setReviewHover(star)}
                                onMouseLeave={() => setReviewHover(0)}
                                className="text-3xl transition-transform hover:scale-110"
                              >
                                {star <= (reviewHover || reviewRating) ? (
                                  <FaStar className="text-yellow-400" />
                                ) : (
                                  <FaRegStar className="text-gray-400" />
                                )}
                              </button>
                            ))}
                            {reviewRating > 0 && (
                              <span className="ml-2 text-sm text-gray-500 self-center font-medium">
                                {reviewRating}/5
                              </span>
                            )}
                          </div>
                          {/* Review text */}
                          <textarea
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            placeholder="Share your experience with this car..."
                            rows={3}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white shadow-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                          />
                          <div className="flex gap-3 mt-3">
                            <button
                              onClick={() => handleSubmitReview(booking)}
                              disabled={submittingReview}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                              {submittingReview ? "Submitting..." : "Submit Review"}
                            </button>
                            <button
                              onClick={() => {
                                setReviewFormOpen(null);
                                setReviewRating(0);
                                setReviewHover(0);
                                setReviewText("");
                              }}
                              className="bg-gray-200 hover:bg-slate-700 text-gray-600 border border-gray-300 px-6 py-2.5 rounded-lg font-semibold transition"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setReviewFormOpen(booking.id);
                            setReviewRating(0);
                            setReviewHover(0);
                            setReviewText("");
                          }}
                          className="inline-flex items-center gap-2 bg-amber-50 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 px-4 py-2.5 rounded-lg text-sm font-semibold transition"
                        >
                          <FaPen className="text-xs" /> Write a Review
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* PAYMENTS TAB */}
        {activeTab === "payments" && (
          <div className="bg-white shadow-lg border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            {payments.length === 0 ? (
              <div className="p-12 text-center">
                <FaMoneyBillWave className="text-6xl text-gray-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  No payments yet
                </h3>
                <p className="text-gray-500">
                  Your payment history will appear here.
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-300">
                    <th className="text-left py-4 px-6 text-gray-500 font-semibold">
                      Order ID
                    </th>
                    <th className="text-left py-4 px-6 text-gray-500 font-semibold">
                      Car
                    </th>
                    <th className="text-left py-4 px-6 text-gray-500 font-semibold">
                      Date
                    </th>
                    <th className="text-left py-4 px-6 text-gray-500 font-semibold">
                      Amount
                    </th>
                    <th className="text-left py-4 px-6 text-gray-500 font-semibold">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition"
                    >
                      <td className="py-4 px-6 text-white font-mono text-sm">
                        {payment.orderId || "N/A"}
                      </td>
                      <td className="py-4 px-6 text-white font-medium">
                        {payment.carName || "N/A"}
                      </td>
                      <td className="py-4 px-6 text-gray-500">
                        {payment.createdAt?.toDate?.()
                          ? payment.createdAt.toDate().toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "N/A"}
                      </td>
                      <td className="py-4 px-6 font-semibold text-gray-900">
                        LKR {(parseFloat(payment.totalAmount) || 0).toLocaleString()}
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-sm font-semibold">
                          <FaCheckCircle className="text-xs" />{" "}
                          {payment.paymentStatus || "Paid"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* MY REVIEWS TAB */}
        {activeTab === "reviews" && (
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <div className="bg-white shadow-lg border border-gray-200 rounded-2xl shadow-sm p-12 text-center">
                <FaCommentDots className="text-6xl text-gray-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No reviews yet</h3>
                <p className="text-gray-500 mb-6">
                  After completing a booking, you can leave a review for the car.
                </p>
                <Link
                  to="/cars"
                  className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition"
                >
                  Browse Cars
                </Link>
              </div>
            ) : (
              reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white shadow-lg border border-gray-200 rounded-2xl shadow-sm p-6 flex flex-col md:flex-row items-start md:items-center gap-5 hover:shadow-md transition"
                >
                  {/* Car Image */}
                  <div className="w-full md:w-36 h-24 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0">
                    {review.carImage || review.carName ? (
                      <img
                        src={getCarImage(review.carImage || review.carName)}
                        alt={review.carName}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/images/Home-image.jpg";
                        }}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <FaCar className="text-3xl" />
                      </div>
                    )}
                  </div>

                  {/* Review Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {review.carName || "Car"}
                      </h3>
                      <div className="flex items-center gap-2">
                        {renderStars(review.rating)}
                        <span className="text-sm text-gray-500 font-medium">{review.rating}/5</span>
                      </div>
                    </div>
                    <p className="text-gray-500 leading-relaxed mb-2">{review.reviewText}</p>
                    {review.createdAt?.toDate && (
                      <p className="text-sm text-gray-400">
                        {review.createdAt.toDate().toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white py-14 px-10 mt-auto">
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

export default UserDashboard;
