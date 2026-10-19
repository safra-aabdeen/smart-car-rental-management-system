import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../firebase/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { FaCar, FaHome, FaPhone, FaInfoCircle, FaStar, FaStarHalfAlt, FaRegStar, FaUsers, FaGasPump, FaArrowLeft, FaSignOutAlt, FaUserCircle, FaCommentDots } from "react-icons/fa";

import localCars from "../data/Cars";
import getCarImage from "../utils/carImage";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const CarDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [reviews, setReviews] = useState([]);

  /* ========== Get Logged User ========== */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserName(docSnap.data().userName || user.email);
          } else {
            setUserName(user.email);
          }
        } catch (error) {
          setUserName(user.email);
        }
      } else {
        setUserName("");
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  /* ========== Fetch Car Data ========== */
  useEffect(() => {
    const fetchCar = async () => {
      setLoading(true);
      try {
        // Try firebase first
        const docRef = doc(db, "cars", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setCar({ id: docSnap.id, ...docSnap.data() });
        } else {
          // fallback to local file
          const localCar = localCars.find((c) => c.id === Number(id));
          setCar(localCar || null);
        }
      } catch (error) {
        console.log("firebase error, using local data:", error);
        const localCar = localCars.find((c) => c.id === Number(id));
        setCar(localCar || null);
      }
      setLoading(false);
    };
    fetchCar();
  }, [id]);

  /* ========== Fetch Reviews ========== */
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const q = query(collection(db, "reviews"), where("carId", "==", id));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        data.sort((a, b) => {
          const aTime = a.createdAt?.toDate?.() || new Date(0);
          const bTime = b.createdAt?.toDate?.() || new Date(0);
          return bTime - aTime;
        });
        setReviews(data);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };
    fetchReviews();
  }, [id]);

  /* ========== Render Stars ========== */
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

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
      : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-2xl font-semibold text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen flex-col items-center justify-center bg-gray-50">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Car Not Found</h2>
        <Link to="/cars" className="text-indigo-600 hover:underline flex items-center gap-2">
          <FaArrowLeft /> Back to Cars
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col overflow-x-hidden">

      {/* NAVBAR */}
      <Navbar active="cars" />

      {/* CAR DETAILS CONTENT */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-10 py-6 sm:py-10">

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-indigo-600 font-semibold mb-6 hover:underline text-sm sm:text-base cursor-pointer"
        >
          <FaArrowLeft /> Back to Cars
        </button>

        <div className="bg-white shadow-sm border border-gray-200 rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 p-5 sm:p-8">

          {/* IMAGE SECTION */}
          <div className="rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center max-h-[380px]">
            <img
              src={getCarImage(car)}
              alt={car.name}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/images/Home-image.jpg";
              }}
              className="w-full h-full object-cover"
            />
          </div>

          {/* INFO SECTION */}
          <div className="flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start gap-3 mb-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{car.name}</h1>
                <div className="flex items-center gap-1 text-yellow-500 text-base font-semibold shrink-0">
                  <FaStar /> {car.rating}
                </div>
              </div>

              <p className="text-2xl sm:text-3xl font-bold text-indigo-600 mb-5">
                Rs.{car.price}<span className="text-sm text-gray-400 font-normal">/day</span>
              </p>

              <div className="grid grid-cols-2 gap-3 text-gray-900">
                <div className="bg-gray-50 border border-gray-200 p-3.5 rounded-xl">
                  <p className="text-xs text-gray-400">Type</p>
                  <p className="font-semibold text-sm sm:text-base">{car.type}</p>
                </div>
                <div className="bg-gray-50 border border-gray-200 p-3.5 rounded-xl flex items-center gap-2.5">
                  <FaUsers className="text-indigo-600 text-sm" />
                  <div>
                    <p className="text-xs text-gray-400">Seats</p>
                    <p className="font-semibold text-sm sm:text-base">{car.seats} Seats</p>
                  </div>
                </div>
                <div className="bg-gray-50 border border-gray-200 p-3.5 rounded-xl flex items-center gap-2.5">
                  <FaGasPump className="text-indigo-600 text-sm" />
                  <div>
                    <p className="text-xs text-gray-400">Fuel</p>
                    <p className="font-semibold text-sm sm:text-base">{car.fuelType || "Petrol"}</p>
                  </div>
                </div>
                <div className="bg-gray-50 border border-gray-200 p-3.5 rounded-xl">
                  <p className="text-xs text-gray-400">Status</p>
                  <p className={`font-semibold text-sm sm:text-base ${
                    car.status === "Available" ? "text-green-600" : "text-red-600"
                  }`}>
                    {car.status === "Available" ? "Available" : "Unavailable"}
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <h3 className="text-base sm:text-lg font-bold mb-1.5 text-gray-900">Description</h3>
                <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
                  Experience comfort and performance with the {car.name}. Perfect for {car.type?.toLowerCase() || "comfortable"} trips with {car.seats} seats and {car.fuelType || "efficient"} engine. Book now for the best rates.
                </p>
              </div>
            </div>

            {/* BOOK BUTTON */}
            {car.status === "Available" ? (
              <Link to={`/book/${car.id}`} className="w-full mt-6">
                <button className="w-full py-3 sm:py-3.5 rounded-xl text-white text-sm sm:text-base font-semibold bg-indigo-600 hover:bg-indigo-700 transition shadow-sm cursor-pointer">
                  Book Now
                </button>
              </Link>
            ) : (
              <button
                disabled
                className="w-full mt-6 py-3 sm:py-3.5 rounded-xl text-gray-400 text-sm sm:text-base font-semibold bg-gray-200 cursor-not-allowed"
              >
                Currently Unavailable
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========== CUSTOMER REVIEWS ========== */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="bg-white shadow-lg rounded-2xl p-8">

          {/* Header with average */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FaCommentDots className="text-indigo-600" /> Customer Reviews
              </h2>
              <p className="text-gray-500 text-xs sm:text-sm mt-0.5">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</p>
            </div>

            {averageRating && (
              <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl">
                <span className="text-2xl sm:text-3xl font-bold text-gray-900">{averageRating}</span>
                <div>
                  {renderStars(parseFloat(averageRating))}
                  <p className="text-xs text-gray-400 mt-0.5">out of 5</p>
                </div>
              </div>
            )}
          </div>

          {/* Review list */}
          {reviews.length === 0 ? (
            <div className="text-center py-8">
              <FaRegStar className="text-4xl text-gray-300 mx-auto mb-2" />
              <h3 className="text-base font-semibold text-gray-900 mb-1">No reviews yet</h3>
              <p className="text-gray-400 text-xs">Be the first to review this car after your rental!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="border border-gray-100 rounded-xl p-4 sm:p-5 hover:bg-gray-50/50 transition"
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    {/* Avatar */}
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {(review.userName || "A").charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="font-bold text-sm text-gray-900">{review.userName || "Anonymous"}</span>
                        <div className="flex items-center gap-1.5">
                          {renderStars(review.rating)}
                          <span className="text-xs text-gray-400 font-medium">{review.rating}/5</span>
                        </div>
                        {review.createdAt?.toDate && (
                          <span className="text-xs text-gray-400">
                            • {review.createdAt.toDate().toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-xs sm:text-sm leading-relaxed break-words">{review.reviewText}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <Footer />
    </div>
  );
};

export default CarDetails;