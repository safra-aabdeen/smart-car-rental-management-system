import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import heroImage from "../images/Home-image.jpg";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // ✅ Firebase Login
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      console.log("Login success:", user.uid);

      alert("Login successful");

      // 🔥 ADMIN CHECK (simple version)
      if (email === "admin@gmail.com") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }

    } catch (error) {
      console.log(error);
      alert(error.message);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{ backgroundImage: `url(${heroImage})` }}
    >
      {/* overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>

      {/* login box */}
      <form
        onSubmit={handleLogin}
        className="relative z-10 bg-white/95 backdrop-blur-xl p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-200/80 w-full max-w-[400px] mx-4 my-8"
      >
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-indigo-600 font-bold text-xl tracking-tight">
            CarRental
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
            Welcome Back
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">Sign in to your account</p>
        </div>

        {/* email */}
        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-gray-50 border border-gray-300 p-3.5 rounded-xl mb-4 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />

        {/* password */}
        <div className="relative mb-5">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-gray-50 border border-gray-300 p-3.5 rounded-xl pr-12 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
          <div
            className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEye /> : <FaEyeSlash />}
          </div>
        </div>

        {/* button */}
        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl shadow-md font-semibold text-sm sm:text-base transition cursor-pointer"
        >
          Sign In
        </button>

        {/* register link */}
        <p className="mt-5 text-center text-xs sm:text-sm text-gray-500">
          Don't have an account?{" "}
          <Link to="/register" className="text-indigo-600 font-bold hover:underline">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;