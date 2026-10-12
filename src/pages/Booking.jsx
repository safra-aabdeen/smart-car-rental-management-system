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
        carImage: car.image,
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
          carImage: car.image,
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
    <div className="bg-gray-50 min-h-screen flex-col">

      {/* NAVBAR */}
      <nav className="bg-white shadow-md px-10 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <FaCar className="text-indigo-600 text-2xl" />
          <h1 className="text-2xl font-bold text-gray-900">CarRental</h1>
        </div>

        <ul className="hidden md:flex gap-8 text-gray-600 font-medium">
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
        </ul>

        <div className="flex items-center gap-5">
          {user && (
            <>
              <p className="text-gray-900 font-semibold text-lg flex items-center gap-2">
                <FaUser className="text-indigo-600" /> {userName}
              </p>
              <button
                onClick={handleLogout}
                className="bg-gray-700 hover:bg-red-600 text-white px-5 py-2 rounded-lg flex items-center gap-2 transition"
              >
                <FaSignOutAlt />Logout
              </button>
            </>
          )}
        </div>
      </nav>

      {/* CONTENT */}
      <div className="max-w-6xl mx-auto px-6 py-12 flex-1">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">Book Your Car</h1>

        <div className="grid md:grid-cols-3 gap-8">

          {/* FORM */}
          <div className="md:col-span-2 bg-white shadow-lg p-8 rounded-2xl">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Booking Details</h2>

            <form onSubmit={handleBooking} className="space-y-5">

              {/* Pickup Date */}
              <div>
                <label className="flex items-center gap-2 text-gray-600 font-medium mb-2">
                  <FaCalendar className="text-gray-400" /> Pickup Date
                </label>
                <input
                  type="date"
                  value={booking.pickupDate}
                  onChange={(e) => setBooking({...booking, pickupDate: e.target.value })}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  required
                />
              </div>

              {/* Return Date */}
              <div>
                <label className="flex items-center gap-2 text-gray-600 font-medium mb-2">
                  <FaCalendar className="text-gray-400" /> Return Date
                </label>
                <input
                  type="date"
                  value={booking.returnDate}
                  min={booking.pickupDate || new Date().toISOString().split("T")[0]}
                  onChange={(e) => setBooking({...booking, returnDate: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  required
                />
              </div>

              {/* Need Driver Option */}
              <div className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <input
                  type="checkbox"
                  id="needDriver"
                  checked={booking.needDriver}
                  onChange={(e) => setBooking({...booking, needDriver: e.target.checked })}
                  className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <label htmlFor="needDriver" className="flex items-center gap-2 text-gray-600 font-medium cursor-pointer">
                  <FaUserTie className="text-gray-500" />
                  Need Driver (Rs.{DRIVER_CHARGE_PER_DAY}/day)
                </label>
              </div>

              {/* Pickup Location */}
              <div>
                <label className="flex items-center gap-2 text-gray-600 font-medium mb-2">
                  <FaMapMarkerAlt className="text-gray-400" /> Pickup Location
                </label>
                <input
                  type="text"
                  placeholder="Enter location"
                  value={booking.location}
                  onChange={(e) => setBooking({...booking, location: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-lg p-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition shadow-sm"
              >
                Confirm Booking
              </button>
            </form>
          </div>

          {/* SUMMARY */}
          <div className="bg-white shadow-lg p-6 rounded-2xl h-fit">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Booking Summary</h2>

            <img
              src={car.image}
              className="w-full h-48 object-cover rounded-xl mb-4"
              alt={car.name}
            />

            <div className="space-y-3">
              <div>
                <p className="text-gray-400 text-sm">Car</p>
                <p className="font-bold text-lg text-gray-900">{car.name}</p>
              </div>

              <div>
                <p className="text-gray-400 text-sm">Price per day</p>
                <p className="font-bold text-xl text-indigo-600">Rs.{car.price}</p>
              </div>

              {booking.needDriver && (
                <div>
                  <p className="text-gray-400 text-sm">Driver Charge</p>
                  <p className="font-bold text-lg text-gray-900">Rs.{DRIVER_CHARGE_PER_DAY}/day</p>
                </div>
              )}

              {calculateDays() > 0 && (
                <>
                  <div className="border-t border-gray-300 pt-3">
                    <p className="text-gray-400 text-sm">Total Days</p>
                    <p className="font-bold text-gray-900">{calculateDays()} days</p>
                  </div>

                  {booking.needDriver && (
                    <div className="text-sm text-gray-500">
                      <p>Car: Rs.{car.price * calculateDays()}</p>
                      <p>Driver: Rs.{DRIVER_CHARGE_PER_DAY * calculateDays()}</p>
                    </div>
                  )}

                  <div className="border-t border-gray-300 pt-3">
                    <p className="text-gray-400 text-sm">Total Price</p>
                    <p className="font-bold text-2xl text-indigo-600">Rs.{calculateTotal()}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white py-12 px-10 mt-auto">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10">
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <FaCar /> CarRental
            </h2>
            <p className="text-gray-400">
              Your trusted partner for car rentals. Quality vehicles at affordable prices.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
            <p className="text-gray-400">Email: info@carrental.com</p>
            <p className="text-gray-400">Phone: +91 77123 4567</p>
            <p className="text-gray-400">Address: 123 Main St, New York, NY 10001</p>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Follow Us</h2>
            <div className="flex gap-5 text-gray-400">
              <a href="#" className="hover:text-white transition">Facebook</a>
              <a href="#" className="hover:text-white transition">Twitter</a>
              <a href="#" className="hover:text-white transition">Instagram</a>
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

export default Booking;