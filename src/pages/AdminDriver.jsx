import AdminSidebar from "../components/AdminSidebar";
import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc
} from "firebase/firestore";

import { db, auth } from "../firebase/firebase";
import { signOut } from "firebase/auth";
import { useNavigate, useLocation } from "react-router-dom";

import {
  FaCar,
  FaUsers,
  FaTachometerAlt,
  FaSignOutAlt,
  FaMoneyCheckAlt,
  FaUserCircle,
  FaTrash,
  FaUserTie,
  FaPlus,
  FaEdit,
  FaCalendarCheck,
  FaEnvelope
} from "react-icons/fa";

const AdminDriver = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    licenseNo: "",
  });

  const navigate = useNavigate();
  const location = useLocation();

  const driversCollection = collection(db, "drivers");

  /* ================= FETCH DRIVERS ================= */
  const fetchDrivers = async () => {
    setLoading(true);
    const snapshot = await getDocs(driversCollection);

    const data = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data()
    }));

    setDrivers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  /* ================= ADD / UPDATE ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingDriver) {
        const driverRef = doc(db, "drivers", editingDriver.id);

        await updateDoc(driverRef, {
          ...formData
        });
      } else {
        await addDoc(driversCollection, formData);
      }

      setShowModal(false);
      setEditingDriver(null);

      setFormData({
        name: "",
        email: "",
        phone: "",
        licenseNo: "",
      });

      fetchDrivers();
    } catch (err) {
      console.log(err);
      alert(err.message);
    }
  };

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    if (window.confirm("Delete this driver?")) {
      await deleteDoc(doc(db, "drivers", id));
      fetchDrivers();
    }
  };

  /* ================= EDIT ================= */
const handleEdit = (driver) => {
    setEditingDriver(driver);

    setFormData({
        name: driver.name,
        email: driver.email,
        phone: driver.phone,
        licenseNo: driver.licenseNo
    });

    setShowModal(true);
};

  /* ================= LOGOUT ================= */
  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50 overflow-x-hidden">
      {/* ================= SIDEBAR ================= */}
      <AdminSidebar />

      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Manage Drivers</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Register and manage private drivers for customer bookings</p>
          </div>

          <button
            onClick={() => {
              setShowModal(true);
              setEditingDriver(null);
              setFormData({
                name: "",
                email: "",
                phone: "",
                licenseNo: "",
                status: "Available"
              });
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold shadow-xs transition w-fit cursor-pointer"
          >
            <FaPlus className="text-xs" /> Add Driver
          </button>
        </div>

        {/* TABLE */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-sm text-gray-400">Loading drivers...</div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[750px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    <th className="px-4 py-3.5">ID</th>
                    <th className="px-4 py-3.5">Name</th>
                    <th className="px-4 py-3.5">Email</th>
                    <th className="px-4 py-3.5">Phone</th>
                    <th className="px-4 py-3.5">License</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 text-center">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 text-sm">
                  {drivers.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-sm text-gray-400">
                        No drivers added yet. Click &quot;Add Driver&quot; to register one.
                      </td>
                    </tr>
                  ) : (
                    drivers.map((d, i) => (
                      <tr key={d.id} className="hover:bg-gray-50/80 transition">
                        <td className="px-4 py-3.5 text-xs text-gray-400 font-mono">
                          {String(i + 1).padStart(3, "0")}
                        </td>

                        <td className="px-4 py-3.5 font-semibold text-gray-900 whitespace-nowrap">
                          {d.name}
                        </td>
                        <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap text-sm">
                          {d.email}
                        </td>
                        <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap text-sm">
                          {d.phone}
                        </td>
                        <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap text-sm font-mono text-xs">
                          {d.licenseNo}
                        </td>

                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              d.status === "Available"
                                ? "bg-emerald-100 text-emerald-700"
                                : d.status === "On Trip"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {(d.status === "Busy" || d.status === "Unavailable") ? "Unavailable" : d.status}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-3">
                            <button
                              onClick={() => handleEdit(d)}
                              className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition"
                              title="Edit Driver"
                            >
                              <FaEdit />
                            </button>

                            <button
                              onClick={() => handleDelete(d.id)}
                              className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                              title="Delete Driver"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* ================= MODAL ================= */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white shadow-xl border border-gray-200 p-5 sm:p-6 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
              {editingDriver ? "Edit Driver" : "Add Driver"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Driver Name</label>
                <input
                  className="w-full bg-white border border-gray-300 rounded-xl p-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  placeholder="e.g. Senerathna"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Email Address</label>
                <input
                  type="email"
                  className="w-full bg-white border border-gray-300 rounded-xl p-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  placeholder="e.g. driver@carrental.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Phone Number</label>
                <input
                  type="tel"
                  className="w-full bg-white border border-gray-300 rounded-xl p-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  placeholder="e.g. +94 77 123 4567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">License Number</label>
                <input
                  className="w-full bg-white border border-gray-300 rounded-xl p-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  placeholder="e.g. B1234567"
                  value={formData.licenseNo}
                  onChange={(e) => setFormData({ ...formData, licenseNo: e.target.value })}
                  required
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white flex-1 py-2.5 rounded-xl font-semibold text-sm shadow-xs transition"
                >
                  {editingDriver ? "Update Driver" : "Add Driver"}
                </button>

                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200 flex-1 py-2.5 rounded-xl font-semibold text-sm transition"
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

export default AdminDriver;