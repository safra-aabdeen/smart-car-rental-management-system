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
        className="relative z-10 bg-white/90 backdrop-blur-xl p-10 rounded-2xl shadow-2xl shadow-gray-300/40 border border-gray-200/60 w-[400px]"
      >
        <h1 className="text-4xl font-bold text-center text-indigo-600 mb-8">
          Login
        </h1>

        {/* email */}
        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-gray-50 border border-gray-300 p-4 rounded-xl mb-5 text-gray-900 placeholder-gray-400"
          required
        />

        {/* password */}
        <div className="relative mb-5">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 p-4 rounded-xl pr-12 text-gray-900 placeholder-gray-400"
              required
            />
            <div
              className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEye /> : <FaEyeSlash />}
            </div>
        </div>

        {/* button */}
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/25 font-semibold"
        >
          Login
        </button>

        {/* register link */}
        <p className="mt-5 text-center text-gray-500">
          Don't have an account?{" "}
          <Link to="/register" className="text-indigo-600 font-bold hover:text-indigo-500">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;