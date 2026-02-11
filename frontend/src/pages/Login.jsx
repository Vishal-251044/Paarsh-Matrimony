import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, User, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from "../components/Footer";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";

export default function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  // Matrimony theme: elegant rose gold / blush
  const primaryColor = "oklch(70.4% 0.191 22.216)"; // warm peach/pink
  const primaryLight = "oklch(80% 0.12 22.216)";
  const softBg = "#fff9f7"; // off-white with warmth

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // EMAIL LOGIN / SIGNUP
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

  // GOOGLE LOGIN
  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/auth/google`, {
        credential: credentialResponse.credential,
      });

      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("token", response.data.token);

      toast.success("Google login successful!");
      navigate("/profile");
    } catch (err) {
      toast.error("Google login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <ToastContainer position="top-right" />

      {/* CLEAN MATRIMONY BACKGROUND */}
      <div
        className="min-h-screen flex items-center justify-center px-3 py-10 relative"
        style={{ background: softBg }}
      >
        {/* subtle pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: `radial-gradient(${primaryColor} 1px, transparent 1px)`, backgroundSize: '24px 24px' }}
        />

        {/* BACK TO HOME BUTTON - floating at top left */}
        <button
          onClick={() => navigate('/')}
          className="absolute top-6 left-6 z-20 flex items-center gap-2 px-5 py-2.5 bg-white border shadow-sm rounded-full text-gray-700 hover:text-gray-900 transition-all hover:shadow-md"
          style={{ borderColor: '#f0e2e0' }}
        >
          <Home size={18} style={{ color: primaryColor }} />
        </button>

        {/* CARD - CLEAN, WHITE, ELEGANT */}
        <div
          className="
            relative z-10
            w-full max-w-5xl
            bg-white
            rounded-2xl
            shadow-xl
            overflow-hidden
            grid grid-cols-1 md:grid-cols-2
            border border-white/20
          "
        >
          {/* LEFT FORM */}
          <div className="p-8 sm:p-12" style={{ background: 'white' }}>

            {/* subtle matrimony emblem */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-0.5 rounded-full" style={{ background: primaryColor }}></div>
              <span className="text-xs uppercase tracking-[0.3em] font-light text-gray-400">Paarsh Matrimony</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
              {isSignup ? "Begin your journey" : "Welcome back"}
            </h1>

            <p className="text-gray-500 mt-2 text-sm font-light">
              {isSignup
                ? "Find your perfect companion"
                : "Sign in to continue your search"}
            </p>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="mt-10 space-y-5">

              {isSignup && (
                <InputField
                  icon={<User size={18} style={{ color: primaryColor }} />}
                  placeholder="Full Name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  primaryColor={primaryColor}
                />
              )}

              <InputField
                icon={<Mail size={18} style={{ color: primaryColor }} />}
                placeholder="Email Address"
                name="email"
                value={form.email}
                onChange={handleChange}
                type="email"
                primaryColor={primaryColor}
              />

              <div className="relative">
                <InputField
                  icon={<Lock size={18} style={{ color: primaryColor }} />}
                  placeholder="Password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  type={showPassword ? "text" : "password"}
                  primaryColor={primaryColor}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 transition"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* FORGOT PASSWORD - only for login */}
              {!isSignup && (
                <div className="text-right">
                  <button
                    type="button"
                    className="text-xs hover:underline"
                    style={{ color: primaryColor }}
                    onClick={() => toast.info("Please use Google login")}
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {/* BUTTON - elegant matrimony rose */}
              <button
                disabled={loading}
                className="
                  w-full py-2.5 rounded-xl font-medium text-white
                  transition duration-200 ease-in-out
                  hover:shadow-lg hover:shadow-rose-200/50
                  disabled:opacity-60 disabled:cursor-not-allowed
                "
                style={{
                  background: primaryColor,
                  boxShadow: '0 8px 20px -8px oklch(70.4% 0.191 22.216 / 0.4)'
                }}
              >
                {loading
                  ? "Please wait..."
                  : isSignup
                    ? "Create Account"
                    : "Sign In"}
              </button>
            </form>

            {/* DIVIDER */}
            <div className="my-8 flex items-center gap-3 text-gray-400 text-xs">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="font-light">or continue with</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            {/* GOOGLE BUTTON CUSTOM WRAPPER */}
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                width="300"
                locale="en"
                shape="circle"
                theme="outline"
                size="large"
                text="continue_with"
              />
            </div>

            {/* TOGGLE SIGNUP/LOGIN */}
            <p className="mt-8 text-sm text-gray-600 text-center">
              {isSignup ? "Already have an account?" : "New to Paarsh?"}
              <button
                onClick={() => setIsSignup(!isSignup)}
                className="ml-2 font-medium hover:underline transition"
                style={{ color: primaryColor }}
              >
                {isSignup ? "Sign in" : "Create account"}
              </button>
            </p>

            {/* TERMS NOTE */}
            <p className="mt-6 text-xs text-gray-400 text-center leading-relaxed">
              By continuing, you agree to Paarsh's{' '}
              <a href="/terms" className="hover:underline" style={{ color: primaryColor }}>Terms</a>
              {' '}and{' '}
              <a href="/privacy" className="hover:underline" style={{ color: primaryColor }}>Privacy Policy</a>
            </p>

          </div>

          {/* RIGHT SIDE - MATRIMONY STYLE IMAGE */}
          <div className="hidden md:block relative bg-gradient-to-br from-rose-50 to-orange-50">
            <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-white/10"></div>
            <img
              src="/3.jpg"
              alt="Happy couple"
              className="w-full h-full object-cover mix-blend-multiply"
            />
            <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-white/90 via-white/40 to-transparent">
              <p className="text-gray-800 font-serif text-xl italic">
                “Two souls, one journey”
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </GoogleOAuthProvider>
  );
}

/* INPUT COMPONENT - matrimony clean style */
function InputField({ icon, primaryColor, ...props }) {
  return (
    <div
      className="
        flex items-center gap-3
        bg-gray-50
        border border-gray-200
        rounded-xl px-4 py-3
        focus-within:border-opacity-100 focus-within:border-2
        transition-all
      "
      style={{
        focusWithin: { borderColor: primaryColor },
      }}
      onFocusCapture={(e) => {
        e.currentTarget.style.borderColor = primaryColor;
        e.currentTarget.style.borderWidth = '2px';
      }}
      onBlurCapture={(e) => {
        e.currentTarget.style.borderColor = '#e5e7eb';
        e.currentTarget.style.borderWidth = '1px';
      }}
    >
      <span className="text-gray-400">{icon}</span>
      <input
        {...props}
        required
        className="
          w-full bg-transparent outline-none
          text-sm text-gray-800 placeholder-gray-400
        "
      />
    </div>
  );
}