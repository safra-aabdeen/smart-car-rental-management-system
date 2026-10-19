import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { doc, getDoc, addDoc, collection, serverTimestamp, updateDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { db, auth } from "../firebase/firebase";
import {
  FaCar,
  FaHome,
  FaPhone,
  FaInfoCircle,
  FaCalendar,
  FaMapMarkerAlt,
  FaSignOutAlt,
  FaUser,
  FaUserTie
} from "react-icons/fa";

import localCars from "../data/Cars";
import getCarImage from "../utils/carImage";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const DRIVER_CHARGE_PER_DAY = 1750;

const Booking = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [car, setCar] = useState(null);
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);

  const [booking, setBooking] = useState({
    pickupDate: "",
    returnDate: "",
    location: "",
    needDriver: false
  });

  /* ================= AUTH + GET USERNAME ================= */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            setUserName(userDoc.data().name || currentUser.email);
          } else {
            setUserName(currentUser.email);
          }
        } catch (error) {
          setUserName(currentUser.email);
        }
      } else {
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  /* ================= FETCH CAR ================= */
  useEffect(() => {
    const fetchCar = async () => {
      setLoading(true);
      try {
        if (!id) {
          navigate("/cars");
          return;
        }

        const docRef = doc(db, "cars", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setCar({ id: docSnap.id,...docSnap.data() });
        } else {
          const localCar = localCars.find((c) => String(c.id) === String(id));
          setCar(localCar || null);
        }
      } catch (error) {
        console.log("Fetch error:", error);
        const localCar = localCars.find((c) => String(c.id) === String(id));
        setCar(localCar || null);
      } finally {
        setLoading(false);
      }
    };
    fetchCar();
  }, [id, navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const calculateDays = () => {
    if (!booking.pickupDate ||!booking.returnDate) return 0;
    const start = new Date(booking.pickupDate);
    const end = new Date(booking.returnDate);
    const diff = (end - start) / (1000 * 60 * 60 * 24);
    return diff > 0? diff : 0;
  };

  const calculateTotal = () => {
    const days = calculateDays();
    if (days === 0) return 0;

    const carTotal = car.price * days;
    const driverTotal = booking.needDriver? DRIVER_CHARGE_PER_DAY * days : 0;
    return carTotal + driverTotal;
  };

  const handleBooking = async (e) => {
    e.preventDefault();

    if (!car) return alert("Car not loaded");
    if (!booking.pickupDate ||!booking.returnDate ||!booking.location) {
      return alert("Please fill all fields");
    }

    const days = calculateDays();
    if (days === 0) {
      return alert("Return date must be after pickup date");
    }

    try {

          // Get current user document
        const userRef = doc(
          db,
          "users",
          user.uid
        );

        const userSnap = await getDoc(
          userRef
        );

        let currentBookings = 0;

        if (userSnap.exists()) {
          currentBookings =
            userSnap.data().bookingCount || 0;
        }

      const newBooking = await addDoc(collection(db, "bookings"), {
        userId: user.uid,
        userEmail: user.email,
        userName: userName || user.displayName || "Unknown User",
        carId: car.id,
        carName: car.name,
        carImage: getCarImage(car),
        pricePerDay: car.price,
        driverChargePerDay: booking.needDriver? DRIVER_CHARGE_PER_DAY : 0,
        totalPrice: calculateTotal(),
        days,
        needDriver: booking.needDriver,
        driverStatus: booking.needDriver ? "requested" : "not_required",
        driverAssigned: false,
        pickupDate: booking.pickupDate,
        returnDate: booking.returnDate,
        location: booking.location,
        status: "pending",
        createdAt: serverTimestamp()
      });

          // Update booking count in users collection
      await setDoc(
        userRef,
        {
          bookingCount:
            currentBookings + 1
        },
        { merge: true }
      );


      navigate("/payment", {
        state: {
          bookingId: newBooking.id,
          carId: car.id,
          carName: car.name,
          carImage: getCarImage(car),
          pickupDate: booking.pickupDate,
          returnDate: booking.returnDate,
          pickupLocation: booking.location,
          totalDays: calculateDays(),
          pricePerDay: car.price,
          totalAmount: calculateTotal(),
          needDriver: booking.needDriver,
          driverCharge: booking.needDriver ? DRIVER_CHARGE_PER_DAY : 0,
        }
      });
    } catch (error) {
      console.log(error);
      alert("Booking failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl bg-gray-50 text-gray-500">
        Loading...
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen flex-col items-center justify-center bg-gray-50">
        <h1 className="text-3xl font-bold mb-4 text-gray-900">Car Not Found</h1>
        <Link to="/cars" className="text-indigo-600 hover:underline">
          Back to Cars
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col overflow-x-hidden">

      {/* NAVBAR */}
      <Navbar />

      {/* CONTENT */}
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 md:px-10 py-6 sm:py-10 flex-1">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-900 tracking-tight">Book Your Car</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">

          {/* FORM */}
          <div className="lg:col-span-2 bg-white shadow-sm border border-gray-200 p-5 sm:p-8 rounded-2xl">
            <h2 className="text-lg sm:text-xl font-bold mb-5 text-gray-900">Booking Details</h2>

            <form onSubmit={handleBooking} className="space-y-4 sm:space-y-5">

              {/* Pickup Date */}
              <div>
                <label className="flex items-center gap-2 text-xs sm:text-sm text-gray-700 font-semibold mb-1.5">
                  <FaCalendar className="text-gray-400 text-xs" /> Pickup Date
                </label>
                <input
                  type="date"
                  value={booking.pickupDate}
                  onChange={(e) => setBooking({...booking, pickupDate: e.target.value })}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              {/* Return Date */}
              <div>
                <label className="flex items-center gap-2 text-xs sm:text-sm text-gray-700 font-semibold mb-1.5">
                  <FaCalendar className="text-gray-400 text-xs" /> Return Date
                </label>
                <input
                  type="date"
                  value={booking.returnDate}
                  min={booking.pickupDate || new Date().toISOString().split("T")[0]}
                  onChange={(e) => setBooking({...booking, returnDate: e.target.value })}
                  className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              {/* Need Driver Option */}
              <div className="flex items-center gap-3 p-3.5 border border-gray-200 rounded-xl bg-gray-50/70">
                <input
                  type="checkbox"
                  id="needDriver"
                  checked={booking.needDriver}
                  onChange={(e) => setBooking({...booking, needDriver: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="needDriver" className="flex items-center gap-2 text-xs sm:text-sm text-gray-700 font-medium cursor-pointer">
                  <FaUserTie className="text-gray-500 text-xs" />
                  Need Driver (Rs.{DRIVER_CHARGE_PER_DAY.toLocaleString()}/day)
                </label>
              </div>

              {/* Pickup Location */}
              <div>
                <label className="flex items-center gap-2 text-xs sm:text-sm text-gray-700 font-semibold mb-1.5">
                  <FaMapMarkerAlt className="text-gray-400 text-xs" /> Pickup Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Colombo Airport, Kandy City"
                  value={booking.location}
                  onChange={(e) => setBooking({...booking, location: e.target.value })}
                  className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 sm:py-3.5 rounded-xl font-semibold text-sm sm:text-base transition shadow-sm cursor-pointer mt-2"
              >
                Proceed to Payment
              </button>
            </form>
          </div>

          {/* SUMMARY */}
          <div className="bg-white shadow-sm border border-gray-200 p-5 rounded-2xl h-fit lg:sticky lg:top-24">
            <h2 className="text-lg font-bold mb-3 text-gray-900">Booking Summary</h2>

            <div className="h-40 w-full overflow-hidden rounded-xl bg-gray-100 mb-4">
              <img
                src={getCarImage(car)}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/images/Home-image.jpg";
                }}
                className="w-full h-full object-cover"
                alt={car.name}
              />
            </div>

            <div className="space-y-2.5 text-sm">
              <div>
                <p className="text-gray-400 text-xs">Selected Car</p>
                <p className="font-bold text-gray-900">{car.name}</p>
              </div>

              <div>
                <p className="text-gray-400 text-xs">Rate per day</p>
                <p className="font-bold text-indigo-600">Rs.{car.price?.toLocaleString()}</p>
              </div>

              {booking.needDriver && (
                <div>
                  <p className="text-gray-400 text-xs">Driver Charge</p>
                  <p className="font-bold text-gray-800">Rs.{DRIVER_CHARGE_PER_DAY.toLocaleString()}/day</p>
                </div>
              )}

              {calculateDays() > 0 && (
                <div className="border-t border-gray-200 pt-3 space-y-2">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Total Duration:</span>
                    <span className="font-semibold text-gray-900">{calculateDays()} day{calculateDays() > 1 ? "s" : ""}</span>
                  </div>

                  {booking.needDriver && (
                    <div className="text-xs text-gray-500 space-y-0.5">
                      <div className="flex justify-between">
                        <span>Car Subtotal:</span>
                        <span>Rs.{(car.price * calculateDays()).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Driver Subtotal:</span>
                        <span>Rs.{(DRIVER_CHARGE_PER_DAY * calculateDays()).toLocaleString()}</span>
                      </div>
                    </div>
                  )}

                  <div className="border-t border-gray-200 pt-2 flex justify-between items-baseline">
                    <span className="text-xs font-semibold text-gray-700">Total Price:</span>
                    <span className="font-bold text-xl text-indigo-600">Rs.{calculateTotal().toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <Footer />
    </div>
  );
};

export default Booking;