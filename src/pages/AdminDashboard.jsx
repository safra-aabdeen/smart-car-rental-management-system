import AdminSidebar from "../components/AdminSidebar";
import React, { useEffect, useState } from "react";

import {
  FaCar,
  FaUsers,
  FaMoneyBill,
  FaBook,
  FaChartBar,
  FaTachometerAlt,
  FaSignOutAlt,
  FaUserCircle,
  FaCalendarCheck,
  FaUserTie,
  FaEnvelope,
  FaStar,
  FaCommentDots
, FaMoneyCheckAlt} from 'react-icons/fa';

import { collection, getDocs } from "firebase/firestore";
import { signOut } from "firebase/auth";

import { db, auth } from "../firebase/firebase";

import { useNavigate, useLocation } from "react-router-dom";
import getCarImage from "../utils/carImage";

const AdminDashboard = () => {

  const [cars, setCars] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [carBookingCounts, setCarBookingCounts] = useState({});
  const [reviewsCount, setReviewsCount] = useState(0);
  const [avgRating, setAvgRating] = useState("0.0");

  const navigate = useNavigate();
  const location = useLocation();

  /* ================= FETCH DATA ================= */

  useEffect(() => {

    const fetchData = async () => {

      try {

        // Cars
        const carSnapshot = await getDocs(collection(db, "cars"));

        const carData = carSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setCars(carData);

        // Users
        const userSnapshot = await getDocs(collection(db, "users"));

        const userData = userSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setUsers(userData);

        // Bookings
const bookingSnapshot = await getDocs(
  collection(db, "bookings")
);

const bookingData = bookingSnapshot.docs.map((doc) => ({
  id: doc.id,
  ...doc.data(),
}));

setBookings(bookingData);


// Count bookings for each car
const carCounts = {};

bookingData.forEach((booking) => {
  if (booking.carId) {
    carCounts[booking.carId] =
      (carCounts[booking.carId] || 0) + 1;
  }
});

setCarBookingCounts(carCounts);

        // Reviews
        const reviewSnapshot = await getDocs(collection(db, "reviews"));
        const reviewData = reviewSnapshot.docs.map((doc) => doc.data());
        setReviewsCount(reviewData.length);
        if (reviewData.length > 0) {
          const avg = reviewData.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewData.length;
          setAvgRating(avg.toFixed(1));
        }

      } catch (error) {

        console.log(error);
      }
    };

    fetchData();

  }, []);

  /* ================= LOGOUT ================= */

  const handleLogout = async () => {

    try {

      await signOut(auth);

      navigate("/");

    } catch (error) {

      console.log(error);
    }
  };

  /* ================= TOTAL REVENUE ================= */

  const totalRevenue = bookings.reduce(
  (total, booking) => total + Number(booking.totalPrice || 0),
  0
  );

  return (

   <div className="flex h-screen overflow-hidden bg-gray-50">

      {/* ================= SIDEBAR ================= */}

      <AdminSidebar />

      <div className="flex-1 p-10 overflow-y-auto">

        <h1 className="text-5xl font-bold text-gray-900 mb-10">
          Admin Dashboard
        </h1>

        {/* ================= TOP CARDS ================= */}

        <div className="grid md:grid-cols-4 gap-6">

          {/* TOTAL CARS */}

          <div className="bg-white shadow-lg border border-gray-200 p-6 rounded-2xl">

            <div className="flex justify-between items-center">

              <div>

                <p className="text-gray-500">
                  Total Cars
                </p>

                <h2 className="text-4xl font-bold text-gray-900 mt-2">
                  {cars.length}
                </h2>

                <p className="text-green-500 mt-2">
                  Available Cars
                </p>

              </div>

              <div className="bg-blue-50 p-5 rounded-2xl">

                <FaCar className="text-3xl text-indigo-600" />

              </div>

            </div>

          </div>

          {/* BOOKINGS */}

          <div className="bg-white shadow-lg border border-gray-200 p-6 rounded-2xl">

            <div className="flex justify-between items-center">

              <div>

                <p className="text-gray-500">
                  Total Bookings
                </p>

                <h2 className="text-4xl font-bold text-gray-900 mt-2">
                  {bookings.length}
                </h2>

                <p className="text-blue-500 mt-2">
                  Active Bookings
                </p>

              </div>

              <div className="bg-indigo-50 p-5 rounded-2xl">

                <FaBook className="text-3xl text-green-600" />

              </div>

            </div>

          </div>

          {/* USERS */}

          <div className="bg-white shadow-lg border border-gray-200 p-6 rounded-2xl">

            <div className="flex justify-between items-center">

              <div>

                <p className="text-gray-500">
                  Total Users
                </p>

                <h2 className="text-4xl font-bold text-gray-900 mt-2">
                  {users.length}
                </h2>

                <p className="text-purple-500 mt-2">
                  Customers
                </p>

              </div>

              <div className="bg-purple-50 p-5 rounded-2xl">

                <FaUsers className="text-3xl text-purple-600" />

              </div>

            </div>

          </div>

          {/* REVENUE */}

          <div className="bg-white shadow-lg border border-gray-200 p-6 rounded-2xl">

            <div className="flex justify-between items-center">

              <div>

                <p className="text-gray-500">
                  Total Revenue
                </p>

                <h2 className="text-4xl font-bold text-gray-900 mt-2">
                  Rs.{totalRevenue}
                </h2>

                <p className="text-yellow-500 mt-2">
                  Completed
                </p>

              </div>

              <div className="bg-amber-50 p-5 rounded-2xl">

                <FaMoneyBill className="text-3xl text-amber-600" />

              </div>

            </div>

          </div>

        </div>

        {/* ================= BOTTOM SECTION ================= */}

        <div className="grid md:grid-cols-2 gap-8 mt-10">

          {/* RECENT BOOKINGS */}

          <div className="bg-white shadow-lg border border-gray-200 rounded-2xl p-6">

            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Recent Bookings
            </h2>

            <div className="space-y-5">

              {bookings.slice(0, 5).map((booking) => (

                <div
                  key={booking.id}
                  className="border border-gray-200 rounded-xl p-4 flex justify-between"
                >

                  <div>

                    <h3 className="font-bold text-xl text-gray-900">
                      {booking.carName}
                    </h3>

                    <p className="text-gray-500">
                      {booking.userName}
                    </p>

                    <p className="text-gray-400 text-sm">
                      {booking.pickupDate} to {booking.returnDate}
                    </p>

                  </div>

                  <div className="text-right">

                    <p className="text-green-600 font-bold text-xl">
                      Rs.{booking.totalPrice}
                    </p>

                    <p className={`capitalize ${
                      booking.status === "pending" ? "text-amber-600" :
                      booking.status === "confirmed" ? "text-green-600" :
                      booking.status === "completed" ? "text-blue-600" :
                      booking.status === "cancelled" ? "text-red-600" :
                      "text-gray-400"
                    }`}>
                      {booking.status}
                    </p>

                  </div>

                </div>

              ))}

            </div>

          </div>

          {/* POPULAR CARS */}

          <div className="bg-white shadow-lg border border-gray-200 rounded-2xl p-6">

            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Popular Cars
            </h2>

            <div className="space-y-5">

              {cars.filter((car) => carBookingCounts[car.id] > 0)
                      .sort(
                        (a, b) =>
                          (carBookingCounts[b.id] || 0) -
                          (carBookingCounts[a.id] || 0)
                      )
                      .slice(0, 5)
                      .map((car) => (

                <div
                  key={car.id}
                  className="border border-gray-200 rounded-xl p-4 flex justify-between items-center"
                >

                  <div className="flex items-center gap-4">

                    <img
                      src={getCarImage(car)}
                      alt={car.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/images/Home-image.jpg";
                      }}
                      className="w-20 h-20 rounded-xl object-cover"
                    />

                    <div>

                      <h3 className="font-bold text-xl text-gray-900">
                        {car.name}
                      </h3>

                      <p className="text-gray-500">
                        Rs.{car.price}/day
                      </p>

                    </div>

                  </div>

                  <div className="text-right">

                    <p className="font-bold text-2xl text-gray-900">
                      {carBookingCounts[car.id] || 0}
                    </p>

                    <p className="text-gray-400 text-sm">
                      bookings
                    </p>

                  </div>

                </div>

              ))}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;