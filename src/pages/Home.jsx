import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { FaCar, FaSearch, FaStar } from "react-icons/fa";
import homeImg from "../images/Home-image.jpg";
import localCars from "../data/Cars";
import getCarImage from "../utils/carImage";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Home = () => {
  const [popupImg, setPopupImg] = useState(null);
  const [featuredCars, setFeaturedCars] = useState([]);
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [location, setLocation] = useState("");
  const [carType, setCarType] = useState("");
  const navigate = useNavigate();

  // Load featured cars from Firestore, fallback to local
  useEffect(() => {
    const fetchCars = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "cars"));
        const carData = [];
        querySnapshot.forEach((doc) => {
          carData.push({ id: doc.id, ...doc.data() });
        });
        const sortedCars = carData.sort(
          (a, b) => Number(a.carId) - Number(b.carId)
        );

        setFeaturedCars(
          sortedCars.length > 0
            ? sortedCars.slice(0, 3)
            : localCars.slice(0, 3)
        );
      } catch (error) {
        console.log("Using local cars:", error);
        setFeaturedCars(localCars.slice(0, 3));
      }
    };
    fetchCars();
  }, []);

  const reviews = [
    { name: "Sarah Johnson", text: "Amazing service! The car was clean and well-maintained." },
    { name: "Michael Chen", text: "Great prices and excellent customer support." },
    { name: "Emily Davis", text: "Easy booking process and smooth pickup experience." },
  ];

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (carType) params.append("type", carType);
    if (location) params.append("location", location);
    if (pickupDate) params.append("pickup", pickupDate);
    if (returnDate) params.append("return", returnDate);
    navigate(`/cars?${params.toString()}`);
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">

      {/* NAVBAR */}
      <Navbar active="home" />

      {/* HERO + SEARCH BAR */}
      <section
        className="relative min-h-[500px] md:min-h-[540px] bg-cover bg-center flex items-center py-12 md:py-16"
        style={{ backgroundImage: `url(${homeImg})` }}
      >
        <div className="absolute inset-0 bg-black/50"></div>

        <div className="relative z-10 px-4 sm:px-6 md:px-10 max-w-7xl mx-auto text-white w-full">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            Find Your Perfect Ride
          </h1>
          <p className="mt-3 text-base sm:text-lg md:text-xl text-gray-200">
            Premium cars at affordable prices
          </p>

          <div className="bg-white/95 backdrop-blur-md border border-gray-200 rounded-2xl p-4 sm:p-6 mt-8 shadow-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            <input
              type="date"
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="bg-gray-50 border border-gray-300 p-3 rounded-xl text-sm text-gray-900 placeholder-gray-400 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <input
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              min={pickupDate || new Date().toISOString().split("T")[0]}
              className="bg-gray-50 border border-gray-300 p-3 rounded-xl text-sm text-gray-900 placeholder-gray-400 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <input
              type="text"
              placeholder="Pickup Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="bg-gray-50 border border-gray-300 p-3 rounded-xl text-sm text-gray-900 placeholder-gray-400 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <select
              value={carType}
              onChange={(e) => setCarType(e.target.value)}
              className="bg-gray-50 border border-gray-300 p-3 rounded-xl text-sm text-gray-900 placeholder-gray-400 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Car Types</option>
              <option value="SUV">SUV</option>
              <option value="Sedan">Sedan</option>
              <option value="Luxury">Luxury</option>
              <option value="Economy">Economy</option>
              <option value="Family">Family</option>
            </select>

            <button
              onClick={handleSearch}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 text-sm shadow-md transition sm:col-span-2 lg:col-span-1"
            >
              <FaSearch className="text-xs" /> Search Cars
            </button>
          </div>
        </div>
      </section>

      {/* FEATURED CARS */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 md:px-10 max-w-7xl mx-auto w-full">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12 text-gray-900">
          Featured Cars
        </h2>

        {featuredCars.length === 0 ? (
          <p className="text-center text-gray-400 py-8 text-sm">Loading cars...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {featuredCars.map((car) => {
              const carImg = getCarImage(car);
              return (
                <div key={car.id} className="bg-white shadow-md border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl transition duration-300 flex flex-col">
                  <div className="h-52 sm:h-56 w-full overflow-hidden bg-gray-100">
                    <img
                      src={carImg}
                      alt={car.name}
                      onClick={() => setPopupImg(carImg)}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/images/Home-image.jpg";
                      }}
                      className="h-full w-full object-cover cursor-pointer transition-transform duration-300 hover:scale-105"
                    />
                  </div>

                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center gap-2">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{car.name}</h3>
                        <div className="flex items-center gap-1 text-yellow-500 text-sm font-semibold shrink-0">
                          <FaStar className="text-xs" /> {car.rating || "4.5"}
                        </div>
                      </div>

                      <p className="text-indigo-600 text-xl sm:text-2xl font-bold mt-2">
                        Rs.{car.price}<span className="text-xs text-gray-400 font-normal">/day</span>
                      </p>
                    </div>

                    <Link to={`/car/${car.id}`} className="mt-4">
                      <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl text-sm transition shadow-sm">
                        View Details
                      </button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* REVIEWS */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 md:px-10 bg-gray-100/70">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12 text-gray-900">
            What Our Customers Say
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((r, i) => (
              <div key={i} className="bg-white shadow-sm border border-gray-100 p-6 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="text-yellow-400 text-sm mb-3">⭐⭐⭐⭐⭐</div>
                  <p className="text-gray-600 text-sm sm:text-base leading-relaxed">"{r.text}"</p>
                </div>
                <h4 className="mt-4 font-bold text-sm text-gray-900">- {r.name}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* POPUP IMAGE */}
      {popupImg && (
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setPopupImg(null)}
        >
          <img
            src={popupImg}
            className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
            alt="Car preview"
          />
        </div>
      )}

      {/* FOOTER */}
      <Footer />

    </div>
  );
};

export default Home;