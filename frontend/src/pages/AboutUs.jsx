import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { FiShield, FiUsers, FiSmartphone, FiHeart, FiTarget, FiStar, FiUserCheck, FiMessageCircle } from "react-icons/fi";

const AboutUs = () => {
    return (
        <>
            <Navbar />

            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-pink-50 pt-24 pb-10 relative">
                {/* Background Image in Top Left Corner */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">

                    {/* Decorative Background Elements */}
                    <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-[oklch(70.4%_0.191_22.216)]/5 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-200/10 rounded-full blur-3xl"></div>
                </div>

                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    {/* Header with Hero Section */}
                    <div className="text-center mb-16 relative">
                        {/* You can also add a floating decorative element on the image */}
                        <div className="absolute -top-10 -left-10 w-40 h-40 opacity-10 pointer-events-none">
                            <div className="w-full h-full rounded-full border-4 border-[oklch(70.4%_0.191_22.216)]"></div>
                        </div>
                        <h2
                            className="text-[oklch(70.4%_0.191_22.216)] text-3xl sm:text-4xl font-bold mb-6 select-none relative"
                            style={{ fontFamily: "'Poppins', sans-serif" }}
                        >
                            <span className="relative inline-block">
                                About Paarsh Matrimony
                                <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-[oklch(70.4%_0.191_22.216)] to-transparent"></span>
                            </span>
                        </h2>
                        <p className="text-gray-700 text-xl max-w-3xl mx-auto leading-relaxed relative">
                            Connecting Hearts, Building Futures with Trust and Technology
                        </p>
                    </div>

                    {/* Rest of your content remains the same */}
                    {/* Mission Section with Image */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden mb-16 border border-white/20">
                        <div className="grid md:grid-cols-2 gap-0">
                            {/* Mission Image */}
                            <div className="relative min-h-[400px] bg-gradient-to-br from-[oklch(70.4%_0.191_22.216)]/20 to-pink-200/20">
                                <div className="absolute inset-0 flex items-center justify-center p-8">
                                    <div className="relative">
                                        {/* Decorative circles */}
                                        <div className="absolute -top-6 -left-6 w-32 h-32 border-2 border-[oklch(70.4%_0.191_22.216)]/30 rounded-full"></div>
                                        <div className="absolute -bottom-4 -right-4 w-24 h-24 border-2 border-pink-300/40 rounded-full"></div>

                                        {/* Mission Icon */}
                                        <div className="relative bg-gradient-to-br from-white to-gray-50 p-10 rounded-2xl shadow-2xl border border-white">
                                            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[oklch(70.4%_0.191_22.216)] to-pink-400 flex items-center justify-center">
                                                <FiTarget className="text-3xl text-white" />
                                            </div>
                                            <h3 className="text-2xl font-bold text-gray-800 text-center">
                                                Our Mission
                                            </h3>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Mission Content */}
                            <div className="p-10 flex flex-col justify-center">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 rounded-full bg-[oklch(70.4%_0.191_22.216)]/10 flex items-center justify-center">
                                        <FiTarget className="text-xl text-[oklch(70.4%_0.191_22.216)]" />
                                    </div>
                                    <h2 className="text-3xl font-bold text-gray-800">
                                        Our Guiding Star
                                    </h2>
                                </div>
                                <p className="text-gray-600 leading-relaxed text-lg">
                                    To empower individuals in their search for a compatible life
                                    partner by offering a secure, transparent, and intelligent
                                    platform that creates relationships built to last.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Cards */}
                    <div className="grid lg:grid-cols-2 gap-8 mb-16">
                        {/* Our Journey Card */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-white/20 transform hover:-translate-y-1 transition-transform duration-300">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-[oklch(70.4%_0.191_22.216)]/20 to-pink-200/20 flex items-center justify-center">
                                    <FiStar className="text-2xl text-[oklch(70.4%_0.191_22.216)]" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                        Our Journey
                                    </h2>
                                    <div className="w-16 h-1 bg-gradient-to-r from-[oklch(70.4%_0.191_22.216)] to-pink-400 rounded-full"></div>
                                </div>
                            </div>
                            <p className="text-gray-600 leading-relaxed">
                                Paarsh Matrimony was born from a vision to create a trusted,
                                secure, and user-friendly platform that simplifies the journey
                                of finding a life partner. We respect tradition while embracing
                                modern technology to enable meaningful connections.
                            </p>
                        </div>

                        {/* Our Team Card */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-white/20 transform hover:-translate-y-1 transition-transform duration-300">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-200/20 to-[oklch(70.4%_0.191_22.216)]/20 flex items-center justify-center">
                                    <FiUsers className="text-2xl text-[oklch(70.4%_0.191_22.216)]" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                        Our Team
                                    </h2>
                                    <div className="w-16 h-1 bg-gradient-to-r from-pink-400 to-[oklch(70.4%_0.191_22.216)] rounded-full"></div>
                                </div>
                            </div>
                            <p className="text-gray-600 leading-relaxed">
                                Paarsh Matrimony is developed and managed by Paarsh Infotech
                                Pvt. Ltd., a team of passionate professionals combining technical
                                expertise with a deep understanding of matrimonial needs.
                            </p>
                        </div>
                    </div>

                    {/* What We Offer - Enhanced Grid */}
                    <div className="mb-16">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-800 mb-4">
                                What Sets Us Apart
                            </h2>
                            <p className="text-gray-600 max-w-2xl mx-auto">
                                Discover the unique features that make Paarsh Matrimony your trusted partner in finding love
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                {
                                    icon: <FiShield className="text-2xl" />,
                                    title: "Secure Platform",
                                    desc: "Advanced verification processes and strong data protection ensure complete privacy and safety.",
                                    color: "from-blue-500/20 to-cyan-500/20"
                                },
                                {
                                    icon: <FiUserCheck className="text-2xl" />,
                                    title: "Intelligent Matching",
                                    desc: "Best recommendations algorithm based on compatibility and personalized preferences.",
                                    color: "from-purple-500/20 to-pink-500/20"
                                },
                                {
                                    icon: <FiSmartphone className="text-2xl" />,
                                    title: "Seamless Experience",
                                    desc: "Fully responsive design optimized for mobile, tablet, and desktop devices.",
                                    color: "from-green-500/20 to-emerald-500/20"
                                },
                                {
                                    icon: <FiHeart className="text-2xl" />,
                                    title: "Beyond Matchmaking",
                                    desc: "Support beyond matches including guidance, coordination, and marriage planning assistance.",
                                    color: "from-red-500/20 to-pink-500/20"
                                }
                            ].map((feature, index) => (
                                <div
                                    key={index}
                                    className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                                >
                                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                        <div className="text-[oklch(70.4%_0.191_22.216)]">
                                            {feature.icon}
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-gray-800 text-lg mb-3">
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        {feature.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Contact CTA Section */}
                    <div className="bg-gradient-to-r from-[oklch(70.4%_0.191_22.216)] to-pink-500 rounded-3xl shadow-2xl overflow-hidden p-10">
                        <div className="grid md:grid-cols-2 gap-10 items-center">
                            <div>
                                <h2 className="text-3xl font-bold text-white mb-4">
                                    Ready to Start Your Journey?
                                </h2>
                                <p className="text-white/90 mb-6">
                                    Have questions or need assistance? Our support team is always
                                    here to help you find your perfect match.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <a
                                        href="mailto:info@paarshinfotech.com"
                                        className="bg-white text-[oklch(70.4%_0.191_22.216)] px-8 py-3 rounded-xl text-center font-semibold hover:bg-gray-100 transition-colors duration-300 flex items-center justify-center gap-3"
                                    >
                                        <FiMessageCircle />
                                        Email Us
                                    </a>
                                    <a
                                        href="tel:+919075201035"
                                        className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-xl text-center font-semibold hover:bg-white/10 transition-colors duration-300 flex items-center justify-center gap-3"
                                    >
                                        <FiUsers />
                                        Call Us
                                    </a>
                                </div>
                            </div>
                            <div className="hidden md:block">
                                <div className="relative">
                                    <div className="absolute -top-6 -right-6 w-32 h-32 border-4 border-white/20 rounded-full"></div>
                                    <div className="absolute -bottom-6 -left-6 w-24 h-24 border-4 border-white/20 rounded-full"></div>
                                    <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                                        <div className="text-center">
                                            <div className="inline-block p-4 rounded-full bg-white/20 mb-4">
                                                <FiHeart className="text-4xl text-white" />
                                            </div>
                                            <h3 className="text-xl font-semibold text-white mb-2">
                                                24/7 Support
                                            </h3>
                                            <p className="text-white/80 text-sm">
                                                We're here for you at every step of your journey
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div >

            <Footer />
        </>
    );
};

export default AboutUs;