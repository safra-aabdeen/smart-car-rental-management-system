import React, { useState } from "react";
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
  FaMoneyCheckAlt,
  FaBars,
  FaTimes,
} from "react-icons/fa";

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

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

  const isActive = (itemPath) => {
    if (location.pathname === itemPath) return true;
    if (location.pathname === "/admin/bookings" && itemPath === "/admin/booking") return true;
    if (location.pathname === "/admin/users" && itemPath === "/admin/user") return true;
    return false;
  };

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1">
        {/* LOGO */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FaCar className="text-2xl text-indigo-400 shrink-0" />
            <h1 className="text-xl font-bold tracking-tight whitespace-nowrap">Admin Panel</h1>
          </div>
          {/* Close button for mobile drawer */}
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 text-gray-400 hover:text-white rounded-lg"
            aria-label="Close menu"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* MENU */}
        <nav className="space-y-1.5" aria-label="Admin Navigation">
          {menuItems.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.name}
                onClick={() => {
                  navigate(item.path);
                  setIsOpen(false);
                }}
                className={`
                  flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl transition text-sm font-medium text-left cursor-pointer
                  ${
                    active
                      ? "bg-indigo-600/20 text-indigo-400 border-l-3 border-indigo-500 font-semibold shadow-sm"
                      : "text-gray-400 hover:bg-gray-800 hover:text-gray-100"
                  }
                `}
              >
                <span className={`text-base shrink-0 ${active ? "text-indigo-400" : "text-gray-400"}`}>
                  {item.icon}
                </span>
                <span className="truncate">{item.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* ================= ADMIN PROFILE ================= */}
      <div className="border-t border-gray-800 pt-4 mt-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 bg-indigo-600 rounded-full flex items-center justify-center shrink-0 font-bold text-sm">
              A
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm truncate">Admin</p>
              <p className="text-gray-400 text-xs truncate">Administrator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2.5 bg-gray-800 hover:bg-red-600 text-gray-300 hover:text-white border border-gray-700 hover:border-red-500 rounded-xl transition shrink-0 cursor-pointer"
            title="Logout"
            aria-label="Logout"
          >
            <FaSignOutAlt className="text-sm" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* MOBILE TOP BAR (visible below lg) */}
      <header className="lg:hidden w-full bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between sticky top-0 z-40 shrink-0 text-white">
        <div className="flex items-center gap-2.5">
          <FaCar className="text-xl text-indigo-400" />
          <span className="font-bold text-base tracking-tight">Admin Panel</span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-gray-300 hover:text-white bg-gray-800 rounded-lg focus:outline-none transition"
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <FaTimes className="text-lg" /> : <FaBars className="text-lg" />}
        </button>
      </header>

      {/* MOBILE BACKDROP & DRAWER */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 lg:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-72 max-w-[80vw] bg-gray-900 text-white p-5 h-full overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <NavContent />
          </div>
        </div>
      )}

      {/* DESKTOP SIDEBAR (visible lg and up) */}
      <aside className="hidden lg:flex flex-col w-64 bg-gray-900 border-r border-gray-800 text-white p-5 h-screen sticky top-0 shrink-0 overflow-y-auto overflow-x-hidden">
        <NavContent />
      </aside>
    </>
  );
};

export default AdminSidebar;
