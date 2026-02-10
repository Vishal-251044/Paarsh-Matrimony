import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Mail, Menu, X } from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const tabs = [
  { key: "free", label: "Free Users" },
  { key: "premium", label: "Premium Users" },
  { key: "hidden", label: "Hidden Profiles" },
  { key: "published", label: "Published Profiles" },
];

const AdminNotification = () => {
  const [activeTab, setActiveTab] = useState("free");
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [activeTab]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BACKEND_URL}/admin/notifications/users?type=${activeTab}`);
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const sendNotification = async () => {
    if (!message.trim()) {
      toast.error("Message cannot be empty");
      return;
    }
    try {
      setLoading(true);
      await axios.post(`${BACKEND_URL}/admin/notifications/send?type=${activeTab}&message=${message}`);
      toast.success("Notification sent successfully");
      setMessage("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to send notification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold flex items-center gap-2" style={{ color: 'black' }}>
            <Mail className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8" />
            Send Notification
          </h1>
          <p className="text-gray-600 text-xs md:text-sm lg:text-base mt-1">
            Send combined message to users based on plans
          </p>
        </div>
        
        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden self-end flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          <span>Menu</span>
        </button>
      </div>

      {/* Tabs - Desktop */}
      <div className="hidden md:flex space-x-4 border-b-2 border-red-200 mb-4 md:mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 md:px-5 py-2 -mb-0.5 font-semibold border-b-2 transition-colors duration-200 text-sm md:text-base
              ${activeTab === tab.key
                ? "border-red-500 text-red-600"
                : "border-transparent text-gray-600 hover:text-red-500 hover:border-red-300"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tabs - Mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white rounded-xl shadow-lg p-4 mb-4">
          <div className="grid grid-cols-2 gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  setMobileMenuOpen(false);
                }}
                className={`px-3 py-3 rounded-lg font-medium text-sm transition-colors duration-200
                  ${activeTab === tab.key
                    ? "bg-red-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-lg p-4 md:p-5">
        <p className="mb-3 text-xs md:text-sm text-gray-500 font-medium">
          Showing <span className="font-bold text-red-500">{users.length}</span> users in this category
        </p>

        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border border-gray-200 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-red-50">
                <th className="px-3 py-2 md:px-4 md:py-3 border text-left text-xs md:text-sm text-red-600">#</th>
                <th className="px-3 py-2 md:px-4 md:py-3 border text-left text-xs md:text-sm text-red-600">Name</th>
                <th className="px-3 py-2 md:px-4 md:py-3 border text-left text-xs md:text-sm text-red-600">Email</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, idx) => (
                <tr key={u.id} className="hover:bg-red-50 transition-colors">
                  <td className="px-3 py-2 md:px-4 md:py-2 border text-xs md:text-sm">{idx + 1}</td>
                  <td className="px-3 py-2 md:px-4 md:py-2 border text-xs md:text-sm">{u.name || u.fullName || "-"}</td>
                  <td className="px-3 py-2 md:px-4 md:py-2 border text-xs md:text-sm truncate max-w-[150px] md:max-w-none">{u.email}</td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-4 md:py-6 text-center text-gray-400 text-sm md:text-base">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Message Input */}
        <div className="mt-4 md:mt-5 space-y-3">
          <textarea
            className="w-full p-3 md:p-4 border rounded-lg focus:ring-2 focus:outline-none focus:ring-red-400 border-red-200 text-sm md:text-base"
            rows={3}
            placeholder={`Write message to ${tabs.find(t => t.key === activeTab).label}`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          ></textarea>
          <div className="flex justify-end">
            <button
              onClick={sendNotification}
              disabled={loading}
              className="px-4 py-2 md:px-6 md:py-3 bg-red-500 text-white font-semibold rounded-lg shadow hover:bg-red-600 disabled:bg-gray-300 transition-colors duration-200 text-sm md:text-base w-full md:w-auto"
            >
              {loading ? "Sending..." : "Send Notification"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNotification;