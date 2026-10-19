// About.jsx
import React from "react";
import { FaCar, FaShieldAlt, FaUsers, FaAward } from "react-icons/fa";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const About = () => {
  const stats = [
    {
      icon: <FaCar className="text-indigo-600 text-3xl sm:text-4xl" />,
      value: "500+",
      label: "Premium Vehicles",
      bg: "bg-indigo-50",
    },
    {
      icon: <FaUsers className="text-emerald-600 text-3xl sm:text-4xl" />,
      value: "50,000+",
      label: "Happy Customers",
      bg: "bg-emerald-50",
    },
    {
      icon: <FaAward className="text-amber-600 text-3xl sm:text-4xl" />,
      value: "15+",
      label: "Years Experience",
      bg: "bg-amber-50",
    },
    {
      icon: <FaShieldAlt className="text-purple-600 text-3xl sm:text-4xl" />,
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
    <div className="bg-gray-50 min-h-screen flex flex-col overflow-x-hidden">
      {/* ================= NAVBAR ================= */}
      <Navbar active="about" />

      {/* ================= HERO ================= */}
      <section className="bg-white border-b border-gray-200 py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-10 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
            About CarRental
          </h1>
          <p className="text-gray-500 text-base sm:text-lg md:text-xl mt-4 sm:mt-6 leading-relaxed">
            Your trusted partner in premium car rentals. We provide high-quality vehicles, affordable pricing, and excellent customer service across Sri Lanka.
          </p>
        </div>
      </section>

      {/* ================= STATS ================= */}
      <section className="py-10 sm:py-16 px-4 sm:px-6 md:px-10 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white shadow-sm border border-gray-100 rounded-2xl p-6 sm:p-8 hover:shadow-md transition text-center flex flex-col items-center"
            >
              <div className={`w-16 h-16 sm:w-20 sm:h-20 ${stat.bg} rounded-2xl flex items-center justify-center mb-4`}>
                {stat.icon}
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {stat.value}
              </h2>
              <p className="text-gray-500 text-xs sm:text-sm mt-1 font-medium">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= STORY ================= */}
      <section className="px-4 sm:px-6 md:px-10 py-6 max-w-7xl mx-auto w-full">
        <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-6 sm:p-10">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-gray-900">
            Our Story
          </h2>
          <div className="space-y-4 text-gray-600 text-sm sm:text-base leading-relaxed">
            <p>
              Founded in 2011, CarRental started with a simple vision: to make premium car rentals affordable and accessible for everyone.
            </p>
            <p>
              Today, we proudly serve thousands of customers with a wide range of vehicles including economy cars, luxury sedans, SUVs, and family vehicles.
            </p>
            <p>
              We continue to grow by maintaining our commitment to transparency, customer satisfaction, and safety on every journey.
            </p>
          </div>
        </div>
      </section>

      {/* ================= MISSION ================= */}
      <section className="px-4 sm:px-6 md:px-10 py-6 max-w-7xl mx-auto w-full">
        <div className="bg-indigo-600 text-white rounded-2xl p-8 sm:p-12 text-center shadow-md">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
            Our Mission
          </h2>
          <p className="text-base sm:text-xl md:text-2xl leading-relaxed max-w-3xl mx-auto font-medium text-indigo-100">
            To provide exceptional car rental experiences through reliable vehicles, transparent pricing, and world-class service.
          </p>
        </div>
      </section>

      {/* ================= VALUES ================= */}
      <section className="px-4 sm:px-6 md:px-10 py-10 sm:py-16 max-w-7xl mx-auto w-full">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 text-gray-900">
          Our Core Values
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {values.map((value, index) => (
            <div
              key={index}
              className="bg-white shadow-sm border border-gray-100 rounded-2xl p-6 sm:p-8 hover:shadow-md transition"
            >
              <h3 className="text-lg sm:text-xl font-bold mb-2 text-gray-900">
                {value.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                {value.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <Footer />
    </div>
  );
};

export default About;