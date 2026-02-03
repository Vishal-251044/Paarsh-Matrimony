import { useState, useCallback, memo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { User } from "lucide-react";

// Memoize the navbar to prevent unnecessary re-renders
const Navbar = memo(() => {
    const [isLoggedIn, setIsLoggedIn] = useState(() => {
        // Initialize from localStorage on component mount
        return !!localStorage.getItem("user");
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Update auth status on route changes
    useState(() => {
        // This runs only once on mount
        const checkAuth = () => {
            const user = localStorage.getItem("user");
            setIsLoggedIn(!!user);
        };
        
        // Check auth on mount
        checkAuth();
        
        // Set up storage event listener for cross-tab sync
        const handleStorageChange = (e) => {
            if (e.key === "user") {
                checkAuth();
            }
        };
        
        window.addEventListener("storage", handleStorageChange);
        
        return () => {
            window.removeEventListener("storage", handleStorageChange);
        };
    });

    // Memoize handlers to prevent re-renders
    const handleLogin = useCallback(async () => {
        setLoading(true);
        try {
            navigate("/login");
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    const handleProfile = useCallback(async () => {
        setLoading(true);
        try {
            navigate("/profile");
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    const handlePageNavigation = useCallback((page) => {
        navigate(`/${page.toLowerCase().replace(/\s+/g, '-')}`);
    }, [navigate]);

    // Don't re-render if the route changes but auth status is the same
    const shouldRender = useState(true)[0];

    if (!shouldRender) return null;

    return (
        <nav className="w-full bg-white shadow-sm fixed top-0 left-0 z-50">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                
                {/* Logo */}
                <h1
                    className="
                      text-[oklch(70.4%_0.191_22.216)]
                      text-1xl
                      max-sm:text-2xl
                      sm:text-3xl
                      md:text-4xl
                      tracking-wide
                      select-none
                    "
                    style={{ fontFamily: "'Great Vibes', cursive" }}
                >
                    Paarsh Matrimony
                </h1>

                {/* Desktop view - Links section */}
                <div className="hidden md:flex items-center space-x-6">
                    {!isLoggedIn ? (
                        <>
                            <button
                                onClick={() => navigate("/")}
                                className="
                                  text-gray-700 hover:text-[oklch(70.4%_0.191_22.216)]
                                  text-sm font-medium transition-colors
                                "
                            >
                                Home
                            </button>
                            <button
                                onClick={() => navigate("/about")}
                                className="
                                  text-gray-700 hover:text-[oklch(70.4%_0.191_22.216)]
                                  text-sm font-medium transition-colors
                                "
                            >
                                About Us
                            </button>
                            
                            <button
                                onClick={() => navigate("/terms")}
                                className="
                                  text-gray-700 hover:text-[oklch(70.4%_0.191_22.216)]
                                  text-sm font-medium transition-colors
                                "
                            >
                                Terms of Use
                            </button>
                            
                            <button
                                onClick={() => navigate("/privacy")}
                                className="
                                  text-gray-700 hover:text-[oklch(70.4%_0.191_22.216)]
                                  text-sm font-medium transition-colors
                                "
                            >
                                Privacy Policy
                            </button>
                            
                            <button
                                onClick={handleLogin}
                                disabled={loading}
                                className="
                                  px-5 py-2 rounded-full
                                  text-white text-sm
                                  font-medium
                                  bg-[oklch(70.4%_0.191_22.216)]
                                  hover:opacity-90 transition
                                  disabled:opacity-60
                                "
                            >
                                {loading ? "Loading..." : "Login"}
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => navigate("/")}
                                className="
                                  text-gray-700 hover:text-[oklch(70.4%_0.191_22.216)]
                                  text-sm font-medium transition-colors
                                "
                            >
                                Home
                            </button>
                            <button
                                onClick={() => navigate("/watchlist")}
                                className="
                                  relative text-sm
                                  text-gray-700 hover:text-[oklch(70.4%_0.191_22.216)]
                                  transition-colors
                                "
                            >
                                Watchlist
                            </button>
                            <button
                                onClick={() => navigate("/matches")}
                                className="
                                  relative  text-sm
                                  text-gray-700 hover:text-[oklch(70.4%_0.191_22.216)]
                                  transition-colors
                                "
                            >
                                Matches
                            </button>
                            
                            <button
                                onClick={handleProfile}
                                disabled={loading}
                                className="
                                  w-10 h-10
                                  rounded-full
                                  bg-[oklch(70.4%_0.191_22.216)]
                                  text-white
                                  flex items-center justify-center
                                  font-semibold
                                  disabled:opacity-60
                                  hover:opacity-90 transition
                                "
                            >
                                {loading ? "..." : <User size={20} />}
                            </button>
                        </>
                    )}
                </div>

                {/* Mobile view */}
                <div className="flex md:hidden">
                    {!isLoggedIn ? (
                        <button
                            onClick={handleLogin}
                            disabled={loading}
                            className="
                              px-5 py-2 rounded-full
                              text-white text-sm
                              font-medium
                              bg-[oklch(70.4%_0.191_22.216)]
                              hover:opacity-90 transition
                              disabled:opacity-60
                            "
                        >
                            {loading ? "..." : "Login"}
                        </button>
                    ) : (
                        <button
                            onClick={handleProfile}
                            disabled={loading}
                            className="
                              w-9 h-9
                              rounded-full
                              bg-[oklch(70.4%_0.191_22.216)]
                              text-white
                              flex items-center justify-center
                              font-semibold
                              disabled:opacity-60
                              hover:opacity-90 transition
                            "
                        >
                            {loading ? "..." : <User size={20} />}
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
});

export default Navbar;