import AdminSidebar from "../components/AdminSidebar";
import React, { useEffect, useState } from "react";
import {
  FaCar,
  FaUsers,
  FaMoneyBill,
  FaBook,
} from "react-icons/fa";
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
        const bookingSnapshot = await getDocs(collection(db, "bookings"));
        const bookingData = bookingSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBookings(bookingData);

        // Count bookings for each car
        const carCounts = {};
        bookingData.forEach((booking) => {
          if (booking.carId) {
            carCounts[booking.carId] = (carCounts[booking.carId] || 0) + 1;
          }
        });
        setCarBookingCounts(carCounts);

        // Reviews
        const reviewSnapshot = await getDocs(collection(db, "reviews"));
        const reviewData = reviewSnapshot.docs.map((doc) => doc.data());
        setReviewsCount(reviewData.length);
        if (reviewData.length > 0) {
          const avg =
            reviewData.reduce((sum, r) => sum + (r.rating || 0), 0) /
            reviewData.length;
          setAvgRating(avg.toFixed(1));
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, []);

  /* ================= TOTAL REVENUE ================= */
  const totalRevenue = bookings.reduce(
    (total, booking) => total + Number(booking.totalPrice || 0),
    0
  );

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50 overflow-x-hidden">
      {/* ================= SIDEBAR ================= */}
      <AdminSidebar />

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Overview of your car rental business metrics and performance
          </p>
        </div>

        {/* ================= TOP METRIC CARDS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
          {/* TOTAL CARS */}
          <div className="bg-white shadow-sm hover:shadow-md border border-gray-200 p-5 rounded-2xl transition">
            <div className="flex justify-between items-center gap-3">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                  Total Cars
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1.5">
                  {cars.length}
                </h2>
                <p className="text-xs font-semibold text-emerald-600 mt-1.5 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                  Available Cars
                </p>
              </div>
              <div className="bg-indigo-50 p-3 sm:p-3.5 rounded-xl shrink-0">
                <FaCar className="text-xl sm:text-2xl text-indigo-600" />
              </div>
            </div>
          </div>

          {/* BOOKINGS */}
          <div className="bg-white shadow-sm hover:shadow-md border border-gray-200 p-5 rounded-2xl transition">
            <div className="flex justify-between items-center gap-3">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                  Total Bookings
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1.5">
                  {bookings.length}
                </h2>
                <p className="text-xs font-semibold text-blue-600 mt-1.5 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
                  Active Bookings
                </p>
              </div>
              <div className="bg-emerald-50 p-3 sm:p-3.5 rounded-xl shrink-0">
                <FaBook className="text-xl sm:text-2xl text-emerald-600" />
              </div>
            </div>
          </div>

          {/* USERS */}
          <div className="bg-white shadow-sm hover:shadow-md border border-gray-200 p-5 rounded-2xl transition">
            <div className="flex justify-between items-center gap-3">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                  Total Users
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1.5">
                  {users.length}
                </h2>
                <p className="text-xs font-semibold text-purple-600 mt-1.5 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-purple-500 inline-block"></span>
                  Registered Customers
                </p>
              </div>
              <div className="bg-purple-50 p-3 sm:p-3.5 rounded-xl shrink-0">
                <FaUsers className="text-xl sm:text-2xl text-purple-600" />
              </div>
            </div>
          </div>

          {/* REVENUE */}
          <div className="bg-white shadow-sm hover:shadow-md border border-gray-200 p-5 rounded-2xl transition">
            <div className="flex justify-between items-center gap-3">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                  Total Revenue
                </p>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1.5 truncate">
                  Rs. {Number(totalRevenue || 0).toLocaleString()}
                </h2>
                <p className="text-xs font-semibold text-amber-600 mt-1.5 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
                  All-time Completed
                </p>
              </div>
              <div className="bg-amber-50 p-3 sm:p-3.5 rounded-xl shrink-0">
                <FaMoneyBill className="text-xl sm:text-2xl text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* ================= BOTTOM SECTION ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* RECENT BOOKINGS */}
          <div className="bg-white shadow-sm border border-gray-200 rounded-2xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                Recent Bookings
              </h2>
              <span className="text-xs text-gray-500">Latest 5</span>
            </div>

            <div className="space-y-3">
              {bookings.length === 0 ? (
                <p className="text-sm text-gray-400 py-6 text-center">No recent bookings</p>
              ) : (
                bookings.slice(0, 5).map((booking) => (
                  <div
                    key={booking.id}
                    className="border border-gray-200 rounded-xl p-3 sm:p-4 flex items-center justify-between gap-3 hover:bg-gray-50 transition"
                  >
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm sm:text-base text-gray-900 truncate">
                        {booking.carName || "Vehicle"}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 truncate">
                        {booking.userName || "Customer"}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {booking.pickupDate} to {booking.returnDate}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-emerald-600 font-bold text-sm sm:text-base">
                        Rs. {Number(booking.totalPrice || 0).toLocaleString()}
                      </p>
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold capitalize mt-1 ${
                          booking.status === "pending"
                            ? "bg-amber-100 text-amber-700"
                            : booking.status === "confirmed"
                            ? "bg-emerald-100 text-emerald-700"
                            : booking.status === "completed"
                            ? "bg-blue-100 text-blue-700"
                            : booking.status === "cancelled"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* POPULAR CARS */}
          <div className="bg-white shadow-sm border border-gray-200 rounded-2xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                Popular Cars
              </h2>
              <span className="text-xs text-gray-500">Most Booked</span>
            </div>

            <div className="space-y-3">
              {cars.filter((car) => carBookingCounts[car.id] > 0).length === 0 ? (
                <p className="text-sm text-gray-400 py-6 text-center">No popular car data yet</p>
              ) : (
                cars
                  .filter((car) => carBookingCounts[car.id] > 0)
                  .sort(
                    (a, b) =>
                      (carBookingCounts[b.id] || 0) -
                      (carBookingCounts[a.id] || 0)
                  )
                  .slice(0, 5)
                  .map((car) => (
                    <div
                      key={car.id}
                      className="border border-gray-200 rounded-xl p-3 sm:p-3.5 flex justify-between items-center gap-3 hover:bg-gray-50 transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={getCarImage(car)}
                          alt={car.name}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/images/Home-image.jpg";
                          }}
                          className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <h3 className="font-semibold text-sm sm:text-base text-gray-900 truncate">
                            {car.name}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-500">
                            Rs. {Number(car.price || 0).toLocaleString()}/day
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="font-bold text-lg sm:text-xl text-gray-900">
                          {carBookingCounts[car.id] || 0}
                        </p>
                        <p className="text-gray-400 text-xs">bookings</p>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;