import { useState } from "react";
import { 
  FiTag, FiCheckCircle, FiStar, FiSearch, FiMapPin, FiChevronDown,
  FiCamera, FiUsers, FiScissors, FiHome, FiCalendar, FiPhone,
  FiAward, FiPercent, FiGift, FiHeart, FiMail, FiGlobe,
  FiBriefcase, FiUser, FiDroplet, FiPackage, FiClock
} from "react-icons/fi";
import { motion } from "framer-motion";

const WeddingServices = () => {
    const gold = "oklch(70.4%_0.191_22.216)";
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

    // Maharashtra cities data
    const maharashtraCities = [
        "Mumbai",
        "Pune",
        "Nagpur",
        "Nashik",
        "Thane",
        "Aurangabad",
        "Solapur",
        "Kolhapur",
        "Sangli",
        "Satara",
        "Ratnagiri",
        "Amravati",
        "Jalgaon",
        "Akola",
        "Latur",
        "Ahmednagar",
        "Chandrapur",
        "Parbhani",
        "Jalna",
        "Bhiwandi",
        "Malegaon",
        "Dhule",
        "Nanded",
        "Wardha",
        "Yavatmal",
        "Osmanabad",
        "Beed",
        "Hingoli",
        "Gondia",
        "Bhandara",
        "Gadchiroli",
        "Washim",
        "Buldhana",
        "Sindhudurg",
        "Raigad",
        "Palghar"
    ];

    const [formData, setFormData] = useState({
        state: "Maharashtra",
        city: "",
        service: "Wedding Venues"
    });

    const [searchResults, setSearchResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showServiceDropdown, setShowServiceDropdown] = useState(false);
    const [showCityDropdown, setShowCityDropdown] = useState(false);

    const serviceOptions = [
        "Wedding Venues",
        "Wedding Photographers",
        "Caterers for Weddings",
        "Makeup Artists",
        "Decorators",
        "Wedding Planners"
    ];

    // Get appropriate icon for service type
    const getServiceIcon = (service) => {
        const serviceLower = service?.toLowerCase() || "";
        if (serviceLower.includes("venue")) return <FiHome className="text-pink-500" size={18} />;
        if (serviceLower.includes("photograph")) return <FiCamera className="text-pink-500" size={18} />;
        if (serviceLower.includes("cater")) return <FiPackage className="text-pink-500" size={18} />;
        if (serviceLower.includes("makeup")) return <FiDroplet className="text-pink-500" size={18} />;
        if (serviceLower.includes("decor")) return <FiGift className="text-pink-500" size={18} />;
        if (serviceLower.includes("planner")) return <FiCalendar className="text-pink-500" size={18} />;
        return <FiBriefcase className="text-pink-500" size={18} />;
    };

    const handleCitySelect = (city) => {
        setFormData(prev => ({
            ...prev,
            city: city
        }));
        setShowCityDropdown(false);
    };

    const handleServiceSelect = (service) => {
        setFormData(prev => ({
            ...prev,
            service: service
        }));
        setShowServiceDropdown(false);
    };

    const searchVendors = async () => {
        if (!formData.city.trim()) {
            setError("Please select a city");
            return;
        }

        setLoading(true);
        setError("");
        setSearchResults(null);

        try {
            const response = await fetch(`${BACKEND_URL}/api/vendors/search`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    state: formData.state,
                    city: formData.city,
                    service: formData.service
                })
            });

            const data = await response.json();

            if (response.ok) {
                if (data.vendors && data.vendors.length > 0) {
                    setSearchResults(data);
                } else {
                    setSearchResults({
                        vendors: [],
                        message: "No vendors found for this location"
                    });
                }
            } else {
                setError(data.message || "Failed to search vendors");
            }
        } catch (err) {
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const formatDiscount = (token) => {
        if (!token) return "Special Offer";
        const match = token.match(/\d+/);
        return match ? `${match[0]}% OFF` : "Special Offer";
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 sm:p-6 shadow-lg h-full"
        >
            {/* HEADER */}
            <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-gradient-to-r from-rose-500 to-pink-600 rounded-xl shadow-sm">
                    <FiTag className="text-white" size={22} />
                </div>
                <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                        Wedding Services
                    </h2>
                    <p className="text-sm text-gray-500">Find exclusive vendor discounts</p>
                </div>
            </div>

            <p className="text-sm text-gray-600 mb-6">
                Search for trusted vendors in your location with exclusive discounts.
                Save money while getting premium quality services tailored for Indian weddings.
            </p>

            {/* SEARCH FORM */}
            <div className="space-y-4 mb-6">
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <FiMapPin className="text-[#EA7B7B]" />
                        <label className="text-sm font-medium text-gray-700">Location</label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* State Dropdown - Maharashtra only */}
                        <div className="relative">
                            <button
                                type="button"
                                className="w-full px-4 py-2 border border-[#FFEAD3] rounded-lg flex justify-between items-center bg-white text-gray-800 cursor-not-allowed opacity-90"
                                disabled
                            >
                                <span>{formData.state}</span>
                                <FiChevronDown className="text-gray-400" />
                            </button>
                        </div>

                        {/* City Dropdown */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setShowCityDropdown(!showCityDropdown)}
                                className="w-full px-4 py-2 border border-[#FFEAD3] rounded-lg flex justify-between items-center bg-white text-gray-800 hover:bg-[#FFEAD3]/20 transition-colors"
                            >
                                <span className={formData.city ? "text-gray-800" : "text-gray-400"}>
                                    {formData.city || "Select city"}
                                </span>
                                <FiChevronDown className={`transition-transform ${showCityDropdown ? 'rotate-180' : ''}`} />
                            </button>

                            {showCityDropdown && (
                                <div className="absolute z-10 w-full bg-white border border-[#FFEAD3] rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
                                    {maharashtraCities.map((city, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleCitySelect(city)}
                                            className={`w-full px-4 py-2 text-left hover:bg-[#FFEAD3]/20 transition-colors ${
                                                formData.city === city ? 'bg-[#FFEAD3]/40 font-medium' : ''
                                            }`}
                                        >
                                            {city}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* SERVICE DROPDOWN */}
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setShowServiceDropdown(!showServiceDropdown)}
                        className="w-full px-4 py-2 border border-[#FFEAD3] rounded-lg flex justify-between items-center bg-white hover:bg-[#FFEAD3]/20 transition-colors"
                    >
                        <span>{formData.service}</span>
                        <FiChevronDown className={`transition-transform ${showServiceDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {showServiceDropdown && (
                        <div className="absolute z-10 w-full bg-white border border-[#FFEAD3] rounded-lg shadow-lg mt-1">
                            {serviceOptions.map((service, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleServiceSelect(service)}
                                    className={`w-full px-4 py-2 text-left hover:bg-[#FFEAD3]/20 transition-colors ${
                                        formData.service === service ? 'bg-[#FFEAD3]/40 font-medium' : ''
                                    }`}
                                >
                                    {service}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {error && <p className="text-red-600 text-sm">{error}</p>}

                <button
                    onClick={searchVendors}
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-lg font-bold text-sm bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {loading ? "Searching..." : "Find Wedding Vendors"}
                </button>

            </div>

            {/* SEARCH RESULTS */}
            {searchResults && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 border-t pt-6"
                >

                    {/* USER SELECTED INFO */}
                    <div className="mb-4 p-4 bg-gradient-to-r from-[#FFEAD3]/30 to-[#FFEAD3]/10 border border-[#FFEAD3] rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                            <FiMapPin className="text-[#EA7B7B]" size={16} />
                            <p className="text-sm font-medium text-gray-700">
                                <span className="text-gray-500">Location:</span> {formData.city}, {formData.state}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            {getServiceIcon(formData.service)}
                            <p className="text-sm font-medium text-gray-700">
                                <span className="text-gray-500">Service:</span> {formData.service}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-1.5 bg-gradient-to-r from-rose-500 to-pink-600 rounded-lg">
                            <FiStar className="text-white" size={16} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">
                            Available Vendors ({searchResults.vendors?.length || 0})
                        </h3>
                    </div>

                    {searchResults.vendors?.length > 0 ? (
                        <div className="space-y-3">
                            {searchResults.vendors.map((vendor, index) => (
                                <motion.div 
                                    key={index} 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="group p-5 border border-[#FFEAD3] rounded-xl hover:shadow-lg transition-all duration-300 bg-white relative overflow-hidden"
                                >
                                    {/* Decorative gradient line */}
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-pink-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                                    
                                    <div className="flex items-start gap-3">
                                        {/* Service icon with gradient background */}
                                        <div className="p-2.5 bg-gradient-to-br from-[#FFEAD3] to-[#FFEAD3]/50 rounded-xl">
                                            {getServiceIcon(vendor.service)}
                                        </div>
                                        
                                        <div className="flex-1">
                                            {/* Vendor name and rating */}
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-bold text-gray-800 text-lg">
                                                    {vendor.name}
                                                </h4>
                                                <div className="flex items-center gap-1 bg-[#FFEAD3] px-2 py-1 rounded-full">
                                                    <FiAward className="text-[#EA7B7B]" size={14} />
                                                    <span className="text-xs font-medium text-gray-700">Verified</span>
                                                </div>
                                            </div>
                                            
                                            {/* Service type with icon */}
                                            <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
                                                {getServiceIcon(vendor.service)}
                                                <span>{vendor.service}</span>
                                            </div>
                                            
                                            {/* Location with icon */}
                                            <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
                                                <FiMapPin className="text-gray-400" size={14} />
                                                <span>{vendor.city}, {vendor.state}</span>
                                            </div>
                                            
                                            {/* Contact with icon */}
                                            <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                                                <FiPhone className="text-gray-400" size={14} />
                                                <span>{vendor.phone}</span>
                                            </div>
                                            
                                            {/* Discount and token section */}
                                            <div className="flex flex-wrap items-center gap-3 mt-2">
                                                {vendor.discount && (
                                                    <div className="flex items-center gap-1.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white px-3 py-1.5 rounded-lg">
                                                        <FiPercent size={14} />
                                                        <span className="text-sm font-bold">{vendor.discount}% OFF</span>
                                                    </div>
                                                )}
                                                
                                                {vendor.token && (
                                                    <div className="flex items-center gap-1.5 bg-[#FFEAD3] border border-[#FFEAD3] px-3 py-1.5 rounded-lg">
                                                        <FiGift className="text-[#EA7B7B]" size={14} />
                                                        <span className="text-xs font-medium text-gray-700">Use Code:</span>
                                                        <span className="text-sm font-bold text-[#EA7B7B]">{vendor.token}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-8 px-4 bg-[#FFEAD3]/20 rounded-xl border border-[#FFEAD3]"
                        >
                            <div className="flex justify-center mb-3">
                                <div className="p-3 bg-[#FFEAD3] rounded-full">
                                    <FiSearch className="text-[#EA7B7B]" size={24} />
                                </div>
                            </div>
                            <p className="text-gray-600 font-medium">
                                {searchResults.message || "No vendors found"}
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                                Try searching in a different city or for another service
                            </p>
                        </motion.div>
                    )}
                </motion.div>
            )}

            {/* BENEFITS */}
            {!searchResults && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="p-4 bg-gradient-to-r from-[#FFEAD3]/30 to-[#FFEAD3]/10 rounded-xl border border-[#FFEAD3]"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-rose-500 to-pink-600 rounded-lg">
                            <FiCheckCircle className="text-white" size={18} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-800">Up to 15% Vendor Discounts</p>
                            <p className="text-xs text-gray-500">Exclusive offers for wedding services</p>
                        </div>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
};

export default WeddingServices;