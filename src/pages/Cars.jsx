import React, { useEffect, useState } from "react";
import {
  FaCar, FaHome, FaPhone, FaInfoCircle, FaFilter, FaStar,
  FaUsers, FaCrown, FaMoneyBill, FaSignOutAlt,
} from "react-icons/fa";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../firebase/firebase";
import localCars from "../data/Cars";
import getCarImage from "../utils/carImage";

const Cars = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [userName, setUserName] = useState("");
  const [cars, setCars] = useState([]); // ✅ state add panniten
  const [carType, setCarType] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [capacity, setCapacity] = useState("");
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  /* ================= LOGIN USER ================= */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          setUserName(docSnap.exists()? docSnap.data().userName || user.email : user.email);
        } catch (error) {
          console.log(error);
          setUserName(user.email);
        }
      } else {
        setUserName("");
      }
    });
    return () => unsubscribe();
  }, []);

  /* ================= READ SEARCH PARAMS FROM HOME ================= */
  useEffect(() => {
    const typeParam = searchParams.get("type");
    const locationParam = searchParams.get("location");
    const capacityParam = searchParams.get("capacity");

    if (typeParam) setCarType(typeParam);
    if (capacityParam) setCapacity(capacityParam);

    // Location filter vena na unoda cars la 'location' field irukkanum
    // if (locationParam) setLocation(locationParam);
  }, [searchParams]);

  /* ================= LOGOUT ================= */
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  /* ================= FIREBASE FETCH ================= */
  useEffect(() => {
    const fetchCars = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "cars"));
        const carData = [];
        querySnapshot.forEach((doc) => {
          carData.push({ id: doc.id,...doc.data() });
        });
        const sortedCars = carData.sort(
       (a, b) => Number(a.carId) - Number(b.carId)
        );
        setCars(carData);
      } catch (error) {
        console.log("Firebase error, using local data:", error);
        setCars(localCars); // fallback
      }
    };
    fetchCars();
  }, []);

  const allCars = cars.length > 0? cars : localCars;

  /* ================= FILTER ================= */
const filteredCars = allCars.filter((car) => {
  const matchesType = !carType || car.type === carType;

  const price = Number(car.price || 0);
  const seats = Number(car.seats || 0);

  const matchesMaxPrice =
    !maxPrice || price <= Number(maxPrice);

  const matchesMinPrice =
    !minPrice || price >= Number(minPrice);

  const matchesCapacity =
    !capacity || seats === Number(capacity);

  const matchesAvailability =
    !onlyAvailable || car.status === "Available";

  return (
    matchesType &&
    matchesMaxPrice &&
    matchesMinPrice &&
    matchesCapacity &&
    matchesAvailability
  );
});

  return (
    <div className="bg-gray-50 max-h-screen">

      {/* ================= NAVBAR ================= */}
      <nav className="bg-white shadow-md px-10 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <FaCar className="text-indigo-600 text-3xl" />
          <h1 className="text-3xl font-bold text-gray-900">CarRental</h1>
        </div>

        <ul className="hidden md:flex gap-10 text-gray-700 text-lg items-center">
          <Link to="/" className="flex items-center gap-2 hover:text-indigo-600"><FaHome /> Home</Link>
          <Link to="/cars" className="flex items-center gap-2 text-indigo-600 font-semibold"><FaCar /> Cars</Link>
          <Link to="/about" className="flex items-center gap-2 hover:text-indigo-600"><FaInfoCircle /> About</Link>
          <Link to="/contact" className="flex items-center gap-2 hover:text-indigo-600"><FaPhone /> Contact</Link>
        </ul>

        <div className="flex items-center gap-5">
          {userName? (
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

      {/* ================= PAGE TITLE ================= */}
      <div className="px-10 pt-10">
        <h1 className="text-5xl font-bold text-gray-900">Available Cars</h1>
        {(carType || maxPrice || minPrice || capacity) && (
          <p className="text-gray-500 mt-2">Filters applied from search</p>
        )}
      </div>

      {/* ================= SMART RECOMMENDATION ================= */}
      <section className="px-10 mt-10">
        <div className="bg-white shadow-lg rounded-2xl p-8">
          <h2 className="text-3xl font-bold mb-3 text-gray-900">Find the Perfect Car for Your Trip</h2>
          <p className="text-gray-500 mb-8">Choose from our wide range of cars and book with ease.</p>
          <div className="grid md:grid-cols-4 gap-5">
            <div className="bg-indigo-50 border border-indigo-200 p-5 rounded-2xl">
              <h3 className="font-bold text-lg flex items-center gap-2 text-gray-900"> Smart Recommendation</h3>
              <p className="text-gray-500 mt-2 text-sm">Based on your selection, we recommend suitable cars.</p>
            </div>
            <div className="bg-indigo-50 border border-indigo-200 p-5 rounded-2xl">
              <div className="flex items-center gap-3">
                <FaUsers className="text-indigo-600 text-2xl" />
                <div><h3 className="font-bold text-gray-900">Family Trip SUV</h3><p className="text-sm text-indigo-600">Recommended</p></div>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl">
              <div className="flex items-center gap-3">
                <FaMoneyBill className="text-yellow-600 text-2xl" />
                <div><h3 className="font-bold text-gray-900">Budget Travel</h3><p className="text-sm text-yellow-600">Economy Car</p></div>
              </div>
            </div>
            <div className="bg-purple-50 border border-purple-200 p-5 rounded-2xl">
              <div className="flex items-center gap-3">
                <FaCrown className="text-purple-600 text-2xl" />
                <div><h3 className="font-bold text-gray-900">Luxury Travel</h3><p className="text-sm text-purple-600">Premium Car</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= MAIN SECTION ================= */}
      <div className="grid md:grid-cols-4 gap-8 px-10 py-10 items-start">

        {/* FILTER - STICKY */}
        <div className="bg-white shadow-lg rounded-2xl p-6 sticky top-24 h-fit">
          <div className="flex items-center gap-2 mb-6 text-gray-900">
            <FaFilter />
            <h2 className="text-2xl font-bold">Filters</h2>
          </div>

          <div className="mb-5">
            <label className="font-semibold text-gray-600 block mb-2">Car Type</label>
            <select value={carType} onChange={(e) => setCarType(e.target.value)} className="w-full bg-white border border-gray-300 p-3 rounded-xl text-gray-900">
              <option value="">All Types</option>
              <option value="SUV">SUV</option>
              <option value="Sedan">Sedan</option>
              <option value="Luxury">Luxury</option>
              <option value="Economy">Economy</option>
              <option value="Family">Family</option>
            </select>
          </div>

          <div className="mb-5">
            <label className="font-semibold text-gray-600 block mb-2">Max Price</label>
            <input type="number" placeholder="0" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="w-full bg-white border border-gray-300 p-3 rounded-xl text-gray-900" />
          </div>

          <div className="mb-5">
            <label className="font-semibold text-gray-600 block mb-2">Min Price</label>
            <input type="number" placeholder="200" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="w-full bg-white border border-gray-300 p-3 rounded-xl text-gray-900" />
          </div>

          <div className="mb-5">
            <label className="font-semibold text-gray-600 block mb-2">Passenger Capacity</label>
            <select value={capacity} onChange={(e) => setCapacity(e.target.value)} className="w-full bg-white border border-gray-300 p-3 rounded-xl text-gray-900">
              <option value="">Select Seats</option>
              <option value="4">4 Seats</option>
              <option value="5">5 Seats</option>
              <option value="7">7 Seats</option>
              <option value="8">8 Seats</option>
            </select>
          </div>

          <div className="mb-5 flex items-center gap-2">
            <input
              type="checkbox"
              checked={onlyAvailable}
              onChange={(e) => setOnlyAvailable(e.target.checked)}
              className="w-4 h-4"
            />
             <label className="font-semibold text-gray-600">Only Available Cars</label>
          </div>

          <button
            onClick={() => {
              setCarType("");
              setMaxPrice("");
              setMinPrice("");
              setCapacity("");
              setOnlyAvailable(false);
              navigate("/cars"); // URL la irunthu params ah remove pannum
            }}
            className="w-full bg-indigo-600 hover:bg-red-600 text-white py-3 rounded-lg mt-4"
          >
            Reset Filters
          </button>
        </div>

        {/* CARDS - SCROLL ONLY THIS */}
        <div className="md:col-span-3">
          {filteredCars.length === 0? (
            <div className="bg-white shadow-lg rounded-2xl p-10 text-center">
              <h3 className="text-2xl font-bold text-gray-900">No Cars Found</h3>
              <p className="text-gray-500 mt-2">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {filteredCars.map((car) => (
                <div key={car.id} className="bg-white shadow-lg rounded-2xl overflow-hidden hover:shadow-xl hover:border-gray-300 transition duration-300 hover:-translate-y-2">
                  <img
                    src={getCarImage(car)}
                    alt={car.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/images/Home-image.jpg";
                    }}
                    className="h-56 w-full object-cover"
                  />
                  <div className="p-5">
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-bold text-gray-900">{car.name}</h2>
                      <div className="flex items-center gap-1 text-yellow-500"><FaStar /> {car.rating}</div>
                    </div>
                    <p className="text-indigo-600 text-3xl font-bold mt-2">Rs.{car.price}/day</p>
                    <div className="mt-4 text-gray-500 space-y-1">
                    <p>Type: {car.type}</p>

                     <p className="flex items-center gap-2">
                     <FaUsers /> Seats: {car.seats || 4}
                     </p>

                    <p>Fuel: {car.fuelType || "Petrol"}</p>
                    </div>

                    <p
                     className={`mt-4 font-bold ${
                      car.status === "Available"
                     ? "text-green-600"
                        : "text-red-600"
                       }`}
                    >
                    {car.status || "Available"}
                    </p>
                    <Link to={`/car/${car.id}`}>
                      <button className="w-full mt-5 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700">
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

      {/* FOOTER */}
      <footer className="bg-gray-900 border-t border-gray-200 text-white py-12 px-10">
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
        <div className="border-t border-gray-300 my-8"></div>
        <div className="text-center text-gray-400">
          © 2026 CarRental. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Cars;