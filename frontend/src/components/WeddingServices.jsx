import { useState } from "react";
import { FiTag, FiCheckCircle, FiStar, FiSearch, FiMapPin, FiChevronDown } from "react-icons/fi";
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
            className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-[#FFEAD3] shadow-lg h-full"
        >
            {/* HEADER */}
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

            {/* SEARCH FORM */}
            <div className="space-y-4 mb-6">
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <FiMapPin className="text-[#EA7B7B]" />
                        <label className="text-sm font-medium text-gray-700">Location</label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={handleInputChange}
                            placeholder="Enter state"
                            className="w-full px-4 py-2 border border-[#FFEAD3] rounded-lg"
                        />
                        <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            placeholder="Enter city"
                            className="w-full px-4 py-2 border border-[#FFEAD3] rounded-lg"
                        />
                    </div>
                </div>

                {/* SERVICE DROPDOWN */}
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setShowServiceDropdown(!showServiceDropdown)}
                        className="w-full px-4 py-2 border border-[#FFEAD3] rounded-lg flex justify-between bg-white"
                    >
                        {formData.service}
                        <FiChevronDown />
                    </button>

                    {showServiceDropdown && (
                        <div className="absolute w-full bg-white border rounded-lg shadow-lg">
                            {serviceOptions.map((service, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleServiceSelect(service)}
                                    className="w-full px-4 py-2 text-left hover:bg-[#FFEAD3]/20"
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
                <motion.div className="mt-6 border-t pt-6">

                    {/* USER SELECTED INFO */}
                    <div className="mb-4 p-3 bg-[#FFEAD3]/20 border rounded-lg">
                        <p className="text-sm">
                            <strong>Location:</strong> {formData.city}, {formData.state}
                        </p>
                        <p className="text-sm">
                            <strong>Service:</strong> {formData.service}
                        </p>
                    </div>

                    <h3 className="text-lg font-bold mb-4 flex gap-2">
                        <FiStar className="text-[#EA7B7B]" />
                        Available Vendors
                    </h3>

                    {searchResults.vendors?.length > 0 ? (
                        searchResults.vendors.map((vendor, index) => (
                            <div key={index} className="p-4 border rounded-lg mb-3">
                                <h4 className="font-bold text-gray-800">{vendor.name}</h4>

                                <p className="text-sm text-gray-600">
                                    {vendor.service}
                                </p>

                                <p className="text-sm text-gray-600">
                                    {vendor.city}, {vendor.state}
                                </p>

                                <p className="text-sm text-gray-600">
                                    Contact: {vendor.phone}
                                </p>

                                {vendor.discount && (
                                    <p className="text-[#EA7B7B] font-medium">
                                        {vendor.discount}% OFF
                                    </p>
                                )}

                                {vendor.token && (
                                    <p className="text-xs bg-yellow-100 border border-yellow-300 px-2 py-1 rounded inline-block mt-1">
                                        Use Code: <span className="font-semibold">{vendor.token}</span>
                                    </p>
                                )}

                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 text-center">
                            {searchResults.message}
                        </p>
                    )}
                </motion.div>
            )}

            {/* BENEFITS */}
            {!searchResults && (
                <div className="p-3 bg-[#FFEAD3]/20 rounded-lg">
                    <div className="flex gap-3">
                        <FiCheckCircle className="text-[#EA7B7B]" />
                        <p className="text-sm">Up to 15% Vendor Discounts</p>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default WeddingServices;
