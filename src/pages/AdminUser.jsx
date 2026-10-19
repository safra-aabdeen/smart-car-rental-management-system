import AdminSidebar from "../components/AdminSidebar";
import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc
} from "firebase/firestore";

import { db, auth } from "../firebase/firebase";
import { signOut } from "firebase/auth";

import {
  FaCar,
  FaUsers,
  FaChartBar,
  FaTachometerAlt,
  FaCalendarAlt,
  FaSignOutAlt,
  FaMoneyCheckAlt,
  FaUserCircle,
  FaTrash,
  FaCalendarCheck,
  FaUserTie,
  FaEnvelope
} from "react-icons/fa";

import { useNavigate, useLocation } from "react-router-dom";

const AdminUsers = () => {

const [users, setUsers] = useState([]);
const [bookingCounts, setBookingCounts] = useState({});

  const navigate = useNavigate();
  const location = useLocation();

  const fetchUsers = async () => {

    const snapshot = await getDocs(
      collection(db, "users")
    );

    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    setUsers(data);
  };

  const fetchBookingCounts = async () => {

  const snapshot = await getDocs(
    collection(db, "bookings")
  );

  const counts = {};

  snapshot.docs.forEach((doc) => {
    const booking = doc.data();

    if (booking.userId) {
      counts[booking.userId] =
        (counts[booking.userId] || 0) + 1;
    }
  });

  setBookingCounts(counts);
};

  useEffect(() => {
  fetchUsers();
  fetchBookingCounts();
}, []);

  const handleDelete = async (id) => {

    if (window.confirm("Delete User?")) {

      await deleteDoc(
        doc(db, "users", id)
      );

      fetchUsers();
    }
  };

  const handleLogout = async () => {

    await signOut(auth);

    navigate("/");
  };

  const menuItems = [
    {
      name: "Dashboard",
      icon: <FaTachometerAlt />,
      path: "/admin/dashboard"
    },
    {
      name: "Manage Cars",
      icon: <FaCar />,
      path: "/admin/cars"
    },
    {
      name: "Bookings",
      icon: <FaCalendarAlt />,
      path: "/admin/bookings"
    },
    {
      name: "Users",
      icon: <FaUsers />,
      path: "/admin/users"
    },
    {
      name: "Drivers",
      icon: <FaChartBar />,
      path: "/admin/driver"
    }
  ];

  const totalUsers = users.length;

  const totalAdmins = users.filter(
    user => user.role === "admin"
  ).length;

  const totalCustomers = users.filter(
    user => user.role === "user"
  ).length;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen lg:h-screen lg:overflow-hidden bg-gray-50">
      {/* SIDEBAR */}
      <AdminSidebar />

      <main className="flex-1 min-w-0 lg:h-full lg:overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Manage Users
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            View registered customers and manage user accounts
          </p>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white shadow-xs border border-gray-200 p-4 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500">Total Users</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{totalUsers}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <FaUsers className="text-lg" />
            </div>
          </div>

          <div className="bg-white shadow-xs border border-gray-200 p-4 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500">Customers</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{totalCustomers}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <FaUserTie className="text-lg" />
            </div>
          </div>

          <div className="bg-white shadow-xs border border-gray-200 p-4 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500">Administrators</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{totalAdmins}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <FaUserCircle className="text-lg" />
            </div>
          </div>
        </div>

        {/* USERS TABLE */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <th className="px-4 py-3.5">#</th>
                  <th className="px-4 py-3.5">Name</th>
                  <th className="px-4 py-3.5">Email</th>
                  <th className="px-4 py-3.5">Phone</th>
                  <th className="px-4 py-3.5">Bookings</th>
                  <th className="px-4 py-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-sm text-gray-400">
                      No users registered yet.
                    </td>
                  </tr>
                ) : (
                  users.map((user, index) => (
                    <tr key={user.id} className="hover:bg-gray-50/80 transition">
                      <td className="px-4 py-3.5 text-xs text-gray-400 font-mono">
                        {String(index + 1).padStart(3, "0")}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 font-semibold text-xs">
                            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">
                              {user.name || "Unknown"}
                            </p>
                            {user.role === "admin" && (
                              <span className="text-[10px] uppercase font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                Admin
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap text-sm">
                        {user.email || "N/A"}
                      </td>

                      <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap text-sm">
                        {user.phone || "—"}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="bg-indigo-50 text-indigo-700 font-semibold text-xs px-2.5 py-1 rounded-full">
                          {bookingCounts[user.id] || 0}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                          title="Delete User"
                        >
                          <FaTrash className="text-sm" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminUsers;