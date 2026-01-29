import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Check login from localStorage
    useEffect(() => {
        const user = localStorage.getItem("user");
        setIsLoggedIn(!user);
    }, []);

    // Login click
    const handleLogin = async () => {
        setLoading(true);
        try {
            navigate("/login");
        } finally {
            setLoading(false);
        }
    };

    // Profile click
    const handleProfile = async () => {
        setLoading(true);
        try {
            navigate("/profile");
        } finally {
            setLoading(false);
        }
    };

    // Handle navigation to other pages
    const handlePageNavigation = (page) => {
        navigate(`/${page.toLowerCase().replace(/\s+/g, '-')}`);
    };

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

                {/* Desktop view - Links section (visible on medium screens and above) */}
                <div className="hidden md:flex items-center space-x-6">
                    {!isLoggedIn ? (
                        <>
                            {/* About Us link */}
                            <button
                                onClick={() => handlePageNavigation("/")}
                                className="
                                  text-gray-700 hover:text-[oklch(70.4%_0.191_22.216)]
                                  text-sm font-medium transition-colors
                                "
                            >
                                Home
                            </button>
                            <button
                                onClick={() => handlePageNavigation("/about")}
                                className="
                                  text-gray-700 hover:text-[oklch(70.4%_0.191_22.216)]
                                  text-sm font-medium transition-colors
                                "
                            >
                                About Us
                            </button>
                            
                            {/* Terms of Use link */}
                            <button
                                onClick={() => handlePageNavigation("/terms")}
                                className="
                                  text-gray-700 hover:text-[oklch(70.4%_0.191_22.216)]
                                  text-sm font-medium transition-colors
                                "
                            >
                                Terms of Use
                            </button>
                            
                            {/* Privacy Policy link */}
                            <button
                                onClick={() => handlePageNavigation("/privacy")}
                                className="
                                  text-gray-700 hover:text-[oklch(70.4%_0.191_22.216)]
                                  text-sm font-medium transition-colors
                                "
                            >
                                Privacy Policy
                            </button>
                            
                            {/* Login button */}
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
                            {/* Watchlist button (desktop view) */}
                            <button
                                onClick={() => handlePageNavigation("/")}
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
                                onClick={() => navigate("/matrimony")}
                                className="
                                  relative  text-sm
                                  text-gray-700 hover:text-[oklch(70.4%_0.191_22.216)]
                                  transition-colors
                                "
                            >
                                Matches
                            </button>
                            
                            {/* Profile button (desktop view) */}
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
                                {loading ? "..." : "U"}
                            </button>
                        </>
                    )}
                </div>

                {/* Mobile view - Only show login/profile button (visible on small screens) */}
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
                            {loading ? "..." : "U"}
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;