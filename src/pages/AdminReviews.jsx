import AdminSidebar from "../components/AdminSidebar";
import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc
} from "firebase/firestore";

import { db, auth } from "../firebase/firebase";
import { signOut } from "firebase/auth";
import { useNavigate, useLocation } from "react-router-dom";

import {
  FaCar,
  FaUsers,
  FaTachometerAlt,
  FaSignOutAlt,
  FaUserCircle,
  FaCalendarCheck,
  FaUserTie,
  FaEnvelope,
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaTrashAlt,
  FaSearch,
  FaCommentDots
, FaMoneyCheckAlt} from 'react-icons/fa';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  /* ================= FETCH REVIEWS ================= */

  const fetchReviews = async () => {
    try {
      const snapshot = await getDocs(collection(db, "reviews"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Sort by createdAt descending
      data.sort((a, b) => {
        const aTime = a.createdAt?.toDate?.() || new Date(0);
        const bTime = b.createdAt?.toDate?.() || new Date(0);
        return bTime - aTime;
      });

      setReviews(data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  /* ================= DELETE REVIEW ================= */

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      try {
        await deleteDoc(doc(db, "reviews", id));
        fetchReviews();
      } catch (error) {
        console.error("Error deleting review:", error);
      }
    }
  };

  /* ================= LOGOUT ================= */

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  /* ================= STATS ================= */

  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / totalReviews).toFixed(1)
      : "0.0";
  const fiveStarCount = reviews.filter((r) => r.rating === 5).length;

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

  /* ================= FILTER ================= */

  const filteredReviews = reviews.filter((r) => {
    const term = searchTerm.toLowerCase();
    return (
      (r.carName || "").toLowerCase().includes(term) ||
      (r.userName || "").toLowerCase().includes(term) ||
      (r.reviewText || "").toLowerCase().includes(term)
    );
  });

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50 overflow-x-hidden">

      {/* ================= SIDEBAR ================= */}
      <AdminSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Customer Reviews
          </h1>
          <p className="text-gray-500 text-sm mt-1">Manage feedback and customer satisfaction ratings</p>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Reviews</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{totalReviews}</h3>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Average Rating</p>
            <div className="flex items-center gap-2 mt-1">
              <h3 className="text-2xl font-bold text-gray-900">{averageRating}</h3>
              <div className="flex text-yellow-400">{renderStars(Math.round(Number(averageRating)))}</div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">5-Star Ratings</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">{fiveStarCount}</h3>
          </div>
        </div>

        {/* SEARCH */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative w-full sm:w-80">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search by car, user, or review..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-gray-200 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-400 shadow-sm"
            />
          </div>
        </div>

        {/* REVIEWS LIST */}
        {loading ? (
          <p className="text-gray-400 text-sm">Loading reviews...</p>
        ) : filteredReviews.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl text-center text-gray-400 text-sm border border-gray-200">
            No reviews found.
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredReviews.map((review) => (
              <div key={review.id} className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition">
                <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-start">
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900">
                        {review.carName || "Unknown Car"}
                      </h3>
                      {renderStars(review.rating)}
                      <span className="text-xs font-semibold text-gray-500">
                        ({review.rating}/5)
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-400 mb-2">
                      By <span className="font-semibold text-gray-700">{review.userName || "Anonymous"}</span>
                      {review.createdAt?.toDate && (
                        <span className="ml-2">
                          • {review.createdAt.toDate().toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      )}
                    </p>
                    <p className="text-gray-600 text-sm leading-relaxed break-words">{review.reviewText}</p>
                  </div>

                  {/* Actions */}
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-3.5 py-2 rounded-xl text-sm font-semibold transition flex-shrink-0 self-start"
                  >
                    <FaTrashAlt className="text-xs" /> Delete
                  </button>

                </div>
              </div>
            ))}
          </div>
        )}

      </main>

    </div>
  );
};

export default AdminReviews;
