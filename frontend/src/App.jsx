import {
  HashRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useEffect, useState } from "react";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Matches from "./pages/Matches";
import Watchlist from "./pages/Watchlist";
import AboutUs from "./pages/AboutUs";
import TermsOfUse from "./pages/TermsOfUse";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import NotFound from "./pages/NotFound";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin";
import { FiSettings, FiArrowUp } from "react-icons/fi";
import ScrollToTop from "./ScrollToTop";

/* ---------------- AUTH HELPERS ---------------- */
const isAuthenticated = () => {
  return localStorage.getItem("user");
};

const getUserEmail = () => {
  const user = localStorage.getItem("user");
  try {
    return user ? JSON.parse(user).email : null;
  } catch {
    return null;
  }
};

const isAdmin = () => {
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
  return getUserEmail() === adminEmail;
};

/* ---------------- ROUTES ---------------- */
const PrivateRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  return !isAuthenticated() ? children : <Navigate to="/" replace />;
};

const AdminRoute = ({ children }) => {
  return isAuthenticated() && isAdmin() ? (
    children
  ) : (
    <Navigate to="/" replace />
  );
};

/* ---------------- ADMIN FLOAT BUTTON ---------------- */
const AdminFloatingButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Only admin user
  if (!isAdmin()) return null;

  // Hide button on admin page
  if (location.pathname === "/admin") return null;

  return (
    <button
      onClick={() => navigate("/admin")}
      className="fixed bottom-4 left-4 z-50 bg-red-400 hover:bg-red-500 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
      title="Admin Panel"
    >
      <FiSettings size={22} />
    </button>
  );
};

/* ---------------- SCROLL TO TOP BUTTON ---------------- */
const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-50 text-white p-3 sm:p-3.5 rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
          style={{ backgroundColor: "oklch(70.4% 0.191 22.216)" }}
          title="Scroll to top"
        >
          <FiArrowUp size={22} className="sm:hidden" />
          <FiArrowUp size={26} className="hidden sm:block" />
        </button>
      )}
    </>
  );
};

/* ---------------- MAIN APP WRAPPER ---------------- */
const AppContent = () => {
  /* ---------------- ZOOM CONTROL ---------------- */
  useEffect(() => {
    const disableZoomKeys = (event) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        ["+", "-", "0"].includes(event.key)
      ) {
        event.preventDefault();
      }
    };

    const disableWheelZoom = (event) => {
      if (event.ctrlKey) event.preventDefault();
    };

    document.addEventListener("keydown", disableZoomKeys);
    document.addEventListener("wheel", disableWheelZoom, { passive: false });

    return () => {
      document.removeEventListener("keydown", disableZoomKeys);
      document.removeEventListener("wheel", disableWheelZoom);
    };
  }, []);

  /* ---------------- SAVE & RESTORE ROUTE ---------------- */
  useEffect(() => {
    const savedRoute = sessionStorage.getItem("lastRoute");
    if (savedRoute) {
      window.history.replaceState(null, "", savedRoute);
    }
  }, []);

  useEffect(() => {
    const saveRoute = () => {
      sessionStorage.setItem("lastRoute", window.location.pathname);
    };

    window.addEventListener("beforeunload", saveRoute);
    return () => window.removeEventListener("beforeunload", saveRoute);
  }, []);

  return (
    <>
      <AdminFloatingButton />
      <ScrollToTopButton />

      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* Private */}
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/matches"
          element={
            <PrivateRoute>
              <Matches />
            </PrivateRoute>
          }
        />
        <Route
          path="/watchlist"
          element={
            <PrivateRoute>
              <Watchlist />
            </PrivateRoute>
          }
        />

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          }
        />

        {/* Static */}
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/terms" element={<TermsOfUse />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

/* ---------------- ROOT APP ---------------- */
function App() {
  return (
    <HashRouter>
      <ScrollToTop />
      <AppContent />
    </HashRouter>
  );
}

export default App;