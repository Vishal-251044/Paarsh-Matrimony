import { FiTag, FiCheckCircle, FiCamera, FiHome, FiStar } from "react-icons/fi";
import { motion } from "framer-motion";

const WeddingServices = () => {
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
                    <p className="text-sm text-gray-500">Exclusive vendor discounts</p>
                </div>
            </div>

            <p className="text-sm text-gray-600 mb-6">
                Access exclusive discounts and trusted vendors for your big day.
                Save money while getting premium quality services tailored for Indian weddings.
            </p>

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

                <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-[#FFEAD3]/20 to-white rounded-lg border border-[#FFEAD3]">
                    <div className="p-2 bg-[#EA7B7B]/10 rounded-lg">
                        <FiCamera className="text-[#EA7B7B]" />
                    </div>
                    <div>
                        <h4 className="font-medium text-gray-800 mb-1">Photographer & Venue Deals</h4>
                        <p className="text-xs text-gray-500">Premium photography packages and venue partnerships</p>
                    </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-[#FFEAD3]/20 to-white rounded-lg border border-[#FFEAD3]">
                    <div className="p-2 bg-[#EA7B7B]/10 rounded-lg">
                        <FiHome className="text-[#EA7B7B]" />
                    </div>
                    <div>
                        <h4 className="font-medium text-gray-800 mb-1">Makeup & Decoration Packages</h4>
                        <p className="text-xs text-gray-500">Complete bridal packages with decor services</p>
                    </div>
                </div>
            </div>

            <div className="mt-6">

                <p className="text-center text-gray-500 text-xs mt-3">
                    Verified vendors • Price match guarantee • Free consultation
                </p>
            </div>
        </motion.div>
    );
};

export default WeddingServices;