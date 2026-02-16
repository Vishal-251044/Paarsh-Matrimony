import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUserContext } from '../context/UserContext';

// Icons as components (keeping all your existing icons)
const ProfileIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const FamilyIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const PartnerIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const WatchlistIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
  </svg>
);

const FeaturesIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const PaymentIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const VerificationIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-5m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const BackIcon = () => (
  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const QuestionIcon = () => (
  <svg className="w-3 h-3 md:w-3.5 md:h-3.5 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const LockIcon = () => (
  <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const HeartIcon = () => (
  <svg className="w-7 h-7 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const ChatbotIcon = () => (
  <svg
    className="w-7 h-7 md:w-8 md:h-8 text-white"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      d="M8 10h8M8 14h5M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 01-4-.8L3 20l1.2-3.2A7.7 7.7 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
    />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// STATIC DATASET FOR GENERAL CATEGORIES
const STATIC_DATASET = {
  features: {
    questions: [
      {
        id: "premium_features",
        question: "What are the premium features?",
        answer: "**Premium Membership** ₹1,999/year – Includes:\n\n• Contact Partner Directly\n• Add to Watchlist for Shortlisting\n• View All Partner Data\n• Marriage Planning Assistance\n• Extra Discounts on Wedding Services",
        icon: <FeaturesIcon />
      },
      {
        id: "free_features",
        question: "What can I do with free account?",
        answer: "**Free Membership** ₹0 – Includes:\n\n• Manage Profile\n• Partner Recommendations\n• View Limited Partner Details\n• Apply Filters\n• Give Feedbacks\n• Limited Features Access",
        icon: <FeaturesIcon />
      },
      {
        id: "daily_recommendations",
        question: "How do daily recommendations work?",
        answer: "The match algorithm refreshes every login, and whenever a new user joins who fits your requirements, they will be suggested to you.",
        icon: <FeaturesIcon />
      },
      {
        id: "matching_algorithm",
        question: "How does your matching algorithm work?",
        answer: "The algorithm focuses on **caste, religion, and state** with higher priority, checks overall compatibility, and calculates a match percentage based on these factors.",
        icon: <FeaturesIcon />
      },
      {
        id: "mobile_app",
        question: "Do you have a mobile app?",
        answer: "Not yet. It may be published in the future, but for now you can use the website in mobile view as it is fully responsive for mobile users.",
        icon: <FeaturesIcon />
      }
    ]
  },
  payment: {
    questions: [
      {
        id: "pricing_plans",
        question: "What are your pricing plans?",
        answer: "**Premium Plan:** ₹1,999 for 1 year\n\nAfter expiry, premium access will be blocked and will work again once you renew.",
        icon: <PaymentIcon />
      },
      {
        id: "payment_methods",
        question: "What payment methods do you accept?",
        answer: "We use **Razorpay** payment gateway, which accepts:\n\n• Cards (Credit/Debit)\n• UPI\n• Net Banking\n• Wallets\n• Other online payment options",
        icon: <PaymentIcon />
      },
      {
        id: "refund_policy",
        question: "What is your refund policy?",
        answer: "Currently we do not have a refund policy. Once payment is completed, you will have access to premium features for 1 year.",
        icon: <PaymentIcon />
      },
      {
        id: "auto_renewal",
        question: "How does auto-renewal work?",
        answer: "When your plan ends, you can pay again to reactivate premium access. Your watchlist data will be blocked but never deleted, and will be restored upon renewal.",
        icon: <PaymentIcon />
      },
      {
        id: "invoice_billing",
        question: "How do I get an invoice?",
        answer: "Invoices are automatically generated and sent to your registered email after each successful payment.",
        icon: <PaymentIcon />
      }
    ]
  },
  verification: {
    questions: [
      {
        id: "verification_process",
        question: "How do I get my profile verified?",
        answer: "Profiles are verified by the admin. If any issue is found, a warning is given; if not updated, the admin may remove your profile and cancel your plan.",
        icon: <VerificationIcon />
      },
      {
        id: "verification_benefits",
        question: "What are the benefits of verification?",
        answer: "Verified profiles are suggested more smoothly and have a higher chance of getting a perfect match with genuine partners.",
        icon: <VerificationIcon />
      },
      {
        id: "photo_verification",
        question: "What is photo verification?",
        answer: "The admin reviews profile photos. If an image is found to be improper or AI-generated, a warning is given. No response/correction may lead to account removal.",
        icon: <VerificationIcon />
      },
      {
        id: "document_safety",
        question: "Are my documents safe?",
        answer: "Your information is safe, not shared with anyone, and not used by our company without permission.",
        icon: <VerificationIcon />
      },
      {
        id: "rejection_reasons",
        question: "Why was my verification rejected?",
        answer: "Common reasons include:\n\n• Unclear photos\n• Wrong or mismatched data\n• Too many reports on your profile",
        icon: <VerificationIcon />
      }
    ]
  }
};

// Component to format message text with bold formatting
const FormattedMessage = ({ text }) => {
  if (!text) return null;

  const parts = text.split(/(\*\*.*?\*\*)/g);

  return (
    <span>
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          const boldText = part.slice(2, -2);
          return <strong key={index} className="font-bold text-gray-900">{boldText}</strong>;
        }
        if (part.includes('•')) {
          const lines = part.split('\n');
          return (
            <span key={index}>
              {lines.map((line, lineIndex) => {
                if (line.trim().startsWith('•')) {
                  return (
                    <span key={lineIndex} className="block ml-2">
                      <span className="inline-block w-1.5 h-1.5 bg-gray-500 rounded-full mr-2 align-middle"></span>
                      <span className="align-middle">{line.replace('•', '').trim()}</span>
                    </span>
                  );
                }
                return <span key={lineIndex}>{line}{lineIndex < lines.length - 1 && <br />}</span>;
              })}
            </span>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
};

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const [userMembership, setUserMembership] = useState('free');
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [categoryQuestions, setCategoryQuestions] = useState([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const messagesEndRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();
  let userProfile = null;

  try {
    const profileContext = useUserContext();
    userProfile = profileContext?.userProfile || null;
  } catch (error) {
    console.log('UserProfile context not available');
  }

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const themeColor = 'oklch(70.4% 0.191 22.216)';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check login status and membership
  useEffect(() => {
    const checkLoginStatus = () => {
      const locationUser = location.state?.userEmail || location.state?.email;
      const contextUser = userProfile?.userEmail || userProfile?.email;
      const localStorageUser = localStorage.getItem('userEmail') || localStorage.getItem('email');

      const userEmailValue = locationUser || contextUser || localStorageUser;
      const token = localStorage.getItem('token') || location.state?.token || userProfile?.token;

      // Get membership from multiple possible sources
      const membership = userProfile?.membershipPlan ||
        userProfile?.membershipType ||
        userProfile?.membership ||
        localStorage.getItem('membership') ||
        'free';

      if (userEmailValue && token) {
        setIsLoggedIn(true);
        setUserEmail(userEmailValue);
        setUserMembership(membership.toLowerCase());
        setShowLoginPrompt(false);
      } else {
        setIsLoggedIn(false);
        setUserEmail(null);
        setUserMembership('free');
      }
    };

    checkLoginStatus();

    const handleLogin = () => checkLoginStatus();
    window.addEventListener('userLogin', handleLogin);
    window.addEventListener('login', handleLogin);
    window.addEventListener('storage', checkLoginStatus);

    return () => {
      window.removeEventListener('userLogin', handleLogin);
      window.removeEventListener('login', handleLogin);
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, [location.state, userProfile]);

  // Initialize chat session
  useEffect(() => {
    const initChat = async () => {
      try {
        const payload = {};
        if (isLoggedIn && userEmail) {
          payload.user_email = userEmail;
        }

        const response = await axios.post(`${BACKEND_URL}/api/chat/init`, payload);
        setSessionId(response.data.sessionId);

        let welcomeMessage = response.data.welcomeMessage;

        // Add membership info for logged-in users
        if (isLoggedIn) {
          welcomeMessage += `\n\nYou are on **${userMembership.toUpperCase()}** plan.`;
        }

        setMessages([{
          id: 1,
          text: welcomeMessage,
          sender: 'bot',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      } catch (error) {
        console.error('Failed to initialize chat:', error);
        setMessages([{
          id: 1,
          text: "Namaste! Welcome to our Matrimony platform. I'm here to help you find your perfect life partner. What would you like to know about?",
          sender: 'bot',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }
    };

    initChat();
  }, [isLoggedIn, userEmail, userMembership]);

  // Add keyframes to document head
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes slideUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-4px); }
      }
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-5px); }
      }
      .scrollbar-thin::-webkit-scrollbar { width: 4px; }
      .scrollbar-thin::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
      .scrollbar-thin::-webkit-scrollbar-thumb { background: #cbd5e0; border-radius: 10px; }
      .scrollbar-thin::-webkit-scrollbar-thumb:hover { background: #a0aec0; }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  // Category definitions with icons
  const categories = [
    {
      id: "self",
      name: "My Profile",
      icon: <ProfileIcon />,
      requiresLogin: true
    },
    {
      id: "family",
      name: "Family",
      icon: <FamilyIcon />,
      requiresLogin: true
    },
    {
      id: "partner",
      name: "Partner",
      icon: <PartnerIcon />,
      requiresLogin: true
    },
    {
      id: "watchlist",
      name: "Watchlist",
      icon: <WatchlistIcon />,
      requiresLogin: true
    },
    {
      id: "features",
      name: "Features",
      icon: <FeaturesIcon />,
      requiresLogin: false
    },
    {
      id: "payment",
      name: "Payment",
      icon: <PaymentIcon />,
      requiresLogin: false
    },
    {
      id: "verification",
      name: "Verification",
      icon: <VerificationIcon />,
      requiresLogin: false
    }
  ];

  // Fetch questions from backend for personalized categories
  const fetchCategoryQuestions = async (category) => {
    if (!category) return [];

    // For general categories, return from static dataset
    if (['features', 'payment', 'verification'].includes(category)) {
      return STATIC_DATASET[category]?.questions.map(q => ({
        id: q.id,
        text: q.question,
        question: q.question,
        category: category,
        question_id: q.id,
        requiresLogin: false,
        icon: categories.find(c => c.id === category)?.icon
      })) || [];
    }

    // For personalized categories, fetch from backend
    if (['self', 'family', 'partner', 'watchlist'].includes(category)) {
      if (!isLoggedIn) {
        setShowLoginPrompt(true);
        return [];
      }

      setIsLoadingQuestions(true);
      try {
        const response = await axios.get(`${BACKEND_URL}/api/chat/questions/${category}`, {
          params: { user_email: userEmail }
        });

        return response.data.questions.map(q => ({
          id: q.id,
          text: q.question,
          question: q.question,
          category: category,
          question_id: q.id,
          requiresLogin: true,
          icon: categories.find(c => c.id === category)?.icon
        }));
      } catch (error) {
        console.error('Failed to fetch questions:', error);

        // Handle 401 specifically
        if (error.response?.status === 401) {
          setShowLoginPrompt(true);
        }

        return [];
      } finally {
        setIsLoadingQuestions(false);
      }
    }

    return [];
  };

  // Handle category click
  const handleCategoryClick = async (category) => {
    setActiveCategory(category);

    // Check if login is required
    const categoryData = categories.find(c => c.id === category);
    if (categoryData?.requiresLogin && !isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }

    // Fetch questions for this category
    const questions = await fetchCategoryQuestions(category);
    setCategoryQuestions(questions);
  };

  // Handle question click
  const handleQuestionClick = async (question) => {
    // Check if login is required
    if (question.requiresLogin && !isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: question.question || question.text,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      let botMessage;

      // PERSONALIZED CATEGORIES - Get data from backend
      if (['self', 'family', 'partner', 'watchlist'].includes(question.category)) {
        const response = await axios.post(`${BACKEND_URL}/api/chat/ask`, {
          sessionId,
          category: question.category,
          question: question.question || question.text,
          question_id: question.question_id,
          user_email: isLoggedIn ? userEmail : null
        });

        botMessage = {
          id: messages.length + 2,
          text: response.data.answer,
          sender: 'bot',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestions: response.data.suggestions || [],
          category: question.category
        };
      }

      // GENERAL CATEGORIES - Get answer from static dataset
      if (['features', 'payment', 'verification'].includes(question.category)) {
        const categoryData = STATIC_DATASET[question.category];
        const questionData = categoryData?.questions.find(q => q.id === question.question_id);

        if (questionData) {
          botMessage = {
            id: messages.length + 2,
            text: questionData.answer,
            sender: 'bot',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            suggestions: [],
            category: question.category
          };
        }
      }

      if (botMessage) {
        setMessages(prev => [...prev, botMessage]);
      }

      setIsTyping(false);
    } catch (error) {
      console.error('Failed to get response:', error);

      // Handle specific error status codes
      let errorMessage = "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.";

      if (error.response?.status === 401) {
        errorMessage = "**Login Required**\n\nPlease login to access this information.";
        setShowLoginPrompt(true);
      } else if (error.response?.status === 404) {
        errorMessage = "I couldn't find the information you're looking for. Please try a different question.";
      }

      const botMessage = {
        id: messages.length + 2,
        text: errorMessage,
        sender: 'bot',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: [],
        category: question.category
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }
  };

  // Handle back button
  const handleBackToCategories = () => {
    setActiveCategory(null);
    setCategoryQuestions([]);
  };

  const handleLoginPromptClose = () => {
    setShowLoginPrompt(false);
  };

  const handleLoginRedirect = () => {
    setShowLoginPrompt(false);
    navigate('/login', { state: { from: 'chatbot' } });
  };

  const getUserData = () => {
    if (location.state?.userEmail || location.state?.email) {
      return {
        isLoggedIn: true,
        email: location.state.userEmail || location.state.email
      };
    }

    if (userProfile?.userEmail || userProfile?.email) {
      return {
        isLoggedIn: true,
        email: userProfile.userEmail || userProfile.email
      };
    }

    const storedEmail = localStorage.getItem('userEmail') || localStorage.getItem('email');
    const storedToken = localStorage.getItem('token');

    if (storedEmail && storedToken) {
      return {
        isLoggedIn: true,
        email: storedEmail
      };
    }

    return {
      isLoggedIn: false,
      email: null
    };
  };

  const userStatus = getUserData();

  // FIXED: Show chatbot to ALL logged-in users, not just premium
  // Only hide if not logged in at all
  if (!userStatus.isLoggedIn) {
    return null;
  }

  const showBackButton = activeCategory !== null;
  const currentQuestions = activeCategory ? categoryQuestions : categories.filter(cat => !cat.requiresLogin || isLoggedIn);

  return (
    <>
      {/* Chatbot Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed right-4 bottom-4 md:right-6 md:bottom-6 z-50 group"
      >
        <div className="relative">
          {!isOpen ? (
            <div
              className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-6"
              style={{
                backgroundColor: themeColor,
                boxShadow: `0 10px 25px -5px ${themeColor}80`,
                animation: 'float 3s ease-in-out infinite'
              }}
            >
              <div className="absolute -top-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
              <ChatbotIcon />
            </div>
          ) : (
            <div
              className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-white transform transition-all duration-300 group-hover:scale-110"
              style={{
                boxShadow: `0 10px 25px -5px ${themeColor}40`
              }}
            >
              <CloseIcon />
            </div>
          )}
        </div>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <>
          <div
            className="fixed right-4 bottom-20 md:right-6 md:bottom-24 w-[calc(100vw-2rem)] md:w-96 max-w-md h-[600px] max-h-[calc(100vh-8rem)] bg-white rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden"
            style={{
              boxShadow: `0 25px 50px -12px ${themeColor}40`,
              animation: 'slideUp 0.3s ease-out'
            }}
          >
            {/* Header */}
            <div
              className="px-5 md:px-6 py-4 flex items-center justify-between flex-shrink-0"
              style={{ backgroundColor: themeColor }}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <HeartIcon />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-base md:text-lg">Matrimony Assistant</h3>
                  <div className="flex items-center space-x-1">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <p className="text-[10px] md:text-xs text-white/90">
                      {userStatus.isLoggedIn ? `${userStatus.email?.split('@')[0] || 'User'} • ${userMembership.toUpperCase()}` : 'Ready to help'}
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 md:p-5 bg-gradient-to-b from-rose-50/30 to-white scrollbar-thin">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start gap-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.sender === 'bot' && (
                      <div
                        className="w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${themeColor}15` }}
                      >
                        <HeartIcon />
                      </div>
                    )}
                    <div className={message.sender === 'user' ? 'max-w-[85%]' : 'max-w-[78%]'}>
                      <div
                        className={`px-3.5 py-2.5 md:px-4 md:py-3 rounded-2xl ${message.sender === 'user'
                          ? 'text-white rounded-tr-none'
                          : 'bg-gray-100 text-gray-800 rounded-tl-none px-3 py-2'
                          }`}
                        style={message.sender === 'user' ? { backgroundColor: themeColor } : {}}
                      >
                        <div className="text-xs md:text-sm leading-relaxed whitespace-pre-line">
                          <FormattedMessage text={message.text} />
                        </div>
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1 px-2">{message.time}</p>

                      {/* Suggestions */}
                      {message.suggestions && message.suggestions.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {message.suggestions.map((suggestion, idx) => (
                            <button
                              key={idx}
                              className="text-[10px] md:text-xs px-2 py-1 bg-white border border-gray-200 rounded-full text-gray-600 hover:bg-gray-50 transition-colors"
                              onClick={() => {
                                const followUpQuestion = {
                                  category: message.category,
                                  question: typeof suggestion === 'string' ? suggestion : suggestion.question,
                                  question_id: suggestion.id || null,
                                  requiresLogin: ['self', 'family', 'partner', 'watchlist'].includes(message.category)
                                };
                                handleQuestionClick(followUpQuestion);
                              }}
                            >
                              {typeof suggestion === 'string' ? suggestion : suggestion.question}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex items-start gap-2 justify-start">
                    <div
                      className="w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${themeColor}15` }}
                    >
                      <HeartIcon />
                    </div>
                    <div className="max-w-[78%] bg-gray-100 px-4 py-3.5 md:px-5 md:py-3.5 rounded-2xl rounded-tl-none">
                      <div className="flex space-x-1.5">
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gray-400 rounded-full"
                          style={{ animation: 'bounce 1s infinite', animationDelay: '0ms' }}></div>
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gray-400 rounded-full"
                          style={{ animation: 'bounce 1s infinite', animationDelay: '150ms' }}></div>
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gray-400 rounded-full"
                          style={{ animation: 'bounce 1s infinite', animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Suggested Questions */}
            <div className="border-t border-gray-100 bg-gray-50/80 flex-shrink-0">
              <div className="px-3 py-2 md:px-4 md:py-3">
                {/* Back Button */}
                {showBackButton && (
                  <button
                    onClick={handleBackToCategories}
                    className="inline-flex items-center px-2 py-1 mb-2 text-xs font-medium text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    <BackIcon />
                    Back to Categories
                  </button>
                )}

                <p className="text-[10px] md:text-xs font-medium text-gray-500 mb-2 flex items-center">
                  <QuestionIcon />
                  {activeCategory ? `${activeCategory.toUpperCase()} QUESTIONS` : 'QUICK CATEGORIES'}
                </p>

                {/* Loading State */}
                {isLoadingQuestions && (
                  <div className="flex items-center justify-center py-2">
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                )}

                {/* Questions/Categories Grid */}
                {!isLoadingQuestions && (
                  <div className="flex flex-wrap gap-1.5 md:gap-2 max-h-24 md:max-h-28 overflow-y-auto scrollbar-thin pr-1">
                    {currentQuestions.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          if (!activeCategory) {
                            handleCategoryClick(item.id);
                          } else {
                            handleQuestionClick(item);
                          }
                        }}
                        className="inline-flex items-center px-2.5 py-1.5 md:px-3 md:py-1.5 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg transition-all duration-200 group shrink-0"
                        style={{
                          borderColor: `${themeColor}15`,
                        }}
                      >
                        <div
                          className="w-5 h-5 md:w-5 md:h-5 rounded-full flex items-center justify-center flex-shrink-0 mr-1.5"
                          style={{
                            backgroundColor: `${themeColor}15`,
                            color: themeColor
                          }}
                        >
                          {React.cloneElement(item.icon || (categories.find(c => c.id === item.id)?.icon || <QuestionIcon />), {
                            className: 'w-3 h-3 md:w-3.5 md:h-3.5'
                          })}
                        </div>
                        <span className="text-[11px] md:text-xs font-medium text-gray-700 whitespace-nowrap">
                          {item.text || item.name || item.question}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                <p className="text-[9px] md:text-[10px] text-gray-400 text-right mt-1.5">
                  {currentQuestions.length} {activeCategory ? 'questions' : 'categories'} • click to ask
                </p>
              </div>
            </div>
          </div>

          {/* Login Prompt Modal */}
          {showLoginPrompt && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleLoginPromptClose}></div>
              <div className="relative bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
                  <LockIcon />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                  Login Required
                </h3>
                <p className="text-sm text-gray-600 text-center mb-6">
                  Please login to access your personal profile information, family details, partner preferences, and watchlist.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={handleLoginPromptClose}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Later
                  </button>
                  <button
                    onClick={handleLoginRedirect}
                    className="flex-1 px-4 py-2 text-white rounded-lg text-sm font-medium"
                    style={{ backgroundColor: themeColor }}
                  >
                    Login Now
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Backdrop for mobile */}
          {isOpen && (
            <div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsOpen(false)}
            />
          )}
        </>
      )}
    </>
  );
};

export default Chatbot;