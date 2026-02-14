import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUserContext } from '../context/UserContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Chatbot from '../components/Chatbot';
import Marriage from "../components/MarriageAssistance";
import WeddingServices from "../components/WeddingServices";
import { motion, AnimatePresence } from "framer-motion";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";
import PropTypes from 'prop-types';

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
import { FaCircle, FaClock } from "react-icons/fa";
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

// PropTypes for components
const PartnerDetailModalPropTypes = {
  partner: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  isPremiumUser: PropTypes.bool.isRequired
};

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
  const [removingId, setRemovingId] = useState(null);
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
  const [myProfile, setMyProfile] = useState(null);
  const modalRef = useRef(null);

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

  // Priority: 1. location.state, 2. userProfile context, 3. localStorage
  const userData = useMemo(() => {
    if (location.state && location.state.userEmail) {
      return location.state;
    } else if (userProfile && userProfile.userEmail) {
      return userProfile;
    } else {
      const storedData = localStorage.getItem('userData');
      return storedData ? JSON.parse(storedData) : {
        userEmail: '',
        isProfilePublished: false,
        membershipType: 'free'
      };
    }
  }, [location.state, userProfile]);

  useEffect(() => {
    const getProfile = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/profile/get-profile?email=${userData.userEmail}`);
        if (res.data.success) setMyProfile(res.data.profile);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    if (userData?.userEmail) getProfile();
  }, [userData, BACKEND_URL]);

  // Handle escape key for modals
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        if (showPartnerModal) setShowPartnerModal(false);
        if (showFilters) setShowFilters(false);
        if (openMarriage) setOpenMarriage(false);
        if (openWedding) setOpenWedding(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showPartnerModal, showFilters, openMarriage, openWedding]);

  // Prevent body scroll when modals are open
  useEffect(() => {
    if (showPartnerModal || showFilters || openMarriage || openWedding) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showPartnerModal, showFilters, openMarriage, openWedding]);

  const isPremium = userData?.membershipType === 'premium';

  const showValue = (val) => {
    if (val === null || val === undefined) return "Not Mentioned";
    if (typeof val === "string" && val.trim() === "") return "Not Mentioned";
    return val;
  };

  const parseHeightToCm = (heightStr) => {
    if (!heightStr) return null;
    try {
      const height = heightStr.toString().toLowerCase().trim();
      const cmMatch = height.match(/(\d+(?:\.\d+)?)\s*cm/);
      if (cmMatch) return Math.round(parseFloat(cmMatch[1]));

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
      return null;
    } catch (error) {
      console.error("Height parsing error:", error);
      return null;
    }
  };

  const parseIncome = (incomeStr) => {
    if (!incomeStr) return 0;
    const match = incomeStr.match(/(\d+(?:\.\d+)?)\s*(?:LPA|L|Lakh)/i);
    if (match) return parseFloat(match[1]) * 100000;
    return 0;
  };

  const parseIncomeRange = (rangeStr) => {
    const match = rangeStr.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*LPA/i);
    if (match) return [parseFloat(match[1]) * 100000, parseFloat(match[2]) * 100000];
    if (rangeStr.includes('50+')) return [5000000, Infinity];
    return [-Infinity, Infinity]; // Allow all if no match
  };

  const applyFilters = useCallback(() => {
    if (partners.length === 0) {
      setFilteredPartners([]);
      return;
    }

    // Create Sets for O(1) lookup
    const maritalStatusSet = new Set(activeFilters.maritalStatus);
    const educationSet = new Set(activeFilters.education);
    const professionSet = new Set(activeFilters.profession);
    const annualPackageSet = new Set(activeFilters.annualPackage);
    const employmentTypeSet = new Set(activeFilters.employmentType);

    const filtered = partners.filter(partner => {
      const personalInfo = partner.personalInfo || {};
      const careerInfo = partner.careerInfo || {};
      const locationInfo = partner.locationInfo || {};
      const educationInfo = partner.educationInfo || {};

      const age = parseInt(personalInfo.age) || 0;
      if (activeFilters.minAge && age < parseInt(activeFilters.minAge)) return false;
      if (activeFilters.maxAge && age > parseInt(activeFilters.maxAge)) return false;

      if (maritalStatusSet.size > 0 && !maritalStatusSet.has(personalInfo.maritalStatus)) return false;

      if (educationSet.size > 0) {
        const edu = educationInfo.highestEducation || '';
        let matches = false;
        for (const filterEdu of educationSet) {
          if (edu.includes(filterEdu)) {
            matches = true;
            break;
          }
        }
        if (!matches) return false;
      }

      if (professionSet.size > 0) {
        const prof = careerInfo.profession || '';
        let matches = false;
        for (const filterProf of professionSet) {
          if (prof.includes(filterProf)) {
            matches = true;
            break;
          }
        }
        if (!matches) return false;
      }

      if (annualPackageSet.size > 0 && careerInfo.annualIncome) {
        const matchIncome = parseIncome(careerInfo.annualIncome);
        let passesIncome = false;
        for (const range of annualPackageSet) {
          const [min, max] = parseIncomeRange(range);
          if (matchIncome >= min && matchIncome <= max) {
            passesIncome = true;
            break;
          }
        }
        if (!passesIncome) return false;
      }

      if (employmentTypeSet.size > 0 && !employmentTypeSet.has(careerInfo.employmentType)) return false;

      if (activeFilters.homeCity && activeFilters.homeCity.trim() !== '') {
        const searchCity = activeFilters.homeCity.trim().toLowerCase();
        const matchCity = locationInfo.city ? locationInfo.city.trim().toLowerCase() : '';
        if (!matchCity.includes(searchCity)) return false;
      }

      if (activeFilters.currentCity && activeFilters.currentCity.trim() !== '') {
        const searchCity = activeFilters.currentCity.trim().toLowerCase();
        const matchCity = locationInfo.currentLocation ? locationInfo.currentLocation.trim().toLowerCase() : '';
        if (!matchCity.includes(searchCity)) return false;
      }

      if (activeFilters.minHeight || activeFilters.maxHeight) {
        const heightInCm = parseHeightToCm(personalInfo.height);
        if (heightInCm !== null) {
          if (activeFilters.minHeight && heightInCm < parseInt(activeFilters.minHeight)) return false;
          if (activeFilters.maxHeight && heightInCm > parseInt(activeFilters.maxHeight)) return false;
        }
      }

      if (activeFilters.minWeight && personalInfo.weight && parseInt(personalInfo.weight) < parseInt(activeFilters.minWeight)) return false;
      if (activeFilters.maxWeight && personalInfo.weight && parseInt(personalInfo.weight) > parseInt(activeFilters.maxWeight)) return false;

      return true;
    });

    setFilteredPartners(filtered);
  }, [activeFilters, partners]);

  const handleFilterChange = (filterType, value) => {
    setActiveFilters(prev => {
      if (Array.isArray(prev[filterType])) {
        const currentArray = prev[filterType];
        if (currentArray.includes(value)) {
          return { ...prev, [filterType]: currentArray.filter(item => item !== value) };
        } else {
          return { ...prev, [filterType]: [...currentArray, value] };
        }
      } else {
        return { ...prev, [filterType]: value };
      }
    });
  };

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

  const getActiveFilterCount = useMemo(() => {
    let count = 0;
    Object.keys(activeFilters).forEach(key => {
      if (Array.isArray(activeFilters[key])) {
        count += activeFilters[key].length;
      } else if (activeFilters[key] && activeFilters[key].toString().trim() !== '') {
        count += 1;
      }
    });
    return count;
  }, [activeFilters]);

  const formatLastSeen = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      const istOffset = 5.5 * 60 * 60 * 1000;
      const istDate = new Date(date.getTime() + istOffset);
      return istDate.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });
    } catch (error) {
      return "";
    }
  };

  const fetchWatchlist = async () => {
    if (!isPremium || !userData?.userEmail) {
      setLoadingPartners(false);
      return;
    }

    try {
      setLoadingPartners(true);
      const token = localStorage.getItem('token');

      if (!token) {
        toast.error("Please login to continue");
        setLoadingPartners(false);
        return;
      }

      const watchlistResponse = await axios.get(
        `${BACKEND_URL}/api/watchlist/partners/${userData.userEmail}`,
        { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );

      if (watchlistResponse.data.success) {
        const emails = watchlistResponse.data.partners || [];
        setWatchlistEmails(emails);

        if (emails.length > 0) {
          const res = await axios.get(
            `${BACKEND_URL}/api/watchlist-profiles/${userData.userEmail}`,
            { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
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
        toast.error("Failed to load watchlist. Please try again.");
      }
    } finally {
      setLoadingPartners(false);
    }
  };

  const handleRemoveFromWatchlist = async (partnerEmail) => {
    let emailToRemove = partnerEmail;

    if (!emailToRemove || emailToRemove === "undefined" || emailToRemove === "null") {
      if (selectedPartner) {
        emailToRemove = selectedPartner.personalInfo?.email ||
          selectedPartner.email ||
          selectedPartner.userEmail;
      }
    }

    if (!emailToRemove || emailToRemove === "undefined" || emailToRemove === "null") {
      toast.error("Cannot remove: Partner email not found");
      return;
    }

    setRemovingId(emailToRemove);

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

      const response = await axios.delete(`${BACKEND_URL}/api/watchlist-remove`, {
        params: { user_email: userEmail, partner_email: emailToRemove },
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      if (response.data.success) {
        setWatchlistEmails(prev => prev.filter(email => email !== emailToRemove));
        setPartners(prev => prev.filter(p =>
          p.personalInfo?.email !== emailToRemove &&
          p.email !== emailToRemove &&
          p.userEmail !== emailToRemove
        ));
        setFilteredPartners(prev => prev.filter(p =>
          p.personalInfo?.email !== emailToRemove &&
          p.email !== emailToRemove &&
          p.userEmail !== emailToRemove
        ));

        if (selectedPartner?.personalInfo?.email === emailToRemove ||
          selectedPartner?.email === emailToRemove ||
          selectedPartner?.userEmail === emailToRemove) {
          setShowPartnerModal(false);
          setSelectedPartner(null);
        }

        toast.success("Removed from watchlist!");
      } else {
        toast.error(response.data.error || "Failed to remove from watchlist");
      }
    } catch (error) {
      console.error("Remove watchlist error:", error);
      if (error.response?.status === 422) {
        toast.error("Validation error: Missing required parameters");
      } else if (error.response?.status === 404) {
        toast.error("Watchlist or partner not found");
      } else {
        toast.error("Failed to remove from watchlist");
      }
    } finally {
      setRemovingId(null);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchWatchlist();
    setRefreshing(false);
  };

  const handlePartnerClick = (partner) => {
    setSelectedPartner(partner);
    setShowPartnerModal(true);
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'from-emerald-500 to-emerald-600';
    if (score >= 80) return 'from-teal-500 to-teal-600';
    if (score >= 70) return 'from-amber-500 to-amber-600';
    if (score >= 60) return 'from-orange-400 to-orange-500';
    return 'from-gray-400 to-gray-500';
  };

  const getScoreBg = (score) => {
    if (score >= 90) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (score >= 80) return 'bg-teal-50 text-teal-700 border-teal-200';
    if (score >= 70) return 'bg-amber-50 text-amber-700 border-amber-200';
    if (score >= 60) return 'bg-orange-50 text-orange-700 border-orange-200';
    return 'bg-gray-50 text-gray-600 border-gray-200';
  };

  const formatMatchScore = (score) => {
    if (typeof score === 'string') {
      const cleaned = score.replace('%', '').trim();
      const num = parseFloat(cleaned);
      return isNaN(num) ? 0 : num;
    }
    return typeof score === 'number' ? score : parseFloat(score) || 0;
  };

  const calculateMatchPercentage = (score) => {
    if (score >= 90) return { label: 'Excellent Match', color: 'text-emerald-600' };
    if (score >= 80) return { label: 'Great Match', color: 'text-teal-600' };
    if (score >= 70) return { label: 'Good Match', color: 'text-amber-600' };
    if (score >= 60) return { label: 'Fair Match', color: 'text-orange-500' };
    return { label: 'Basic Match', color: 'text-gray-500' };
  };

  const handleUpgradePlan = () => { navigate('/profile#plan'); };

  useEffect(() => {
    if (userData?.userEmail) localStorage.setItem('userData', JSON.stringify(userData));
  }, [userData]);

  useEffect(() => {
    fetchWatchlist();
  }, [isPremium, userData?.userEmail, BACKEND_URL]);

  useEffect(() => {
    const timeoutId = setTimeout(() => { applyFilters(); }, 300);
    return () => clearTimeout(timeoutId);
  }, [activeFilters, partners, applyFilters]);

  const comparePartner = useCallback((me, p) => {
    if (!me || !p) return { score: 0, fields: {} };

    let score = 0;

    const eq = (a, b) => {
      if (!a || !b) return false;
      return a.toString().trim().toLowerCase() === b.toString().trim().toLowerCase();
    };

    const fields = {
      age: eq(me.personalInfo?.age, p.personalInfo?.age),
      dob: eq(me.personalInfo?.dob, p.personalInfo?.dob),
      marital: eq(me.personalInfo?.maritalStatus, p.personalInfo?.maritalStatus),
      disability: eq(me.personalInfo?.disability, p.personalInfo?.disability),
      height: eq(me.personalInfo?.height, p.personalInfo?.height),
      weight: eq(me.personalInfo?.weight, p.personalInfo?.weight),
      blood: eq(me.personalInfo?.bloodGroup, p.personalInfo?.bloodGroup),
      employment: eq(me.careerInfo?.jobTitle, p.careerInfo?.jobTitle),
      education: eq(me.educationInfo?.highestEducation, p.educationInfo?.highestEducation),
      profession: eq(me.careerInfo?.profession, p.careerInfo?.profession),
      income: eq(me.careerInfo?.annualIncome, p.careerInfo?.annualIncome),
      employmentType: eq(me.careerInfo?.employmentType, p.careerInfo?.employmentType),
      religion: eq(me.religionInfo?.religion, p.religionInfo?.religion),
      caste: eq(me.religionInfo?.caste, p.religionInfo?.caste),
      country: eq(me.locationInfo?.country, p.locationInfo?.country),
      state: eq(me.locationInfo?.state, p.locationInfo?.state),
      city: eq(me.locationInfo?.city, p.locationInfo?.city),
      currentLocation: eq(me.locationInfo?.currentLocation, p.locationInfo?.currentLocation),
      fatherOccupation: eq(me.familyInfo?.fatherOccupation, p.familyInfo?.fatherOccupation),
      familyType: eq(me.familyInfo?.familyType, p.familyInfo?.familyType),
      familyStatus: eq(me.familyInfo?.familyStatus, p.familyInfo?.familyStatus),
    };

    Object.values(fields).forEach(v => v && score++);

    return { score, fields };
  }, []);

  // Memoized partners with scores
  const partnersWithScore = useMemo(() => {
    if (!myProfile) return filteredPartners;

    // First add compare scores to filtered partners
    const scored = filteredPartners.map(p => ({
      ...p,
      compare: comparePartner(myProfile, p)
    }));

    // Then sort by score in descending order (highest score first)
    return scored.sort((a, b) => b.compare.score - a.compare.score);
  }, [filteredPartners, myProfile, comparePartner]);

  // Optional: Add this useEffect to ensure sorting happens immediately after filter changes
  useEffect(() => {
    if (filteredPartners.length > 0 && myProfile) {
      // This is already handled by the useMemo above, but if you want to be extra sure
      console.log('Filters applied, partners sorted by score');
    }
  }, [activeFilters, filteredPartners.length]); // Just for logging/debugging

  // ======================== TICK COMPONENT ========================
  const Tick = ({ ok }) => (
    ok
      ? <span className="text-green-600 font-bold text-lg">✔</span>
      : <span className="text-red-500 font-bold text-lg">✖</span>
  );

  Tick.propTypes = {
    ok: PropTypes.bool.isRequired
  };

  // ======================== PARTNER DETAIL MODAL ========================
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
    const compareResult = partner.compare || { score: 0, fields: {} };

    return (
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 overflow-y-auto"
        onClick={onClose}
      >
        <div
          className="bg-white w-full md:max-w-5xl md:rounded-2xl md:my-6 min-h-screen md:min-h-0 md:max-h-[92vh] overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
          ref={modalRef}
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-rose-500 to-pink-600 text-white px-6 py-6 md:px-8 md:py-6">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 md:top-4 md:right-4 w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center hover:bg-white/30 transition"
            >
              <FiX className="text-white text-xl" />
            </button>
            <h2 className="text-2xl md:text-3xl font-bold pr-12 truncate">{showValue(personalInfo.fullName)}</h2>
            <div className="flex flex-wrap items-center gap-3 mt-3">
              <span className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-full text-sm font-medium">
                <FaBirthdayCake className="text-xs" /> {showValue(personalInfo.age)} yrs
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-full text-sm font-medium">
                <FiMapPin className="text-xs" /> {showValue(locationInfo.state)}
              </span>
              {partner.isOnline ? (
                <span className="inline-flex items-center gap-1.5 bg-emerald-400/30 px-3 py-1.5 rounded-full text-sm font-medium">
                  <FaCircle className="text-[8px] text-emerald-300 animate-pulse" /> Online
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-full text-sm font-medium">
                  <FaClock className="text-xs" /> {formatLastSeen(partner.lastSeen)}
                </span>
              )}
              <div className="ml-auto px-4 py-1.5 rounded-full text-sm font-bold bg-gradient-to-r from-amber-400 to-orange-500 shadow-lg text-white">
                Score: {compareResult.score}/20
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="overflow-y-auto max-h-[calc(100vh-140px)] md:max-h-[calc(92vh-140px)]">
            <div className="p-6 md:p-8">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Left - Image & Actions */}
                <div className="lg:w-2/5 space-y-5">
                  <div className="rounded-xl overflow-hidden bg-gray-100 aspect-[3/4] relative shadow-lg">
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
                    <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br from-rose-100 to-pink-50 ${personalInfo.profileImg && personalInfo.profileImg.trim() !== '' ? 'hidden' : ''}`}>
                      <FiUser className="text-8xl md:text-9xl text-rose-300" />
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const email = personalInfo?.email || partner?.email || partner?.userEmail || partner?.personalInfo?.email;
                      if (!email || email === "undefined" || email === "null") {
                        toast.error("Could not remove: Invalid partner email");
                        return;
                      }
                      onRemove(email);
                      onClose();
                    }}
                    disabled={removingId === (personalInfo?.email || partner?.email || partner?.userEmail)}
                    className="w-full py-4 rounded-xl font-semibold text-base flex items-center justify-center gap-2 bg-rose-50 text-rose-600 border-2 border-rose-200 hover:bg-rose-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiTrash2 className="text-lg" />
                    {removingId === (personalInfo?.email || partner?.email || partner?.userEmail) ? 'Removing...' : 'Remove from Watchlist'}
                  </button>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Height', value: showValue(personalInfo.height) },
                      { label: 'Weight', value: showValue(personalInfo.weight) },
                      personalInfo.bloodGroup && { label: 'Blood Group', value: showValue(personalInfo.bloodGroup) },
                      careerInfo.employmentType && { label: 'Employment', value: showValue(careerInfo.employmentType) },
                    ].filter(Boolean).map((stat, i) => (
                      <div key={i} className="bg-gray-50 rounded-lg p-4 text-center">
                        <div className="text-base font-bold text-gray-800">{stat.value}</div>
                        <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right - Details */}
                <div className="lg:w-3/5 space-y-5">
                  {/* Personal Information with ticks */}
                  <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-gray-50 px-5 py-3.5 flex items-center gap-2.5 border-b border-gray-200">
                      <FiUser className="text-rose-500 text-lg" />
                      <h4 className="font-bold text-gray-800 text-base">Personal Information</h4>
                    </div>
                    <div className="px-5 py-3 divide-y divide-gray-100">
                      <div className="flex items-center justify-between py-3">
                        <span className="text-gray-600 text-sm flex items-center gap-2"><FiUser className="text-rose-400 text-sm" /> Full Name</span>
                        <span className="font-semibold text-gray-800 text-sm sm:text-base text-right max-w-[60%] break-words">{showValue(personalInfo.fullName)}</span>
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <span className="text-gray-600 text-sm flex items-center gap-2"><FaBirthdayCake className="text-rose-400 text-sm" /> Age</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-800 text-sm sm:text-base">{showValue(personalInfo.age)} years</span>
                          <Tick ok={compareResult.fields?.age} />
                        </div>
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <span className="text-gray-600 text-sm flex items-center gap-2"><FiCalendar className="text-rose-400 text-sm" /> Date of Birth</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-800 text-sm sm:text-base">{showValue(personalInfo.dob)}</span>
                          <Tick ok={compareResult.fields?.dob} />
                        </div>
                      </div>
                      {personalInfo.maritalStatus && (
                        <div className="flex items-center justify-between py-3">
                          <span className="text-gray-600 text-sm flex items-center gap-2"><FiUsers className="text-rose-400 text-sm" /> Marital Status</span>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-800 text-sm sm:text-base">{showValue(personalInfo.maritalStatus)}</span>
                            <Tick ok={compareResult.fields?.marital} />
                          </div>
                        </div>
                      )}
                      {personalInfo.disability && (
                        <div className="flex items-center justify-between py-3">
                          <span className="text-gray-600 text-sm flex items-center gap-2"><FiInfo className="text-rose-400 text-sm" /> Disability</span>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-800 text-sm sm:text-base">{showValue(personalInfo.disability)}</span>
                            <Tick ok={compareResult.fields?.disability} />
                          </div>
                        </div>
                      )}
                      <div className="flex items-center justify-between py-3">
                        <span className="text-gray-600 text-sm flex items-center gap-2"><FiUser className="text-rose-400 text-sm" /> Height</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-800 text-sm sm:text-base">{showValue(personalInfo.height)}</span>
                          <Tick ok={compareResult.fields?.height} />
                        </div>
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <span className="text-gray-600 text-sm flex items-center gap-2"><FiUser className="text-rose-400 text-sm" /> Weight</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-800 text-sm sm:text-base">{showValue(personalInfo.weight)}</span>
                          <Tick ok={compareResult.fields?.weight} />
                        </div>
                      </div>
                      {personalInfo.bloodGroup && (
                        <div className="flex items-center justify-between py-3">
                          <span className="text-gray-600 text-sm flex items-center gap-2"><FiInfo className="text-rose-400 text-sm" /> Blood Group</span>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-800 text-sm sm:text-base">{showValue(personalInfo.bloodGroup)}</span>
                            <Tick ok={compareResult.fields?.blood} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* About Me */}
                  {aboutYourself && (
                    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                      <div className="bg-gray-50 px-5 py-3.5 flex items-center gap-2.5 border-b border-gray-200">
                        <FiUser className="text-rose-500 text-lg" />
                        <h4 className="font-bold text-gray-800 text-base">About Me</h4>
                      </div>
                      <div className="px-5 py-4">
                        <p className="text-gray-700 text-base leading-relaxed whitespace-pre-line">{aboutYourself}</p>
                      </div>
                    </div>
                  )}

                  {/* Education & Career with ticks */}
                  <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-gray-50 px-5 py-3.5 flex items-center gap-2.5 border-b border-gray-200">
                      <FaUserGraduate className="text-rose-500 text-lg" />
                      <h4 className="font-bold text-gray-800 text-base">Education & Career</h4>
                    </div>
                    <div className="px-5 py-3 divide-y divide-gray-100">
                      {educationInfo.highestEducation && (
                        <div className="flex items-center justify-between py-3">
                          <span className="text-gray-600 text-sm flex items-center gap-2"><FiBookOpen className="text-rose-400 text-sm" /> Education</span>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-800 text-sm sm:text-base">{showValue(educationInfo.highestEducation)}</span>
                            <Tick ok={compareResult.fields?.education} />
                          </div>
                        </div>
                      )}
                      {careerInfo.profession && (
                        <div className="flex items-center justify-between py-3">
                          <span className="text-gray-600 text-sm flex items-center gap-2"><FiBriefcase className="text-rose-400 text-sm" /> Profession</span>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-800 text-sm sm:text-base">{showValue(careerInfo.profession)}</span>
                            <Tick ok={compareResult.fields?.profession} />
                          </div>
                        </div>
                      )}
                      {careerInfo.annualIncome && (
                        <div className="flex items-center justify-between py-3">
                          <span className="text-gray-600 text-sm flex items-center gap-2"><FaChartLine className="text-rose-400 text-sm" /> Annual Income</span>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-800 text-sm sm:text-base">{showValue(careerInfo.annualIncome)}</span>
                            <Tick ok={compareResult.fields?.income} />
                          </div>
                        </div>
                      )}
                      {careerInfo.employmentType && (
                        <div className="flex items-center justify-between py-3">
                          <span className="text-gray-600 text-sm flex items-center gap-2"><FiBriefcase className="text-rose-400 text-sm" /> Employment Type</span>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-800 text-sm sm:text-base">{showValue(careerInfo.employmentType)}</span>
                            <Tick ok={compareResult.fields?.employmentType} />
                          </div>
                        </div>
                      )}
                      {careerInfo.jobTitle && (
                        <div className="flex items-center justify-between py-3">
                          <span className="text-gray-600 text-sm flex items-center gap-2"><FiBriefcase className="text-rose-400 text-sm" /> Job Title</span>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-800 text-sm sm:text-base">{showValue(careerInfo.jobTitle)}</span>
                            <Tick ok={compareResult.fields?.employment} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Religious Information with ticks */}
                  {(religionInfo.religion || religionInfo.caste) && (
                    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                      <div className="bg-gray-50 px-5 py-3.5 flex items-center gap-2.5 border-b border-gray-200">
                        <FaPrayingHands className="text-rose-500 text-lg" />
                        <h4 className="font-bold text-gray-800 text-base">Religious Information</h4>
                      </div>
                      <div className="px-5 py-3 divide-y divide-gray-100">
                        {religionInfo.religion && (
                          <div className="flex items-center justify-between py-3">
                            <span className="text-gray-600 text-sm flex items-center gap-2"><FaPrayingHands className="text-rose-400 text-sm" /> Religion</span>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-800 text-sm sm:text-base">{showValue(religionInfo.religion)}</span>
                              <Tick ok={compareResult.fields?.religion} />
                            </div>
                          </div>
                        )}
                        {religionInfo.caste && (
                          <div className="flex items-center justify-between py-3">
                            <span className="text-gray-600 text-sm flex items-center gap-2"><FaPrayingHands className="text-rose-400 text-sm" /> Caste</span>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-800 text-sm sm:text-base">{showValue(religionInfo.caste)}</span>
                              <Tick ok={compareResult.fields?.caste} />
                            </div>
                          </div>
                        )}
                        {religionInfo.subCaste && (
                          <div className="flex items-center justify-between py-3">
                            <span className="text-gray-600 text-sm flex items-center gap-2"><FaPrayingHands className="text-rose-400 text-sm" /> Sub Caste</span>
                            <span className="font-semibold text-gray-800 text-sm sm:text-base text-right max-w-[60%] break-words">{showValue(religionInfo.subCaste)}</span>
                          </div>
                        )}
                        {religionInfo.gotra && (
                          <div className="flex items-center justify-between py-3">
                            <span className="text-gray-600 text-sm flex items-center gap-2"><FaPrayingHands className="text-rose-400 text-sm" /> Gotra</span>
                            <span className="font-semibold text-gray-800 text-sm sm:text-base text-right max-w-[60%] break-words">{showValue(religionInfo.gotra)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Location Details with ticks */}
                  <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-gray-50 px-5 py-3.5 flex items-center gap-2.5 border-b border-gray-200">
                      <FiHome className="text-rose-500 text-lg" />
                      <h4 className="font-bold text-gray-800 text-base">Location Details</h4>
                    </div>
                    <div className="px-5 py-3 divide-y divide-gray-100">
                      <div className="flex items-center justify-between py-3">
                        <span className="text-gray-600 text-sm flex items-center gap-2"><FiMapPin className="text-rose-400 text-sm" /> Country</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-800 text-sm sm:text-base">{showValue(locationInfo.country)}</span>
                          <Tick ok={compareResult.fields?.country} />
                        </div>
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <span className="text-gray-600 text-sm flex items-center gap-2"><FiMapPin className="text-rose-400 text-sm" /> State</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-800 text-sm sm:text-base">{showValue(locationInfo.state)}</span>
                          <Tick ok={compareResult.fields?.state} />
                        </div>
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <span className="text-gray-600 text-sm flex items-center gap-2"><FiMapPin className="text-rose-400 text-sm" /> City</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-800 text-sm sm:text-base">{showValue(locationInfo.city)}</span>
                          <Tick ok={compareResult.fields?.city} />
                        </div>
                      </div>
                      {locationInfo.currentLocation && (
                        <div className="flex items-center justify-between py-3">
                          <span className="text-gray-600 text-sm flex items-center gap-2"><FiMapPin className="text-rose-400 text-sm" /> Current Location</span>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-800 text-sm sm:text-base">{showValue(locationInfo.currentLocation)}</span>
                            <Tick ok={compareResult.fields?.currentLocation} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Family Details with ticks */}
                  {(familyInfo.fatherName || familyInfo.motherName || familyInfo.siblings) && (
                    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                      <div className="bg-gray-50 px-5 py-3.5 flex items-center gap-2.5 border-b border-gray-200">
                        <FiUsers className="text-rose-500 text-lg" />
                        <h4 className="font-bold text-gray-800 text-base">Family Details</h4>
                      </div>
                      <div className="px-5 py-3 divide-y divide-gray-100">
                        {familyInfo.fatherName && (
                          <div className="flex items-center justify-between py-3">
                            <span className="text-gray-600 text-sm flex items-center gap-2"><FiUser className="text-rose-400 text-sm" /> Father's Name</span>
                            <span className="font-semibold text-gray-800 text-sm sm:text-base text-right max-w-[60%] break-words">{showValue(familyInfo.fatherName)}</span>
                          </div>
                        )}
                        {familyInfo.fatherOccupation && (
                          <div className="flex items-center justify-between py-3">
                            <span className="text-gray-600 text-sm flex items-center gap-2"><FiBriefcase className="text-rose-400 text-sm" /> Father's Occupation</span>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-800 text-sm sm:text-base">{showValue(familyInfo.fatherOccupation)}</span>
                              <Tick ok={compareResult.fields?.fatherOccupation} />
                            </div>
                          </div>
                        )}
                        {familyInfo.motherName && (
                          <div className="flex items-center justify-between py-3">
                            <span className="text-gray-600 text-sm flex items-center gap-2"><FiUser className="text-rose-400 text-sm" /> Mother's Name</span>
                            <span className="font-semibold text-gray-800 text-sm sm:text-base text-right max-w-[60%] break-words">{showValue(familyInfo.motherName)}</span>
                          </div>
                        )}
                        {familyInfo.motherOccupation && (
                          <div className="flex items-center justify-between py-3">
                            <span className="text-gray-600 text-sm flex items-center gap-2"><FiBriefcase className="text-rose-400 text-sm" /> Mother's Occupation</span>
                            <span className="font-semibold text-gray-800 text-sm sm:text-base text-right max-w-[60%] break-words">{showValue(familyInfo.motherOccupation)}</span>
                          </div>
                        )}
                        {familyInfo.siblings && (
                          <div className="flex items-center justify-between py-3">
                            <span className="text-gray-600 text-sm flex items-center gap-2"><FiUsers className="text-rose-400 text-sm" /> Siblings</span>
                            <span className="font-semibold text-gray-800 text-sm sm:text-base text-right max-w-[60%] break-words">{showValue(familyInfo.siblings)}</span>
                          </div>
                        )}
                        {familyInfo.familyType && (
                          <div className="flex items-center justify-between py-3">
                            <span className="text-gray-600 text-sm flex items-center gap-2"><FiHome className="text-rose-400 text-sm" /> Family Type</span>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-800 text-sm sm:text-base">{showValue(familyInfo.familyType)}</span>
                              <Tick ok={compareResult.fields?.familyType} />
                            </div>
                          </div>
                        )}
                        {familyInfo.familyStatus && (
                          <div className="flex items-center justify-between py-3">
                            <span className="text-gray-600 text-sm flex items-center gap-2"><FiStar className="text-rose-400 text-sm" /> Family Status</span>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-800 text-sm sm:text-base">{showValue(familyInfo.familyStatus)}</span>
                              <Tick ok={compareResult.fields?.familyStatus} />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* About Family */}
                  {aboutFamily && (
                    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                      <div className="bg-gray-50 px-5 py-3.5 flex items-center gap-2.5 border-b border-gray-200">
                        <FiUsers className="text-rose-500 text-lg" />
                        <h4 className="font-bold text-gray-800 text-base">About Family</h4>
                      </div>
                      <div className="px-5 py-4">
                        <p className="text-gray-700 text-base leading-relaxed whitespace-pre-line">{aboutFamily}</p>
                      </div>
                    </div>
                  )}

                  {/* Partner Preferences & Looking For */}
                  {(partnerInfo.preferredAgeRange || partnerInfo.preferredHeight || partnerInfo.preferredReligion || partnerInfo.lookingFor) && (
                    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                      <div className="bg-gray-50 px-5 py-3.5 flex items-center gap-2.5 border-b border-gray-200">
                        <FiHeart className="text-rose-500 text-lg" />
                        <h4 className="font-bold text-gray-800 text-base">Partner Preferences & Looking For</h4>
                      </div>
                      <div className="px-5 py-3 divide-y divide-gray-100">
                        {partnerInfo.preferredAgeRange && (
                          <div className="flex items-center justify-between py-3">
                            <span className="text-gray-600 text-sm flex items-center gap-2"><FaBirthdayCake className="text-rose-400 text-sm" /> Preferred Age Range</span>
                            <span className="font-semibold text-gray-800 text-sm sm:text-base text-right max-w-[60%] break-words">{showValue(partnerInfo.preferredAgeRange)}</span>
                          </div>
                        )}
                        {partnerInfo.preferredHeight && (
                          <div className="flex items-center justify-between py-3">
                            <span className="text-gray-600 text-sm flex items-center gap-2"><FiUser className="text-rose-400 text-sm" /> Preferred Height</span>
                            <span className="font-semibold text-gray-800 text-sm sm:text-base text-right max-w-[60%] break-words">{showValue(partnerInfo.preferredHeight)}</span>
                          </div>
                        )}
                        {partnerInfo.preferredReligion && (
                          <div className="flex items-center justify-between py-3">
                            <span className="text-gray-600 text-sm flex items-center gap-2"><FaPrayingHands className="text-rose-400 text-sm" /> Preferred Religion</span>
                            <span className="font-semibold text-gray-800 text-sm sm:text-base text-right max-w-[60%] break-words">{showValue(partnerInfo.preferredReligion)}</span>
                          </div>
                        )}
                        {partnerInfo.preferredEducation && (
                          <div className="flex items-center justify-between py-3">
                            <span className="text-gray-600 text-sm flex items-center gap-2"><FaUserGraduate className="text-rose-400 text-sm" /> Preferred Education</span>
                            <span className="font-semibold text-gray-800 text-sm sm:text-base text-right max-w-[60%] break-words">{showValue(partnerInfo.preferredEducation)}</span>
                          </div>
                        )}
                        {partnerInfo.preferredProfession && (
                          <div className="flex items-center justify-between py-3">
                            <span className="text-gray-600 text-sm flex items-center gap-2"><FiBriefcase className="text-rose-400 text-sm" /> Preferred Profession</span>
                            <span className="font-semibold text-gray-800 text-sm sm:text-base text-right max-w-[60%] break-words">{showValue(partnerInfo.preferredProfession)}</span>
                          </div>
                        )}
                        {partnerInfo.preferredLocation && (
                          <div className="flex items-center justify-between py-3">
                            <span className="text-gray-600 text-sm flex items-center gap-2"><FiMapPin className="text-rose-400 text-sm" /> Preferred Location</span>
                            <span className="font-semibold text-gray-800 text-sm sm:text-base text-right max-w-[60%] break-words">{showValue(partnerInfo.preferredLocation)}</span>
                          </div>
                        )}
                        {partnerInfo.preferredIncome && (
                          <div className="flex items-center justify-between py-3">
                            <span className="text-gray-600 text-sm flex items-center gap-2"><FaChartLine className="text-rose-400 text-sm" /> Preferred Income</span>
                            <span className="font-semibold text-gray-800 text-sm sm:text-base text-right max-w-[60%] break-words">{showValue(partnerInfo.preferredIncome)}</span>
                          </div>
                        )}
                        {partnerInfo.lookingFor && (
                          <div className="flex items-center justify-between py-3">
                            <span className="text-gray-600 text-sm flex items-center gap-2"><FiHeart className="text-rose-400 text-sm" /> Looking For</span>
                            <span className="font-semibold text-gray-800 text-sm sm:text-base text-right max-w-[60%] break-words">{showValue(partnerInfo.lookingFor)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Contact Info (Premium) */}
                  {isPremiumUser && (personalInfo.contactNumber || personalInfo.whatsappNumber) && (
                    <div className="bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 rounded-xl p-5">
                      <h4 className="font-bold text-gray-800 text-base mb-4 flex items-center gap-2">
                        <FiMail className="text-rose-500 text-lg" /> Contact Information
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {personalInfo.contactNumber && (
                          <a
                            href={`tel:${personalInfo.contactNumber}`}
                            className="flex items-center gap-4 bg-white rounded-lg p-4 border border-rose-100 hover:shadow-md transition"
                          >
                            <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <FiPhone className="text-rose-500 text-xl" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs text-gray-500">Phone</div>
                              <div className="font-bold text-gray-800 text-base truncate">{showValue(personalInfo.contactNumber)}</div>
                            </div>
                          </a>
                        )}
                        {personalInfo.whatsappNumber && (
                          <a
                            href={`https://wa.me/91${personalInfo.whatsappNumber}?text=${encodeURIComponent("Hello, I saw your profile on Paarsh Matrimony and would like to connect regarding marriage.")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-4 bg-white rounded-lg p-4 border border-rose-100 hover:shadow-md transition"
                          >
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <FaWhatsapp className="text-green-600 text-xl" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs text-gray-500">WhatsApp</div>
                              <div className="font-bold text-gray-800 text-base truncate">{showValue(personalInfo.whatsappNumber)}</div>
                            </div>
                          </a>
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
    );
  };

  PartnerDetailModal.propTypes = PartnerDetailModalPropTypes;

  // ======================== FILTER CHECKBOX GROUP ========================
  const FilterCheckboxGroup = ({ title, icon, options, filterKey, localFilters, onLocalChange }) => (
    <div className="space-y-3">
      <h4 className="font-semibold text-gray-800 text-base flex items-center gap-2">{icon} {title}</h4>
      <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
        {options.map(opt => (
          <label key={opt} className="flex items-center gap-3 cursor-pointer py-2 px-3 rounded-md hover:bg-gray-50 transition">
            <input
              type="checkbox"
              checked={localFilters[filterKey].includes(opt)}
              onChange={() => onLocalChange(filterKey, opt)}
              className="rounded border-gray-300 text-rose-500 focus:ring-rose-400 w-4 h-4"
            />
            <span className="text-base text-gray-700">{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );

  FilterCheckboxGroup.propTypes = {
    title: PropTypes.string.isRequired,
    icon: PropTypes.node.isRequired,
    options: PropTypes.array.isRequired,
    filterKey: PropTypes.string.isRequired,
    localFilters: PropTypes.object.isRequired,
    onLocalChange: PropTypes.func.isRequired
  };

  // ======================== FILTERS MODAL ========================
  const FiltersModal = () => {
    const [localFilters, setLocalFilters] = useState(activeFilters);
    const [tempHomeCity, setTempHomeCity] = useState(activeFilters.homeCity);
    const [tempCurrentCity, setTempCurrentCity] = useState(activeFilters.currentCity);
    const [tempMinAge, setTempMinAge] = useState(activeFilters.minAge);
    const [tempMaxAge, setTempMaxAge] = useState(activeFilters.maxAge);
    const [tempMinHeight, setTempMinHeight] = useState(activeFilters.minHeight);
    const [tempMaxHeight, setTempMaxHeight] = useState(activeFilters.maxHeight);
    const [tempMinWeight, setTempMinWeight] = useState(activeFilters.minWeight);
    const [tempMaxWeight, setTempMaxWeight] = useState(activeFilters.maxWeight);

    useEffect(() => {
      setLocalFilters(activeFilters);
      setTempHomeCity(activeFilters.homeCity);
      setTempCurrentCity(activeFilters.currentCity);
      setTempMinAge(activeFilters.minAge);
      setTempMaxAge(activeFilters.maxAge);
      setTempMinHeight(activeFilters.minHeight);
      setTempMaxHeight(activeFilters.maxHeight);
      setTempMinWeight(activeFilters.minWeight);
      setTempMaxWeight(activeFilters.maxWeight);
    }, [showFilters, activeFilters]);

    const handleLocalFilterChange = (filterType, value) => {
      setLocalFilters(prev => {
        if (Array.isArray(prev[filterType])) {
          const currentArray = prev[filterType];
          if (currentArray.includes(value)) {
            return { ...prev, [filterType]: currentArray.filter(item => item !== value) };
          } else {
            return { ...prev, [filterType]: [...currentArray, value] };
          }
        } else {
          return { ...prev, [filterType]: value };
        }
      });
    };

    const handleInputBlur = (field, value) => {
      handleLocalFilterChange(field, value);
    };

    const handleApplyFilters = () => {
      const updatedFilters = {
        ...localFilters,
        homeCity: tempHomeCity,
        currentCity: tempCurrentCity,
        minAge: tempMinAge,
        maxAge: tempMaxAge,
        minHeight: tempMinHeight,
        maxHeight: tempMaxHeight,
        minWeight: tempMinWeight,
        maxWeight: tempMaxWeight
      };
      setActiveFilters(updatedFilters);
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
      setTempHomeCity('');
      setTempCurrentCity('');
      setTempMinAge('');
      setTempMaxAge('');
      setTempMinHeight('');
      setTempMaxHeight('');
      setTempMinWeight('');
      setTempMaxWeight('');
    };

    const getLocalFilterCount = () => {
      let count = 0;
      Object.keys(localFilters).forEach(key => {
        if (Array.isArray(localFilters[key])) count += localFilters[key].length;
        else if (localFilters[key] && localFilters[key].toString().trim() !== '') count += 1;
      });
      if (tempHomeCity) count++;
      if (tempCurrentCity) count++;
      if (tempMinAge) count++;
      if (tempMaxAge) count++;
      if (tempMinHeight) count++;
      if (tempMaxHeight) count++;
      if (tempMinWeight) count++;
      if (tempMaxWeight) count++;
      return count;
    };

    return (
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
        onClick={() => setShowFilters(false)}
      >
        <div
          className="bg-white w-full sm:max-w-3xl sm:rounded-2xl max-h-[90vh] rounded-2xl mx-4 sm:mx-0 overflow-hidden flex flex-col shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center bg-white sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <FiFilter className="text-rose-500 text-xl" />
              <h3 className="font-bold text-gray-800 text-lg">Filters</h3>
              {getLocalFilterCount() > 0 && <span className="bg-rose-100 text-rose-600 text-xs font-bold px-2 py-1 rounded-full">{getLocalFilterCount()} active</span>}
            </div>
            <button onClick={() => setShowFilters(false)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition">
              <FiX className="text-gray-500 text-xl" />
            </button>
          </div>

          <div className="overflow-y-auto flex-1 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Age Range */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800 text-base flex items-center gap-2">
                  <FaBirthdayCake className="text-rose-500 text-sm" /> Age Range
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    min="18"
                    max="100"
                    value={tempMinAge}
                    onChange={(e) => {
                      let val = e.target.value.replace(/\D/g, "");
                      if (Number(val) > 100) val = "100";
                      setTempMinAge(val.slice(0, 3));
                    }}
                    onBlur={(e) => handleInputBlur("minAge", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent text-base"
                    placeholder="Min"
                  />
                  <input
                    type="number"
                    min="18"
                    max="100"
                    value={tempMaxAge}
                    onChange={(e) => {
                      let val = e.target.value.replace(/\D/g, "");
                      if (Number(val) > 100) val = "100";
                      setTempMaxAge(val.slice(0, 3));
                    }}
                    onBlur={(e) => handleInputBlur("maxAge", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent text-base"
                    placeholder="Max"
                  />
                </div>
              </div>

              {/* Height */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800 text-base flex items-center gap-2">
                  <FiUser className="text-rose-500 text-sm" /> Height (cm)
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    min="100"
                    max="250"
                    value={tempMinHeight}
                    onChange={(e) => {
                      let val = e.target.value.replace(/\D/g, "");
                      if (Number(val) > 250) val = "250";
                      setTempMinHeight(val.slice(0, 3));
                    }}
                    onBlur={(e) => handleInputBlur("minHeight", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent text-base"
                    placeholder="Min"
                  />
                  <input
                    type="number"
                    min="100"
                    max="250"
                    value={tempMaxHeight}
                    onChange={(e) => {
                      let val = e.target.value.replace(/\D/g, "");
                      if (Number(val) > 250) val = "250";
                      setTempMaxHeight(val.slice(0, 3));
                    }}
                    onBlur={(e) => handleInputBlur("maxHeight", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent text-base"
                    placeholder="Max"
                  />
                </div>
              </div>

              {/* Weight */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800 text-base flex items-center gap-2">
                  <FiUser className="text-rose-500 text-sm" /> Weight (kg)
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    min="30"
                    max="200"
                    value={tempMinWeight}
                    onChange={(e) => {
                      let val = e.target.value.replace(/\D/g, "");
                      if (Number(val) > 200) val = "200";
                      setTempMinWeight(val.slice(0, 3));
                    }}
                    onBlur={(e) => handleInputBlur("minWeight", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent text-base"
                    placeholder="Min"
                  />
                  <input
                    type="number"
                    min="30"
                    max="200"
                    value={tempMaxWeight}
                    onChange={(e) => {
                      let val = e.target.value.replace(/\D/g, "");
                      if (Number(val) > 200) val = "200";
                      setTempMaxWeight(val.slice(0, 3));
                    }}
                    onBlur={(e) => handleInputBlur("maxWeight", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent text-base"
                    placeholder="Max"
                  />
                </div>
              </div>

              {/* City filters */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800 text-base flex items-center gap-2">
                  <FiMapPin className="text-rose-500 text-sm" /> Location
                </h4>
                <input
                  type="text"
                  value={tempHomeCity}
                  onChange={(e) => setTempHomeCity(e.target.value)}
                  onBlur={(e) => handleInputBlur("homeCity", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent text-base"
                  placeholder="Home City"
                />
                <input
                  type="text"
                  value={tempCurrentCity}
                  onChange={(e) => setTempCurrentCity(e.target.value)}
                  onBlur={(e) => handleInputBlur("currentCity", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent text-base"
                  placeholder="Current Town"
                />
              </div>

              {/* Checkbox groups */}
              <FilterCheckboxGroup
                title="Marital Status"
                icon={<FiUsers className="text-rose-500 text-sm" />}
                options={filterOptions.maritalStatus}
                filterKey="maritalStatus"
                localFilters={localFilters}
                onLocalChange={handleLocalFilterChange}
              />
              <FilterCheckboxGroup
                title="Education"
                icon={<FaUserGraduate className="text-rose-500 text-sm" />}
                options={filterOptions.education}
                filterKey="education"
                localFilters={localFilters}
                onLocalChange={handleLocalFilterChange}
              />
              <FilterCheckboxGroup
                title="Profession"
                icon={<FiBriefcase className="text-rose-500 text-sm" />}
                options={filterOptions.profession}
                filterKey="profession"
                localFilters={localFilters}
                onLocalChange={handleLocalFilterChange}
              />
              <FilterCheckboxGroup
                title="Annual Package"
                icon={<FaChartLine className="text-rose-500 text-sm" />}
                options={filterOptions.annualPackage}
                filterKey="annualPackage"
                localFilters={localFilters}
                onLocalChange={handleLocalFilterChange}
              />
              <FilterCheckboxGroup
                title="Employment Type"
                icon={<FiBriefcase className="text-rose-500 text-sm" />}
                options={filterOptions.employmentType}
                filterKey="employmentType"
                localFilters={localFilters}
                onLocalChange={handleLocalFilterChange}
              />
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-white sticky bottom-0">
            <button onClick={handleLocalClearFilters} className="text-base text-gray-500 hover:text-gray-700 font-medium">
              Clear all
            </button>
            <button
              onClick={handleApplyFilters}
              className="px-8 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-lg hover:shadow-lg transition font-semibold text-base"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ======================== LOADING STATE ========================
  if (loadingPartners) {
    return (
      <>
        <Navbar />
        <ToastContainer />
        <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center px-4">
          <div className="text-center">
            <div className="relative inline-block mb-6">
              <div className="animate-spin rounded-full h-20 w-20 border-[4px] border-rose-200 border-t-rose-500 mx-auto"></div>
              <FiBookmark className="absolute inset-0 m-auto text-rose-400 text-2xl animate-pulse" />
            </div>
            <p className="text-gray-800 font-bold text-xl">Loading your watchlist...</p>
            <p className="text-gray-500 text-base mt-2">Fetching your saved partners</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // ======================== MAIN RENDER ========================
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

      <div className="min-h-screen bg-gray-50 pt-16">
        {/* Hero Header - matching Matches page */}
        <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white">
          <div className="max-w-7xl mx-auto px-4 py-6 md:py-7">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                  <FiBookmark className="text-rose-200 text-2xl" /> Your Watchlist
                </h1>
                <p className="text-rose-100 text-sm md:text-base mt-1.5">
                  {filteredPartners.length > 0 ? `${filteredPartners.length} saved profiles` : 'Manage your saved profiles'}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {isPremium && (
                  <span className="hidden sm:inline-flex items-center gap-1.5 bg-amber-400/20 text-amber-100 px-4 py-2 rounded-full text-sm font-medium border border-amber-400/30">
                    <FaCrown className="text-amber-300 text-sm" /> Premium
                  </span>
                )}

                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="p-3 bg-white/15 backdrop-blur rounded-lg hover:bg-white/25 transition disabled:opacity-50"
                >
                  <FiRefreshCw className={`text-base ${refreshing ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mt-4">
              {userData?.userEmail && (
                <span className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-sm">
                  <FiMail className="text-xs" />
                  <span className="truncate max-w-[160px] md:max-w-none">
                    {userData.userEmail}
                  </span>
                </span>
              )}

              <span
                className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm ${userData?.isProfilePublished
                    ? 'bg-emerald-400/20 text-emerald-100'
                    : 'bg-amber-400/20 text-amber-100'
                  }`}
              >
                {userData?.isProfilePublished ? (
                  <FiCheck className="text-xs" />
                ) : (
                  <FiAlertCircle className="text-xs" />
                )}
                {userData?.isProfilePublished ? 'Published' : 'Not Published'}
              </span>
            </div>

            {!userData?.isProfilePublished && (
              <div className="mt-4 p-4 bg-white/10 backdrop-blur rounded-xl border border-white/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <p className="text-base flex items-center gap-2">
                  <FiAlertCircle className="flex-shrink-0 text-lg" />
                  Complete and publish your profile first.
                </p>

                <button
                  onClick={() => navigate('/profile#plan')}
                  className="px-5 py-2.5 bg-white text-rose-600 rounded-lg font-semibold text-sm hover:shadow-lg transition whitespace-nowrap"
                >
                  <FiEdit2 className="inline mr-1.5 text-base" />
                  Complete Profile
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">
          {/* Premium Features Section */}
          {isPremium && (
            <>
              {/* Premium Features Collapsible */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setIsExpanded2(!isExpanded2)}
                  className="w-full px-4 sm:px-5 py-3 sm:py-4 flex items-center justify-between hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    {/* Left Icon */}
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-rose-500 to-pink-600 rounded-xl flex items-center justify-center shadow-md shrink-0">
                      <FiStar className="text-white text-lg sm:text-xl" />
                    </div>

                    {/* Text */}
                    <div className="text-left">
                      <h3 className="font-semibold sm:font-bold text-lg sm:text-xl text-gray-800 leading-tight">
                        Premium Features
                      </h3>
                      <p className="text-gray-500 text-sm sm:text-base">
                        Exclusive tools for your journey
                      </p>
                    </div>
                  </div>

                  {/* Right Side */}
                  <div className="flex items-center gap-2 sm:gap-3 ml-2">
                    <span className="hidden xs:inline-flex items-center gap-1 bg-rose-50 text-rose-600 px-2.5 py-1 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap">
                      <FiCheckCircle className="text-xs sm:text-sm" /> Active
                    </span>

                    <svg
                      className={`w-5 h-5 sm:w-6 sm:h-6 text-gray-400 transition-transform duration-300 ${isExpanded2 ? 'rotate-180' : ''
                        }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {isExpanded2 && (
                  <div className="px-5 pb-5 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
                      {[
                        { icon: FiHeart, title: "View All Details", desc: "Complete profile details with contact info" },
                        { icon: HiOutlineSparkles, title: "Marriage Help", desc: "AI-powered marriage planning assistance", action: "marriage" },
                        { icon: FiTag, title: "Extra Discounts", desc: "Up to 25% off premium wedding services", action: "wedding" },
                      ].map((feature, index) => (
                        <div key={index} className="bg-gray-50 rounded-xl p-5 border border-gray-200 hover:shadow-md transition-all duration-300 group">
                          <div className="flex items-start justify-between mb-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-rose-500 to-pink-600 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                              <feature.icon className="text-white text-xl" />
                            </div>
                            {feature.action && (
                              <button
                                onClick={() => {
                                  if (feature.action === "marriage") setOpenMarriage(true);
                                  if (feature.action === "wedding") setOpenWedding(true);
                                }}
                                className="px-4 py-2 rounded-lg font-bold text-sm bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md hover:shadow-lg hover:scale-105 transition-all flex items-center gap-1.5"
                              >
                                Go <FiArrowRight className="text-sm" />
                              </button>
                            )}
                          </div>
                          <h3 className="font-bold text-gray-800 text-base mb-1.5">{feature.title}</h3>
                          <p className="text-gray-500 text-sm">{feature.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Watchlist Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h2 className="font-bold text-gray-800 flex items-center gap-2 text-lg md:text-xl">
                    <FiBookmark className="text-rose-500 text-xl" /> Saved Partners
                    {filteredPartners.length > 0 && <span className="text-gray-500 font-normal">({filteredPartners.length})</span>}
                  </h2>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500 hidden sm:inline">
                      Updated {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <button
                      onClick={() => setShowFilters(true)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-lg transition text-sm font-medium"
                    >
                      <FiFilter className="text-sm" /> Filters
                      {getActiveFilterCount > 0 && (
                        <span className="bg-rose-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center min-w-[20px]">
                          {getActiveFilterCount}
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Active Filters */}
                {getActiveFilterCount > 0 && (
                  <div className="px-5 py-3 bg-rose-50/50 border-b border-rose-200 flex flex-wrap items-center gap-2">
                    {Object.keys(activeFilters).map(key => {
                      if (Array.isArray(activeFilters[key]) && activeFilters[key].length > 0) {
                        return activeFilters[key].map(value => (
                          <span key={`${key}-${value}`} className="inline-flex items-center gap-1.5 bg-white border border-rose-200 px-3 py-1.5 rounded-full text-sm text-rose-600 font-medium">
                            {value}
                            <button onClick={() => handleFilterChange(key, value)} className="text-rose-400 hover:text-rose-600">
                              <FiX className="text-xs" />
                            </button>
                          </span>
                        ));
                      } else if (activeFilters[key] && !Array.isArray(activeFilters[key]) && activeFilters[key].toString().trim() !== '') {
                        const displayKey = key === 'minAge' ? 'Min Age' :
                          key === 'maxAge' ? 'Max Age' :
                            key === 'minHeight' ? 'Min Height' :
                              key === 'maxHeight' ? 'Max Height' :
                                key === 'minWeight' ? 'Min Weight' :
                                  key === 'maxWeight' ? 'Max Weight' :
                                    key === 'homeCity' ? 'Home City' :
                                      key === 'currentCity' ? 'Current Town' : key;
                        const displayValue = key.includes('Height') ? `${activeFilters[key]}cm` :
                          key.includes('Weight') ? `${activeFilters[key]}kg` :
                            key.includes('Age') ? `${activeFilters[key]}y` :
                              activeFilters[key];
                        return (
                          <span key={key} className="inline-flex items-center gap-1.5 bg-white border border-rose-200 px-3 py-1.5 rounded-full text-sm text-rose-600 font-medium">
                            {displayKey}: {displayValue}
                            <button onClick={() => handleFilterChange(key, '')} className="text-rose-400 hover:text-rose-600">
                              <FiX className="text-xs" />
                            </button>
                          </span>
                        );
                      }
                      return null;
                    })}
                    <button onClick={handleClearFilters} className="text-sm text-rose-500 font-semibold ml-auto hover:underline">
                      Clear all
                    </button>
                  </div>
                )}

                {/* Partners Grid */}
                <div className="p-5">
                  {partnersWithScore.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                      {partnersWithScore.map((partner) => {
                        const personalInfo = partner.personalInfo || {};
                        const careerInfo = partner.careerInfo || {};
                        const locationInfo = partner.locationInfo || {};
                        const educationInfo = partner.educationInfo || {};
                        const matchScore = formatMatchScore(partner.match_score);
                        const matchPercentage = calculateMatchPercentage(matchScore);
                        const compareScore = partner.compare?.score || 0;
                        const partnerId = personalInfo?.email || partner?.email || partner?.userEmail;

                        return (
                          <div
                            key={partnerId}
                            className="group cursor-pointer"
                            onClick={() => handlePartnerClick(partner)}
                          >
                            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl hover:border-rose-200 transition-all duration-300 transform hover:-translate-y-1 h-full flex flex-col relative">
                              {/* Score Badge - Shows both Match % and Points */}
                              <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
                                <div className={`px-3 py-1.5 rounded-lg text-sm font-bold shadow-md bg-gradient-to-r ${getScoreColor(matchScore)} text-white text-center`}>
                                  {matchScore}%
                                </div>
                                <div className="px-3 py-1.5 rounded-lg text-sm font-bold shadow-md bg-gradient-to-r from-amber-400 to-orange-500 text-white text-center">
                                  {compareScore}/20
                                </div>
                              </div>

                              {/* Remove Button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const email = personalInfo?.email || partner?.email || partner?.userEmail;
                                  if (!email || email === "undefined" || email === "null") {
                                    toast.error("Could not remove: Invalid email");
                                    return;
                                  }
                                  handleRemoveFromWatchlist(email);
                                }}
                                disabled={removingId === partnerId}
                                className="absolute top-3 left-3 z-10 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center hover:bg-white transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Remove from Watchlist"
                              >
                                <FiTrash2 className="text-rose-400 text-base hover:text-rose-600" />
                              </button>

                              {/* Profile Image */}
                              <div className="h-56 md:h-60 bg-gray-100 relative overflow-hidden flex-shrink-0">
                                {personalInfo.profileImg && personalInfo.profileImg.trim() !== '' ? (
                                  <img
                                    src={personalInfo.profileImg}
                                    alt={personalInfo.fullName}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.nextElementSibling?.classList.remove('hidden');
                                    }}
                                  />
                                ) : null}
                                <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br from-rose-50 to-pink-50 ${personalInfo.profileImg && personalInfo.profileImg.trim() !== '' ? 'hidden' : ''
                                  }`}>
                                  <FiUser className="text-6xl text-rose-300" />
                                </div>
                                <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-black/60 to-transparent"></div>
                                <div className="absolute bottom-0 inset-x-0 p-4">
                                  <h3 className="text-white font-bold text-lg truncate drop-shadow-lg">{showValue(personalInfo.fullName)}</h3>
                                  <div className="flex items-center gap-3 mt-1">
                                    <span className="text-white/90 text-sm">{showValue(personalInfo.age)} yrs</span>
                                    {partner.isOnline && (
                                      <span className="flex items-center gap-1.5 text-emerald-300 text-xs">
                                        <FaCircle className="text-[6px] animate-pulse" /> Online
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Card Body */}
                              <div className="p-4 flex-grow flex flex-col">
                                <div className="space-y-3 flex-grow">
                                  {careerInfo.profession && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                      <FiBriefcase className="text-rose-400 flex-shrink-0 text-sm" />
                                      <span className="text-sm line-clamp-1">{showValue(careerInfo.profession)}</span>
                                    </div>
                                  )}
                                  {educationInfo.highestEducation && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                      <FaUserGraduate className="text-rose-400 flex-shrink-0 text-sm" />
                                      <span className="text-sm line-clamp-1">{showValue(educationInfo.highestEducation)}</span>
                                    </div>
                                  )}
                                  {locationInfo.currentLocation && (
                                    <div className="flex items-center gap-2 text-gray-600">
                                      <FiMapPin className="text-rose-400 flex-shrink-0 text-sm" />
                                      <span className="text-sm line-clamp-1">{showValue(locationInfo.currentLocation)}</span>
                                    </div>
                                  )}
                                </div>

                                {/* Score Bar */}
                                <div className="mt-4 pt-3 border-t border-gray-100">
                                  <div className="flex justify-between items-center mb-1.5">
                                    <span className={`text-sm font-medium ${matchPercentage.color}`}>{matchPercentage.label}</span>
                                    <span className="text-sm font-bold text-gray-700">{compareScore}/20</span>
                                  </div>
                                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full bg-gradient-to-r ${getScoreColor(matchScore)} transition-all duration-500`}
                                      style={{ width: `${(compareScore / 20) * 100}%` }}
                                    ></div>
                                  </div>
                                </div>

                                {/* Action Button */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePartnerClick(partner);
                                  }}
                                  className="mt-4 w-full py-3 rounded-lg text-sm font-semibold transition-all duration-200 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100 flex items-center justify-center gap-2"
                                >
                                  <FiEye className="text-base" /> View Details
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-20">
                      <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-5">
                        <FiBookmark className="text-4xl text-rose-300" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-3">
                        {getActiveFilterCount > 0 ? 'No Partners Match Filters' : 'Your Watchlist is Empty'}
                      </h3>
                      <p className="text-gray-500 text-base mb-8 max-w-sm mx-auto">
                        {getActiveFilterCount > 0
                          ? 'Try adjusting your filters to see more profiles.'
                          : "Start saving profiles from your matches to build your watchlist."}
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        {getActiveFilterCount > 0 && (
                          <button onClick={handleClearFilters} className="px-6 py-3 bg-rose-50 text-rose-600 rounded-lg font-semibold text-base hover:bg-rose-100 transition">
                            Clear Filters
                          </button>
                        )}
                        <button
                          onClick={() => navigate('/matches')}
                          className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-lg font-semibold text-base hover:shadow-lg transition flex items-center justify-center gap-2"
                        >
                          <FiHeart className="text-lg" /> Browse Matches
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Free User Upgrade Prompt */}
          {!isPremium && (
            <div className="max-w-6xl mx-auto">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* HEADER */}
                <div className="relative p-6 sm:p-8 md:p-12 text-center">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 to-pink-600" />

                  <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-rose-50 rounded-full mb-4 sm:mb-6 mx-auto shadow-lg relative">
                    <FiLock className="text-rose-400 text-2xl sm:text-3xl" />
                  </div>

                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                    Upgrade to Premium
                  </h1>

                  <p className="text-gray-500 text-sm sm:text-base max-w-xl mx-auto">
                    Unlock watchlist, date planning, and marriage assistance features
                  </p>
                </div>

                {/* BODY */}
                <div className="p-5 sm:p-7 md:p-9">
                  {/* FEATURES GRID */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
                    {[
                      { icon: FiBookmark, title: "Watchlist Access", description: "Save and manage profiles" },
                      { icon: HiOutlineSparkles, title: "Marriage Planning", description: "Proper guidance" },
                      { icon: FiCalendar, title: "Extra Discount", description: "Get up to 15% off on wedding services" }
                    ].map((feature, index) => (
                      <div key={index} className="bg-gray-50 p-5 sm:p-6 rounded-xl border border-gray-200 hover:shadow-md transition">
                        <div className="w-10 h-10 bg-rose-50 rounded-lg flex items-center justify-center mb-3">
                          <feature.icon className="text-rose-500 text-lg" />
                        </div>
                        <h3 className="font-semibold text-gray-800 text-lg mb-1">
                          {feature.title}
                        </h3>
                        <p className="text-gray-500 text-sm">
                          {feature.description}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* PREMIUM CARD */}
                  <div className="bg-gradient-to-r from-rose-500 to-pink-600 rounded-xl p-5 sm:p-7 md:p-9 text-white">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-5 sm:gap-7">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2.5 rounded-lg bg-white/20">
                            <FiStar className="text-white text-lg" />
                          </div>
                          <div>
                            <h3 className="text-xl sm:text-2xl font-bold">Premium Yearly</h3>
                            <p className="text-white/80 text-sm">Easy payment, annual access</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4">
                          {[
                            "Access all partner information",
                            "Extra discount on wedding services",
                            "Add to Watchlist for Shortlisting",
                            "Marriage Planning Assistance"
                          ].map((item, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <FiCheck size={14} className="text-white" />
                              <span className="text-white text-sm">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="text-center lg:text-right">
                        <div className="mb-3">
                          <div className="flex items-baseline justify-center lg:justify-end">
                            <span className="text-3xl sm:text-4xl font-bold">₹1,999</span>
                            <span className="text-white/80 ml-2 text-sm">/year</span>
                          </div>
                          <p className="text-white/80 text-xs mt-1">Yearly membership</p>
                        </div>

                        <button
                          onClick={() => navigate("/profile#plan")}
                          className="bg-white text-rose-600 font-semibold px-6 py-3 rounded-lg text-sm flex items-center justify-center gap-2 hover:shadow-xl transition w-full lg:w-auto"
                        >
                          <FiStar size={16} /> Upgrade to Premium
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* TESTIMONIAL */}
                  <div className="text-center max-w-xl mx-auto mt-8">
                    <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FiUsers className="text-rose-500 text-lg" />
                    </div>

                    <p className="text-gray-500 italic text-sm mb-1">
                      "Premium features helped me find my perfect match in just 3 weeks!"
                    </p>

                    <p className="font-semibold text-gray-800 text-sm">
                      Paarsh Matrimony Assistant
                    </p>

                    <p className="text-gray-400 text-xs">
                      Trusted by thousands of families
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Chatbot />
      <Footer />

      {/* Marriage Modal */}
      {openMarriage && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-rose-50 to-pink-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-gradient-to-r from-rose-500 to-pink-600">
                    <HiOutlineSparkles className="text-white text-lg" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">Marriage Financial Planner</h2>
                </div>
                <button onClick={() => setOpenMarriage(false)} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                  <FiX size={18} className="text-gray-500" />
                </button>
              </div>
            </div>
            <div className="max-h-[70vh] sm:max-h-[65vh] overflow-y-auto">
              <Marriage />
            </div>
          </div>
        </div>
      )}

      {/* Wedding Modal */}
      {openWedding && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-rose-50 to-pink-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-md bg-gradient-to-r from-rose-500 to-pink-600">
                    <FiTag className="text-white text-lg" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">Wedding Services & Discounts</h2>
                </div>
                <button onClick={() => setOpenWedding(false)} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                  <FiX size={18} className="text-gray-500" />
                </button>
              </div>
            </div>
            <div className="max-h-[70vh] sm:max-h-[65vh] overflow-y-auto">
              <WeddingServices />
            </div>
          </div>
        </div>
      )}

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