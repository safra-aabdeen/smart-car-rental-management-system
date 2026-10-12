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
    <div className="flex min-h-screen bg-gray-50">

      {/* ================= SIDEBAR ================= */}
      <AdminSidebar />

      <main className="flex-1 p-10 ml-2">

        <div className="flex justify-between mb-6">
          <h1 className="text-4xl font-bold text-gray-900">Manage Drivers</h1>

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
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg flex items-center gap-2"
          >
            <FaPlus /> Add Driver
          </button>
        </div>

        {/* TABLE */}
        <div className="bg-white shadow-lg border border-gray-200 rounded-2xl overflow-hidden mx-2">

          {loading ? (
            <div className="p-6 text-center text-gray-400">Loading...</div>
          ) : (
            <table className="w-full">

              <thead className="bg-gray-100 border-b border-gray-300">
                <tr>
                  <th className="p-4 text-gray-500 font-semibold">ID</th>
                  <th className="p-4 text-gray-500 font-semibold">Name</th>
                  <th className="p-4 text-gray-500 font-semibold">Email</th>
                  <th className="p-4 text-gray-500 font-semibold">Phone</th>
                  <th className="p-4 text-gray-500 font-semibold">License</th>
                  <th className="p-4 text-gray-500 font-semibold">Status</th>
                  <th className="p-4 text-gray-500 font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody>
                {drivers.map((d, i) => (
                  <tr key={d.id} className="border-t border-gray-200 hover:bg-gray-50">

                    <td className="p-4 text-gray-500 font-semibold"><div className="flex justify-center gap-4">
                      {String(i + 1).padStart(3, "0")}
                      </div>
                    </td>

                    <td className="p-4 font-semibold text-gray-900"><div className="flex justify-center gap-4">{d.name}</div></td>
                    <td className="p-4 text-gray-500 font-semibold"><div className="flex justify-center gap-4">{d.email}</div></td>
                    <td className="p-4 text-gray-500 font-semibold"><div className="flex justify-center gap-4">{d.phone}</div></td>
                    <td className="p-4 text-gray-500 font-semibold"><div className="flex justify-center gap-4">{d.licenseNo}</div></td>

                    <td className="p-4 text-gray-500 font-semibold">
                        <div className="flex justify-center gap-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            d.status === "Available"
                            ? "bg-green-100 text-green-700"
                            : d.status === "On Trip"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                        >
                        {(d.status === "Busy" || d.status === "Unavailable") ? "Unavailable" : d.status}
                      </span>
                      </div>
                    </td>

                    <td className="p-4 text-gray-500 font-semibold">
                        <div className="flex justify-center gap-4">

                            <button
                            onClick={() => handleEdit(d)}
                            className="text-indigo-600 hover:text-indigo-500"
                            >
                            <FaEdit />
                            </button>

                            <button
                            onClick={() => handleDelete(d.id)}
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

      {/* ================= MODAL ================= */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">

          <div className="bg-white shadow-lg border border-gray-300 p-6 rounded-xl w-[400px]">

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {editingDriver ? "Edit Driver" : "Add Driver"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3">

              <input
                className="w-full bg-white border border-gray-300 rounded-xl p-2 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none"
                placeholder="Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />

              <input
                className="w-full bg-white border border-gray-300 rounded-xl p-2 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none"
                placeholder="Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />

              <input
                className="w-full bg-white border border-gray-300 rounded-xl p-2 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none"
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                required
              />

              <input
                className="w-full bg-white border border-gray-300 rounded-xl p-2 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none"
                placeholder="License No"
                value={formData.licenseNo}
                onChange={(e) =>
                  setFormData({ ...formData, licenseNo: e.target.value })
                }
                required
              />

              <div className="flex gap-3 mt-4">

                <button className="bg-indigo-600 hover:bg-indigo-700 text-white flex-1 p-2 rounded">
                  {editingDriver ? "Update" : "Add"}
                </button>

                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-200 text-gray-700 border border-gray-300 hover:bg-gray-300 flex-1 p-2 rounded"
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