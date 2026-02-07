import { useState, useEffect, useCallback, memo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    User,
    Home,
    Info,
    Phone,
    Heart,
    Users,
    Menu,
    X
} from "lucide-react";

// Memoize the navbar to prevent unnecessary re-renders
const Navbar = memo(() => {
    const [isLoggedIn, setIsLoggedIn] = useState(() => {
        return !!localStorage.getItem("user");
    });
    const [loading, setLoading] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isTablet, setIsTablet] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const checkAuth = () => {
            const user = localStorage.getItem("user");
            setIsLoggedIn(!!user);
        };

        checkAuth();

        const handleStorageChange = (e) => {
            if (e.key === "user") {
                checkAuth();
            }
        };

        // Check screen size for tablet devices
        const checkScreenSize = () => {
            const width = window.innerWidth;
            // Show mobile menu for tablets (iPad Mini: 768px, iPad Air: 820px)
            setIsTablet(width <= 1024); // Changed from 768px to 1024px to cover all tablets
        };

        checkScreenSize();

        window.addEventListener("storage", handleStorageChange);
        window.addEventListener("resize", checkScreenSize);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
            window.removeEventListener("resize", checkScreenSize);
        };
    }, []);

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

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

    const navItems = [
        { name: "Home", path: "/", icon: <Home size={20} /> },
        { name: "About", path: "/about", icon: <Info size={20} /> },
        { name: "Contact", path: "/contact", icon: <Phone size={20} /> },
    ];

    const loggedInNavItems = [
        { name: "Home", path: "/", icon: <Home size={20} /> },
        { name: "Matches", path: "/matches", icon: <Users size={20} /> },
        { name: "Watchlist", path: "/watchlist", icon: <Heart size={20} /> },
        { name: "About", path: "/about", icon: <Info size={20} /> },
        { name: "Contact", path: "/contact", icon: <Phone size={20} /> },
    ];

    const currentNavItems = isLoggedIn ? loggedInNavItems : navItems;

    // Determine if we should show desktop navigation or mobile menu button
    const showDesktopNav = !isTablet; // Only show desktop nav on larger screens
    const showMobileMenuButton = isTablet; // Show mobile menu button on tablets and mobiles

    // Helper function to check if a path is active
    const isActivePath = (path) => {
        if (path === "/") {
            return location.pathname === path;
        }
        return location.pathname.startsWith(path);
    };

    return (
        <>
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

                    {/* Desktop Navigation - Only show on large screens (1024px and above) */}
                    {showDesktopNav && (
                        <div className="hidden lg:flex items-center space-x-6">
                            {(isLoggedIn ? loggedInNavItems : navItems).map((item) => (
                                <button
                                    key={item.name}
                                    onClick={() => navigate(item.path)}
                                    className={`
                                        flex items-center space-x-1
                                        transition-colors duration-200
                                        ${isActivePath(item.path) 
                                            ? 'text-[oklch(70.4%_0.191_22.216)]' 
                                            : 'text-gray-700 hover:text-[oklch(70.4%_0.191_22.216)] font-medium'
                                        }
                                    `}
                                >
                                    <span className={`
                                        ${isActivePath(item.path) 
                                            ? 'text-[oklch(70.4%_0.191_22.216)]' 
                                            : 'text-gray-600'
                                        }
                                    `}>
                                        {item.icon}
                                    </span>
                                    <span>{item.name}</span>
                                </button>
                            ))}

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
                                      flex items-center space-x-2
                                    "
                                >
                                    <User size={16} />
                                    <span>{loading ? "Loading..." : "Login"}</span>
                                </button>
                            ) : (
                                <button
                                    onClick={handleProfile}
                                    disabled={loading}
                                    className={`
                                      w-10 h-10
                                      rounded-full
                                      flex items-center justify-center
                                      font-semibold
                                      disabled:opacity-60
                                      hover:opacity-90 transition
                                      ${isActivePath('/profile') 
                                        ? 'bg-[oklch(70.4%_0.191_22.216)] text-white' 
                                        : 'bg-[oklch(70.4%_0.191_22.216)] text-white hover:opacity-90'
                                      }
                                    `}
                                >
                                    {loading ? "..." : <User size={20} />}
                                </button>
                            )}
                        </div>
                    )}

                    {/* Tablet & Mobile Menu Button - Show on tablets and mobiles */}
                    {showMobileMenuButton && (
                        <div className="flex lg:hidden items-center space-x-3">
                            {isLoggedIn ? (
                                <button
                                    onClick={handleProfile}
                                    disabled={loading}
                                    className={`
                                      w-9 h-9
                                      rounded-full
                                      flex items-center justify-center
                                      font-semibold
                                      disabled:opacity-60
                                      hover:opacity-90 transition
                                      ${isActivePath('/profile') 
                                        ? 'bg-[oklch(70.4%_0.191_22.216)] text-white' 
                                        : 'bg-[oklch(70.4%_0.191_22.216)] text-white'
                                      }
                                    `}
                                >
                                    {loading ? "..." : <User size={18} />}
                                </button>
                            ) : (
                                <button
                                    onClick={handleLogin}
                                    disabled={loading}
                                    className={`
                                      px-4 py-2 rounded-full
                                      text-white text-sm
                                      font-medium
                                      bg-[oklch(70.4%_0.191_22.216)]
                                      hover:opacity-90 transition
                                      disabled:opacity-60
                                      flex items-center space-x-1
                                      ${isActivePath('/login') 
                                        ? 'ring-2 ring-[oklch(70.4%_0.191_22.216)] ring-offset-2' 
                                        : ''
                                      }
                                    `}
                                >
                                    <User size={16} />
                                    <span>{loading ? "..." : "Login"}</span>
                                </button>
                            )}

                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="
                                  p-2 rounded-lg
                                  text-gray-700
                                  hover:bg-gray-100 transition
                                "
                            >
                                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    )}
                </div>
            </nav>

            {/* Mobile & Tablet Sidebar */}
            <div
                className={`
                    fixed inset-y-0 right-0 z-40
                    w-64 bg-white shadow-2xl
                    transform transition-transform duration-300 ease-in-out
                    lg:hidden
                    ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
                `}
            >
                <div className="flex flex-col h-full pt-20">
                    {/* Profile Section at Top */}
                    <div className="px-6 py-4 border-b">
                        {isLoggedIn ? (
                            <div className="flex items-center space-x-3">
                                <div className={`
                                    w-12 h-12
                                    rounded-full
                                    flex items-center justify-center
                                    font-semibold
                                    ${isActivePath('/profile') 
                                        ? 'bg-[oklch(70.4%_0.191_22.216)] text-white' 
                                        : 'bg-[oklch(70.4%_0.191_22.216)] text-white'
                                    }
                                `}>
                                    <User size={24} />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-800">Profile</p>
                                    <button
                                        onClick={handleProfile}
                                        className={`
                                            text-sm hover:underline
                                            ${isActivePath('/profile') 
                                                ? 'text-[oklch(70.4%_0.191_22.216)] font-semibold' 
                                                : 'text-[oklch(70.4%_0.191_22.216)]'
                                            }
                                        `}
                                    >
                                        View Profile
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <p className="text-gray-600 text-sm">Welcome to Paarsh Matrimony</p>
                                <button
                                    onClick={handleLogin}
                                    disabled={loading}
                                    className={`
                                        w-full px-4 py-2 rounded-full
                                        text-white text-sm
                                        font-medium
                                        bg-[oklch(70.4%_0.191_22.216)]
                                        hover:opacity-90 transition
                                        disabled:opacity-60
                                        flex items-center justify-center space-x-2
                                        ${isActivePath('/login') 
                                            ? 'ring-2 ring-[oklch(70.4%_0.191_22.216)] ring-offset-2' 
                                            : ''
                                        }
                                    `}
                                >
                                    <User size={16} />
                                    <span>{loading ? "Loading..." : "Login / Sign Up"}</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Navigation Links */}
                    <div className="flex-1 px-4 py-6 space-y-2">
                        {currentNavItems.map((item) => (
                            <button
                                key={item.name}
                                onClick={() => navigate(item.path)}
                                className={`
                                    w-full flex items-center space-x-3 px-4 py-3 rounded-lg
                                    transition duration-200
                                    ${isActivePath(item.path)
                                        ? 'bg-[oklch(70.4%_0.191_22.216)]/10 text-[oklch(70.4%_0.191_22.216)] font-semibold'
                                        : 'text-gray-700 hover:bg-gray-50'
                                    }
                                `}
                            >
                                <div className={`
                                    ${isActivePath(item.path)
                                        ? 'text-[oklch(70.4%_0.191_22.216)]'
                                        : 'text-gray-500'
                                    }
                                `}>
                                    {item.icon}
                                </div>
                                <span className="font-medium">{item.name}</span>
                            </button>
                        ))}
                    </div>

                    {/* Copyright */}
                    <div className="px-6 py-4 border-t">
                        <p className="text-xs text-gray-500 text-center">
                            © {new Date().getFullYear()} Paarsh Matrimony
                        </p>
                    </div>
                </div>
            </div>

            {/* Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
        </>
    );
});

export default Navbar;