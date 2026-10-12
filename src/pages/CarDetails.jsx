import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../firebase/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { FaCar, FaHome, FaPhone, FaInfoCircle, FaStar, FaStarHalfAlt, FaRegStar, FaUsers, FaGasPump, FaArrowLeft, FaSignOutAlt, FaUserCircle, FaCommentDots } from "react-icons/fa";

// Local fallback data
import localCars from "../data/Cars";

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
    <div className="bg-gray-50 min-h-screen">

      {/* NAVBAR */}
      <nav className="bg-white shadow-md px-10 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <FaCar className="text-indigo-600 text-3xl" />
          <h1 className="text-3xl font-bold text-gray-900">CarRental</h1>
        </div>

        <ul className="hidden md:flex gap-10 text-gray-700 text-lg items-center">
          <Link to="/" className="flex items-center gap-2 hover:text-indigo-600"><FaHome /> Home</Link>
          <Link to="/cars" className="flex items-center gap-2 hover:text-indigo-600"><FaCar /> Cars</Link>
          <Link to="/about" className="flex items-center gap-2 hover:text-indigo-600"><FaInfoCircle /> About</Link>
          <Link to="/contact" className="flex items-center gap-2 hover:text-indigo-600"><FaPhone /> Contact</Link>
        </ul>

        <div className="flex items-center gap-5">
          {userName ? (
            <>
              <button onClick={handleLogout} className="bg-gray-700 hover:bg-red-600 text-white px-5 py-2 rounded-lg flex items-center gap-2">
                <FaSignOutAlt /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-indigo-600 text-xl font-semibold px-5 py-2 hover:text-indigo-700">Login</Link>
              <Link to="/register" className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700">Register</Link>
            </>
          )}
        </div>
      </nav>

      {/* CAR DETAILS CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-10">

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-indigo-600 font-semibold mb-6 hover:underline"
        >
          <FaArrowLeft /> Back
        </button>

        <div className="bg-white shadow-lg rounded-2xl overflow-hidden grid md:grid-cols-2 gap-8 p-8">

          {/* IMAGE SECTION */}
          <div className="rounded-xl overflow-hidden">
            <img
              src={car.image}
              alt={car.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* INFO SECTION */}
          <div className="flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-4xl font-bold text-gray-900">{car.name}</h1>
                <div className="flex items-center gap-1 text-yellow-500 text-xl">
                  <FaStar /> {car.rating}
                </div>
              </div>

              <p className="text-4xl font-bold text-indigo-600 mb-6">Rs.{car.price}<span className="text-lg text-gray-400">/day</span></p>

              <div className="grid grid-cols-2 gap-4 text-gray-900">
                <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                  <p className="text-sm text-gray-400">Type</p>
                  <p className="font-semibold text-lg">{car.type}</p>
                </div>
                <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg flex items-center gap-2">
                  <FaUsers className="text-indigo-600" />
                  <div>
                    <p className="text-sm text-gray-400">Seats</p>
                    <p className="font-semibold text-lg">{car.seats}</p>
                  </div>
                </div>
                <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg flex items-center gap-2">
                  <FaGasPump className="text-indigo-600" />
                  <div>
                    <p className="text-sm text-gray-400">Fuel</p>
                    <p className="font-semibold text-lg">{car.fuelType || "Petrol"}</p>
                  </div>
                </div>
                <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                  <p className="text-sm text-gray-400">Status</p>
                  <p className={`font-semibold text-lg ${car.status === "Available" ? "text-green-600" : "text-red-600"
                    }`}>
                   {car.status === "Available" ? "Available" : "Unavailable"}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-xl font-bold mb-2 text-gray-900">Description</h3>
                <p className="text-gray-500 leading-relaxed">
                  Experience comfort and performance with the {car.name}. Perfect for {car.type.toLowerCase()} trips with {car.seats} seats and {car.fuel} engine.
                  Book now for the best rates.
                </p>
              </div>
            </div>

            {/* BOOK BUTTON */}
            {car.status === "Available" ? (
              <Link to={`/book/${car.id}`} className="w-full mt-8">
                <button className="w-full py-4 rounded-lg text-white text-lg font-semibold bg-indigo-600 hover:bg-indigo-700 transition">
                  Book Now
                </button>
              </Link>
            ) : (
              <button
                disabled
                className="w-full mt-8 py-4 rounded-lg text-gray-500 text-lg font-semibold bg-gray-300 cursor-not-allowed"
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
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FaCommentDots className="text-indigo-600" /> Customer Reviews
              </h2>
              <p className="text-gray-500 mt-1">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</p>
            </div>

            {averageRating && (
              <div className="flex items-center gap-4 mt-4 md:mt-0 bg-gray-100 px-6 py-4 rounded-xl">
                <span className="text-5xl font-bold text-gray-900">{averageRating}</span>
                <div>
                  {renderStars(parseFloat(averageRating))}
                  <p className="text-sm text-gray-500 mt-1">out of 5</p>
                </div>
              </div>
            )}
          </div>

          {/* Review list */}
          {reviews.length === 0 ? (
            <div className="text-center py-12">
              <FaRegStar className="text-6xl text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No reviews yet</h3>
              <p className="text-gray-500">Be the first to review this car after your rental!</p>
            </div>
          ) : (
            <div className="space-y-5">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="border border-gray-200 rounded-xl p-5 hover:bg-gray-50 transition"
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {(review.userName || "A").charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                        <span className="font-bold text-gray-900">{review.userName || "Anonymous"}</span>
                        <div className="flex items-center gap-2">
                          {renderStars(review.rating)}
                          <span className="text-sm text-gray-500 font-medium">{review.rating}/5</span>
                        </div>
                        {review.createdAt?.toDate && (
                          <span className="text-sm text-gray-400">
                            • {review.createdAt.toDate().toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-500 leading-relaxed">{review.reviewText}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white py-12 px-10 mt-10">
        <div className="grid md:grid-cols-3 gap-10 max-w-7xl mx-auto">
          <div>
            <h2 className="text-2xl font-bold mb-4">CarRental</h2>
            <p className="text-gray-400">Your trusted partner for car rentals.</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
            <p>Email: info@carrental.com</p>
            <p>Phone: +94 77 123 4567</p>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4">Follow Us</h2>
            <div className="flex gap-5">
              <p>Facebook</p>
              <p>Twitter</p>
              <p>Instagram</p>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 my-8"></div>
        <div className="text-center text-gray-400">
          © 2026 CarRental. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default CarDetails;