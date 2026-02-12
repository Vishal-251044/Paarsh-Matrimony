import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Chatbot from '../components/Chatbot';
import {
  FiCheckCircle,
  FiUser,
  FiLock,
  FiShield,
  FiCreditCard,
  FiFileText,
  FiXCircle,
  FiAlertTriangle,
  FiRefreshCw,
  FiMapPin,
  FiMail,
  FiBookOpen,
  FiFlag,
  FiClipboard,
} from "react-icons/fi";

const TermsOfUse = () => {
  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-pink-50 pt-24 pb-10 relative">
        {/* Decorative Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-1/4 right-10 w-64 h-64 bg-[oklch(70.4%_0.191_22.216)]/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/3 left-10 w-80 h-80 bg-pink-200/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header */}
          <div className="text-center mb-16">
            <h2
              className="text-[oklch(70.4%_0.191_22.216)] text-3xl sm:text-4xl font-bold mb-6 select-none relative"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              <span className="relative inline-block">
                Terms of Use
                <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-[oklch(70.4%_0.191_22.216)] to-transparent"></span>
              </span>
            </h2>
          </div>

          {/* Main Content Container */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-white/20">
            {/* Introduction Section */}
            <div className="relative p-10 border-b border-gray-100">
              <div className="absolute top-6 left-6">
                <FiBookOpen className="text-4xl text-[oklch(70.4%_0.191_22.216)]/20" />
              </div>
              <p className="text-gray-700 leading-relaxed text-lg text-center max-w-3xl mx-auto">
                Welcome to Paarsh Matrimony. These Terms of Use govern your use
                of our website and services. By accessing or using our platform,
                you agree to be bound by these terms.
              </p>
            </div>

            {/* Terms Sections Grid */}
            <div className="p-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: <FiUser />,
                  title: "Eligibility",
                  content: "You must be at least 18 years old and legally eligible for matrimony under applicable laws to use our services.",
                  color: "from-blue-500/10 to-cyan-500/10"
                },
                {
                  icon: <FiLock />,
                  title: "Account Registration",
                  content: "You are responsible for maintaining accurate information and safeguarding your login credentials.",
                  color: "from-purple-500/10 to-pink-500/10"
                },
                {
                  icon: <FiAlertTriangle />,
                  title: "User Conduct",
                  content: "Users must behave respectfully and refrain from harassment, impersonation, fraud, or unlawful activity.",
                  color: "from-amber-500/10 to-orange-500/10"
                },
                {
                  icon: <FiFileText />,
                  title: "Profile Information",
                  content: "All profile details must be truthful. We reserve the right to verify or suspend accounts with misleading information.",
                  color: "from-green-500/10 to-emerald-500/10"
                },
                {
                  icon: <FiShield />,
                  title: "Privacy",
                  content: "Your data is handled as per our Privacy Policy, which governs information collection and protection.",
                  color: "from-indigo-500/10 to-blue-500/10"
                },
                {
                  icon: <FiCreditCard />,
                  title: "Subscription Plans",
                  content: "Paid features are subject to plan pricing. Fees are non-refundable unless stated otherwise.",
                  color: "from-pink-500/10 to-rose-500/10"
                },
                {
                  icon: <FiClipboard />,
                  title: "Intellectual Property",
                  content: "All platform content belongs to Paarsh Infotech Pvt. Ltd. and is protected by copyright laws.",
                  color: "from-teal-500/10 to-cyan-500/10"
                },
                {
                  icon: <FiXCircle />,
                  title: "Termination",
                  content: "We may suspend or terminate accounts violating these terms or harming the platform or users.",
                  color: "from-red-500/10 to-orange-500/10"
                },
                {
                  icon: <FiAlertTriangle />,
                  title: "Limitation of Liability",
                  content: "We do not guarantee matches or offline interactions between users.",
                  color: "from-yellow-500/10 to-amber-500/10"
                },
                {
                  icon: <FiRefreshCw />,
                  title: "Changes to Terms",
                  content: "Continued use of the platform implies acceptance of updated terms.",
                  color: "from-blue-500/10 to-indigo-500/10"
                },
                {
                  icon: <FiMapPin />,
                  title: "Governing Law",
                  content: "These terms are governed by the laws of India, with jurisdiction in Maharashtra.",
                  color: "from-purple-500/10 to-violet-500/10"
                },
                {
                  icon: <FiMail />,
                  title: "Contact Information",
                  content: "Email: info@paarshinfotech.com | Phone: +91 90752 01035",
                  color: "from-green-500/10 to-teal-500/10"
                }
              ].map((term, index) => (
                <div
                  key={index}
                  className="group bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br ${term.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <div className="text-[oklch(70.4%_0.191_22.216)] text-xl">
                        {term.icon}
                      </div>
                    </div>
                    <div>
                      <h2 className="font-bold text-gray-800 text-lg">
                        {term.title}
                      </h2>
                      <div className="w-12 h-1 bg-gradient-to-r from-[oklch(70.4%_0.191_22.216)] to-pink-400 rounded-full mt-2"></div>
                    </div>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    {term.content}
                  </p>
                </div>
              ))}
            </div>

            {/* Acceptance Section */}
            <div className="p-10 bg-gradient-to-r from-[oklch(70.4%_0.191_22.216)]/5 to-pink-500/5 border-t border-gray-100">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[oklch(70.4%_0.191_22.216)] to-pink-400 flex items-center justify-center">
                      <FiCheckCircle className="text-3xl text-white" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      Acceptance of Terms
                    </h2>
                    <p className="text-gray-600 mt-2 text-lg">
                      By using Paarsh Matrimony, you confirm that you have read and
                      agreed to these Terms of Use.
                    </p>
                  </div>
                </div>

                {/* Contact Info Cards */}
                <div className="grid sm:grid-cols-2 gap-4 mt-8">
                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                        <FiMail className="text-blue-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">Email</p>
                        <p className="text-sm text-gray-600">info@paarshinfotech.com</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                        <FiFlag className="text-green-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">Phone</p>
                        <p className="text-sm text-gray-600">+91 90752 01035</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

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
      <Chatbot />
      <Footer />
    </>
  );
};

export default TermsOfUse;