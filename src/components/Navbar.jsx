import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaCar,
  FaHome,
  FaPhone,
  FaInfoCircle,
  FaSignOutAlt,
  FaUser,
  FaBars,
  FaTimes,
  FaTachometerAlt
} from "react-icons/fa";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";

const Navbar = ({ active = "" }) => {
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserName(data.name || data.userName || currentUser.email);
          } else {
            setUserName(currentUser.email);
          }
        } catch {
          setUserName(currentUser.email);
        }
      } else {
        setUser(null);
        setUserName("");
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setMobileMenuOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const navLinks = [
    { name: "Home", path: "/", icon: FaHome },
    { name: "Cars", path: "/cars", icon: FaCar },
    { name: "About", path: "/about", icon: FaInfoCircle },
    { name: "Contact", path: "/contact", icon: FaPhone },
  ];

  const isActive = (path) => {
    if (active) return active.toLowerCase() === path.replace("/", "").toLowerCase();
    if (path === "/" && (location.pathname === "/" || location.pathname === "/home")) return true;
    return location.pathname.startsWith(path) && path !== "/";
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-3 sm:py-4 flex justify-between items-center">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
          <FaCar className="text-indigo-600 text-2xl sm:text-3xl" />
          <span className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">CarRental</span>
        </Link>

        {/* Desktop Links */}
        <ul className="hidden md:flex items-center gap-6 lg:gap-8 text-gray-600 font-medium text-sm lg:text-base">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const activeLink = isActive(link.path);
            return (
              <li key={link.name}>
                <Link
                  to={link.path}
                  className={`flex items-center gap-2 py-1 transition ${
                    activeLink
                      ? "text-indigo-600 font-semibold"
                      : "hover:text-indigo-600"
                  }`}
                >
                  <Icon className={activeLink ? "text-indigo-600" : "text-gray-400"} />
                  {link.name}
                </Link>
              </li>
            );
          })}
          {user && (
            <li>
              <Link
                to={user.email === "admin@gmail.com" ? "/admin/dashboard" : "/dashboard"}
                className={`flex items-center gap-2 py-1 transition ${
                  location.pathname.includes("dashboard")
                    ? "text-indigo-600 font-semibold"
                    : "hover:text-indigo-600"
                }`}
              >
                <FaTachometerAlt className={location.pathname.includes("dashboard") ? "text-indigo-600" : "text-gray-400"} />
                Dashboard
              </Link>
            </li>
          )}
        </ul>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3 lg:gap-4">
          {user ? (
            <>
              <Link
                to={user.email === "admin@gmail.com" ? "/admin/dashboard" : "/dashboard"}
                className="flex items-center gap-2 text-gray-700 font-semibold text-sm hover:text-indigo-600 transition"
              >
                <FaUser className="text-indigo-600 text-xs" />
                <span className="max-w-[140px] truncate">{userName}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="bg-gray-700 hover:bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition"
              >
                <FaSignOutAlt className="text-xs" /> Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-indigo-600 hover:text-indigo-700 text-sm font-semibold px-4 py-2 transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-sm transition"
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          {user && (
            <Link
              to={user.email === "admin@gmail.com" ? "/admin/dashboard" : "/dashboard"}
              className="text-indigo-600 p-2 text-base hover:bg-gray-100 rounded-lg"
              title="Dashboard"
            >
              <FaUser />
            </Link>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-gray-700 hover:text-indigo-600 hover:bg-gray-100 rounded-lg transition"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pt-3 pb-5 shadow-lg animate-fade-in">
          <ul className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const activeLink = isActive(link.path);
              return (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-medium transition ${
                      activeLink
                        ? "bg-indigo-50 text-indigo-600 font-semibold"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className={activeLink ? "text-indigo-600" : "text-gray-400"} />
                    {link.name}
                  </Link>
                </li>
              );
            })}
            {user && (
              <li>
                <Link
                  to={user.email === "admin@gmail.com" ? "/admin/dashboard" : "/dashboard"}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-medium transition ${
                    location.pathname.includes("dashboard")
                      ? "bg-indigo-50 text-indigo-600 font-semibold"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <FaTachometerAlt className={location.pathname.includes("dashboard") ? "text-indigo-600" : "text-gray-400"} />
                  Dashboard
                </Link>
              </li>
            )}
          </ul>

          <div className="mt-4 pt-4 border-t border-gray-100">
            {user ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 px-3 text-sm text-gray-600">
                  <FaUser className="text-indigo-600 text-xs" />
                  <span className="font-semibold text-gray-800 truncate">{userName}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm transition"
                >
                  <FaSignOutAlt className="text-xs" /> Logout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 border border-indigo-600 text-indigo-600 font-semibold rounded-xl text-sm hover:bg-indigo-50 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
