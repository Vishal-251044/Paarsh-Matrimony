import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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

// check login
const isAuthenticated = () => {
  return localStorage.getItem("user");
};

// Private Route
const PrivateRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

// Public Route
const PublicRoute = ({ children }) => {
  return !isAuthenticated() ? children : <Navigate to="/" replace />;
};

function App() {
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isChrome = userAgent.includes("chrome") && !userAgent.includes("brave");
    const isBrave = userAgent.includes("brave");

    if (isChrome) {
      document.body.style.zoom = "100%";
    } else if (isBrave) {
      document.body.style.zoom = "100%";
    }
  }, []);

  useEffect(() => {
    const disableZoomKeys = (event) => {
      if ((event.ctrlKey || event.metaKey) && ["+", "-", "0"].includes(event.key)) {
        event.preventDefault();
      }
    };

    const disableWheelZoom = (event) => {
      if (event.ctrlKey) event.preventDefault();
    };

    const disableTouchZoom = (event) => {
      if (event.touches.length > 1) event.preventDefault();
    };

    document.addEventListener("keydown", disableZoomKeys);
    document.addEventListener("wheel", disableWheelZoom, { passive: false });
    document.addEventListener("touchmove", disableTouchZoom, { passive: false });

    return () => {
      document.removeEventListener("keydown", disableZoomKeys);
      document.removeEventListener("wheel", disableWheelZoom);
      document.removeEventListener("touchmove", disableTouchZoom);
    };
  }, []);

  return (
    <BrowserRouter>
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

        {/* Static */}
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/terms" element={<TermsOfUse />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
