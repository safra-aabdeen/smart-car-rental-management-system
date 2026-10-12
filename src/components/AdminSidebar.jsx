import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth } from "../firebase/firebase";
import { signOut } from "firebase/auth";
import {
  FaCar,
  FaUsers,
  FaChartBar,
  FaTachometerAlt,
  FaSignOutAlt,
  FaCalendarAlt,
  FaEnvelope,
  FaStar,
  FaUserTie,
  FaMoneyCheckAlt
} from "react-icons/fa";

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const menuItems = [
    { name: "Dashboard", icon: <FaTachometerAlt />, path: "/admin/dashboard" },
    { name: "Manage Cars", icon: <FaCar />, path: "/admin/cars" },
    { name: "Bookings", icon: <FaCalendarAlt />, path: "/admin/booking" },
    { name: "Users", icon: <FaUsers />, path: "/admin/user" },
    { name: "Drivers", icon: <FaUserTie />, path: "/admin/driver" },
    { name: "Messages", icon: <FaEnvelope />, path: "/admin/messages" },
    { name: "Reviews", icon: <FaStar />, path: "/admin/reviews" },
  ];

  return (
    <div className="w-72 bg-gray-900 border-r border-gray-700 text-white p-6 flex flex-col h-screen sticky top-0 shrink-0 overflow-y-auto overflow-x-hidden">
      <div className="flex-1">
        {/* LOGO */}
        <div className="flex items-center gap-3 mb-8">
          <FaCar className="text-3xl text-indigo-400 shrink-0" />
          <h1 className="text-2xl font-bold whitespace-nowrap">Admin Panel</h1>
        </div>

        {/* MENU */}
        <div className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`
                flex items-center gap-3 w-full p-3.5 rounded-xl transition font-medium
                ${
                  location.pathname === item.path || 
                  (location.pathname === "/admin/bookings" && item.path === "/admin/booking") ||
                  (location.pathname === "/admin/users" && item.path === "/admin/user")
                    ? "bg-indigo-500/20 text-indigo-400 border-l-2 border-indigo-400"
                    : "hover:bg-gray-800 text-gray-400 hover:text-white"
                }
              `}
            >
              <span className="text-lg">{item.icon}</span>
              {item.name}
            </button>
          ))}
        </div>
      </div>

      {/* ================= ADMIN PROFILE ================= */}
      <div className="border-t border-gray-700 pt-5 mt-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
               <span className="text-xl font-bold">A</span>
            </div>
            <div>
              <p className="font-bold text-lg">Admin</p>
              <p className="text-gray-400 text-sm">Administrator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center bg-gray-700 hover:bg-red-600 border border-gray-600 p-3 rounded-xl transition"
            title="Logout"
          >
            <FaSignOutAlt />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
