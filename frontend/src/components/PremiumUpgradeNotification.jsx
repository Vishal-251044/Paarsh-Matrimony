import { useState, useEffect, useRef, useCallback } from "react";
import {
    FiStar,
    FiX,
    FiCheck,
    FiPhone,
    FiBookmark,
    FiEye,
    FiHeart,
    FiChevronRight,
    FiUsers,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { FaCrown, FaRupeeSign } from "react-icons/fa";

const PremiumUpgradeNotification = ({
    onUpgrade,
    onClose,
    userMembershipType,
    isProfilePublished,
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const hasShownRef = useRef(false);
    const timeoutRef = useRef(null);
    const animationRef = useRef(null);
    const navigate = useNavigate();

    const shouldShow = useCallback(() => {
        return userMembershipType === "free" && isProfilePublished;
    }, [userMembershipType, isProfilePublished]);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (animationRef.current) clearTimeout(animationRef.current);
        };
    }, []);

    useEffect(() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (animationRef.current) clearTimeout(animationRef.current);

        setIsVisible(false);
        setIsAnimating(false);
        setIsClosing(false);
        hasShownRef.current = false;

        if (!shouldShow()) return;

        timeoutRef.current = setTimeout(() => {
            setIsVisible(true);
            animationRef.current = setTimeout(() => {
                setIsAnimating(true);
            }, 50);
            hasShownRef.current = true;
        }, 1500);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (animationRef.current) clearTimeout(animationRef.current);
        };
    }, [shouldShow]);

    const handleClose = useCallback(() => {
        if (isClosing) return;
        setIsClosing(true);
        setIsAnimating(false);

        setTimeout(() => {
            setIsVisible(false);
            onClose && onClose();
        }, 300);
    }, [isClosing, onClose]);

    const handleUpgrade = useCallback(() => {
        if (isClosing) return;

        setIsClosing(true);
        setIsAnimating(false);

        localStorage.setItem("premiumNotificationDismissed", "true");
        localStorage.setItem(
            "premiumNotificationDismissedTimestamp",
            Date.now().toString()
        );

        setTimeout(() => {
            setIsVisible(false);

            // Navigate to plan section
            navigate("/profile#plan");

            onUpgrade && onUpgrade();
        }, 300);
    }, [isClosing, onUpgrade, navigate]);


    if (!isVisible || !shouldShow()) return null;

    return (
        <div
            className={`fixed bottom-3 right-3 md:bottom-4 md:right-4 z-50 transition-all duration-500 ease-out transform ${isAnimating && !isClosing
                    ? "translate-x-0 opacity-100"
                    : "translate-x-full opacity-0"
                }`}
        >
            {/* Main Container */}
            <div className="relative w-[92vw] max-w-[500px] min-w-[280px] bg-gradient-to-br from-white to-[#FFF8F3] rounded-2xl shadow-2xl overflow-hidden border border-[#FFEAD3] transform hover:scale-[1.01] transition-transform duration-300">
                {/* Glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#EA7B7B]/10 via-[#D25353]/10 to-[#9E3B3B]/10 blur-lg -z-10"></div>

                <div className="flex flex-col md:flex-row">
                    {/* LEFT */}
                    <div className="md:w-1/2 bg-gradient-to-r from-[#EA7B7B] via-[#D25353] to-[#9E3B3B] p-4 md:p-5 relative">
                        <button
                            onClick={handleClose}
                            className="absolute top-3 right-3 w-8 h-8 md:w-10 md:h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-300"
                        >
                            <FiX className="text-white text-base md:text-lg" />
                        </button>

                        <div className="flex items-center gap-3 mb-4 md:mb-6">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                <FaCrown className="text-white text-xl md:text-2xl" />
                            </div>
                            <div>
                                <h2 className="text-lg md:text-2xl font-bold text-white">
                                    Go Premium
                                </h2>
                                <p className="text-white/90 text-xs md:text-sm">
                                    Unlock exclusive features
                                </p>
                            </div>
                        </div>

                        {/* Price */}
                        <div className="mb-4 md:mb-6">
                            <div className="inline-flex items-center bg-white/20 px-3 md:px-4 py-2 md:py-3 rounded-xl border border-white/30">
                                <FaRupeeSign className="text-white/90 text-base md:text-lg" />
                                <span className="text-3xl md:text-4xl font-bold text-white">
                                    1999
                                </span>
                                <span className="ml-3 text-white text-xs md:text-sm">
                                    / year
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT */}
                    <div className="md:w-1/2 p-4 md:p-5">
                        {/* Features */}
                        <div className="grid grid-cols-2 gap-2 md:gap-3 mb-4 md:mb-6">
                            {/* Contact */}
                            <Feature icon={<FiPhone />} title="Contact" />

                            {/* Watchlist */}
                            <Feature icon={<FiBookmark />} title="Watchlist" />

                            {/* Hidden on Mobile */}
                            <div className="hidden md:block">
                                <Feature icon={<FiEye />} title="Profiles" />
                            </div>
                            <div className="hidden md:block">
                                <Feature icon={<FiHeart />} title="Planning" />
                            </div>
                        </div>

                        {/* Upgrade Button */}
                        <button
                            onClick={handleUpgrade}
                            className="w-full bg-gradient-to-r from-[#EA7B7B] to-[#9E3B3B] text-white font-bold py-3 md:py-4 rounded-xl text-base md:text-lg flex items-center justify-center gap-2"
                        >
                            <FiStar />
                            Upgrade Now
                            <FiChevronRight />
                        </button>
                    </div>
                </div>

                <div className="h-1 bg-gradient-to-r from-[#EA7B7B] to-[#9E3B3B] w-full animate-pulse"></div>
            </div>
        </div>
    );
};

const Feature = ({ icon, title }) => (
    <div className="p-2 md:p-3 bg-white border border-[#FFEAD3] rounded-xl text-center text-xs md:text-sm">
        <div className="flex justify-center mb-1 text-[#D25353] text-lg">
            {icon}
        </div>
        {title}
    </div>
);

export default PremiumUpgradeNotification;
