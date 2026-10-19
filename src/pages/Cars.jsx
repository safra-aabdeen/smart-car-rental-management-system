import React, { useEffect, useState } from "react";
import {
  FaCar, FaFilter, FaStar,
  FaUsers, FaCrown, FaMoneyBill, FaChevronDown, FaChevronUp
} from "react-icons/fa";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";
import localCars from "../data/Cars";
import getCarImage from "../utils/carImage";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Cars = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [cars, setCars] = useState([]);
  const [carType, setCarType] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [capacity, setCapacity] = useState("");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  /* ================= READ SEARCH PARAMS FROM HOME ================= */
  useEffect(() => {
    const typeParam = searchParams.get("type");
    const capacityParam = searchParams.get("capacity");

    if (typeParam) setCarType(typeParam);
    if (capacityParam) setCapacity(capacityParam);
  }, [searchParams]);

  /* ================= FIREBASE FETCH ================= */
  useEffect(() => {
    const fetchCars = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "cars"));
        const carData = [];
        querySnapshot.forEach((doc) => {
          carData.push({ id: doc.id, ...doc.data() });
        });
        carData.sort((a, b) => Number(a.carId) - Number(b.carId));
        setCars(carData);
      } catch (error) {
        console.log("Firebase error, using local data:", error);
        setCars(localCars);
      }
    };
    fetchCars();
  }, []);

  const allCars = cars.length > 0 ? cars : localCars;

  /* ================= FILTER ================= */
  const filteredCars = allCars.filter((car) => {
    const matchesType = !carType || car.type === carType;
    const price = Number(car.price || 0);
    const seats = Number(car.seats || 0);
    const matchesMaxPrice = !maxPrice || price <= Number(maxPrice);
    const matchesMinPrice = !minPrice || price >= Number(minPrice);
    const matchesCapacity = !capacity || seats === Number(capacity);
    const matchesAvailability = !onlyAvailable || car.status === "Available";

    return (
      matchesType &&
      matchesMaxPrice &&
      matchesMinPrice &&
      matchesCapacity &&
      matchesAvailability
    );
  });

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">

      {/* ================= NAVBAR ================= */}
      <Navbar active="cars" />

      {/* ================= PAGE TITLE ================= */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-10 pt-6 sm:pt-10">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Available Cars</h1>
        {(carType || maxPrice || minPrice || capacity) && (
          <p className="text-gray-500 text-xs sm:text-sm mt-1">Filters applied from search</p>
        )}
      </div>

      {/* ================= SMART RECOMMENDATION ================= */}
      <section className="max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-10 mt-6 sm:mt-8">
        <div className="bg-white shadow-sm border border-gray-200 rounded-2xl p-5 sm:p-7">
          <h2 className="text-xl sm:text-2xl font-bold mb-1 text-gray-900">Find the Perfect Car for Your Trip</h2>
          <p className="text-gray-500 text-xs sm:text-sm mb-5">Choose from our wide range of cars and book with ease.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-indigo-50/70 border border-indigo-100 p-4 rounded-xl">
              <h3 className="font-bold text-sm sm:text-base flex items-center gap-2 text-gray-900"> Smart Recommendation</h3>
              <p className="text-gray-500 mt-1 text-xs">Based on your selection, we recommend suitable cars.</p>
            </div>
            <div className="bg-indigo-50/70 border border-indigo-100 p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <FaUsers className="text-indigo-600 text-xl shrink-0" />
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-gray-900">Family Trip SUV</h3>
                  <p className="text-xs text-indigo-600 font-medium">Recommended</p>
                </div>
              </div>
            </div>
            <div className="bg-amber-50/70 border border-amber-100 p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <FaMoneyBill className="text-yellow-600 text-xl shrink-0" />
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-gray-900">Budget Travel</h3>
                  <p className="text-xs text-yellow-600 font-medium">Economy Car</p>
                </div>
              </div>
            </div>
            <div className="bg-purple-50/70 border border-purple-100 p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <FaCrown className="text-purple-600 text-xl shrink-0" />
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-gray-900">Luxury Travel</h3>
                  <p className="text-xs text-purple-600 font-medium">Premium Car</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= MAIN SECTION ================= */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-10 py-6 sm:py-10">

        {/* MOBILE FILTER TOGGLE BUTTON */}
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="lg:hidden w-full bg-white/95 backdrop-blur-xs border border-gray-200 shadow-sm px-4 py-3 rounded-xl flex items-center justify-between font-semibold text-gray-800 text-sm mb-6 cursor-pointer sticky top-[68px] z-30"
        >
          <span className="flex items-center gap-2">
            <FaFilter className="text-indigo-600" />
            <span>Filter Cars</span>
            {(carType || maxPrice || minPrice || capacity || onlyAvailable) && (
              <span className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">Active</span>
            )}
          </span>
          {showMobileFilters ? <FaChevronUp className="text-gray-400" /> : <FaChevronDown className="text-gray-400" />}
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* FILTER - STICKY */}
          <div className={`bg-white shadow-sm border border-gray-200 rounded-2xl p-5 lg:sticky lg:top-24 self-start max-h-[calc(100vh-7rem)] overflow-y-auto z-20 ${
            showMobileFilters ? "block mb-4 lg:mb-0" : "hidden lg:block"
          }`}>
            <div className="flex items-center justify-between mb-5 text-gray-900">
              <div className="flex items-center gap-2">
                <FaFilter className="text-indigo-600 text-sm" />
                <h2 className="text-lg font-bold">Filters</h2>
              </div>
              {(carType || maxPrice || minPrice || capacity || onlyAvailable) && (
                <button
                  onClick={() => {
                    setCarType("");
                    setMaxPrice("");
                    setMinPrice("");
                    setCapacity("");
                    setOnlyAvailable(false);
                    navigate("/cars");
                  }}
                  className="text-xs text-red-600 hover:underline font-semibold"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-600 block mb-1.5">Car Type</label>
              <select
                value={carType}
                onChange={(e) => setCarType(e.target.value)}
                className="w-full bg-white border border-gray-200 p-2.5 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Types</option>
                <option value="SUV">SUV</option>
                <option value="Sedan">Sedan</option>
                <option value="Luxury">Luxury</option>
                <option value="Economy">Economy</option>
                <option value="Family">Family</option>
              </select>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 lg:gap-0">
              <div className="mb-4">
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">Min Price (Rs.)</label>
                <input
                  type="number"
                  placeholder="e.g. 5000"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full bg-white border border-gray-200 p-2.5 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="mb-4">
                <label className="text-xs font-semibold text-gray-600 block mb-1.5">Max Price (Rs.)</label>
                <input
                  type="number"
                  placeholder="e.g. 25000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full bg-white border border-gray-200 p-2.5 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-600 block mb-1.5">Passenger Capacity</label>
              <select
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="w-full bg-white border border-gray-200 p-2.5 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Any Capacity</option>
                <option value="4">4 Seats</option>
                <option value="5">5 Seats</option>
                <option value="7">7 Seats</option>
                <option value="8">8 Seats</option>
              </select>
            </div>

            <div className="mb-5 flex items-center gap-2">
              <input
                type="checkbox"
                id="availOnly"
                checked={onlyAvailable}
                onChange={(e) => setOnlyAvailable(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
              />
              <label htmlFor="availOnly" className="text-xs font-semibold text-gray-700 cursor-pointer">
                Only Available Cars
              </label>
            </div>

            <button
              onClick={() => {
                setCarType("");
                setMaxPrice("");
                setMinPrice("");
                setCapacity("");
                setOnlyAvailable(false);
                navigate("/cars");
              }}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl text-xs font-semibold transition"
            >
              Reset Filters
            </button>
          </div>

          {/* CARS GRID */}
          <div className="lg:col-span-3">
            {filteredCars.length === 0 ? (
              <div className="bg-white shadow-sm border border-gray-200 rounded-2xl p-10 text-center">
                <FaCar className="text-4xl text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">No Cars Found</h3>
                <p className="text-gray-500 text-xs sm:text-sm mt-1">Try adjusting your filters or price range</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
                {filteredCars.map((car) => (
                  <div
                    key={car.id}
                    className="bg-white shadow-sm border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition duration-200 flex flex-col justify-between"
                  >
                    <div className="h-48 sm:h-52 w-full overflow-hidden bg-gray-100">
                      <img
                        src={getCarImage(car)}
                        alt={car.name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/images/Home-image.jpg";
                        }}
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center gap-2">
                          <h2 className="text-base sm:text-lg font-bold text-gray-900 truncate">{car.name}</h2>
                          <div className="flex items-center gap-1 text-yellow-500 text-xs font-semibold shrink-0">
                            <FaStar /> {car.rating || "4.5"}
                          </div>
                        </div>
                        <p className="text-indigo-600 text-xl font-bold mt-1">
                          Rs.{car.price}<span className="text-xs text-gray-400 font-normal">/day</span>
                        </p>
                        <div className="mt-3 text-xs text-gray-500 space-y-1">
                          <p>Type: <span className="font-medium text-gray-700">{car.type}</span></p>
                          <p className="flex items-center gap-1.5">
                            <FaUsers className="text-gray-400" /> Seats: <span className="font-medium text-gray-700">{car.seats || 4}</span>
                          </p>
                          <p>Fuel: <span className="font-medium text-gray-700">{car.fuelType || "Petrol"}</span></p>
                        </div>
                        <p
                          className={`mt-3 text-xs font-bold inline-block px-2.5 py-1 rounded-full ${
                            car.status === "Available"
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-red-600"
                          }`}
                        >
                          {car.status || "Available"}
                        </p>
                      </div>
                      <Link to={`/car/${car.id}`} className="mt-4">
                        <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl text-xs sm:text-sm transition shadow-sm">
                          View Details
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <Footer />
    </div>
  );
};

export default Cars;