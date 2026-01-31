import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
  Heart,
  Search,
  Shield,
  Users,
  MapPin,
  Calendar,
  CheckCircle,
  Clock,
  Filter,
  Award,
  Lock
} from 'lucide-react';
import { FaShieldAlt, FaUserCheck } from "react-icons/fa";
import { GoStopwatch } from "react-icons/go";
import { BsStars } from "react-icons/bs";

const Home = () => {
  const themeColor = "oklch(70.4%_0.191_22.216)";

  const features = [
    {
      icon: <Search className="w-10 h-10" />,
      title: "Intelligent Matching",
      description: "Advanced AI algorithms analyze compatibility based on preferences, interests, and lifestyle"
    },
    {
      icon: <Shield className="w-10 h-10" />,
      title: "Verified Profiles",
      description: "100% verified profiles with photo validation and background checks for safety"
    },
    {
      icon: <Filter className="w-10 h-10" />,
      title: "Advanced Filters",
      description: "Filter by age, education, profession, location, religion, and community"
    },
    {
      icon: <Clock className="w-10 h-10" />,
      title: "Dates or Meetings Scheduler",
      description: "Schedule secure dates or meetings with mutual consent and convenience."
    },
    {
      icon: <Calendar className="w-10 h-10" />,
      title: "Marriage Planning",
      description: "Complete wedding planning assistance with venue booking and vendor management"
    },
    {
      icon: <MapPin className="w-10 h-10" />,
      title: "Location Services",
      description: "Find matches in specific cities or regions across India"
    }
  ];

  const membershipPlans = [
    {
      type: "Free Membership",
      features: [
        "View Partner Images",
        "View Partner Profile Details",
        "Apply Basic Filters",
        "AI Partner Recommendations",
      ]
    },
    {
      type: "Premium Membership",
      features: [
        "All Free Membership Features",
        "Contact Partner Directly",
        "Plan Meetings and Dates",
        "Add to Watchlist for Shortlisting",
        "Marriage Planning Assistance",
        "Feedback and Photo Sharing"
      ],
      popular: true
    }
  ];

  const statistics = [
    { icon: GoStopwatch, label: "Save time & effort" },
    { icon: FaShieldAlt, label: "100% Secure Platform" },
    { icon: BsStars, label: "AI Based Matching" },
    { value: "99%", label: "Verified Profiles", icon: FaUserCheck }
  ];

  return (
    <>
      <Navbar />
      <div className="pt-10">
        {/* Hero Banner */}
        <section
          className="relative min-h-[90vh] flex items-center justify-center overflow-hidden"
          style={{
            backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('/2.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed"
          }}
        >
          <div className="relative container mx-auto px-4 py-20">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-full mb-8">
                <Heart className="w-6 h-6" />
                <span className="text-lg font-semibold">India's Most Trusted Matrimony Platform</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                Welcome to
                <span className="block text-[oklch(70.4%_0.191_22.216)] mt-2">Paarsh Matrimony</span>
              </h1>

              <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto">
                A comprehensive web-based platform connecting compatible individuals through
                intelligent matching, secure communication, and complete marriage planning support
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto mt-12">
                {statistics.map((stat, index) => {
                  const Icon = stat.icon;

                  return (
                    <div key={index} className="text-center">
                      <div className="text-3xl md:text-4xl font-bold text-[oklch(70.4%_0.191_22.216)]">
                        {Icon ? <Icon className="mx-auto" /> : stat.value}
                      </div>
                      <div className="text-gray-300 text-sm mt-2">
                        {stat.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* About Section with Image */}
        <section className="py-20 bg-gradient-to-br from-white to-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="text-left mb-8">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                    About <span className="text-[oklch(70.4%_0.191_22.216)]">Paarsh Matrimony</span>
                  </h2>
                  <p className="text-gray-600 text-lg mb-6">
                    Modern matrimonial platform designed for secure, efficient partner discovery
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[oklch(70.4%_0.191_22.216)]/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-6 h-6 text-[oklch(70.4%_0.191_22.216)]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">Secure Platform</h3>
                      <p className="text-gray-600">Verified profiles and encrypted data ensure safe interactions</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[oklch(70.4%_0.191_22.216)]/10 flex items-center justify-center flex-shrink-0">
                      <Users className="w-6 h-6 text-[oklch(70.4%_0.191_22.216)]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">Intelligent Matching</h3>
                      <p className="text-gray-600">AI-powered recommendations based on preferences and compatibility</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[oklch(70.4%_0.191_22.216)]/10 flex items-center justify-center flex-shrink-0">
                      <Lock className="w-6 h-6 text-[oklch(70.4%_0.191_22.216)]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">Privacy First</h3>
                      <p className="text-gray-600">Complete control over your data and profile visibility</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src="/5.jpg"
                    alt="Paarsh Matrimony Platform"
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                Platform <span className="text-[oklch(70.4%_0.191_22.216)]">Features</span>
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Comprehensive features designed to support your complete matrimonial journey
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-[oklch(70.4%_0.191_22.216)]/30"
                >
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[oklch(70.4%_0.191_22.216)]/20 to-[oklch(70.4%_0.191_22.216)]/5 flex items-center justify-center mb-6 text-[oklch(70.4%_0.191_22.216)] group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Membership Plans */}
        <section className="py-14 md:py-20 bg-gradient-to-br from-gray-50 to-white">
          <div className="container mx-auto px-4 sm:px-6">

            {/* Heading */}
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-3 md:mb-4">
                Membership{" "}
                <span className="text-[oklch(70.4%_0.191_22.216)]">Plans</span>
              </h2>
              <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
                Choose between our Free and Premium plans based on your requirements
              </p>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
              {membershipPlans.map((plan, index) => (
                <div
                  key={index}
                  className={`relative bg-white rounded-2xl p-6 sm:p-8 border-2 transition-all
            ${plan.popular
                      ? 'border-[oklch(70.4%_0.191_22.216)] md:scale-105 md:shadow-2xl'
                      : 'border-gray-200 shadow-md'
                    }`}
                >
                  {/* Recommended badge */}
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <div className="bg-gradient-to-r from-[oklch(70.4%_0.191_22.216)] to-[oklch(60%_0.191_22.216)] 
                              text-white px-4 py-1.5 rounded-full text-xs sm:text-sm 
                              font-semibold flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        RECOMMENDED
                      </div>
                    </div>
                  )}

                  {/* Price */}
                  <div className="text-center mb-6 sm:mb-8">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">
                      {plan.type}
                    </h3>
                    <div
                      className={`text-3xl sm:text-4xl font-bold 
                ${plan.popular
                          ? 'text-[oklch(70.4%_0.191_22.216)]'
                          : 'text-gray-800'
                        }`}
                    >
                      {plan.type.includes('Free') ? '₹0' : '₹1,999/month'}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="mb-6 sm:mb-8">
                    <div className="flex items-center gap-2 mb-4 sm:mb-6">
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                      <span className="font-semibold text-gray-800 text-sm sm:text-base">
                        Included Features
                      </span>
                    </div>

                    <ul className="space-y-2.5 sm:space-y-3">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700 text-sm sm:text-base">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Bottom glow */}
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 
                          bg-gradient-to-r from-transparent 
                          via-[oklch(70.4%_0.191_22.216)]/30 
                          to-transparent rounded-b-2xl" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Technology Stack & Security */}
        <section className="py-0">
          <div
            className="relative"
            style={{
              backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url('/4.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundAttachment: "fixed"
            }}
          >
            <div className="container mx-auto px-4 py-20">
              <div className="max-w-6xl mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Secure & Scalable <span className="text-[oklch(70.4%_0.191_22.216)]">Technology</span>
                </h2>
                <p className="text-gray-300 mb-12 max-w-2xl mx-auto">
                  Built with modern technologies for performance, security, and scalability
                </p>

                <div className="grid md:grid-cols-3 gap-8">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
                    <div className="w-16 h-16 rounded-full bg-[oklch(70.4%_0.191_22.216)]/20 flex items-center justify-center mx-auto mb-6">
                      <Shield className="w-8 h-8 text-[oklch(70.4%_0.191_22.216)]" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">Secure Authentication</h3>
                    <p className="text-gray-300">Multi-factor authentication and secure login system</p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
                    <div className="w-16 h-16 rounded-full bg-[oklch(70.4%_0.191_22.216)]/20 flex items-center justify-center mx-auto mb-6">
                      <Lock className="w-8 h-8 text-[oklch(70.4%_0.191_22.216)]" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">Data Protection</h3>
                    <p className="text-gray-300">End-to-end encryption for all user data and communications</p>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
                    <div className="w-16 h-16 rounded-full bg-[oklch(70.4%_0.191_22.216)]/20 flex items-center justify-center mx-auto mb-6">
                      <MapPin className="w-8 h-8 text-[oklch(70.4%_0.191_22.216)]" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">Location Services</h3>
                    <p className="text-gray-300">Geographical matching and location-based partner discovery</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final Section */}
        <section className="py-20 bg-gradient-to-r from-[oklch(70.4%_0.191_22.216)]/5 to-transparent">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <Heart className="w-16 h-16 text-[oklch(70.4%_0.191_22.216)] mx-auto mb-6" />
              <h2 className="text-4xl font-bold text-gray-800 mb-6">
                Paarsh Matrimony
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                A comprehensive web-based matrimonial platform designed to simplify
                the process of finding a suitable life partner by integrating profile
                creation, partner matching, secure communication, and marriage planning
                features into a single system.
              </p>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default Home;