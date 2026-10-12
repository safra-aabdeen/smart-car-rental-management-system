import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { FaCar, FaHome, FaPhone, FaInfoCircle, FaSearch, FaStar } from "react-icons/fa";
import homeImg from "../images/Home-image.jpg";
import localCars from "../data/Cars";

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
          carData.push({ id: doc.id,...doc.data() });
        });
        // Firebase la image iruntha atha use pannum, illa na local cars use pannum
        const sortedCars = carData.sort(
        (a, b) => Number(a.carId) - Number(b.carId)
        );

        // First 3 cars by carId order
        setFeaturedCars(
        sortedCars.length > 0
        ? sortedCars.slice(0, 3)
        : localCars.slice(0, 3));
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
    <div className="bg-gray-50 min-h-screen">

      {/* NAVBAR */}
      <nav className="bg-white shadow-md px-10 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <FaCar className="text-indigo-600 text-2xl" />
          <h1 className="text-2xl font-bold text-gray-900">CarRental</h1>
        </div>

        <ul className="hidden md:flex gap-8 text-gray-600 font-medium">
          <Link to="/" className="flex items-center gap-2 hover:text-indigo-600"><FaHome /> Home</Link>
          <Link to="/cars" className="flex items-center gap-2 hover:text-indigo-600"><FaCar /> Cars</Link>
          <Link to="/about" className="flex items-center gap-2 hover:text-indigo-600"><FaInfoCircle /> About</Link>
          <Link to="/contact" className="flex items-center gap-2 hover:text-indigo-600"><FaPhone /> Contact</Link>
        </ul>

        <div className="flex gap-4">
          <Link to="/login" className="text-indigo-600 text-xl font-semibold px-5 py-2 hover:text-indigo-500">Login</Link>
          <Link to="/register" className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:shadow-lg hover:shadow-indigo-500/25">Register</Link>
        </div>
      </nav>

      {/* HERO + SEARCH BAR */}
      <section className="relative h-[500px] bg-cover bg-center flex items-center" style={{ backgroundImage: `url(${homeImg})` }}>

        <div className="relative z-10 px-10 text-white w-full">
          <h1 className="text-5xl md:text-6xl font-bold">Find Your Perfect Ride</h1>
          <p className="mt-4 text-xl">Premium cars at affordable prices</p>

          <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 mt-10 shadow-lg grid md:grid-cols-5 gap-4">

            <input
              type="date"
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="bg-gray-50 border border-gray-300 p-3 rounded-xl text-gray-900 placeholder-gray-400 w-full"
            />

            <input
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              min={pickupDate || new Date().toISOString().split("T")[0]}
              className="bg-gray-50 border border-gray-300 p-3 rounded-xl text-gray-900 placeholder-gray-400 w-full"
            />

            <input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="bg-gray-50 border border-gray-300 p-3 rounded-xl text-gray-900 placeholder-gray-400 w-full"
            />

            <select
              value={carType}
              onChange={(e) => setCarType(e.target.value)}
              className="bg-gray-50 border border-gray-300 p-3 rounded-xl text-gray-900 placeholder-gray-400 w-full text-gray-500"
            >
              <option value="">Car Type</option>
              <option value="SUV">SUV</option>
              <option value="Sedan">Sedan</option>
              <option value="Luxury">Luxury</option>
              <option value="Economy">Economy</option>
              <option value="Family">Family</option>
            </select>

            <button
              onClick={handleSearch}
              className="bg-indigo-600 text-white rounded-lg flex items-center justify-center gap-3 hover:shadow-lg hover:shadow-indigo-500/25"
            >
              <FaSearch /> Search
            </button>

          </div>
        </div>
      </section>

      {/* FEATURED CARS - Images irukkum */}
      <section className="py-20 px-10 bg-gray-100">
        <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">Featured Cars</h2>

        {featuredCars.length === 0? (
          <p className="text-center text-gray-500">Loading cars...</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-10">
            {featuredCars.map((car) => (
              <div key={car.id} className="bg-white shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition">
                <img
                  src={car.image}
                  alt={car.name}
                  onClick={() => setPopupImg(car.image)}
                  className="h-60 w-full object-cover cursor-pointer transition-transform duration-300 hover:scale-110"
                />

                <div className="p-5">
                  <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-bold text-gray-900">{car.name}</h3>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <FaStar />{car.rating || "4.5"}
                    </div>
                  </div>

                  <p className="text-indigo-600 text-2xl font-bold mt-3">Rs.{car.price}/day</p>

                  <Link to={`/car/${car.id}`}>
                    <button className="w-full mt-5 bg-indigo-600 text-white py-3 rounded-lg hover:shadow-lg hover:shadow-indigo-500/25">
                      View Details
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* REVIEWS */}
      <section className="py-20 px-10 bg-gray-100">
        <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">What Our Customers Say</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {reviews.map((r, i) => (
            <div key={i} className="bg-white shadow-lg p-8 rounded-2xl">
              <div className="text-yellow-500 mb-4">⭐⭐⭐⭐⭐</div>
              <p className="text-gray-500">{r.text}</p>
              <h4 className="mt-5 font-bold text-gray-900">- {r.name}</h4>
            </div>
          ))}
        </div>
      </section>

      {/* POPUP IMAGE */}
      {popupImg && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setPopupImg(null)}>
          <img src={popupImg} className="max-w-4xl max-h- rounded-lg shadow-xl" alt="popup" />
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white py-12 px-10">
        <div className="grid md:grid-cols-3 gap-10">
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

        <div className="border-t border-gray-200 my-8"></div>

        <div className="text-center text-gray-400">
          © 2026 CarRental. All rights reserved.
        </div>
        
      </footer>

    </div>
  );
};

export default Home;