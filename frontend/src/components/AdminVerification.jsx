import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import {
    SearchCheck, User, Mail, MapPin, GraduationCap, Briefcase,
    Users, Heart, Church, CheckCircle, XCircle, Eye, Trash2,
    Filter, RefreshCw, Shield, ChevronRight, Calendar,
    Phone, Globe, Award, Clock, AlertCircle, ChevronLeft,
    ChevronRight as RightChevron, Info, Home, Cake, Target,
    BookOpen, Star, Languages, BriefcaseIcon, School, Building,
    Map, HeartPulse, UsersRound, HandHeart, Sparkles
} from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const gold = "oklch(70.4%_0.191_22.216)";
const red400 = "#f87171";
const emerald500 = "#10b981";

const AdminVerification = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("pending");
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 6;

    // Fetch all users
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${BACKEND_URL}/admin/verification/users`);
            setUsers(res.data);
            filterUsers(res.data, activeTab, searchTerm);
            setCurrentPage(0);
        } catch (err) {
            console.error("Error fetching users:", err);
            toast.error("Failed to fetch users.");
        } finally {
            setLoading(false);
        }
    };

    // Filter users based on tab and search
    const filterUsers = (userList, tab = activeTab, search = searchTerm) => {
        let filtered = userList;

        // Filter by verification status
        if (tab === "pending") {
            filtered = filtered.filter(user => !user.verified);
        } else if (tab === "verified") {
            filtered = filtered.filter(user => user.verified);
        }

        // Filter by search term
        if (search.trim()) {
            const term = search.toLowerCase();
            filtered = filtered.filter(user =>
                user.email?.toLowerCase().includes(term) ||
                user.personalInfo?.fullName?.toLowerCase().includes(term) ||
                user.membershipPlan?.toLowerCase().includes(term)
            );
        }

        setFilteredUsers(filtered);
        setCurrentPage(0);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        filterUsers(users, activeTab, searchTerm);
    }, [activeTab, searchTerm, users]);

    // Pagination
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentUsers = filteredUsers.slice(startIndex, endIndex);

    // Truncate email for display
    const truncateEmail = (email, maxLength = 20) => {
        if (!email) return "";
        if (email.length <= maxLength) return email;
        return email.substring(0, maxLength - 3) + '...';
    };

    // Verify user with SweetAlert
    const handleVerify = async (user) => {
        const result = await Swal.fire({
            title: 'Verify User Profile?',
            html: `
        <div style="text-align: left;">
          <p>Are you sure you want to verify this user profile?</p>
          <div style="background: #f8fafc; padding: 12px; border-radius: 8px; margin-top: 12px;">
            <p style="margin: 4px 0;"><strong>Name:</strong> ${user.personalInfo?.fullName || 'N/A'}</p>
            <p style="margin: 4px 0;"><strong>Email:</strong> ${user.email}</p>
            <p style="margin: 4px 0;"><strong>Plan:</strong> ${user.membershipPlan || 'N/A'}</p>
          </div>
        </div>
      `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: emerald500,
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Verify Now',
            cancelButtonText: 'Cancel',
            reverseButtons: true,
            customClass: {
                popup: 'rounded-xl'
            }
        });

        if (result.isConfirmed) {
            try {
                await axios.post(`${BACKEND_URL}/admin/verification/verify`, { email: user.email });

                Swal.fire({
                    title: 'Verified Successfully!',
                    text: `User ${user.email} has been verified.`,
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                    customClass: {
                        popup: 'rounded-xl'
                    }
                });

                fetchUsers();
                setSelectedUser(null);
            } catch (err) {
                console.error(err);
                Swal.fire({
                    title: 'Verification Failed',
                    text: err.response?.data?.detail || "Error verifying user",
                    icon: 'error',
                    customClass: {
                        popup: 'rounded-xl'
                    }
                });
            }
        }
    };

    // Delete user with SweetAlert
    const handleDelete = async (user) => {
        const result = await Swal.fire({
            title: 'Delete User Profile?',
            html: `
        <div style="text-align: left;">
          <p style="color: #ef4444; font-weight: 600;">This action cannot be undone!</p>
          <div style="background: #fef2f2; padding: 12px; border-radius: 8px; margin-top: 12px; border-left: 4px solid #ef4444;">
            <p style="margin: 4px 0;"><strong>Name:</strong> ${user.personalInfo?.fullName || 'N/A'}</p>
            <p style="margin: 4px 0;"><strong>Email:</strong> ${user.email}</p>
            <p style="margin: 4px 0;"><strong>Plan:</strong> ${user.membershipPlan || 'N/A'}</p>
          </div>
        </div>
      `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Delete Permanently',
            cancelButtonText: 'Keep Profile',
            reverseButtons: true,
            customClass: {
                popup: 'rounded-xl'
            }
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`${BACKEND_URL}/admin/verification/delete`, { data: { email: user.email } });

                Swal.fire({
                    title: 'Deleted!',
                    text: `User ${user.email} has been deleted.`,
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                    customClass: {
                        popup: 'rounded-xl'
                    }
                });

                fetchUsers();
                setSelectedUser(null);
            } catch (err) {
                console.error(err);
                Swal.fire({
                    title: 'Delete Failed',
                    text: err.response?.data?.detail || "Error deleting user",
                    icon: 'error',
                    customClass: {
                        popup: 'rounded-xl'
                    }
                });
            }
        }
    };

    // Open user detail modal
    const openUserDetails = (user) => {
        setSelectedUser(user);
    };

    // Close modal
    const closeModal = () => {
        setSelectedUser(null);
    };

    // Get section icon and title
    const getSectionInfo = (section) => {
        const sections = {
            personalInfo: { icon: User, title: "Personal Information", color: "#3b82f6" },
            locationInfo: { icon: MapPin, title: "Location Details", color: "#8b5cf6" },
            educationInfo: { icon: GraduationCap, title: "Education Background", color: "#10b981" },
            careerInfo: { icon: BriefcaseIcon, title: "Career Information", color: "#f59e0b" },
            familyInfo: { icon: UsersRound, title: "Family Details", color: "#ec4899" },
            partnerInfo: { icon: HeartPulse, title: "Partner Preferences", color: "#ef4444" },
            religionInfo: { icon: Church, title: "Religious Background", color: "#8b5cf6" },
            aboutYourself: { icon: Info, title: "About Yourself", color: gold },
            aboutFamily: { icon: Home, title: "About Family", color: "#10b981" }
        };
        return sections[section] || { icon: Info, title: section.replace('Info', ''), color: gold };
    };

    // Format key to readable text
    const formatKey = (key) => {
        return key
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim();
    };

    // Handle profile image display
    const renderProfileImage = (user, size = "medium") => {
        const dimensions = {
            small: "w-12 h-12",
            medium: "w-16 h-16",
            large: "w-24 h-24"
        }[size];

        const borderColor = user.verified ? emerald500 : gold;

        if (user.personalInfo?.profileImg && user.personalInfo.profileImg.startsWith('http')) {
            return (
                <div className="relative">
                    <img
                        src={user.personalInfo.profileImg}
                        alt={user.personalInfo.fullName || "User"}
                        className={`${dimensions} rounded-full object-cover border-2 shadow-md`}
                        style={{ borderColor }}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                        }}
                    />
                    {user.verified && (
                        <div className="absolute -top-1 -right-1 bg-emerald-500 text-white p-1 rounded-full shadow-md">
                            <CheckCircle className="w-3 h-3" />
                        </div>
                    )}
                </div>
            );
        }

        return (
            <div className={`${dimensions} rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border-2 shadow-md`}
                style={{ borderColor }}>
                <User className={`${size === "small" ? "w-6 h-6" : size === "medium" ? "w-8 h-8" : "w-12 h-12"} text-gray-500`} />
                {user.verified && (
                    <div className="absolute -top-1 -right-1 bg-emerald-500 text-white p-1 rounded-full">
                        <CheckCircle className="w-3 h-3" />
                    </div>
                )}
            </div>
        );
    };

    // Render detail field - FIXED: Removed TypeScript annotation
    const renderDetailField = (label, value, icon = null) => {
        if (!value) return null;

        return (
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                {icon && (
                    <div className="p-2 rounded-md bg-gray-50 flex-shrink-0">
                        {icon}
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{label}</p>
                    <p className="text-sm text-gray-900 font-medium">{value}</p>
                </div>
            </div>
        );
    };

    // Render section in modal
    const renderSection = (section, data) => {
        if (!data || Object.keys(data).length === 0) return null;

        const { icon: Icon, title, color } = getSectionInfo(section);

        return (
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-3" style={{ backgroundColor: `${color}10` }}>
                    <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20` }}>
                        <Icon className="w-5 h-5" style={{ color }} />
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg">{title}</h3>
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(data).map(([key, value]) => (
                        value && (
                            <div key={key} className="bg-white rounded-lg p-3 border border-gray-200 hover:shadow-sm transition-shadow">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                                    {formatKey(key)}
                                </p>
                                <p className="text-sm text-gray-900 font-medium">
                                    {value}
                                </p>
                            </div>
                        )
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="p-4 md:p-6 space-y-6 bg-gradient-to-br from-gray-50 via-white to-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3" style={{ color: gold }}>
                        <div className="p-2 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200">
                            <SearchCheck className="w-6 h-6 md:w-8 md:h-8" />
                        </div>
                        <div>
                            <span>Profile Verification Dashboard</span>
                            <p className="text-gray-600 text-sm md:text-base mt-1 font-normal">
                                Review and verify user profiles before publishing
                            </p>
                        </div>
                    </h1>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchUsers}
                        disabled={loading}
                        className="px-4 py-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 flex items-center gap-2 text-sm font-medium transition-all hover:shadow-sm disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        <span className="hidden sm:inline">Refresh Data</span>
                        <span className="sm:hidden">Refresh</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl p-5 border border-blue-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Profiles</p>
                            <p className="text-2xl font-bold mt-1" style={{ color: gold }}>{users.length}</p>
                        </div>
                        <div className="p-3 rounded-full bg-blue-100">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-white to-amber-50 rounded-xl p-5 border border-amber-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Pending Verification</p>
                            <p className="text-2xl font-bold mt-1 text-amber-600">
                                {users.filter(u => !u.verified).length}
                            </p>
                        </div>
                        <div className="p-3 rounded-full bg-amber-100">
                            <AlertCircle className="w-6 h-6 text-amber-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-white to-emerald-50 rounded-xl p-5 border border-emerald-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Verified Profiles</p>
                            <p className="text-2xl font-bold mt-1 text-emerald-600">
                                {users.filter(u => u.verified).length}
                            </p>
                        </div>
                        <div className="p-3 rounded-full bg-emerald-100">
                            <CheckCircle className="w-6 h-6 text-emerald-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-white to-purple-50 rounded-xl p-5 border border-purple-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Premium Users</p>
                            <p className="text-2xl font-bold mt-1 text-purple-600">
                                {users.filter(u => u.membershipPlan === 'premium').length}
                            </p>
                        </div>
                        <div className="p-3 rounded-full bg-purple-100">
                            <Star className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs and Search */}
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Tabs */}
                    <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
                        <button
                            onClick={() => setActiveTab("pending")}
                            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === "pending"
                                    ? 'bg-white shadow-md transform scale-[1.02]'
                                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                                }`}
                            style={{
                                color: activeTab === "pending" ? red400 : 'inherit',
                                border: activeTab === "pending" ? `2px solid ${red400}` : '2px solid transparent'
                            }}
                        >
                            <AlertCircle className="w-4 h-4" />
                            <span>Pending ({users.filter(u => !u.verified).length})</span>
                        </button>
                        <button
                            onClick={() => setActiveTab("verified")}
                            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === "verified"
                                    ? 'bg-white shadow-md transform scale-[1.02]'
                                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                                }`}
                            style={{
                                color: activeTab === "verified" ? emerald500 : 'inherit',
                                border: activeTab === "verified" ? `2px solid ${emerald500}` : '2px solid transparent'
                            }}
                        >
                            <CheckCircle className="w-4 h-4" />
                            <span>Verified ({users.filter(u => u.verified).length})</span>
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search by name, email, or plan..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 text-sm border rounded-xl focus:ring-2 focus:outline-none bg-gray-50"
                                style={{ borderColor: gold }}
                            />
                            <SearchCheck className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm("")}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <XCircle className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* User Cards Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2" style={{ borderColor: gold }}></div>
                        <SearchCheck className="absolute inset-0 m-auto w-8 h-8" style={{ color: gold }} />
                    </div>
                    <p className="mt-4 text-gray-600 text-lg">Loading profiles...</p>
                </div>
            ) : filteredUsers.length === 0 ? (
                <div className="text-center py-16 bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                        <User className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No profiles found</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                        {searchTerm
                            ? `No profiles match "${searchTerm}"`
                            : activeTab === "pending"
                                ? "All profiles have been verified!"
                                : "No verified profiles yet"}
                    </p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {currentUsers.map((user) => (
                            <div
                                key={user.email}
                                className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group hover:-translate-y-1"
                            >
                                {/* User Header */}
                                <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="relative">
                                                {renderProfileImage(user, "medium")}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-bold text-gray-900 text-lg truncate group-hover:text-gray-700">
                                                    {user.personalInfo?.fullName || "Unnamed User"}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Mail className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                                    <span className="text-gray-600 text-sm truncate" title={user.email}>
                                                        {user.email}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${user.verified
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                : 'bg-amber-50 text-amber-700 border-amber-200'
                                            }`}>
                                            {user.verified ? 'Verified' : 'Pending'}
                                        </span>
                                    </div>
                                </div>

                                {/* User Info */}
                                <div className="p-5 space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-blue-50 rounded-lg p-3">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Shield className="w-4 h-4 text-blue-600" />
                                                <span className="text-xs font-medium text-gray-600">Plan</span>
                                            </div>
                                            <span className={`font-bold text-sm ${user.membershipPlan === 'premium'
                                                    ? 'text-amber-600'
                                                    : user.membershipPlan === 'gold'
                                                        ? 'text-yellow-600'
                                                        : 'text-blue-600'
                                                }`}>
                                                {user.membershipPlan ? user.membershipPlan.charAt(0).toUpperCase() + user.membershipPlan.slice(1) : 'Free'}
                                            </span>
                                        </div>

                                        <div className="bg-emerald-50 rounded-lg p-3">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Eye className="w-4 h-4 text-emerald-600" />
                                                <span className="text-xs font-medium text-gray-600">Published</span>
                                            </div>
                                            <span className={`font-bold text-sm ${user.isPublished ? 'text-emerald-600' : 'text-gray-600'
                                                }`}>
                                                {user.isPublished ? 'Yes' : 'No'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        {user.personalInfo?.phone && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                <span className="truncate">{user.personalInfo.phone}</span>
                                            </div>
                                        )}

                                        {user.personalInfo?.city && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                <span className="truncate">{user.personalInfo.city}</span>
                                            </div>
                                        )}

                                        {user.personalInfo?.profession && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Briefcase className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                <span className="truncate">{user.personalInfo.profession}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="p-5 pt-0 flex gap-2">
                                    <button
                                        onClick={() => openUserDetails(user)}
                                        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 hover:from-gray-200 hover:to-gray-100 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all hover:shadow-sm border border-gray-300"
                                    >
                                        <Eye className="w-4 h-4" />
                                        View Details
                                    </button>

                                    {!user.verified && (
                                        <button
                                            onClick={() => handleVerify(user)}
                                            className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all hover:shadow-lg shadow-emerald-200"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            <span className="hidden sm:inline">Verify</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6">
                            <p className="text-sm text-gray-600">
                                Showing <span className="font-semibold">{startIndex + 1}-{Math.min(endIndex, filteredUsers.length)}</span> of{" "}
                                <span className="font-semibold">{filteredUsers.length}</span> profiles
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                                    disabled={currentPage === 0}
                                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>

                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i;
                                    } else if (currentPage <= 2) {
                                        pageNum = i;
                                    } else if (currentPage >= totalPages - 3) {
                                        pageNum = totalPages - 5 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`w-10 h-10 rounded-lg font-medium transition-all ${currentPage === pageNum
                                                    ? 'text-white shadow-lg transform scale-105'
                                                    : 'text-gray-700 hover:bg-gray-50'
                                                }`}
                                            style={{
                                                backgroundColor: currentPage === pageNum ? gold : 'transparent',
                                                border: currentPage === pageNum ? 'none' : '1px solid #e5e7eb'
                                            }}
                                        >
                                            {pageNum + 1}
                                        </button>
                                    );
                                })}

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                                    disabled={currentPage === totalPages - 1}
                                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <RightChevron className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* User Detail Modal */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] md:max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-gray-300">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <div className="relative">
                                        {renderProfileImage(selectedUser, "large")}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h2 className="text-2xl font-bold text-gray-900 truncate">
                                                {selectedUser.personalInfo?.fullName || "Unnamed User"}
                                            </h2>
                                            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${selectedUser.verified
                                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                                                }`}>
                                                {selectedUser.verified ? 'Verified' : 'Pending Verification'}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Mail className="w-4 h-4" />
                                                <span className="text-sm">{selectedUser.email}</span>
                                            </div>
                                            {selectedUser.personalInfo?.phone && (
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Phone className="w-4 h-4" />
                                                    <span className="text-sm">{selectedUser.personalInfo.phone}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={closeModal}
                                    className="p-2 hover:bg-gray-100 rounded-xl ml-2 flex-shrink-0 transition-colors"
                                >
                                    <XCircle className="w-6 h-6 text-gray-500 hover:text-gray-700" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="space-y-6">
                                {/* Status Cards Row */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-blue-200">
                                                <Shield className="w-5 h-5 text-blue-700" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Membership Plan</p>
                                                <p className={`text-lg font-bold ${selectedUser.membershipPlan === 'premium'
                                                        ? 'text-amber-600'
                                                        : selectedUser.membershipPlan === 'gold'
                                                            ? 'text-yellow-600'
                                                            : 'text-blue-600'
                                                    }`}>
                                                    {selectedUser.membershipPlan ? selectedUser.membershipPlan.charAt(0).toUpperCase() + selectedUser.membershipPlan.slice(1) : 'Free'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-emerald-200">
                                                <Eye className="w-5 h-5 text-emerald-700" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Published Status</p>
                                                <p className={`text-lg font-bold ${selectedUser.isPublished ? 'text-emerald-600' : 'text-gray-600'}`}>
                                                    {selectedUser.isPublished ? 'Published' : 'Not Published'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-amber-200">
                                                <Clock className="w-5 h-5 text-amber-700" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Account Status</p>
                                                <p className={`text-lg font-bold ${selectedUser.verified ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                    {selectedUser.verified ? 'Verified' : 'Pending Review'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* About Sections */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {selectedUser.aboutYourself && (
                                        <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-5">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200">
                                                    <Info className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <h3 className="font-bold text-gray-900 text-lg">About Yourself</h3>
                                            </div>
                                            <p className="text-gray-700 leading-relaxed">{selectedUser.aboutYourself}</p>
                                        </div>
                                    )}

                                    {selectedUser.aboutFamily && (
                                        <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-5">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-100 to-emerald-200">
                                                    <Home className="w-5 h-5 text-emerald-600" />
                                                </div>
                                                <h3 className="font-bold text-gray-900 text-lg">About Family</h3>
                                            </div>
                                            <p className="text-gray-700 leading-relaxed">{selectedUser.aboutFamily}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Detailed Sections */}
                                <div className="space-y-6">
                                    {["personalInfo", "locationInfo", "educationInfo", "careerInfo", "familyInfo", "partnerInfo", "religionInfo"].map((section) => (
                                        selectedUser[section] && Object.keys(selectedUser[section]).length > 0 && (
                                            <div key={section}>
                                                {renderSection(section, selectedUser[section])}
                                            </div>
                                        )
                                    ))}

                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-gray-200 bg-gray-50">
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                <div className="text-sm text-gray-500">
                                    Last updated: {new Date(selectedUser.updatedAt || Date.now()).toLocaleDateString()}
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                    <button
                                        onClick={() => handleDelete(selectedUser)}
                                        className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all hover:shadow-lg shadow-red-200 flex-1 sm:flex-none"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                        Delete Profile
                                    </button>

                                    {!selectedUser.verified && (
                                        <button
                                            onClick={() => handleVerify(selectedUser)}
                                            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all hover:shadow-lg shadow-emerald-200 flex-1 sm:flex-none"
                                        >
                                            <CheckCircle className="w-5 h-5" />
                                            Verify Profile
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer Stats */}
            {filteredUsers.length > 0 && !selectedUser && (
                <div className="text-center text-sm text-gray-500 py-4 border-t border-gray-200 bg-white rounded-xl">
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                        <span className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Showing {filteredUsers.length} of {users.length} profiles
                        </span>
                        {searchTerm && (
                            <span className="hidden sm:block">•</span>
                        )}
                        {searchTerm && (
                            <span className="flex items-center gap-2">
                                <SearchCheck className="w-4 h-4" />
                                Matching "{searchTerm}"
                            </span>
                        )}
                        <span className="hidden sm:block">•</span>
                        <span className={`flex items-center gap-2 ${activeTab === "pending" ? 'text-amber-600' : 'text-emerald-600'}`}>
                            {activeTab === "pending" ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                            {activeTab === "pending" ? 'Pending Verification' : 'Verified Profiles'}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminVerification;