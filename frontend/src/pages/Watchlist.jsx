import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUserContext } from '../context/UserContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Marriage from "../components/MarriageAssistance";
import WeddingServices from "../components/WeddingServices";
import { motion, AnimatePresence } from "framer-motion";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";

import {
  FiEdit2,
  FiAlertCircle,
  FiHeart,
  FiMapPin,
  FiBriefcase,
  FiBook,
  FiStar,
  FiRefreshCw,
  FiEye,
  FiMail,
  FiPhone,
  FiUsers,
  FiHome,
  FiUser,
  FiCheck,
  FiX,
  FiPercent,
  FiFilter,
  FiSearch,
  FiLock,
  FiBookmark,
  FiBookOpen,
  FiTarget,
  FiBarChart2,
  FiTrash2,
  FiCalendar,
  FiTag,
  FiInfo,
  FiCheckCircle,
  FiArrowRight
} from "react-icons/fi";
import {
  FaVenusMars,
  FaBirthdayCake,
  FaUserGraduate,
  FaPrayingHands,
  FaWhatsapp,
  FaChartLine,
  FaCrown
} from "react-icons/fa";
import { HiOutlineSparkles } from "react-icons/hi";
import { IoStatsChart } from "react-icons/io5";

const Watchlist = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userProfile } = useUserContext();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isExpanded2, setIsExpanded2] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [partners, setPartners] = useState([]);
  const [filteredPartners, setFilteredPartners] = useState([]);
  const [loadingPartners, setLoadingPartners] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [watchlistEmails, setWatchlistEmails] = useState([]);
  const [openMarriage, setOpenMarriage] = useState(false);
  const [openWedding, setOpenWedding] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    maritalStatus: [],
    education: [],
    profession: [],
    annualPackage: [],
    employmentType: [],
    homeCity: '',
    currentCity: '',
    minAge: '',
    maxAge: '',
    minHeight: '',
    maxHeight: '',
    minWeight: '',
    maxWeight: ''
  });

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  // Filter options
  const filterOptions = {
    maritalStatus: ["Never Married", "Divorced", "Widowed", "Separated"],
    education: [
      "High School",
      "Diploma",
      "Bachelor's Degree",
      "Master's Degree",
      "PhD",
      "Post Doctorate"
    ],
    profession: [
      "Engineer",
      "Doctor",
      "Teacher",
      "Business",
      "Government Employee",
      "Private Employee",
      "Student",
      "Other"
    ],
    annualPackage: ["1-3 LPA", "3-5 LPA", "5-10 LPA", "10-20 LPA", "20-50 LPA", "50+ LPA"],
    employmentType: ["Private", "Government", "Business", "Self-employed", "Unemployed"]
  };

  const colors = {
    primary: 'rgb(234, 123, 123)',
    primaryDark: 'rgb(210, 83, 83)',
    primaryDarker: 'rgb(158, 59, 59)',
    light: 'rgb(255, 234, 211)'
  };

  // Helper function for primary gradient
  const getPrimaryGradient = (direction = 'to right') => {
    return `linear-gradient(${direction}, ${colors.primary}, ${colors.primaryDark})`;
  };

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

  // Helper function to show value
  const showValue = (val) => {
    if (val === null || val === undefined) return "Not Mentioned";
    if (typeof val === "string" && val.trim() === "") return "Not Mentioned";
    return val;
  };

  // Helper function to parse height to cm
  const parseHeightToCm = (heightStr) => {
    if (!heightStr) return 0;
    const height = heightStr.toString().toLowerCase().trim();

    const cmMatch = height.match(/(\d+(?:\.\d+)?)\s*cm/);
    if (cmMatch) {
      return Math.round(parseFloat(cmMatch[1]));
    }

    const feetInchesMatch = height.match(/(\d+(?:\.\d+)?)\s*(?:['\u2032ft])\s*(\d+(?:\.\d+)?)?\s*(?:["\u2033in]?)?/);
    if (feetInchesMatch) {
      const feet = parseFloat(feetInchesMatch[1]);
      const inches = parseFloat(feetInchesMatch[2] || 0);
      return Math.round((feet * 30.48) + (inches * 2.54));
    }

    const justNumber = height.match(/^(\d+(?:\.\d+)?)$/);
    if (justNumber) {
      const num = parseFloat(justNumber[1]);
      if (num < 10) {
        const feet = Math.floor(num);
        const inches = (num - feet) * 12;
        return Math.round((feet * 30.48) + (inches * 2.54));
      }
      return Math.round(num);
    }

    return 0;
  };

  // Helper function to parse income
  const parseIncome = (incomeStr) => {
    if (!incomeStr) return 0;
    const match = incomeStr.match(/(\d+(?:\.\d+)?)\s*(?:LPA|L|Lakh)/i);
    if (match) {
      return parseFloat(match[1]) * 100000;
    }
    return 0;
  };

  // Helper function to parse income range
  const parseIncomeRange = (rangeStr) => {
    const match = rangeStr.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*LPA/i);
    if (match) {
      return [parseFloat(match[1]) * 100000, parseFloat(match[2]) * 100000];
    }
    if (rangeStr.includes('50+')) {
      return [5000000, Infinity];
    }
    return [0, 0];
  };

  // Apply filters - memoized to prevent unnecessary re-renders
  const applyFilters = useCallback(() => {
    if (partners.length === 0) {
      setFilteredPartners([]);
      return;
    }

    const filtered = partners.filter(partner => {
      const personalInfo = partner.personalInfo || {};
      const careerInfo = partner.careerInfo || {};
      const locationInfo = partner.locationInfo || {};
      const educationInfo = partner.educationInfo || {};

      // Age filter
      const age = parseInt(personalInfo.age) || 0;
      if (activeFilters.minAge && age < parseInt(activeFilters.minAge)) return false;
      if (activeFilters.maxAge && age > parseInt(activeFilters.maxAge)) return false;

      // Marital Status filter
      if (activeFilters.maritalStatus.length > 0 &&
        !activeFilters.maritalStatus.includes(personalInfo.maritalStatus)) {
        return false;
      }

      // Education filter
      if (activeFilters.education.length > 0 &&
        !activeFilters.education.some(edu => educationInfo.highestEducation?.includes(edu))) {
        return false;
      }

      // Profession filter
      if (activeFilters.profession.length > 0 &&
        !activeFilters.profession.some(prof => careerInfo.profession?.includes(prof))) {
        return false;
      }

      // Annual Package filter
      if (activeFilters.annualPackage.length > 0 && careerInfo.annualIncome) {
        const matchIncome = parseIncome(careerInfo.annualIncome);
        let passesIncome = false;
        activeFilters.annualPackage.forEach(range => {
          const [min, max] = parseIncomeRange(range);
          if (matchIncome >= min && matchIncome <= max) {
            passesIncome = true;
          }
        });
        if (!passesIncome) return false;
      }

      // Employment Type filter
      if (activeFilters.employmentType.length > 0 &&
        !activeFilters.employmentType.includes(careerInfo.employmentType)) {
        return false;
      }

      // Home City filter
      if (activeFilters.homeCity && activeFilters.homeCity.trim() !== '') {
        const searchCity = activeFilters.homeCity.trim().toLowerCase();
        const matchCity = locationInfo.city ? locationInfo.city.trim().toLowerCase() : '';
        if (!matchCity.includes(searchCity)) return false;
      }

      // Current Town filter
      if (activeFilters.currentCity && activeFilters.currentCity.trim() !== '') {
        const searchCity = activeFilters.currentCity.trim().toLowerCase();
        const matchCity = locationInfo.currentLocation ? locationInfo.currentLocation.trim().toLowerCase() : '';
        if (!matchCity.includes(searchCity)) return false;
      }

      // Height filter
      if (activeFilters.minHeight || activeFilters.maxHeight) {
        const heightInCm = parseHeightToCm(personalInfo.height);
        const minHeight = parseInt(activeFilters.minHeight) || 0;
        const maxHeight = parseInt(activeFilters.maxHeight) || 999;
        if (activeFilters.minHeight && heightInCm < minHeight) return false;
        if (activeFilters.maxHeight && heightInCm > maxHeight) return false;
      }

      // Weight filter
      if (activeFilters.minWeight && personalInfo.weight &&
        parseInt(personalInfo.weight) < parseInt(activeFilters.minWeight)) return false;
      if (activeFilters.maxWeight && personalInfo.weight &&
        parseInt(personalInfo.weight) > parseInt(activeFilters.maxWeight)) return false;

      return true;
    });

    setFilteredPartners(filtered);
  }, [activeFilters, partners]);

  // Handle filter change for text inputs with debouncing
  const handleFilterChange = (filterType, value) => {
    setActiveFilters(prev => {
      if (Array.isArray(prev[filterType])) {
        const currentArray = prev[filterType];
        if (currentArray.includes(value)) {
          return {
            ...prev,
            [filterType]: currentArray.filter(item => item !== value)
          };
        } else {
          return {
            ...prev,
            [filterType]: [...currentArray, value]
          };
        }
      } else {
        return {
          ...prev,
          [filterType]: value
        };
      }
    });
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setActiveFilters({
      maritalStatus: [],
      education: [],
      profession: [],
      annualPackage: [],
      employmentType: [],
      homeCity: '',
      currentCity: '',
      minAge: '',
      maxAge: '',
      minHeight: '',
      maxHeight: '',
      minWeight: '',
      maxWeight: ''
    });
  };

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    Object.keys(activeFilters).forEach(key => {
      if (Array.isArray(activeFilters[key])) {
        count += activeFilters[key].length;
      } else if (activeFilters[key] && activeFilters[key].toString().trim() !== '') {
        count += 1;
      }
    });
    return count;
  };

  // Fetch watchlist data
  const fetchWatchlist = async () => {
    if (!isPremium || !userData?.userEmail) {
      setLoadingPartners(false);
      return;
    }

    try {
      setLoadingPartners(true);
      const token = localStorage.getItem('token');

      // First fetch watchlist emails
      const watchlistResponse = await axios.get(
        `${BACKEND_URL}/api/watchlist/partners/${userData.userEmail}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (watchlistResponse.data.success) {
        const emails = watchlistResponse.data.partners || [];
        setWatchlistEmails(emails);

        // Then fetch partner profiles
        const res = await axios.get(
          `${BACKEND_URL}/api/watchlist-profiles/${userData.userEmail}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (res.data.data) {
          setPartners(res.data.data || []);
          setFilteredPartners(res.data.data || []);
        } else {
          setPartners([]);
          setFilteredPartners([]);
        }
      } else {
        setPartners([]);
        setFilteredPartners([]);
        setWatchlistEmails([]);
      }
    } catch (err) {
      console.error("Watchlist error:", err);
      if (err.response && err.response.status === 404) {
        setPartners([]);
        setFilteredPartners([]);
        setWatchlistEmails([]);
      } else {
        toast.error("Failed to load watchlist");
      }
      setPartners([]);
      setFilteredPartners([]);
    } finally {
      setLoadingPartners(false);
    }
  };

  // Remove from watchlist
  const handleRemoveFromWatchlist = async (partnerEmail) => {
    if (!partnerEmail || partnerEmail === "undefined" || partnerEmail === "null") {
      console.error("❌ handleRemoveFromWatchlist called with invalid email:", partnerEmail);

      if (selectedPartner) {
        partnerEmail = selectedPartner.personalInfo?.email ||
          selectedPartner.email ||
          selectedPartner.userEmail;
      }

      if (!partnerEmail) {
        toast.error("Cannot remove: Partner email not found");
        return;
      }
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("Please login to continue");
        return;
      }

      const userEmail = userData?.userEmail;
      if (!userEmail) {
        toast.error("User email not found");
        return;
      }

      const response = await axios.delete(
        `${BACKEND_URL}/api/watchlist-remove`,
        {
          params: {
            user_email: userEmail,
            partner_email: partnerEmail
          },
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setWatchlistEmails(prev => prev.filter(email => email !== partnerEmail));
        setPartners(prev => prev.filter(p => p.personalInfo?.email !== partnerEmail));
        setFilteredPartners(prev => prev.filter(p => p.personalInfo?.email !== partnerEmail));

        if (selectedPartner?.personalInfo?.email === partnerEmail) {
          setShowPartnerModal(false);
          setSelectedPartner(null);
        }

        toast.success("Removed from watchlist!");
      } else {
        toast.error(response.data.error || "Failed to remove from watchlist");
      }
    } catch (error) {
      console.error("❌ Remove watchlist error:", error);

      if (error.response?.status === 422) {
        toast.error("Validation error: Missing required parameters");
      } else if (error.response?.status === 404) {
        toast.error("Watchlist or partner not found");
      } else if (error.request) {
        toast.error("No response from server");
      } else {
        toast.error("Failed to remove from watchlist");
      }
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchWatchlist();
    setRefreshing(false);
  };

  // Handle partner click
  const handlePartnerClick = (partner) => {
    setSelectedPartner(partner);
    setShowPartnerModal(true);
  };

  // Get match score color
  const getScoreColor = (score) => {
    if (score >= 90) return 'from-[#9E3B3B] to-[#7A2F2F]';
    if (score >= 80) return 'from-[#D25353] to-[#9E3B3B]';
    if (score >= 70) return 'from-[#EA7B7B] to-[#D25353]';
    if (score >= 60) return 'from-[#EA7B7B]/80 to-[#D25353]/80';
    return 'from-[#EA7B7B]/60 to-[#D25353]/60';
  };

  // Format match score
  const formatMatchScore = (score) => {
    if (typeof score === 'string') {
      const cleaned = score.replace('%', '').trim();
      const num = parseFloat(cleaned);
      return isNaN(num) ? 0 : num;
    }
    return typeof score === 'number' ? score : parseFloat(score) || 0;
  };

  // Calculate match percentage
  const calculateMatchPercentage = (score) => {
    if (score >= 90) return { label: 'Excellent Match', color: 'text-[#00000]', bgColor: 'bg-[#9E3B3B]/10' };
    if (score >= 80) return { label: 'Great Match', color: 'text-[#00000]', bgColor: 'bg-[#D25353]/10' };
    if (score >= 70) return { label: 'Good Match', color: 'text-[#00000]', bgColor: 'bg-[#EA7B7B]/10' };
    if (score >= 60) return { label: 'Fair Match', color: 'text-[#00000]', bgColor: 'bg-[#EA7B7B]/5' };
    return { label: 'Basic Match', color: 'text-[#00000]', bgColor: 'bg-[#EA7B7B]/5' };
  };

  // Initialize
  useEffect(() => {
    if (userData?.userEmail) {
      localStorage.setItem('userData', JSON.stringify(userData));
    }
  }, [userData]);

  useEffect(() => {
    fetchWatchlist();
  }, [isPremium, userData?.userEmail, BACKEND_URL]);

  // Apply filters with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      applyFilters();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [activeFilters, partners, applyFilters]);

  // Event handler for upgrading plan
  const handleUpgradePlan = () => {
    navigate('/profile#plan');
  };

  // Partner Detail Modal Component
  const PartnerDetailModal = ({ partner, onClose, onRemove, isPremiumUser }) => {
    if (!partner) return null;

    const personalInfo = partner.personalInfo || {};
    const careerInfo = partner.careerInfo || {};
    const locationInfo = partner.locationInfo || {};
    const educationInfo = partner.educationInfo || {};
    const religionInfo = partner.religionInfo || {};
    const familyInfo = partner.familyInfo || {};
    const partnerInfo = partner.partnerInfo || {};
    const aboutYourself = partner.aboutYourself || "";
    const aboutFamily = partner.aboutFamily || "";

    const matchScore = formatMatchScore(partner.match_score);
    const matchPercentage = calculateMatchPercentage(matchScore);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-0 md:p-4 z-50 overflow-y-auto">
        <div className="bg-white rounded-none md:rounded-2xl w-full md:max-w-6xl md:w-full max-h-screen md:max-h-[90vh] overflow-hidden shadow-2xl md:my-8">
          {/* Fixed Header */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-[#FFEAD3] to-white p-3 md:p-6 border-b border-[#FFEAD3]/30">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3">
              <div className="flex-1">
                <div className="flex justify-between items-start md:block">
                  <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2 truncate pr-2">
                    {showValue(personalInfo.fullName)}
                  </h2>
                  <div className="md:hidden">
                    <div className={`px-3 py-1 rounded-full font-bold shadow-lg bg-gradient-to-r ${getScoreColor(matchScore)} text-white text-center`}>
                      <div className="flex items-center justify-center text-xs">
                        <FiPercent className="mr-1 text-xs" />{matchScore}%
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 md:gap-2 mt-1">
                  <span className="inline-flex items-center gap-1 bg-[#EA7B7B]/10 text-[#9E3B3B] px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs md:text-sm">
                    <FaBirthdayCake className="text-[#EA7B7B] text-xs md:text-sm" /> {showValue(personalInfo.age)}
                  </span>
                  <span className="inline-flex items-center gap-1 bg-[#D25353]/10 text-[#9E3B3B] px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs md:text-sm">
                    <FaVenusMars className="text-[#D25353] text-xs md:text-sm" /> {showValue(personalInfo.gender)}
                  </span>
                  <span className="inline-flex items-center gap-1 bg-[#9E3B3B]/10 text-[#9E3B3B] px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs md:text-sm truncate max-w-[120px] md:max-w-none">
                    <FiMapPin className="text-[#9E3B3B] text-xs md:text-sm" /> {showValue(locationInfo.state)}
                  </span>
                </div>
              </div>

              <div className="flex md:flex-col items-center md:items-end justify-between md:justify-start gap-2 md:gap-4">
                <button
                  onClick={onClose}
                  className="w-8 h-8 md:w-10 md:h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition shadow-lg flex-shrink-0 order-1 md:order-1"
                >
                  <FiX className="text-[#D25353] text-lg md:text-xl" />
                </button>

                <div className="hidden md:block">
                  <div className={`px-10 py-2 rounded-full font-bold shadow-lg bg-gradient-to-r ${getScoreColor(matchScore)} text-white text-center`}>
                    <div className="flex items-center justify-center">
                      <FiPercent className="mr-1" />{matchScore}%
                    </div>
                    <div className={`text-xs mt-1 font-medium ${matchPercentage.color}`}>
                      {matchPercentage.label}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable Main Content */}
          <div className="overflow-y-auto max-h-[calc(100vh-140px)] md:max-h-[calc(90vh-140px)]">
            <div className="px-4 md:px-8 pb-6 md:pb-8 pt-6">
              <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
                {/* Left Side - Profile Image & Basic Info */}
                <div className="lg:w-2/5">
                  {/* Profile Image */}
                  <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 border border-[#FFEAD3] mb-6">
                    <div className="relative h-64 md:h-80 rounded-xl overflow-hidden bg-gradient-to-br from-[#FFEAD3] to-white mb-6">
                      {personalInfo.profileImg && personalInfo.profileImg.trim() !== '' ? (
                        <img
                          src={personalInfo.profileImg}
                          alt={personalInfo.fullName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`absolute inset-0 flex items-center justify-center ${personalInfo.profileImg && personalInfo.profileImg.trim() !== '' ? 'hidden' : ''}`}>
                        <div className="w-48 h-48 md:w-64 md:h-64 bg-gradient-to-r from-[#FFEAD3] to-[#F5D9C3] rounded-full flex items-center justify-center">
                          <FiUser className="text-8xl md:text-9xl text-[#EA7B7B]" />
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();

                          const email = personalInfo?.email ||
                            partner?.email ||
                            partner?.userEmail ||
                            partner?.personalInfo?.email;

                          console.log("Card remove clicked, email to remove:", email);

                          if (!email || email === "undefined" || email === "null") {
                            console.error("Invalid email:", email);
                            toast.error("Could not remove: Invalid partner email");
                            return;
                          }

                          const userEmail = userData?.userEmail;
                          if (!userEmail) {
                            toast.error("User email not found");
                            return;
                          }

                          setPartners(prev => prev.filter(p =>
                            p.personalInfo?.email !== email &&
                            p.email !== email &&
                            p.userEmail !== email
                          ));
                          setFilteredPartners(prev => prev.filter(p =>
                            p.personalInfo?.email !== email &&
                            p.email !== email &&
                            p.userEmail !== email
                          ));

                          onRemove(email);
                          onClose();
                        }}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-[#D25353] to-[#9E3B3B] text-white rounded-lg hover:opacity-90 transition font-medium flex items-center justify-center gap-2"
                      >
                        <FiTrash2 /> Remove from Watchlist
                      </button>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="bg-gradient-to-r from-[#FFEAD3] to-white rounded-xl p-4 md:p-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <IoStatsChart className="text-[#D25353]" /> Quick Stats
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded-lg text-center">
                        <div className="text-2xl font-bold text-[#9E3B3B]">{showValue(personalInfo.height)}</div>
                        <div className="text-xs text-gray-600">Height</div>
                      </div>
                      <div className="bg-white p-3 rounded-lg text-center">
                        <div className="text-2xl font-bold text-[#9E3B3B]">{showValue(personalInfo.weight)}</div>
                        <div className="text-xs text-gray-600">Weight</div>
                      </div>
                      {personalInfo.bloodGroup && (
                        <div className="bg-white p-3 rounded-lg text-center">
                          <div className="text-lg font-bold text-[#9E3B3B] truncate">{showValue(personalInfo.bloodGroup)}</div>
                          <div className="text-xs text-gray-600">Blood Group</div>
                        </div>
                      )}
                      {careerInfo.employmentType && (
                        <div className="bg-white p-3 rounded-lg text-center">
                          <div className="text-lg font-bold text-[#9E3B3B] truncate">{showValue(careerInfo.employmentType)}</div>
                          <div className="text-xs text-gray-600">Employment Type</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Side - ALL Details in organized sections */}
                <div className="lg:w-3/5">
                  <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 border border-[#FFEAD3]">
                    {/* Personal Information - Complete */}
                    <div className="mb-6">
                      <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <FiUser className="text-[#D25353]" /> Personal Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-[#FFEAD3]/20 to-white p-4 rounded-xl border border-[#FFEAD3]">
                          <div className="font-medium text-gray-600 mb-1 text-sm">Full Name</div>
                          <div className="font-bold text-[#9E3B3B]">{showValue(personalInfo.fullName)}</div>
                        </div>
                        <div className="bg-gradient-to-br from-[#FFEAD3]/20 to-white p-4 rounded-xl border border-[#FFEAD3]">
                          <div className="font-medium text-gray-600 mb-1 text-sm">Email</div>
                          <div className="font-bold text-[#9E3B3B] truncate">{showValue(personalInfo.email)}</div>
                        </div>
                        <div className="bg-gradient-to-br from-[#FFEAD3]/20 to-white p-4 rounded-xl border border-[#FFEAD3]">
                          <div className="font-medium text-gray-600 mb-1 text-sm">Date of Birth</div>
                          <div className="font-bold text-[#9E3B3B]">{showValue(personalInfo.dob)}</div>
                        </div>
                        <div className="bg-gradient-to-br from-[#FFEAD3]/20 to-white p-4 rounded-xl border border-[#FFEAD3]">
                          <div className="font-medium text-gray-600 mb-1 text-sm">Marital Status</div>
                          <div className="font-bold text-[#9E3B3B]">{showValue(personalInfo.maritalStatus)}</div>
                        </div>
                        <div className="bg-gradient-to-br from-[#FFEAD3]/20 to-white p-4 rounded-xl border border-[#FFEAD3]">
                          <div className="font-medium text-gray-600 mb-1 text-sm">Disability</div>
                          <div className="font-bold text-[#9E3B3B]">{showValue(personalInfo.disability)}</div>
                        </div>
                      </div>
                    </div>

                    {/* About Yourself */}
                    {aboutYourself && (
                      <div className="mb-6">
                        <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <FiUser className="text-[#D25353]" /> About Yourself
                        </h4>
                        <div className="bg-gradient-to-br from-[#FFEAD3]/20 to-white p-4 rounded-xl border border-[#FFEAD3]">
                          <p className="text-gray-700 whitespace-pre-line">{showValue(aboutYourself)}</p>
                        </div>
                      </div>
                    )}

                    {/* Location Information - Complete */}
                    <div className="mb-6">
                      <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <FiMapPin className="text-[#D25353]" /> Location Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-[#FFEAD3]/20 to-white p-4 rounded-xl border border-[#FFEAD3]">
                          <div className="font-medium text-gray-600 mb-1 text-sm">Country</div>
                          <div className="font-bold text-[#9E3B3B]">{showValue(locationInfo.country)}</div>
                        </div>
                        <div className="bg-gradient-to-br from-[#FFEAD3]/20 to-white p-4 rounded-xl border border-[#FFEAD3]">
                          <div className="font-medium text-gray-600 mb-1 text-sm">State</div>
                          <div className="font-bold text-[#9E3B3B]">{showValue(locationInfo.state)}</div>
                        </div>
                        <div className="bg-gradient-to-br from-[#FFEAD3]/20 to-white p-4 rounded-xl border border-[#FFEAD3]">
                          <div className="font-medium text-gray-600 mb-1 text-sm">City</div>
                          <div className="font-bold text-[#9E3B3B]">{showValue(locationInfo.city)}</div>
                        </div>
                        <div className="bg-gradient-to-br from-[#FFEAD3]/20 to-white p-4 rounded-xl border border-[#FFEAD3]">
                          <div className="font-medium text-gray-600 mb-1 text-sm">Pin Code</div>
                          <div className="font-bold text-[#9E3B3B]">{showValue(locationInfo.pinCode)}</div>
                        </div>
                        <div className="bg-gradient-to-br from-[#FFEAD3]/20 to-white p-4 rounded-xl border border-[#FFEAD3]">
                          <div className="font-medium text-gray-600 mb-1 text-sm">Current Location</div>
                          <div className="font-bold text-[#9E3B3B]">{showValue(locationInfo.currentLocation)}</div>
                        </div>
                        <div className="bg-gradient-to-br from-[#FFEAD3]/20 to-white p-4 rounded-xl border border-[#FFEAD3] col-span-1 md:col-span-2 lg:col-span-1">
                          <div className="font-medium text-gray-600 mb-1 text-sm">Permanent Address</div>
                          <div className="font-bold text-[#9E3B3B]">{showValue(locationInfo.permanentAddress)}</div>
                        </div>
                      </div>
                    </div>

                    {/* Religion Information - Complete */}
                    <div className="mb-6">
                      <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <FaPrayingHands className="text-[#D25353]" /> Religion Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-[#FFEAD3]/20 to-white p-4 rounded-xl border border-[#FFEAD3]">
                          <div className="font-medium text-gray-600 mb-1 text-sm">Religion</div>
                          <div className="font-bold text-[#9E3B3B]">{showValue(religionInfo.religion)}</div>
                        </div>
                        <div className="bg-gradient-to-br from-[#FFEAD3]/20 to-white p-4 rounded-xl border border-[#FFEAD3]">
                          <div className="font-medium text-gray-600 mb-1 text-sm">Caste</div>
                          <div className="font-bold text-[#9E3B3B]">{showValue(religionInfo.caste)}</div>
                        </div>
                        <div className="bg-gradient-to-br from-[#FFEAD3]/20 to-white p-4 rounded-xl border border-[#FFEAD3]">
                          <div className="font-medium text-gray-600 mb-1 text-sm">Mother Tongue</div>
                          <div className="font-bold text-[#9E3B3B]">{showValue(religionInfo.motherTongue)}</div>
                        </div>
                      </div>
                    </div>

                    {/* Education Information - Complete */}
                    <div className="mb-6">
                      <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <FaUserGraduate className="text-[#D25353]" /> Education Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-[#FFEAD3]/20 to-white p-4 rounded-xl border border-[#FFEAD3]">
                          <div className="font-medium text-gray-600 mb-1 text-sm">Highest Education</div>
                          <div className="font-bold text-[#9E3B3B]">{showValue(educationInfo.highestEducation)}</div>
                        </div>
                        <div className="bg-gradient-to-br from-[#FFEAD3]/20 to-white p-4 rounded-xl border border-[#FFEAD3]">
                          <div className="font-medium text-gray-600 mb-1 text-sm">Year of Passing</div>
                          <div className="font-bold text-[#9E3B3B]">{showValue(educationInfo.yearOfPassing)}</div>
                        </div>
                        <div className="bg-gradient-to-br from-[#FFEAD3]/20 to-white p-4 rounded-xl border border-[#FFEAD3]">
                          <div className="font-medium text-gray-600 mb-1 text-sm">University</div>
                          <div className="font-bold text-[#9E3B3B]">{showValue(educationInfo.university)}</div>
                        </div>
                      </div>
                    </div>

                    {/* Career Information - Complete */}
                    <div className="mb-6">
                      <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <FiBriefcase className="text-[#D25353]" /> Career Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-[#FFEAD3]/20 to-white p-4 rounded-xl border border-[#FFEAD3]">
                          <div className="font-medium text-gray-600 mb-1 text-sm">Profession</div>
                          <div className="font-bold text-[#9E3B3B]">{showValue(careerInfo.profession)}</div>
                        </div>
                        <div className="bg-gradient-to-br from-[#FFEAD3]/20 to-white p-4 rounded-xl border border-[#FFEAD3]">
                          <div className="font-medium text-gray-600 mb-1 text-sm">Job Title</div>
                          <div className="font-bold text-[#9E3B3B]">{showValue(careerInfo.jobTitle)}</div>
                        </div>
                        <div className="bg-gradient-to-br from-[#FFEAD3]/20 to-white p-4 rounded-xl border border-[#FFEAD3]">
                          <div className="font-medium text-gray-600 mb-1 text-sm">Company Name</div>
                          <div className="font-bold text-[#9E3B3B]">{showValue(careerInfo.companyName)}</div>
                        </div>
                        <div className="bg-gradient-to-br from-[#FFEAD3]/20 to-white p-4 rounded-xl border border-[#FFEAD3]">
                          <div className="font-medium text-gray-600 mb-1 text-sm">Employment Type</div>
                          <div className="font-bold text-[#9E3B3B]">{showValue(careerInfo.employmentType)}</div>
                        </div>
                        <div className="bg-gradient-to-br from-[#FFEAD3]/20 to-white p-4 rounded-xl border border-[#FFEAD3]">
                          <div className="font-medium text-gray-600 mb-1 text-sm">Annual Income</div>
                          <div className="font-bold text-[#9E3B3B]">{showValue(careerInfo.annualIncome)}</div>
                        </div>
                        <div className="bg-gradient-to-br from-[#FFEAD3]/20 to-white p-4 rounded-xl border border-[#FFEAD3]">
                          <div className="font-medium text-gray-600 mb-1 text-sm">Work Location</div>
                          <div className="font-bold text-[#9E3B3B]">{showValue(careerInfo.workLocation)}</div>
                        </div>
                      </div>
                    </div>

                    {/* Family Information - Complete */}
                    <div className="mb-6">
                      <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <FiUsers className="text-[#D25353]" /> Family Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-[#FFEAD3]/20 to-white p-4 rounded-xl border border-[#FFEAD3]">
                          <div className="font-medium text-gray-600 mb-1 text-sm">Father's Name</div>
                          <div className="font-bold text-[#9E3B3B]">{showValue(familyInfo.fatherName)}</div>
                        </div>
                        <div className="bg-gradient-to-br from-[#FFEAD3]/20 to-white p-4 rounded-xl border border-[#FFEAD3]">
                          <div className="font-medium text-gray-600 mb-1 text-sm">Father's Occupation</div>
                          <div className="font-bold text-[#9E3B3B]">{showValue(familyInfo.fatherOccupation)}</div>
                        </div>
                        <div className="bg-gradient-to-br from-[#FFEAD3]/20 to-white p-4 rounded-xl border border-[#FFEAD3]">
                          <div className="font-medium text-gray-600 mb-1 text-sm">Mother's Name</div>
                          <div className="font-bold text-[#9E3B3B]">{showValue(familyInfo.motherName)}</div>
                        </div>
                        <div className="bg-gradient-to-br from-[#FFEAD3]/20 to-white p-4 rounded-xl border border-[#FFEAD3]">
                          <div className="font-medium text-gray-600 mb-1 text-sm">Mother's Occupation</div>
                          <div className="font-bold text-[#9E3B3B]">{showValue(familyInfo.motherOccupation)}</div>
                        </div>
                        <div className="bg-gradient-to-br from-[#FFEAD3]/20 to-white p-4 rounded-xl border border-[#FFEAD3]">
                          <div className="font-medium text-gray-600 mb-1 text-sm">Brothers</div>
                          <div className="font-bold text-[#9E3B3B]">{showValue(familyInfo.brothers)}</div>
                        </div>
                        <div className="bg-gradient-to-br from-[#FFEAD3]/20 to-white p-4 rounded-xl border border-[#FFEAD3]">
                          <div className="font-medium text-gray-600 mb-1 text-sm">Sisters</div>
                          <div className="font-bold text-[#9E3B3B]">{showValue(familyInfo.sisters)}</div>
                        </div>
                        <div className="bg-gradient-to-br from-[#FFEAD3]/20 to-white p-4 rounded-xl border border-[#FFEAD3] col-span-1 md:col-span-2">
                          <div className="font-medium text-gray-600 mb-1 text-sm">Family Type</div>
                          <div className="font-bold text-[#9E3B3B]">{showValue(familyInfo.familyType)}</div>
                        </div>
                        <div className="bg-gradient-to-br from-[#FFEAD3]/20 to-white p-4 rounded-xl border border-[#FFEAD3] col-span-1 md:col-span-2">
                          <div className="font-medium text-gray-600 mb-1 text-sm">Family Status</div>
                          <div className="font-bold text-[#9E3B3B]">{showValue(familyInfo.familyStatus)}</div>
                        </div>
                        <div className="bg-gradient-to-br from-[#FFEAD3]/20 to-white p-4 rounded-xl border border-[#FFEAD3] col-span-1 md:col-span-2">
                          <div className="font-medium text-gray-600 mb-1 text-sm">Family Location</div>
                          <div className="font-bold text-[#9E3B3B]">{showValue(familyInfo.familyLocation)}</div>
                        </div>
                      </div>

                      {/* About Family */}
                      {aboutFamily && (
                        <div className="mt-4">
                          <div className="font-medium text-gray-600 mb-2 text-sm">About Family</div>
                          <div className="bg-gradient-to-br from-[#FFEAD3]/20 to-white p-4 rounded-xl border border-[#FFEAD3]">
                            <p className="text-gray-700 whitespace-pre-line">{showValue(aboutFamily)}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Partner Preference - Complete */}
                    <div className="mb-6">
                      <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <FiHeart className="text-[#D25353]" /> Partner Preference
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-[#FFEAD3]/20 to-white p-4 rounded-xl border border-[#FFEAD3]">
                          <div className="font-medium text-gray-600 mb-1 text-sm">Preferred Age Range</div>
                          <div className="font-bold text-[#9E3B3B]">{showValue(partnerInfo.preferredAgeRange)}</div>
                        </div>
                        <div className="bg-gradient-to-br from-[#FFEAD3]/20 to-white p-4 rounded-xl border border-[#FFEAD3]">
                          <div className="font-medium text-gray-600 mb-1 text-sm">Preferred Height</div>
                          <div className="font-bold text-[#9E3B3B]">{showValue(partnerInfo.preferredHeight)}</div>
                        </div>
                        <div className="bg-gradient-to-br from-[#FFEAD3]/20 to-white p-4 rounded-xl border border-[#FFEAD3]">
                          <div className="font-medium text-gray-600 mb-1 text-sm">Preferred Religion</div>
                          <div className="font-bold text-[#9E3B3B]">{showValue(partnerInfo.preferredReligion)}</div>
                        </div>
                        <div className="bg-gradient-to-br from-[#FFEAD3]/20 to-white p-4 rounded-xl border border-[#FFEAD3]">
                          <div className="font-medium text-gray-600 mb-1 text-sm">Preferred Education</div>
                          <div className="font-bold text-[#9E3B3B]">{showValue(partnerInfo.preferredEducation)}</div>
                        </div>
                        <div className="bg-gradient-to-br from-[#FFEAD3]/20 to-white p-4 rounded-xl border border-[#FFEAD3]">
                          <div className="font-medium text-gray-600 mb-1 text-sm">Preferred Profession</div>
                          <div className="font-bold text-[#9E3B3B]">{showValue(partnerInfo.preferredProfession)}</div>
                        </div>
                        <div className="bg-gradient-to-br from-[#FFEAD3]/20 to-white p-4 rounded-xl border border-[#FFEAD3]">
                          <div className="font-medium text-gray-600 mb-1 text-sm">Preferred Location</div>
                          <div className="font-bold text-[#9E3B3B]">{showValue(partnerInfo.preferredLocation)}</div>
                        </div>
                        <div className="bg-gradient-to-br from-[#FFEAD3]/20 to-white p-4 rounded-xl border border-[#FFEAD3] col-span-1 md:col-span-2">
                          <div className="font-medium text-gray-600 mb-1 text-sm">Preferred Income</div>
                          <div className="font-bold text-[#9E3B3B]">{showValue(partnerInfo.preferredIncome)}</div>
                        </div>
                        <div className="bg-gradient-to-br from-[#FFEAD3]/20 to-white p-4 rounded-xl border border-[#FFEAD3] col-span-1 md:col-span-2">
                          <div className="font-medium text-gray-600 mb-1 text-sm">Looking For</div>
                          <div className="font-bold text-[#9E3B3B]">{showValue(partnerInfo.lookingFor)}</div>
                        </div>
                      </div>
                    </div>

                    {/* Contact Information (Premium Only) */}
                    {isPremiumUser && (personalInfo.contactNumber || personalInfo.whatsappNumber) && (
                      <div className="mt-6 bg-gradient-to-r from-[#FFEAD3] to-white border border-[#FFEAD3] p-4 md:p-5 rounded-xl">
                        <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <FiMail className="text-[#D25353]" /> Contact Information
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {personalInfo.contactNumber && (
                            <div className="p-3 md:p-4 bg-white rounded-lg border border-[#FFEAD3]">
                              <div className="flex items-center gap-3 md:gap-4">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-[#FFEAD3] to-[#F5D9C3] rounded-full flex items-center justify-center flex-shrink-0">
                                  <FiPhone className="text-xl md:text-2xl text-[#D25353]" />
                                </div>
                                <div className="min-w-0">
                                  <div className="font-medium text-gray-800 text-sm md:text-base">Phone Number</div>
                                  <a
                                    href={`tel:${personalInfo.contactNumber}`}
                                    className="text-lg font-bold text-[#9E3B3B] mt-1 truncate hover:underline"
                                  >
                                    {showValue(personalInfo.contactNumber)}
                                  </a>
                                </div>
                              </div>
                            </div>
                          )}
                          {personalInfo.whatsappNumber && (
                            <div className="p-3 md:p-4 bg-white rounded-lg border border-[#FFEAD3]">
                              <div className="flex items-center gap-3 md:gap-4">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-[#FFEAD3] to-[#F5D9C3] rounded-full flex items-center justify-center flex-shrink-0">
                                  <FaWhatsapp className="text-xl md:text-2xl text-[#D25353]" />
                                </div>
                                <div className="min-w-0">
                                  <div className="font-medium text-gray-800 text-sm md:text-base">WhatsApp Number</div>
                                  <a
                                    href={`https://wa.me/91${personalInfo.whatsappNumber}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-lg font-bold text-[#9E3B3B] mt-1 truncate hover:underline"
                                  >
                                    {showValue(personalInfo.whatsappNumber)}
                                  </a>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Enhanced Filters Modal
  const FiltersModal = () => {
    const [localFilters, setLocalFilters] = useState(activeFilters);

    // Update local filters when modal opens
    useEffect(() => {
      setLocalFilters(activeFilters);
    }, [showFilters]);

    const handleLocalFilterChange = (filterType, value) => {
      setLocalFilters(prev => {
        if (Array.isArray(prev[filterType])) {
          const currentArray = prev[filterType];
          if (currentArray.includes(value)) {
            return {
              ...prev,
              [filterType]: currentArray.filter(item => item !== value)
            };
          } else {
            return {
              ...prev,
              [filterType]: [...currentArray, value]
            };
          }
        } else {
          return {
            ...prev,
            [filterType]: value
          };
        }
      });
    };

    const handleApplyFilters = () => {
      setActiveFilters(localFilters);
      setShowFilters(false);
    };

    const handleLocalClearFilters = () => {
      setLocalFilters({
        maritalStatus: [],
        education: [],
        profession: [],
        annualPackage: [],
        employmentType: [],
        homeCity: '',
        currentCity: '',
        minAge: '',
        maxAge: '',
        minHeight: '',
        maxHeight: '',
        minWeight: '',
        maxWeight: ''
      });
    };

    const getLocalFilterCount = () => {
      let count = 0;
      Object.keys(localFilters).forEach(key => {
        if (Array.isArray(localFilters[key])) {
          count += localFilters[key].length;
        } else if (localFilters[key] && localFilters[key].toString().trim() !== '') {
          count += 1;
        }
      });
      return count;
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          <div className="sticky top-0 bg-gradient-to-r from-[#EA7B7B] to-[#D25353] text-white p-4 md:p-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <FiFilter className="text-xl md:text-2xl" />
                <h3 className="text-lg md:text-xl font-bold">Enhanced Filters</h3>
              </div>
              <button
                onClick={() => setShowFilters(false)}
                className="text-white hover:text-[#FFEAD3] transition"
              >
                <FiX className="text-xl md:text-2xl" />
              </button>
            </div>
            {getLocalFilterCount() > 0 && (
              <div className="mt-2 text-sm">
                {getLocalFilterCount()} filter(s) active
              </div>
            )}
          </div>

          <div className="overflow-y-auto flex-1 p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {/* Age Range */}
              <div className="bg-gradient-to-br from-[#FFEAD3]/30 to-white p-4 rounded-xl border border-[#FFEAD3]">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FaBirthdayCake className="text-[#D25353]" /> Age Range
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  {/* Min Age */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Min Age</label>
                    <input
                      type="number"
                      value={localFilters.minAge}
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, "");
                        if (Number(val) > 100) val = "100";
                        handleLocalFilterChange("minAge", val.slice(0, 3));
                      }}
                      className="w-full px-3 py-2 border border-[#FFEAD3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EA7B7B] focus:border-transparent"
                      placeholder="18"
                      min={0}
                      max={100}
                      maxLength={3}
                    />
                  </div>

                  {/* Max Age */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Max Age</label>
                    <input
                      type="number"
                      value={localFilters.maxAge}
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, "");
                        if (Number(val) > 100) val = "100";
                        handleLocalFilterChange("maxAge", val.slice(0, 3));
                      }}
                      className="w-full px-3 py-2 border border-[#FFEAD3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EA7B7B] focus:border-transparent"
                      placeholder="100"
                      min={0}
                      max={100}
                      maxLength={3}
                    />
                  </div>
                </div>
              </div>

              {/* Height Range */}
              <div className="bg-gradient-to-br from-[#FFEAD3]/30 to-white p-4 rounded-xl border border-[#FFEAD3]">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FiUser className="text-[#D25353]" /> Height (cm)
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  {/* Min Height */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Min Height</label>
                    <input
                      type="number"
                      value={localFilters.minHeight}
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, "");
                        if (Number(val) > 250) val = "250";
                        handleLocalFilterChange("minHeight", val.slice(0, 3));
                      }}
                      className="w-full px-3 py-2 border border-[#FFEAD3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EA7B7B] focus:border-transparent"
                      placeholder="140"
                      min={0}
                      max={250}
                      maxLength={3}
                    />
                  </div>

                  {/* Max Height */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Max Height</label>
                    <input
                      type="number"
                      value={localFilters.maxHeight}
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, "");
                        if (Number(val) > 250) val = "250";
                        handleLocalFilterChange("maxHeight", val.slice(0, 3));
                      }}
                      className="w-full px-3 py-2 border border-[#FFEAD3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EA7B7B] focus:border-transparent"
                      placeholder="200"
                      min={0}
                      max={250}
                      maxLength={3}
                    />
                  </div>
                </div>
              </div>

              {/* Weight Range */}
              <div className="bg-gradient-to-br from-[#FFEAD3]/30 to-white p-4 rounded-xl border border-[#FFEAD3]">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FiUser className="text-[#D25353]" /> Weight (kg)
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  {/* Min Weight */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Min Weight</label>
                    <input
                      type="number"
                      value={localFilters.minWeight}
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, "");
                        if (Number(val) > 200) val = "200";
                        handleLocalFilterChange("minWeight", val.slice(0, 3));
                      }}
                      className="w-full px-3 py-2 border border-[#FFEAD3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EA7B7B] focus:border-transparent"
                      placeholder="40"
                      min={0}
                      max={200}
                      maxLength={3}
                    />
                  </div>

                  {/* Max Weight */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Max Weight</label>
                    <input
                      type="number"
                      value={localFilters.maxWeight}
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, "");
                        if (Number(val) > 200) val = "200";
                        handleLocalFilterChange("maxWeight", val.slice(0, 3));
                      }}
                      className="w-full px-3 py-2 border border-[#FFEAD3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EA7B7B] focus:border-transparent"
                      placeholder="120"
                      min={0}
                      max={200}
                      maxLength={3}
                    />
                  </div>
                </div>
              </div>

              {/* Marital Status */}
              <div className="bg-gradient-to-br from-[#FFEAD3]/30 to-white p-4 rounded-xl border border-[#FFEAD3]">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FiUsers className="text-[#D25353]" /> Marital Status
                </h4>
                <div className="space-y-2">
                  {filterOptions.maritalStatus.map(status => (
                    <label key={status} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={localFilters.maritalStatus.includes(status)}
                        onChange={() => handleLocalFilterChange('maritalStatus', status)}
                        className="rounded border-[#FFEAD3] text-[#D25353] focus:ring-[#EA7B7B]"
                      />
                      <span className="text-sm text-gray-700">{status}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Education */}
              <div className="bg-gradient-to-br from-[#FFEAD3]/30 to-white p-4 rounded-xl border border-[#FFEAD3]">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FaUserGraduate className="text-[#D25353]" /> Education
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                  {filterOptions.education.map(edu => (
                    <label key={edu} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={localFilters.education.includes(edu)}
                        onChange={() => handleLocalFilterChange('education', edu)}
                        className="rounded border-[#FFEAD3] text-[#D25353] focus:ring-[#EA7B7B]"
                      />
                      <span className="text-sm text-gray-700">{edu}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Profession */}
              <div className="bg-gradient-to-br from-[#FFEAD3]/30 to-white p-4 rounded-xl border border-[#FFEAD3]">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FiBriefcase className="text-[#D25353]" /> Profession
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                  {filterOptions.profession.map(prof => (
                    <label key={prof} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={localFilters.profession.includes(prof)}
                        onChange={() => handleLocalFilterChange('profession', prof)}
                        className="rounded border-[#FFEAD3] text-[#D25353] focus:ring-[#EA7B7B]"
                      />
                      <span className="text-sm text-gray-700">{prof}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Annual Package */}
              <div className="bg-gradient-to-br from-[#FFEAD3]/30 to-white p-4 rounded-xl border border-[#FFEAD3]">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FaChartLine className="text-[#D25353]" /> Annual Package
                </h4>
                <div className="space-y-2">
                  {filterOptions.annualPackage.map(pkg => (
                    <label key={pkg} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={localFilters.annualPackage.includes(pkg)}
                        onChange={() => handleLocalFilterChange('annualPackage', pkg)}
                        className="rounded border-[#FFEAD3] text-[#D25353] focus:ring-[#EA7B7B]"
                      />
                      <span className="text-sm text-gray-700">{pkg}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Employment Type */}
              <div className="bg-gradient-to-br from-[#FFEAD3]/30 to-white p-4 rounded-xl border border-[#FFEAD3]">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FiBriefcase className="text-[#D25353]" /> Employment Type
                </h4>
                <div className="space-y-2">
                  {filterOptions.employmentType.map(type => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={localFilters.employmentType.includes(type)}
                        onChange={() => handleLocalFilterChange('employmentType', type)}
                        className="rounded border-[#FFEAD3] text-[#D25353] focus:ring-[#EA7B7B]"
                      />
                      <span className="text-sm text-gray-700">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Home City & Current Town */}
              <div className="bg-gradient-to-br from-[#FFEAD3]/30 to-white p-4 rounded-xl border border-[#FFEAD3]">
                <div className="space-y-5">

                  {/* Home City */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <FiHome className="text-[#D25353]" /> Home City
                    </h4>
                    <input
                      type="text"
                      value={localFilters.homeCity}
                      onChange={(e) => {
                        let val = e.target.value;
                        val = val.replace(/[^a-zA-Z\s]/g, "");
                        val = val.replace(/\s{2,}/g, " ");
                        val = val.replace(/^\s/, "");
                        handleLocalFilterChange("homeCity", val);
                      }}
                      onBlur={(e) =>
                        handleLocalFilterChange("homeCity", e.target.value.trim())
                      }
                      className="w-full px-3 py-2 border border-[#FFEAD3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EA7B7B] focus:border-transparent text-sm"
                      placeholder="Enter city name..."
                    />
                  </div>

                  {/* Current Town */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <FiMapPin className="text-[#D25353]" /> Current Town
                    </h4>
                    <input
                      type="text"
                      value={localFilters.currentCity}
                      onChange={(e) => {
                        let val = e.target.value;
                        val = val.replace(/[^a-zA-Z\s]/g, "");
                        val = val.replace(/\s{2,}/g, " ");
                        val = val.replace(/^\s/, "");
                        handleLocalFilterChange("currentCity", val);
                      }}
                      onBlur={(e) =>
                        handleLocalFilterChange("currentCity", e.target.value.trim())
                      }
                      className="w-full px-3 py-2 border border-[#FFEAD3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EA7B7B] focus:border-transparent text-sm"
                      placeholder="Enter town name..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="sticky bottom-0 bg-white border-t border-[#FFEAD3] p-4 flex justify-end gap-3">
            <button
              onClick={handleLocalClearFilters}
              className="px-4 py-2 border border-[#FFEAD3] text-[#9E3B3B] rounded-lg hover:bg-[#FFEAD3] transition font-medium"
            >
              Clear All
            </button>
            <button
              onClick={handleApplyFilters}
              className="px-4 py-2 bg-gradient-to-r from-[#EA7B7B] to-[#D25353] text-white rounded-lg hover:opacity-90 transition font-medium"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Loading State
  if (loadingPartners) {
    return (
      <>
        <Navbar />
        <ToastContainer />
        <div className="min-h-screen bg-gradient-to-br from-[#FFEAD3] to-white pt-20 flex items-center justify-center px-4">
          <div className="text-center max-w-md mx-auto">
            <div className="relative inline-block">
              <div className="animate-spin rounded-full h-24 w-24 border-4 border-[#EA7B7B] border-t-transparent mx-auto"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-16 w-16 bg-[#EA7B7B] rounded-full animate-pulse"></div>
              </div>
            </div>
            <p className="mt-8 text-gray-700 text-lg font-medium flex items-center justify-center gap-2">
              <FiBookmark className="text-[#D25353]" /> Loading your watchlist...
            </p>
            <p className="mt-2 text-gray-500 text-sm">Fetching your saved partners</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-16 relative overflow-hidden">
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
                    <FiUsers className="text-white" size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold">Watchlist Dashboard</h2>
                  </div>
                </div>

                {/* Arrow Icon */}
                <div className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                  <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
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
                              <FiMail size={12} className="text-white" />
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
                              <FiUser size={12} className="text-white" />
                            </div>
                            <span className="text-xs text-white/90">Status</span>
                          </div>
                          <div className={`inline-flex items-center gap-1 px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${userData?.isProfilePublished
                            ? 'bg-white/30 text-white'
                            : 'bg-white/20 text-white'
                            }`}>
                            {userData?.isProfilePublished ? (
                              <>
                                <FiCheck size={10} />
                                <span className="hidden xs:inline">Published</span>
                                <span className="xs:hidden">Pub</span>
                              </>
                            ) : (
                              <>
                                <FiAlertCircle size={10} />
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
                              <FiStar size={12} className="text-white" />
                            </div>
                            <span className="text-xs text-white/90">Plan</span>
                          </div>
                          <div className={`inline-flex items-center gap-1 px-2 py-0.5 sm:py-1 rounded-full text-xs font-bold ${isPremium ? 'bg-white text-[#D25353]' : 'bg-white/30 text-white'
                            }`}>
                            {isPremium ? (
                              <>
                                <FiStar size={10} />
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

                        {/* Watchlist Card */}
                        <div className="bg-white/10 backdrop-blur-sm p-2 sm:p-3 rounded-lg border border-white/20">
                          <div className="flex items-center gap-1 sm:gap-2 mb-2">
                            <div className="p-1 sm:p-1.5 rounded bg-white/20">
                              <FiBookmark size={12} className="text-white" />
                            </div>
                            <span className="text-xs text-white/90">Watchlist</span>
                          </div>
                          <p className="text-xs sm:text-sm font-semibold">
                            {filteredPartners.length} partner(s)
                          </p>
                        </div>
                      </div>

                      {/* Profile Status Message */}
                      {!userData?.isProfilePublished && (
                        <div className="mt-4 p-3 md:p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                          <p className="flex items-start gap-2 text-sm md:text-base">
                            <FiAlertCircle className="flex-shrink-0 mt-0.5" size={18} />
                            Your profile needs to be published to get matches. Complete and publish your profile first.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Right Section - Buttons */}
                    <div className="flex flex-wrap gap-2">
                      {!userData?.isProfilePublished ? (
                        <button
                          onClick={() => navigate('/profile#plan')}
                          className="inline-flex items-center gap-2 px-4 md:px-5 py-2 bg-white text-[#D25353] rounded-lg hover:shadow-lg transition-all font-medium shadow-md text-sm md:text-base"
                        >
                          <FiEdit2 size={16} /> Complete Profile
                        </button>
                      ) : (
                        <>
                          {!isPremium && (
                            <button
                              onClick={handleUpgradePlan}
                              className="inline-flex items-center gap-2 px-4 md:px-5 py-2 bg-white text-[#D25353] rounded-lg hover:shadow-lg transition-all font-medium shadow-md text-sm md:text-base"
                            >
                              <FiStar size={16} /> Upgrade Plan
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
                                <FiRefreshCw size={16} /> Refresh
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
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-2xl">
                {/* Collapsible Header */}
                <button
                  onClick={() => setIsExpanded2(!isExpanded2)}
                  className="w-full px-4 sm:px-6 md:px-8 py-4 sm:py-6 
             flex flex-col lg:flex-row 
             lg:justify-between lg:items-center 
             gap-4 transition-all duration-300 
             hover:bg-gradient-to-r from-gray-50/50 to-white/80 group"
                >
                  {/* LEFT SECTION */}
                  <div className="flex items-center gap-3 sm:gap-4 w-full">
                    <div
                      className="p-3 sm:p-4 rounded-xl shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl"
                      style={{ background: getPrimaryGradient("135deg") }}
                    >
                      <FiStar className="text-white" size={24} />
                    </div>

                    <div className="text-left">
                      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                        Premium Watchlist
                      </h1>
                      <p className="text-gray-600 text-sm sm:text-base mt-1 sm:mt-2">
                        Access exclusive features for your matrimonial journey
                      </p>
                    </div>
                  </div>

                  {/* RIGHT SECTION */}
                  <div className="flex flex-row lg:flex-row items-center justify-between w-full lg:w-auto gap-3 sm:gap-4">

                    {/* PREMIUM BADGE */}
                    <div
                      className="w-full lg:w-auto px-4 py-2 text-white rounded-full text-sm font-bold 
                 flex items-center justify-center gap-2 shadow-lg 
                 transition-all duration-300 hover:shadow-xl hover:scale-105"
                      style={{ background: getPrimaryGradient("135deg") }}
                    >
                      <FiCheckCircle className="text-white" size={16} />
                      <span className="hidden xs:inline">Premium Active</span>
                      <span className="xs:hidden">Active</span>
                    </div>

                    {/* ARROW */}
                    <div
                      className={`transform transition-all duration-500 
        ${isExpanded2 ? "rotate-180 scale-110" : ""} 
        group-hover:scale-110`}
                      style={{ color: primaryColor }}
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth="3"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </button>

                {/* Collapsible Content for Premium Features */}
                {isExpanded2 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 sm:px-6 md:px-8 pb-6 sm:pb-8 md:pb-10 pt-4 bg-gradient-to-b from-white to-gray-50/50">

                      {/* Premium Features Grid with Enhanced Design */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 md:gap-8">
                        {[
                          {
                            icon: FiHeart,
                            title: "View All Details",
                            desc: "Unlock complete profile details of interested partners including contact information, family details, and preferences"
                          },
                          {
                            icon: HiOutlineSparkles,
                            title: "Marriage Help",
                            desc: "AI-powered marriage planning assistance with compatibility analysis and timeline guidance",
                            action: "marriage"
                          },
                          {
                            icon: FiTag,
                            title: "Extra Discounts",
                            desc: "Exclusive discounts up to 25% on premium wedding services and partner vendors",
                            action: "wedding"
                          },
                        ].map((feature, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ delay: index * 0.15, duration: 0.4 }}
                            whileHover={{
                              boxShadow: `0 20px 40px -15px color-mix(in oklch, ${primaryColor} 25%, transparent)`
                            }}
                            className="relative bg-white p-3 sm:p-4 md:p-5 rounded-xl border-2 border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-500 group overflow-hidden"
                            style={{
                              background: `linear-gradient(135deg, color-mix(in oklch, ${primaryColor} 10%, white), color-mix(in oklch, ${primaryColor} 5%, white))`
                            }}
                          >
                            {/* Background accent */}
                            <div className="absolute top-0 right-0 w-20 h-20 opacity-5 group-hover:opacity-10 transition-opacity duration-500"
                              style={{
                                background: primaryColor,
                                clipPath: 'circle(40px at 80px 0)'
                              }} />

                            <div className="relative z-10">
                              <div className="flex items-start justify-between mb-4 sm:mb-5">
                                <div
                                  className="p-3 sm:p-4 rounded-xl shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:shadow-xl group-hover:rotate-3"
                                  style={{ background: getPrimaryGradient('135deg') }}
                                >
                                  <feature.icon className="text-white" size={24} />
                                </div>

                                {/* Enhanced GO Button for 2nd & 3rd features */}
                                {feature.action && (
                                  <button
                                    onClick={() => {
                                      if (feature.action === "marriage") setOpenMarriage(true);
                                      if (feature.action === "wedding") setOpenWedding(true);
                                    }}
                                    className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg font-bold text-sm sm:text-base shadow-md transition-all duration-300 hover:shadow-xl hover:scale-105 active:scale-95 flex items-center gap-2 group/button"
                                    style={{
                                      background: getPrimaryGradient('135deg'),
                                      color: 'white'
                                    }}
                                  >
                                    <span className="transition-all duration-300 group-hover/button:tracking-wider">Go</span>
                                    <FiArrowRight className="transition-transform duration-300 group-hover/button:translate-x-2" />
                                  </button>
                                )}
                              </div>

                              <h3 className="font-bold text-gray-900 text-lg sm:text-xl md:text-2xl mb-2 sm:mb-3 tracking-tight">
                                {feature.title}
                              </h3>

                              <p className="text-gray-700 text-sm sm:text-base leading-relaxed mb-4 sm:mb-5">
                                {feature.desc}
                              </p>

                              {/* Status Badge with theme color */}
                              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full animate-pulse"
                                    style={{ background: primaryColor }} />
                                  <span className="text-sm font-semibold" style={{ color: primaryColor }}>
                                    ✓ Active
                                  </span>
                                </div>
                                <div className="p-1 rounded-full" style={{ background: `color-mix(in oklch, ${primaryColor} 15%, transparent)` }}>
                                  <FiCheckCircle style={{ color: primaryColor }} size={18} />
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {/* Compact Modal Version */}
                      {openMarriage && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden"
                          >
                            {/* Compact Header */}
                            <div className="p-3 border-b border-gray-200 bg-gradient-to-r from-[#FFEAD3] to-#FFEAD3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="p-1.5 rounded-md bg-[#EA7B7B]">
                                    <HiOutlineSparkles className="text-white text-sm" />
                                  </div>
                                  <h2 className="text-base sm:text-lg font-bold text-gray-900">Marriage Financial Planner</h2>
                                </div>
                                <button
                                  onClick={() => setOpenMarriage(false)}
                                  className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                                >
                                  <FiX size={16} className="text-gray-500" />
                                </button>
                              </div>
                            </div>
                            <div className="max-h-[65vh] sm:max-h-[60vh] overflow-y-auto">
                              <Marriage />
                            </div>
                          </motion.div>
                        </div>
                      )}

                      {openWedding && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden"
                          >
                            {/* Compact Header */}
                            <div className="p-3 border-b border-gray-200 bg-gradient-to-r from-[#FFEAD3] to-#FFEAD3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="p-1.5 rounded-md bg-[#EA7B7B]">
                                    <FiTag className="text-white text-sm" />
                                  </div>
                                  <h2 className="text-base sm:text-lg font-bold text-gray-900">Wedding Services & Discounts</h2>
                                </div>
                                <button
                                  onClick={() => setOpenWedding(false)}
                                  className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                                >
                                  <FiX size={16} className="text-gray-500" />
                                </button>
                              </div>
                            </div>
                            <div className="max-h-[65vh] sm:max-h-[60vh] overflow-y-auto">
                              <WeddingServices />
                            </div>
                          </motion.div>
                        </div>
                      )}

                    </div>
                  </motion.div>
                )}
              </div>

              {/* Partners Section */}
              <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 mb-6 md:mb-8 mt-4 md:mt-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 md:mb-8">
                  <div className="mb-4 sm:mb-0">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2">
                      <FiBookmark className="text-xl md:text-2xl text-[#D25353]" /> Your Watchlist
                      {filteredPartners.length > 0 && (
                        <span className="text-base md:text-lg font-normal text-gray-600 ml-2">
                          ({filteredPartners.length})
                        </span>
                      )}
                    </h2>
                    <p className="text-gray-600 mt-1 flex items-center gap-2 text-sm md:text-base">
                      <FiFilter className="text-[#EA7B7B]" />
                      {filteredPartners.length > 0
                        ? `Manage your saved partners`
                        : "No partners in your watchlist yet"}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-xs md:text-sm text-gray-500 bg-gradient-to-r from-[#FFEAD3]/50 to-[#FFEAD3]/30 px-3 py-1.5 rounded-lg flex items-center gap-2">
                      <FiRefreshCw className="text-[#EA7B7B]" />
                      <span className="font-medium">Updated:</span> {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>

                    {/* Enhanced Filters Button */}
                    <button
                      onClick={() => setShowFilters(true)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#EA7B7B] to-[#D25353] text-white rounded-lg hover:opacity-90 transition font-medium shadow-md"
                    >
                      <FiFilter className="text-sm md:text-base" />
                      <span className="text-sm md:text-base">Filters</span>
                      {getActiveFilterCount() > 0 && (
                        <span className="bg-white text-[#D25353] text-xs font-bold px-2 py-0.5 rounded-full">
                          {getActiveFilterCount()}
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Active Filters Display */}
                {getActiveFilterCount() > 0 && (
                  <div className="mb-6 p-4 bg-[#FFEAD3] border border-[#FFEAD3] rounded-xl">
                    <div className="flex flex-wrap gap-2">
                      <span className="text-sm font-medium text-gray-700">Active filters:</span>
                      {Object.keys(activeFilters).map(key => {
                        if (Array.isArray(activeFilters[key]) && activeFilters[key].length > 0) {
                          return activeFilters[key].map(value => (
                            <span key={`${key}-${value}`} className="inline-flex items-center gap-1 bg-white border border-[#FFEAD3] px-3 py-1 rounded-full text-xs text-[#9E3B3B]">
                              {key === 'maritalStatus' ? 'Marital Status' :
                                key === 'education' ? 'Education' :
                                  key === 'profession' ? 'Profession' :
                                    key === 'annualPackage' ? 'Annual Package' :
                                      key === 'employmentType' ? 'Employment Type' : key}: {value}
                              <button
                                onClick={() => handleFilterChange(key, value)}
                                className="text-[#D25353] hover:text-[#9E3B3B]"
                              >
                                <FiX className="text-xs" />
                              </button>
                            </span>
                          ));
                        } else if (activeFilters[key] && activeFilters[key].toString().trim() !== '') {
                          const displayKey = key === 'minAge' ? 'Min Age' :
                            key === 'maxAge' ? 'Max Age' :
                              key === 'minHeight' ? 'Min Height' :
                                key === 'maxHeight' ? 'Max Height' :
                                  key === 'minWeight' ? 'Min Weight' :
                                    key === 'maxWeight' ? 'Max Weight' :
                                      key === 'homeCity' ? 'Home City' :
                                        key === 'currentCity' ? 'Current Town' :
                                          key;

                          const displayValue = key.includes('Height') ? `${activeFilters[key]} cm` :
                            key.includes('Weight') ? `${activeFilters[key]} kg` :
                              key.includes('Age') ? `${activeFilters[key]} years` :
                                activeFilters[key];

                          return (
                            <span key={key} className="inline-flex items-center gap-1 bg-white border border-[#FFEAD3] px-3 py-1 rounded-full text-xs text-[#9E3B3B]">
                              {displayKey}: {displayValue}
                              <button
                                onClick={() => handleFilterChange(key, Array.isArray(activeFilters[key]) ? [] : '')}
                                className="text-[#D25353] hover:text-[#9E3B3B]"
                              >
                                <FiX className="text-xs" />
                              </button>
                            </span>
                          );
                        }
                        return null;
                      })}
                      <button
                        onClick={handleClearFilters}
                        className="text-xs text-[#D25353] hover:text-[#9E3B3B] font-medium ml-auto"
                      >
                        Clear all
                      </button>
                    </div>
                  </div>
                )}

                {filteredPartners.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                      {filteredPartners.map((partner, index) => {
                        const personalInfo = partner.personalInfo || {};
                        const careerInfo = partner.careerInfo || {};
                        const locationInfo = partner.locationInfo || {};
                        const educationInfo = partner.educationInfo || {};
                        const matchScore = formatMatchScore(partner.match_score);
                        const matchPercentage = calculateMatchPercentage(matchScore);

                        return (
                          <div
                            key={index}
                            className="group cursor-pointer"
                            onClick={() => handlePartnerClick(partner)}
                          >
                            <div className="border border-[#FFEAD3] rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-white h-full flex flex-col">
                              {/* Match Score Badge */}
                              <div className="absolute top-3 right-3 z-10">
                                <div className={`px-2 py-1 md:px-3 md:py-1.5 rounded-full text-xs md:text-sm font-bold shadow-lg bg-gradient-to-r ${getScoreColor(matchScore)} text-white flex items-center gap-1`}>
                                  <FiPercent className="text-xs" />{matchScore}%
                                </div>
                              </div>

                              {/* Remove Button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();

                                  const email = personalInfo?.email ||
                                    partner?.email ||
                                    partner?.userEmail ||
                                    partner?.personalInfo?.email;

                                  console.log("Card remove clicked, email to remove:", email);

                                  if (!email || email === "undefined" || email === "null") {
                                    console.error("Invalid email:", email);
                                    toast.error("Could not remove: Invalid partner email");
                                    return;
                                  }

                                  const userEmail = userData?.userEmail;
                                  if (!userEmail) {
                                    toast.error("User email not found");
                                    return;
                                  }

                                  setPartners(prev => prev.filter(p =>
                                    p.personalInfo?.email !== email &&
                                    p.email !== email &&
                                    p.userEmail !== email
                                  ));
                                  setFilteredPartners(prev => prev.filter(p =>
                                    p.personalInfo?.email !== email &&
                                    p.email !== email &&
                                    p.userEmail !== email
                                  ));

                                  handleRemoveFromWatchlist(email);
                                }}
                                className="absolute top-3 left-3 z-10 w-8 h-8 md:w-10 md:h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg group"
                                title="Remove from Watchlist"
                              >
                                <FiTrash2 className="text-[#D25353] text-sm md:text-base group-hover:text-[#9E3B3B] transition-colors" />
                              </button>

                              {/* Profile Image */}
                              <div className="h-48 md:h-64 bg-gradient-to-br from-[#FFEAD3] to-white relative overflow-hidden flex-shrink-0">
                                {personalInfo.profileImg && personalInfo.profileImg.trim() !== '' ? (
                                  <img
                                    src={personalInfo.profileImg}
                                    alt={personalInfo.fullName}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.nextElementSibling?.classList.remove('hidden');
                                    }}
                                  />
                                ) : null}
                                <div className={`absolute inset-0 flex items-center justify-center ${personalInfo.profileImg && personalInfo.profileImg.trim() !== '' ? 'hidden' : ''}`}>
                                  <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-r from-[#FFEAD3] to-[#F5D9C3] rounded-full flex items-center justify-center">
                                    <FiUser className="text-4xl md:text-6xl text-[#EA7B7B]" />
                                  </div>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                              </div>

                              {/* Partner Details */}
                              <div className="p-4 md:p-5 flex-grow flex flex-col">
                                <div className="mb-3 md:mb-4">
                                  <h3 className="text-lg md:text-xl font-bold text-gray-800 truncate mb-2">
                                    {showValue(personalInfo.fullName)}
                                  </h3>
                                  <div className="flex flex-wrap items-center gap-2 mb-2 md:mb-3">
                                    <span className="text-xs md:text-sm text-[#9E3B3B] font-medium flex items-center gap-1 bg-[#FFEAD3] px-2 py-1 rounded">
                                      <FaBirthdayCake className="text-[#EA7B7B] text-xs" /> {showValue(personalInfo.age)} years
                                    </span>
                                    <span className="text-xs md:text-sm text-[#9E3B3B] font-medium flex items-center gap-1 bg-[#FFEAD3] px-2 py-1 rounded">
                                      <FaVenusMars className="text-[#EA7B7B] text-xs" /> {showValue(personalInfo.gender)}
                                    </span>
                                  </div>
                                </div>

                                <div className="space-y-2 md:space-y-3 mb-3 md:mb-4 flex-grow">
                                  {careerInfo.profession && (
                                    <div className="flex items-start gap-2 text-gray-600">
                                      <FiBriefcase className="text-[#EA7B7B] flex-shrink-0 mt-0.5 text-xs md:text-sm" />
                                      <span className="text-xs md:text-sm line-clamp-2">{showValue(careerInfo.profession)}</span>
                                    </div>
                                  )}

                                  {educationInfo.highestEducation && (
                                    <div className="flex items-start gap-2 text-gray-600">
                                      <FaUserGraduate className="text-[#EA7B7B] flex-shrink-0 mt-0.5 text-xs md:text-sm" />
                                      <span className="text-xs md:text-sm line-clamp-2">{showValue(educationInfo.highestEducation)}</span>
                                    </div>
                                  )}

                                  {locationInfo.currentLocation && (
                                    <div className="flex items-start gap-2 text-gray-600">
                                      <FiMapPin className="text-[#EA7B7B] flex-shrink-0 mt-0.5 text-xs md:text-sm" />
                                      <span className="text-xs md:text-sm line-clamp-2">{showValue(locationInfo.currentLocation)}</span>
                                    </div>
                                  )}
                                </div>

                                {/* Match Score Bar */}
                                <div className="mt-auto">
                                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                                    <span className={`${matchPercentage.color} text-xs`}>{matchPercentage.label}</span>
                                    <span className="font-bold text-[#9E3B3B] text-xs">{matchScore}%</span>
                                  </div>
                                  <div className="h-1.5 md:h-2 bg-[#FFEAD3] rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full bg-gradient-to-r ${getScoreColor(matchScore)}`}
                                      style={{ width: `${matchScore}%` }}
                                    ></div>
                                  </div>
                                </div>

                                {/* Action Button */}
                                <div className="mt-3 md:mt-4">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handlePartnerClick(partner);
                                    }}
                                    className="w-full px-3 py-2 text-xs md:text-sm bg-gradient-to-r from-[#EA7B7B] to-[#D25353] text-white rounded-lg hover:opacity-90 transition font-medium flex items-center justify-center gap-1"
                                  >
                                    <FiEye /> View Details
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 md:py-16">
                    <div className="max-w-md mx-auto">
                      <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-r from-[#FFEAD3] to-white rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                        <FiBookmark className="text-4xl md:text-6xl text-[#EA7B7B]" />
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2 md:mb-3">
                        {getActiveFilterCount() > 0 ? 'No Partners Match Filters' : 'Your Watchlist is Empty'}
                      </h3>
                      <p className="text-gray-600 mb-6 md:mb-8 text-sm md:text-base">
                        {getActiveFilterCount() > 0
                          ? 'Try adjusting your filters to see more partners.'
                          : "Start adding partners from your matches to build your watchlist."}
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        {getActiveFilterCount() > 0 && (
                          <button
                            onClick={handleClearFilters}
                            className="px-4 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-[#EA7B7B] to-[#D25353] text-white rounded-lg hover:shadow-lg transition font-medium flex items-center justify-center gap-2"
                          >
                            <FiFilter /> Clear Filters
                          </button>
                        )}
                        <button
                          onClick={() => navigate('/matches')}
                          className="px-4 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-[#EA7B7B] to-[#D25353] text-white rounded-lg hover:shadow-lg transition font-medium flex items-center justify-center gap-2"
                        >
                          <FiHeart /> Browse Matches
                        </button>
                      </div>
                    </div>
                  </div>
                )}
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
                        <FiLock className="text-gray-500" size={28} />
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
                          icon: FiBookmark,
                          title: "Watchlist Access",
                          description: "Save and manage profiles",
                        },
                        {
                          icon: FiCalendar,
                          title: "Date Planning",
                          description: "Schedule meetings",
                        },
                        {
                          icon: HiOutlineSparkles,
                          title: "Marriage Planning",
                          description: "Proper guidance",
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
                                <FiStar className="text-white" size={20} />
                              </div>
                              <div>
                                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">Premium Yearly</h3>
                                <p className="text-white/90 text-sm sm:text-base">Easy payment, annual access</p>
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
                                  <FiCheck size={14} className="text-white" />
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
                                <span className="text-white/80 ml-1 sm:ml-2 text-sm sm:text-base">/year</span>
                              </div>
                              <p className="text-white/80 text-xs sm:text-sm mt-1">Yearly membership</p>
                            </div>

                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="bg-white text-gray-900 font-bold px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base flex items-center justify-center gap-2 sm:gap-3 hover:shadow-xl transition-all duration-300 w-full lg:w-auto"
                              style={{ color: primaryDark }}
                              onClick={() => navigate("/profile#plan")}
                            >
                              <FiStar size={16} />
                              <span>Upgrade to Premium</span>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                              </svg>
                            </motion.button>

                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Testimonial */}
                    <div className="text-center max-w-2xl mx-auto">
                      <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full mb-3 sm:mb-4"
                        style={{ background: `${primaryColor}15` }}>
                        <FiUsers style={{ color: primaryColor }} size={20} />
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

      {/* Filters Modal */}
      {showFilters && <FiltersModal />}

      {/* Partner Detail Modal */}
      {showPartnerModal && selectedPartner && (
        <PartnerDetailModal
          partner={selectedPartner}
          onClose={() => {
            setShowPartnerModal(false);
            setSelectedPartner(null);
          }}
          onRemove={handleRemoveFromWatchlist}
          isPremiumUser={isPremium}
        />
      )}
    </>
  );
};

export default Watchlist;