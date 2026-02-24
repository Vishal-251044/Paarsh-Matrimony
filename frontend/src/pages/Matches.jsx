import { useLocation, useNavigate } from "react-router-dom";
import { useUserContext } from '../context/UserContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Chatbot from '../components/Chatbot';
import { toast, ToastContainer } from 'react-toastify';
import PremiumUpgradeNotification from '../components/PremiumUpgradeNotification';
import 'react-toastify/dist/ReactToastify.css';
import { MdCleaningServices } from "react-icons/md";
import Swal from 'sweetalert2';
import { VscVerifiedFilled } from "react-icons/vsc";
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
  FiMessageCircle,
  FiActivity,
  FiSend,
  FiFlag,
  FiTrash2,
  FiMoreVertical,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiDownload,
  FiArchive,
  FiPaperclip,
  FiSmile,
  FiLoader
} from "react-icons/fi";
import { FaCircle, FaClock, FaCheckDouble, FaRegCheckCircle } from "react-icons/fa";
import {
  FaVenusMars,
  FaBirthdayCake,
  FaUserGraduate,
  FaPrayingHands,
  FaWhatsapp,
  FaChartLine,
  FaCrown,
  FaRegPaperPlane,
  FaRegFlag,
  FaRegCommentDots
} from "react-icons/fa";
import { HiOutlineSparkles } from "react-icons/hi";
import { IoStatsChart, IoChatbubblesOutline } from "react-icons/io5";
import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { format } from 'date-fns';

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
  const [activeTab, setActiveTab] = useState('suggested');
  const [activityData, setActivityData] = useState({
    sentInterests: [],
    receivedInterests: [],
  });
  const [chatData, setChatData] = useState({
    conversations: [],
    activeConversation: null,
    messages: [],
    messageTimeouts: {}
  });
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [reportTarget, setReportTarget] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [interestMessage, setInterestMessage] = useState('');
  const [interestTarget, setInterestTarget] = useState(null);
  const [interestLoading, setInterestLoading] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [messageLoading, setMessageLoading] = useState(false);
  const [showClearChatConfirm, setShowClearChatConfirm] = useState(false);
  const [chatToClear, setChatToClear] = useState(null);
  const [clearChatLoading, setClearChatLoading] = useState(false);
  const [acceptInterestLoading, setAcceptInterestLoading] = useState({});
  const [rejectInterestLoading, setRejectInterestLoading] = useState({});
  const messagesEndRef = useRef(null);
  const chatIntervalRef = useRef(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
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
  const [wsConnected, setWsConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [verifiedEmails, setVerifiedEmails] = useState({});
  const MAX_RECONNECT_ATTEMPTS = 5;

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
  const WS_URL = BACKEND_URL.replace('http', 'ws');

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

  const reportReasons = [
    "Fake Profile",
    "Inappropriate Content",
    "Harassment",
    "Scam",
    "Wrong Information",
    "Other"
  ];

  // Safely get user data
  const userData = location.state || userProfile || {};

  // Extract email from various possible locations
  const userEmail = userData?.userEmail ||
    userData?.email ||
    userData?.user?.email ||
    '';

  // Extract name from various possible locations or create from email
  let userName = userData?.fullName ||
    userData?.name ||
    userData?.user?.fullName ||
    userData?.user?.name || '';

  // If no name, create one from email
  if (!userName && userEmail) {
    userName = userEmail.split('@')[0] || "User";
  }

  const finalData = {
    userEmail: userEmail,
    isProfilePublished: userData?.isProfilePublished || false,
    membershipType: userData?.membershipType || userData?.user?.membershipType || 'free',
    fullName: userName,
    profileImg: userData?.profileImg || userData?.profile_image || userData?.user?.profileImg || ''
  };

  const isPremiumUser = finalData.membershipType === 'premium';

  // ============== FUNCTION DEFINITIONS ==============

  // Fetch chat conversations
  const fetchChatConversations = useCallback(async () => {
    if (!finalData.userEmail) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(
        `${BACKEND_URL}/api/chat/user/${finalData.userEmail}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setChatData(prev => ({
          ...prev,
          conversations: response.data.conversations || []
        }));
      }
    } catch (err) {
      // Silent error
    }
  }, [finalData.userEmail, BACKEND_URL]);

  // Fetch activity data (interests)
  const fetchActivityData = useCallback(async () => {
    if (!finalData.userEmail) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(
        `${BACKEND_URL}/api/activity/user/${finalData.userEmail}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setActivityData({
          sentInterests: response.data.sent_interests || [],
          receivedInterests: response.data.received_interests || [],
        });
      }
    } catch (err) {
      // Silent error
    }
  }, [finalData.userEmail, BACKEND_URL]);

  // Fetch matches function
  const fetchMatches = useCallback(async () => {
    if (!finalData.userEmail) {
      setError("User email not available. Please log in again.");
      setLoading(false);
      return;
    }

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
        await fetchVerificationStatus(matchesData);
      } else {
        if (response.data.error && response.data.error.includes("No matches")) {
          setMatches([]);
          setFilteredMatches([]);
        } else {
          throw new Error(response.data.error || "Failed to fetch matches");
        }
      }
    } catch (err) {
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

  // Fetch verification status for all matches
  const fetchVerificationStatus = useCallback(async (matchesList) => {
    if (!matchesList || matchesList.length === 0) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Extract all emails from matches
      const emails = matchesList.map(match => match.email).filter(Boolean);

      if (emails.length === 0) return;

      const response = await axios.post(
        `${BACKEND_URL}/api/verification/bulk-check`,
        emails,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data) {
        setVerifiedEmails(response.data);
      }
    } catch (err) {
      // Silent error - don't show toast for verification status
      console.error("Error fetching verification status:", err);
    }
  }, [BACKEND_URL]);

  // Fetch watchlist (Premium only)
  const fetchWatchlist = useCallback(async () => {
    if (!finalData.userEmail || !isPremiumUser) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(
        `${BACKEND_URL}/api/watchlist/partners/${finalData.userEmail}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        const emails = response.data.partners || [];
        setWatchlistEmails(emails);
      }
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setWatchlistEmails([]);
      }
    }
  }, [finalData.userEmail, BACKEND_URL, isPremiumUser]);

  // Fetch messages for a conversation
  const fetchChatMessages = useCallback(async (conversationId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(
        `${BACKEND_URL}/api/chat/messages/${conversationId}?user_email=${encodeURIComponent(finalData.userEmail)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setChatData(prev => ({
          ...prev,
          messages: response.data.messages || []
        }));
      }
    } catch (err) {
      // Silent error
    }
  }, [BACKEND_URL, finalData.userEmail]);

  // ============== WEBSOCKET CONNECTION ==============

  // WebSocket connection for chat
  const connectWebSocket = useCallback(() => {
    if (!finalData.userEmail || wsRef.current?.readyState === WebSocket.OPEN) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    // Close existing connection if any
    if (wsRef.current) {
      wsRef.current.close();
    }

    // Include token in WebSocket connection
    const ws = new WebSocket(`${WS_URL}/ws/chat/${finalData.userEmail}?token=${token}`);

    ws.onopen = () => {
      setWsConnected(true);
      setReconnectAttempts(0);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case 'connection_established':
            setWsConnected(true);
            break;

          case 'new_message':
            if (chatData.activeConversation?._id === data.conversation_id) {
              setChatData(prev => {
                const messageExists = prev.messages.some(m =>
                  m._id === data.message._id ||
                  (m.content === data.message.content &&
                    Math.abs(new Date(m.created_at) - new Date(data.message.created_at)) < 1000)
                );

                if (!messageExists) {
                  return {
                    ...prev,
                    messages: [...prev.messages, { ...data.message, received: true }]
                  };
                }
                return prev;
              });
            }
            fetchChatConversations();
            if (data.message?.sender_email !== finalData.userEmail) {
              toast.info(`New message from ${data.sender_name || 'someone'}`);
            }
            break;

          case 'message_sent':
            setChatData(prev => {
              if (prev.messageTimeouts?.[data.temp_id]) {
                clearTimeout(prev.messageTimeouts[data.temp_id]);
              }

              return {
                ...prev,
                messages: prev.messages.map(msg =>
                  msg._id === data.temp_id
                    ? {
                      ...data.message,
                      _id: data.message._id,
                      sending: false,
                      sent: true
                    }
                    : msg
                ),
                messageTimeouts: { ...prev.messageTimeouts, [data.temp_id]: undefined }
              };
            });
            fetchChatConversations();
            break;

          case 'messages_read':
            setChatData(prev => ({
              ...prev,
              messages: prev.messages.map(msg =>
                !msg.read ? { ...msg, read: true } : msg
              )
            }));
            break;

          case 'interest_accepted':
            toast.success(`${data.sender_name} accepted your interest!`);
            fetchActivityData();
            fetchChatConversations();
            break;

          case 'interest_received':
            toast.info(`You received a new interest from ${data.sender_name}`);
            fetchActivityData();
            break;

          case 'interest_sent_ack':
            break;

          case 'report_submitted_ack':
            break;

          case 'pong':
            break;

          case 'error':
            if (data.message && !data.message.includes('Unknown message type')) {
              toast.error(data.message);
            }
            break;

          default:
            break;
        }
      } catch (error) {
        // Silent error
      }
    };

    ws.onerror = () => {
      setWsConnected(false);
    };

    ws.onclose = (event) => {
      setWsConnected(false);

      if (event.code !== 1000 && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        const timeout = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);

        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }

        reconnectTimeoutRef.current = setTimeout(() => {
          setReconnectAttempts(prev => prev + 1);
          connectWebSocket();
        }, timeout);
      }
    };

    wsRef.current = ws;

    const heartbeatInterval = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000);

    return () => {
      clearInterval(heartbeatInterval);
    };
  }, [finalData.userEmail, WS_URL, chatData.activeConversation, fetchChatConversations, reconnectAttempts]);

  // ============== EFFECTS ==============

  // Initialize WebSocket connection
  useEffect(() => {
    if (finalData.userEmail) {
      connectWebSocket();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close(1000, "Component unmounting");
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [finalData.userEmail, connectWebSocket]);

  // Fetch data on mount and when user changes
  useEffect(() => {
    if (finalData.userEmail) {
      fetchWatchlist();
      fetchActivityData();
      fetchChatConversations();
    }
  }, [finalData.userEmail, fetchWatchlist, fetchActivityData, fetchChatConversations]);

  // Update cities from matches
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

  // Set up polling for new messages when chat is active (fallback if WebSocket fails)
  useEffect(() => {
    if (chatData.activeConversation && showChatModal && !wsConnected) {
      chatIntervalRef.current = setInterval(() => {
        fetchChatMessages(chatData.activeConversation._id);
      }, 5000);
    }

    return () => {
      if (chatIntervalRef.current) {
        clearInterval(chatIntervalRef.current);
      }
    };
  }, [chatData.activeConversation, showChatModal, fetchChatMessages, wsConnected]);

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatData.messages]);

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

  // ============== HELPER FUNCTIONS ==============

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

  const handleMatchClick = (match) => {
    setSelectedMatch(match);
    setShowMatchModal(true);
  };

  useEffect(() => {
    applyFilters();
  }, [activeFilters, matches, applyFilters]);

  const handleRefresh = () => {
    setRefreshing(true);
    setError(null);
    fetchMatches();
    fetchActivityData();
    fetchChatConversations();
  };

  const handleAddToWatchlist = async (match) => {
    if (!isPremiumUser) {
      toast.error("Please upgrade to Premium to use watchlist");
      return;
    }

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

          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
              type: 'watchlist_updated',
              action: 'add',
              partner_email: match.email
            }));
          }
        } else {
          throw new Error("Failed to add to watchlist");
        }
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 400) {
          toast.error(error.response.data.detail || "Already in watchlist");
        } else if (error.response.status === 403) {
          toast.error("Premium membership required");
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

  const handleSendInterest = async () => {
    if (!interestTarget) return;

    setInterestLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("Please login to send interest");
        setInterestLoading(false);
        return;
      }

      if (!finalData.userEmail || !interestTarget.email) {
        toast.error("Missing user information");
        setInterestLoading(false);
        return;
      }

      const senderName = finalData.fullName || finalData.userEmail.split('@')[0] || "User";
      const receiverName = interestTarget.fullName || interestTarget.email.split('@')[0] || "User";

      const requestData = {
        sender_email: finalData.userEmail,
        receiver_email: interestTarget.email,
        sender_name: senderName,
        receiver_name: receiverName,
        message: interestMessage || "",
        sender_profile_img: finalData.profileImg || ""
      };

      const response = await axios.post(
        `${BACKEND_URL}/api/activity/interest`,
        requestData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        toast.success("Interest sent successfully!");
        setShowInterestModal(false);
        setInterestMessage('');
        setInterestTarget(null);
        fetchActivityData();

        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'interest_sent',
            receiver_email: interestTarget.email,
            receiver_name: receiverName,
            message: interestMessage
          }));
        }
      }
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data?.detail || error.response.data?.error || "Failed to send interest");
      } else if (error.request) {
        toast.error("No response from server");
      } else {
        toast.error(error.message || "Failed to send interest");
      }
    } finally {
      setInterestLoading(false);
    }
  };

  const handleReportProfile = async () => {
    if (!reportTarget || !reportReason) {
      toast.error("Please select a reason");
      return;
    }

    setReportLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("Please login to report");
        setReportLoading(false);
        return;
      }

      if (!finalData.userEmail) {
        toast.error("Your email information is missing. Please try logging in again.");
        setReportLoading(false);
        return;
      }

      if (!reportTarget?.email) {
        toast.error("Target user information is incomplete");
        setReportLoading(false);
        return;
      }

      if (!reportTarget?.fullName) {
        toast.error("Target user information is incomplete");
        setReportLoading(false);
        return;
      }

      const reporterName = finalData.fullName || finalData.userEmail.split('@')[0] || "User";

      const requestData = {
        reporter_email: finalData.userEmail,
        reported_email: reportTarget.email,
        reporter_name: reporterName,
        reported_name: reportTarget.fullName,
        reason: reportReason,
        description: reportDescription || "",
        reporter_membership: finalData.membershipType || "free"
      };

      const response = await axios.post(
        `${BACKEND_URL}/api/activity/report`,
        requestData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        toast.success("Report submitted successfully!");
        setShowReportModal(false);
        setReportReason('');
        setReportDescription('');
        setReportTarget(null);
        fetchActivityData();

        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'report_submitted',
            reported_email: reportTarget.email,
            reason: reportReason
          }));
        }
      }
    } catch (error) {
      if (error.response) {
        const errorMessage = error.response.data?.detail ||
          error.response.data?.error ||
          "Failed to submit report";

        if (errorMessage.includes("already reported")) {
          toast.error("You have already reported this profile. You cannot report the same person multiple times.");
        } else {
          toast.error(errorMessage);
        }
      } else if (error.request) {
        toast.error("No response from server. Please check your connection.");
      } else {
        toast.error(error.message || "Failed to submit report");
      }
    } finally {
      setReportLoading(false);
    }
  };

  const handleAcceptInterest = async (interest) => {
    if (!interest || !interest._id) {
      toast.error("Invalid interest");
      return;
    }

    setAcceptInterestLoading(prev => ({ ...prev, [interest._id]: true }));

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("Please login to accept interest");
        setAcceptInterestLoading(prev => ({ ...prev, [interest._id]: false }));
        return;
      }

      const response = await axios.put(
        `${BACKEND_URL}/api/activity/interest/${interest._id}/accept`,
        { accepter_email: finalData.userEmail },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        toast.success("Interest accepted! You can now chat.");
        fetchActivityData();
        fetchChatConversations();

        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'interest_accepted',
            conversation_id: response.data.conversation_id,
            receiver_email: interest.sender_email,
            sender_name: finalData.fullName,
            sender_email: finalData.userEmail
          }));
        }
      }
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data?.detail || error.response.data?.error || "Failed to accept interest");
      } else if (error.request) {
        toast.error("No response from server");
      } else {
        toast.error(error.message || "Failed to accept interest");
      }
    } finally {
      setAcceptInterestLoading(prev => ({ ...prev, [interest._id]: false }));
    }
  };

  const handleRejectInterest = async (interest) => {
    if (!interest || !interest._id) {
      toast.error("Invalid interest");
      return;
    }

    setRejectInterestLoading(prev => ({ ...prev, [interest._id]: true }));

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("Please login to reject interest");
        setRejectInterestLoading(prev => ({ ...prev, [interest._id]: false }));
        return;
      }

      const response = await axios.put(
        `${BACKEND_URL}/api/activity/interest/${interest._id}/reject`,
        { rejecter_email: finalData.userEmail },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        toast.success("Interest rejected");
        fetchActivityData();

        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'interest_rejected',
            receiver_email: interest.sender_email,
            sender_name: finalData.fullName
          }));
        }
      }
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data?.detail || error.response.data?.error || "Failed to reject interest");
      } else if (error.request) {
        toast.error("No response from server");
      } else {
        toast.error(error.message || "Failed to reject interest");
      }
    } finally {
      setRejectInterestLoading(prev => ({ ...prev, [interest._id]: false }));
    }
  };

  // Fetch profile data from backend
  const fetchProfileData = async (email, fromActivityTab = false) => {
    if (!email) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        Swal.fire({
          icon: 'error',
          title: 'Authentication Error',
          text: 'Please login to view profile',
          confirmButtonColor: '#e11d48'
        });
        return;
      }

      const response = await axios.get(
        `${BACKEND_URL}/api/profile/${email}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        const profileData = response.data.profile || response.data.user || response.data;

        if (!profileData || Object.keys(profileData).length === 0) {
          Swal.fire({
            icon: 'info',
            title: 'Profile Not Found',
            text: 'The profile you are looking for does not exist.',
            confirmButtonColor: '#e11d48',
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: true
          });
          setLoading(false);
          return;
        }

        // Map the data to match the expected format for ActivityProfileModal
        const mappedProfile = {
          email: profileData.email || email,
          fullName: profileData.fullName || profileData.name || profileData.full_name || '',
          profileImg: profileData.profileImg || profileData.profile_image || profileData.profile_img || '',
          age: profileData.age || '',
          height: profileData.height || '',
          weight: profileData.weight || '',
          bloodGroup: profileData.bloodGroup || profileData.blood_group || '',
          maritalStatus: profileData.maritalStatus || profileData.marital_status || '',
          disability: profileData.disability || '',
          education: profileData.education || '',
          profession: profileData.profession || '',
          annualIncome: profileData.annualIncome || profileData.annual_income || '',
          employmentType: profileData.employmentType || profileData.employment_type || '',
          religion: profileData.religion || '',
          caste: profileData.caste || '',
          location: profileData.location || profileData.homeCity || profileData.home_city || '',
          currentLocation: profileData.locationInfo?.currentLocation || profileData.currentLocation || profileData.current_city || '',
          contactNumber: profileData.contactNumber || profileData.contact_number || profileData.phone || '',
          whatsappNumber: profileData.whatsappNumber || profileData.whatsapp_number || '',
          state: profileData.state || profileData.location || '',
          isOnline: profileData.isOnline || false,
          lastSeen: profileData.lastSeen || profileData.last_seen || new Date().toISOString(),
          aboutYourself: profileData.aboutYourself || '',
          aboutFamily: profileData.aboutFamily || '',
          motherTongue: profileData.motherTongue || '',
          jobTitle: profileData.jobTitle || '',
          companyName: profileData.companyName || ''
        };

        setSelectedMatch(mappedProfile);
        setShowMatchModal(true);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load profile data',
          confirmButtonColor: '#e11d48'
        });
      }
    } catch (err) {
      console.error("Error fetching profile:", err);

      // Show sweet alert for 404 errors (profile not found)
      if (err.response?.status === 404) {
        Swal.fire({
          icon: 'info',
          title: 'Profile Not Found',
          text: 'The profile you are looking for does not exist in our database.',
          confirmButtonColor: '#e11d48',
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: true
        });
      } else if (err.response?.data?.error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.response.data.error,
          confirmButtonColor: '#e11d48'
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load profile',
          confirmButtonColor: '#e11d48'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Validate message input - only allow letters, spaces, and basic punctuation
  const validateMessage = (input) => {
    // Remove any numbers (0-9)
    let filtered = input.replace(/[0-9]/g, '');

    // Remove any special characters except basic punctuation
    filtered = filtered.replace(/[^a-zA-Z\s.,!?'-]/g, '');

    // Limit to 50 words
    const words = filtered.split(/\s+/).filter(word => word.length > 0);
    if (words.length > 50) {
      filtered = words.slice(0, 50).join(' ');
    }

    return filtered;
  };

  const handleMessageChange = (e) => {
    const validated = validateMessage(e.target.value);
    setNewMessage(validated);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !chatData.activeConversation) return;

    const messageContent = newMessage.trim();
    if (!messageContent) return;

    setMessageLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessageLoading(false);
        return;
      }

      const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const tempMessage = {
        _id: tempId,
        sender_email: finalData.userEmail,
        content: messageContent,
        created_at: new Date().toISOString(),
        read: false,
        sending: true
      };

      setChatData(prev => ({
        ...prev,
        messages: [...prev.messages, tempMessage]
      }));

      setNewMessage('');

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'send_message',
          conversation_id: chatData.activeConversation._id,
          sender_email: finalData.userEmail,
          content: messageContent,
          sender_name: finalData.fullName || finalData.userEmail.split('@')[0],
          temp_id: tempId
        }));

        const timeoutId = setTimeout(async () => {
          setChatData(prev => {
            const messageStillExists = prev.messages.some(m => m._id === tempId && m.sending);
            if (messageStillExists) {
              sendViaHTTP(messageContent, tempId);
            }
            return prev;
          });
        }, 3000);

        setChatData(prev => ({
          ...prev,
          messageTimeouts: { ...prev.messageTimeouts, [tempId]: timeoutId }
        }));
      } else {
        await sendViaHTTP(messageContent, tempId);
      }
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setMessageLoading(false);
    }
  };

  const sendViaHTTP = async (content, tempId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.post(
        `${BACKEND_URL}/api/chat/message`,
        {
          conversation_id: chatData.activeConversation._id,
          sender_email: finalData.userEmail,
          content: content,
          sender_name: finalData.fullName || finalData.userEmail.split('@')[0]
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setChatData(prev => {
          if (prev.messageTimeouts?.[tempId]) {
            clearTimeout(prev.messageTimeouts[tempId]);
          }

          return {
            ...prev,
            messages: prev.messages.map(msg =>
              msg._id === tempId
                ? {
                  ...msg,
                  _id: response.data.message?._id || response.data.message_id || tempId,
                  sending: false,
                  sent: true
                }
                : msg
            ),
            messageTimeouts: { ...prev.messageTimeouts, [tempId]: undefined }
          };
        });

        fetchChatConversations();
      }
    } catch (error) {
      setChatData(prev => ({
        ...prev,
        messages: prev.messages.filter(msg => msg._id !== tempId)
      }));

      toast.error("Failed to send message");
    }
  };

  const handleOpenChat = (conversation) => {
    setChatData(prev => ({
      ...prev,
      activeConversation: conversation
    }));
    fetchChatMessages(conversation._id);
    setShowChatModal(true);

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'mark_read',
        conversation_id: conversation._id,
        user_email: finalData.userEmail
      }));
    }
  };

  const handleClearChat = async (conversationId) => {
    setClearChatLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setClearChatLoading(false);
        return;
      }

      const response = await axios.delete(
        `${BACKEND_URL}/api/chat/conversation/${conversationId}/clear?user_email=${encodeURIComponent(finalData.userEmail)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        toast.success(`Chat cleared (${response.data.cleared_count} messages removed)`);

        setChatData(prev => ({
          ...prev,
          conversations: prev.conversations.map(c =>
            c._id === conversationId ? { ...c, last_message: null } : c
          ),
          messages: prev.activeConversation?._id === conversationId ? [] : prev.messages
        }));

        setShowClearChatConfirm(false);
        setChatToClear(null);
      }
    } catch (error) {
      toast.error("Failed to clear chat");
    } finally {
      setClearChatLoading(false);
    }
  };

  const handleTyping = (isTyping) => {
    if (wsRef.current?.readyState === WebSocket.OPEN && chatData.activeConversation) {
      wsRef.current.send(JSON.stringify({
        type: 'typing',
        conversation_id: chatData.activeConversation._id,
        user_email: finalData.userEmail,
        is_typing: isTyping
      }));
    }
  };

  const handleUpgradePlan = () => {
    navigate('/profile#plan');
  };

  const handleProfileClick = (profile) => {
    setSelectedMatch(profile);
    setShowMatchModal(true);
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

  const getInterestStatus = (match) => {
    const sent = activityData.sentInterests.find(i => i.receiver_email === match.email);
    const received = activityData.receivedInterests.find(i => i.sender_email === match.email);

    if (sent) return { type: 'sent', status: sent.status, id: sent._id };
    if (received) return { type: 'received', status: received.status, id: received._id };
    return null;
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

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';

    try {
      const messageDate = new Date(timestamp);
      const now = new Date();

      // Check if we're on localhost or production
      const isLocalhost = window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1';

      // For Render (production), we need to add 5.5 hours
      // For localhost, use as is
      let adjustedDate = messageDate;

      if (!isLocalhost) {
        // On Render/Railway/etc - Add 5.5 hours for IST
        const IST_OFFSET = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
        adjustedDate = new Date(messageDate.getTime() + IST_OFFSET);
      }

      // Calculate difference
      const diffMs = now - adjustedDate;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} min ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

      return adjustedDate.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

    } catch (error) {
      console.error("Error formatting timestamp:", error);
      return '';
    }
  };

  // Updated Activity Profile Modal - No match score, no online status, no buttons
  const ActivityProfileModal = ({ match, onClose, isPremiumUser }) => {
    if (!match) return null;

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 overflow-y-auto" onClick={onClose}>
        <div
          className="bg-white w-full min-h-screen md:min-h-0 md:max-w-4xl md:my-8 md:rounded-2xl overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header - Simple without match score */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-rose-500 to-pink-600 text-white px-4 py-4 md:px-8 md:py-5">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl md:text-2xl font-bold truncate">{match.fullName}</h2>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 bg-white/20 px-2 py-1 md:px-3 md:py-1.5 rounded-full text-xs md:text-sm">
                    <FaBirthdayCake className="text-[10px] md:text-xs" /> {match.age} yrs
                  </span>
                  <span className="inline-flex items-center gap-1 bg-white/20 px-2 py-1 md:px-3 md:py-1.5 rounded-full text-xs md:text-sm">
                    <FiMapPin className="text-[10px] md:text-xs" /> {match.state || match.location || 'Not specified'}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 md:w-10 md:h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center hover:bg-white/30 transition flex-shrink-0"
              >
                <FiX className="text-white text-lg md:text-xl" />
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto max-h-[calc(100vh-120px)] md:max-h-[calc(100vh-160px)]">
            <div className="p-4 md:p-6">
              <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
                {/* Left Column - Profile Image */}
                <div className="lg:w-2/5 space-y-4">
                  <div className="rounded-xl overflow-hidden bg-gray-100 aspect-[3/4] relative shadow-md">
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
                      <FiUser className="text-6xl md:text-9xl text-rose-300" />
                    </div>
                  </div>

                  {/* Quick Stats Grid */}
                  <div className="grid grid-cols-2 gap-2 md:gap-3">
                    {[
                      { label: 'Height', value: match.height || 'N/A' },
                      { label: 'Weight', value: match.weight || 'N/A' },
                      match.bloodGroup && { label: 'Blood Group', value: match.bloodGroup },
                      match.employmentType && { label: 'Employment', value: match.employmentType },
                    ].filter(Boolean).map((stat, i) => (
                      <div key={i} className="bg-gray-50 rounded-lg p-2 md:p-3 text-center border border-gray-100">
                        <div className="text-sm md:text-base font-semibold text-gray-800">{stat.value}</div>
                        <div className="text-[10px] md:text-xs text-gray-500 mt-0.5">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column - Detailed Information */}
                <div className="lg:w-3/5 space-y-4 md:space-y-5">
                  {/* Personal Information */}
                  <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-gray-50 px-3 md:px-5 py-2 md:py-3 flex items-center gap-2">
                      <FiUser className="text-rose-500 text-base md:text-lg" />
                      <h4 className="font-semibold text-gray-800 text-sm md:text-base">Personal Information</h4>
                    </div>
                    <div className="px-3 md:px-5 py-2 md:py-3 divide-y divide-gray-50">
                      <div className="flex justify-between items-center py-2 md:py-2.5">
                        <span className="text-gray-500 text-xs md:text-sm flex items-center gap-2">
                          <FaBirthdayCake className="text-rose-400 text-xs" /> Age
                        </span>
                        <span className="font-medium text-gray-800 text-xs md:text-sm">{match.age} years</span>
                      </div>
                      {match.maritalStatus && (
                        <div className="flex justify-between items-center py-2 md:py-2.5">
                          <span className="text-gray-500 text-xs md:text-sm flex items-center gap-2">
                            <FiUsers className="text-rose-400 text-xs" /> Marital Status
                          </span>
                          <span className="font-medium text-gray-800 text-xs md:text-sm">{match.maritalStatus}</span>
                        </div>
                      )}
                      {match.disability && match.disability !== "No" && (
                        <div className="flex justify-between items-center py-2 md:py-2.5">
                          <span className="text-gray-500 text-xs md:text-sm flex items-center gap-2">
                            <FiUsers className="text-rose-400 text-xs" /> Disability
                          </span>
                          <span className="font-medium text-gray-800 text-xs md:text-sm">{match.disability}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Education & Career */}
                  <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-gray-50 px-3 md:px-5 py-2 md:py-3 flex items-center gap-2">
                      <FaUserGraduate className="text-rose-500 text-base md:text-lg" />
                      <h4 className="font-semibold text-gray-800 text-sm md:text-base">Education & Career</h4>
                    </div>
                    <div className="px-3 md:px-5 py-2 md:py-3 divide-y divide-gray-50">
                      {match.education && (
                        <div className="flex justify-between items-center py-2 md:py-2.5">
                          <span className="text-gray-500 text-xs md:text-sm flex items-center gap-2">
                            <FiBookOpen className="text-rose-400 text-xs" /> Education
                          </span>
                          <span className="font-medium text-gray-800 text-xs md:text-sm text-right max-w-[60%]">{match.education}</span>
                        </div>
                      )}
                      {match.profession && (
                        <div className="flex justify-between items-center py-2 md:py-2.5">
                          <span className="text-gray-500 text-xs md:text-sm flex items-center gap-2">
                            <FiBriefcase className="text-rose-400 text-xs" /> Profession
                          </span>
                          <span className="font-medium text-gray-800 text-xs md:text-sm text-right max-w-[60%]">{match.profession}</span>
                        </div>
                      )}
                      {match.jobTitle && (
                        <div className="flex justify-between items-center py-2 md:py-2.5">
                          <span className="text-gray-500 text-xs md:text-sm flex items-center gap-2">
                            <FiBriefcase className="text-rose-400 text-xs" /> Job Title
                          </span>
                          <span className="font-medium text-gray-800 text-xs md:text-sm text-right max-w-[60%]">{match.jobTitle}</span>
                        </div>
                      )}
                      {match.companyName && (
                        <div className="flex justify-between items-center py-2 md:py-2.5">
                          <span className="text-gray-500 text-xs md:text-sm flex items-center gap-2">
                            <FiBriefcase className="text-rose-400 text-xs" /> Company
                          </span>
                          <span className="font-medium text-gray-800 text-xs md:text-sm text-right max-w-[60%]">{match.companyName}</span>
                        </div>
                      )}
                      {match.annualIncome && (
                        <div className="flex justify-between items-center py-2 md:py-2.5">
                          <span className="text-gray-500 text-xs md:text-sm flex items-center gap-2">
                            <FaChartLine className="text-rose-400 text-xs" /> Annual Income
                          </span>
                          <span className="font-medium text-gray-800 text-xs md:text-sm text-right max-w-[60%]">{match.annualIncome}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Religion */}
                  {(match.religion || match.caste || match.motherTongue) && (
                    <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                      <div className="bg-gray-50 px-3 md:px-5 py-2 md:py-3 flex items-center gap-2">
                        <FaPrayingHands className="text-rose-500 text-base md:text-lg" />
                        <h4 className="font-semibold text-gray-800 text-sm md:text-base">Religion</h4>
                      </div>
                      <div className="px-3 md:px-5 py-2 md:py-3 divide-y divide-gray-50">
                        {match.religion && (
                          <div className="flex justify-between items-center py-2 md:py-2.5">
                            <span className="text-gray-500 text-xs md:text-sm">Religion</span>
                            <span className="font-medium text-gray-800 text-xs md:text-sm">{match.religion}</span>
                          </div>
                        )}
                        {match.caste && (
                          <div className="flex justify-between items-center py-2 md:py-2.5">
                            <span className="text-gray-500 text-xs md:text-sm">Caste</span>
                            <span className="font-medium text-gray-800 text-xs md:text-sm">{match.caste}</span>
                          </div>
                        )}
                        {match.motherTongue && (
                          <div className="flex justify-between items-center py-2 md:py-2.5">
                            <span className="text-gray-500 text-xs md:text-sm">Mother Tongue</span>
                            <span className="font-medium text-gray-800 text-xs md:text-sm">{match.motherTongue}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Location */}
                  <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-gray-50 px-3 md:px-5 py-2 md:py-3 flex items-center gap-2">
                      <FiHome className="text-rose-500 text-base md:text-lg" />
                      <h4 className="font-semibold text-gray-800 text-sm md:text-base">Location</h4>
                    </div>
                    <div className="px-3 md:px-5 py-2 md:py-3 divide-y divide-gray-50">
                      {match.location && (
                        <div className="flex justify-between items-center py-2 md:py-2.5">
                          <span className="text-gray-500 text-xs md:text-sm flex items-center gap-2">
                            <FiMapPin className="text-rose-400 text-xs" /> Home City
                          </span>
                          <span className="font-medium text-gray-800 text-xs md:text-sm text-right max-w-[60%]">{match.location}</span>
                        </div>
                      )}
                      {match.currentLocation && (
                        <div className="flex justify-between items-center py-2 md:py-2.5">
                          <span className="text-gray-500 text-xs md:text-sm flex items-center gap-2">
                            <FiMapPin className="text-rose-400 text-xs" /> Current Town
                          </span>
                          <span className="font-medium text-gray-800 text-xs md:text-sm text-right max-w-[60%]">{match.currentLocation}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Contact Information - Only for Premium Users */}
                  {isPremiumUser && (match.contactNumber || match.whatsappNumber) && (
                    <div className="bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-100 rounded-xl p-4 md:p-5 shadow-sm">
                      <h4 className="font-semibold text-gray-800 text-sm md:text-base mb-3 md:mb-4 flex items-center gap-2">
                        <FiMail className="text-rose-500" /> Contact Information
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                        {match.contactNumber && (
                          <a
                            href={`tel:${match.contactNumber}`}
                            className="flex items-center gap-3 bg-white rounded-lg p-3 border border-rose-100 hover:shadow-sm transition"
                          >
                            <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <FiPhone className="text-rose-500" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-[10px] text-gray-500">Phone</div>
                              <div className="font-medium text-gray-800 text-xs md:text-sm truncate">{match.contactNumber}</div>
                            </div>
                          </a>
                        )}
                        {match.whatsappNumber && (
                          <a
                            href={`https://wa.me/${match.whatsappNumber.replace(/\D/g, '').length === 10
                              ? '91' + match.whatsappNumber.replace(/\D/g, '')
                              : match.whatsappNumber.replace(/\D/g, '')
                              }`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 bg-white rounded-lg p-3 border border-rose-100 hover:shadow-sm transition"
                          >
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <FaWhatsapp className="text-green-600" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-[10px] text-gray-500">WhatsApp</div>
                              <div className="font-medium text-gray-800 text-xs md:text-sm truncate">{match.whatsappNumber}</div>
                            </div>
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Premium Upgrade Prompt for Free Users */}
                  {!isPremiumUser && (
                    <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-4 md:p-5 text-white shadow-md">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <FaCrown className="text-lg" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm">Upgrade to Premium</h4>
                          <p className="text-white/80 text-xs">View contact details and more</p>
                        </div>
                        <button
                          onClick={handleUpgradePlan}
                          className="px-4 py-1.5 bg-white text-amber-600 rounded-lg hover:bg-amber-50 transition font-semibold text-xs whitespace-nowrap"
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

  // Keep original MatchDetailModal for suggested matches (unchanged)
  const MatchDetailModal = ({ match, onClose, onAddToWatchlist, isPremiumUser }) => {
    if (!match) return null;

    const matchPercentage = calculateMatchPercentage(formatMatchScore(match));
    const isWatched = isPremiumUser && isInWatchlist(match);
    const interestStatus = getInterestStatus(match);
    const score = formatMatchScore(match);

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 overflow-y-auto" onClick={onClose}>
        <div
          className="bg-white w-full min-h-screen md:min-h-0 md:max-w-5xl md:my-6 md:rounded-2xl overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative bg-gradient-to-r from-rose-500 to-pink-600 text-white px-4 py-4 md:px-8 md:py-6">
            <button
              onClick={onClose}
              className="absolute top-3 right-3 md:top-5 md:right-5 w-8 h-8 md:w-9 md:h-9 bg-white/20 backdrop-blur rounded-full flex items-center justify-center hover:bg-white/30 transition"
            >
              <FiX className="text-white text-lg md:text-xl" />
            </button>
            <div className="flex items-center gap-2">
              <h2 className="text-xl md:text-3xl font-bold pr-8 truncate">{match.fullName}</h2>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-2 md:mt-3">
              <span className="inline-flex items-center gap-1 bg-white/20 px-2 py-1 md:px-3 md:py-1.5 rounded-full text-xs md:text-sm font-medium">
                <FaBirthdayCake className="text-[10px] md:text-xs" /> {match.age} yrs
              </span>
              <span className="inline-flex items-center gap-1 bg-white/20 px-2 py-1 md:px-3 md:py-1.5 rounded-full text-xs md:text-sm font-medium">
                <FiMapPin className="text-[10px] md:text-xs" /> {match.state}
              </span>
              {/* Online/Offline Status */}
              {match.isOnline ? (
                <span className="inline-flex items-center gap-1 bg-emerald-400/30 px-2 py-1 md:px-3 md:py-1.5 rounded-full text-xs md:text-sm font-medium">
                  <FaCircle className="text-[6px] md:text-[8px] text-emerald-300 animate-pulse" /> Online
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 bg-white/15 px-2 py-1 md:px-3 md:py-1.5 rounded-full text-xs md:text-sm font-medium">
                  <FaClock className="text-[10px] md:text-xs" /> {formatLastSeen(match.lastSeen)}
                </span>
              )}
              <div className={`ml-auto px-3 py-1 md:px-4 md:py-1.5 rounded-full text-xs md:text-sm font-bold bg-gradient-to-r ${getScoreColor(score)} shadow-lg`}>
                {score}% Match
              </div>
            </div>
          </div>

          <div className="overflow-y-auto max-h-[calc(100vh-120px)] md:max-h-[calc(92vh-120px)]">
            <div className="p-4 md:p-6">
              <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
                <div className="lg:w-2/5 space-y-4">
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
                      <FiUser className="text-6xl md:text-9xl text-rose-300" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 md:gap-3">
                    <div className="flex gap-2">
                      {isPremiumUser && (
                        <button
                          onClick={() => onAddToWatchlist(match)}
                          className={`flex-1 py-2.5 md:py-3.5 rounded-xl font-semibold text-sm md:text-base flex items-center justify-center gap-1 md:gap-2 transition-all duration-200 ${isWatched
                            ? 'bg-rose-50 text-rose-600 border-2 border-rose-200 hover:bg-rose-100'
                            : 'bg-gradient-to-r from-rose-500 to-pink-600 text-white hover:shadow-lg hover:shadow-rose-200'
                            }`}
                        >
                          {isWatched ? <><FiCheck className="text-base md:text-lg" /> Saved</> : <><FiBookmark className="text-base md:text-lg" /> Save</>}
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setInterestTarget(match);
                          setShowInterestModal(true);
                          onClose();
                        }}
                        disabled={interestStatus?.type === 'sent' && interestStatus.status === 'pending' || interestStatus?.status === 'rejected'}
                        className={`flex-1 py-2.5 md:py-3.5 rounded-xl font-semibold text-sm md:text-base flex items-center justify-center gap-1 md:gap-2 transition-all duration-200
                          ${interestStatus?.status === 'rejected'
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                            : interestStatus?.type === 'sent' && interestStatus.status === 'pending'
                              ? 'bg-amber-50 text-amber-600 border border-amber-200 cursor-default'
                              : interestStatus?.type === 'received' && interestStatus.status === 'pending'
                                ? 'bg-emerald-50 text-emerald-600 border-2 border-emerald-200'
                                : interestStatus?.status === 'accepted'
                                  ? 'bg-teal-50 text-teal-600 border-2 border-teal-200'
                                  : 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100'
                          }`}
                      >
                        {interestStatus?.status === 'rejected' ? <><FiXCircle className="text-base md:text-lg" /> Rejected</> :
                          interestStatus?.type === 'sent' && interestStatus.status === 'pending' ? <><FiClock className="text-base md:text-lg" /> Sent</> :
                            interestStatus?.type === 'received' && interestStatus.status === 'pending' ? <><FiMessageCircle className="text-base md:text-lg" /> Respond</> :
                              interestStatus?.status === 'accepted' ? <><FiCheckCircle className="text-base md:text-lg" /> Connected</> :
                                <><FiSend className="text-base md:text-lg" /> Interest</>}
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        setReportTarget(match);
                        setShowReportModal(true);
                        onClose();
                      }}
                      className="w-full py-2.5 md:py-3 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition font-medium text-sm md:text-base flex items-center justify-center gap-1 md:gap-2 border border-gray-200"
                    >
                      <FiFlag className="text-base md:text-lg" /> Report
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 md:gap-3">
                    {[
                      { label: 'Height', value: match.height || 'N/A' },
                      { label: 'Weight', value: match.weight || 'N/A' },
                      match.bloodGroup && { label: 'Blood Group', value: match.bloodGroup },
                      match.employmentType && { label: 'Employment', value: match.employmentType },
                    ].filter(Boolean).map((stat, i) => (
                      <div key={i} className="bg-gray-50 rounded-lg p-2 md:p-4 text-center">
                        <div className="text-sm md:text-base font-bold text-gray-800">{stat.value}</div>
                        <div className="text-xs text-gray-500 mt-0.5 md:mt-1">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:w-3/5 space-y-4 md:space-y-5">
                  {[
                    {
                      icon: <FiUser className="text-rose-500 text-base md:text-lg" />,
                      title: 'Personal',
                      items: [
                        { label: 'Age', value: `${match.age} years`, icon: <FaBirthdayCake className="text-rose-400 text-xs md:text-sm" /> },
                        match.maritalStatus && { label: 'Marital Status', value: match.maritalStatus, icon: <FiUsers className="text-rose-400 text-xs md:text-sm" /> },
                        match.disability && { label: 'Disability', value: match.disability, icon: <FiUsers className="text-rose-400 text-xs md:text-sm" /> },
                      ].filter(Boolean)
                    },
                    {
                      icon: <FaUserGraduate className="text-rose-500 text-base md:text-lg" />,
                      title: 'Education & Career',
                      items: [
                        match.education && { label: 'Education', value: match.education, icon: <FiBookOpen className="text-rose-400 text-xs md:text-sm" /> },
                        match.profession && { label: 'Profession', value: match.profession, icon: <FiBriefcase className="text-rose-400 text-xs md:text-sm" /> },
                        match.annualIncome && { label: 'Annual Income', value: match.annualIncome, icon: <FaChartLine className="text-rose-400 text-xs md:text-sm" /> },
                      ].filter(Boolean)
                    },
                    (match.religion || match.caste) && {
                      icon: <FaPrayingHands className="text-rose-500 text-base md:text-lg" />,
                      title: 'Religion',
                      items: [
                        match.religion && { label: 'Religion', value: match.religion },
                        match.caste && { label: 'Caste', value: match.caste },
                      ].filter(Boolean)
                    },
                    {
                      icon: <FiHome className="text-rose-500 text-base md:text-lg" />,
                      title: 'Location',
                      items: [
                        { label: 'Home City', value: match.location, icon: <FiMapPin className="text-rose-400 text-xs md:text-sm" /> },
                        { label: 'Current Town', value: match.currentLocation, icon: <FiMapPin className="text-rose-400 text-xs md:text-sm" /> },
                      ]
                    },
                  ].filter(Boolean).map((section, si) => (
                    <div key={si} className="border border-gray-100 rounded-xl overflow-hidden">
                      <div className="bg-gray-50 px-3 md:px-5 py-2 md:py-3 flex items-center gap-1 md:gap-2">
                        {section.icon}
                        <h4 className="font-semibold text-gray-800 text-sm md:text-base">{section.title}</h4>
                      </div>
                      <div className="px-3 md:px-5 py-2 md:py-3">
                        {section.items.map((item, ii) => (
                          <div key={ii} className={`flex justify-between items-center py-2 md:py-3 ${ii < section.items.length - 1 ? 'border-b border-gray-50' : ''}`}>
                            <span className="text-gray-500 text-xs md:text-sm flex items-center gap-1 md:gap-2">{item.icon} {item.label}</span>
                            <span className="font-medium text-gray-800 text-xs md:text-sm text-right max-w-[55%] truncate">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Only show contact info for premium users */}
                  {isPremiumUser && (match.contactNumber || match.whatsappNumber) && (
                    <div className="bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-100 rounded-xl p-3 md:p-5">
                      <h4 className="font-semibold text-gray-800 text-sm md:text-base mb-3 md:mb-4 flex items-center gap-1 md:gap-2">
                        <FiMail className="text-rose-500 text-base md:text-lg" /> Contact Information
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                        {match.contactNumber && (
                          <a
                            href={`tel:${match.contactNumber}`}
                            className="flex items-center gap-3 md:gap-4 bg-white rounded-lg p-3 md:p-4 border border-rose-100 hover:shadow-sm transition"
                          >
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-rose-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <FiPhone className="text-rose-500 text-base md:text-lg" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs text-gray-500">Phone</div>
                              <div className="font-bold text-gray-800 text-sm md:text-base truncate">{match.contactNumber}</div>
                            </div>
                          </a>
                        )}
                        {match.whatsappNumber && (
                          <a
                            href={`https://wa.me/${match.whatsappNumber.replace(/\D/g, '').length === 10
                              ? '91' + match.whatsappNumber.replace(/\D/g, '')
                              : match.whatsappNumber.replace(/\D/g, '')
                              }`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 md:gap-4 bg-white rounded-lg p-3 md:p-4 border border-rose-100 hover:shadow-sm transition"
                          >
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <FaWhatsapp className="text-green-600 text-base md:text-lg" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs text-gray-500">WhatsApp</div>
                              <div className="font-bold text-gray-800 text-sm md:text-base truncate">{match.whatsappNumber}</div>
                            </div>
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {!isPremiumUser && (
                    <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-4 md:p-5 text-white">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <FaCrown className="text-lg md:text-xl" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm md:text-base">Upgrade to Premium</h4>
                          <p className="text-white/80 text-xs md:text-sm">View contact details and save profiles to watchlist</p>
                        </div>
                        <button
                          onClick={handleUpgradePlan}
                          className="px-3 md:px-5 py-1.5 md:py-2.5 bg-white text-amber-600 rounded-lg hover:bg-amber-50 transition font-bold text-xs md:text-sm whitespace-nowrap"
                        >
                          Upgrade Now
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
        <div className="min-h-screen bg-gray-50 pt-16 md:pt-20 flex items-center justify-center px-4">
          <div className="text-center">
            <div className="relative inline-block mb-4 md:mb-6">
              <div className="animate-spin rounded-full h-16 w-16 md:h-20 md:w-20 border-[4px] border-rose-200 border-t-rose-500 mx-auto"></div>
              <FiHeart className="absolute inset-0 m-auto text-rose-400 text-lg md:text-xl animate-pulse" />
            </div>
            <p className="text-gray-700 font-semibold text-lg md:text-xl">Finding your matches...</p>
            <p className="text-gray-400 text-sm md:text-base mt-1">Analyzing compatibility</p>
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
        <div className="min-h-screen bg-gray-50 pt-16 md:pt-20 flex items-center justify-center px-4">
          <div className="text-center max-w-md w-full p-6 md:p-8 bg-white rounded-2xl shadow-lg">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-5">
              <FiAlertCircle className="text-2xl md:text-3xl text-rose-500" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2 md:mb-3">Login Required</h2>
            <p className="text-gray-500 text-sm md:text-base mb-4 md:mb-6">Please log in to view your matches</p>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-3 md:py-3.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl hover:shadow-lg transition font-semibold text-sm md:text-base"
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
    <div className="space-y-2 md:space-y-3">
      <h4 className="font-semibold text-gray-700 text-sm md:text-base flex items-center gap-1 md:gap-2">{icon} {title}</h4>
      <div className="space-y-1 md:space-y-2 max-h-32 md:max-h-40 overflow-y-auto">
        {options.map(opt => (
          <label key={opt} className="flex items-center gap-2 cursor-pointer py-1 px-1.5 md:px-2 rounded-md hover:bg-gray-50 transition">
            <input
              type="checkbox"
              checked={activeFilters[filterKey].includes(opt)}
              onChange={() => handleFilterChange(filterKey, opt)}
              className="rounded border-gray-300 text-rose-500 focus:ring-rose-400 w-3.5 h-3.5 md:w-4 md:h-4"
            />
            <span className="text-sm md:text-base text-gray-600">{opt}</span>
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

      <div className="min-h-screen bg-rose-50 pt-14 md:pt-16">
        <div className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white">
          <div className="max-w-7xl mx-auto px-4 py-6 md:py-5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                  <FiHeart className="text-rose-200 text-2xl" /> Your Matches
                </h1>
                <p className="text-rose-100 text-sm md:text-base mt-1.5">
                  {activeTab === 'suggested' && filteredMatches.length > 0
                    ? `${filteredMatches.length} compatible profiles found`
                    : activeTab === 'activity'
                      ? 'Manage your interests'
                      : activeTab === 'chat'
                        ? 'Connect with your matches'
                        : 'Discover your perfect match'}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {isPremiumUser && (
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
                  <FiMail className="text-xs" />
                  <span className="truncate max-w-[160px] md:max-w-none">
                    {finalData.userEmail}
                  </span>
                </span>
              )}

              <span
                className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm ${finalData.isProfilePublished
                  ? 'bg-emerald-400/20 text-emerald-100'
                  : 'bg-amber-400/20 text-amber-100'
                  }`}
              >
                {finalData.isProfilePublished ? (
                  <FiCheck className="text-xs" />
                ) : (
                  <FiAlertCircle className="text-xs" />
                )}
                {finalData.isProfilePublished ? 'Published' : 'Not Published'}
              </span>
            </div>

            {!finalData.isProfilePublished && (
              <div className="mt-4 p-4 bg-white/10 backdrop-blur rounded-xl border border-white/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <p className="text-base flex items-center gap-2">
                  <FiAlertCircle className="flex-shrink-0 text-lg" />
                  Complete and publish your profile to get matches.
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

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 mt-4 md:mt-6 mb-6 md:mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex flex-wrap border-b border-gray-100">
              <button
                onClick={() => setActiveTab('suggested')}
                className={`flex-1 py-3 px-2 md:py-4 md:px-4 text-xs md:text-base font-semibold flex items-center justify-center gap-1 md:gap-2 transition-colors relative
                  ${activeTab === 'suggested'
                    ? 'text-rose-600 border-b-2 border-rose-500'
                    : 'text-gray-500 hover:text-gray-700'}`}
              >
                <FiHeart className="text-sm md:text-lg" />
                <span className="hidden xs:inline">Suggested</span>
                <span className="xs:hidden">Matches</span>
                {filteredMatches.length > 0 && (
                  <span className="bg-rose-100 text-rose-600 text-[10px] md:text-xs font-bold px-1.5 py-0.5 md:px-2 md:py-0.5 rounded-full">
                    {filteredMatches.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`flex-1 py-3 px-2 md:py-4 md:px-4 text-xs md:text-base font-semibold flex items-center justify-center gap-1 md:gap-2 transition-colors relative
                  ${activeTab === 'activity'
                    ? 'text-rose-600 border-b-2 border-rose-500'
                    : 'text-gray-500 hover:text-gray-700'}`}
              >
                <FiActivity className="text-sm md:text-lg" />
                <span className="hidden xs:inline">Activity</span>
                <span className="xs:hidden">Activity</span>
                {(activityData.sentInterests.length > 0 || activityData.receivedInterests.length > 0) && (
                  <span className="bg-rose-100 text-rose-600 text-[10px] md:text-xs font-bold px-1.5 py-0.5 md:px-2 md:py-0.5 rounded-full">
                    {activityData.sentInterests.length + activityData.receivedInterests.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 py-3 px-2 md:py-4 md:px-4 text-xs md:text-base font-semibold flex items-center justify-center gap-1 md:gap-2 transition-colors relative
                  ${activeTab === 'chat'
                    ? 'text-rose-600 border-b-2 border-rose-500'
                    : 'text-gray-500 hover:text-gray-700'}`}
              >
                <FiMessageCircle className="text-sm md:text-lg" />
                <span className="hidden xs:inline">Chat</span>
                <span className="xs:hidden">Chat</span>
                {chatData.conversations.length > 0 && (
                  <span className="bg-rose-100 text-rose-600 text-[10px] md:text-xs font-bold px-1.5 py-0.5 md:px-2 md:py-0.5 rounded-full">
                    {chatData.conversations.length}
                  </span>
                )}
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-3 md:p-5">
              {/* Suggested Matches Tab */}
              {activeTab === 'suggested' && (
                <>
                  {filteredMatches.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 md:gap-4 mb-4 md:mb-6">
                      {[
                        { value: filteredMatches.length, label: 'Total', icon: <FiUsers className="text-rose-400 text-sm md:text-lg" /> },
                        { value: filteredMatches.filter(m => formatMatchScore(m) >= 80).length, label: 'High Match', icon: <FiStar className="text-amber-400 text-sm md:text-lg" /> },
                        { value: `${filteredMatches.length > 0 ? Math.round(filteredMatches.reduce((acc, m) => acc + formatMatchScore(m), 0) / filteredMatches.length) : 0}%`, label: 'Avg', icon: <FiBarChart2 className="text-teal-400 text-sm md:text-lg" /> },
                      ].map((stat, i) => (
                        <div
                          key={i}
                          className="bg-white rounded-xl p-2 md:p-4 shadow-sm border border-gray-100 text-center"
                        >
                          <div className="flex justify-center mb-0.5 md:mb-1">{stat.icon}</div>
                          <div className="text-base md:text-2xl font-semibold text-gray-800">
                            {stat.value}
                          </div>
                          <div className="text-[10px] md:text-xs text-gray-400 font-medium">
                            {stat.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {isPremiumUser && watchlistEmails.length > 0 && (
                    <div className="bg-white rounded-xl p-3 md:p-5 shadow-sm border border-gray-100 flex items-center justify-between mb-4 md:mb-6">
                      <div className="flex items-center gap-2 md:gap-4">
                        <div className="w-8 h-8 md:w-12 md:h-12 bg-rose-100 rounded-full flex items-center justify-center">
                          <FiBookmark className="text-rose-500 text-sm md:text-xl" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800 text-sm md:text-base">Watchlist</h3>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate('/watchlist')}
                        className="text-rose-500 hover:text-rose-600 font-semibold text-xs md:text-sm flex items-center gap-1"
                      >
                        View All →
                      </button>
                    </div>
                  )}

                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-3 md:px-5 py-3 md:py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 md:gap-3">
                      <h2 className="font-bold text-gray-800 flex items-center gap-1 md:gap-2 text-sm md:text-lg">
                        <FiTarget className="text-rose-500 text-base md:text-lg" /> Suggested Matches
                        {filteredMatches.length > 0 && <span className="text-gray-400 font-normal text-xs md:text-sm">({filteredMatches.length})</span>}
                      </h2>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] md:text-xs text-gray-400 hidden sm:inline">
                          Updated {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <button
                          onClick={() => setShowFilters(!showFilters)}
                          className="inline-flex items-center gap-1 md:gap-2 px-3 py-1.5 md:px-4 md:py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-lg transition text-xs md:text-sm font-medium"
                        >
                          <FiFilter className="text-xs md:text-sm" /> Filters
                          {getActiveFilterCount() > 0 && (
                            <span className="bg-rose-500 text-white text-[10px] md:text-xs font-bold w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center">
                              {getActiveFilterCount()}
                            </span>
                          )}
                        </button>
                      </div>
                    </div>

                    {getActiveFilterCount() > 0 && (
                      <div className="px-3 md:px-5 py-2 md:py-3 bg-rose-50/50 border-b border-rose-100 flex flex-wrap items-center gap-1 md:gap-2">
                        {Object.keys(activeFilters).map(key => {
                          if (Array.isArray(activeFilters[key]) && activeFilters[key].length > 0) {
                            return activeFilters[key].map(value => (
                              <span key={`${key}-${value}`} className="inline-flex items-center gap-1 bg-white border border-rose-200 px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs text-rose-600 font-medium">
                                {value}
                                <button onClick={() => handleFilterChange(key, value)} className="text-rose-400 hover:text-rose-600"><FiX className="text-[10px] md:text-xs" /></button>
                              </span>
                            ));
                          } else if (activeFilters[key] && !Array.isArray(activeFilters[key])) {
                            const displayKey = key === 'minAge' ? 'Min Age' : key === 'maxAge' ? 'Max Age' : key === 'minHeight' ? 'Min Ht' : key === 'maxHeight' ? 'Max Ht' : key === 'minWeight' ? 'Min Wt' : key === 'maxWeight' ? 'Max Wt' : key === 'homeCity' ? 'Home' : key === 'currentCity' ? 'Current' : key;
                            const displayValue = key.includes('Height') ? `${activeFilters[key]}cm` : key.includes('Weight') ? `${activeFilters[key]}kg` : key.includes('Age') ? `${activeFilters[key]}y` : activeFilters[key];
                            return (
                              <span key={key} className="inline-flex items-center gap-1 bg-white border border-rose-200 px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs text-rose-600 font-medium">
                                {displayKey}: {displayValue}
                                <button onClick={() => handleFilterChange(key, '')} className="text-rose-400 hover:text-rose-600"><FiX className="text-[10px] md:text-xs" /></button>
                              </span>
                            );
                          }
                          return null;
                        })}
                        <button onClick={handleClearFilters} className="text-[10px] md:text-xs text-rose-500 font-semibold ml-auto hover:underline">Clear all</button>
                      </div>
                    )}

                    {error && (
                      <div className="mx-3 md:mx-5 mt-3 md:mt-5 p-3 md:p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2">
                        <FiAlertCircle className="text-red-400 flex-shrink-0 mt-0.5 text-sm md:text-base" />
                        <p className="text-red-600 text-sm md:text-base">{error}</p>
                      </div>
                    )}

                    <div className="p-3 md:p-5">
                      {finalData.isProfilePublished ? (
                        filteredMatches.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5">
                            {filteredMatches.map((match, index) => {
                              const score = formatMatchScore(match);
                              const matchPercentage = calculateMatchPercentage(score);
                              const isWatched = isPremiumUser && isInWatchlist(match);
                              const interestStatus = getInterestStatus(match);

                              return (
                                <div key={match.email || index} className="group cursor-pointer" onClick={() => handleMatchClick(match)}>
                                  <div className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-xl hover:border-rose-100 transition-all duration-300 transform hover:-translate-y-0.5 h-full flex flex-col relative">
                                    <div className="absolute top-2 right-2 z-10">
                                      <div className={`px-1.5 py-1 md:px-2.5 md:py-1.5 rounded-lg text-xs md:text-sm font-bold shadow-md bg-gradient-to-r ${getScoreColor(score)} text-white`}>
                                        {score}%
                                      </div>
                                    </div>

                                    {isPremiumUser && (
                                      <div className="absolute top-2 left-2 z-10 flex gap-1">
                                        <button
                                          onClick={(e) => { e.stopPropagation(); handleAddToWatchlist(match); }}
                                          className="w-7 h-7 md:w-9 md:h-9 bg-white/90 backdrop-blur rounded-full flex items-center justify-center hover:bg-white transition shadow-md"
                                          title={isWatched ? "Remove from Watchlist" : "Save"}
                                        >
                                          <FiHeart className={`text-xs md:text-base ${isWatched ? 'text-rose-500 fill-rose-500' : 'text-gray-400 group-hover:text-rose-400'}`}
                                            style={isWatched ? { fill: 'currentColor' } : {}} />
                                        </button>
                                      </div>
                                    )}

                                    <div className="h-52 sm:h-48 md:h-56 lg:h-60 bg-gray-100 relative overflow-hidden flex-shrink-0">
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
                                        <FiUser className="text-4xl md:text-6xl text-rose-300" />
                                      </div>
                                      <div className="absolute bottom-0 inset-x-0 h-16 md:h-24 bg-gradient-to-t from-black/50 to-transparent"></div>
                                      <div className="absolute bottom-0 inset-x-0 p-2 md:p-4">
                                        <div className="flex items-center gap-1">
                                          <h3 className="text-white font-bold text-sm md:text-lg truncate drop-shadow-lg">{match.fullName || "Anonymous"}</h3>
                                          {verifiedEmails[match.email]?.isVerified && (
                                            <VscVerifiedFilled className="text-blue-400 text-xl md:text-2xl" title="Verified Profile" />
                                          )}
                                        </div>                                        <div className="flex items-center gap-1 md:gap-2 mt-0.5 md:mt-1">
                                          <span className="text-white/90 text-xs md:text-sm">{match.age} yrs</span>
                                          <span className="flex items-center gap-1 text-emerald-300 text-[10px] md:text-xs">
                                            {match.isOnline ? (
                                              <>
                                                <FaCircle className="text-[4px] md:text-[6px] animate-pulse" /> Online
                                              </>
                                            ) : (
                                              <>
                                                <FaClock className="text-[4px] md:text-[6px]" /> {formatLastSeen(match.lastSeen)}
                                              </>
                                            )}
                                          </span>
                                        </div>
                                      </div>
                                      {interestStatus && (
                                        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10">
                                          <span className={`px-1.5 py-0.5 md:px-2 md:py-1 rounded-full text-[10px] md:text-xs font-bold shadow-md
                                            ${interestStatus.status === 'accepted' ? 'bg-teal-500 text-white' :
                                              interestStatus.status === 'rejected' ? 'bg-gray-500 text-white' :
                                                interestStatus.type === 'sent' ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'}`}>
                                            {interestStatus.status === 'accepted' ? 'Connected' :
                                              interestStatus.status === 'rejected' ? 'Rejected' :
                                                interestStatus.type === 'sent' ? 'Sent' : 'Received'}
                                          </span>
                                        </div>
                                      )}
                                    </div>

                                    <div className="p-3 flex-grow flex flex-col">
                                      <div className="space-y-3 flex-grow">
                                        {match.profession && (
                                          <div className="flex items-center gap-3 text-gray-600">
                                            <FiBriefcase className="text-rose-400 flex-shrink-0 text-base" />
                                            <span className="text-sm line-clamp-1">{match.profession}</span>
                                          </div>
                                        )}
                                        {match.education && (
                                          <div className="flex items-center gap-3 text-gray-600">
                                            <FaUserGraduate className="text-rose-400 flex-shrink-0 text-base" />
                                            <span className="text-sm line-clamp-1">{match.education}</span>
                                          </div>
                                        )}
                                        {match.currentLocation && (
                                          <div className="flex items-center gap-3 text-gray-600">
                                            <FiMapPin className="text-rose-400 flex-shrink-0 text-base" />
                                            <span className="text-sm line-clamp-1">{match.currentLocation}</span>
                                          </div>
                                        )}
                                      </div>

                                      <div className="mt-4 pt-4 border-t border-gray-50">
                                        <div className="flex justify-between items-center mb-3">
                                          <span className={`text-xs font-medium ${matchPercentage.color}`}>{matchPercentage.label}</span>
                                          <span className="text-sm font-bold text-gray-700">{score}%</span>
                                        </div>
                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                          <div
                                            className={`h-full rounded-full bg-gradient-to-r ${getScoreColor(score)} transition-all duration-500`}
                                            style={{ width: `${score}%` }}
                                          ></div>
                                        </div>
                                      </div>

                                      <div className="mt-4 flex gap-2">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (interestStatus?.type === 'sent' && interestStatus.status === 'pending') {
                                              toast.info("Interest already sent");
                                            } else if (interestStatus?.type === 'received' && interestStatus.status === 'pending') {
                                              setInterestTarget(match);
                                              setShowInterestModal(true);
                                            } else if (interestStatus?.status === 'accepted') {
                                              const conversation = chatData.conversations.find(c =>
                                                c.participants?.some(p => p.email === match.email) &&
                                                c.participants?.some(p => p.email === finalData.userEmail)
                                              );
                                              if (conversation) {
                                                handleOpenChat(conversation);
                                              } else {
                                                toast.info("Start a conversation");
                                              }
                                            } else {
                                              setInterestTarget(match);
                                              setShowInterestModal(true);
                                            }
                                          }}
                                          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2
                                            ${interestStatus?.status === 'rejected' ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' :
                                              interestStatus?.status === 'accepted' ? 'bg-teal-50 text-teal-600 hover:bg-teal-100 border border-teal-200' :
                                                interestStatus?.type === 'sent' && interestStatus.status === 'pending' ? 'bg-amber-50 text-amber-600 border border-amber-200 cursor-default' :
                                                  interestStatus?.type === 'received' && interestStatus.status === 'pending' ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200' :
                                                    'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100'}`}
                                        >
                                          {interestStatus?.status === 'rejected' ? <><FiXCircle className="text-sm" /> Rejected</> :
                                            interestStatus?.status === 'accepted' ? <><FiMessageCircle className="text-sm" /> Chat</> :
                                              interestStatus?.type === 'sent' && interestStatus.status === 'pending' ? <><FiClock className="text-sm" /> Sent</> :
                                                interestStatus?.type === 'received' && interestStatus.status === 'pending' ? <><FiCheckCircle className="text-sm" /> Respond</> :
                                                  <><FiSend className="text-sm" /> Interest</>}
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setReportTarget(match);
                                            setShowReportModal(true);
                                          }}
                                          className="w-10 h-10 rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-200 flex items-center justify-center transition"
                                          title="Report"
                                        >
                                          <FiFlag className="text-base" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-10 md:py-20">
                            <div className="w-16 h-16 md:w-24 md:h-24 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-5">
                              <FiSearch className="text-2xl md:text-4xl text-rose-300" />
                            </div>
                            <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2 md:mb-3">
                              {getActiveFilterCount() > 0 ? 'No results for these filters' : 'No Matches Found Yet'}
                            </h3>
                            <p className="text-gray-400 text-sm md:text-base mb-4 md:mb-6 max-w-md mx-auto px-4">
                              {getActiveFilterCount() > 0 ? 'Try adjusting your filters.' : "We're searching for your perfect match. Check back soon!"}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-2 md:gap-3 justify-center px-4">
                              {getActiveFilterCount() > 0 && (
                                <button
                                  onClick={handleClearFilters}
                                  className="px-4 md:px-6 py-2 md:py-3 bg-rose-50 text-rose-600 rounded-lg font-semibold text-sm md:text-base hover:bg-rose-100 transition"
                                >
                                  Clear Filters
                                </button>
                              )}
                              <button
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className="px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-lg font-semibold text-sm md:text-base hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
                              >
                                {refreshing ? (
                                  <>
                                    <div className="animate-spin h-4 w-4 md:h-5 md:w-5 border-2 border-white border-t-transparent rounded-full"></div>
                                    Searching...
                                  </>
                                ) : (
                                  <>
                                    <FiRefreshCw className="text-sm md:text-base" /> Search Again
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        )
                      ) : (
                        <div className="text-center py-10 md:py-20">
                          <div className="w-16 h-16 md:w-24 md:h-24 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-5">
                            <FiEdit2 className="text-2xl md:text-4xl text-rose-300" />
                          </div>
                          <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2 md:mb-3">Profile Not Published</h3>
                          <p className="text-gray-400 text-sm md:text-base mb-4 md:mb-6">Publish your profile to start seeing matches.</p>
                          <button
                            onClick={() => navigate('/profile#plan')}
                            className="px-5 md:px-7 py-2.5 md:py-3.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl font-semibold text-sm md:text-base hover:shadow-lg transition"
                          >
                            <FiEdit2 className="inline mr-1 md:mr-2 text-base md:text-lg" /> Publish Your Profile
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Activity Tab */}
              {activeTab === 'activity' && (
                <div className="space-y-4 md:space-y-6">
                  {/* Received Interests */}
                  {activityData.receivedInterests.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                      <div className="px-3 md:px-5 py-2 md:py-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
                        <h3 className="font-bold text-gray-800 flex items-center gap-1 md:gap-2 text-sm md:text-base">
                          <FiHeart className="text-emerald-500 text-sm md:text-base" /> Received Interests ({activityData.receivedInterests.length})
                        </h3>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {activityData.receivedInterests.map((interest) => (
                          <div key={interest._id} className="p-3 md:p-4 hover:bg-gray-50 transition">
                            <div className="flex items-start gap-2 md:gap-4">
                              <div
                                className="w-10 h-10 md:w-16 md:h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer"
                                onClick={() => fetchProfileData(interest.sender_email, true)}
                              >
                                {interest.sender_profile_img ? (
                                  <img src={interest.sender_profile_img} alt={interest.sender_name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-rose-50">
                                    <FiUser className="text-lg md:text-2xl text-rose-300" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 sm:gap-2">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h4
                                        className="font-semibold text-gray-800 text-sm md:text-base cursor-pointer hover:text-rose-600"
                                        onClick={() => fetchProfileData(interest.sender_email, true)}
                                      >
                                        {interest.sender_name}
                                      </h4>
                                      {verifiedEmails[interest.sender_email]?.isVerified && (
                                        <VscVerifiedFilled className="text-blue-500 text-xs md:text-sm" title="Verified Profile" />
                                      )}
                                    </div>
                                    <p className="text-xs md:text-sm text-gray-500 truncate">{interest.sender_email}</p>
                                    <p className="text-[10px] md:text-xs text-gray-400 mt-0.5">
                                      {interest.sender_isOnline ? (
                                        <span className="flex items-center gap-1 text-emerald-500">
                                          <FaCircle className="text-[6px] animate-pulse" /> Online
                                        </span>
                                      ) : (
                                        formatLastSeen(interest.sender_lastSeen)
                                      )}
                                    </p>
                                  </div>
                                  <span className="text-[10px] md:text-xs text-gray-400">
                                    {formatTimestamp(interest.created_at)}
                                  </span>
                                </div>
                                {interest.message && (
                                  <p className="text-xs md:text-sm text-gray-600 mt-1 md:mt-2 bg-gray-50 p-1.5 md:p-2 rounded-lg">
                                    "{interest.message}"
                                  </p>
                                )}
                                <div className="flex flex-wrap items-center gap-2 mt-2 md:mt-3">
                                  {interest.status === 'pending' && (
                                    <>
                                      <button
                                        onClick={() => handleAcceptInterest(interest)}
                                        disabled={acceptInterestLoading[interest._id]}
                                        className="px-2 md:px-4 py-1 md:py-2 bg-emerald-500 text-white rounded-lg text-xs md:text-sm font-semibold hover:bg-emerald-600 transition flex items-center gap-1 md:gap-2 disabled:opacity-50"
                                      >
                                        {acceptInterestLoading[interest._id] ? (
                                          <FiLoader className="animate-spin text-xs md:text-sm" />
                                        ) : (
                                          <FiCheck className="text-xs md:text-sm" />
                                        )} Accept
                                      </button>
                                      <button
                                        onClick={() => handleRejectInterest(interest)}
                                        disabled={rejectInterestLoading[interest._id]}
                                        className="px-2 md:px-4 py-1 md:py-2 bg-gray-100 text-gray-600 rounded-lg text-xs md:text-sm font-semibold hover:bg-gray-200 transition flex items-center gap-1 md:gap-2 disabled:opacity-50"
                                      >
                                        {rejectInterestLoading[interest._id] ? (
                                          <FiLoader className="animate-spin text-xs md:text-sm" />
                                        ) : (
                                          <FiX className="text-xs md:text-sm" />
                                        )} Decline
                                      </button>
                                    </>
                                  )}
                                  {interest.status === 'accepted' && (
                                    <span className="px-2 md:px-4 py-1 md:py-2 bg-teal-50 text-teal-600 rounded-lg text-xs md:text-sm font-semibold flex items-center gap-1 md:gap-2">
                                      <FiCheckCircle className="text-xs md:text-sm" /> Accepted
                                    </span>
                                  )}
                                  {interest.status === 'rejected' && (
                                    <span className="px-2 md:px-4 py-1 md:py-2 bg-gray-50 text-gray-500 rounded-lg text-xs md:text-sm font-semibold flex items-center gap-1 md:gap-2">
                                      <FiXCircle className="text-xs md:text-sm" /> Declined
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sent Interests */}
                  {activityData.sentInterests.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                      <div className="px-3 md:px-5 py-2 md:py-4 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
                        <h3 className="font-bold text-gray-800 flex items-center gap-1 md:gap-2 text-sm md:text-base">
                          <FiSend className="text-amber-500 text-sm md:text-base" /> Sent Interests ({activityData.sentInterests.length})
                        </h3>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {activityData.sentInterests.map((interest) => (
                          <div key={interest._id} className="p-3 md:p-4 hover:bg-gray-50 transition">
                            <div className="flex items-start gap-2 md:gap-4">
                              <div
                                className="w-10 h-10 md:w-16 md:h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer"
                                onClick={() => fetchProfileData(interest.receiver_email, true)}
                              >
                                {interest.receiver_profile_img ? (
                                  <img src={interest.receiver_profile_img} alt={interest.receiver_name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-rose-50">
                                    <FiUser className="text-lg md:text-2xl text-rose-300" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 sm:gap-2">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h4
                                        className="font-semibold text-gray-800 text-sm md:text-base cursor-pointer hover:text-rose-600"
                                        onClick={() => fetchProfileData(interest.receiver_email, true)}
                                      >
                                        {interest.receiver_name}
                                      </h4>
                                      {verifiedEmails[interest.receiver_email]?.isVerified && (
                                        <VscVerifiedFilled className="text-blue-500 text-xs md:text-sm" title="Verified Profile" />
                                      )}
                                    </div>
                                    <p className="text-xs md:text-sm text-gray-500 truncate">{interest.receiver_email}</p>
                                    <p className="text-[10px] md:text-xs text-gray-400 mt-0.5">
                                      {interest.receiver_isOnline ? (
                                        <span className="flex items-center gap-1 text-emerald-500">
                                          <FaCircle className="text-[6px] animate-pulse" /> Online
                                        </span>
                                      ) : (
                                        formatLastSeen(interest.receiver_lastSeen)
                                      )}
                                    </p>
                                  </div>
                                  <span className="text-[10px] md:text-xs text-gray-400">
                                    {formatTimestamp(interest.created_at)}
                                  </span>
                                </div>
                                {interest.message && (
                                  <p className="text-xs md:text-sm text-gray-600 mt-1 md:mt-2 bg-gray-50 p-1.5 md:p-2 rounded-lg">
                                    "{interest.message}"
                                  </p>
                                )}
                                <div className="mt-2 md:mt-3">
                                  {interest.status === 'pending' && (
                                    <span className="inline-flex items-center gap-1 md:gap-2 px-2 md:px-3 py-0.5 md:py-1.5 bg-amber-50 text-amber-600 rounded-lg text-xs md:text-sm font-medium">
                                      <FiClock className="text-xs md:text-sm" /> Pending
                                    </span>
                                  )}
                                  {interest.status === 'accepted' && (
                                    <span className="inline-flex items-center gap-1 md:gap-2 px-2 md:px-3 py-0.5 md:py-1.5 bg-teal-50 text-teal-600 rounded-lg text-xs md:text-sm font-medium">
                                      <FiCheckCircle className="text-xs md:text-sm" /> Accepted
                                    </span>
                                  )}
                                  {interest.status === 'rejected' && (
                                    <span className="inline-flex items-center gap-1 md:gap-2 px-2 md:px-3 py-0.5 md:py-1.5 bg-gray-50 text-gray-500 rounded-lg text-xs md:text-sm font-medium">
                                      <FiXCircle className="text-xs md:text-sm" /> Declined
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activityData.sentInterests.length === 0 && activityData.receivedInterests.length === 0 && (
                    <div className="text-center py-10 md:py-20">
                      <div className="w-16 h-16 md:w-24 md:h-24 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-5">
                        <FiActivity className="text-2xl md:text-4xl text-rose-300" />
                      </div>
                      <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2 md:mb-3">No Activity Yet</h3>
                      <p className="text-gray-400 text-sm md:text-base mb-4 md:mb-6 px-4">
                        Your interests, reports, and other activities will appear here.
                      </p>
                      <button
                        onClick={() => setActiveTab('suggested')}
                        className="px-5 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-lg font-semibold text-sm md:text-base hover:shadow-lg transition"
                      >
                        Browse Matches
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Chat Tab */}
              {activeTab === 'chat' && (
                <div className="space-y-3 md:space-y-4">
                  {chatData.conversations.length > 0 ? (
                    <>
                      <div className="space-y-2 md:space-y-3">
                        {chatData.conversations.map((conversation) => {
                          const otherParticipant = conversation.participants?.find(p => p.email !== finalData.userEmail);
                          const lastMessage = conversation.last_message;
                          const unreadCount = conversation.unread_count || 0;

                          return (
                            <div
                              key={conversation._id}
                              onClick={() => handleOpenChat(conversation)}
                              className={`bg-white rounded-xl shadow-sm border ${unreadCount > 0 ? 'border-rose-200 bg-rose-50/20' : 'border-gray-100'} p-3 md:p-4 hover:shadow-md transition cursor-pointer`}
                            >
                              <div className="flex items-center gap-2 md:gap-4">
                                <div className="relative flex-shrink-0">
                                  <div className="w-10 h-10 md:w-14 md:h-14 bg-gray-100 rounded-full overflow-hidden">
                                    {otherParticipant?.profile_img ? (
                                      <img src={otherParticipant.profile_img} alt={otherParticipant?.name} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center bg-rose-50">
                                        <FiUser className="text-lg md:text-2xl text-rose-300" />
                                      </div>
                                    )}
                                  </div>
                                  {/* RED DOT ON IMAGE FOR UNREAD MESSAGES - UPDATE THIS SECTION */}
                                  {unreadCount > 0 && (
                                    <span className="absolute top-0 right-0 w-2.5 h-2.5 md:w-3 md:h-3 bg-red-500 rounded-full ring-2 ring-white"></span>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 sm:gap-2">
                                    <div>
                                      <h4 className="font-semibold text-gray-800 text-sm md:text-base truncate">{otherParticipant?.name || 'Unknown'}</h4>
                                      <p className="text-xs md:text-sm text-gray-500 truncate">{otherParticipant?.email}</p>
                                    </div>
                                    <span className="text-[10px] md:text-xs text-gray-400 whitespace-nowrap">
                                      {lastMessage && formatTimestamp(lastMessage.created_at)}
                                    </span>
                                  </div>
                                  {lastMessage && (
                                    <p className={`text-xs md:text-sm mt-0.5 md:mt-1 truncate ${unreadCount > 0 ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>
                                      <span className="font-medium">
                                        {lastMessage.sender_email === finalData.userEmail ? 'You: ' : ''}
                                      </span>
                                      {lastMessage.content}
                                    </p>
                                  )}
                                </div>
                                <div className="flex gap-1 md:gap-2 flex-shrink-0">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenChat(conversation);
                                    }}
                                    className="px-2 md:px-4 py-1 md:py-2 bg-rose-50 text-rose-600 rounded-lg text-xs md:text-sm font-semibold hover:bg-rose-100 transition whitespace-nowrap"
                                  >
                                    Open
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setChatToClear(conversation._id);
                                      setShowClearChatConfirm(true);
                                    }}
                                    className="p-1 md:p-2 text-gray-400 hover:text-blue-500 transition"
                                    title="Clear Chat History"
                                  >
                                    <MdCleaningServices className="text-sm md:text-lg" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-10 md:py-20">
                      <div className="w-16 h-16 md:w-24 md:h-24 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-5">
                        <FiMessageCircle className="text-2xl md:text-4xl text-rose-300" />
                      </div>
                      <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2 md:mb-3">No Chats Yet</h3>
                      <p className="text-gray-400 text-sm md:text-base mb-4 md:mb-6 px-4">Start connecting with your matches after they accept your interest.</p>
                      <button
                        onClick={() => setActiveTab('suggested')}
                        className="px-5 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-lg font-semibold text-sm md:text-base hover:shadow-lg transition"
                      >
                        Find Matches
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filters Modal */}
      {showFilters && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 md:p-4" onClick={() => setShowFilters(false)}>
          <div className="bg-white w-full max-w-2xl rounded-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-4 md:px-6 py-3 md:py-5 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <div className="flex items-center gap-1 md:gap-2.5">
                <FiFilter className="text-rose-500 text-lg md:text-xl" />
                <h3 className="font-bold text-gray-800 text-base md:text-lg">Filters</h3>
                {getActiveFilterCount() > 0 && <span className="bg-rose-100 text-rose-600 text-xs md:text-sm font-bold px-1.5 md:px-2.5 py-0.5 md:py-1 rounded-full">{getActiveFilterCount()} active</span>}
              </div>
              <button onClick={() => setShowFilters(false)} className="w-7 h-7 md:w-9 md:h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition">
                <FiX className="text-gray-400 text-base md:text-lg" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-4 md:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-7">
                <div className="space-y-2 md:space-y-3">
                  <h4 className="font-semibold text-gray-700 text-sm md:text-base flex items-center gap-1 md:gap-2">
                    <FaBirthdayCake className="text-rose-400 text-xs md:text-sm" /> Age Range
                  </h4>
                  <div className="grid grid-cols-2 gap-2 md:gap-3">
                    <input
                      type="number"
                      min="18"
                      max="100"
                      value={activeFilters.minAge}
                      onChange={(e) => handleFilterChange('minAge', e.target.value)}
                      className="w-full px-3 py-2 md:px-4 md:py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent text-sm md:text-base"
                      placeholder="Min"
                    />
                    <input
                      type="number"
                      min="18"
                      max="100"
                      value={activeFilters.maxAge}
                      onChange={(e) => handleFilterChange('maxAge', e.target.value)}
                      className="w-full px-3 py-2 md:px-4 md:py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent text-sm md:text-base"
                      placeholder="Max"
                    />
                  </div>
                </div>

                <div className="space-y-2 md:space-y-3">
                  <h4 className="font-semibold text-gray-700 text-sm md:text-base flex items-center gap-1 md:gap-2">
                    <FiUser className="text-rose-400 text-xs md:text-sm" /> Height (cm)
                  </h4>
                  <div className="grid grid-cols-2 gap-2 md:gap-3">
                    <input
                      type="number"
                      min="100"
                      max="250"
                      value={activeFilters.minHeight}
                      onChange={(e) => handleFilterChange('minHeight', e.target.value)}
                      className="w-full px-3 py-2 md:px-4 md:py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent text-sm md:text-base"
                      placeholder="Min"
                    />
                    <input
                      type="number"
                      min="100"
                      max="250"
                      value={activeFilters.maxHeight}
                      onChange={(e) => handleFilterChange('maxHeight', e.target.value)}
                      className="w-full px-3 py-2 md:px-4 md:py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent text-sm md:text-base"
                      placeholder="Max"
                    />
                  </div>
                </div>

                <div className="space-y-2 md:space-y-3">
                  <h4 className="font-semibold text-gray-700 text-sm md:text-base flex items-center gap-1 md:gap-2">
                    <FiUser className="text-rose-400 text-xs md:text-sm" /> Weight (kg)
                  </h4>
                  <div className="grid grid-cols-2 gap-2 md:gap-3">
                    <input
                      type="number"
                      min="30"
                      max="200"
                      value={activeFilters.minWeight}
                      onChange={(e) => handleFilterChange('minWeight', e.target.value)}
                      className="w-full px-3 py-2 md:px-4 md:py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent text-sm md:text-base"
                      placeholder="Min"
                    />
                    <input
                      type="number"
                      min="30"
                      max="200"
                      value={activeFilters.maxWeight}
                      onChange={(e) => handleFilterChange('maxWeight', e.target.value)}
                      className="w-full px-3 py-2 md:px-4 md:py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent text-sm md:text-base"
                      placeholder="Max"
                    />
                  </div>
                </div>

                <div className="space-y-2 md:space-y-3">
                  <h4 className="font-semibold text-gray-700 text-sm md:text-base flex items-center gap-1 md:gap-2">
                    <FiMapPin className="text-rose-400 text-xs md:text-sm" /> Location
                  </h4>
                  <input
                    type="text"
                    value={activeFilters.homeCity}
                    onChange={(e) => handleFilterChange("homeCity", e.target.value.replace(/[^a-zA-Z\s]/g, "").replace(/\s{2,}/g, " "))}
                    className="w-full px-3 py-2 md:px-4 md:py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent text-sm md:text-base"
                    placeholder="Home City"
                  />
                  <input
                    type="text"
                    value={activeFilters.currentCity}
                    onChange={(e) => handleFilterChange("currentCity", e.target.value.replace(/[^a-zA-Z\s]/g, "").replace(/\s{2,}/g, " "))}
                    className="w-full px-3 py-2 md:px-4 md:py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent text-sm md:text-base mt-2 md:mt-3"
                    placeholder="Current Town"
                  />
                </div>

                <FilterCheckboxGroup
                  title="Marital Status"
                  icon={<FiUsers className="text-rose-400 text-xs md:text-sm" />}
                  options={filterOptions.maritalStatus}
                  filterKey="maritalStatus"
                />
                <FilterCheckboxGroup
                  title="Education"
                  icon={<FaUserGraduate className="text-rose-400 text-xs md:text-sm" />}
                  options={filterOptions.education}
                  filterKey="education"
                />
                <FilterCheckboxGroup
                  title="Profession"
                  icon={<FiBriefcase className="text-rose-400 text-xs md:text-sm" />}
                  options={filterOptions.profession}
                  filterKey="profession"
                />
                <FilterCheckboxGroup
                  title="Annual Package"
                  icon={<FaChartLine className="text-rose-400 text-xs md:text-sm" />}
                  options={filterOptions.annualPackage}
                  filterKey="annualPackage"
                />
                <FilterCheckboxGroup
                  title="Employment"
                  icon={<FiBriefcase className="text-rose-400 text-xs md:text-sm" />}
                  options={filterOptions.employmentType}
                  filterKey="employmentType"
                />
              </div>
            </div>

            <div className="px-4 md:px-6 py-3 md:py-4 border-t border-gray-100 flex justify-end gap-2 md:gap-3 bg-white sticky bottom-0">
              <button
                onClick={handleClearFilters}
                className="px-4 md:px-5 py-2 md:py-2.5 text-gray-600 hover:bg-gray-50 rounded-lg transition text-sm md:text-base font-medium"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="px-5 md:px-6 py-2 md:py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-lg hover:shadow-md transition text-sm md:text-base font-semibold"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Interest Modal */}
      {showInterestModal && interestTarget && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 md:p-4 z-50" onClick={() => { setShowInterestModal(false); setInterestTarget(null); setInterestMessage(''); }}>
          <div className="bg-white rounded-2xl max-w-md w-full p-4 md:p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded-full overflow-hidden flex-shrink-0">
                {interestTarget.profileImg ? (
                  <img src={interestTarget.profileImg} alt={interestTarget.fullName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-rose-50">
                    <FiUser className="text-xl md:text-2xl text-rose-300" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-bold text-gray-800">{interestTarget.fullName}</h3>
                <p className="text-xs md:text-sm text-gray-500">Send Interest</p>
              </div>
            </div>
            <textarea
              value={interestMessage}
              onChange={(e) => {
                let value = e.target.value;
                value = value.replace(/[^a-zA-Z\s]/g, '');
                value = value.replace(/\s+/g, ' ');
                value = value.trimStart();
                setInterestMessage(value);
              }}
              placeholder="Write a personalized message (optional)"
              className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent text-sm md:text-base min-h-[100px] resize-none"
            />
            <div className="flex gap-2 md:gap-3 mt-4 md:mt-6">
              <button
                onClick={() => { setShowInterestModal(false); setInterestTarget(null); setInterestMessage(''); }}
                className="flex-1 py-2 md:py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition font-medium text-sm md:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleSendInterest}
                disabled={interestLoading}
                className="flex-1 py-2 md:py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl hover:shadow-lg transition font-semibold text-sm md:text-base flex items-center justify-center gap-1 md:gap-2 disabled:opacity-50"
              >
                {interestLoading ? (
                  <FiLoader className="animate-spin text-base md:text-lg" />
                ) : (
                  <FiSend className="text-base md:text-lg" />
                )} Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && reportTarget && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 md:p-4 z-50" onClick={() => { setShowReportModal(false); setReportTarget(null); setReportReason(''); setReportDescription(''); }}>
          <div className="bg-white rounded-2xl max-w-md w-full p-4 md:p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-100 rounded-full overflow-hidden flex-shrink-0">
                {reportTarget.profileImg ? (
                  <img src={reportTarget.profileImg} alt={reportTarget.fullName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-rose-50">
                    <FiUser className="text-xl md:text-2xl text-rose-300" />
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-bold text-gray-800">{reportTarget.fullName}</h3>
                <p className="text-xs md:text-sm text-gray-500">Report Profile</p>
              </div>
            </div>

            <div className="space-y-3 md:space-y-4">
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">Reason for reporting</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full px-3 py-2 md:px-4 md:py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent text-sm md:text-base"
                >
                  <option value="">Select a reason</option>
                  {reportReasons.map(reason => (
                    <option key={reason} value={reason}>{reason}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">Additional details (optional)</label>
                <textarea
                  value={reportDescription}
                  onChange={(e) => {
                    let value = e.target.value;
                    value = value.replace(/[^a-zA-Z\s]/g, '');
                    value = value.replace(/\s+/g, ' ');
                    value = value.trimStart();
                    setReportDescription(value);
                  }}
                  placeholder="Provide more information..."
                  className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent text-sm md:text-base min-h-[80px] resize-none"
                />
              </div>
            </div>

            <div className="flex gap-2 md:gap-3 mt-4 md:mt-6">
              <button
                onClick={() => { setShowReportModal(false); setReportTarget(null); setReportReason(''); setReportDescription(''); }}
                className="flex-1 py-2 md:py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition font-medium text-sm md:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleReportProfile}
                disabled={!reportReason || reportLoading}
                className="flex-1 py-2 md:py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition font-semibold text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 md:gap-2"
              >
                {reportLoading ? (
                  <FiLoader className="animate-spin text-base md:text-lg" />
                ) : (
                  <FiFlag className="text-base md:text-lg" />
                )} Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Modal - High z-index to override chatbot */}
      {showChatModal && chatData.activeConversation && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-2 md:p-4" onClick={() => setShowChatModal(false)}>
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[95vh] md:max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            {/* Chat Header */}
            <div className="px-3 md:px-6 py-2 md:py-4 bg-gradient-to-r from-rose-500 to-pink-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-12 md:h-12 bg-white/20 rounded-full overflow-hidden flex-shrink-0">
                  {chatData.activeConversation.participants
                    ?.find(p => p.email !== finalData.userEmail)?.profile_img ? (
                    <img
                      src={chatData.activeConversation.participants.find(p => p.email !== finalData.userEmail).profile_img}
                      alt="Chat"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FiUser className="text-lg md:text-2xl text-white" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm md:text-lg truncate">
                    {chatData.activeConversation.participants?.find(p => p.email !== finalData.userEmail)?.name}
                  </h3>
                  <p className="text-white/80 text-xs md:text-sm flex items-center gap-1 md:gap-2 truncate">
                    {chatData.activeConversation.participants?.find(p => p.email !== finalData.userEmail)?.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 md:gap-2">
                <button
                  onClick={() => setShowChatModal(false)}
                  className="p-1.5 md:p-2 hover:bg-white/20 rounded-lg transition"
                >
                  <FiX className="text-sm md:text-xl" />
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-3 md:p-6 bg-gray-50 space-y-3 md:space-y-4">
              {chatData.messages.length > 0 ? (
                chatData.messages.map((message, index) => {
                  const isOwn = message.sender_email === finalData.userEmail;
                  const isTemp = message._id?.startsWith('temp_');

                  return (
                    <div key={message._id || index} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] md:max-w-[70%] ${isOwn
                        ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white'
                        : 'bg-white text-gray-800'} rounded-2xl px-3 py-2 md:px-4 md:py-3 shadow-sm ${isTemp ? 'opacity-70' : ''}`}>
                        <p className="text-xs md:text-sm break-words">{message.content}</p>
                        <div className={`text-[10px] md:text-xs mt-1 ${isOwn ? 'text-white/70' : 'text-gray-400'} flex items-center justify-end gap-1`}>
                          {formatTimestamp(message.created_at)}
                          {isOwn && message.read && <FaCheckDouble className="text-[10px] md:text-xs" />}
                          {isOwn && !message.read && <FiCheck className="text-[10px] md:text-xs" />}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 md:py-10">
                  <div className="w-12 h-12 md:w-20 md:h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-4">
                    <FiMessageCircle className="text-xl md:text-3xl text-rose-300" />
                  </div>
                  <p className="text-gray-500 text-sm md:text-base">No messages yet. Start the conversation!</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-2 md:p-4 bg-white border-t border-gray-100">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleMessageChange}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && !messageLoading && handleSendMessage()}
                  onFocus={() => handleTyping(true)}
                  onBlur={() => handleTyping(false)}
                  placeholder="Type your message... (50 words max, no numbers)"
                  className="flex-1 px-3 py-2 md:px-4 md:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent text-sm md:text-base"
                  disabled={messageLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || messageLoading}
                  className="px-3 md:px-6 py-2 md:py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl hover:shadow-lg transition font-semibold text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 md:gap-2"
                >
                  {messageLoading ? (
                    <FiLoader className="animate-spin text-base md:text-lg" />
                  ) : (
                    <FiSend className="text-base md:text-lg" />
                  )} <span className="hidden xs:inline">Send</span>
                </button>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">
                Only letters, spaces, and basic punctuation allowed. No numbers.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Clear Chat Confirmation */}
      {showClearChatConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 md:p-4 z-50" onClick={() => { setShowClearChatConfirm(false); setChatToClear(null); }}>
          <div className="bg-white rounded-2xl max-w-md w-full p-4 md:p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-12 h-12 md:w-20 md:h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-5">
                <FiTrash2 className="text-xl md:text-3xl text-blue-500" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2 md:mb-3">Clear Chat History</h3>
              <p className="text-gray-500 text-sm md:text-base mb-4 md:mb-6">
                Are you sure you want to clear all messages in this chat? The conversation will remain but all messages will be deleted. This action cannot be undone.
              </p>
              <div className="flex gap-2 md:gap-3">
                <button
                  onClick={() => { setShowClearChatConfirm(false); setChatToClear(null); }}
                  className="flex-1 py-2 md:py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition font-medium text-sm md:text-base"
                  disabled={clearChatLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleClearChat(chatToClear)}
                  disabled={clearChatLoading}
                  className="flex-1 py-2 md:py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition font-semibold text-sm md:text-base disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {clearChatLoading ? (
                    <FiLoader className="animate-spin text-sm md:text-base" />
                  ) : null} Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Chatbot />
      <Footer />

      {/* Show appropriate modal based on context */}
      {showMatchModal && selectedMatch && (
        activeTab === 'activity' ? (
          <ActivityProfileModal
            match={selectedMatch}
            onClose={() => { setShowMatchModal(false); setSelectedMatch(null); }}
            isPremiumUser={isPremiumUser}
          />
        ) : (
          <MatchDetailModal
            match={selectedMatch}
            onClose={() => { setShowMatchModal(false); setSelectedMatch(null); }}
            onAddToWatchlist={handleAddToWatchlist}
            isPremiumUser={isPremiumUser}
          />
        )
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