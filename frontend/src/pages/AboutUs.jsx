import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
    FiShield,
    FiUsers,
    FiSmartphone,
    FiHeart,
} from "react-icons/fi";

const AboutUs = () => {
    return (
        <>
            <Navbar />

            <div className="min-h-screen bg-gray-50 pt-24 pb-10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1
                            className="text-[oklch(70.4%_0.191_22.216)] text-4xl sm:text-5xl mb-4 select-none"
                            style={{ fontFamily: "'Great Vibes', cursive" }}
                        >
                            About Paarsh Matrimony
                        </h1>
                        <p className="text-gray-600 text-lg">
                            Connecting Hearts, Building Futures
                        </p>
                    </div>

                    {/* Main Content */}
                    <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 space-y-8">

                        {/* Our Journey */}
                        <section>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">
                                Our Journey
                            </h2>
                            <p className="text-gray-600 leading-relaxed">
                                Paarsh Matrimony was born from a vision to create a trusted,
                                secure, and user-friendly platform that simplifies the journey
                                of finding a life partner. We respect tradition while embracing
                                modern technology to enable meaningful connections.
                            </p>
                        </section>

                        {/* Our Mission */}
                        <section>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">
                                Our Mission
                            </h2>
                            <p className="text-gray-600 leading-relaxed">
                                To empower individuals in their search for a compatible life
                                partner by offering a secure, transparent, and intelligent
                                platform that creates relationships built to last.
                            </p>
                        </section>

                        {/* What We Offer */}
                        <section>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">
                                What We Offer
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                <div className="bg-gray-50 p-5 rounded-lg">
                                    <h3 className="flex items-center gap-2 font-semibold text-gray-800 mb-2">
                                        <FiShield className="text-lg text-[oklch(70.4%_0.191_22.216)]" />
                                        Secure Platform
                                    </h3>
                                    <p className="text-gray-600 text-sm">
                                        Advanced verification processes and strong data protection
                                        ensure complete privacy and safety.
                                    </p>
                                </div>

                                <div className="bg-gray-50 p-5 rounded-lg">
                                    <h3 className="flex items-center gap-2 font-semibold text-gray-800 mb-2">
                                        <FiUsers className="text-lg text-[oklch(70.4%_0.191_22.216)]" />
                                        Intelligent Matching
                                    </h3>
                                    <p className="text-gray-600 text-sm">
                                        AI-powered recommendations based on compatibility and
                                        personalized preferences.
                                    </p>
                                </div>

                                <div className="bg-gray-50 p-5 rounded-lg">
                                    <h3 className="flex items-center gap-2 font-semibold text-gray-800 mb-2">
                                        <FiSmartphone className="text-lg text-[oklch(70.4%_0.191_22.216)]" />
                                        Seamless Experience
                                    </h3>
                                    <p className="text-gray-600 text-sm">
                                        Fully responsive design optimized for mobile, tablet,
                                        and desktop devices.
                                    </p>
                                </div>

                                <div className="bg-gray-50 p-5 rounded-lg">
                                    <h3 className="flex items-center gap-2 font-semibold text-gray-800 mb-2">
                                        <FiHeart className="text-lg text-[oklch(70.4%_0.191_22.216)]" />
                                        Beyond Matchmaking
                                    </h3>
                                    <p className="text-gray-600 text-sm">
                                        Support beyond matches including guidance, coordination,
                                        and marriage planning assistance.
                                    </p>
                                </div>

                            </div>
                        </section>

                        {/* Our Team */}
                        <section>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">
                                Our Team
                            </h2>
                            <p className="text-gray-600 leading-relaxed">
                                Paarsh Matrimony is developed and managed by Paarsh Infotech
                                Pvt. Ltd., a team of passionate professionals combining technical
                                expertise with a deep understanding of matrimonial needs.
                            </p>
                        </section>

                        {/* Contact Section */}
                        <section className="bg-gradient-to-r from-[oklch(70.4%_0.191_22.216)]/10 to-[oklch(70.4%_0.191_22.216)]/5 p-6 rounded-xl">
                            <h2 className="text-xl font-bold text-gray-800 mb-3">
                                Get in Touch
                            </h2>
                            <p className="text-gray-600 mb-4">
                                Have questions or need assistance? Our support team is always
                                here to help.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <a
                                    href="mailto:info@paarshinfotech.com"
                                    className="bg-[oklch(70.4%_0.191_22.216)] text-white px-6 py-3 rounded-lg text-center hover:opacity-90 transition"
                                >
                                    Email Us
                                </a>
                                <a
                                    href="tel:+919075201035"
                                    className="border border-[oklch(70.4%_0.191_22.216)] text-[oklch(70.4%_0.191_22.216)] px-6 py-3 rounded-lg text-center hover:bg-[oklch(70.4%_0.191_22.216)] hover:text-white transition"
                                >
                                    Call Us
                                </a>
                            </div>
                        </section>

                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
};

export default AboutUs;
