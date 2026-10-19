import AdminSidebar from "../components/AdminSidebar";
import React, { useEffect, useState } from "react";
import { db } from "../firebase/firebase";

import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  setDoc
} from "firebase/firestore";
import { 
  FaCar, 
  FaTachometerAlt, 
  FaCalendarAlt, 
  FaUsers, 
  FaChartBar, 
  FaSignOutAlt,
  FaMoneyCheckAlt, 
  FaEdit, 
  FaTrash, 
  FaPlus, 
  FaUserCircle,
  FaCalendarCheck,
  FaUserTie,
  FaEnvelope  
} from "react-icons/fa";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";
import getCarImage from "../utils/carImage";

const AdminManageCars = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [formData, setFormData] = useState({
  name: "",
  type: "Sedan",
  fuelType: "Petrol",
  seats: "",
  price: "",
  rating: "",
  status: "Available",
  image: ""
});
  const navigate = useNavigate();

  const carsCollection = collection(db, "cars");

  // Fetch cars
  const fetchCars = async () => {
    setLoading(true);
    const data = await getDocs(carsCollection);
    setCars(data.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a, b) => a.carId - b.carId));
    setLoading(false);
  };

  useEffect(() => {
    fetchCars();
  }, []);

  // Add / Update car
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCar) {
        const carDoc = doc(db, "cars", editingCar.id);
        await updateDoc(carDoc, {
          ...formData,
          seats: Number(formData.seats),
          price: Number(formData.price),
          rating: Number(formData.rating)
        });
      } else {

      // ADD NEW CAR (AUTO FIRESTORE ID)

      const docRef = await addDoc(
        collection(db, "cars"),
        {
          ...formData,
          seats: Number(formData.seats),
          price: Number(formData.price),
          rating: Number(formData.rating)
        }
      );

      // Save auto ID inside carId field
      await updateDoc(
        doc(db, "cars", docRef.id),
        {
          carId: docRef.id
        }
      );

    }

      setShowModal(false);
      setEditingCar(null);
      setFormData({ 
          name: "", 
          type: "Sedan",
          fuelType: "Petrol",
          seats: "",
          price: "", 
          rating: "", 
          status: "Available", 
          image: "" 
        });

        setEditingCar(null);
        setShowModal(false);
      fetchCars();
    } catch (error) {

    console.log("FULL ERROR:", error);

    alert(error.message);

  }
  };

  // Delete car
  const handleDelete = async (id) => {
    if (window.confirm("Delete this car?")) {
      await deleteDoc(doc(db, "cars", id));
      fetchCars();
    }
  };

  // Edit car
  const handleEdit = (car) => {
    setEditingCar(car);
    setFormData(car);
    setShowModal(true);
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const menuItems = [
  { name: "Dashboard", icon: <FaTachometerAlt />, path: "/admin/dashboard" },
  { name: "Manage Cars", icon: <FaCar />, path: "/admin/cars" },
  { name: "Bookings", icon: <FaCalendarAlt />, path: "/admin/bookings" },
  { name: "Users", icon: <FaUsers />, path: "/admin/users" },
  { name: "Drivers", icon: <FaChartBar />, path: "/admin/driver" }
];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen lg:h-screen lg:overflow-hidden bg-gray-50">
      {/* SIDEBAR */}
      <AdminSidebar />

      <main className="flex-1 min-w-0 lg:h-full lg:overflow-y-auto p-4 sm:p-6 lg:p-8">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Manage Cars</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Add, update, or remove vehicles in your fleet</p>
          </div>
          <button
            onClick={() => { setShowModal(true); setEditingCar(null); }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold shadow-xs transition w-fit cursor-pointer"
          >
            <FaPlus className="text-xs" /> Add New Car
          </button>
        </div>

        {/* TABLE */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-sm text-gray-400">Loading cars...</div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[780px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    <th className="px-4 py-3.5">Image</th>
                    <th className="px-4 py-3.5">Name</th>
                    <th className="px-4 py-3.5">Type</th>
                    <th className="px-4 py-3.5">Fuel</th>
                    <th className="px-4 py-3.5">Seats</th>
                    <th className="px-4 py-3.5">Price/Day</th>
                    <th className="px-4 py-3.5">Rating</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-sm">
                  {cars.map((car) => (
                    <tr key={car.id} className="hover:bg-gray-50/80 transition">
                      <td className="px-4 py-3">
                        <img 
                          src={getCarImage(car)} 
                          alt={car.name}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/images/Home-image.jpg";
                          }}
                          className="w-12 h-10 object-cover rounded-lg shadow-xs"
                        />
                      </td>
                    
                      <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">{car.name}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{car.type}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{car.fuelType || "Petrol"}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{car.seats}</td>
                      <td className="px-4 py-3 font-bold text-indigo-600 whitespace-nowrap">Rs.{Number(car.price || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">★ {car.rating}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          car.status === "Available" 
                            ? "bg-emerald-100 text-emerald-700" 
                            : "bg-red-100 text-red-700"
                        }`}>
                          {car.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-3">
                          <button 
                            onClick={() => handleEdit(car)}
                            className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition"
                            title="Edit Car"
                          >
                            <FaEdit />
                          </button>
                          <button 
                            onClick={() => handleDelete(car.id)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                            title="Delete Car"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* MODAL FOR ADD/EDIT (FITS ALL SCREEN SIZES) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white shadow-xl border border-gray-200 rounded-2xl p-5 sm:p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
              {editingCar ? "Edit Car" : "Add New Car"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Car Name</label>
                <input
                  type="text"
                  placeholder="e.g. Honda Civic"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-xl p-2.5 text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Car Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-xl p-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  >
                    <option>Sedan</option>
                    <option>SUV</option>
                    <option>Economy</option>
                    <option>Luxury</option>
                    <option>Family</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Fuel Type</label>
                  <select
                    value={formData.fuelType}
                    onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-xl p-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  >
                    <option>Petrol</option>
                    <option>Diesel</option>
                    <option>Hybrid</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Seats</label>
                  <input
                    type="number"
                    placeholder="e.g. 5"
                    value={formData.seats}
                    onChange={(e) => setFormData({ ...formData, seats: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-xl p-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Price per Day (Rs.)</label>
                  <input
                    type="number"
                    placeholder="e.g. 7500"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-xl p-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Rating</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 4.8"
                    value={formData.rating}
                    onChange={(e) => setFormData({...formData, rating: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-xl p-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-xl p-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  >
                    <option>Available</option>
                    <option>Unavailable</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Image URL or Filename</label>
                <input
                  type="text"
                  placeholder="e.g. /images/Honda-FitzBE.jpg or https://..."
                  value={formData.image}
                  onChange={(e) => setFormData({...formData, image: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-xl p-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  required
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-semibold text-sm shadow-xs transition"
                >
                  {editingCar ? "Update Car" : "Add Car"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 py-2.5 rounded-xl font-semibold text-sm transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManageCars;