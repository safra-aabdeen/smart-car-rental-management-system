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
    <div className="flex min-h-screen bg-gray-50">
      
      {/* SIDEBAR */}
      <AdminSidebar />

      <main className="flex-1 p-8 overflow-auto">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Manage Cars</h1>
          <button
            onClick={() => { setShowModal(true); setEditingCar(null); }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg flex items-center gap-2 font-semibold"
          >
            <FaPlus /> Add New Car
          </button>
        </div>

        {/* TABLE */}
        <div className="bg-white shadow-lg border border-gray-200 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-gray-400">Loading...</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-300">
                <tr>
                  <th className="text-left p-4 text-gray-500 font-semibold">Image</th>
                  
                  <th className="text-left p-4 text-gray-500 font-semibold">Name</th>
                  <th className="text-left p-4 text-gray-500 font-semibold">Type</th>
                  <th className="text-left p-4 text-gray-500 font-semibold">Fuel</th>
                  <th className="text-left p-4 text-gray-500 font-semibold">Seats</th>
                  <th className="text-left p-4 text-gray-500 font-semibold">Price/Day</th>
                  <th className="text-left p-4 text-gray-500 font-semibold">Rating</th>
                  <th className="text-left p-4 text-gray-500 font-semibold">Status</th>
                  <th className="text-left p-4 text-gray-500 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cars.map(car => (
                  <tr key={car.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="p-4">
                      <img 
                        src={getCarImage(car)} 
                        alt={car.name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/images/Home-image.jpg";
                        }}
                        className="w-16 h-12 object-cover rounded-lg"
                      />
                    </td>
                  
                    <td className="p-4 font-semibold text-gray-900">{car.name}</td>
                    <td className="p-4 text-gray-500">{car.type}</td>
                    <td className="p-4 text-gray-500">
                      {car.fuelType || "Petrol"}
                    </td>
                    <td className="p-4 text-gray-500">{car.seats}</td>
                    <td className="p-4 text-indigo-600 font-semibold">Rs.{car.price}</td>
                    <td className="p-4 text-gray-600">{car.rating}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        car.status === "Available" 
                          ? "bg-green-100 text-green-700" 
                          : "bg-red-100 text-red-700"
                      }`}>
                        {car.status}
                      </span>
                    </td>
                    <td className="p-6 gap-3">
                      <div className="flex gap-4">
                      <button 
                        onClick={() => handleEdit(car)}
                        className="text-indigo-600 hover:text-indigo-500"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        onClick={() => handleDelete(car.id)}
                        className="text-red-600 hover:text-red-500"
                      >
                        <FaTrash />
                      </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* MODAL FOR ADD/EDIT */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white shadow-lg border border-gray-300 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {editingCar ? "Edit Car" : "Add New Car"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
          

              <input
                type="text"
                placeholder="Car Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none"
                required
              />
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none"
              >
                <option>Sedan</option>
                <option>SUV</option>
                <option>Economy</option>
                <option>Luxury</option>
                <option>Family</option>
              </select>

              <select
                value={formData.fuelType}
                onChange={(e) =>
                  setFormData({ ...formData, fuelType: e.target.value })
                }
                className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none"
              >
                <option>Petrol</option>
                <option>Diesel</option>
                <option>Hybrid</option>
              </select>

              <input
                type="number"
                placeholder="Number of Seats"
                value={formData.seats}
                onChange={(e) =>
                  setFormData({ ...formData, seats: e.target.value })
                }
                className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none"
                required
              />

              <input
                type="number"
                placeholder="Price per day"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none"
                required
              />
              <input
                type="number"
                step="0.1"
                placeholder="Rating"
                value={formData.rating}
                onChange={(e) => setFormData({...formData, rating: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none"
                required
              />

              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none"
              >
                <option>Available</option>
                <option>Unavailable</option>
              </select>
              <input
                type="text"
                placeholder="Image URL"
                value={formData.image}
                onChange={(e) => setFormData({...formData, image: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none"
                required
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold"
                >
                  {editingCar ? "Update" : "Add"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 border border-gray-300 hover:bg-gray-300 py-3 rounded-lg font-semibold"
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