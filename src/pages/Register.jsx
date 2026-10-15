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
        className="relative z-10 bg-white/90 backdrop-blur-xl p-10 rounded-2xl shadow-2xl shadow-gray-300/40 border border-gray-200/60 w-[400px]"
      >
        <h1 className="text-4xl font-bold text-center text-indigo-600 mb-6">
          Register
        </h1>

        <input
          type="text"
          placeholder="User Name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          className="w-full bg-gray-50 border border-gray-300 p-3 rounded-xl mb-4 text-gray-900 placeholder-gray-400"
          required
        />

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-gray-50 border border-gray-300 p-3 rounded-xl mb-4 text-gray-900 placeholder-gray-400"
          required
        />

        <input
          type="tel"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full bg-gray-50 border border-gray-300 p-3 rounded-xl mb-4 text-gray-900 placeholder-gray-400"
        />

        <textarea
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full bg-gray-50 border border-gray-300 p-3 rounded-xl mb-4 text-gray-900 placeholder-gray-400"
        />

        <div className="relative mb-5">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-gray-50 border border-gray-300 p-3 rounded-xl pr-12 text-gray-900 placeholder-gray-400"
            required
          />

          <div
            className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEye /> : <FaEyeSlash />}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/25 font-semibold disabled:opacity-50"
        >
          {loading ? "Registering..." : "Register"}
        </button>

        <p className="mt-4 text-center text-gray-500">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-600 font-bold hover:text-indigo-500">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;