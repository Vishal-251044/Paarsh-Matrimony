import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiSettings } from "react-icons/fi";
import axios from "axios";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showPasswordBox, setShowPasswordBox] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem("token");

  // Update the useEffect in Profile.jsx
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      if (!storedUser || !token) {
        navigate("/login");
        return;
      }

      // Try to parse, but handle errors
      let parsedUser;
      try {
        parsedUser = JSON.parse(storedUser);
      } catch (parseError) {
        console.error("Failed to parse user data:", parseError);
        localStorage.clear();
        navigate("/login");
        return;
      }

      if (!parsedUser?.email) {
        navigate("/login");
        return;
      }

      setUser(parsedUser);
    } catch (err) {
      console.error("Profile load error:", err);
      localStorage.clear();
      navigate("/login");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    toast.success("Logged out successfully!");
    navigate("/login");
  };

  const handlePasswordUpdate = async () => {
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    try {
      await axios.put(
        `${BACKEND_URL}/auth/set-password`,
        { email: user.email, new_password: newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Password updated successfully!");
      setShowPasswordBox(false);
      setNewPassword("");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || "Failed to update password");
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex justify-center items-center">
          <p className="text-gray-500">Loading profile...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (!user) return null;

  return (
    <>
      <ToastContainer position="top-right" />
      <Navbar />

      <div className="min-h-screen flex flex-col justify-center items-center p-6">
        <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md text-center relative">
          {/* User avatar */}
          <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center mx-auto text-xl font-bold mb-4">
            {user.name[0].toUpperCase()}
          </div>

          <h1 className="text-2xl font-bold mb-1">{user.name}</h1>
          <p className="text-gray-700 mb-2">{user.email}</p>
          {user.google_id && (
            <p className="text-sm text-green-600 mb-4">Logged in using Google</p>
          )}

          {/* Settings Icon */}
          <div className="absolute top-4 right-4">
            <FiSettings
              size={24}
              className="cursor-pointer text-gray-600 hover:text-gray-800"
              onClick={() => setShowSettings(!showSettings)}
            />
            {showSettings && (
              <div className="absolute right-0 mt-2 w-48 bg-white border shadow-lg rounded-lg text-left z-50">
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={() => { setShowPasswordBox(true); setShowSettings(false); }}
                >
                  Change Password
                </button>
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Change Password Box */}
          {showPasswordBox && (
            <div className="mt-4 p-4 bg-gray-100 rounded-lg">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full px-3 py-2 rounded-lg border outline-none mb-2"
              />
              <button
                onClick={handlePasswordUpdate}
                className="w-full py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
              >
                Update Password
              </button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Profile;
