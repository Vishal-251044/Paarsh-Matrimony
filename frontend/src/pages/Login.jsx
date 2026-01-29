import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import Footer from "../components/Footer";

export default function LoginPage() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [isSignup, setIsSignup] = useState(false);

  const gold = "oklch(70.4%_0.191_22.216)";

  return (
    <>
      <div
        className="min-h-screen flex justify-center items-center px-2 py-16 sm:py-5 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('3.jpg')",
        }}
      >
        <div
          className="
          w-full max-w-md
          bg-white
          rounded-2xl
          shadow-[0_10px_40px_rgba(0,0,0,0.08)]
          p-6 sm:p-8
          transition-all
        "
        >
          {/* Header */}
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
          <form className="mt-6 space-y-4">

            {/* Name (Signup only) */}
            {isSignup && (
              <div>
                <label className="text-sm text-gray-600">Name</label>
                <div className="mt-1 flex items-center gap-2 border rounded-lg px-3 py-2 focus-within:border-[oklch(70.4%_0.191_22.216)]">
                  <User size={18} className="text-gray-400" />
                  <input
                    type="text"
                    placeholder="Your full name"
                    className="w-full outline-none text-gray-800 placeholder-gray-400 text-sm"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="text-sm text-gray-600">Email</label>
              <div className="mt-1 flex items-center gap-2 border rounded-lg px-3 py-2 focus-within:border-[oklch(70.4%_0.191_22.216)]">
                <Mail size={18} className="text-gray-400" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full outline-none text-gray-800 placeholder-gray-400 text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-sm text-gray-600">Password</label>
              <div className="mt-1 flex items-center gap-2 border rounded-lg px-3 py-2 focus-within:border-[oklch(70.4%_0.191_22.216)]">
                <Lock size={18} className="text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  className="w-full outline-none text-gray-800 placeholder-gray-400 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-[oklch(70.4%_0.191_22.216)]"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="
              w-full mt-3 py-2.5
              rounded-lg text-white font-medium
              bg-[oklch(70.4%_0.191_22.216)]
              hover:opacity-90 transition
            "
            >
              {isSignup ? "Sign Up" : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-xs text-gray-400">or continue with</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Google Login */}
          <button
            onClick={() => console.log("Google login clicked")}
            className="
            w-full flex items-center justify-center gap-3
            py-2.5
            bg-white
            border border-[oklch(70.4%_0.191_22.216/40)]
            rounded-xl
            shadow-md
            transition-all duration-300
            text-gray-800 font-medium
          "
          >
            <FcGoogle size={20} className="text-red-500" />
            Continue with Google
          </button>

          {/* Toggle Login / Signup */}
          <p className="text-center text-sm text-gray-500 mt-5">
            {isSignup ? (
              <>
                Already have an account?{" "}
                <span
                  onClick={() => setIsSignup(false)}
                  className="cursor-pointer hover:underline"
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
                  className="cursor-pointer hover:underline"
                  style={{ color: gold }}
                >
                  Sign up
                </span>
              </>
            )}
          </p>

          {/* Back to home */}
          <p
            onClick={() => navigate("/")}
            className="text-center text-xs text-gray-400 mt-6 cursor-pointer hover:text-[oklch(70.4%_0.191_22.216)]"
          >
            Back to home
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}
