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
    <div className="flex min-h-screen bg-gray-50">

      {/* ================= SIDEBAR ================= */}

      <AdminSidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-4xl font-bold mb-10 text-gray-900">
          Customer Reviews
        </h1>

        {/* SEARCH */}
        <div className="mb-8 flex gap-4">
          <input
            type="text"
            placeholder="Search by car, user, or review..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-96 bg-white border border-gray-200 px-6 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-400 shadow-sm"
          />
        </div>

        {/* REVIEWS LIST */}
        {loading ? (
          <p className="text-gray-400 text-lg">Loading reviews...</p>
        ) : filteredReviews.length === 0 ? (
          <p className="text-gray-400 text-lg">No reviews found.</p>
        ) : (
          <div className="grid gap-6">
            {filteredReviews.map((review) => (
              <div key={review.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md hover:bg-gray-50 transition">
                <div className="flex flex-col md:flex-row gap-6 justify-between items-start">
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-bold text-gray-900">
                        {review.carName || "Unknown Car"}
                      </h3>
                      {renderStars(review.rating)}
                      <span className="text-sm font-semibold text-gray-400">
                        ({review.rating}/5)
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mb-2">
                      By <span className="font-semibold text-gray-600">{review.userName || "Anonymous"}</span>
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
                    <p className="text-gray-500 leading-relaxed">{review.reviewText}</p>
                  </div>

                  {/* Actions */}
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-700 px-4 py-2.5 rounded-xl font-semibold transition flex-shrink-0"
                  >
                    <FaTrashAlt /> Delete
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
