import React from "react";
import { Link } from "react-router-dom";
import { FaCar, FaFacebookF, FaTwitter, FaInstagram, FaEnvelope, FaPhoneAlt, FaMapMarkerAlt } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-10 sm:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FaCar className="text-indigo-400 text-2xl" />
              <span className="text-xl font-bold tracking-tight">CarRental</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your trusted partner for car rentals. Quality vehicles at affordable prices with 24/7 dedicated customer support.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-base font-bold mb-3 sm:mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link to="/" className="hover:text-indigo-400 transition">Home</Link>
              </li>
              <li>
                <Link to="/cars" className="hover:text-indigo-400 transition">Browse Cars</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-indigo-400 transition">About Us</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-indigo-400 transition">Contact Us</Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-base font-bold mb-3 sm:mb-4 text-white">Contact Info</h3>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li className="flex items-center gap-2.5">
                <FaEnvelope className="text-indigo-400 shrink-0 text-xs" />
                <span className="truncate">info@carrental.com</span>
              </li>
              <li className="flex items-center gap-2.5">
                <FaPhoneAlt className="text-indigo-400 shrink-0 text-xs" />
                <span>+94 77 123 4567</span>
              </li>
              <li className="flex items-center gap-2.5">
                <FaMapMarkerAlt className="text-indigo-400 shrink-0 text-xs" />
                <span>Colombo, Sri Lanka</span>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-base font-bold mb-3 sm:mb-4 text-white">Follow Us</h3>
            <p className="text-gray-400 text-sm mb-4">Stay updated with our latest offers & discounts.</p>
            <div className="flex gap-3">
              <a
                href="#"
                aria-label="Facebook"
                className="w-9 h-9 rounded-full bg-gray-800 hover:bg-indigo-600 text-gray-300 hover:text-white flex items-center justify-center transition"
              >
                <FaFacebookF className="text-sm" />
              </a>
              <a
                href="#"
                aria-label="Twitter"
                className="w-9 h-9 rounded-full bg-gray-800 hover:bg-indigo-600 text-gray-300 hover:text-white flex items-center justify-center transition"
              >
                <FaTwitter className="text-sm" />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full bg-gray-800 hover:bg-indigo-600 text-gray-300 hover:text-white flex items-center justify-center transition"
              >
                <FaInstagram className="text-sm" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 my-8"></div>

        <div className="text-center text-xs sm:text-sm text-gray-500">
          © {new Date().getFullYear()} CarRental. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
