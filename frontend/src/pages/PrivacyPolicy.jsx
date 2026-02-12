import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Chatbot from '../components/Chatbot';
import {
  FiCheck,
  FiLock,
  FiShield,
  FiEye,
  FiSearch,
} from "react-icons/fi";

const PrivacyPolicy = () => {
  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50 pt-24 pb-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="text-center mb-16">
            <h2
              className="text-[oklch(70.4%_0.191_22.216)] text-3xl sm:text-4xl font-bold mb-6 select-none relative"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              <span className="relative inline-block">
                Privacy Policy
                <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-[oklch(70.4%_0.191_22.216)] to-transparent"></span>
              </span>
            </h2>
          </div>

          {/* Content */}
          <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 space-y-8">

            {/* Introduction */}
            <section>
              <p className="text-gray-600 leading-relaxed">
                At Paarsh Matrimony, we are committed to protecting your privacy
                and personal information. This Privacy Policy explains how we
                collect, use, disclose, and safeguard your information when you
                use our matrimonial services.
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Information We Collect
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Personal Information
                  </h3>
                  <ul className="list-disc pl-5 text-gray-600 space-y-1">
                    <li>Name, age, gender, date of birth</li>
                    <li>Contact information (email, phone number)</li>
                    <li>Educational and professional details</li>
                    <li>Religion, caste, and community information</li>
                    <li>Photographs and lifestyle preferences</li>
                    <li>Partner preferences and search criteria</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Family Information
                  </h3>
                  <ul className="list-disc pl-5 text-gray-600 space-y-1">
                    <li>Father's name and occupation</li>
                    <li>Mother's name and occupation</li>
                    <li>Number of siblings and their details</li>
                    <li>Family background and values</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* How We Use Information */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                How We Use Your Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "To create and manage your profile",
                  "To provide personalized match recommendations",
                  "To facilitate communication between users",
                  "To process payments for premium services",
                  "To improve our platform and user experience",
                  "To send important updates and notifications",
                  "To ensure platform security and prevent fraud",
                  "To comply with legal obligations",
                ].map((use, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <FiCheck className="text-[oklch(70.4%_0.191_22.216)] mt-1" />
                    <span className="text-gray-600">{use}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Information Sharing */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Information Sharing and Disclosure
              </h2>

              <p className="text-gray-600 mb-3">
                We respect your privacy and do not sell your personal information
                to third parties. Information may be shared only in these cases:
              </p>

              <ul className="list-disc pl-5 text-gray-600 space-y-2">
                <li>
                  <strong>With Your Consent:</strong> Based on your privacy
                  settings
                </li>
                <li>
                  <strong>Service Providers:</strong> Trusted partners supporting
                  our platform
                </li>
                <li>
                  <strong>Legal Requirements:</strong> When required by law
                </li>
                <li>
                  <strong>Business Transfers:</strong> Mergers or acquisitions
                </li>
              </ul>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Your Privacy Rights
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "Access your personal information",
                  "Correct inaccurate data",
                  "Delete your account and data",
                  "Opt-out of marketing communications",
                  "Export your data",
                  "Withdraw consent at any time",
                ].map((right, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-[oklch(70.4%_0.191_22.216)]/10 rounded-full flex items-center justify-center">
                      <FiCheck className="text-sm text-[oklch(70.4%_0.191_22.216)]" />
                    </div>
                    <span className="text-gray-600">{right}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Additional Info Banner */}
            <div className="mt-10 bg-gradient-to-r from-[oklch(70.4%_0.191_22.216)]/20 to-pink-500/20 rounded-2xl p-6 border border-white/50">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-gray-800 text-lg mb-1">
                    Need Further Clarification?
                  </h3>
                  <p className="text-gray-700">
                    Our legal team is available to answer any questions about our terms.
                  </p>
                </div>
                <a
                  href='/contact'
                  className="bg-[oklch(70.4%_0.191_22.216)] text-white px-6 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
                >
                  Contact Legal Support
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Chatbot />
      <Footer />
    </>
  );
};

export default PrivacyPolicy;
