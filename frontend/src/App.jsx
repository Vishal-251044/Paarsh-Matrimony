import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useEffect } from "react";
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
import { FiSettings } from "react-icons/fi";

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
      className="fixed bottom-6 right-6 z-50 bg-red-400 hover:bg-red-500 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
      title="Admin Panel"
    >
      <FiSettings size={22} />
    </button>
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

  /* ---------------- BLOCK REFRESH KEYS ---------------- */
  useEffect(() => {
    const blockRefresh = (e) => {
      if (
        e.key === "F5" ||
        (e.ctrlKey && e.key.toLowerCase() === "r") ||
        (e.metaKey && e.key.toLowerCase() === "r")
      ) {
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", blockRefresh);
    return () => window.removeEventListener("keydown", blockRefresh);
  }, []);

  /* ---------------- MOBILE PULL REFRESH BLOCK ---------------- */
  useEffect(() => {
    let startY = 0;

    const handleTouchStart = (e) => {
      startY = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      const currentY = e.touches[0].clientY;
      const diffY = currentY - startY;

      // If user is at top and pulling down more than 10px
      if (window.scrollY === 0 && diffY > 10) {
        e.preventDefault(); // block refresh
      }
    };

    document.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });
    document.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  /* ---------------- PREVENT BACK NAVIGATION ---------------- */
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    window.onpopstate = () => {
      window.history.pushState(null, "", window.location.href);
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
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
