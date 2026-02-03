import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUserContext } from '../context/UserContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion, AnimatePresence } from "framer-motion";
import {
  Crown, Lock, Calendar, Heart, Sparkles, CheckCircle, ArrowRight,
  Mail, UserCheck, Shield, Zap, Users, Clock, Filter, Star, ChevronDown,
  AlertCircle, RefreshCw, Edit2
} from "lucide-react";

const Watchlist = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userProfile } = useUserContext();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isExpanded2, setIsExpanded2] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Priority: 1. location.state, 2. userProfile context, 3. localStorage
  let userData;

  if (location.state && location.state.userEmail) {
    userData = location.state;
  } else if (userProfile && userProfile.userEmail) {
    userData = userProfile;
  } else {
    // Fallback to localStorage
    const storedData = localStorage.getItem('userData');
    userData = storedData ? JSON.parse(storedData) : {
      userEmail: '',
      isProfilePublished: false,
      membershipType: 'free'
    };
  }

  const isPremium = userData?.membershipType === 'premium';
  const primaryColor = "oklch(70.4% 0.191 22.216)";
  const primaryDark = "oklch(60% 0.191 22.216)";

  // Floating shapes for premium users
  const floatingShapes = [
    { id: 1, size: "w-16 h-16 sm:w-20 sm:h-20", delay: 0 },
    { id: 2, size: "w-12 h-12 sm:w-16 sm:h-16", delay: 1.5 },
    { id: 3, size: "w-20 h-20 sm:w-24 sm:h-24", delay: 0.8 },
  ];

  // Initialize particles
  useEffect(() => {
    // Store user data in localStorage for consistency
    if (userData?.userEmail) {
      localStorage.setItem('userData', JSON.stringify(userData));
    }
  }, [userData]);

  // Event handler for upgrading plan
  const handleUpgradePlan = () => {
    navigate('/profile');
  };

  // Event handler for refreshing data
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Add your refresh logic here
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Refresh logic goes here
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-16 sm:pt-16 relative overflow-hidden">

        {/* Premium floating objects */}
        <AnimatePresence>
          {isPremium && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {floatingShapes.map((shape) => (
                <motion.div
                  key={shape.id}
                  className={`absolute ${shape.size} rounded-full`}
                  style={{
                    background: primaryColor,
                    opacity: 0.08,
                    left: `${15 + shape.id * 25}%`,
                  }}
                  initial={{ y: 100, opacity: 0 }}
                  animate={{
                    y: [100, -50, 100],
                    x: [0, Math.sin(shape.id) * 30, 0],
                    rotate: [0, 180, 360],
                    opacity: [0, 0.1, 0],
                  }}
                  transition={{
                    duration: 12,
                    delay: shape.delay,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </div>
          )}
        </AnimatePresence>

        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 relative z-10">
          {/* Enhanced Account Info Box */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}

          >
            {/* User Info Banner */}
            <div className="bg-gradient-to-r from-[#EA7B7B] to-[#D25353] rounded-2xl shadow-xl mb-6 md:mb-8 text-white overflow-hidden w-full">
              {/* Collapsible Header */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full px-4 md:px-6 py-4 flex justify-between items-center transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/10">
                    <Users className="text-white" size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold">Account Dashboard</h2>
                  </div>
                </div>

                {/* Arrow Icon */}
                <div className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                  <ChevronDown className="w-5 h-5 md:w-6 md:h-6" />
                </div>
              </button>

              {/* Collapsible Content */}
              <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96' : 'max-h-0 overflow-hidden'}`}>
                <div className="px-4 md:px-6 pb-4 md:pb-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Left Section - Stats Grid */}
                    <div className="flex-1">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                        {/* Email Card */}
                        <div className="bg-white/10 backdrop-blur-sm p-2 sm:p-3 rounded-lg border border-white/20">
                          <div className="flex items-center gap-1 sm:gap-2 mb-2">
                            <div className="p-1 sm:p-1.5 rounded bg-white/20">
                              <Mail size={12} className="text-white" />
                            </div>
                            <span className="text-xs text-white/90">Email</span>
                          </div>
                          <p className="text-xs sm:text-sm font-semibold truncate">
                            {userData?.userEmail || "Not available"}
                          </p>
                        </div>

                        {/* Status Card */}
                        <div className="bg-white/10 backdrop-blur-sm p-2 sm:p-3 rounded-lg border border-white/20">
                          <div className="flex items-center gap-1 sm:gap-2 mb-2">
                            <div className="p-1 sm:p-1.5 rounded bg-white/20">
                              <UserCheck size={12} className="text-white" />
                            </div>
                            <span className="text-xs text-white/90">Status</span>
                          </div>
                          <div className={`inline-flex items-center gap-1 px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${userData?.isProfilePublished
                            ? 'bg-white/30 text-white'
                            : 'bg-white/20 text-white'
                            }`}>
                            {userData?.isProfilePublished ? (
                              <>
                                <CheckCircle size={10} />
                                <span className="hidden xs:inline">Published</span>
                                <span className="xs:hidden">Pub</span>
                              </>
                            ) : (
                              <>
                                <Clock size={10} />
                                <span className="hidden xs:inline">Not Published</span>
                                <span className="xs:hidden">Pending</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Plan Card */}
                        <div className="bg-white/10 backdrop-blur-sm p-2 sm:p-3 rounded-lg border border-white/20">
                          <div className="flex items-center gap-1 sm:gap-2 mb-2">
                            <div className="p-1 sm:p-1.5 rounded bg-white/20">
                              <Shield size={12} className="text-white" />
                            </div>
                            <span className="text-xs text-white/90">Plan</span>
                          </div>
                          <div className={`inline-flex items-center gap-1 px-2 py-0.5 sm:py-1 rounded-full text-xs font-bold ${isPremium ? 'bg-white text-[#D25353]' : 'bg-white/30 text-white'
                            }`}>
                            {isPremium ? (
                              <>
                                <Crown size={10} />
                                <span className="hidden xs:inline">Premium</span>
                                <span className="xs:hidden">Pro</span>
                              </>
                            ) : (
                              <>
                                <span className="hidden xs:inline">Free Plan</span>
                                <span className="xs:hidden">Free</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Features Card */}
                        <div className="bg-white/10 backdrop-blur-sm p-2 sm:p-3 rounded-lg border border-white/20">
                          <div className="flex items-center gap-1 sm:gap-2 mb-2">
                            <div className="p-1 sm:p-1.5 rounded bg-white/20">
                              <Zap size={12} className="text-white" />
                            </div>
                            <span className="text-xs text-white/90">Features</span>
                          </div>
                          <p className="text-xs sm:text-sm font-semibold">
                            {isPremium ? 'Full Access' : 'Limited'}
                          </p>
                        </div>
                      </div>

                      {/* Profile Status Message */}
                      {!userData?.isProfilePublished && (
                        <div className="mt-4 p-3 md:p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                          <p className="flex items-start gap-2 text-sm md:text-base">
                            <AlertCircle className="flex-shrink-0 mt-0.5" size={18} />
                            Your profile needs to be published to get matches. Complete and publish your profile first.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Right Section - Buttons */}
                    <div className="flex flex-wrap gap-2">
                      {!userData?.isProfilePublished ? (
                        <button
                          onClick={() => navigate('/profile')}
                          className="inline-flex items-center gap-2 px-4 md:px-5 py-2 bg-white text-[#D25353] rounded-lg hover:shadow-lg transition-all font-medium shadow-md text-sm md:text-base"
                        >
                          <Edit2 size={16} /> Complete Profile
                        </button>
                      ) : (
                        <>
                          {!isPremium && (
                            <button
                              onClick={handleUpgradePlan}
                              className="inline-flex items-center gap-2 px-4 md:px-5 py-2 bg-white text-[#D25353] rounded-lg hover:shadow-lg transition-all font-medium shadow-md text-sm md:text-base"
                            >
                              <Star size={16} /> Upgrade Plan
                            </button>
                          )}
                          <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="inline-flex items-center gap-2 px-4 md:px-5 py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-all font-medium disabled:opacity-50 text-white text-sm md:text-base"
                          >
                            {refreshing ? (
                              <>
                                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                Refreshing...
                              </>
                            ) : (
                              <>
                                <RefreshCw size={16} /> Refresh
                              </>
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Section - Upgrade CTA */}
            {!isPremium && (
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="lg:w-auto mt-4 lg:mt-0"
              >
              </motion.div>
            )}
          </motion.div>

          {/* Main Content */}
          {isPremium ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="space-y-6 sm:space-y-8"
            >
              {/* First Section: Premium Watchlist Features */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                {/* Collapsible Header */}
                <button
                  onClick={() => setIsExpanded2(!isExpanded2)}
                  className="w-full px-4 sm:px-6 md:px-8 py-4 sm:py-6 flex justify-between items-center transition-colors hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-3 sm:p-4 rounded-xl" style={{ background: primaryColor }}>
                      <Crown className="text-white" size={20} />
                    </div>
                    <div className="text-left">
                      <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                        Premium Watchlist
                      </h1>
                      <p className="text-gray-600 text-xs sm:text-sm mt-1">
                        Access exclusive features for your matrimonial journey
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1 text-white rounded-full text-xs font-bold flex items-center gap-1 sm:gap-2"
                      style={{ background: primaryColor }}>
                      <span className="hidden xs:inline">Premium Active</span>
                      <span className="xs:hidden">Active</span>
                    </div>

                    {/* Arrow Icon */}
                    <div className={`transform transition-transform duration-300 ${isExpanded2 ? 'rotate-180' : ''}`}>
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    </div>
                  </div>
                </button>

                {/* Collapsible Content for Premium Features */}
                {isExpanded2 && (
                  <div className="px-4 sm:px-6 md:px-8 pb-4 sm:pb-6 md:pb-8 pt-2">
                    {/* Premium Features Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                      {[
                        { icon: Heart, title: "View All Details", desc: "View complete profile details of interested partners" },
                        { icon: Calendar, title: "Date Planning", desc: "Schedule meetings with matches" },
                        { icon: Sparkles, title: "Marriage Help", desc: "Expert guidance through process" },
                        { icon: Filter, title: "Advanced Filters", desc: "Precise search filters" },
                      ].map((feature, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ y: -4 }}
                          className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 group"
                        >
                          <div className="p-3 rounded-lg w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300"
                            style={{ background: `${primaryColor}15` }}>
                            <feature.icon style={{ color: primaryColor }} size={20} />
                          </div>
                          <h3 className="font-bold text-gray-800 text-base sm:text-lg mb-1 sm:mb-2">{feature.title}</h3>
                          <p className="text-gray-600 text-xs sm:text-sm">{feature.desc}</p>
                          <div className="mt-3 sm:mt-4 pt-3 border-t border-gray-100">
                            <span className="text-xs font-medium" style={{ color: primaryColor }}>✓ Active</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Second Section: Coming Soon - Always Visible */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                {/* Section Header (Not Collapsible) */}
                <div className="w-full px-4 sm:px-6 md:px-8 py-4 sm:py-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-3 sm:p-4 rounded-xl" style={{ background: primaryDark }}>
                      <Sparkles className="text-white" size={20} />
                    </div>
                    <div className="text-left">
                      <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                        Your Interested Partners
                      </h2>
                      <p className="text-gray-600 text-xs sm:text-sm mt-1">
                        Coming soon with amazing features
                      </p>
                    </div>
                  </div>
                </div>

                {/* Coming Soon Section Content - Always Visible */}
                <div className="px-4 sm:px-6 md:px-8 pb-4 sm:pb-6 md:pb-8">
                  <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 text-white overflow-hidden"
                    style={{ background: primaryDark }}>
                    <div className="relative z-10">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                        {[
                          { icon: Mail, text: "All Partner Data" },
                          { icon: Users, text: "Plan Family Meeting" },
                          { icon: Calendar, text: "Date Planning" },
                        ].map((item, i) => (
                          <div key={i} className="bg-white/10 p-3 rounded-lg border border-white/20">
                            <item.icon size={14} className="inline mr-2 mb-1" />
                            <span className="text-xs sm:text-sm">{item.text}</span>
                          </div>
                        ))}
                      </div>

                      <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold text-sm sm:text-base"
                          style={{ background: primaryColor }}>
                          <Clock size={14} />
                          <span className="hidden xs:inline">Launching Soon</span>
                          <span className="xs:hidden">Coming Soon</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Free User Upgrade Prompt */}
              <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                  {/* Hero Section */}
                  <div className="relative p-6 sm:p-8 md:p-12 text-center"
                    style={{ background: `${primaryColor}05` }}>
                    <div className="absolute top-0 left-0 right-0 h-1" style={{ background: primaryColor }} />

                    <div className="relative z-10">
                      <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full mb-4 sm:mb-6 mx-auto shadow-lg">
                        <Lock className="text-gray-500" size={28} />
                        <div className="absolute -top-2 -right-2 animate-bounce">
                          <span className="px-2 py-1 sm:px-3 sm:py-1.5 text-white text-xs font-bold rounded-full shadow-md"
                            style={{ background: primaryColor }}>
                            LOCKED
                          </span>
                        </div>
                      </div>

                      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                        Upgrade to Premium
                      </h1>
                      <p className="text-gray-600 text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
                        Unlock watchlist, date planning, and marriage assistance features
                      </p>
                    </div>
                  </div>

                  <div className="p-4 sm:p-6 md:p-8">
                    {/* Locked Features Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
                      {[
                        {
                          icon: Heart,
                          title: "Watchlist Access",
                          description: "Save and manage profiles",
                          features: ["Unlimited saves", "Priority sorting"],
                        },
                        {
                          icon: Calendar,
                          title: "Date Planning",
                          description: "Schedule meetings",
                          features: ["Calendar sync", "Location sharing"],
                        },
                        {
                          icon: Sparkles,
                          title: "Marriage Planning",
                          description: "Proper guidance",
                          features: ["Checklists", "Vendor access"],
                        }
                      ].map((feature, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.15 }}
                          className="bg-white p-4 sm:p-6 rounded-lg border-2 border-gray-200 shadow-md hover:shadow-lg transition-all duration-300"
                        >
                          <div className="p-3 rounded-lg mb-3 sm:mb-4" style={{ background: `${primaryColor}10` }}>
                            <feature.icon style={{ color: primaryColor }} size={24} />
                          </div>
                          <h3 className="font-bold text-gray-800 text-lg sm:text-xl mb-2">{feature.title}</h3>
                          <p className="text-gray-600 text-sm sm:text-base mb-3 sm:mb-4">{feature.description}</p>
                          <ul className="space-y-1 sm:space-y-2">
                            {feature.features.map((item, i) => (
                              <li key={i} className="flex items-center gap-2 text-xs sm:text-sm text-gray-700">
                                <div className="w-1.5 h-1.5 rounded-full" style={{ background: primaryColor }} />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      ))}
                    </div>

                    {/* Upgrade Card */}
                    <motion.div
                      initial={{ scale: 0.95 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3 }}
                      className="relative rounded-xl sm:rounded-2xl overflow-hidden mb-6 sm:mb-8"
                      style={{ background: primaryColor }}
                    >
                      <div className="p-4 sm:p-6 md:p-8">
                        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 sm:gap-6">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3 sm:mb-4">
                              <div className="p-2 sm:p-3 rounded-lg bg-white/20">
                                <Star className="text-white" size={20} />
                              </div>
                              <div>
                                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">Premium Lifetime</h3>
                                <p className="text-white/90 text-sm sm:text-base">One-time payment, lifetime access</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-2 sm:gap-3 mt-4">
                              {[
                                "Contact Partner Directly",
                                "Plan Meetings and Dates",
                                "Add to Watchlist for Shortlisting",
                                "Marriage Planning Assistance",
                              ].map((item, i) => (
                                <div key={i} className="flex items-center gap-2">
                                  <CheckCircle size={14} className="text-white" />
                                  <span className="text-white text-xs sm:text-sm">{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="text-center lg:text-right">
                            <div className="mb-3 sm:mb-4">
                              <div className="flex items-baseline justify-center lg:justify-end">
                                <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
                                  ₹1,999
                                </span>
                                <span className="text-white/80 ml-1 sm:ml-2 text-sm sm:text-base">/lifetime</span>
                              </div>
                              <p className="text-white/80 text-xs sm:text-sm mt-1">One-time payment only</p>
                            </div>

                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="bg-white text-gray-900 font-bold px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base flex items-center justify-center gap-2 sm:gap-3 hover:shadow-xl transition-all duration-300 w-full lg:w-auto"
                              style={{ color: primaryDark }}
                              onClick={() => navigate("/profile")}
                            >
                              <Crown size={16} />
                              <span>Upgrade to Premium</span>
                              <ArrowRight size={16} />
                            </motion.button>

                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Testimonial */}
                    <div className="text-center max-w-2xl mx-auto">
                      <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full mb-3 sm:mb-4"
                        style={{ background: `${primaryColor}15` }}>
                        <Users style={{ color: primaryColor }} size={20} />
                      </div>
                      <p className="text-gray-600 italic text-sm sm:text-base md:text-lg mb-3 sm:mb-4">
                        "Premium features helped me find my perfect match in just 3 weeks!"
                      </p>
                      <div>
                        <p className="font-bold text-gray-800 text-sm sm:text-base">Paarsh Matrimony Assistant</p>
                        <p className="text-gray-500 text-xs sm:text-sm">Trusted by thousands of families</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Watchlist;