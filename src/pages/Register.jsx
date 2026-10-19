import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";
import heroImage from "../images/Home-image.jpg";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Register = () => {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    // basic validation
    if (!userName || !email || !password) {
      alert("Please fill required fields");
      return;
    }

    setLoading(true);

    try {
      console.log("Register started...");

      // 1️⃣ Create Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      const user = userCredential.user;

      console.log(" Auth created:", user.uid);

      // 2️⃣ save Firestore user data
      const userData = {
        name: userName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        uid: user.uid,
        createdAt: new Date().toISOString(),
      };

      console.log(" saving to Firestore:", userData);

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: userName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        role: "user",
        createdAt: new Date().toISOString(),
      });

      console.log(" Firestore saved successfully");

      alert("Registration successful ");

      navigate("/login");
    } catch (error) {
      console.error("❌ Register Error:", error.message);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${heroImage})` }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>

      <form
        onSubmit={handleRegister}
        className="relative z-10 bg-white/95 backdrop-blur-xl p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-200/80 w-full max-w-[420px] mx-4 my-8"
      >
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-indigo-600 font-bold text-xl tracking-tight">
            CarRental
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
            Create Account
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">Join CarRental today</p>
        </div>

        <input
          type="text"
          placeholder="Full Name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          className="w-full bg-gray-50 border border-gray-300 p-3 rounded-xl mb-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-gray-50 border border-gray-300 p-3 rounded-xl mb-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />

        <input
          type="tel"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full bg-gray-50 border border-gray-300 p-3 rounded-xl mb-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <textarea
          placeholder="Address"
          rows={2}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full bg-gray-50 border border-gray-300 p-3 rounded-xl mb-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />

        <div className="relative mb-4">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-gray-50 border border-gray-300 p-3 rounded-xl pr-12 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />

          <div
            className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEye /> : <FaEyeSlash />}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl shadow-md font-semibold text-sm sm:text-base disabled:opacity-50 transition cursor-pointer"
        >
          {loading ? "Creating Account..." : "Register"}
        </button>

        <p className="mt-4 text-center text-xs sm:text-sm text-gray-500">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-600 font-bold hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;