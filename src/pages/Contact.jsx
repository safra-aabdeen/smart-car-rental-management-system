// Contact.jsx

import React, { useState, useEffect } from "react";

import {
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaPaperPlane,
  FaCar,
  FaHome,
  FaInfoCircle,
  FaSignOutAlt,
} from "react-icons/fa";

import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";

import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import { Link, useNavigate } from "react-router-dom";

import { db, auth } from "../firebase/firebase";

const Contact = () => {

  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [userName, setUserName] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  /* ================= USER LOGIN ================= */

  useEffect(() => {

    const unsubscribe = onAuthStateChanged(auth, async (user) => {

      if (user) {
        setUser(user);

        try {

          const docRef = doc(db, "users", user.uid);

          const docSnap = await getDoc(docRef);

          setUserName(
            docSnap.exists()
              ? docSnap.data().userName || user.email
              : user.email
          );

        } catch (error) {

          console.log(error);

          setUserName(user.email);

        }

      } else {

        setUserName("");

      }

    });

    return () => unsubscribe();

  }, []);

  /* ================= LOGOUT ================= */

  const handleLogout = async () => {

    try {

      await signOut(auth);

      navigate("/");

    } catch (error) {

      console.log(error);

    }

  };

  /* ================= INPUT CHANGE ================= */

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

  };

  /* ================= SEND MESSAGE ================= */

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!user) {
       alert("Please login first to send message");
       navigate("/login");
       return;
    }

    if (
      !formData.name ||
      !formData.email ||
      !formData.message
    ) {
      alert("Please fill all fields");
      return;
    }

    try {

      setLoading(true);

      await addDoc(collection(db, "contactMessages"), {
        ...formData,
        userId: user.uid,
        createdAt: serverTimestamp(),
      });

      alert("Message Sent Successfully!");

      setFormData({
        name: "",
        email: "",
        message: "",
      });

      setLoading(false);

    } catch (error) {

      console.log(error);

      alert("Error sending message");

      setLoading(false);

    }

  };

  return (

    <div className="bg-gray-50 min-h-screen">

      {/* ================= NAVBAR ================= */}

      <nav className="bg-white shadow-md px-10 py-4 flex justify-between items-center">

        <div className="flex items-center gap-2">

          <FaCar className="text-indigo-600 text-3xl" />

          <h1 className="text-3xl font-bold text-gray-900">
            CarRental
          </h1>

        </div>

        <ul className="hidden md:flex gap-10 text-gray-600 text-lg items-center">

          <Link
            to="/"
            className="flex items-center gap-2 hover:text-indigo-600"
          >
            <FaHome />
            Home
          </Link>

          <Link
            to="/cars"
            className="flex items-center gap-2 hover:text-indigo-600"
          >
            <FaCar />
            Cars
          </Link>

          <Link
            to="/about"
            className="flex items-center gap-2 hover:text-indigo-600"
          >
            <FaInfoCircle />
            About
          </Link>

          <Link
            to="/contact"
            className="flex items-center gap-2 text-indigo-600 font-semibold"
          >
            <FaPhoneAlt />
            Contact
          </Link>

        </ul>

        <div className="flex items-center gap-5">

          {userName ? (
            <>

              <button
                onClick={handleLogout}
                className="bg-gray-700 hover:bg-red-600 text-white px-5 py-2 rounded-lg flex items-center gap-2"
              >
                <FaSignOutAlt />
                Logout
              </button>

            </>
          ) : (
            <>

              <Link
                to="/login"
                className="text-indigo-600 text-xl font-semibold px-5 py-2 hover:text-indigo-700"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700"
              >
                Register
              </Link>

            </>
          )}

        </div>

      </nav>

      {/* ================= HERO ================= */}

      <section className="bg-white py-16 px-10 text-center border-b border-gray-200">

        <h1 className="text-6xl font-bold text-gray-900">
          Contact Us
        </h1>

        <p className="text-gray-500 text-xl mt-6 max-w-4xl mx-auto leading-relaxed">
          Have questions? We'd love to hear from you.
          Send us a message and our team will respond quickly.
        </p>

      </section>

      {/* ================= MAIN SECTION ================= */}

      <section className="px-10 py-16">

        <div className="grid md:grid-cols-2 gap-10">

          {/* ================= FORM ================= */}

          <div className="bg-white shadow-lg rounded-2xl p-8">

            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Get in Touch
            </h2>

            <form onSubmit={handleSubmit}>

              <div className="mb-5">

                <label className="font-semibold text-gray-600 block mb-2">
                  Your Name
                </label>

                <input
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 p-4 rounded-xl text-gray-900 placeholder-gray-400 outline-none focus:border-indigo-500"
                />

              </div>

              <div className="mb-5">

                <label className="font-semibold text-gray-600 block mb-2">
                  Email Address
                </label>

                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 p-4 rounded-xl text-gray-900 placeholder-gray-400 outline-none focus:border-indigo-500"
                />

              </div>

              <div className="mb-5">

                <label className="font-semibold text-gray-600 block mb-2">
                  Message
                </label>

                <textarea
                  rows="6"
                  name="message"
                  placeholder="How can we help you?"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-300 p-4 rounded-xl text-gray-900 placeholder-gray-400 outline-none resize-none focus:border-indigo-500"
                ></textarea>

              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl flex items-center justify-center gap-3 text-lg font-semibold"
              >

                <FaPaperPlane />

                {loading ? "Sending..." : "Send Message"}

              </button>

            </form>

          </div>

          {/* ================= CONTACT INFO ================= */}

          <div className="space-y-6">

            <div className="bg-white shadow-lg rounded-2xl p-6 flex gap-5">

              <div className="w-16 h-16 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 text-2xl">
                <FaMapMarkerAlt />
              </div>

              <div>

                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Address
                </h3>

                <p className="text-gray-500">
                  123 Main Street
                </p>

                <p className="text-gray-500">
                  Colombo, Sri Lanka
                </p>

              </div>

            </div>

            <div className="bg-white shadow-lg rounded-2xl p-6 flex gap-5">

              <div className="w-16 h-16 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 text-2xl">
                <FaPhoneAlt />
              </div>

              <div>

                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Phone
                </h3>

                <p className="text-gray-500">
                  +94 77 123 4567
                </p>

                <p className="text-gray-500">
                  Available 24/7
                </p>

              </div>

            </div>

            <div className="bg-white shadow-lg rounded-2xl p-6 flex gap-5">

              <div className="w-16 h-16 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 text-2xl">
                <FaEnvelope />
              </div>

              <div>

                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Email
                </h3>

                <p className="text-gray-500">
                  info@carrental.com
                </p>

                <p className="text-gray-500">
                  support@carrental.com
                </p>

              </div>

            </div>

            <div className="bg-white shadow-lg rounded-2xl p-6">

              <h3 className="text-2xl font-bold text-gray-900 mb-5">
                Follow Us
              </h3>

              <div className="flex gap-5">

                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-full flex items-center justify-center cursor-pointer">
                  <FaFacebookF />
                </div>

                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-full flex items-center justify-center cursor-pointer">
                  <FaTwitter />
                </div>

                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-full flex items-center justify-center cursor-pointer">
                  <FaInstagram />
                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ================= FOOTER ================= */}

      <footer className="bg-gray-900 text-white py-12 px-10">

        <div className="grid md:grid-cols-3 gap-10">

          <div>

            <h2 className="text-2xl font-bold mb-4">
              CarRental
            </h2>

            <p className="text-gray-400">
              Your trusted partner for car rentals.
            </p>

          </div>

          <div>

            <h2 className="text-2xl font-bold mb-4">
              Contact Us
            </h2>

            <p>Email: info@carrental.com</p>

            <p>Phone: +94 77 123 4567</p>

          </div>

          <div>

            <h2 className="text-2xl font-bold mb-4">
              Follow Us
            </h2>

            <div className="flex gap-5">
              <p>Facebook</p>
              <p>Twitter</p>
              <p>Instagram</p>
            </div>

          </div>

        </div>

        <div className="border-t border-gray-700 my-8"></div>

        <div className="text-center text-gray-400">
          © 2026 CarRental. All rights reserved.
        </div>

      </footer>

    </div>

  );

};

export default Contact;