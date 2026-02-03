import { useLocation, useNavigate } from "react-router-dom";
import { useUserContext } from '../context/UserContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
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
import { useState, useEffect } from "react";
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
  const [watchlist, setWatchlist] = useState([]);
  const [isStatsExpanded, setIsStatsExpanded] = useState(false);
  const [isUserInfoExpanded, setIsUserInfoExpanded] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    maritalStatus: [],
    education: [],
    bloodGroup: [],
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
    bloodGroup: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-", "Other"],
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

  // Color theme with CSS variables for proper Tailwind usage
  const colors = {
    primary: 'rgb(234, 123, 123)',
    primaryDark: 'rgb(210, 83, 83)',
    primaryDarker: 'rgb(158, 59, 59)',
    light: 'rgb(255, 234, 211)'
  };

  // Priority: 1. location.state, 2. userProfile context, 3. Default
  const userData = location.state || userProfile;

  // If no data in location or context, use default
  const finalData = userData?.userEmail ? userData : {
    userEmail: '',
    isProfilePublished: false,
    membershipType: 'free'
  };

  // Load watchlist from localStorage
  useEffect(() => {
    const savedWatchlist = localStorage.getItem('matrimony_watchlist');
    if (savedWatchlist) {
      setWatchlist(JSON.parse(savedWatchlist));
    }
  }, []);

  // Extract unique cities from matches
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

  // Apply filters whenever activeFilters or matches change
  useEffect(() => {
    applyFilters();
  }, [activeFilters, matches]);

  const applyFilters = () => {
    if (matches.length === 0) {
      setFilteredMatches([]);
      return;
    }

    const filtered = matches.filter(match => {
      // Age filter
      const age = parseInt(match.age);
      if (activeFilters.minAge && age < parseInt(activeFilters.minAge)) return false;
      if (activeFilters.maxAge && age > parseInt(activeFilters.maxAge)) return false;

      // Marital Status filter
      if (activeFilters.maritalStatus.length > 0 &&
        !activeFilters.maritalStatus.includes(match.maritalStatus)) {
        return false;
      }

      // Education filter
      if (activeFilters.education.length > 0 &&
        !activeFilters.education.some(edu => match.education?.includes(edu))) {
        return false;
      }

      // Blood Group filter
      if (activeFilters.bloodGroup.length > 0 &&
        !activeFilters.bloodGroup.includes(match.bloodGroup)) {
        return false;
      }

      // Profession filter
      if (activeFilters.profession.length > 0 &&
        !activeFilters.profession.some(prof => match.profession?.includes(prof))) {
        return false;
      }

      // Annual Package filter (parse range)
      if (activeFilters.annualPackage.length > 0 && match.annualIncome) {
        const matchIncome = parseIncome(match.annualIncome);
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
        !activeFilters.employmentType.includes(match.employmentType)) {
        return false;
      }

      // Home City filter (case-insensitive, trimmed)
      if (activeFilters.homeCity && activeFilters.homeCity.trim() !== '') {
        const searchCity = activeFilters.homeCity.trim().toLowerCase();
        const matchCity = match.location ? match.location.trim().toLowerCase() : '';
        if (!matchCity.includes(searchCity)) return false;
      }

      // Current City filter (case-insensitive, trimmed)
      if (activeFilters.currentCity && activeFilters.currentCity.trim() !== '') {
        const searchCity = activeFilters.currentCity.trim().toLowerCase();
        const matchCity = match.currentLocation ? match.currentLocation.trim().toLowerCase() : '';
        if (!matchCity.includes(searchCity)) return false;
      }

      // Height filter
      if (activeFilters.minHeight || activeFilters.maxHeight) {
        const heightInCm = parseHeightToCm(match.height);
        const minHeight = parseInt(activeFilters.minHeight) || 0;
        const maxHeight = parseInt(activeFilters.maxHeight) || 999;

        if (activeFilters.minHeight && heightInCm < minHeight) return false;
        if (activeFilters.maxHeight && heightInCm > maxHeight) return false;
      }

      // Weight filter
      if (activeFilters.minWeight && match.weight &&
        parseInt(match.weight) < parseInt(activeFilters.minWeight)) return false;
      if (activeFilters.maxWeight && match.weight &&
        parseInt(match.weight) > parseInt(activeFilters.maxWeight)) return false;

      return true;
    });

    setFilteredMatches(filtered);
  };

  // Helper function to parse income from string
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
    // Handle "50+ LPA"
    if (rangeStr.includes('50+')) {
      return [5000000, Infinity];
    }
    return [0, 0];
  };

  // Update the parseHeightToCm function:

  const parseHeightToCm = (heightStr) => {
    if (!heightStr) return 0;

    // Convert to string and lowercase
    const height = heightStr.toString().toLowerCase().trim();

    // If already in cm format (e.g., "170 cm" or "170cm")
    const cmMatch = height.match(/(\d+(?:\.\d+)?)\s*cm/);
    if (cmMatch) {
      return Math.round(parseFloat(cmMatch[1]));
    }

    // If in feet'inches format (e.g., "5'8", "5'8"", "5 ft 8 in")
    const feetInchesMatch = height.match(/(\d+(?:\.\d+)?)\s*(?:['\u2032ft])\s*(\d+(?:\.\d+)?)?\s*(?:["\u2033in]?)?/);
    if (feetInchesMatch) {
      const feet = parseFloat(feetInchesMatch[1]);
      const inches = parseFloat(feetInchesMatch[2] || 0);
      return Math.round((feet * 30.48) + (inches * 2.54));
    }

    // If just a number, assume it's cm
    const justNumber = height.match(/^(\d+(?:\.\d+)?)$/);
    if (justNumber) {
      const num = parseFloat(justNumber[1]);
      // If number is likely in feet (e.g., 5.5 for 5'6")
      if (num < 10) {
        const feet = Math.floor(num);
        const inches = (num - feet) * 12;
        return Math.round((feet * 30.48) + (inches * 2.54));
      }
      // Otherwise assume cm
      return Math.round(num);
    }

    return 0;
  };

  const fetchMatches = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!finalData.userEmail) {
        setError("User email not available. Please log in again.");
        setLoading(false);
        return;
      }

      // Check if profile is published
      if (!finalData.isProfilePublished) {
        setMatches([]);
        setFilteredMatches([]);
        setLoading(false);
        return;
      }

      console.log("Fetching matches for:", finalData.userEmail);

      const response = await axios.get(
        `${BACKEND_URL}/api/matches/recommended/${finalData.userEmail}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30 second timeout
        }
      );

      console.log("Matches API response:", response.data);

      if (response.data.success) {
        // Ensure matches array exists
        const matchesData = response.data.matches || [];

        // Add debug logging
        if (matchesData.length > 0) {
          console.log(`Received ${matchesData.length} matches`);
          console.log("First match sample:", matchesData[0]);
        } else {
          console.log("No matches found");
        }

        setMatches(matchesData);
        setFilteredMatches(matchesData);
      } else {
        // Handle API success but no matches
        if (response.data.error && response.data.error.includes("No matches")) {
          setMatches([]);
          setFilteredMatches([]);
        } else {
          throw new Error(response.data.error || "Failed to fetch matches");
        }
      }
    } catch (err) {
      console.error("Error fetching matches:", err);

      // More detailed error handling
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
  };

  useEffect(() => {
    fetchMatches();

    const interval = setInterval(() => {
      if (finalData.isProfilePublished && !loading) {
        fetchMatches();
      }
    }, 300000);

    return () => clearInterval(interval);
  }, [finalData.userEmail, finalData.isProfilePublished]);

  const handleMatchClick = (match) => {
    setSelectedMatch(match);
    setShowMatchModal(true);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMatches();
  };

  const handleAddToWatchlist = (match) => {
    if (finalData.membershipType === 'free') {
      // Show upgrade modal
      setSelectedMatch(match);
      return;
    }

    const isInWatchlist = watchlist.some(item => item.email === match.email);

    if (isInWatchlist) {
      // Remove from watchlist
      const updatedWatchlist = watchlist.filter(item => item.email !== match.email);
      setWatchlist(updatedWatchlist);
      localStorage.setItem('matrimony_watchlist', JSON.stringify(updatedWatchlist));
    } else {
      // Add to watchlist
      const updatedWatchlist = [...watchlist, { ...match, addedAt: new Date().toISOString() }];
      setWatchlist(updatedWatchlist);
      localStorage.setItem('matrimony_watchlist', JSON.stringify(updatedWatchlist));
    }
  };

  const handleUpgradePlan = () => {
    navigate('/profile');
  };

  // Get match score color class using provided color theme
  const getScoreColor = (score) => {
    if (score >= 90) return 'from-[#9E3B3B] to-[#7A2F2F]';
    if (score >= 80) return 'from-[#D25353] to-[#9E3B3B]';
    if (score >= 70) return 'from-[#EA7B7B] to-[#D25353]';
    if (score >= 60) return 'from-[#EA7B7B]/80 to-[#D25353]/80';
    return 'from-[#EA7B7B]/60 to-[#D25353]/60';
  };

  // Format match score display
  const formatMatchScore = (match) => {
    return match.enhancedScore || match.matchScore || 0;
  };

  // Check if match is in watchlist
  const isInWatchlist = (match) => {
    return watchlist.some(item => item.email === match.email);
  };

  // Calculate match percentage details
  const calculateMatchPercentage = (score) => {
    if (score >= 90) return { label: 'Excellent Match', color: 'text-[#00000]', bgColor: 'bg-[#9E3B3B]/10' };
    if (score >= 80) return { label: 'Great Match', color: 'text-[#00000]', bgColor: 'bg-[#D25353]/10' };
    if (score >= 70) return { label: 'Good Match', color: 'text-[#00000]', bgColor: 'bg-[#EA7B7B]/10' };
    if (score >= 60) return { label: 'Fair Match', color: 'text-[#00000]', bgColor: 'bg-[#EA7B7B]/5' };
    return { label: 'Basic Match', color: 'text-[#00000]', bgColor: 'bg-[#EA7B7B]/5' };
  };

  const handleFilterChange = (filterType, value) => {
    setActiveFilters(prev => {
      if (Array.isArray(prev[filterType])) {
        // For array filters (checkboxes)
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
        // For string filters (input fields)
        return {
          ...prev,
          [filterType]: value
        };
      }
    });
  };

  const handleClearFilters = () => {
    setActiveFilters({
      maritalStatus: [],
      education: [],
      bloodGroup: [],
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

  const MatchDetailModal = ({ match, onClose, onAddToWatchlist, isPremiumUser }) => {
    if (!match) return null;

    const matchPercentage = calculateMatchPercentage(formatMatchScore(match));
    const isWatched = isInWatchlist(match);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-0 md:p-4 z-50 overflow-y-auto">
        <div className="bg-white rounded-none md:rounded-2xl w-full md:max-w-6xl md:w-full max-h-screen md:max-h-[90vh] overflow-hidden shadow-2xl md:my-8">
          {/* Fixed Header with close button and match score - MOBILE OPTIMIZED */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-[#FFEAD3] to-white p-3 md:p-6 border-b border-[#FFEAD3]/30">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3">
              {/* Left side - Profile info */}
              <div className="flex-1">
                <div className="flex justify-between items-start md:block">
                  <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2 truncate pr-2">{match.fullName}</h2>
                  {/* Mobile-only match score */}
                  <div className="md:hidden">
                    <div className={`px-3 py-1 rounded-full font-bold shadow-lg bg-gradient-to-r ${getScoreColor(formatMatchScore(match))} text-white text-center`}>
                      <div className="flex items-center justify-center text-xs">
                        <FiPercent className="mr-1 text-xs" />{formatMatchScore(match)}%
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 md:gap-2 mt-1">
                  <span className="inline-flex items-center gap-1 bg-[#EA7B7B]/10 text-[#9E3B3B] px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs md:text-sm">
                    <FaBirthdayCake className="text-[#EA7B7B] text-xs md:text-sm" /> {match.age}
                  </span>
                  <span className="inline-flex items-center gap-1 bg-[#D25353]/10 text-[#9E3B3B] px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs md:text-sm">
                    <FaVenusMars className="text-[#D25353] text-xs md:text-sm" /> {match.gender}
                  </span>
                  <span className="inline-flex items-center gap-1 bg-[#9E3B3B]/10 text-[#9E3B3B] px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs md:text-sm truncate max-w-[120px] md:max-w-none">
                    <FiMapPin className="text-[#9E3B3B] text-xs md:text-sm" /> {match.state}
                  </span>
                </div>
              </div>

              {/* Right side - Close button and match score */}
              <div className="flex md:flex-col items-center md:items-end justify-between md:justify-start gap-2 md:gap-4">
                {/* Close button */}
                <button
                  onClick={onClose}
                  className="w-8 h-8 md:w-10 md:h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition shadow-lg flex-shrink-0 order-1 md:order-1"
                >
                  <FiX className="text-[#D25353] text-lg md:text-xl" />
                </button>

                {/* Desktop match score - hidden on mobile */}
                <div className="hidden md:block">
                  <div className={`px-10 py-2 rounded-full font-bold shadow-lg bg-gradient-to-r ${getScoreColor(formatMatchScore(match))} text-white text-center`}>
                    <div className="flex items-center justify-center">
                      <FiPercent className="mr-1" />{formatMatchScore(match)}%
                    </div>
                    <div className={`text-xs mt-1 font-medium ${matchPercentage.color}`}>
                      {matchPercentage.label}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable Main Content - UNCHANGED */}
          <div className="overflow-y-auto max-h-[calc(100vh-140px)] md:max-h-[calc(90vh-140px)]">
            <div className="px-4 md:px-8 pb-6 md:pb-8 pt-6">
              <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
                {/* Left Side - Profile Image & Basic Info */}
                <div className="lg:w-2/5">
                  {/* Profile Image */}
                  <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 border border-[#FFEAD3] mb-6">
                    <div className="relative h-64 md:h-80 rounded-xl overflow-hidden bg-gradient-to-br from-[#FFEAD3] to-white mb-6">
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
                      <div className={`absolute inset-0 flex items-center justify-center ${match.profileImg && match.profileImg.trim() !== '' ? 'hidden' : ''}`}>
                        <div className="w-48 h-48 md:w-64 md:h-64 bg-gradient-to-r from-[#FFEAD3] to-[#F5D9C3] rounded-full flex items-center justify-center">
                          <FiUser className="text-8xl md:text-9xl text-[#EA7B7B]" />
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      {isPremiumUser ? (
                        <button
                          onClick={() => onAddToWatchlist(match)}
                          className={`flex-1 px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition ${isWatched
                            ? 'bg-[#FFEAD3] text-[#9E3B3B] hover:bg-[#F5D9C3]'
                            : 'bg-gradient-to-r from-[#EA7B7B] to-[#D25353] text-white hover:opacity-90'
                            }`}
                        >
                          {isWatched ? <FiCheck /> : <FiBookmark />}
                          {isWatched ? 'In Watchlist' : 'Add to Watchlist'}
                        </button>
                      ) : (
                        <button
                          onClick={handleUpgradePlan}
                          className="flex-1 px-4 py-3 bg-gradient-to-r from-[#EA7B7B] to-[#D25353] text-white rounded-lg hover:shadow-lg transition font-medium flex items-center justify-center gap-2"
                        >
                          <FiStar /> Upgrade to View Contact
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="bg-gradient-to-r from-[#FFEAD3] to-white rounded-xl p-4 md:p-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <IoStatsChart className="text-[#D25353]" /> Quick Stats
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded-lg text-center">
                        <div className="text-2xl font-bold text-[#9E3B3B]">{match.height || 'N/A'}</div>
                        <div className="text-xs text-gray-600">Height</div>
                      </div>
                      <div className="bg-white p-3 rounded-lg text-center">
                        <div className="text-2xl font-bold text-[#9E3B3B]">{match.weight || 'N/A'}</div>
                        <div className="text-xs text-gray-600">Weight</div>
                      </div>
                      {match.bloodGroup && (
                        <div className="bg-white p-3 rounded-lg text-center">
                          <div className="text-lg font-bold text-[#9E3B3B] truncate">{match.bloodGroup}</div>
                          <div className="text-xs text-gray-600">Blood Group</div>
                        </div>
                      )}
                      {match.employmentType && (
                        <div className="bg-white p-3 rounded-lg text-center">
                          <div className="text-lg font-bold text-[#9E3B3B] truncate">{match.employmentType}</div>
                          <div className="text-xs text-gray-600">Employment Type</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Side - All Details */}
                <div className="lg:w-3/5">
                  <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 border border-[#FFEAD3]">
                    {/* Profile Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
                      {/* Personal Information */}
                      <div className="bg-gradient-to-br from-[#FFEAD3]/30 to-white p-4 md:p-5 rounded-xl border border-[#FFEAD3]">
                        <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <FiUser className="text-[#D25353]" /> Personal
                        </h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center py-2 border-b border-[#FFEAD3]">
                            <span className="text-gray-600 flex items-center gap-2 text-sm md:text-base">
                              <FaBirthdayCake className="text-[#EA7B7B] flex-shrink-0" /> Age
                            </span>
                            <span className="font-medium text-[#9E3B3B] text-sm md:text-base">{match.age} years</span>
                          </div>
                          {match.maritalStatus && (
                            <div className="flex justify-between items-center py-2">
                              <span className="text-gray-600 flex items-center gap-2 text-sm md:text-base">
                                <FiUsers className="text-[#EA7B7B] flex-shrink-0" /> Marital Status
                              </span>
                              <span className="font-medium text-[#9E3B3B] text-sm md:text-base">{match.maritalStatus}</span>
                            </div>
                          )}
                          {match.disability && (
                            <div className="flex justify-between items-center py-2">
                              <span className="text-gray-600 flex items-center gap-2 text-sm md:text-base">
                                <FiUsers className="text-[#EA7B7B] flex-shrink-0" /> Disability
                              </span>
                              <span className="font-medium text-[#9E3B3B] text-sm md:text-base">{match.disability}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Education & Career */}
                      <div className="bg-gradient-to-br from-[#FFEAD3]/30 to-white p-4 md:p-5 rounded-xl border border-[#FFEAD3]">
                        <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <FaUserGraduate className="text-[#D25353]" /> Education & Career
                        </h4>
                        <div className="space-y-3">
                          {match.education && (
                            <div className="flex justify-between items-center py-2 border-b border-[#FFEAD3]">
                              <span className="text-gray-600 flex items-center gap-2 text-sm md:text-base">
                                <FiBookOpen className="text-[#EA7B7B] flex-shrink-0" /> Education
                              </span>
                              <span className="font-medium text-[#9E3B3B] text-sm md:text-base text-right">{match.education}</span>
                            </div>
                          )}
                          {match.profession && (
                            <div className="flex justify-between items-center py-2">
                              <span className="text-gray-600 flex items-center gap-2 text-sm md:text-base">
                                <FiBriefcase className="text-[#EA7B7B] flex-shrink-0" /> Profession
                              </span>
                              <span className="font-medium text-[#9E3B3B] text-sm md:text-base text-right">{match.profession}</span>
                            </div>
                          )}
                          {match.annualIncome && (
                            <div className="flex justify-between items-center py-2">
                              <span className="text-gray-600 flex items-center gap-2 text-sm md:text-base">
                                <FaChartLine className="text-[#EA7B7B] flex-shrink-0" /> Annual Income
                              </span>
                              <span className="font-medium text-[#9E3B3B] text-sm md:text-base text-right">{match.annualIncome}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Religion & Caste */}
                      {(match.religion || match.caste) && (
                        <div className="bg-gradient-to-br from-[#FFEAD3]/30 to-white p-4 md:p-5 rounded-xl border border-[#FFEAD3]">
                          <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <FaPrayingHands className="text-[#D25353]" /> Religion
                          </h4>
                          <div className="space-y-3">
                            {match.religion && (
                              <div className="flex justify-between items-center py-2 border-b border-[#FFEAD3]">
                                <span className="text-gray-600 text-sm md:text-base">Religion</span>
                                <span className="font-medium text-[#9E3B3B] text-sm md:text-base">{match.religion}</span>
                              </div>
                            )}
                            {match.caste && (
                              <div className="flex justify-between items-center py-2">
                                <span className="text-gray-600 text-sm md:text-base">Caste</span>
                                <span className="font-medium text-[#9E3B3B] text-sm md:text-base">{match.caste}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Location Details */}
                      <div className="bg-gradient-to-br from-[#FFEAD3]/30 to-white p-4 md:p-5 rounded-xl border border-[#FFEAD3]">
                        <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <FiHome className="text-[#D25353]" /> Location
                        </h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center py-2">
                            <span className="text-gray-600 flex items-center gap-2 text-sm md:text-base">
                              <FiMapPin className="text-[#EA7B7B] flex-shrink-0" /> Home City
                            </span>
                            <span className="font-medium text-[#9E3B3B] text-sm md:text-base">{match.location}</span>
                          </div>
                          <div className="flex justify-between items-center py-2">
                            <span className="text-gray-600 flex items-center gap-2 text-sm md:text-base">
                              <FiMapPin className="text-[#EA7B7B] flex-shrink-0" /> Current Town
                            </span>
                            <span className="font-medium text-[#9E3B3B] text-sm md:text-base">{match.currentLocation}</span>
                          </div>
                          {match.nativePlace && (
                            <div className="flex justify-between items-center py-2">
                              <span className="text-gray-600 flex items-center gap-2 text-sm md:text-base">
                                <FiHome className="text-[#EA7B7B] flex-shrink-0" /> Native Place
                              </span>
                              <span className="font-medium text-[#9E3B3B] text-sm md:text-base">{match.nativePlace}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Contact Information (Premium Only) */}
                    {isPremiumUser && (match.contactNumber || match.whatsappNumber) && (
                      <div className="mb-6 bg-gradient-to-r from-[#FFEAD3] to-white border border-[#FFEAD3] p-4 md:p-5 rounded-xl">
                        <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <FiMail className="text-[#D25353]" /> Contact Information
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {match.contactNumber && (
                            <div className="p-3 md:p-4 bg-white rounded-lg border border-[#FFEAD3]">
                              <div className="flex items-center gap-3 md:gap-4">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-[#FFEAD3] to-[#F5D9C3] rounded-full flex items-center justify-center flex-shrink-0">
                                  <FiPhone className="text-xl md:text-2xl text-[#D25353]" />
                                </div>
                                <div className="min-w-0">
                                  <div className="font-medium text-gray-800 text-sm md:text-base">Phone Number</div>
                                  <div className="text-lg font-bold text-[#9E3B3B] mt-1 truncate">{match.contactNumber}</div>
                                </div>
                              </div>
                            </div>
                          )}
                          {match.whatsappNumber && (
                            <div className="p-3 md:p-4 bg-white rounded-lg border border-[#FFEAD3]">
                              <div className="flex items-center gap-3 md:gap-4">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-[#FFEAD3] to-[#F5D9C3] rounded-full flex items-center justify-center flex-shrink-0">
                                  <FaWhatsapp className="text-xl md:text-2xl text-[#D25353]" />
                                </div>
                                <div className="min-w-0">
                                  <div className="font-medium text-gray-800 text-sm md:text-base">WhatsApp Number</div>
                                  <div className="text-lg font-bold text-[#9E3B3B] mt-1 truncate">{match.whatsappNumber}</div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Upgrade Banner for Free Users */}
                    {!isPremiumUser && (
                      <div className="bg-gradient-to-r from-[#EA7B7B] to-[#D25353] p-4 md:p-6 rounded-xl text-white">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-center gap-3 md:gap-4">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                              <FiLock className="text-xl md:text-2xl" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-lg md:text-xl font-bold">Unlock Contact Information</h4>
                              <p className="text-white/90 text-sm md:text-base">
                                Upgrade to Premium to view contact details of your matches
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={handleUpgradePlan}
                            className="px-4 md:px-6 py-2 md:py-3 bg-white text-[#D25353] rounded-lg hover:bg-[#FFEAD3] transition font-bold flex items-center gap-2 whitespace-nowrap justify-center"
                          >
                            <FiStar /> Upgrade Now
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
      </div>
    );
  };

  if (loading && !refreshing) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-[#FFEAD3] to-white pt-20 flex items-center justify-center px-4">
          <div className="text-center max-w-md mx-auto">
            <div className="relative inline-block">
              <div className="animate-spin rounded-full h-24 w-24 border-4 border-[#EA7B7B] border-t-transparent mx-auto"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-16 w-16 bg-gradient-to-r from-[#EA7B7B] to-[#D25353] rounded-full animate-pulse"></div>
              </div>
            </div>
            <p className="mt-8 text-gray-700 text-lg font-medium flex items-center justify-center gap-2">
              <FiSearch className="text-[#D25353]" /> Finding your perfect matches...
            </p>
            <p className="mt-2 text-gray-500 text-sm">Analyzing profiles based on your preferences</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!isAuthenticated()) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center px-4">
          <div className="text-center max-w-md w-full mx-auto p-8 bg-white rounded-2xl shadow-lg">
            <FiAlertCircle className="text-5xl text-[#EA7B7B] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Authentication Required</h2>
            <p className="text-gray-600 mb-6">Please log in to view your matches</p>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-3 bg-gradient-to-r from-[#EA7B7B] to-[#D25353] text-white rounded-lg hover:shadow-lg transition font-medium"
            >
              Go to Login
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-16">
        <div className="container mx-auto px-4 py-6 md:py-8">
          {/* User Info Banner */}
          <div className="bg-gradient-to-r from-[#EA7B7B] to-[#D25353] rounded-2xl shadow-xl mb-6 md:mb-8 text-white overflow-hidden">
            {/* Collapsible Header */}
            <button
              onClick={() => setIsUserInfoExpanded(!isUserInfoExpanded)}
              className="w-full px-4 md:px-6 py-4 flex justify-between items-center transition-colors"
            >
              <div className="flex items-center gap-2">
                <HiOutlineSparkles className="text-xl md:text-2xl" />
                <h1 className="text-xl md:text-2xl font-bold">Your Matches</h1>
              </div>
              <div className="flex items-center gap-3">
                {/* Arrow Icon */}
                <div className={`transform transition-transform duration-300 ${isUserInfoExpanded ? 'rotate-180' : 'rotate-0'}`}>
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </button>

            {/* Collapsible Content */}
            <div className={`transition-all duration-300 ease-in-out ${isUserInfoExpanded ? 'max-h-96' : 'max-h-0 overflow-hidden'}`}>
              <div className="px-4 md:px-6 pb-4 md:pb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div className="mb-4 md:mb-0">
                    <div className="flex flex-wrap gap-2 mb-4">
                      <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-lg">
                        <span className="text-white/90 text-xs md:text-sm">Email:</span>
                        <span className="font-medium text-xs md:text-sm truncate max-w-[150px] md:max-w-none">
                          {finalData.userEmail || "Not available"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-lg">
                        <span className="text-white/90 text-xs md:text-sm">Status:</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${finalData.isProfilePublished ? 'bg-white/30 text-white' : 'bg-white/30 text-white'}`}>
                          {finalData.isProfilePublished ? 'Published' : 'Not Published'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-lg">
                        <span className="text-white/90 text-xs md:text-sm">Plan:</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${finalData.membershipType === 'premium' ? 'bg-white text-[#D25353]' : 'bg-white/30 text-white'}`}>
                          {finalData.membershipType === 'premium' ? <FiStar className="inline mr-1" /> : <FiLock className="inline mr-1" />}
                          {finalData.membershipType === 'premium' ? 'Premium' : 'Free Plan'}
                        </span>
                      </div>
                    </div>

                    {!finalData.isProfilePublished && (
                      <div className="p-3 md:p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                        <p className="flex items-start gap-2 text-sm md:text-base">
                          <FiAlertCircle className="flex-shrink-0 mt-0.5" />
                          Your profile needs to be published to get matches. Complete and publish your profile first.
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {!finalData.isProfilePublished ? (
                      <button
                        onClick={() => navigate('/profile')}
                        className="inline-flex items-center gap-2 px-4 md:px-5 py-2 bg-white text-[#D25353] rounded-lg hover:shadow-lg transition-all font-medium shadow-md text-sm md:text-base"
                      >
                        <FiEdit2 /> Complete Profile
                      </button>
                    ) : (
                      <>
                        {finalData.membershipType === 'free' && (
                          <button
                            onClick={handleUpgradePlan}
                            className="inline-flex items-center gap-2 px-4 md:px-5 py-2 bg-white text-[#D25353] rounded-lg hover:shadow-lg transition-all font-medium shadow-md text-sm md:text-base"
                          >
                            <FiStar /> Upgrade Plan
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
                              <FiRefreshCw /> Refresh
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

          {/* Watchlist Info */}
          {finalData.membershipType === 'premium' && watchlist.length > 0 && (
            <div className="mb-6 p-4 md:p-5 bg-white border border-[#FFEAD3] rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-[#FFEAD3] to-[#F5D9C3] rounded-full flex items-center justify-center flex-shrink-0">
                    <FiBookmark className="text-xl md:text-2xl text-[#D25353]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm md:text-base">Your Watchlist</h3>
                    <p className="text-xs md:text-sm text-gray-600">{watchlist.length} profile(s) saved</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/watchlist')}
                  className="text-[#D25353] hover:text-[#9E3B3B] font-medium flex items-center gap-1 text-sm md:text-base"
                >
                  View All <FiBook className="text-xs md:text-sm" />
                </button>
              </div>
            </div>
          )}

          {/* Statistics - Collapsible */}
          <div className="mt-6 md:mt-8 bg-#FFEAD3 rounded-2xl border border-[#EA7B7B] overflow-hidden">
            {/* Collapsible Header */}
            <button
              onClick={() => setIsStatsExpanded(!isStatsExpanded)}
              className="w-full px-4 md:px-6 py-4 flex justify-between items-center hover:bg-[#FFEAD3]/30 transition-colors"
            >
              <div className="flex items-center gap-2">
                <IoStatsChart className="text-xl md:text-2xl text-[#D25353]" />
                <h3 className="text-lg md:text-xl font-bold text-gray-800">Match Insights</h3>
              </div>
              <div className="flex items-center gap-3">
                {/* Arrow Icon */}
                <div className={`transform transition-transform duration-300 ${isStatsExpanded ? 'rotate-180' : 'rotate-0'}`}>
                  <svg className="w-5 h-5 md:w-6 md:h-6 text-[#9E3B3B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </button>

            {/* Collapsible Content */}
            <div className={`transition-all duration-300 ease-in-out ${isStatsExpanded ? 'max-h-96' : 'max-h-0 overflow-hidden'}`}>
              <div className="px-4 md:px-6 pb-4 md:pb-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                  <div className="bg-white p-3 md:p-5 rounded-xl shadow-sm border border-[#FFEAD3]">
                    <div className="text-2xl md:text-3xl font-bold text-[#9E3B3B] mb-1 md:mb-2">{filteredMatches.length}</div>
                    <div className="text-xs md:text-sm text-gray-600 font-medium flex items-center gap-2">
                      <FiUsers className="text-[#EA7B7B]" /> Total Matches
                    </div>
                  </div>
                  <div className="bg-white p-3 md:p-5 rounded-xl shadow-sm border border-[#FFEAD3]">
                    <div className="text-2xl md:text-3xl font-bold text-[#9E3B3B] mb-1 md:mb-2">
                      {filteredMatches.filter(m => formatMatchScore(m) >= 80).length}
                    </div>
                    <div className="text-xs md:text-sm text-gray-600 font-medium flex items-center gap-2">
                      <FaChartLine className="text-[#EA7B7B]" /> High Compatibility
                    </div>
                  </div>
                  <div className="bg-white p-3 md:p-5 rounded-xl shadow-sm border border-[#FFEAD3]">
                    <div className="text-2xl md:text-3xl font-bold text-[#9E3B3B] mb-1 md:mb-2">
                      {filteredMatches.length > 0
                        ? Math.round(filteredMatches.reduce((acc, m) => acc + formatMatchScore(m), 0) / filteredMatches.length)
                        : 0}%
                    </div>
                    <div className="text-xs md:text-sm text-gray-600 font-medium flex items-center gap-2">
                      <FiBarChart2 className="text-[#EA7B7B]" /> Average Match
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Matches Content */}
          <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 mb-6 md:mb-8 mt-4 md:mt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 md:mb-8">
              <div className="mb-4 sm:mb-0">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <FiTarget className="text-xl md:text-2xl text-[#D25353]" /> Suggested Matches
                  {filteredMatches.length > 0 && (
                    <span className="text-base md:text-lg font-normal text-gray-600 ml-2">
                      ({filteredMatches.length})
                    </span>
                  )}
                </h2>
                <p className="text-gray-600 mt-1 flex items-center gap-2 text-sm md:text-base">
                  <FiFilter className="text-[#EA7B7B]" />
                  {filteredMatches.length > 0
                    ? `Based on your preferences and compatibility`
                    : finalData.isProfilePublished
                      ? "No matches found yet. Check back later!"
                      : "Publish your profile to see matches"}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-xs md:text-sm text-gray-500 bg-gradient-to-r from-[#FFEAD3]/50 to-[#FFEAD3]/30 px-3 py-1.5 rounded-lg flex items-center gap-2">
                  <FiRefreshCw className="text-[#EA7B7B]" />
                  <span className="font-medium">Updated:</span> {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>

                {/* Enhanced Filters Button */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#EA7B7B] to-[#D25353] text-white rounded-lg hover:opacity-90 transition font-medium shadow-md"
                >
                  <FiFilter className="text-sm md:text-base" />
                  <span className="text-sm md:text-base">Enhanced Filters</span>
                  {getActiveFilterCount() > 0 && (
                    <span className="bg-white text-[#D25353] text-xs font-bold px-2 py-0.5 rounded-full">
                      {getActiveFilterCount()}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Enhanced Filters Modal */}
            {showFilters && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                  {/* Header */}
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
                    {getActiveFilterCount() > 0 && (
                      <div className="mt-2 text-sm">
                        {getActiveFilterCount()} filter(s) active
                      </div>
                    )}
                  </div>

                  {/* Scrollable Content */}
                  <div className="overflow-y-auto flex-1 p-4 md:p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                      {/* Age Range */}
                      <div className="bg-gradient-to-br from-[#FFEAD3]/30 to-white p-4 rounded-xl border border-[#FFEAD3]">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <FaBirthdayCake className="text-[#D25353]" /> Age Range
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Min Age</label>
                            <input
                              type="number"
                              min="18"
                              max="100"
                              value={activeFilters.minAge}
                              onChange={(e) => handleFilterChange('minAge', e.target.value)}
                              className="w-full px-3 py-2 border border-[#FFEAD3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EA7B7B] focus:border-transparent"
                              placeholder="18"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Max Age</label>
                            <input
                              type="number"
                              min="18"
                              max="100"
                              value={activeFilters.maxAge}
                              onChange={(e) => handleFilterChange('maxAge', e.target.value)}
                              className="w-full px-3 py-2 border border-[#FFEAD3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EA7B7B] focus:border-transparent"
                              placeholder="100"
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
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Min Height</label>
                            <input
                              type="number"
                              min="100"
                              max="250"
                              value={activeFilters.minHeight}
                              onChange={(e) => handleFilterChange('minHeight', e.target.value)}
                              className="w-full px-3 py-2 border border-[#FFEAD3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EA7B7B] focus:border-transparent"
                              placeholder="140"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Max Height</label>
                            <input
                              type="number"
                              min="100"
                              max="250"
                              value={activeFilters.maxHeight}
                              onChange={(e) => handleFilterChange('maxHeight', e.target.value)}
                              className="w-full px-3 py-2 border border-[#FFEAD3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EA7B7B] focus:border-transparent"
                              placeholder="200"
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
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Min Weight</label>
                            <input
                              type="number"
                              min="30"
                              max="200"
                              value={activeFilters.minWeight}
                              onChange={(e) => handleFilterChange('minWeight', e.target.value)}
                              className="w-full px-3 py-2 border border-[#FFEAD3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EA7B7B] focus:border-transparent"
                              placeholder="40"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Max Weight</label>
                            <input
                              type="number"
                              min="30"
                              max="200"
                              value={activeFilters.maxWeight}
                              onChange={(e) => handleFilterChange('maxWeight', e.target.value)}
                              className="w-full px-3 py-2 border border-[#FFEAD3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EA7B7B] focus:border-transparent"
                              placeholder="120"
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
                                checked={activeFilters.maritalStatus.includes(status)}
                                onChange={() => handleFilterChange('maritalStatus', status)}
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
                                checked={activeFilters.education.includes(edu)}
                                onChange={() => handleFilterChange('education', edu)}
                                className="rounded border-[#FFEAD3] text-[#D25353] focus:ring-[#EA7B7B]"
                              />
                              <span className="text-sm text-gray-700">{edu}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Blood Group */}
                      <div className="bg-gradient-to-br from-[#FFEAD3]/30 to-white p-4 rounded-xl border border-[#FFEAD3]">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <FiAlertCircle className="text-[#D25353]" /> Blood Group
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {filterOptions.bloodGroup.map(group => (
                            <label key={group} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={activeFilters.bloodGroup.includes(group)}
                                onChange={() => handleFilterChange('bloodGroup', group)}
                                className="rounded border-[#FFEAD3] text-[#D25353] focus:ring-[#EA7B7B]"
                              />
                              <span className="text-sm text-gray-700">{group}</span>
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
                                checked={activeFilters.profession.includes(prof)}
                                onChange={() => handleFilterChange('profession', prof)}
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
                                checked={activeFilters.annualPackage.includes(pkg)}
                                onChange={() => handleFilterChange('annualPackage', pkg)}
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
                                checked={activeFilters.employmentType.includes(type)}
                                onChange={() => handleFilterChange('employmentType', type)}
                                className="rounded border-[#FFEAD3] text-[#D25353] focus:ring-[#EA7B7B]"
                              />
                              <span className="text-sm text-gray-700">{type}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Home City */}
                      {/* Home City - Replace the dropdown with input field */}
                      <div className="bg-gradient-to-br from-[#FFEAD3]/30 to-white p-4 rounded-xl border border-[#FFEAD3]">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <FiHome className="text-[#D25353]" /> Home City
                        </h4>
                        <input
                          type="text"
                          value={activeFilters.homeCity}
                          onChange={(e) => handleFilterChange('homeCity', e.target.value)}
                          className="w-full px-3 py-2 border border-[#FFEAD3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EA7B7B] focus:border-transparent text-sm"
                          placeholder="Enter city name..."
                        />
                      </div>

                      {/* Current City - Replace the dropdown with input field */}
                      <div className="bg-gradient-to-br from-[#FFEAD3]/30 to-white p-4 rounded-xl border border-[#FFEAD3]">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <FiMapPin className="text-[#D25353]" /> Current Town
                        </h4>
                        <input
                          type="text"
                          value={activeFilters.currentCity}
                          onChange={(e) => handleFilterChange('currentCity', e.target.value)}
                          className="w-full px-3 py-2 border border-[#FFEAD3] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EA7B7B] focus:border-transparent text-sm"
                          placeholder="Enter town name..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="sticky bottom-0 bg-white border-t border-[#FFEAD3] p-4 flex justify-end gap-3">
                    <button
                      onClick={handleClearFilters}
                      className="px-4 py-2 border border-[#FFEAD3] text-[#9E3B3B] rounded-lg hover:bg-[#FFEAD3] transition font-medium"
                    >
                      Clear All
                    </button>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="px-4 py-2 bg-gradient-to-r from-[#EA7B7B] to-[#D25353] text-white rounded-lg hover:opacity-90 transition font-medium"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Active Filters Display */}
            {getActiveFilterCount() > 0 && (
              <div className="mb-6 p-4 bg-gradient-to-r from-[#FFEAD3] to-white border border-[#FFEAD3] rounded-xl">
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm font-medium text-gray-700">Active filters:</span>
                  {Object.keys(activeFilters).map(key => {
                    if (Array.isArray(activeFilters[key]) && activeFilters[key].length > 0) {
                      return activeFilters[key].map(value => (
                        <span key={`${key}-${value}`} className="inline-flex items-center gap-1 bg-white border border-[#FFEAD3] px-3 py-1 rounded-full text-xs text-[#9E3B3B]">
                          {key}: {value}
                          <button
                            onClick={() => handleFilterChange(key, value)}
                            className="text-[#D25353] hover:text-[#9E3B3B]"
                          >
                            <FiX className="text-xs" />
                          </button>
                        </span>
                      ));
                    } else if (activeFilters[key]) {
                      // Format display names for better readability
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

            {error && (
              <div className="mb-6 p-3 md:p-4 bg-gradient-to-r from-[#FFEAD3] to-white border border-[#FFEAD3] rounded-xl">
                <p className="text-[#D25353] flex items-start gap-2 text-sm md:text-base">
                  <FiAlertCircle className="flex-shrink-0 mt-0.5" />
                  <span><span className="font-medium">Error:</span> {error}</span>
                </p>
              </div>
            )}

            {finalData.isProfilePublished ? (
              <>
                {filteredMatches.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                      {filteredMatches.map((match, index) => {
                        const matchPercentage = calculateMatchPercentage(formatMatchScore(match));
                        const isWatched = isInWatchlist(match);

                        return (
                          <div
                            key={index}
                            className="group cursor-pointer"
                            onClick={() => handleMatchClick(match)}
                          >
                            <div className="border border-[#FFEAD3] rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-white h-full flex flex-col">
                              {/* Match Score Badge */}
                              <div className="absolute top-3 right-3 z-10">
                                <div className={`px-2 py-1 md:px-3 md:py-1.5 rounded-full text-xs md:text-sm font-bold shadow-lg bg-gradient-to-r ${getScoreColor(formatMatchScore(match))} text-white flex items-center gap-1`}>
                                  <FiPercent className="text-xs" />{formatMatchScore(match)}%
                                </div>
                              </div>

                              {/* Watchlist Button - Only for premium users */}
                              {finalData.membershipType === 'premium' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddToWatchlist(match);
                                  }}
                                  className="absolute top-3 left-3 z-10 w-8 h-8 md:w-10 md:h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition shadow-lg"
                                  title={isWatched ? "Remove from Watchlist" : "Add to Watchlist"}
                                >
                                  {isWatched ? (
                                    <FiBookmark className="text-[#D25353] text-sm md:text-base" />
                                  ) : (
                                    <FiBookmark className="text-gray-400 group-hover:text-[#D25353] text-sm md:text-base" />
                                  )}
                                </button>
                              )}

                              {/* Profile Image */}
                              <div className="h-48 md:h-64 bg-gradient-to-br from-[#FFEAD3] to-white relative overflow-hidden flex-shrink-0">
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
                                <div className={`absolute inset-0 flex items-center justify-center ${match.profileImg && match.profileImg.trim() !== '' ? 'hidden' : ''}`}>
                                  <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-r from-[#FFEAD3] to-[#F5D9C3] rounded-full flex items-center justify-center">
                                    <FiUser className="text-4xl md:text-6xl text-[#EA7B7B]" />
                                  </div>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                              </div>

                              {/* Match Details */}
                              <div className="p-4 md:p-5 flex-grow flex flex-col">
                                <div className="mb-3 md:mb-4">
                                  <h3 className="text-lg md:text-xl font-bold text-gray-800 truncate mb-2">
                                    {match.fullName || "Anonymous"}
                                  </h3>
                                  <div className="flex flex-wrap items-center gap-2 mb-2 md:mb-3">
                                    <span className="text-xs md:text-sm text-[#9E3B3B] font-medium flex items-center gap-1 bg-[#FFEAD3] px-2 py-1 rounded">
                                      <FaBirthdayCake className="text-[#EA7B7B] text-xs" /> {match.age} years
                                    </span>
                                    <span className="text-xs md:text-sm text-[#9E3B3B] font-medium flex items-center gap-1 bg-[#FFEAD3] px-2 py-1 rounded">
                                      <FaVenusMars className="text-[#EA7B7B] text-xs" /> {match.gender}
                                    </span>
                                  </div>
                                </div>

                                <div className="space-y-2 md:space-y-3 mb-3 md:mb-4 flex-grow">
                                  {match.profession && (
                                    <div className="flex items-start gap-2 text-gray-600">
                                      <FiBriefcase className="text-[#EA7B7B] flex-shrink-0 mt-0.5 text-xs md:text-sm" />
                                      <span className="text-xs md:text-sm line-clamp-2">{match.profession}</span>
                                    </div>
                                  )}

                                  {match.education && (
                                    <div className="flex items-start gap-2 text-gray-600">
                                      <FaUserGraduate className="text-[#EA7B7B] flex-shrink-0 mt-0.5 text-xs md:text-sm" />
                                      <span className="text-xs md:text-sm line-clamp-2">{match.education}</span>
                                    </div>
                                  )}

                                  {match.currentLocation && (
                                    <div className="flex items-start gap-2 text-gray-600">
                                      <FiMapPin className="text-[#EA7B7B] flex-shrink-0 mt-0.5 text-xs md:text-sm" />
                                      <span className="text-xs md:text-sm line-clamp-2">{match.currentLocation}</span>
                                    </div>
                                  )}
                                </div>

                                {/* Match Score Bar */}
                                <div className="mt-auto">
                                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                                    <span className={`${matchPercentage.color} text-xs`}>{matchPercentage.label}</span>
                                    <span className="font-bold text-[#9E3B3B] text-xs">{formatMatchScore(match)}%</span>
                                  </div>
                                  <div className="h-1.5 md:h-2 bg-[#FFEAD3] rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full bg-gradient-to-r ${getScoreColor(formatMatchScore(match))}`}
                                      style={{ width: `${formatMatchScore(match)}%` }}
                                    ></div>
                                  </div>
                                </div>

                                {/* Action Button */}
                                <div className="mt-3 md:mt-4">
                                  {finalData.membershipType === 'premium' ? (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleAddToWatchlist(match);
                                      }}
                                      className="w-full px-3 py-2 text-xs md:text-sm bg-gradient-to-r from-[#EA7B7B] to-[#D25353] text-white rounded-lg hover:opacity-90 transition font-medium flex items-center justify-center gap-1"
                                    >
                                      {isWatched ? <FiCheck /> : <FiBookmark />}
                                      {isWatched ? 'In Watchlist' : 'Add to Watchlist'}
                                    </button>
                                  ) : (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleMatchClick(match);
                                      }}
                                      className="w-full px-3 py-2 text-xs md:text-sm bg-gradient-to-r from-[#EA7B7B] to-[#D25353] text-white rounded-lg hover:opacity-90 transition font-medium flex items-center justify-center gap-1"
                                    >
                                      <FiEye /> View Profile
                                    </button>
                                  )}
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
                        <FiSearch className="text-4xl md:text-6xl text-[#EA7B7B]" />
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2 md:mb-3">
                        {getActiveFilterCount() > 0 ? 'No Matches Match Filters' : 'No Matches Found Yet'}
                      </h3>
                      <p className="text-gray-600 mb-6 md:mb-8 text-sm md:text-base">
                        {getActiveFilterCount() > 0
                          ? 'Try adjusting your filters to see more matches.'
                          : "We're searching for your perfect match. Check back soon!"}
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
                          onClick={handleRefresh}
                          disabled={refreshing}
                          className="px-4 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-[#EA7B7B] to-[#D25353] text-white rounded-lg hover:shadow-lg transition font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {refreshing ? (
                            <>
                              <div className="animate-spin h-4 w-4 md:h-5 md:w-5 border-2 border-white border-t-transparent rounded-full"></div>
                              Searching...
                            </>
                          ) : (
                            <>
                              <FiRefreshCw /> Search Again
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 md:py-16">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-r from-[#FFEAD3] to-white rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                    <FiEdit2 className="text-4xl md:text-6xl text-[#EA7B7B]" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2 md:mb-3">Profile Not Published</h3>
                  <p className="text-gray-600 mb-6 md:mb-8 text-sm md:text-base">
                    Publish your profile to start seeing matches based on your preferences.
                  </p>
                  <button
                    onClick={() => navigate('/profile')}
                    className="inline-flex items-center gap-2 md:gap-3 px-6 md:px-8 py-2.5 md:py-3.5 bg-gradient-to-r from-[#EA7B7B] to-[#D25353] text-white rounded-lg md:rounded-xl hover:shadow-lg md:hover:shadow-xl transition-all font-medium text-sm md:text-lg"
                  >
                    <FiEdit2 /> Publish Your Profile
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />

      {/* Match Detail Modal */}
      {showMatchModal && selectedMatch && (
        <MatchDetailModal
          match={selectedMatch}
          onClose={() => {
            setShowMatchModal(false);
            setSelectedMatch(null);
          }}
          onAddToWatchlist={handleAddToWatchlist}
          isPremiumUser={finalData.membershipType === 'premium'}
        />
      )}

      {/* Upgrade Required Modal */}
      {selectedMatch && !showMatchModal && finalData.membershipType === 'free' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 md:p-8 shadow-2xl mx-4">
            <div className="text-center">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-[#FFEAD3] to-white rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                <FiLock className="text-2xl md:text-4xl text-[#D25353]" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2 md:mb-3">Premium Feature Required</h3>
              <p className="text-gray-600 mb-4 md:mb-6 text-sm md:text-base">
                This feature is only available for premium members. Upgrade now to unlock:
              </p>
              <ul className="text-left space-y-2 md:space-y-3 mb-6 md:mb-8">
                <li className="flex items-center gap-2 md:gap-3 text-[#9E3B3B] text-sm md:text-base">
                  <FiCheck className="text-[#EA7B7B] flex-shrink-0" />
                  <span>Add profiles to watchlist</span>
                </li>
                <li className="flex items-center gap-2 md:gap-3 text-[#9E3B3B] text-sm md:text-base">
                  <FiCheck className="text-[#EA7B7B] flex-shrink-0" />
                  <span>View contact information</span>
                </li>
                <li className="flex items-center gap-2 md:gap-3 text-[#9E3B3B] text-sm md:text-base">
                  <FiCheck className="text-[#EA7B7B] flex-shrink-0" />
                  <span>Priority matching</span>
                </li>
              </ul>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                <button
                  onClick={() => setSelectedMatch(null)}
                  className="flex-1 px-4 py-2.5 md:py-3 border border-[#FFEAD3] text-[#9E3B3B] rounded-lg hover:bg-[#FFEAD3] transition font-medium text-sm md:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpgradePlan}
                  className="flex-1 px-4 py-2.5 md:py-3 bg-gradient-to-r from-[#EA7B7B] to-[#D25353] text-white rounded-lg hover:shadow-lg transition font-medium text-sm md:text-base"
                >
                  Upgrade Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Matches;