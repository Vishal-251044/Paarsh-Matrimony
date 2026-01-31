import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from "../components/Footer";
import { GoogleLogin } from "@react-oauth/google";
import { GoogleOAuthProvider } from "@react-oauth/google";

export default function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const gold = "oklch(70.4%_0.191_22.216)";
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ============================
  // Email / Password Login & Signup
  // ============================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    setLoading(true);
    try {
      const url = isSignup
        ? `${BACKEND_URL}/auth/signup`
        : `${BACKEND_URL}/auth/login`;

      const { data } = await axios.post(url, form);

      if (!data?.user || !data?.token) {
        throw new Error("Invalid response from server");
      }

      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);

      toast.success(isSignup ? "Signup successful!" : "Login successful!");
      navigate("/profile");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      if (!credentialResponse?.credential) {
        throw new Error("No Google credential received");
      }

      const response = await axios.post(`${BACKEND_URL}/auth/google`, {
        credential: credentialResponse.credential, // Send as credential
      });

      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("token", response.data.token);

      toast.success("Google login successful!");
      navigate("/profile");
    } catch (err) {
      console.error("Full Google login error:", err);

      // More detailed error messages
      if (err.response?.status === 401) {
        toast.error("Google authentication failed. Please try again.");
      } else if (err.response?.data?.detail) {
        toast.error(err.response.data.detail);
      } else {
        toast.error("Google login failed. Please check your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Also add error handler for Google button
  const handleGoogleError = () => {
    console.error("Google button error");
    toast.error("Failed to initialize Google login. Check your console.");
  };

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>

      <ToastContainer position="top-right" />

      <div
        className="min-h-screen flex justify-center items-center px-2 py-16 sm:py-5 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('3.jpg')" }}
      >
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <h1
            className="text-2xl sm:text-3xl font-semibold text-center"
            style={{ color: gold }}
          >
            {isSignup ? "Create Account" : "Welcome Back"}
          </h1>

          <p className="text-gray-500 text-sm text-center mt-1">
            {isSignup
              ? "Begin your journey with Paarsh Matrimony"
              : "Login to continue your journey"}
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {isSignup && (
              <div>
                <label className="text-sm text-gray-600">Name</label>
                <div className="mt-1 flex items-center gap-2 border rounded-lg px-3 py-2">
                  <User size={18} className="text-gray-400" />
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    type="text"
                    placeholder="Your full name"
                    className="w-full outline-none text-gray-800 placeholder-gray-400 text-sm"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-sm text-gray-600">Email</label>
              <div className="mt-1 flex items-center gap-2 border rounded-lg px-3 py-2">
                <Mail size={18} className="text-gray-400" />
                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  type="email"
                  placeholder="you@example.com"
                  className="w-full outline-none text-gray-800 placeholder-gray-400 text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-600">Password</label>
              <div className="mt-1 flex items-center gap-2 border rounded-lg px-3 py-2">
                <Lock size={18} className="text-gray-400" />
                <input
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  className="w-full outline-none text-gray-800 placeholder-gray-400 text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-3 py-2.5 rounded-lg text-white font-medium bg-[oklch(70.4%_0.191_22.216)] hover:opacity-90 transition ${loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
            >
              {loading
                ? isSignup
                  ? "Signing Up..."
                  : "Signing In..."
                : isSignup
                  ? "Sign Up"
                  : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-xs text-gray-400">or continue with</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Google Login */}
          <div className="w-full flex justify-center">
            <div className="relative w-full flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap={false}
                render={(renderProps) => (
                  <button
                    onClick={renderProps.onClick}
                    disabled={loading || renderProps.disabled}
                    className="mx-auto flex items-center justify-center gap-3 py-3 px-6 bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                    style={{ minWidth: "280px" }}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span className="text-gray-700 font-medium text-sm">
                      Continue with Google
                    </span>
                  </button>
                )}
              />
            </div>
          </div>

          {/* Toggle */}
          <p className="text-center text-sm text-gray-500 mt-5">
            {isSignup ? (
              <>
                Already have an account?{" "}
                <span
                  onClick={() => setIsSignup(false)}
                  className="cursor-pointer"
                  style={{ color: gold }}
                >
                  Sign in
                </span>
              </>
            ) : (
              <>
                Don&apos;t have an account?{" "}
                <span
                  onClick={() => setIsSignup(true)}
                  className="cursor-pointer"
                  style={{ color: gold }}
                >
                  Sign up
                </span>
              </>
            )}
          </p>

          <p
            onClick={() => navigate("/")}
            className="text-center text-xs text-gray-400 mt-6 cursor-pointer"
          >
            Back to home
          </p>
        </div>
      </div>

      <Footer />
    </GoogleOAuthProvider>
  );
}
