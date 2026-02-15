import React, { useState } from "react";
import { FiStar, FiLoader, FiAlertCircle, FiMapPin, FiClock } from "react-icons/fi";
import { FaSun, FaMoon, FaMars, FaVenus } from "react-icons/fa";
import {
    GiPlanetCore,
    GiLuckyFisherman,
    GiMoonOrbit,
    GiStarShuriken,
    GiStarSwirl,
    GiDwarfFace,
    GiEarthAfricaEurope,
    GiEarthAmerica,
    GiPlanetConquest
} from "react-icons/gi";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

const Kundali = ({ name, dob, gender }) => {
    const [kundaliData, setKundaliData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [birthTime, setBirthTime] = useState("");
    const [birthPlace, setBirthPlace] = useState("");
    const [showForm, setShowForm] = useState(true);
    const [locationDetails, setLocationDetails] = useState(null);

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

    // ---------- GET COORDINATES FROM PLACE ----------
    const getCoordinates = async (place) => {
        try {
            toast.info("Finding location...");

            // Using Nominatim with proper headers
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}&limit=1`,
                {
                    headers: {
                        'User-Agent': 'KundaliApp/1.0'
                    }
                }
            );

            if (!res.ok) {
                throw new Error("Location service error");
            }

            const data = await res.json();

            if (!data || data.length === 0) {
                throw new Error("Place not found. Please enter a valid city name.");
            }

            setLocationDetails({
                name: data[0].display_name,
                lat: parseFloat(data[0].lat),
                lon: parseFloat(data[0].lon)
            });

            return {
                lat: parseFloat(data[0].lat),
                lon: parseFloat(data[0].lon),
                displayName: data[0].display_name
            };
        } catch (error) {
            console.error("Geocoding error:", error);
            throw new Error(error.message || "Unable to find location coordinates");
        }
    };

    // Validate if all required props are present
    if (!name || !dob || !gender) {
        return (
            <div className="max-w-4xl mx-auto p-4">
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                        <FiAlertCircle className="text-yellow-600 text-xl" />
                        <div>
                            <p className="font-medium text-yellow-800">Profile Incomplete</p>
                            <p className="text-sm text-yellow-700">
                                Please complete your profile first to generate Kundali.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ---------- FETCH KUNDALI ----------
    const fetchKundali = async () => {
        if (!birthTime) {
            toast.error("Please enter birth time");
            return;
        }

        if (!birthPlace || birthPlace.trim().length < 3) {
            toast.error("Please enter a valid birth place");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const coords = await getCoordinates(birthPlace);

            // Format date properly (YYYY-MM-DD)
            const formattedDate = new Date(dob).toISOString().split('T')[0];

            // Format time properly (HH:MM:SS)
            const timeParts = birthTime.split(':');
            const formattedTime = `${timeParts[0]}:${timeParts[1]}:00`;

            const requestBody = {
                dob: formattedDate,
                time: formattedTime,
                latitude: coords.lat,
                longitude: coords.lon,
                timezone: 5.5,
            };

            const response = await fetch(`${BACKEND_URL}/api/kundali`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify(requestBody),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Failed to generate Kundali");
            }

            setKundaliData(data);
            setShowForm(false);
            toast.success("✨ Kundali Generated Successfully!");
        } catch (err) {
            console.error("Kundali generation error:", err);
            setError(err.message);
            toast.error(err.message || "Failed to generate Kundali");
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setShowForm(true);
        setKundaliData(null);
        setBirthTime("");
        setBirthPlace("");
        setLocationDetails(null);
        setError(null);
    };

    // Format date for display
    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        } catch {
            return dateString;
        }
    };

    // Get gender icon
    const getGenderIcon = () => {
        if (gender?.toLowerCase() === 'male') return <FaMars className="text-blue-500" />;
        if (gender?.toLowerCase() === 'female') return <FaVenus className="text-pink-500" />;
        return null;
    };

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
            {/* HEADER - Matching Marriage component style */}
            <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-rose-500 to-pink-600 p-3 rounded-xl shadow-lg">
                    <FiStar className="text-white text-xl" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        Kundali / Horoscope
                    </h2>
                    <p className="text-gray-500 text-sm">
                        Discover your cosmic blueprint
                    </p>
                </div>
            </div>

            {/* MAIN CARD - Matching card style from Marriage */}
            <motion.div
                className="card overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
            >
                {/* PROFILE INFO SECTION */}
                <div className="bg-gradient-to-r from-amber-50 via-rose-50 to-purple-50 p-6 border-b border-[#FFEAD3]">
                    <div className="flex flex-wrap items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div>
                                <p className="text-sm text-gray-500">Name</p>
                                <p className="font-semibold text-gray-800 flex items-center gap-2">
                                    {name}
                                    {getGenderIcon()}
                                </p>
                            </div>
                        </div>

                        <div className="h-8 w-px bg-[#FFEAD3] hidden sm:block"></div>

                        <div>
                            <p className="text-sm text-gray-500">Date of Birth</p>
                            <p className="font-semibold text-gray-800">{formatDate(dob)}</p>
                        </div>

                        <div className="h-8 w-px bg-[#FFEAD3] hidden sm:block"></div>

                        <div>
                            <p className="text-sm text-gray-500">Gender</p>
                            <p className="font-semibold text-gray-800 capitalize">{gender}</p>
                        </div>
                    </div>
                </div>

                {/* MAIN CONTENT */}
                <div className="p-6">
                    <AnimatePresence mode="wait">
                        {showForm ? (
                            /* INPUT FORM */
                            <motion.div
                                key="form"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-5"
                            >
                                <div className="card !p-0 !border-0 !shadow-none">
                                    <h3 className="title !mb-4">
                                        <FiClock /> Birth Details
                                    </h3>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                                <FiClock className="text-rose-500" />
                                                Birth Time <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                                type="time"
                                                className="input"
                                                value={birthTime}
                                                onChange={(e) => setBirthTime(e.target.value)}
                                                required
                                            />
                                            <p className="text-xs text-gray-400 mt-1 ml-1">
                                                Enter exact time if known (approx. if unsure)
                                            </p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                                <FiMapPin className="text-rose-500" />
                                                Birth Place <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                className="input"
                                                placeholder="e.g., Mumbai, Maharashtra, India"
                                                value={birthPlace}
                                                onChange={(e) => {
                                                    let val = e.target.value;
                                                    val = val.replace(/[^a-zA-Z\s,]/g, "");
                                                    val = val.replace(/\s{2,}/g, " ");
                                                    setBirthPlace(val);
                                                }}
                                                onBlur={(e) => {
                                                    setBirthPlace(e.target.value.trim());
                                                }}
                                                required
                                            />
                                            <p className="text-xs text-gray-400 mt-1 ml-1">
                                                Enter city and country for accurate results
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {locationDetails && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700 flex items-start gap-2"
                                    >
                                        <FiMapPin className="mt-0.5 flex-shrink-0" />
                                        <span className="text-xs">📍 {locationDetails.name}</span>
                                    </motion.div>
                                )}

                                <button
                                    onClick={fetchKundali}
                                    disabled={loading}
                                    className="submit-btn"
                                >
                                    {loading ? (
                                        <>
                                            <FiLoader className="animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <FiStar />
                                            Generate Kundali
                                        </>
                                    )}
                                </button>
                            </motion.div>
                        ) : (
                            /* RESULTS SECTION */
                            <motion.div
                                key="results"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                {/* RESULT HEADER */}
                                <div className="flex flex-wrap justify-between items-center mb-6">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                            <FiStar className="text-rose-500" />
                                            Your Kundali Details
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                                            <span className="flex items-center gap-1">
                                                <FiMapPin className="flex-shrink-0" />
                                                <span className="truncate max-w-[150px] sm:max-w-[200px] md:max-w-[250px]" title={birthPlace}>
                                                    {birthPlace}
                                                </span>
                                            </span>
                                            <span className="text-gray-300 hidden xs:inline">•</span>
                                            <span className="flex items-center gap-1">
                                                <FiClock className="flex-shrink-0" />
                                                {birthTime}
                                            </span>
                                        </p>
                                    </div>
                                    <button
                                        onClick={reset}
                                        className="px-4 py-2 text-rose-600 hover:text-rose-700 font-medium text-sm bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
                                    >
                                        Change Details
                                    </button>
                                </div>

                                {/* ERROR DISPLAY */}
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-red-50 border border-red-200 p-4 rounded-xl mb-6 text-red-600 text-sm flex items-start gap-3"
                                    >
                                        <FiAlertCircle className="text-xl flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-medium">Error generating Kundali</p>
                                            <p className="text-red-500">{error}</p>
                                        </div>
                                    </motion.div>
                                )}

                                {/* KUNDALI DATA */}
                                {kundaliData && (
                                    <motion.div
                                        className="space-y-6"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        {/* Main Planets Grid */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <Card
                                                icon={<FaSun className="text-yellow-500" />}
                                                title="Sun Sign"
                                                value={kundaliData.sun_sign || "Aries"}
                                                subValue="Surya"
                                            />
                                            <Card
                                                icon={<FaMoon className="text-blue-400" />}
                                                title="Moon Sign"
                                                value={kundaliData.moon_sign || "Cancer"}
                                                subValue="Chandra"
                                            />
                                            <Card
                                                icon={<GiPlanetConquest className="text-red-500" />}
                                                title="Manglik"
                                                value={kundaliData.manglik ? "Yes ✓" : "No ✗"}
                                                subValue={kundaliData.manglik ? "Mangal Dosha" : "No Dosha"}
                                            />
                                            <Card
                                                icon={<GiLuckyFisherman className="text-green-500" />}
                                                title="Lucky Number"
                                                value={kundaliData.lucky_number || "7"}
                                                subValue="Your fortune"
                                            />
                                        </div>

                                        {/* Additional Details Grid */}
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {kundaliData.nakshatra && (
                                                <Card
                                                    icon={<GiMoonOrbit className="text-purple-500" />}
                                                    title="Nakshatra"
                                                    value={kundaliData.nakshatra}
                                                    subValue="Birth Star"
                                                />
                                            )}
                                            {kundaliData.zodiac && (
                                                <Card
                                                    icon={<GiPlanetCore className="text-indigo-500" />}
                                                    title="Zodiac"
                                                    value={kundaliData.zodiac}
                                                    subValue="Rashi"
                                                />
                                            )}
                                            {kundaliData.tithi && (
                                                <Card
                                                    icon={<GiStarShuriken className="text-orange-500" />}
                                                    title="Tithi"
                                                    value={kundaliData.tithi}
                                                    subValue="Lunar Day"
                                                />
                                            )}
                                        </div>

                                        {/* Description */}
                                        {kundaliData.description && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.3 }}
                                                className="bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 p-6 rounded-xl border border-[#FFEAD3]"
                                            >
                                                <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                                                    <span className="w-1 h-5 bg-rose-500 rounded-full"></span>
                                                    Your Astrological Reading
                                                </h4>
                                                <p className="text-gray-700 leading-relaxed">
                                                    {kundaliData.description}
                                                </p>
                                            </motion.div>
                                        )}

                                        {/* Additional Info */}
                                        <div className="bg-amber-50 p-4 rounded-xl border border-[#FFEAD3]">
                                            <p className="text-xs text-gray-500 flex items-center gap-2">
                                                <FiAlertCircle className="text-amber-500" />
                                                This kundali is generated based on Vedic astrology principles.
                                                For precise predictions, consult a professional astrologer.
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* TAILWIND STYLES - Matching Marriage component exactly */}
            <style>{`
        .card {
          background: white;
          border-radius: 1rem;
          padding: 1.25rem;
          border: 1px solid #FFEAD3;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .title {
          display: flex;
          gap: 8px;
          align-items: center;
          font-weight: 600;
          color: #333;
          margin-bottom: 1rem;
        }
        .btn {
          padding: 10px;
          border: 2px solid #eee;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
        }
        .btn-active {
          border-color: #EA7B7B;
          background: #FFF5F5;
        }
        .input {
          width: 100%;
          border: 2px solid #FFEAD3;
          padding: 12px;
          border-radius: 12px;
          outline: none;
          transition: all 0.2s;
        }
        .input:focus {
          border-color: #EA7B7B;
          background: #FFF5F5;
        }
        .expense {
          display: flex;
          gap: 8px;
          padding: 10px;
          border: 2px solid #eee;
          border-radius: 10px;
          cursor: pointer;
        }
        .expense-active {
          border-color: #EA7B7B;
          background: #FFF5F5;
        }
        .submit-btn {
          width: 100%;
          background: linear-gradient(90deg, #f43f5e, #db2777);
          color: white;
          padding: 12px 16px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 14px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.08);
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        
        .submit-btn:hover {
          box-shadow: 0 8px 18px rgba(0,0,0,0.15);
        }
        
        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
      `}</style>
        </div>
    );
};

// SMALL CARD COMPONENT - Styled to match the theme
const Card = ({ icon, title, value, subValue }) => (
    <motion.div
        whileHover={{ y: -2 }}
        className="bg-white p-4 rounded-xl border border-[#FFEAD3] shadow-sm hover:shadow-md transition-all"
    >
        <div className="text-2xl mb-2 flex justify-center">{icon}</div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
            {title}
        </p>
        <p className="text-lg font-bold text-gray-800 text-center mt-1">
            {value || "N/A"}
        </p>
        {subValue && (
            <p className="text-xs text-gray-400 text-center mt-1">{subValue}</p>
        )}
    </motion.div>
);

export default Kundali;