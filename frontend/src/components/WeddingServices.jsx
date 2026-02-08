import { useState } from "react";
import { FiTag, FiCheckCircle, FiCamera, FiHome, FiStar, FiSearch, FiMapPin, FiChevronDown } from "react-icons/fi";
import { motion } from "framer-motion";

const WeddingServices = () => {
    const gold = "oklch(70.4%_0.191_22.216)";
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

    const [formData, setFormData] = useState({
        state: "",
        city: "",
        service: "Wedding Venues"
    });

    const [searchResults, setSearchResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showServiceDropdown, setShowServiceDropdown] = useState(false);

    const serviceOptions = [
        "Wedding Venues",
        "Wedding Photographers",
        "Caterers for Weddings",
        "Makeup Artists",
        "Decorators",
        "Wedding Planners"
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        let safeValue = value;

        // Apply only for state / city / name type fields
        if (["state", "city", "location"].includes(name)) {
            safeValue = value
                .replace(/[^a-zA-Z\s]/g, "")
                .replace(/\s{2,}/g, " ")
                .replace(/^\s/, "");
        }

        setFormData((prev) => ({
            ...prev,
            [name]: safeValue,
        }));
    };

    const handleServiceSelect = (service) => {
        setFormData(prev => ({
            ...prev,
            service: service
        }));
        setShowServiceDropdown(false);
    };

    const searchVendors = async () => {
        if (!formData.state.trim() || !formData.city.trim()) {
            setError("Please enter both state and city");
            return;
        }

        setLoading(true);
        setError("");
        setSearchResults(null);

        try {
            const response = await fetch(`${BACKEND_URL}/api/vendors/search`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
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
            console.error("Search error:", err);
        } finally {
            setLoading(false);
        }
    };

    const formatDiscount = (token) => {
        // Assuming discount token format: "DISCOUNT15" or "SAVE10"
        const match = token.match(/\d+/);
        return match ? `${match[0]}% OFF` : "Special Offer";
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-[#FFEAD3] shadow-lg h-full"
        >
            <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-gradient-to-br from-[#EA7B7B] to-[#D25353] rounded-xl shadow-sm">
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

            {/* Search Form */}
            <div className="space-y-4 mb-6">
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <FiMapPin className="text-[#EA7B7B]" />
                        <label className="text-sm font-medium text-gray-700">Location</label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <input
                                type="text"
                                name="state"
                                value={formData.state}
                                onChange={handleInputChange}
                                onBlur={(e) =>
                                    setFormData((p) => ({ ...p, [e.target.name]: e.target.value.trim() }))
                                }
                                placeholder="Enter state"
                                className="w-full px-4 py-2 border border-[#FFEAD3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EA7B7B]/30 focus:border-[#EA7B7B]"
                            />
                        </div>

                        <div>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                onBlur={(e) =>
                                    setFormData((p) => ({ ...p, [e.target.name]: e.target.value.trim() }))
                                }
                                placeholder="Enter city"
                                className="w-full px-4 py-2 border border-[#FFEAD3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EA7B7B]/30 focus:border-[#EA7B7B]"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <FiTag className="text-[#EA7B7B]" />
                        <label className="text-sm font-medium text-gray-700">Service Type</label>
                    </div>

                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setShowServiceDropdown(!showServiceDropdown)}
                            className="w-full px-4 py-2 border border-[#FFEAD3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EA7B7B]/30 focus:border-[#EA7B7B] flex items-center justify-between bg-white"
                        >
                            <span>{formData.service}</span>
                            <FiChevronDown className={`transition-transform ${showServiceDropdown ? 'rotate-180' : ''}`} />
                        </button>

                        {showServiceDropdown && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-[#FFEAD3] rounded-lg shadow-lg">
                                {serviceOptions.map((service, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => handleServiceSelect(service)}
                                        className="w-full px-4 py-2 text-left hover:bg-[#FFEAD3]/20 first:rounded-t-lg last:rounded-b-lg"
                                    >
                                        {service}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                <button
                    onClick={searchVendors}
                    disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-[#EA7B7B] to-[#D25353] text-white font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-70 flex items-center justify-center gap-2"
                >
                    <FiSearch />
                    {loading ? "Searching..." : "Find Wedding Vendors"}
                </button>
            </div>

            {/* Search Results */}
            {searchResults && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 border-t border-[#FFEAD3] pt-6"
                >
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <FiStar className="text-[#EA7B7B]" />
                        Available Vendors in {formData.city}, {formData.state}
                    </h3>

                    {searchResults.vendors && searchResults.vendors.length > 0 ? (
                        <div className="space-y-4">
                            {searchResults.vendors.map((vendor, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="p-4 bg-gradient-to-r from-[#FFEAD3]/10 to-white rounded-lg border border-[#FFEAD3]"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-gray-800">{vendor.name}</h4>
                                        <span className="px-3 py-1 bg-[#EA7B7B]/10 text-[#EA7B7B] text-sm font-medium rounded-full">
                                            {formatDiscount(vendor.discountToken)}
                                        </span>
                                    </div>

                                    <p className="text-sm text-gray-600 mb-2">
                                        <span className="font-medium">Service:</span> {vendor.service}
                                    </p>

                                    <p className="text-sm text-gray-600 mb-2">
                                        <span className="font-medium">Address:</span> {vendor.address}
                                    </p>

                                    {vendor.phone && (
                                        <p className="text-sm text-gray-600">
                                            <span className="font-medium">Contact:</span> {vendor.phone}
                                        </p>
                                    )}

                                    {vendor.specialOffer && (
                                        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                                            <p className="text-xs text-yellow-700">
                                                <span className="font-medium">Special Offer:</span> {vendor.specialOffer}
                                            </p>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FFEAD3]/30 rounded-full mb-4">
                                <FiTag className="text-[#EA7B7B] text-2xl" />
                            </div>
                            <h4 className="text-lg font-semibold text-gray-700 mb-2">
                                {searchResults.message || "Sorry, our services are not available in this location yet"}
                            </h4>
                            <p className="text-gray-500 text-sm">
                                We're expanding our network. Please check back soon or try a different location.
                            </p>
                        </div>
                    )}
                </motion.div>
            )}

            {/* Benefits Section */}
            {!searchResults && (
                <div className="space-y-4 mb-6">
                    <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-[#FFEAD3]/20 to-white rounded-lg border border-[#FFEAD3]">
                        <div className="p-2 bg-[#EA7B7B]/10 rounded-lg">
                            <FiCheckCircle className="text-[#EA7B7B]" />
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-800 mb-1">Up to 15% Vendor Discounts</h4>
                            <p className="text-xs text-gray-500">Special rates for wedding planners, caterers, and decorators</p>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default WeddingServices;