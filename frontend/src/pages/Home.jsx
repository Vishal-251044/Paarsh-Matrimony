import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import axios from 'axios'; 
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
  Lock,
  LogIn,
  UserPlus,
  CreditCard,
  Globe,
  MessageSquare,
  CalendarHeart,
  CirclePlay,
  Star
} from 'lucide-react';
import { FaShieldAlt, FaUserCheck } from "react-icons/fa";
import { GoStopwatch } from "react-icons/go";
import { BsStars } from "react-icons/bs";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const Home = () => {
  const themeColor = "oklch(70.4%_0.191_22.216)";
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTopFeedbacks = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/feedbacks/top`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = response.data;
      setFeedbacks(data.feedbacks || []);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopFeedbacks();
  }, []);

  const features = [
    {
      icon: <Search className="w-10 h-10" />,
      title: "Intelligent Matching",
      description: "Advanced algorithms analyze compatibility based on preferences, interests, and lifestyle"
    },
    {
      icon: <Shield className="w-10 h-10" />,
      title: "Verified Profiles",
      description: "Thorough verification process to ensure genuine and trustworthy user profiles"
    },
    {
      icon: <Filter className="w-10 h-10" />,
      title: "Advanced Filters",
      description: "Filter by age, education, profession, location, religion, and community"
    },
    {
      icon: <Calendar className="w-10 h-10" />,
      title: "Marriage Planning Assistance",
      description: "AI marriage finance planner, checklist generator for a stress-free wedding"
    },
    {
      icon: <Clock className="w-10 h-10" />,
      title: "Extra Discounts",
      description: "Exclusive discounts on wedding services like venues, photographers, caterers, and more"
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
        "Manage Profile",
        "Partner Recommendations",
        "View Limited Partner Details",
        "Apply Filters",
        "Give feedbacks",
        "Limited Features Access",
      ]
    },
    {
      type: "Premium Membership",
      features: [
        "All Free Membership Features",
        "Contact Partner Directly",
        "Add to Watchlist for Shortlisting",
        "View all Partner Data",
        "Marriage Planning Assistance",
        "Extra Discounts on Wedding Services",
      ],
      popular: true
    }
  ];

  const statistics = [
    { icon: GoStopwatch, label: "Save time & effort" },
    { icon: FaShieldAlt, label: "100% Secure Data" },
    { icon: BsStars, label: "Based Matching Algorithm" },
    { value: "99%", label: "Genuine Profiles", icon: FaUserCheck }
  ];

  const renderFeedbackSection = () => {
    return (
      <section className="py-12 px-4 md:px-8 lg:px-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 bg-[oklch(70.4%_0.191_22.216)]/10 backdrop-blur-sm text-gray-800 px-6 py-2 rounded-full mb-4">
              <Star className="w-4 h-4" />
              <span className="text-sm font-medium">User Experiences</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              What Our <span className="text-[oklch(70.4%_0.191_22.216)]">Users Say</span>
            </h2>
            <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">
              Real experiences from thousands who found their perfect match
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[oklch(70.4%_0.191_22.216)]"></div>
            </div>
          ) : feedbacks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {feedbacks.slice(0, 4).map((feedback, index) => (
                <div
                  key={index}
                  className="group bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-[oklch(70.4%_0.191_22.216)]/30 hover:scale-[1.02]"
                >
                  {/* Rating */}
                  <div className="flex items-center mb-4">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${i < feedback.rating
                            ? 'text-red-500 fill-red-500'
                            : 'text-gray-300'
                            }`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 font-semibold text-gray-700">
                      {feedback.rating}/5
                    </span>
                  </div>

                  {/* Experience */}
                  <div className="mb-4">
                    <p className="text-gray-700 italic leading-relaxed text-sm">
                      "{feedback.experience}"
                    </p>
                  </div>

                  {/* Bottom accent */}
                  <div className="h-1 w-12 bg-gradient-to-r from-[oklch(70.4%_0.191_22.216)] to-transparent rounded-full group-hover:w-24 transition-all duration-300"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No feedbacks available yet. Be the first to share your experience!</p>
            </div>
          )}
        </div>
      </section>
    );
  };

  return (
    <>
      <Navbar />
      <div className="pt-10">
        {/* Hero Banner */}
        <section
          className="relative min-h-[90vh] flex items-center justify-center overflow-hidden"
          style={{
            backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('/3.2.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed"
          }}
        >
          <div className="relative container mx-auto px-4 py-20">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-full mb-8">
                <Heart className="w-6 h-6 animate-pulse text-red-500" />
                <span className="text-lg font-semibold">India's Trusted Matrimony Platform</span>
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
                      <p className="text-gray-600">Genuine profiles and secure data ensure safe interactions</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[oklch(70.4%_0.191_22.216)]/10 flex items-center justify-center flex-shrink-0">
                      <Users className="w-6 h-6 text-[oklch(70.4%_0.191_22.216)]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">Intelligent Matching</h3>
                      <p className="text-gray-600">Best recommendations algorithm based on preferences and compatibility</p>
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
                      {plan.type.includes('Free') ? (
                        '₹0'
                      ) : (
                        <>
                          ₹1,999
                          <span style={{ fontSize: '20px' }}>/year</span>                        </>
                      )}

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

        {/* Partner Journey Steps */}
        <section className="py-0">
          <div
            className="relative min-h-screen md:min-h-0"
            style={{
              backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.85)), url('/2.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundAttachment: "fixed",
              backgroundRepeat: "no-repeat"
            }}
          >
            <div className="container mx-auto px-4 py-12 md:py-20">
              <div className="max-w-6xl mx-auto text-center">
                <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm text-white px-4 py-2 md:px-6 md:py-2 rounded-full mb-6">
                  <div className="w-2 h-2 bg-[oklch(70.4%_0.191_22.216)] rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Find Your Perfect Match</span>
                </div>

                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 px-4">
                  Your Journey to <span className="text-[oklch(70.4%_0.191_22.216)]">Finding Love</span>
                </h2>
                <p className="text-gray-300 mb-8 md:mb-12 max-w-2xl mx-auto text-base md:text-lg px-4">
                  Simple steps to connect with your ideal life partner
                </p>

                {/* Horizontal Steps Timeline for Desktop & iPad */}
                <div className="hidden md:block">
                  {/* Timeline Line */}
                  <div className="relative">
                    <div className="absolute left-4 right-4 top-6 h-0.5 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>

                    <div className="grid grid-cols-7 gap-2 lg:gap-4 relative px-2">
                      {[
                        {
                          step: "01",
                          icon: <LogIn className="w-6 h-6 lg:w-7 lg:h-7" />,
                          title: "Create Account",
                          desc: "Registration with secure verification"
                        },
                        {
                          step: "02",
                          icon: <UserPlus className="w-6 h-6 lg:w-7 lg:h-7" />,
                          title: "Build Profile",
                          desc: "Add self, family & partner data"
                        },
                        {
                          step: "03",
                          icon: <CreditCard className="w-6 h-6 lg:w-7 lg:h-7" />,
                          title: "Yearly Payment",
                          desc: "Single annual membership fee"
                        },
                        {
                          step: "04",
                          icon: <Globe className="w-6 h-6 lg:w-7 lg:h-7" />,
                          title: "Publish Profile",
                          desc: "Viewable to all compatible matches"
                        },
                        {
                          step: "05",
                          icon: <Heart className="w-6 h-6 lg:w-7 lg:h-7" />,
                          title: "Browse Matches",
                          desc: "View compatible profiles"
                        },
                        {
                          step: "06",
                          icon: <MessageSquare className="w-6 h-6 lg:w-7 lg:h-7" />,
                          title: "Add to Watchlist",
                          desc: "Save profiles you're interested in"
                        },
                        {
                          step: "07",
                          icon: <CalendarHeart className="w-6 h-6 lg:w-7 lg:h-7" />,
                          title: "Marriage Support",
                          desc: "Guidance till your special day"
                        }
                      ].map((item, index) => (
                        <div key={index} className="relative group">
                          {/* Step Number Circle */}
                          <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-br from-[oklch(70.4%_0.191_22.216)] to-[oklch(60%_0.2_22.216)] flex items-center justify-center mx-auto mb-3 lg:mb-4 relative z-10 group-hover:scale-110 transition-transform duration-300">
                            <span className="font-bold text-white text-sm lg:text-base">{item.step}</span>
                          </div>

                          {/* Card */}
                          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 lg:p-6 border border-white/20 hover:border-[oklch(70.4%_0.191_22.216)]/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl min-h-[180px] lg:min-h-[220px] flex flex-col">
                            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-3 lg:mb-4">
                              <div className="text-[oklch(70.4%_0.191_22.216)]">
                                {item.icon}
                              </div>
                            </div>
                            <h3 className="text-sm lg:text-lg font-bold text-white mb-1 lg:mb-2">{item.title}</h3>
                            <p className="text-gray-300 text-xs lg:text-sm flex-grow">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Vertical Steps for Mobile & Tablet (portrait) */}
                <div className="md:hidden">
                  <div className="space-y-4 max-w-md mx-auto">
                    {[
                      {
                        step: "01",
                        icon: <LogIn className="w-5 h-5" />,
                        title: "Create Account",
                        desc: "Registration with secure verification"
                      },
                      {
                        step: "02",
                        icon: <UserPlus className="w-5 h-5" />,
                        title: "Build Profile",
                        desc: "Add self, family & partner data"
                      },
                      {
                        step: "03",
                        icon: <CreditCard className="w-5 h-5" />,
                        title: "Yearly Payment",
                        desc: "Single annual membership fee"
                      },
                      {
                        step: "04",
                        icon: <Globe className="w-5 h-5" />,
                        title: "Go Live",
                        desc: "Profile becomes visible to matches"
                      },
                      {
                        step: "05",
                        icon: <Heart className="w-5 h-5" />,
                        title: "Browse Matches",
                        desc: "View compatible profiles, add to watchlist"
                      },
                      {
                        step: "06",
                        icon: <MessageSquare className="w-5 h-5" />,
                        title: "Add to Watchlist",
                        desc: "Save profiles you're interested in"
                      },
                      {
                        step: "07",
                        icon: <CalendarHeart className="w-5 h-5" />,
                        title: "Marriage Support",
                        desc: "Guidance and assistance till marriage"
                      }
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                        {/* Step Number - Always Visible */}
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[oklch(70.4%_0.191_22.216)] to-[oklch(60%_0.2_22.216)] flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="font-bold text-white text-sm">{item.step}</span>
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                              <div className="text-[oklch(70.4%_0.191_22.216)]">
                                {item.icon}
                              </div>
                            </div>
                            <h3 className="text-base font-bold text-white">{item.title}</h3>
                          </div>
                          <p className="text-gray-300 text-xs ml-11">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Button */}
                <div className="mt-12 md:mt-16 px-4">
                  <button className="px-6 py-3 md:px-8 md:py-3 bg-gradient-to-r from-[oklch(70.4%_0.191_22.216)] to-[oklch(60%_0.2_22.216)] text-white rounded-full font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2 mx-auto text-sm md:text-base">
                    Start Your Journey Today
                  </button>
                  <p className="text-gray-400 text-xs md:text-sm mt-3 md:mt-4">
                    Join thousands finding their perfect match
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* User Feedback Section */}
        {renderFeedbackSection()}

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