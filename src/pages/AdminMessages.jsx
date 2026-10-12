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

    <div className="flex min-h-screen bg-gray-50">

      {/* ================= SIDEBAR ================= */}

      <AdminSidebar />

      <main className="flex-1 p-8">

        <h1 className="text-5xl font-bold text-gray-900 mb-8">
          Contact Messages
        </h1>

        {/* ================= STATS CARDS ================= */}

        <div className="grid md:grid-cols-3 gap-6 mb-8">

          {/* TOTAL MESSAGES */}

          <div className="bg-white shadow-lg border border-gray-200 p-6 rounded-2xl shadow-md">

            <div className="flex justify-between items-center">

              <div>

                <p className="text-gray-500">
                  Total Messages
                </p>

                <h2 className="text-4xl font-bold text-gray-900 mt-2">
                  {totalMessages}
                </h2>

              </div>

              <div className="bg-indigo-50 p-5 rounded-2xl">
                <FaInbox className="text-3xl text-indigo-600" />
              </div>

            </div>

          </div>

          {/* REPLIED */}

          <div className="bg-white shadow-lg border border-gray-200 p-6 rounded-2xl shadow-md">

            <div className="flex justify-between items-center">

              <div>

                <p className="text-gray-500">
                  Replied
                </p>

                <h2 className="text-4xl font-bold text-gray-900 mt-2">
                  {repliedMessages}
                </h2>

              </div>

              <div className="bg-indigo-50 p-5 rounded-2xl">
                <FaCheckCircle className="text-3xl text-indigo-600" />
              </div>

            </div>

          </div>

          {/* PENDING */}

          <div className="bg-white shadow-lg border border-gray-200 p-6 rounded-2xl shadow-md">

            <div className="flex justify-between items-center">

              <div>

                <p className="text-gray-500">
                  Pending
                </p>

                <h2 className="text-4xl font-bold text-gray-900 mt-2">
                  {pendingMessages}
                </h2>

              </div>

              <div className="bg-yellow-500/20 p-5 rounded-2xl">
                <FaClock className="text-3xl text-yellow-400" />
              </div>

            </div>

          </div>

        </div>

        {/* ================= SEARCH & FILTER ================= */}

        <div className="flex flex-col md:flex-row gap-4 mb-6">

          {/* SEARCH */}

          <div className="relative flex-1">

            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

            <input
              type="text"
              placeholder="Search by name, email, or message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white shadow-lg border border-gray-200 pl-12 pr-4 py-3 rounded-xl outline-none focus:border-indigo-500 text-white placeholder-gray-400"
            />

          </div>

          {/* FILTER */}

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white shadow-lg border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 text-gray-600"
          >
            <option value="all">All Messages</option>
            <option value="pending">Pending</option>
            <option value="replied">Replied</option>
          </select>

        </div>

        {/* ================= MESSAGES TABLE ================= */}

        <div className="bg-white shadow-lg border border-gray-200 rounded-2xl shadow overflow-hidden">

          {loading ? (

            <div className="p-10 text-center text-gray-400 text-xl">
              Loading messages...
            </div>

          ) : filteredMessages.length === 0 ? (

            <div className="p-10 text-center text-gray-400 text-xl">

              <FaEnvelopeOpen className="text-6xl text-gray-300 mx-auto mb-4" />

              <p>No messages found</p>

            </div>

          ) : (

            <table className="w-full">

              <thead className="bg-gray-100 border-b border-gray-300">

                <tr>

                  <th className="p-4 text-left text-gray-500 font-semibold">
                    #
                  </th>

                  <th className="p-4 text-left text-gray-500 font-semibold">
                    Name
                  </th>

                  <th className="p-4 text-left text-gray-500 font-semibold">
                    Email
                  </th>

                  <th className="p-4 text-left text-gray-500 font-semibold">
                    Message
                  </th>

                  <th className="p-4 text-left text-gray-500 font-semibold">
                    Date
                  </th>

                  <th className="p-4 text-left text-gray-500 font-semibold">
                    Status
                  </th>

                  <th className="p-4 text-left text-gray-500 font-semibold">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredMessages.map((msg, index) => (

                  <tr
                    key={msg.id}
                    className="border-t border-gray-200 hover:bg-gray-50 transition"
                  >

                    <td className="p-4 text-gray-400">
                      {String(index + 1).padStart(3, "0")}
                    </td>

                    <td className="p-4">

                      <div className="flex items-center gap-3">

                        <div className="bg-indigo-50 p-3 rounded-full">
                          <FaUserCircle className="text-indigo-600 text-xl" />
                        </div>

                        <span className="font-semibold text-gray-900">
                          {msg.name}
                        </span>

                      </div>

                    </td>

                    <td className="p-4 text-gray-600">
                      {msg.email}
                    </td>

                    <td className="p-4 text-gray-600 max-w-xs">

                      <p className="truncate" title={msg.message}>
                        {msg.message}
                      </p>

                    </td>

                    <td className="p-4 text-gray-400 text-sm whitespace-nowrap">
                      {formatDate(msg.createdAt)}
                    </td>

                    <td className="p-4">

                      {msg.status === "replied" ? (

                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                          Replied
                        </span>

                      ) : (

                        <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-semibold">
                          Pending
                        </span>

                      )}

                    </td>

                    <td className="p-4">

                      <div className="flex items-center gap-3">

                        <button
                          onClick={() => handleOpenReply(msg)}
                          className="text-indigo-600 hover:text-indigo-500 transition"
                          title="Reply"
                        >
                          <FaReply className="text-lg" />
                        </button>

                        <button
                          onClick={() => handleDelete(msg.id)}
                          className="text-red-600 hover:text-red-300 transition"
                          title="Delete"
                        >
                          <FaTrash className="text-lg" />
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          )}

        </div>

      </main>

      {/* ================= REPLY MODAL ================= */}

      {showReplyModal && selectedMessage && (

        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">

          <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden">

            {/* MODAL HEADER */}

            <div className="bg-indigo-600 border-b border-gray-200 text-white p-6 flex justify-between items-center">

              <div className="flex items-center gap-3">
                <FaReply className="text-xl" />
                <h2 className="text-2xl font-bold">Reply to Message</h2>
              </div>

              <button
                onClick={() => setShowReplyModal(false)}
                className="text-gray-400 hover:text-white transition text-xl"
              >
                <FaTimes />
              </button>

            </div>

            {/* MODAL BODY */}

            <div className="p-6">

              {/* ORIGINAL MESSAGE INFO */}

              <div className="bg-white shadow-lg border border-gray-200 rounded-xl p-4 mb-6">

                <div className="flex items-center gap-3 mb-3">

                  <div className="bg-indigo-50 p-2 rounded-full">
                    <FaUserCircle className="text-indigo-600 text-lg" />
                  </div>

                  <div>

                    <p className="font-bold text-lg text-white">
                      {selectedMessage.name}
                    </p>

                    <p className="text-gray-400 text-sm">
                      {selectedMessage.email}
                    </p>

                  </div>

                  <span className="ml-auto text-gray-400 text-sm">
                    {formatDate(selectedMessage.createdAt)}
                  </span>

                </div>

                <p className="text-gray-600 bg-gray-100 border border-gray-300 rounded-lg p-3">
                  {selectedMessage.message}
                </p>

                {/* SHOW PREVIOUS REPLY IF EXISTS */}

                {selectedMessage.adminReply && (

                  <div className="mt-3 bg-emerald-500/10 rounded-lg p-3 border border-emerald-500/20">

                    <p className="text-sm text-indigo-600 font-semibold mb-1">
                      Previous Reply:
                    </p>

                    <p className="text-gray-600">
                      {selectedMessage.adminReply}
                    </p>

                  </div>

                )}

              </div>

              {/* REPLY TEXTAREA */}

              <div className="mb-6">

                <label className="font-semibold block mb-2 text-white">
                  Your Reply
                </label>

                <textarea
                  rows="5"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply here..."
                  className="w-full bg-white border border-gray-300 p-4 rounded-xl outline-none resize-none focus:border-indigo-500 text-white placeholder-gray-400"
                ></textarea>

              </div>

              {/* MODAL ACTIONS */}

              <div className="flex justify-end gap-4">

                <button
                  onClick={() => setShowReplyModal(false)}
                  className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-slate-700 text-gray-600 transition font-semibold"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSendReply}
                  disabled={sendingReply}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-semibold transition disabled:opacity-50"
                >
                  <FaPaperPlane />
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
