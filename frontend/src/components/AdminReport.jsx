import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import {
    AlertTriangle, Mail, User, ChevronDown, ChevronUp,
    Flag, Trash2, AlertCircle, MessageSquare, Users,
    Clock, Shield, Loader2, RefreshCw, Filter, X, Check,
    Search, ArrowUpDown, TrendingUp, TrendingDown
} from "lucide-react";

const gold = "oklch(70.4%_0.191_22.216)";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const AdminReport = () => {
    const [reports, setReports] = useState([]);
    const [filteredReports, setFilteredReports] = useState([]);
    const [openUser, setOpenUser] = useState(null);
    const [warningText, setWarningText] = useState({});
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterReason, setFilterReason] = useState("");
    const [sortBy, setSortBy] = useState("mostReports"); // mostReports, leastReports
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${BACKEND_URL}/admin/reports`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            if (res.data.success) {
                groupReports(res.data.reports);
            }
        } catch (err) {
            toast.error("Failed to fetch reports");
        } finally {
            setLoading(false);
        }
    };

    const groupReports = (data) => {
        const grouped = {};

        data.forEach((r) => {
            if (!grouped[r.reported_email]) {
                grouped[r.reported_email] = {
                    user: r.reported_name || "Unknown User",
                    email: r.reported_email,
                    reports: [],
                    latestReportDate: r.created_at || new Date().toISOString()
                };
            }
            grouped[r.reported_email].reports.push({
                ...r,
                created_at: r.created_at || new Date().toISOString()
            });

            // Update latest report date if this report is newer
            if (new Date(r.created_at) > new Date(grouped[r.reported_email].latestReportDate)) {
                grouped[r.reported_email].latestReportDate = r.created_at;
            }
        });

        const groupedArray = Object.values(grouped);
        setReports(groupedArray);
    };

    useEffect(() => {
        fetchReports();
    }, []);

    // Apply filters and sorting
    useEffect(() => {
        let results = [...reports];

        // Search filter
        if (searchTerm) {
            results = results.filter(user =>
                user.user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by reason
        if (filterReason) {
            results = results.filter(user =>
                user.reports.some(r =>
                    r.reason?.toLowerCase().includes(filterReason.toLowerCase()) ||
                    r.description?.toLowerCase().includes(filterReason.toLowerCase())
                )
            );
        }

        // Apply sorting (default: most reports first)
        results.sort((a, b) => {
            if (sortBy === "mostReports") {
                return b.reports.length - a.reports.length;
            } else if (sortBy === "leastReports") {
                return a.reports.length - b.reports.length;
            }
            return 0;
        });

        setFilteredReports(results);
    }, [reports, searchTerm, filterReason, sortBy]);

    const handleDeleteUser = async (email, userName) => {
        const result = await Swal.fire({
            title: 'Delete User?',
            html: `
                <div class="text-left">
                    <p class="mb-2">You are about to delete user:</p>
                    <p class="font-bold">${userName}</p>
                    <p class="text-sm text-gray-600">${email}</p>
                    <p class="mt-3 text-red-600">This action cannot be undone!</p>
                </div>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete user',
            cancelButtonText: 'Cancel',
        });

        if (!result.isConfirmed) return;

        const loadingToast = toast.loading("Deleting user...");
        try {
            await axios.delete(`${BACKEND_URL}/admin/delete-user/${email}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            toast.dismiss(loadingToast);
            toast.success("User deleted successfully");
            fetchReports();
        } catch {
            toast.dismiss(loadingToast);
            toast.error("Failed to delete user");
        }
    };

    const handleSendEmail = async (email) => {
        const message = warningText[email];
        if (!message || !message.trim()) {
            toast.error("Please enter a warning message");
            return;
        }

        const result = await Swal.fire({
            title: 'Send Warning?',
            text: `You are about to send a warning to ${email}`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, send it',
            cancelButtonText: 'No',

            buttonsStyling: false,
            customClass: {
                confirmButton:
                    'bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded mr-2',
                cancelButton:
                    'bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded'
            }
        });

        if (!result.isConfirmed) return;

        const loadingToast = toast.loading("Sending warning...");
        try {
            await axios.post(`${BACKEND_URL}/admin/send-warning`, {
                email,
                message,
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            toast.dismiss(loadingToast);
            toast.success("Warning sent successfully");
            setWarningText({ ...warningText, [email]: "" });
        } catch {
            toast.dismiss(loadingToast);
            toast.error("Failed to send warning");
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return "Today";
        if (diffDays === 1) return "Yesterday";
        if (diffDays < 7) return `${diffDays} days ago`;

        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        });
    };

    const getRiskLevel = (reportCount) => {
        if (reportCount >= 10) return { level: "High Risk", color: "text-red-600 bg-red-50", icon: Shield };
        if (reportCount >= 5) return { level: "Medium Risk", color: "text-orange-600 bg-orange-50", icon: AlertCircle };
        if (reportCount >= 3) return { level: "Low Risk", color: "text-yellow-600 bg-yellow-50", icon: AlertTriangle };
        return { level: "Normal", color: "text-green-600 bg-green-50", icon: Check };
    };

    const getReasonBadgeColor = (reason) => {
        const colors = {
            'spam': 'bg-purple-50 text-purple-700 border-purple-200',
            'harassment': 'bg-red-50 text-red-700 border-red-200',
            'inappropriate': 'bg-orange-50 text-orange-700 border-orange-200',
            'fake': 'bg-yellow-50 text-yellow-700 border-yellow-200',
            'other': 'bg-gray-50 text-gray-700 border-gray-200'
        };
        return colors[reason?.toLowerCase()] || colors.other;
    };

    const stats = {
        totalUsers: reports.length,
        totalReports: reports.reduce((sum, user) => sum + user.reports.length, 0),
        avgReportsPerUser: reports.length > 0
            ? (reports.reduce((sum, user) => sum + user.reports.length, 0) / reports.length).toFixed(1)
            : 0,
        highRiskUsers: reports.filter(user => user.reports.length >= 10).length,
        mediumRiskUsers: reports.filter(user => user.reports.length >= 5 && user.reports.length < 10).length,
        lowRiskUsers: reports.filter(user => user.reports.length >= 3 && user.reports.length < 5).length,
    };

    return (
        <div className="p-4 md:p-6 space-y-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2 md:gap-3" style={{ color: gold }}>
                            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 flex items-center justify-center">
                                <AlertTriangle className="w-6 h-6 md:w-8 md:h-8" />
                            </div>
                            User Reports
                        </h1>
                        <p className="text-gray-600 text-sm md:text-base mt-1">
                            Manage user reports and send warnings (Sorted by most reports first)
                        </p>
                    </div>

                    <button
                        onClick={fetchReports}
                        className="px-3 md:px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 flex items-center gap-2 text-sm md:text-base flex-1 sm:flex-none justify-center"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        <span className="hidden sm:inline">Refresh</span>
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                    <div className="bg-white rounded-lg md:rounded-xl p-3 md:p-4 border shadow-xs md:shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs md:text-sm text-gray-500">Reported Users</p>
                                <p className="text-lg md:text-2xl font-bold">{stats.totalUsers}</p>
                            </div>
                            <div className="p-2 md:p-3 rounded-full bg-red-50">
                                <Users className="w-4 h-4 md:w-6 md:h-6 text-red-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg md:rounded-xl p-3 md:p-4 border shadow-xs md:shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs md:text-sm text-gray-500">Total Reports</p>
                                <p className="text-lg md:text-2xl font-bold">{stats.totalReports}</p>
                            </div>
                            <div className="p-2 md:p-3 rounded-full bg-amber-50">
                                <Flag className="w-4 h-4 md:w-6 md:h-6 text-amber-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg md:rounded-xl p-3 md:p-4 border shadow-xs md:shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs md:text-sm text-gray-500">Avg Reports/User</p>
                                <p className="text-lg md:text-2xl font-bold">{stats.avgReportsPerUser}</p>
                            </div>
                            <div className="p-2 md:p-3 rounded-full bg-blue-50">
                                <AlertCircle className="w-4 h-4 md:w-6 md:h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg md:rounded-xl p-3 md:p-4 border shadow-xs md:shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs md:text-sm text-gray-500">High Risk</p>
                                <p className="text-lg md:text-2xl font-bold">{stats.highRiskUsers}</p>
                            </div>
                            <div className="p-2 md:p-3 rounded-full bg-purple-50">
                                <Shield className="w-4 h-4 md:w-6 md:h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Filter Toggle */}
            <div className="lg:hidden">
                <button
                    onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-white border rounded-lg shadow-sm"
                >
                    <span className="flex items-center gap-2">
                        <Filter className="w-4 h-4" />
                        Filters & Search
                    </span>
                    {mobileFiltersOpen ? (
                        <ChevronUp className="w-4 h-4" />
                    ) : (
                        <ChevronDown className="w-4 h-4" />
                    )}
                </button>
            </div>

            {/* Filters Bar */}
            <div className={`
                bg-white rounded-lg md:rounded-xl p-4 border shadow-sm
                ${mobileFiltersOpen ? 'block' : 'hidden lg:block'}
            `}>
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1">
                        <label className="block text-xs text-gray-500 mb-1">Search User</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) =>
                                    setSearchTerm(
                                        e.target.value
                                            .replace(/[^a-zA-Z0-9 ]/g, "")
                                            .replace(/\s+/g, " ")
                                            .replace(/^\s/, "")
                                    )
                                }
                                className="w-full pl-10 pr-4 py-2 text-sm border rounded-lg focus:ring-2 focus:outline-none"
                                style={{ focusRingColor: gold }}
                            />
                        </div>
                    </div>

                    {/* Filter by Reason */}
                    <div className="flex-1">
                        <label className="block text-xs text-gray-500 mb-1">Filter by Reason</label>
                        <input
                            type="text"
                            placeholder="Filter by reason..."
                            value={filterReason}
                            onChange={(e) =>
                                setFilterReason(
                                    e.target.value
                                        .replace(/[^a-zA-Z0-9 ]/g, "") 
                                        .replace(/\s+/g, " ")          
                                        .replace(/^\s/, "")            
                                        .trim()                        
                                )
                            }
                            className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:outline-none"
                            style={{ focusRingColor: gold }}
                        />
                    </div>

                    {/* Sort Options */}
                    <div className="flex-1">
                        <label className="block text-xs text-gray-500 mb-1">Sort By</label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setSortBy("mostReports")}
                                className={`flex-1 px-3 py-2 text-sm border rounded-lg flex items-center justify-center gap-1 transition-colors ${sortBy === "mostReports"
                                    ? 'bg-amber-50 border-amber-300 text-amber-700'
                                    : 'hover:bg-gray-50'
                                    }`}
                                style={sortBy === "mostReports" ? { borderColor: gold } : {}}
                            >
                                <TrendingDown className="w-4 h-4" />
                                Most Reports
                            </button>
                            <button
                                onClick={() => setSortBy("leastReports")}
                                className={`flex-1 px-3 py-2 text-sm border rounded-lg flex items-center justify-center gap-1 transition-colors ${sortBy === "leastReports"
                                    ? 'bg-amber-50 border-amber-300 text-amber-700'
                                    : 'hover:bg-gray-50'
                                    }`}
                                style={sortBy === "leastReports" ? { borderColor: gold } : {}}
                            >
                                <TrendingUp className="w-4 h-4" />
                                Least Reports
                            </button>
                        </div>
                    </div>

                    {/* Clear Filters */}
                    <div className="flex items-end">
                        <button
                            onClick={() => {
                                setSearchTerm("");
                                setFilterReason("");
                                setSortBy("mostReports");
                                setMobileFiltersOpen(false);
                            }}
                            className="w-full md:w-auto px-4 py-2 text-sm border border-gray-300 hover:bg-gray-50 rounded-lg"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>

                {/* Active Sort Indicator */}
                <div className="mt-3 text-xs text-gray-500 flex items-center gap-1">
                    <ArrowUpDown className="w-3 h-3" />
                    Currently sorted by: <span className="font-medium text-gray-700">
                        {sortBy === "mostReports" ? "Most reports first" : "Least reports first"}
                    </span>
                </div>
            </div>

            {/* Reports List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-8 md:py-12">
                    <Loader2 className="w-8 h-8 md:w-12 md:h-12 animate-spin" style={{ color: gold }} />
                    <p className="mt-4 text-gray-600">Loading reports...</p>
                </div>
            ) : filteredReports.length === 0 ? (
                <div className="text-center py-8 md:py-12 bg-white rounded-xl border">
                    <Flag className="w-10 h-10 md:w-12 md:h-12 text-gray-300 mx-auto mb-3 md:mb-4" />
                    <p className="text-gray-500 text-base md:text-lg">No reports found</p>
                    <p className="text-gray-400 text-sm md:text-base mt-1">
                        {searchTerm || filterReason ? "Try changing your filters" : "No user reports have been submitted yet"}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredReports.map((user, index) => {
                        const riskLevel = getRiskLevel(user.reports.length);
                        const RiskIcon = riskLevel.icon;

                        return (
                            <div
                                key={user.email}
                                className="bg-white border rounded-lg md:rounded-xl overflow-hidden transition-all hover:shadow-md"
                            >
                                {/* User Header */}
                                <div
                                    className="p-4 md:p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                                    onClick={() => setOpenUser(openUser === user.email ? null : user.email)}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-start gap-3 min-w-0 flex-1">
                                            <div className="p-2 bg-red-50 rounded-full flex-shrink-0">
                                                <User className="w-4 h-4 md:w-5 md:h-5 text-red-600" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                                    <h3 className="font-medium text-gray-900 text-base md:text-lg truncate">
                                                        {user.user}
                                                    </h3>
                                                    <div className="flex items-center gap-2">
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                                                            <Flag className="w-3 h-3" />
                                                            {user.reports.length} Report{user.reports.length > 1 ? 's' : ''}
                                                        </span>
                                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${riskLevel.color}`}>
                                                            <RiskIcon className="w-3 h-3" />
                                                            {riskLevel.level}
                                                        </span>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                                    <Mail className="w-3 h-3 flex-shrink-0" />
                                                    <span className="truncate">{user.email}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <span className="text-xs text-gray-400">
                                                #{index + 1}
                                            </span>
                                            {openUser === user.email ? (
                                                <ChevronUp className="w-5 h-5 text-gray-400" />
                                            ) : (
                                                <ChevronDown className="w-5 h-5 text-gray-400" />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {openUser === user.email && (
                                    <div className="border-t border-gray-200">
                                        <div className="p-4 md:p-5 space-y-4">
                                            {/* Reports List */}
                                            <div className="space-y-3">
                                                <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                                    <Flag className="w-4 h-4" />
                                                    Reports ({user.reports.length})
                                                </h4>

                                                {user.reports.map((report, index) => (
                                                    <div
                                                        key={report._id || index}
                                                        className="border rounded-lg p-3 md:p-4 bg-gray-50"
                                                    >
                                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getReasonBadgeColor(report.reason)}`}>
                                                                    {report.reason || 'Other'}
                                                                </div>
                                                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                                                    <Clock className="w-3 h-3" />
                                                                    {formatDate(report.created_at)}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <p className="text-sm text-gray-600 mb-2">
                                                            <span className="font-medium">Reporter:</span> {report.reporter_name || 'Anonymous'}
                                                        </p>

                                                        {report.description && (
                                                            <p className="text-sm text-gray-700 bg-white p-2 rounded border">
                                                                {report.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Warning Message Input */}
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                                    <MessageSquare className="w-4 h-4" />
                                                    Warning Message
                                                </label>
                                                <textarea
                                                    placeholder="Write a warning message to send to the user..."
                                                    value={warningText[user.email] || ''}
                                                    onChange={(e) =>
                                                        setWarningText({
                                                            ...warningText,
                                                            [user.email]: e.target.value,
                                                        })
                                                    }
                                                    rows="3"
                                                    className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:outline-none resize-none"
                                                    style={{ focusRingColor: gold }}
                                                />
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                                <button
                                                    onClick={() => handleSendEmail(user.email)}
                                                    className="flex-1 px-4 py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                                                    style={{ backgroundColor: gold }}
                                                >
                                                    <Mail className="w-4 h-4" />
                                                    Send Warning
                                                </button>

                                                <button
                                                    onClick={() => handleDeleteUser(user.email, user.user)}
                                                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Delete User
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Footer Stats */}
            {filteredReports.length > 0 && (
                <div className="text-center text-xs md:text-sm text-gray-500 py-3 md:py-4 border-t border-gray-200">
                    <div className="flex flex-wrap justify-center gap-4">
                        <span>Showing {filteredReports.length} of {reports.length} reported users</span>
                        <span className="hidden sm:inline">•</span>
                        <span>Sorted by: {sortBy === "mostReports" ? "Most reports first" : "Least reports first"}</span>
                        {searchTerm && (
                            <>
                                <span className="hidden sm:inline">•</span>
                                <span>Search: "{searchTerm}"</span>
                            </>
                        )}
                        {filterReason && (
                            <>
                                <span className="hidden sm:inline">•</span>
                                <span>Filter: "{filterReason}"</span>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminReport;