import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, User, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from "../components/Footer";
import Chatbot from '../components/Chatbot';
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";

export default function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const existingUser = localStorage.getItem("user");

  // Matrimony theme: elegant rose gold / blush
  const primaryColor = "oklch(70.4% 0.191 22.216)"; // warm peach/pink
  const primaryLight = "oklch(80% 0.12 22.216)";
  const softBg = "#fff9f7"; // off-white with warmth

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleNavigate = (path) => {
    navigate(path);
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  };

  // EMAIL LOGIN / SIGNUP
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Trim email first
    const trimmedEmail = form.email.trim();

    // Simple email validation for signup
    if (isSignup) {
      // Check if email ends with @gmail.com
      if (!trimmedEmail.endsWith('@gmail.com')) {
        toast.error("Only Gmail addresses are allowed");
        return;
      }

      // Check if there's any text before @gmail.com
      const localPart = trimmedEmail.replace('@gmail.com', '');
      if (!localPart || localPart.length === 0) {
        toast.error("Please enter a valid Gmail address");
        return;
      }
    }

    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#()[\]{}\-_=+<>/|.,]).{8,}$/;

    if (!passwordRegex.test(form.password)) {
      toast.error(
        "Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character"
      );
      return;
    }

    if (existingUser && isSignup) {
      toast.error("You are already logged in");
      return;
    }

    if (isSignup && !otpSent) {
      // SEND OTP
      try {
        setLoading(true);
        await axios.post(`${BACKEND_URL}/auth/send-otp`, {
          email: trimmedEmail, // Use trimmed email
        });
        toast.success("OTP sent to email");
        setOtpSent(true);
      } catch (err) {
        const msg =
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          "Failed to send OTP";

        toast.error(msg);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (isSignup && otpSent) {
      // VERIFY OTP - Add length check
      if (otp.length !== 6) {
        toast.error("Enter valid 6 digit OTP");
        return;
      }

      try {
        setLoading(true);
        await axios.post(`${BACKEND_URL}/auth/verify-otp`, {
          email: trimmedEmail, // Use trimmed email
          otp,
        });

        // AFTER OTP VERIFIED → SIGNUP
        const { data } = await axios.post(
          `${BACKEND_URL}/auth/signup`,
          { ...form, email: trimmedEmail } // Use trimmed email
        );

        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);
        toast.success("Signup successful!");
        navigate("/profile");
      } catch {
        toast.error("Invalid OTP");
      } finally {
        setLoading(false);
      }
      return;
    }

    // LOGIN FLOW (UNCHANGED)
    try {
      setLoading(true);
      const { data } = await axios.post(`${BACKEND_URL}/auth/login`, {
        ...form,
        email: trimmedEmail // Use trimmed email
      });
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);
      toast.success("Login successful!");
      navigate("/profile");
    } catch {
      toast.error("Login failed");
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

  // Handle toggle between login and signup - Reset OTP state
  const handleToggleMode = () => {
    setIsSignup(!isSignup);
    setOtpSent(false);
    setOtp("");
  };

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <ToastContainer position="top-right" />

      {/* CLEAN MATRIMONY BACKGROUND */}
      <div
        className="min-h-screen flex items-center justify-center px-3 py-10 relative"
        style={{ background: "oklch(75% 0.14 22.216)" }}
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

        {/* CARD - SMALLER, CLEAN, WHITE, ELEGANT */}
        <div
          className="
            relative z-10
            w-full max-w-4xl
            bg-white
            rounded-2xl
            shadow-xl
            overflow-hidden
            grid grid-cols-1 md:grid-cols-2
            border border-white/20
          "
        >
          {/* LEFT FORM - COMPACT */}
          <div className="p-6 sm:p-8" style={{ background: 'white' }}>

            {/* subtle matrimony emblem */}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-0.5 rounded-full" style={{ background: primaryColor }}></div>
              <span className="text-[0.6rem] uppercase tracking-[0.2em] font-light text-gray-400">Paarsh Matrimony</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              {isSignup ? "Begin your journey" : "Welcome back"}
            </h1>

            <p className="text-gray-500 mt-1 text-xs font-light">
              {isSignup
                ? "Find your perfect companion"
                : "Sign in to continue your search"}
            </p>

            {/* FORM - COMPACT */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">

              {isSignup && (
                <InputField
                  icon={<User size={16} style={{ color: primaryColor }} />}
                  placeholder="Full Name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  primaryColor={primaryColor}
                  disabled={otpSent} // Disable after OTP sent
                />
              )}

              <InputField
                icon={<Mail size={16} style={{ color: primaryColor }} />}
                placeholder="Email Address"
                name="email"
                value={form.email}
                onChange={handleChange}
                type="email"
                primaryColor={primaryColor}
                disabled={otpSent} // Disable after OTP sent
              />

              <div className="relative">
                <InputField
                  icon={<Lock size={16} style={{ color: primaryColor }} />}
                  placeholder="Password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  type={showPassword ? "text" : "password"}
                  primaryColor={primaryColor}
                  disabled={otpSent} // Disable after OTP sent
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition"
                  disabled={otpSent}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* FORGOT PASSWORD - only for login */}
              {!isSignup && (
                <div className="text-right">
                  <button
                    type="button"
                    className="text-[0.7rem] hover:underline"
                    style={{ color: primaryColor }}
                    onClick={() => toast.info("Please use Google login")}
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {isSignup && otpSent && (
                <InputField
                  icon={<Lock size={16} style={{ color: primaryColor }} />}
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  primaryColor={primaryColor}
                />
              )}

              {/* BUTTON - elegant matrimony rose with dynamic text */}
              <button
                disabled={loading}
                className="
                  w-full py-2 rounded-lg font-medium text-white text-sm
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
                    ? otpSent ? "Verify OTP" : "Send OTP"
                    : "Sign In"}
              </button>
            </form>

            {/* DIVIDER - COMPACT */}
            <div className="my-5 flex items-center gap-2 text-gray-400 text-[0.65rem]">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="font-light">or continue with</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            {/* GOOGLE BUTTON CUSTOM WRAPPER - SCALED DOWN */}
            <div className="flex justify-center scale-90">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                width="280"
                locale="en"
                shape="circle"
                theme="outline"
                size="large"
                text="continue_with"
              />
            </div>

            {/* TOGGLE SIGNUP/LOGIN - COMPACT with reset */}
            <p className="mt-5 text-xs text-gray-600 text-center">
              {isSignup ? "Already have an account?" : "New to Paarsh?"}
              <button
                onClick={handleToggleMode}
                className="ml-1.5 font-medium hover:underline transition text-xs"
                style={{ color: primaryColor }}
              >
                {isSignup ? "Sign in" : "Create account"}
              </button>
            </p>

            {/* TERMS NOTE - COMPACT */}
            <p className="mt-4 text-[0.6rem] text-gray-400 text-center leading-relaxed">
              By continuing, you agree to Paarsh's{" "}
              <span
                onClick={() => handleNavigate("/terms")}
                className="hover:underline cursor-pointer"
                style={{ color: primaryColor }}
              >
                Terms
              </span>
              {" "}and{" "}
              <span
                onClick={() => handleNavigate("/privacy")}
                className="hover:underline cursor-pointer"
                style={{ color: primaryColor }}
              >
                Privacy Policy
              </span>
            </p>
          </div>

          {/* RIGHT SIDE - MATRIMONY STYLE IMAGE (FULL HEIGHT, MAINTAINED) */}
          <div className="hidden md:block relative bg-gradient-to-br from-rose-50 to-orange-50">
            <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-white/10"></div>
            <img
              src="/3.5.jpg"
              alt="Happy couple"
              className="w-full h-full object-cover mix-blend-multiply"
            />
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white/90 via-white/40 to-transparent">
              <p className="text-gray-800 font-serif text-lg italic">
                “Two souls, one journey”
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <Chatbot />
    </GoogleOAuthProvider>
  );
}

/* INPUT COMPONENT - matrimony clean style, smaller */
function InputField({ icon, primaryColor, disabled, ...props }) {
  return (
    <div
      className={`
        flex items-center gap-2
        bg-gray-50
        border border-gray-200
        rounded-lg px-3 py-2
        focus-within:border-opacity-100 focus-within:border-2
        transition-all
        ${disabled ? 'opacity-60 bg-gray-100' : ''}
      `}
      style={{
        focusWithin: { borderColor: primaryColor },
      }}
      onFocusCapture={(e) => {
        if (!disabled) {
          e.currentTarget.style.borderColor = primaryColor;
          e.currentTarget.style.borderWidth = '2px';
        }
      }}
      onBlurCapture={(e) => {
        if (!disabled) {
          e.currentTarget.style.borderColor = '#e5e7eb';
          e.currentTarget.style.borderWidth = '1px';
        }
      }}
    >
      <span className="text-gray-400">{icon}</span>
      <input
        {...props}
        required
        disabled={disabled}
        className="
          w-full bg-transparent outline-none
          text-xs text-gray-800 placeholder-gray-400
          disabled:cursor-not-allowed
        "
      />
    </div>
  );
}