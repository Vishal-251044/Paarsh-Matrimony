import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Mail, Menu, X, Users, Crown, Eye, EyeOff, Send } from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const tabs = [
  { key: "free", label: "Free Users", icon: Users },
  { key: "premium", label: "Premium Users", icon: Crown },
  { key: "hidden", label: "Hidden Profiles", icon: EyeOff },
  { key: "published", label: "Published Profiles", icon: Eye },
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

  const ActiveIcon = tabs.find(t => t.key === activeTab)?.icon || Mail;

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 min-h-screen bg-gradient-to-br from-gray-50 to-red-50/30">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold flex items-center gap-2" style={{ color: 'black' }}>
            <div className="p-2 rounded-xl bg-gradient-to-br from-red-50 to-red-100 border border-red-200 shadow-sm">
              <Mail className="w-6 h-6 md:w-8 md:h-8 text-red-500" />
            </div>
            Send Notification
          </h1>
          <p className="text-gray-600 text-xs md:text-sm lg:text-base mt-1">
            Send combined message to users based on plans
          </p>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden self-end flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          <span className="font-medium">Menu</span>
        </button>
      </div>

      {/* Tabs - Desktop */}
      <div className="hidden md:flex space-x-2 bg-white/80 backdrop-blur-sm p-2 rounded-2xl shadow-sm border border-red-100">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all duration-300 text-sm lg:text-base
                ${isActive
                  ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/25 scale-[1.02]"
                  : "bg-white text-gray-600 hover:bg-red-50 hover:text-red-600 border border-gray-200 hover:border-red-200"
                }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "animate-pulse" : ""}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tabs - Mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-red-100 p-3 animate-slideDown">
          <div className="grid grid-cols-2 gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveTab(tab.key);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-center gap-2 px-3 py-3.5 rounded-xl font-medium text-sm transition-all duration-200
                    ${isActive
                      ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md shadow-red-500/30"
                      : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-red-100 overflow-hidden">
        {/* Stats Header */}
        <div className="p-5 md:p-6 border-b border-red-100 bg-gradient-to-r from-red-50/50 to-white">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30`}>
              <ActiveIcon className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">Active Category</p>
              <p className="text-xl md:text-2xl font-bold text-gray-800">
                {tabs.find(t => t.key === activeTab)?.label}
              </p>
            </div>
            <div className="ml-auto">
              <div className="px-4 py-2 bg-red-50 rounded-xl border border-red-200">
                <p className="text-xs text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-red-500 text-center">{users.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 md:p-6">
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gradient-to-r from-red-500 to-red-600">
                  <th className="px-4 py-3.5 text-left text-xs md:text-sm font-semibold text-white rounded-tl-lg">#</th>
                  <th className="px-4 py-3.5 text-left text-xs md:text-sm font-semibold text-white">Name</th>
                  <th className="px-4 py-3.5 text-left text-xs md:text-sm font-semibold text-white rounded-tr-lg">Email</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((u, idx) => (
                  <tr 
                    key={u.id} 
                    className="hover:bg-red-50/50 transition-colors duration-150 group"
                  >
                    <td className="px-4 py-3 text-xs md:text-sm text-gray-600 font-medium">
                      <span className="bg-gray-100 group-hover:bg-red-100 w-6 h-6 rounded-full flex items-center justify-center text-xs transition-colors duration-150">
                        {idx + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs md:text-sm font-medium text-gray-800">
                      {u.name || u.fullName || "-"}
                    </td>
                    <td className="px-4 py-3 text-xs md:text-sm text-gray-600 truncate max-w-[150px] md:max-w-none">
                      {u.email}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="w-8 h-8 text-gray-300" />
                        <p className="text-gray-400 text-sm md:text-base font-medium">
                          No users found in this category
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Message Input */}
          <div className="mt-6 space-y-4">
            <div className="relative">
              <textarea
                className="w-full p-4 pr-12 border-2 rounded-xl focus:ring-2 focus:outline-none focus:ring-red-400 focus:border-red-400 border-red-200 text-sm md:text-base resize-none transition-all duration-200"
                rows={4}
                placeholder={`Write your message to ${tabs.find(t => t.key === activeTab)?.label.toLowerCase()}...`}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <div className="absolute bottom-3 right-3 text-red-300">
                <Mail className="w-5 h-5" />
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={sendNotification}
                disabled={loading}
                className="group relative px-6 py-3.5 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 disabled:from-gray-400 disabled:to-gray-500 disabled:shadow-none transition-all duration-200 w-full md:w-auto overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                      Send Notification
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNotification;