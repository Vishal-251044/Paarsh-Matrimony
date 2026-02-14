import { useLocation, useNavigate } from "react-router-dom";
import { useUserContext } from '../context/UserContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Chatbot from '../components/Chatbot';
import { toast, ToastContainer } from 'react-toastify';
import PremiumUpgradeNotification from '../components/PremiumUpgradeNotification';
import 'react-toastify/dist/ReactToastify.css';
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
  FiBarChart2
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
import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";

const Matches = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userProfile, isAuthenticated, logout } = useUserContext();
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState([]);
  const [filteredMatches, setFilteredMatches] = useState([]);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [watchlistEmails, setWatchlistEmails] = useState([]);
  const [isStatsExpanded, setIsStatsExpanded] = useState(false);
  const [isUserInfoExpanded, setIsUserInfoExpanded] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
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
  const [cities, setCities] = useState([]);
  const intervalRef = useRef(null);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

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

  // Safely get user data
  const userData = location.state || userProfile || {};
  const finalData = {
    userEmail: userData?.userEmail || '',
    isProfilePublished: userData?.isProfilePublished || false,
    membershipType: userData?.membershipType || 'free'
  };

  const fetchWatchlist = useCallback(async () => {
    if (!finalData.userEmail) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log("No token found");
        return;
      }

      const response = await axios.get(
        `${BACKEND_URL}/api/watchlist/partners/${finalData.userEmail}`,
        { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );

      if (response.data.success) {
        const emails = response.data.partners || [];
        setWatchlistEmails(emails);
      }
    } catch (err) {
      console.error("Error fetching watchlist:", err);
      if (err.response && err.response.status === 404) {
        setWatchlistEmails([]);
      }
    }
  }, [finalData.userEmail, BACKEND_URL]);

  useEffect(() => {
    if (finalData.userEmail) {
      fetchWatchlist();
    }
  }, [finalData.userEmail, fetchWatchlist]);

  useEffect(() => {
    if (matches.length > 0) {
      const allCities = new Set();
      matches.forEach(match => {
        if (match.location) allCities.add(match.location);
        if (match.currentLocation) allCities.add(match.currentLocation);
      });
      setCities(Array.from(allCities).sort());
    }
  }, [matches]);

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
    return [0, 0];
  };

  const parseHeightToCm = (heightStr) => {
    if (!heightStr) return 0;
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
        return Math.round((Math.floor(num) * 30.48) + ((num - Math.floor(num)) * 12 * 2.54));
      }
      return Math.round(num);
    }
    return 0;
  };

  const applyFilters = useCallback(() => {
    if (matches.length === 0) {
      setFilteredMatches([]);
      return;
    }

    const filtered = matches.filter(match => {
      const age = parseInt(match.age) || 0;
      if (activeFilters.minAge && age < parseInt(activeFilters.minAge)) return false;
      if (activeFilters.maxAge && age > parseInt(activeFilters.maxAge)) return false;
      if (activeFilters.maritalStatus.length > 0 && !activeFilters.maritalStatus.includes(match.maritalStatus)) return false;
      if (activeFilters.education.length > 0 && !activeFilters.education.some(edu => match.education?.includes(edu))) return false;
      if (activeFilters.profession.length > 0 && !activeFilters.profession.some(prof => match.profession?.includes(prof))) return false;

      if (activeFilters.annualPackage.length > 0 && match.annualIncome) {
        const matchIncome = parseIncome(match.annualIncome);
        let passesIncome = false;
        activeFilters.annualPackage.forEach(range => {
          const [min, max] = parseIncomeRange(range);
          if (matchIncome >= min && matchIncome <= max) passesIncome = true;
        });
        if (!passesIncome) return false;
      }

      if (activeFilters.employmentType.length > 0 && !activeFilters.employmentType.includes(match.employmentType)) return false;

      if (activeFilters.homeCity && activeFilters.homeCity.trim() !== '') {
        const searchCity = activeFilters.homeCity.trim().toLowerCase();
        const matchCity = match.location ? match.location.trim().toLowerCase() : '';
        if (!matchCity.includes(searchCity)) return false;
      }

      if (activeFilters.currentCity && activeFilters.currentCity.trim() !== '') {
        const searchCity = activeFilters.currentCity.trim().toLowerCase();
        const matchCity = match.currentLocation ? match.currentLocation.trim().toLowerCase() : '';
        if (!matchCity.includes(searchCity)) return false;
      }

      if (activeFilters.minHeight || activeFilters.maxHeight) {
        const heightInCm = parseHeightToCm(match.height);
        if (activeFilters.minHeight && heightInCm < parseInt(activeFilters.minHeight)) return false;
        if (activeFilters.maxHeight && heightInCm > parseInt(activeFilters.maxHeight)) return false;
      }

      if (activeFilters.minWeight && match.weight && parseInt(match.weight) < parseInt(activeFilters.minWeight)) return false;
      if (activeFilters.maxWeight && match.weight && parseInt(match.weight) > parseInt(activeFilters.maxWeight)) return false;

      return true;
    });

    setFilteredMatches(filtered);
  }, [matches, activeFilters]);

  useEffect(() => {
    applyFilters();
  }, [activeFilters, matches, applyFilters]);

  const fetchMatches = useCallback(async () => {
    // Don't fetch if no email
    if (!finalData.userEmail) {
      setError("User email not available. Please log in again.");
      setLoading(false);
      return;
    }

    // Don't fetch if profile not published
    if (!finalData.isProfilePublished) {
      setMatches([]);
      setFilteredMatches([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        setError("Authentication required. Please log in again.");
        setTimeout(() => {
          logout();
          navigate('/login');
        }, 2000);
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${BACKEND_URL}/api/matches/recommended/${finalData.userEmail}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      if (response.data.success) {
        const matchesData = response.data.matches || [];
        setMatches(matchesData);
        setFilteredMatches(matchesData);
      } else {
        if (response.data.error && response.data.error.includes("No matches")) {
          setMatches([]);
          setFilteredMatches([]);
        } else {
          throw new Error(response.data.error || "Failed to fetch matches");
        }
      }
    } catch (err) {
      console.error("Error fetching matches:", err);

      if (err.code === 'ECONNABORTED') {
        setError("Request timeout. Please try again.");
      } else if (err.response) {
        if (err.response.status === 401) {
          setError("Session expired. Please login again.");
          setTimeout(() => {
            logout();
            navigate('/login');
          }, 2000);
        } else if (err.response.status === 404) {
          setError("Profile not found. Please complete your profile.");
        } else if (err.response.status === 500) {
          setError("Server error. Please try again later.");
        } else {
          setError(err.response.data?.error || `Server error: ${err.response.status}`);
        }
      } else if (err.request) {
        setError("Unable to connect to server. Please check your connection.");
      } else {
        setError(err.message || "Failed to load matches");
      }

      setMatches([]);
      setFilteredMatches([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [finalData.userEmail, finalData.isProfilePublished, logout, navigate, BACKEND_URL]);

  // Initial fetch
  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  // Set up interval for auto-refresh
  useEffect(() => {
    if (finalData.isProfilePublished && !loading) {
      intervalRef.current = setInterval(() => {
        fetchMatches();
      }, 300000); // 5 minutes
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [finalData.isProfilePublished, fetchMatches, loading]);

  const handleMatchClick = (match) => {
    setSelectedMatch(match);
    setShowMatchModal(true);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setError(null);
    fetchMatches();
  };

  const handleAddToWatchlist = async (match) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("Please login to add to watchlist");
        return;
      }

      const userEmail = finalData.userEmail;
      if (!userEmail) {
        toast.error("User email not found");
        return;
      }

      const isAlreadyInWatchlist = watchlistEmails.includes(match.email);

      if (isAlreadyInWatchlist) {
        const response = await axios.delete(
          `${BACKEND_URL}/api/watchlist/remove?user_email=${encodeURIComponent(userEmail)}&partner_email=${encodeURIComponent(match.email)}`,
          { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
        );

        if (response.data.success) {
          setWatchlistEmails(prev => prev.filter(email => email !== match.email));
          toast.success("Removed from watchlist!");
        } else {
          throw new Error(response.data.error || "Failed to remove from watchlist");
        }
      } else {
        const matchScore = parseFloat(formatMatchScore(match));
        if (isNaN(matchScore) || matchScore < 0 || matchScore > 100) {
          toast.error("Invalid match score. Please try again.");
          return;
        }

        const requestData = {
          user_email: userEmail,
          partner_email: match.email,
          match_score: matchScore
        };

        const response = await axios.post(
          `${BACKEND_URL}/api/watchlist/add`,
          requestData,
          { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
        );

        if (response.data && (response.data.id || response.data._id ||
          (response.data.partners && response.data.partners.some(p => p.partner_email === match.email)))) {
          setWatchlistEmails(prev => [...prev, match.email]);
          toast.success("Added to watchlist!");
        } else {
          throw new Error("Failed to add to watchlist");
        }
      }
    } catch (error) {
      console.error("Watchlist error:", error);

      if (error.response) {
        if (error.response.status === 400) {
          toast.error(error.response.data.detail || "Already in watchlist");
        } else if (error.response.status === 422) {
          toast.error("Invalid data format");
        } else {
          toast.error(error.response.data?.error || "Failed to update watchlist");
        }
      } else {
        toast.error("Failed to update watchlist");
      }
    }
  };

  const handleUpgradePlan = () => {
    navigate('/profile#plan');
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'from-emerald-500 to-emerald-600';
    if (score >= 80) return 'from-teal-500 to-teal-600';
    if (score >= 70) return 'from-amber-500 to-amber-600';
    if (score >= 60) return 'from-orange-400 to-orange-500';
    return 'from-gray-400 to-gray-500';
  };

  const formatMatchScore = (match) => {
    const score = match.enhancedScore || match.matchScore || 0;
    if (typeof score === 'string') {
      const cleaned = score.replace('%', '').trim();
      const num = parseFloat(cleaned);
      return isNaN(num) ? 0 : num;
    }
    return typeof score === 'number' ? score : parseFloat(score) || 0;
  };

  const isInWatchlist = (match) => {
    return watchlistEmails.includes(match.email);
  };

  const calculateMatchPercentage = (score) => {
    if (score >= 90) return { label: 'Excellent Match', color: 'text-emerald-600' };
    if (score >= 80) return { label: 'Great Match', color: 'text-teal-600' };
    if (score >= 70) return { label: 'Good Match', color: 'text-amber-600' };
    if (score >= 60) return { label: 'Fair Match', color: 'text-orange-500' };
    return { label: 'Basic Match', color: 'text-gray-500' };
  };

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

  const getActiveFilterCount = () => {
    let count = 0;
    Object.keys(activeFilters).forEach(key => {
      if (Array.isArray(activeFilters[key])) {
        count += activeFilters[key].length;
      } else if (activeFilters[key]) {
        count += 1;
      }
    });
    return count;
  };

  const formatLastSeen = (dateString) => {
    if (!dateString) return "";
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
  };

  const MatchDetailModal = ({ match, onClose, onAddToWatchlist, isPremiumUser }) => {
    if (!match) return null;

    const matchPercentage = calculateMatchPercentage(formatMatchScore(match));
    const isWatched = isInWatchlist(match);
    const score = formatMatchScore(match);

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 overflow-y-auto" onClick={onClose}>
        <div
          className="bg-white w-full md:max-w-5xl md:rounded-2xl md:my-6 min-h-screen md:min-h-0 md:max-h-[92vh] overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative bg-gradient-to-r from-rose-500 to-pink-600 text-white px-5 py-5 md:px-9 md:py-7">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 md:top-5 md:right-5 w-9 h-9 bg-white/20 backdrop-blur rounded-full flex items-center justify-center hover:bg-white/30 transition"
            >
              <FiX className="text-white text-xl" />
            </button>
            <h2 className="text-2xl md:text-3xl font-bold pr-10 truncate">{match.fullName}</h2>
            <div className="flex flex-wrap items-center gap-3 mt-3">
              <span className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-full text-sm font-medium">
                <FaBirthdayCake className="text-xs" /> {match.age} yrs
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-full text-sm font-medium">
                <FiMapPin className="text-xs" /> {match.state}
              </span>
              {match.isOnline ? (
                <span className="inline-flex items-center gap-1.5 bg-emerald-400/30 px-3 py-1.5 rounded-full text-sm font-medium">
                  <FaCircle className="text-[8px] text-emerald-300 animate-pulse" /> Online
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-full text-sm font-medium">
                  <FaClock className="text-xs" /> {formatLastSeen(match.lastSeen)}
                </span>
              )}
              <div className={`ml-auto px-4 py-1.5 rounded-full text-sm font-bold bg-gradient-to-r ${getScoreColor(score)} shadow-lg`}>
                {score}% Match
              </div>
            </div>
          </div>

          <div className="overflow-y-auto max-h-[calc(100vh-120px)] md:max-h-[calc(92vh-120px)]">
            <div className="p-5 md:p-7">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="lg:w-2/5 space-y-5">
                  <div className="rounded-xl overflow-hidden bg-gray-100 aspect-[3/4] relative">
                    {match.profileImg && match.profileImg.trim() !== '' ? (
                      <img
                        src={match.profileImg}
                        alt={match.fullName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br from-rose-100 to-pink-50 ${match.profileImg && match.profileImg.trim() !== '' ? 'hidden' : ''}`}>
                      <FiUser className="text-8xl md:text-9xl text-rose-300" />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    {isPremiumUser ? (
                      <button
                        onClick={() => onAddToWatchlist(match)}
                        className={`flex-1 py-3.5 rounded-xl font-semibold text-base flex items-center justify-center gap-2 transition-all duration-200 ${isWatched
                          ? 'bg-rose-50 text-rose-600 border-2 border-rose-200 hover:bg-rose-100'
                          : 'bg-gradient-to-r from-rose-500 to-pink-600 text-white hover:shadow-lg hover:shadow-rose-200'
                          }`}
                      >
                        {isWatched ? <><FiCheck className="text-lg" /> Saved</> : <><FiBookmark className="text-lg" /> Save Profile</>}
                      </button>
                    ) : (
                      <button
                        onClick={handleUpgradePlan}
                        className="flex-1 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:shadow-lg transition font-semibold text-base flex items-center justify-center gap-2"
                      >
                        <FaCrown className="text-lg" /> Upgrade to Connect
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Height', value: match.height || 'N/A' },
                      { label: 'Weight', value: match.weight || 'N/A' },
                      match.bloodGroup && { label: 'Blood Group', value: match.bloodGroup },
                      match.employmentType && { label: 'Employment', value: match.employmentType },
                    ].filter(Boolean).map((stat, i) => (
                      <div key={i} className="bg-gray-50 rounded-lg p-4 text-center">
                        <div className="text-base font-bold text-gray-800">{stat.value}</div>
                        <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:w-3/5 space-y-5">
                  {[
                    {
                      icon: <FiUser className="text-rose-500 text-lg" />,
                      title: 'Personal',
                      items: [
                        { label: 'Age', value: `${match.age} years`, icon: <FaBirthdayCake className="text-rose-400 text-sm" /> },
                        match.maritalStatus && { label: 'Marital Status', value: match.maritalStatus, icon: <FiUsers className="text-rose-400 text-sm" /> },
                        match.disability && { label: 'Disability', value: match.disability, icon: <FiUsers className="text-rose-400 text-sm" /> },
                      ].filter(Boolean)
                    },
                    {
                      icon: <FaUserGraduate className="text-rose-500 text-lg" />,
                      title: 'Education & Career',
                      items: [
                        match.education && { label: 'Education', value: match.education, icon: <FiBookOpen className="text-rose-400 text-sm" /> },
                        match.profession && { label: 'Profession', value: match.profession, icon: <FiBriefcase className="text-rose-400 text-sm" /> },
                        match.annualIncome && { label: 'Annual Income', value: match.annualIncome, icon: <FaChartLine className="text-rose-400 text-sm" /> },
                      ].filter(Boolean)
                    },
                    (match.religion || match.caste) && {
                      icon: <FaPrayingHands className="text-rose-500 text-lg" />,
                      title: 'Religion',
                      items: [
                        match.religion && { label: 'Religion', value: match.religion },
                        match.caste && { label: 'Caste', value: match.caste },
                      ].filter(Boolean)
                    },
                    {
                      icon: <FiHome className="text-rose-500 text-lg" />,
                      title: 'Location',
                      items: [
                        { label: 'Home City', value: match.location, icon: <FiMapPin className="text-rose-400 text-sm" /> },
                        { label: 'Current Town', value: match.currentLocation, icon: <FiMapPin className="text-rose-400 text-sm" /> },
                      ]
                    },
                  ].filter(Boolean).map((section, si) => (
                    <div key={si} className="border border-gray-100 rounded-xl overflow-hidden">
                      <div className="bg-gray-50 px-5 py-3 flex items-center gap-2">
                        {section.icon}
                        <h4 className="font-semibold text-gray-800 text-base">{section.title}</h4>
                      </div>
                      <div className="px-5 py-3">
                        {section.items.map((item, ii) => (
                          <div key={ii} className={`flex justify-between items-center py-3 ${ii < section.items.length - 1 ? 'border-b border-gray-50' : ''}`}>
                            <span className="text-gray-500 text-base flex items-center gap-2">{item.icon} {item.label}</span>
                            <span className="font-medium text-gray-800 text-base text-right max-w-[55%] truncate">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {isPremiumUser && (match.contactNumber || match.whatsappNumber) && (
                    <div className="bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-100 rounded-xl p-5">
                      <h4 className="font-semibold text-gray-800 text-base mb-4 flex items-center gap-2">
                        <FiMail className="text-rose-500 text-lg" /> Contact Information
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {match.contactNumber && (
                          <a
                            href={`tel:${match.contactNumber}`}
                            className="flex items-center gap-4 bg-white rounded-lg p-4 border border-rose-100 hover:shadow-sm transition"
                          >
                            <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <FiPhone className="text-rose-500 text-lg" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs text-gray-500">Phone</div>
                              <div className="font-bold text-gray-800 text-base truncate">{match.contactNumber}</div>
                            </div>
                          </a>
                        )}
                        {match.whatsappNumber && (
                          <a
                            href={`https://wa.me/91${match.whatsappNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-4 bg-white rounded-lg p-4 border border-rose-100 hover:shadow-sm transition"
                          >
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <FaWhatsapp className="text-green-600 text-lg" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs text-gray-500">WhatsApp</div>
                              <div className="font-bold text-gray-800 text-base truncate">{match.whatsappNumber}</div>
                            </div>
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {!isPremiumUser && (
                    <div className="bg-gradient-to-r from-rose-500 to-pink-600 rounded-xl p-5 text-white">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <FiLock className="text-xl" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-base">Unlock Contact Info</h4>
                          <p className="text-white/80 text-sm">Upgrade to Premium to connect directly</p>
                        </div>
                        <button
                          onClick={handleUpgradePlan}
                          className="px-5 py-2.5 bg-white text-rose-600 rounded-lg hover:bg-rose-50 transition font-bold text-sm whitespace-nowrap"
                        >
                          Upgrade
                        </button>
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

  // Early return for loading state
  if (loading && !refreshing) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center px-4">
          <div className="text-center">
            <div className="relative inline-block mb-6">
              <div className="animate-spin rounded-full h-20 w-20 border-[4px] border-rose-200 border-t-rose-500 mx-auto"></div>
              <FiHeart className="absolute inset-0 m-auto text-rose-400 text-xl animate-pulse" />
            </div>
            <p className="text-gray-700 font-semibold text-xl">Finding your matches...</p>
            <p className="text-gray-400 text-base mt-1">Analyzing compatibility</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Early return for authentication
  if (!isAuthenticated()) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center px-4">
          <div className="text-center max-w-md w-full p-8 bg-white rounded-2xl shadow-lg">
            <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <FiAlertCircle className="text-3xl text-rose-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Login Required</h2>
            <p className="text-gray-500 text-base mb-6">Please log in to view your matches</p>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-3.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl hover:shadow-lg transition font-semibold text-base"
            >
              Go to Login
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const FilterCheckboxGroup = ({ title, icon, options, filterKey }) => (
    <div className="space-y-3">
      <h4 className="font-semibold text-gray-700 text-base flex items-center gap-2">{icon} {title}</h4>
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {options.map(opt => (
          <label key={opt} className="flex items-center gap-2.5 cursor-pointer py-1.5 px-2 rounded-md hover:bg-gray-50 transition">
            <input
              type="checkbox"
              checked={activeFilters[filterKey].includes(opt)}
              onChange={() => handleFilterChange(filterKey, opt)}
              className="rounded border-gray-300 text-rose-500 focus:ring-rose-400 w-4 h-4"
            />
            <span className="text-base text-gray-600">{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );

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

      <div className="min-h-screen bg-rose-50 pt-16">
        <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white">
          <div className="max-w-7xl mx-auto px-4 py-6 md:py-7">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                  <FiHeart className="text-rose-200 text-2xl" /> Your Matches
                </h1>
                <p className="text-rose-100 text-sm md:text-base mt-1.5">
                  {filteredMatches.length > 0 ? `${filteredMatches.length} compatible profiles found` : 'Discover your perfect match'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {finalData.membershipType === 'premium' && (
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
              {finalData.userEmail && (
                <span className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-sm">
                  <FiMail className="text-xs" /> <span className="truncate max-w-[160px] md:max-w-none">{finalData.userEmail}</span>
                </span>
              )}
              <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm ${finalData.isProfilePublished ? 'bg-emerald-400/20 text-emerald-100' : 'bg-amber-400/20 text-amber-100'
                }`}>
                {finalData.isProfilePublished ? <FiCheck className="text-xs" /> : <FiAlertCircle className="text-xs" />}
                {finalData.isProfilePublished ? 'Published' : 'Not Published'}
              </span>
            </div>

            {!finalData.isProfilePublished && (
              <div className="mt-4 p-4 bg-white/10 backdrop-blur rounded-xl border border-white/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <p className="text-base flex items-center gap-2">
                  <FiAlertCircle className="flex-shrink-0 text-lg" /> Complete and publish your profile to get matches.
                </p>
                <button
                  onClick={() => navigate('/profile#plan')}
                  className="px-5 py-2.5 bg-white text-rose-600 rounded-lg font-semibold text-sm hover:shadow-lg transition whitespace-nowrap"
                >
                  <FiEdit2 className="inline mr-1.5 text-base" /> Complete Profile
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">
          {filteredMatches.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: filteredMatches.length, label: 'Total Matches', icon: <FiUsers className="text-rose-400 text-lg" /> },
                { value: filteredMatches.filter(m => formatMatchScore(m) >= 80).length, label: 'High Match', icon: <FiStar className="text-amber-400 text-lg" /> },
                { value: `${filteredMatches.length > 0 ? Math.round(filteredMatches.reduce((acc, m) => acc + formatMatchScore(m), 0) / filteredMatches.length) : 0}%`, label: 'Avg Score', icon: <FiBarChart2 className="text-teal-400 text-lg" /> },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl p-3 md:p-4 shadow-sm border border-gray-100 text-center"
                >
                  <div className="flex justify-center mb-1">{stat.icon}</div>

                  <div className="text-lg md:text-2xl font-semibold text-gray-800">
                    {stat.value}
                  </div>

                  <div className="text-[11px] md:text-xs text-gray-400 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          )}

          {finalData.membershipType === 'premium' && watchlistEmails.length > 0 && (
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center">
                  <FiBookmark className="text-rose-500 text-xl" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-base">Watchlist</h3>
                  <p className="text-sm text-gray-400">{watchlistEmails.length} saved</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/watchlist')}
                className="text-rose-500 hover:text-rose-600 font-semibold text-sm flex items-center gap-1.5"
              >
                View All →
              </button>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="font-bold text-gray-800 flex items-center gap-2 text-base md:text-lg">
                <FiTarget className="text-rose-500 text-lg" /> Suggested Matches
                {filteredMatches.length > 0 && <span className="text-gray-400 font-normal">({filteredMatches.length})</span>}
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400 hidden sm:inline">
                  Updated {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-lg transition text-sm font-medium"
                >
                  <FiFilter className="text-sm" /> Filters
                  {getActiveFilterCount() > 0 && (
                    <span className="bg-rose-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center min-w-[20px]">
                      {getActiveFilterCount()}
                    </span>
                  )}
                </button>
                {finalData.membershipType === 'free' && finalData.isProfilePublished && (
                  <button
                    onClick={handleUpgradePlan}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg text-sm font-semibold hover:shadow-md transition"
                  >
                    <FaCrown className="text-sm" /> Upgrade
                  </button>
                )}
              </div>
            </div>

            {getActiveFilterCount() > 0 && (
              <div className="px-5 py-3 bg-rose-50/50 border-b border-rose-100 flex flex-wrap items-center gap-2">
                {Object.keys(activeFilters).map(key => {
                  if (Array.isArray(activeFilters[key]) && activeFilters[key].length > 0) {
                    return activeFilters[key].map(value => (
                      <span key={`${key}-${value}`} className="inline-flex items-center gap-1.5 bg-white border border-rose-200 px-3 py-1 rounded-full text-xs text-rose-600 font-medium">
                        {value}
                        <button onClick={() => handleFilterChange(key, value)} className="text-rose-400 hover:text-rose-600"><FiX className="text-xs" /></button>
                      </span>
                    ));
                  } else if (activeFilters[key] && !Array.isArray(activeFilters[key])) {
                    const displayKey = key === 'minAge' ? 'Min Age' : key === 'maxAge' ? 'Max Age' : key === 'minHeight' ? 'Min Height' : key === 'maxHeight' ? 'Max Height' : key === 'minWeight' ? 'Min Weight' : key === 'maxWeight' ? 'Max Weight' : key === 'homeCity' ? 'Home City' : key === 'currentCity' ? 'Current Town' : key;
                    const displayValue = key.includes('Height') ? `${activeFilters[key]}cm` : key.includes('Weight') ? `${activeFilters[key]}kg` : key.includes('Age') ? `${activeFilters[key]}y` : activeFilters[key];
                    return (
                      <span key={key} className="inline-flex items-center gap-1.5 bg-white border border-rose-200 px-3 py-1 rounded-full text-xs text-rose-600 font-medium">
                        {displayKey}: {displayValue}
                        <button onClick={() => handleFilterChange(key, '')} className="text-rose-400 hover:text-rose-600"><FiX className="text-xs" /></button>
                      </span>
                    );
                  }
                  return null;
                })}
                <button onClick={handleClearFilters} className="text-xs text-rose-500 font-semibold ml-auto hover:underline">Clear all</button>
              </div>
            )}

            {error && (
              <div className="mx-5 mt-5 p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2.5">
                <FiAlertCircle className="text-red-400 flex-shrink-0 mt-0.5 text-base" />
                <p className="text-red-600 text-base">{error}</p>
              </div>
            )}

            <div className="p-5">
              {finalData.isProfilePublished ? (
                filteredMatches.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {filteredMatches.map((match, index) => {
                      const score = formatMatchScore(match);
                      const matchPercentage = calculateMatchPercentage(score);
                      const isWatched = isInWatchlist(match);

                      return (
                        <div key={match.email || index} className="group cursor-pointer" onClick={() => handleMatchClick(match)}>
                          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-xl hover:border-rose-100 transition-all duration-300 transform hover:-translate-y-0.5 h-full flex flex-col relative">
                            <div className="absolute top-3 right-3 z-10">
                              <div className={`px-2.5 py-1.5 rounded-lg text-sm font-bold shadow-md bg-gradient-to-r ${getScoreColor(score)} text-white`}>
                                {score}%
                              </div>
                            </div>

                            {finalData.membershipType === 'premium' && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleAddToWatchlist(match); }}
                                className="absolute top-3 left-3 z-10 w-9 h-9 bg-white/90 backdrop-blur rounded-full flex items-center justify-center hover:bg-white transition shadow-md"
                                title={isWatched ? "Remove from Watchlist" : "Save"}
                              >
                                <FiHeart className={`text-base ${isWatched ? 'text-rose-500 fill-rose-500' : 'text-gray-400 group-hover:text-rose-400'}`}
                                  style={isWatched ? { fill: 'currentColor' } : {}} />
                              </button>
                            )}

                            <div className="h-56 md:h-60 bg-gray-100 relative overflow-hidden flex-shrink-0">
                              {match.profileImg && match.profileImg.trim() !== '' ? (
                                <img
                                  src={match.profileImg}
                                  alt={match.fullName}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                              ) : null}
                              <div className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br from-rose-50 to-pink-50 ${match.profileImg && match.profileImg.trim() !== '' ? 'hidden' : ''}`}>
                                <FiUser className="text-6xl text-rose-300" />
                              </div>
                              <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-black/50 to-transparent"></div>
                              <div className="absolute bottom-0 inset-x-0 p-4">
                                <h3 className="text-white font-bold text-lg truncate drop-shadow-lg">{match.fullName || "Anonymous"}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-white/90 text-sm">{match.age} yrs</span>
                                  {match.isOnline && (
                                    <span className="flex items-center gap-1.5 text-emerald-300 text-xs">
                                      <FaCircle className="text-[6px] animate-pulse" /> Online
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="p-4 flex-grow flex flex-col">
                              <div className="space-y-3 flex-grow">
                                {match.profession && (
                                  <div className="flex items-center gap-2.5 text-gray-600">
                                    <FiBriefcase className="text-rose-400 flex-shrink-0 text-sm" />
                                    <span className="text-sm line-clamp-1">{match.profession}</span>
                                  </div>
                                )}
                                {match.education && (
                                  <div className="flex items-center gap-2.5 text-gray-600">
                                    <FaUserGraduate className="text-rose-400 flex-shrink-0 text-sm" />
                                    <span className="text-sm line-clamp-1">{match.education}</span>
                                  </div>
                                )}
                                {match.currentLocation && (
                                  <div className="flex items-center gap-2.5 text-gray-600">
                                    <FiMapPin className="text-rose-400 flex-shrink-0 text-sm" />
                                    <span className="text-sm line-clamp-1">{match.currentLocation}</span>
                                  </div>
                                )}
                              </div>

                              <div className="mt-4 pt-4 border-t border-gray-50">
                                <div className="flex justify-between items-center mb-2">
                                  <span className={`text-sm font-medium ${matchPercentage.color}`}>{matchPercentage.label}</span>
                                  <span className="text-sm font-bold text-gray-700">{score}%</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full bg-gradient-to-r ${getScoreColor(score)} transition-all duration-500`}
                                    style={{ width: `${score}%` }}
                                  ></div>
                                </div>
                              </div>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  finalData.membershipType === 'premium' ? handleAddToWatchlist(match) : handleMatchClick(match);
                                }}
                                className="mt-4 w-full py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100 flex items-center justify-center gap-2"
                              >
                                {finalData.membershipType === 'premium'
                                  ? (isWatched ? <><FiCheck className="text-sm" /> Saved</> : <><FiHeart className="text-sm" /> Save Profile</>)
                                  : <><FiEye className="text-sm" /> View Profile</>
                                }
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
                      <FiSearch className="text-4xl text-rose-300" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-3">
                      {getActiveFilterCount() > 0 ? 'No results for these filters' : 'No Matches Found Yet'}
                    </h3>
                    <p className="text-gray-400 text-base mb-6 max-w-md mx-auto">
                      {getActiveFilterCount() > 0 ? 'Try adjusting your filters.' : "We're searching for your perfect match. Check back soon!"}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      {getActiveFilterCount() > 0 && (
                        <button
                          onClick={handleClearFilters}
                          className="px-6 py-3 bg-rose-50 text-rose-600 rounded-lg font-semibold text-base hover:bg-rose-100 transition"
                        >
                          Clear Filters
                        </button>
                      )}
                      <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-lg font-semibold text-base hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {refreshing ? (
                          <>
                            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                            Searching...
                          </>
                        ) : (
                          <>
                            <FiRefreshCw className="text-base" /> Search Again
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )
              ) : (
                <div className="text-center py-20">
                  <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-5">
                    <FiEdit2 className="text-4xl text-rose-300" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">Profile Not Published</h3>
                  <p className="text-gray-400 text-base mb-6">Publish your profile to start seeing matches.</p>
                  <button
                    onClick={() => navigate('/profile#plan')}
                    className="px-7 py-3.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl font-semibold text-base hover:shadow-lg transition"
                  >
                    <FiEdit2 className="inline mr-2 text-lg" /> Publish Your Profile
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowFilters(false)}>
          <div className="bg-white w-full sm:max-w-2xl sm:rounded-2xl max-h-[85vh] rounded-2xl mx-4 sm:mx-0 overflow-hidden flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <div className="flex items-center gap-2.5">
                <FiFilter className="text-rose-500 text-xl" />
                <h3 className="font-bold text-gray-800 text-lg">Filters</h3>
                {getActiveFilterCount() > 0 && <span className="bg-rose-100 text-rose-600 text-xs font-bold px-2.5 py-1 rounded-full">{getActiveFilterCount()} active</span>}
              </div>
              <button onClick={() => setShowFilters(false)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition">
                <FiX className="text-gray-400 text-lg" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-7">
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-700 text-base flex items-center gap-2">
                    <FaBirthdayCake className="text-rose-400 text-sm" /> Age Range
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      min="18"
                      max="100"
                      value={activeFilters.minAge}
                      onChange={(e) => handleFilterChange('minAge', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent text-base"
                      placeholder="Min"
                    />
                    <input
                      type="number"
                      min="18"
                      max="100"
                      value={activeFilters.maxAge}
                      onChange={(e) => handleFilterChange('maxAge', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent text-base"
                      placeholder="Max"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-700 text-base flex items-center gap-2">
                    <FiUser className="text-rose-400 text-sm" /> Height (cm)
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      min="100"
                      max="250"
                      value={activeFilters.minHeight}
                      onChange={(e) => handleFilterChange('minHeight', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent text-base"
                      placeholder="Min"
                    />
                    <input
                      type="number"
                      min="100"
                      max="250"
                      value={activeFilters.maxHeight}
                      onChange={(e) => handleFilterChange('maxHeight', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent text-base"
                      placeholder="Max"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-700 text-base flex items-center gap-2">
                    <FiUser className="text-rose-400 text-sm" /> Weight (kg)
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      min="30"
                      max="200"
                      value={activeFilters.minWeight}
                      onChange={(e) => handleFilterChange('minWeight', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent text-base"
                      placeholder="Min"
                    />
                    <input
                      type="number"
                      min="30"
                      max="200"
                      value={activeFilters.maxWeight}
                      onChange={(e) => handleFilterChange('maxWeight', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent text-base"
                      placeholder="Max"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-700 text-base flex items-center gap-2">
                    <FiMapPin className="text-rose-400 text-sm" /> Location
                  </h4>
                  <input
                    type="text"
                    value={activeFilters.homeCity}
                    onChange={(e) => handleFilterChange("homeCity", e.target.value.replace(/[^a-zA-Z\s]/g, "").replace(/\s{2,}/g, " "))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent text-base"
                    placeholder="Home City"
                  />
                  <input
                    type="text"
                    value={activeFilters.currentCity}
                    onChange={(e) => handleFilterChange("currentCity", e.target.value.replace(/[^a-zA-Z\s]/g, "").replace(/\s{2,}/g, " "))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent text-base mt-3"
                    placeholder="Current Town"
                  />
                </div>

                <FilterCheckboxGroup
                  title="Marital Status"
                  icon={<FiUsers className="text-rose-400 text-sm" />}
                  options={filterOptions.maritalStatus}
                  filterKey="maritalStatus"
                />
                <FilterCheckboxGroup
                  title="Education"
                  icon={<FaUserGraduate className="text-rose-400 text-sm" />}
                  options={filterOptions.education}
                  filterKey="education"
                />
                <FilterCheckboxGroup
                  title="Profession"
                  icon={<FiBriefcase className="text-rose-400 text-sm" />}
                  options={filterOptions.profession}
                  filterKey="profession"
                />
                <FilterCheckboxGroup
                  title="Annual Package"
                  icon={<FaChartLine className="text-rose-400 text-sm" />}
                  options={filterOptions.annualPackage}
                  filterKey="annualPackage"
                />
                <FilterCheckboxGroup
                  title="Employment"
                  icon={<FiBriefcase className="text-rose-400 text-sm" />}
                  options={filterOptions.employmentType}
                  filterKey="employmentType"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-white sticky bottom-0">
              <button
                onClick={handleClearFilters}
                className="px-5 py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg transition text-base font-medium"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="px-6 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-lg hover:shadow-md transition text-base font-semibold"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      <Chatbot />
      <Footer />

      {showMatchModal && selectedMatch && (
        <MatchDetailModal
          match={selectedMatch}
          onClose={() => { setShowMatchModal(false); setSelectedMatch(null); }}
          onAddToWatchlist={handleAddToWatchlist}
          isPremiumUser={finalData.membershipType === 'premium'}
        />
      )}

      {selectedMatch && !showMatchModal && finalData.membershipType === 'free' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setSelectedMatch(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-7 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <FaCrown className="text-3xl text-amber-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Upgrade to Premium</h3>
              <p className="text-gray-400 text-base mb-6">Unlock premium features to connect with matches</p>
              <ul className="text-left space-y-3 mb-7">
                {['Save profiles to watchlist', 'View contact information', 'Priority matching'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-600 text-base">
                    <div className="w-6 h-6 bg-rose-50 rounded-full flex items-center justify-center flex-shrink-0">
                      <FiCheck className="text-rose-500 text-sm" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedMatch(null)}
                  className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition font-medium text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpgradePlan}
                  className="flex-1 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl hover:shadow-lg transition font-semibold text-base"
                >
                  Upgrade Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <PremiumUpgradeNotification
        userMembershipType={finalData?.membershipType || 'free'}
        isProfilePublished={finalData?.isProfilePublished || false}
        onUpgrade={handleUpgradePlan}
        onClose={() => { }}
      />
    </>
  );
};

export default Matches;