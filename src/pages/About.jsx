// About.jsx

import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  FaCar,
  FaShieldAlt,
  FaUsers,
  FaAward,
  FaHome,
  FaInfoCircle,
  FaPhone,
  FaSignOutAlt,
} from "react-icons/fa";

import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import { auth, db } from "../firebase/firebase";

const About = () => {

  const navigate = useNavigate();

  const [userName, setUserName] = useState("");

  /* ================= USER LOGIN ================= */

  useEffect(() => {

    const unsubscribe = onAuthStateChanged(auth, async (user) => {

      if (user) {

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

  const stats = [
    {
      icon: <FaCar className="text-indigo-600 text-4xl" />,
      value: "500+",
      label: "Premium Vehicles",
      bg: "bg-indigo-50",
    },
    {
      icon: <FaUsers className="text-green-600 text-4xl" />,
      value: "50,000+",
      label: "Happy Customers",
      bg: "bg-indigo-50",
    },
    {
      icon: <FaAward className="text-yellow-600 text-4xl" />,
      value: "15+",
      label: "Years Experience",
      bg: "bg-amber-50",
    },
    {
      icon: <FaShieldAlt className="text-purple-600 text-4xl" />,
      value: "100%",
      label: "Insured Vehicles",
      bg: "bg-purple-50",
    },
  ];

  const values = [
    {
      title: "Quality",
      desc: "All our vehicles are well-maintained, regularly serviced, and thoroughly cleaned for your comfort and safety.",
    },
    {
      title: "Transparency",
      desc: "No hidden fees, no surprises. We believe in clear, upfront pricing and honest communication.",
    },
    {
      title: "Support",
      desc: "Our dedicated customer support team is available 24/7 to assist you anytime.",
    },
  ];

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
            className="flex items-center gap-2 text-indigo-600 font-semibold"
          >
            <FaInfoCircle />
            About
          </Link>

          <Link
            to="/contact"
            className="flex items-center gap-2 hover:text-indigo-600"
          >
            <FaPhone />
            Contact
          </Link>

        </ul>

        <div className="flex items-center gap-5">

          {userName ? (
            <>

              <button
                onClick={handleLogout}
                className="bg-gray-800 hover:bg-red-500/80 text-white px-5 py-2 rounded-lg flex items-center gap-2"
              >
                <FaSignOutAlt />
                Logout
              </button>

            </>
          ) : (
            <>

              <Link
                to="/login"
                className="text-indigo-600 text-xl font-semibold px-5 py-2 hover:text-indigo-500"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:shadow-lg hover:shadow-indigo-500/25"
              >
                Register
              </Link>

            </>
          )}

        </div>

      </nav>

      {/* ================= HERO ================= */}

      <section className="bg-gray-100 border-b border-gray-200 py-20 px-10 text-center">

        <h1 className="text-6xl font-bold text-gray-900">
          About CarRental
        </h1>

        <p className="text-gray-500 text-xl mt-6 max-w-4xl mx-auto leading-relaxed">
          Your trusted partner in premium car rentals.
          We provide high-quality vehicles, affordable pricing,
          and excellent customer service.
        </p>

      </section>

      {/* ================= STATS ================= */}

      <section className="py-16 px-10">

        <div className="grid md:grid-cols-4 gap-8">

          {stats.map((stat, index) => (

            <div
              key={index}
              className="bg-white shadow-lg rounded-2xl p-8 hover:shadow-xl transition duration-300 text-center"
            >

              <div className={`w-24 h-24 ${stat.bg} rounded-full flex items-center justify-center mx-auto mb-5`}>
                {stat.icon}
              </div>

              <h2 className="text-3xl font-bold text-gray-900">
                {stat.value}
              </h2>

              <p className="text-gray-500 mt-2">
                {stat.label}
              </p>

            </div>

          ))}

        </div>

      </section>

      {/* ================= STORY ================= */}

      <section className="px-10 py-10">

        <div className="bg-white shadow-lg rounded-2xl p-10">

          <h2 className="text-4xl font-bold mb-6 text-gray-900">
            Our Story
          </h2>

          <p className="text-gray-500 text-lg leading-relaxed mb-5">
            Founded in 2011, CarRental started with a simple vision:
            to make premium car rentals affordable and accessible
            for everyone.
          </p>

          <p className="text-gray-500 text-lg leading-relaxed mb-5">
            Today, we proudly serve thousands of customers with
            a wide range of vehicles including economy cars,
            luxury sedans, SUVs, and family vehicles.
          </p>

          <p className="text-gray-500 text-lg leading-relaxed">
            We continue to grow by maintaining our commitment
            to transparency, customer satisfaction, and safety.
          </p>

        </div>

      </section>

      {/* ================= MISSION ================= */}

      <section className="px-10 py-10">

        <div className="bg-indigo-600 text-white rounded-2xl p-12 text-center shadow-lg">

          <h2 className="text-4xl font-bold mb-5">
            Our Mission
          </h2>

          <p className="text-2xl leading-relaxed max-w-4xl mx-auto">
            To provide exceptional car rental experiences through
            reliable vehicles, transparent pricing, and world-class service.
          </p>

        </div>

      </section>

      {/* ================= VALUES ================= */}

      <section className="px-10 py-16">

        <div className="grid md:grid-cols-3 gap-8">

          {values.map((value, index) => (

            <div
              key={index}
              className="bg-white shadow-lg rounded-2xl p-8 hover:shadow-xl transition"
            >

              <h3 className="text-3xl font-bold mb-4 text-gray-900">
                {value.title}
              </h3>

              <p className="text-gray-500 text-lg leading-relaxed">
                {value.desc}
              </p>

            </div>

          ))}

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

        <div className="border-t border-gray-200 my-8"></div>

        <div className="text-center text-gray-400">
          © 2026 CarRental. All rights reserved.
        </div>

      </footer>

    </div>

  );

};

export default About;