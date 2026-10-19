import AdminSidebar from "../components/AdminSidebar";
import React, { useEffect, useState } from "react";

import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";

import { db, auth } from "../firebase/firebase";
import { signOut } from "firebase/auth";

import {
  FaCar,
  FaUsers,
  FaTachometerAlt,
  FaSignOutAlt,
  FaMoneyCheckAlt,
  FaUserCircle,
  FaTrash,
  FaCalendarCheck,
  FaUserTie,
  FaEnvelope,
  FaReply,
  FaTimes,
  FaSearch,
  FaInbox,
  FaCheckCircle,
  FaClock,
  FaPaperPlane,
  FaEnvelopeOpen,
} from "react-icons/fa";

import { useNavigate, useLocation } from "react-router-dom";

import emailjs from "@emailjs/browser";

const AdminMessages = () => {

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Reply Modal State
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  /* ================= FETCH MESSAGES ================= */

  const fetchMessages = async () => {

    try {

      setLoading(true);

      const q = query(
        collection(db, "contactMessages"),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setMessages(data);

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  /* ================= DELETE MESSAGE ================= */

  const handleDelete = async (id) => {

    if (window.confirm("Are you sure you want to delete this message?")) {

      try {

        await deleteDoc(doc(db, "contactMessages", id));

        fetchMessages();

      } catch (error) {

        console.log(error);

        alert("Error deleting message");
      }
    }
  };

  /* ================= OPEN REPLY MODAL ================= */

  const handleOpenReply = (message) => {

    setSelectedMessage(message);

    setReplyText("");

    setShowReplyModal(true);
  };

  /* ================= SEND REPLY ================= */

  const handleSendReply = async () => {

    if (!replyText.trim()) {
      alert("Please enter a reply message");
      return;
    }

    try {

      setSendingReply(true);

      // Send email via EmailJS
      await emailjs.send(
        "service_8c2dwyp",
        "template_w6kz91m",
        {
          to_email: selectedMessage.email,
          to_name: selectedMessage.name,
          from_name: "CarRental Admin",
          message: replyText,
          subject: `Reply to your message - CarRental`,
          reply_message: replyText,
          user_name: selectedMessage.name,
          user_email: selectedMessage.email,
          original_message: selectedMessage.message,
        },
        "8nIVcpGw1HQizIVhn"
      );

      // Update message status in Firestore
      await updateDoc(doc(db, "contactMessages", selectedMessage.id), {
        status: "replied",
        adminReply: replyText,
        repliedAt: serverTimestamp(),
      });

      alert("Reply sent successfully!");

      setShowReplyModal(false);

      setSelectedMessage(null);

      setReplyText("");

      fetchMessages();

    } catch (error) {

      console.log(error);

      alert("Error sending reply: " + (error.text || error.message));

    } finally {

      setSendingReply(false);
    }
  };

  /* ================= LOGOUT ================= */

  const handleLogout = async () => {

    await signOut(auth);

    navigate("/");
  };

  /* ================= FORMAT DATE ================= */

  const formatDate = (timestamp) => {

    if (!timestamp) return "N/A";

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /* ================= FILTERED MESSAGES ================= */

  const filteredMessages = messages.filter((msg) => {

    const matchesSearch =
      msg.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.message?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "replied" && msg.status === "replied") ||
      (filterStatus === "pending" && msg.status !== "replied");

    return matchesSearch && matchesFilter;
  });

  /* ================= COUNTS ================= */

  const totalMessages = messages.length;

  const repliedMessages = messages.filter(
    (msg) => msg.status === "replied"
  ).length;

  const pendingMessages = totalMessages - repliedMessages;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50 overflow-x-hidden">
      {/* ================= SIDEBAR ================= */}
      <AdminSidebar />

      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Contact Messages
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Read and reply to customer inquiries and contact submissions
          </p>
        </div>

        {/* ================= STATS CARDS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white shadow-xs border border-gray-200 p-4 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500">Total Messages</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{totalMessages}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <FaInbox className="text-lg" />
            </div>
          </div>

          <div className="bg-white shadow-xs border border-gray-200 p-4 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500">Replied</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{repliedMessages}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <FaCheckCircle className="text-lg" />
            </div>
          </div>

          <div className="bg-white shadow-xs border border-gray-200 p-4 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500">Pending</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{pendingMessages}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <FaClock className="text-lg" />
            </div>
          </div>
        </div>

        {/* ================= SEARCH & FILTER ================= */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search by name, email, or message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-gray-300 pl-10 pr-4 py-2.5 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            <option value="all">All Messages</option>
            <option value="pending">Pending</option>
            <option value="replied">Replied</option>
          </select>
        </div>

        {/* ================= MESSAGES TABLE ================= */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-gray-400 text-sm">
              Loading messages...
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <FaEnvelopeOpen className="text-4xl text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-medium">No messages found</p>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[750px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    <th className="px-4 py-3.5">#</th>
                    <th className="px-4 py-3.5">Name</th>
                    <th className="px-4 py-3.5">Email</th>
                    <th className="px-4 py-3.5">Message</th>
                    <th className="px-4 py-3.5">Date</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 text-center">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 text-sm">
                  {filteredMessages.map((msg, index) => (
                    <tr
                      key={msg.id}
                      className="hover:bg-gray-50/80 transition"
                    >
                      <td className="px-4 py-3.5 text-xs text-gray-400 font-mono">
                        {String(index + 1).padStart(3, "0")}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 font-semibold text-xs">
                            {msg.name ? msg.name.charAt(0).toUpperCase() : "M"}
                          </div>
                          <span className="font-semibold text-gray-900 text-sm">
                            {msg.name}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap text-sm">
                        {msg.email}
                      </td>

                      <td className="px-4 py-3.5 text-gray-600 max-w-xs">
                        <p className="truncate text-sm" title={msg.message}>
                          {msg.message}
                        </p>
                      </td>

                      <td className="px-4 py-3.5 text-gray-400 text-xs whitespace-nowrap">
                        {formatDate(msg.createdAt)}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {msg.status === "replied" ? (
                          <span className="bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                            Replied
                          </span>
                        ) : (
                          <span className="bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                            Pending
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenReply(msg)}
                            className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition"
                            title="Reply"
                          >
                            <FaReply className="text-sm" />
                          </button>

                          <button
                            onClick={() => handleDelete(msg.id)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                            title="Delete"
                          >
                            <FaTrash className="text-sm" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* ================= REPLY MODAL ================= */}
      {showReplyModal && selectedMessage && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* MODAL HEADER */}
            <div className="bg-indigo-600 text-white p-5 flex justify-between items-center rounded-t-2xl">
              <div className="flex items-center gap-2.5">
                <FaReply className="text-lg" />
                <h2 className="text-lg font-bold">Reply to Message</h2>
              </div>
              <button
                onClick={() => setShowReplyModal(false)}
                className="text-indigo-200 hover:text-white transition p-1"
              >
                <FaTimes />
              </button>
            </div>

            {/* MODAL BODY */}
            <div className="p-5 sm:p-6">
              {/* ORIGINAL MESSAGE INFO */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div>
                    <p className="font-semibold text-sm text-gray-900">
                      {selectedMessage.name}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {selectedMessage.email}
                    </p>
                  </div>
                  <span className="text-gray-400 text-xs shrink-0">
                    {formatDate(selectedMessage.createdAt)}
                  </span>
                </div>

                <p className="text-gray-700 text-sm bg-white border border-gray-200 rounded-lg p-3 mt-2">
                  {selectedMessage.message}
                </p>

                {selectedMessage.adminReply && (
                  <div className="mt-3 bg-emerald-50 rounded-lg p-3 border border-emerald-200">
                    <p className="text-xs text-emerald-800 font-semibold mb-1">
                      Previous Reply:
                    </p>
                    <p className="text-xs text-gray-700">
                      {selectedMessage.adminReply}
                    </p>
                  </div>
                )}
              </div>

              {/* REPLY TEXTAREA */}
              <div className="mb-4">
                <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                  Your Reply
                </label>
                <textarea
                  rows="4"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply to the customer..."
                  className="w-full bg-white border border-gray-300 p-3 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                ></textarea>
              </div>

              {/* MODAL ACTIONS */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowReplyModal(false)}
                  className="px-4 py-2 text-sm font-semibold border border-gray-300 rounded-xl hover:bg-gray-100 text-gray-700 transition"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSendReply}
                  disabled={sendingReply}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 text-sm rounded-xl flex items-center gap-2 font-semibold shadow-xs transition disabled:opacity-50"
                >
                  <FaPaperPlane className="text-xs" />
                  {sendingReply ? "Sending..." : "Send Reply"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMessages;
