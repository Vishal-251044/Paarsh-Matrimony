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
    const [scrolled, setScrolled] = useState(false);
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

        const checkScreenSize = () => {
            const width = window.innerWidth;
            setIsTablet(width < 1024);
        };

        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };

        checkScreenSize();

        window.addEventListener("storage", handleStorageChange);
        window.addEventListener("resize", checkScreenSize);
        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
            window.removeEventListener("resize", checkScreenSize);
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

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
    const showDesktopNav = !isTablet;
    const showMobileMenuButton = isTablet;

    const isActivePath = (path) => {
        if (path === "/") {
            return location.pathname === path;
        }
        return location.pathname.startsWith(path);
    };

    const primaryColor = "oklch(70.4% 0.191 22.216)";

    return (
        <>
            <nav className={`
                w-full fixed top-0 left-0 z-50
                transition-all duration-500 ease-in-out
                ${scrolled
                    ? 'bg-white/90 backdrop-blur-lg shadow-[0_8px_32px_rgba(0,0,0,0.08)]'
                    : 'bg-white shadow-sm'
                }
            `}>
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    {/* Logo with animation */}
                    <h1
                        className="
                            relative group cursor-pointer
                            text-[oklch(70.4%_0.191_22.216)]
                            text-1xl max-sm:text-2xl sm:text-3xl md:text-4xl
                            tracking-wide select-none
                            transition-all duration-300
                        "
                        style={{ fontFamily: "'Great Vibes', cursive" }}
                        onClick={() => {
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                    >
                        <span className="relative inline-block">
                            Paarsh Matrimony
                            <span className="
                                absolute -bottom-1 left-0 w-0 h-0.5 
                                bg-[oklch(70.4%_0.191_22.216)]
                            " />
                        </span>
                    </h1>

                    {/* Desktop Navigation */}
                    {showDesktopNav && (
                        <div className="hidden lg:flex items-center space-x-1">
                            {(isLoggedIn ? loggedInNavItems : navItems).map((item, index) => (
                                <button
                                    data-testid={`nav-${item.name.toLowerCase()}`}
                                    key={item.name}
                                    onClick={() => {
                                        navigate(item.path);
                                        if (item.path === "/matches" || item.path === "/watchlist") {
                                            window.location.reload();
                                        }
                                    }}
                                    className={`
                                        relative group px-3 py-2 mx-1
                                        flex items-center space-x-2
                                        transition-all duration-300
                                        rounded-lg
                                        ${isActivePath(item.path)
                                            ? 'text-[oklch(70.4%_0.191_22.216)] bg-gradient-to-r from-[oklch(70.4%_0.191_22.216/0.08)] to-transparent'
                                            : 'text-gray-700 hover:text-[oklch(70.4%_0.191_22.216)]'
                                        }
                                    `}
                                >
                                    <span className={`
                                        transition-all duration-300
                                        ${isActivePath(item.path)
                                            ? 'scale-110 text-[oklch(70.4%_0.191_22.216)]'
                                            : 'group-hover:scale-110 group-hover:text-[oklch(70.4%_0.191_22.216)]'
                                        }
                                    `}>
                                        {item.icon}
                                    </span>
                                    <span className="font-medium">{item.name}</span>

                                    {/* Animated underline */}
                                    <span className={`
                                        absolute bottom-0 left-1/2 -translate-x-1/2
                                        h-0.5 bg-[oklch(70.4%_0.191_22.216)]
                                        transition-all duration-300
                                        ${isActivePath(item.path)
                                            ? 'w-1/2'
                                            : 'w-0 group-hover:w-1/2'
                                        }
                                    `} />
                                </button>
                            ))}

                            {!isLoggedIn ? (
                                <button
                                    data-testid="nav-login"
                                    onClick={handleLogin}
                                    disabled={loading}
                                    className="
                                        relative group ml-4 px-5 py-2
                                        rounded-full overflow-hidden
                                        text-white text-sm font-medium
                                        disabled:opacity-60 disabled:hover:scale-100
                                        flex items-center space-x-2
                                    "
                                    style={{
                                        background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor} 50%, oklch(65% 0.18 22) 100%)`,
                                        backgroundSize: '200% auto'
                                    }}
                                >
                                    <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                    <User size={16} className="relative z-10 transition-transform group-hover:rotate-12" />
                                    <span className="relative z-10">{loading ? "Loading..." : "Login"}</span>
                                    {loading && (
                                        <span className="absolute inset-0 border-2 border-white/30 rounded-full animate-ping" />
                                    )}
                                </button>
                            ) : (
                                <button
                                    data-testid="nav-profile"
                                    onClick={handleProfile}
                                    disabled={loading}
                                    className={`
                                        relative group ml-4 w-10 h-10
                                        rounded-full
                                        flex items-center justify-center
                                        font-semibold
                                        transition-all duration-300
                                        ${isActivePath('/profile')
                                            ? 'bg-[oklch(70.4%_0.191_22.216)] text-white ring-4 ring-[oklch(70.4%_0.191_22.216/0.3)]'
                                            : 'bg-[oklch(70.4%_0.191_22.216)] text-white'
                                        }
                                    `}
                                >
                                    <User
                                        size={20}
                                        className="transition-transform group-hover:rotate-12"
                                    />
                                    {loading && (
                                        <span className="absolute inset-0 border-2 border-white/30 rounded-full animate-ping" />
                                    )}
                                </button>
                            )}
                        </div>
                    )}

                    {/* Tablet & Mobile Menu Button */}
                    {showMobileMenuButton && (
                        <div className="flex lg:hidden items-center space-x-3">
                            {isLoggedIn ? (
                                <button
                                    onClick={handleProfile}
                                    disabled={loading}
                                    className={`
                                        relative group w-9 h-9
                                        rounded-full
                                        flex items-center justify-center
                                        font-semibold
                                        transition-all duration-300
                                        hover:scale-110 hover:shadow-lg
                                        disabled:opacity-60 disabled:hover:scale-100
                                        ${isActivePath('/profile')
                                            ? 'bg-[oklch(70.4%_0.191_22.216)] text-white ring-4 ring-[oklch(70.4%_0.191_22.216/0.3)]'
                                            : 'bg-[oklch(70.4%_0.191_22.216)] text-white'
                                        }
                                    `}
                                >
                                    <User
                                        size={18}
                                        className="transition-transform group-hover:rotate-12"
                                    />
                                </button>
                            ) : (
                                <button
                                    data-testid="mobile-nav-login"
                                    onClick={handleLogin}
                                    disabled={loading}
                                    className="
                                        relative group px-4 py-2
                                        rounded-full overflow-hidden
                                        text-white text-sm font-medium
                                        transition-all duration-300
                                        hover:shadow-lg hover:scale-105
                                        disabled:opacity-60 disabled:hover:scale-100
                                        flex items-center space-x-1
                                    "
                                    style={{
                                        background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor} 50%, oklch(65% 0.18 22) 100%)`,
                                        backgroundSize: '200% auto'
                                    }}
                                >
                                    <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                    <User size={16} className="relative z-10 transition-transform group-hover:rotate-12" />
                                    <span className="relative z-10">{loading ? "..." : "Login"}</span>
                                </button>
                            )}

                            <button
                                onClick={() => setIsMobileMenuOpen(prev => !prev)}
                                className="
                                    relative group p-2
                                    rounded-lg
                                    text-gray-700
                                    hover:bg-gray-100
                                    transition-all duration-300
                                    hover:scale-110
                                "
                            >
                                <div className="relative">
                                    {isMobileMenuOpen ? (
                                        <X size={24} className="transition-all duration-300 rotate-90 group-hover:rotate-180" />
                                    ) : (
                                        <Menu size={24} className="transition-all duration-300 group-hover:rotate-180" />
                                    )}
                                </div>
                            </button>
                        </div>
                    )}
                </div>
            </nav>

            {/* Mobile & Tablet Sidebar */}
            <div
                id="mobile-sidebar"
                className={`
                    fixed inset-y-0 right-0 z-40
                    w-64 bg-white/95 backdrop-blur-xl
                    shadow-2xl
                    transform transition-all duration-500 ease-out
                    lg:hidden
                    ${isMobileMenuOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
                `}
            >
                <div className="flex flex-col h-full pt-20">
                    {/* Profile Section with Animation */}
                    <div className="px-6 py-6 border-b border-gray-100">
                        {isLoggedIn ? (
                            <div className="flex items-center space-x-4 animate-slideIn">
                                <div className={`
                                    relative group w-14 h-14
                                    rounded-full
                                    flex items-center justify-center
                                    font-semibold
                                    transition-all duration-300
                                    hover:scale-110 hover:shadow-lg
                                    ${isActivePath('/profile')
                                        ? 'bg-[oklch(70.4%_0.191_22.216)] text-white ring-4 ring-[oklch(70.4%_0.191_22.216/0.3)]'
                                        : 'bg-[oklch(70.4%_0.191_22.216)] text-white'
                                    }
                                `}>
                                    <User
                                        size={28}
                                        className="transition-transform group-hover:rotate-12"
                                    />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800">Welcome Back!</p>
                                    <button
                                        onClick={handleProfile}
                                        className="
                                            text-sm
                                            transition-all duration-300
                                            hover:translate-x-1
                                            text-[oklch(70.4%_0.191_22.216)]
                                            hover:underline
                                            flex items-center space-x-1
                                        "
                                    >
                                        <span>View Profile</span>
                                        <span className="opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">→</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4 animate-slideIn">
                                <p className="text-gray-600 text-sm">Welcome to Paarsh Matrimony</p>
                                <button
                                    onClick={handleLogin}
                                    disabled={loading}
                                    className="
                                        relative group w-full px-4 py-3
                                        rounded-full overflow-hidden
                                        text-white text-sm font-medium
                                        transition-all duration-300
                                        hover:shadow-lg hover:scale-105
                                        disabled:opacity-60 disabled:hover:scale-100
                                        flex items-center justify-center space-x-2
                                    "
                                    style={{
                                        background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor} 50%, oklch(65% 0.18 22) 100%)`,
                                        backgroundSize: '200% auto'
                                    }}
                                >
                                    <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                    <User size={16} className="relative z-10 transition-transform group-hover:rotate-12" />
                                    <span className="relative z-10">{loading ? "Loading..." : "Login / Sign Up"}</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Navigation Links with Staggered Animation */}
                    <div className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                        {currentNavItems.map((item, index) => (
                            <button
                                data-testid={`mobile-nav-${item.name.toLowerCase()}`}
                                key={item.name}
                                onClick={() => {
                                    navigate(item.path);
                                    if (item.path === "/matches" || item.path === "/watchlist") {
                                        window.location.reload();
                                    }
                                }}
                                className={`
            relative group w-full
            flex items-center space-x-3 px-6 py-4
            rounded-lg
            transition-all duration-300
            hover:translate-x-2
            ${isActivePath(item.path)
                                        ? 'bg-gradient-to-r from-[oklch(70.4%_0.191_22.216/0.1)] to-transparent text-[oklch(70.4%_0.191_22.216)]'
                                        : 'text-gray-700 hover:bg-gray-50'
                                    }
        `}
                                style={{
                                    animation: `slideInRight 0.5s ease-out ${index * 0.1}s both`
                                }}
                            >
                                <div className={`
                                    transition-all duration-300
                                    ${isActivePath(item.path)
                                        ? 'scale-110 text-[oklch(70.4%_0.191_22.216)]'
                                        : 'group-hover:scale-110 group-hover:text-[oklch(70.4%_0.191_22.216)]'
                                    }
                                `}>
                                    {item.icon}
                                </div>
                                <span className="font-medium">{item.name}</span>

                                {/* Active indicator */}
                                {isActivePath(item.path) && (
                                    <span className="absolute left-0 w-1 h-8 bg-[oklch(70.4%_0.191_22.216)] rounded-r-full" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Copyright with Fade Animation */}
                    <div className="px-6 py-4 border-t border-gray-100">
                        <p className="text-xs text-gray-500 text-center animate-fadeIn">
                            © {new Date().getFullYear()} Paarsh Matrimony
                        </p>
                    </div>
                </div>
            </div>

            {/* Animated Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden animate-fadeIn"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            <style jsx>{`
                @keyframes slideInRight {
                    from {
                        opacity: 0;
                        transform: translateX(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
                
                .animate-slideIn {
                    animation: slideInRight 0.5s ease-out both;
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out both;
                }
            `}</style>
        </>
    );
});

export default Navbar;