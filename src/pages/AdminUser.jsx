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
    <div className="flex min-h-screen bg-gray-50">

      {/* SIDEBAR */}

            <AdminSidebar />

      <main className="flex-1 p-8">

        <h1 className="text-5xl font-bold text-gray-900 mb-8">
          Manage Users
        </h1>

        <div className="bg-white shadow-lg border border-gray-200 rounded-2xl overflow-hidden shadow">

          <table className="w-full">

            <thead className="bg-gray-100 border-b border-gray-300">

              <tr>

                <th className="p-4 text-left text-gray-500 font-semibold">
                  User ID
                </th>

                <th className="p-4 text-left text-gray-500 font-semibold">
                  Name
                </th>

                <th className="p-4 text-left text-gray-500 font-semibold">
                  Email
                </th>

                <th className="p-4 text-left text-gray-500 font-semibold">
                  Phone
                </th>

                <th className="p-4 text-left text-gray-500 font-semibold">
                  Bookings
                </th>

                <th className="p-4 text-left text-gray-500 font-semibold">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {users.map((user, index) => (

                <tr
                  key={user.id}
                  className="border-t border-gray-200 hover:bg-gray-50"
                >

                  <td className="p-4 text-gray-600">
                    {String(index + 1).padStart(3, "0")}
                  </td>

                  <td className="p-4 text-gray-600">

                    <div className="flex items-center gap-3">

                      <div className="bg-indigo-50 p-3 rounded-full">

                        <FaUserCircle className="text-indigo-600 text-xl"/>

                      </div>

                      <span className="font-semibold text-gray-900">
                        {user.name}
                      </span>

                    </div>

                  </td>

                  <td className="p-4 text-gray-600">
                    {user.email}
                  </td>

                  <td className="p-4 text-gray-600">
                    {user.phone}
                  </td>

                  <td className="p-4 text-gray-600">
                    {bookingCounts[user.id] || 0}
                  </td>

                  <td className="p-4 text-gray-600">

                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-red-600 hover:text-red-500"
                    >
                      <FaTrash />
                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </main>

    </div>
  );
};

export default AdminUsers;