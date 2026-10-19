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
} from "react-icons/fa";
import {
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../firebase/firebase";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Contact = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  /* ================= USER LOGIN ================= */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser?.email) {
        setFormData((prev) => ({
          ...prev,
          email: prev.email || currentUser.email,
          name: prev.name || currentUser.displayName || "",
        }));
      }
    });
    return () => unsubscribe();
  }, []);

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

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      await addDoc(collection(db, "contactMessages"), {
        name: formData.name.trim(),
        email: formData.email.trim(),
        message: formData.message.trim(),
        userId: user.uid,
        createdAt: serverTimestamp(),
      });

      alert("Message Sent Successfully!");
      setFormData({
        name: "",
        email: user?.email || "",
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
    <div className="bg-gray-50 min-h-screen flex flex-col">
      {/* ================= NAVBAR ================= */}
      <Navbar active="contact" />

      {/* ================= HERO ================= */}
      <section className="bg-white py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-10 text-center border-b border-gray-200">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
            Contact Us
          </h1>
          <p className="text-gray-500 text-base sm:text-lg md:text-xl mt-4 sm:mt-6 leading-relaxed">
            Have questions or need assistance? We'd love to hear from you. Send us a message and our team will respond promptly.
          </p>
        </div>
      </section>

      {/* ================= MAIN SECTION ================= */}
      <section className="px-4 sm:px-6 md:px-10 py-10 sm:py-16 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10">

          {/* ================= FORM ================= */}
          <div className="bg-white shadow-sm border border-gray-200 rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
              Get in Touch
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <div>
                <label className="text-xs sm:text-sm font-semibold text-gray-700 block mb-1.5">
                  Your Name
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-200 px-4 py-3 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs sm:text-sm font-semibold text-gray-700 block mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-200 px-4 py-3 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs sm:text-sm font-semibold text-gray-700 block mb-1.5">
                  Message
                </label>
                <textarea
                  rows="5"
                  name="message"
                  placeholder="How can we help you?"
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-200 px-4 py-3 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none resize-none focus:ring-2 focus:ring-indigo-500"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-3 sm:py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm sm:text-base font-semibold shadow-sm transition"
              >
                <FaPaperPlane className="text-xs" />
                {loading ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>

          {/* ================= CONTACT INFO ================= */}
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white shadow-sm border border-gray-200 rounded-2xl p-5 sm:p-6 flex items-start gap-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 text-xl shrink-0">
                <FaMapMarkerAlt />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">
                  Address
                </h3>
                <p className="text-gray-500 text-sm">123 Galle Road</p>
                <p className="text-gray-500 text-sm">Colombo, Sri Lanka</p>
              </div>
            </div>

            <div className="bg-white shadow-sm border border-gray-200 rounded-2xl p-5 sm:p-6 flex items-start gap-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 text-xl shrink-0">
                <FaPhoneAlt />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">
                  Phone
                </h3>
                <p className="text-gray-500 text-sm">+94 77 123 4567</p>
                <p className="text-gray-400 text-xs mt-0.5">Available 24/7 for booking support</p>
              </div>
            </div>

            <div className="bg-white shadow-sm border border-gray-200 rounded-2xl p-5 sm:p-6 flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 text-xl shrink-0">
                <FaEnvelope />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1">
                  Email
                </h3>
                <p className="text-gray-500 text-sm">info@carrental.com</p>
                <p className="text-gray-500 text-sm">support@carrental.com</p>
              </div>
            </div>

            <div className="bg-white shadow-sm border border-gray-200 rounded-2xl p-5 sm:p-6">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">
                Connect With Us
              </h3>
              <div className="flex gap-3">
                <a
                  href="#"
                  aria-label="Facebook"
                  className="w-10 h-10 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl flex items-center justify-center transition"
                >
                  <FaFacebookF className="text-sm" />
                </a>
                <a
                  href="#"
                  aria-label="Twitter"
                  className="w-10 h-10 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl flex items-center justify-center transition"
                >
                  <FaTwitter className="text-sm" />
                </a>
                <a
                  href="#"
                  aria-label="Instagram"
                  className="w-10 h-10 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl flex items-center justify-center transition"
                >
                  <FaInstagram className="text-sm" />
                </a>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <Footer />
    </div>
  );
};

export default Contact;