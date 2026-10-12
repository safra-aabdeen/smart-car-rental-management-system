import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cars from "./pages/Cars";
import CarDetails from "./pages/CarDetails";
import Booking from "./pages/Booking";
import AdminDashboard from "./pages/AdminDashboard";
import AdminManageCars from "./pages/AdminManageCars";
import Payment from "./pages/Payment";
import AdminBooking from "./pages/AdminBooking";
import AdminUser from "./pages/AdminUser";
import AdminDriver from "./pages/AdminDriver";
import AdminMessages from "./pages/AdminMessages";
import AdminReviews from "./pages/AdminReviews";
import PaymentSuccess from "./pages/PaymentSuccess";
import Invoice from "./pages/Invoice";
import UserDashboard from "./pages/UserDashboard";

const App = () => {
  return (
    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/home" element={<Home />} />

        <Route path="/about" element={<About />} />

        <Route path="/contact" element={<Contact />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/cars" element={<Cars />} />

        <Route path="/car/:id" element={<CarDetails />} />

        <Route path="/book/:id" element={<Booking />} />

        <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />

        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        <Route path="/admin/cars" element={<AdminManageCars />} />

        <Route path="/payment" element={<Payment />} />

        <Route path="/payment-success" element={<PaymentSuccess />} />

        <Route path="/invoice" element={<Invoice />} />

        <Route path="/dashboard" element={<UserDashboard />} />

        <Route path="/admin/booking" element={<AdminBooking />} />

        <Route path="/admin/user" element={<AdminUser />} />

        <Route path="/admin/driver" element={<AdminDriver />} />

        <Route path="/admin/messages" element={<AdminMessages />} />

        <Route path="/admin/reviews" element={<AdminReviews />} />

      </Routes>

    </BrowserRouter>
  );
};

export default App;