import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import {
    Trash2, Star, Mail, MessageSquare,
    Filter, Search, Calendar, User,
    ThumbsUp, Clock, ChevronDown, ChevronUp,
    AlertCircle, RefreshCw, X, Check, Loader2
} from "lucide-react";

const gold = "oklch(70.4%_0.191_22.216)";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const AdminFeedback = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [ratingFilter, setRatingFilter] = useState(null);
    const [sortBy, setSortBy] = useState("newest");
    const [expandedCard, setExpandedCard] = useState(null);
    const [selectedItems, setSelectedItems] = useState([]);
    const [bulkDeleteMode, setBulkDeleteMode] = useState(false);
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    const fetchFeedbacks = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${BACKEND_URL}/api/admin/feedbacks`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            if (!res.ok) throw new Error("Failed to fetch feedbacks");
            const data = await res.json();
            setFeedbacks(data);
            setFilteredFeedbacks(data);
        } catch (err) {
            toast.error("Failed to load feedbacks");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    useEffect(() => {
        let results = [...feedbacks];

        // Search filter
        if (searchTerm) {
            results = results.filter(fb =>
                fb.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                fb.experience?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                fb.suggestions?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Rating filter
        if (ratingFilter) {
            results = results.filter(fb => fb.rating === ratingFilter);
        }

        // Sorting
        results.sort((a, b) => {
            const dateA = new Date(a.created_at);
            const dateB = new Date(b.created_at);

            if (sortBy === "newest") return dateB - dateA;
            if (sortBy === "oldest") return dateA - dateB;
            if (sortBy === "highest") return b.rating - a.rating;
            if (sortBy === "lowest") return a.rating - b.rating;
            return 0;
        });

        setFilteredFeedbacks(results);
    }, [feedbacks, searchTerm, ratingFilter, sortBy]);

    const handleDelete = async (id) => {
        const loadingToast = toast.loading("Deleting feedback...");
        try {
            const res = await fetch(`${BACKEND_URL}/api/admin/feedbacks/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            if (!res.ok) throw new Error("Delete failed");

            toast.dismiss(loadingToast);
            toast.success("Feedback deleted successfully");
            fetchFeedbacks();
            setSelectedItems(selectedItems.filter(item => item !== id));
        } catch {
            toast.dismiss(loadingToast);
            toast.error("Failed to delete feedback");
        }
    };

    const handleBulkDelete = async () => {
        if (selectedItems.length === 0) {
            toast.error("No feedbacks selected");
            return;
        }

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `You are about to delete ${selectedItems.length} feedback${selectedItems.length > 1 ? 's' : ''}. This action cannot be undone!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
        });

        if (!result.isConfirmed) return;

        const loadingToast = toast.loading(`Deleting ${selectedItems.length} feedback${selectedItems.length > 1 ? 's' : ''}...`);

        try {
            const deletePromises = selectedItems.map(id =>
                fetch(`${BACKEND_URL}/api/admin/feedbacks/${id}`, {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                })
            );

            await Promise.all(deletePromises);

            toast.dismiss(loadingToast);
            toast.success(`${selectedItems.length} feedback${selectedItems.length > 1 ? 's' : ''} deleted successfully`);
            fetchFeedbacks();
            setSelectedItems([]);
            setBulkDeleteMode(false);
        } catch {
            toast.dismiss(loadingToast);
            toast.error("Bulk delete failed");
        }
    };

    const toggleSelectItem = (id) => {
        setSelectedItems(prev =>
            prev.includes(id)
                ? prev.filter(item => item !== id)
                : [...prev, id]
        );
    };

    const selectAll = () => {
        setSelectedItems(
            filteredFeedbacks.map(fb => fb._id)
        );
    };

    const clearSelection = () => {
        setSelectedItems([]);
    };

    const getRatingColor = (rating) => {
        if (rating >= 4) return "bg-emerald-50 text-emerald-700 border-emerald-200";
        if (rating >= 3) return "bg-amber-50 text-amber-700 border-amber-200";
        return "bg-rose-50 text-rose-700 border-rose-200";
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

    const stats = {
        total: feedbacks.length,
        averageRating: feedbacks.length > 0
            ? (feedbacks.reduce((sum, fb) => sum + fb.rating, 0) / feedbacks.length).toFixed(1)
            : 0,
        fiveStar: feedbacks.filter(fb => fb.rating === 5).length,
        withSuggestions: feedbacks.filter(fb => fb.suggestions && fb.suggestions.trim()).length,
    };

    return (
        <div className="p-4 md:p-6 space-y-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2 md:gap-3" style={{ color: gold }}>
                            <MessageSquare className="w-6 h-6 md:w-8 md:h-8" />
                            User Feedback
                        </h1>
                        <p className="text-gray-600 text-sm md:text-base mt-1">
                            Manage and review user feedback submissions
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setBulkDeleteMode(!bulkDeleteMode)}
                            className={`px-3 md:px-4 py-2 rounded-lg border flex items-center gap-2 text-sm md:text-base transition-all flex-1 sm:flex-none ${bulkDeleteMode
                                ? "bg-red-50 border-red-200 text-red-700"
                                : "border-gray-300 hover:bg-gray-50"
                                }`}
                        >
                            <Trash2 className="w-4 h-4" />
                            <span className="hidden sm:inline">
                                {bulkDeleteMode ? "Cancel" : "Bulk Delete"}
                            </span>
                        </button>

                        <button
                            onClick={fetchFeedbacks}
                            className="px-3 md:px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 flex items-center gap-2 text-sm md:text-base flex-1 sm:flex-none"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            <span className="hidden sm:inline">Refresh</span>
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                    <div className="bg-white rounded-lg md:rounded-xl p-3 md:p-4 border shadow-xs md:shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs md:text-sm text-gray-500">Total</p>
                                <p className="text-lg md:text-2xl font-bold">{stats.total}</p>
                            </div>
                            <div className="p-2 md:p-3 rounded-full bg-blue-50">
                                <MessageSquare className="w-4 h-4 md:w-6 md:h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg md:rounded-xl p-3 md:p-4 border shadow-xs md:shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs md:text-sm text-gray-500">Avg. Rating</p>
                                <p className="text-lg md:text-2xl font-bold flex items-center gap-1">
                                    {stats.averageRating}
                                    <Star className="w-3 h-3 md:w-4 md:h-4" style={{ color: gold }} fill={gold} />
                                </p>
                            </div>
                            <div className="p-2 md:p-3 rounded-full bg-amber-50">
                                <ThumbsUp className="w-4 h-4 md:w-6 md:h-6 text-amber-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg md:rounded-xl p-3 md:p-4 border shadow-xs md:shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs md:text-sm text-gray-500">5 Stars</p>
                                <p className="text-lg md:text-2xl font-bold">{stats.fiveStar}</p>
                            </div>
                            <div className="p-2 md:p-3 rounded-full bg-emerald-50">
                                <Star className="w-4 h-4 md:w-6 md:h-6 text-emerald-600" fill="currentColor" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg md:rounded-xl p-3 md:p-4 border shadow-xs md:shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs md:text-sm text-gray-500">Suggestions</p>
                                <p className="text-lg md:text-2xl font-bold">{stats.withSuggestions}</p>
                            </div>
                            <div className="p-2 md:p-3 rounded-full bg-purple-50">
                                <AlertCircle className="w-4 h-4 md:w-6 md:h-6 text-purple-600" />
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

            {/* Controls Bar */}
            <div className={`
        bg-white rounded-lg md:rounded-xl p-4 border shadow-sm
        ${mobileFiltersOpen ? 'block' : 'hidden lg:block'}
      `}>
                {/* Search */}
                <div className="mb-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search feedbacks..."
                            value={searchTerm}
                            onChange={(e) => {
                                let val = e.target.value;
                                val = val.replace(/[^a-zA-Z\s]/g, "");
                                val = val.replace(/\s{2,}/g, " ");
                                val = val.replace(/^\s/, "");
                                setSearchTerm(val);
                            }}
                            onBlur={(e) => setSearchTerm(e.target.value.trim())}
                            className="w-full pl-10 pr-4 py-2 text-sm md:text-base border rounded-lg focus:ring-2 focus:ring-offset-1 focus:outline-none"
                            style={{ borderColor: gold, focusRingColor: gold }}
                        />
                    </div>
                </div>

                {/* Filters Row */}
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1 flex flex-col sm:flex-row gap-3">
                        {/* Rating Filter */}
                        <div className="flex-1">
                            <label className="block text-xs text-gray-500 mb-1">Rating</label>
                            <select
                                value={ratingFilter || ""}
                                onChange={(e) => setRatingFilter(e.target.value ? parseInt(e.target.value) : null)}
                                className="w-full text-sm md:text-base border rounded-lg px-3 py-2 focus:ring-2 focus:outline-none"
                                style={{ focusRingColor: gold }}
                            >
                                <option value="">All Ratings</option>
                                {[5, 4, 3, 2, 1].map(r => (
                                    <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''}</option>
                                ))}
                            </select>
                        </div>

                        {/* Sort By */}
                        <div className="flex-1">
                            <label className="block text-xs text-gray-500 mb-1">Sort By</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full text-sm md:text-base border rounded-lg px-3 py-2 focus:ring-2 focus:outline-none"
                                style={{ focusRingColor: gold }}
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="highest">Highest Rated</option>
                                <option value="lowest">Lowest Rated</option>
                            </select>
                        </div>
                    </div>

                    {/* Clear Filters Button */}
                    <div className="flex items-end">
                        <button
                            onClick={() => {
                                setSearchTerm("");
                                setRatingFilter(null);
                                setSortBy("newest");
                                setMobileFiltersOpen(false);
                            }}
                            className="w-full md:w-auto px-4 py-2 text-sm border border-gray-300 hover:bg-gray-50 rounded-lg"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>

                {/* Bulk Actions Bar */}
                {bulkDeleteMode && selectedItems.length > 0 && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-100 rounded-full">
                                    <Trash2 className="w-5 h-5 text-red-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-red-800 text-sm md:text-base">
                                        {selectedItems.length} feedback{selectedItems.length > 1 ? 's' : ''} selected
                                    </p>
                                    <p className="text-xs md:text-sm text-red-600">These will be permanently deleted</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={clearSelection}
                                    className="px-3 py-1.5 text-sm text-red-700 hover:bg-red-100 rounded-lg"
                                >
                                    Clear
                                </button>
                                <button
                                    onClick={selectAll}
                                    className="px-3 py-1.5 text-sm text-red-700 hover:bg-red-100 rounded-lg"
                                >
                                    Select All
                                </button>
                                <button
                                    onClick={handleBulkDelete}
                                    className="px-3 py-1.5 text-sm bg-red-600 text-white hover:bg-red-700 rounded-lg font-medium"
                                >
                                    Delete Selected
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Feedback List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-8 md:py-12">
                    <Loader2 className="w-8 h-8 md:w-12 md:h-12 animate-spin" style={{ color: gold }} />
                    <p className="mt-4 text-gray-600">Loading feedbacks...</p>
                </div>
            ) : filteredFeedbacks.length === 0 ? (
                <div className="text-center py-8 md:py-12 bg-white rounded-xl border">
                    <MessageSquare className="w-10 h-10 md:w-12 md:h-12 text-gray-300 mx-auto mb-3 md:mb-4" />
                    <p className="text-gray-500 text-base md:text-lg">No feedbacks found</p>
                    <p className="text-gray-400 text-sm md:text-base mt-1">
                        {searchTerm || ratingFilter ? "Try changing your filters" : "No feedback has been submitted yet"}
                    </p>
                </div>
            ) : (
                <div className="space-y-3 md:space-y-4">
                    {filteredFeedbacks.map((fb) => (
                        <div
                            key={fb._id}
                            className={`bg-white border rounded-lg md:rounded-xl transition-all hover:shadow-md ${selectedItems.includes(fb._id) ? 'ring-1 md:ring-2 ring-offset-1 md:ring-offset-2' : ''
                                }`}
                            style={{
                                borderColor: selectedItems.includes(fb._id) ? gold : '#e5e7eb',
                                ringColor: gold
                            }}
                        >
                            <div className="p-4 md:p-5">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-3 md:mb-4">
                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                        {bulkDeleteMode && (
                                            <div className="mt-1 flex-shrink-0">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedItems.includes(fb._id)}
                                                    onChange={() => toggleSelectItem(fb._id)}
                                                    className="w-4 h-4 md:w-5 md:h-5 rounded border-gray-300"
                                                    style={{ accentColor: gold }}
                                                />
                                            </div>
                                        )}
                                        <div className="flex items-start gap-2 md:gap-3 min-w-0 flex-1">
                                            <div className="p-1.5 md:p-2 bg-gray-100 rounded-full flex-shrink-0">
                                                <User className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-medium text-gray-900 text-sm md:text-base truncate">
                                                    {fb.email}
                                                </p>
                                                <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-gray-500">
                                                    <Calendar className="w-3 h-3 flex-shrink-0" />
                                                    <span>{formatDate(fb.created_at)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                                        <span className={`px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-medium border ${getRatingColor(fb.rating)}`}>
                                            {fb.rating}/5
                                        </span>
                                        <button
                                            onClick={() => setExpandedCard(expandedCard === fb._id ? null : fb._id)}
                                            className="p-1 md:p-2 hover:bg-gray-100 rounded-lg"
                                        >
                                            {expandedCard === fb._id ? (
                                                <ChevronUp className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
                                            ) : (
                                                <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Rating Stars */}
                                <div className="flex gap-0.5 md:gap-1 mb-3 md:mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-3 h-3 md:w-5 md:h-5 ${i < fb.rating ? '' : 'text-gray-300'}`}
                                            fill={i < fb.rating ? gold : 'none'}
                                            color={i < fb.rating ? gold : '#d1d5db'}
                                        />
                                    ))}
                                </div>

                                {/* Experience */}
                                <div className="mb-3 md:mb-4">
                                    <p className="text-gray-800 text-sm md:text-base line-clamp-2">
                                        {fb.experience}
                                    </p>
                                </div>

                                {/* Expanded Content */}
                                {expandedCard === fb._id && (
                                    <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-200 space-y-3">
                                        {fb.suggestions && (
                                            <div>
                                                <p className="text-xs md:text-sm font-medium text-gray-700 mb-1 flex items-center gap-1 md:gap-2">
                                                    <AlertCircle className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                                                    Suggestions
                                                </p>
                                                <p className="text-gray-600 text-sm md:text-base bg-gray-50 p-2 md:p-3 rounded-lg">
                                                    {fb.suggestions}
                                                </p>
                                            </div>
                                        )}

                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs md:text-sm text-gray-500">
                                            <div className="flex items-center flex-wrap gap-2 md:gap-4">
                                                <span className="flex items-center gap-1">
                                                    <Mail className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                                                    <span className="truncate">{fb.email}</span>
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                                                    {new Date(fb.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => navigator.clipboard.writeText(fb._id)}
                                                    className="text-gray-500 hover:text-gray-700 text-xs md:text-sm"
                                                    title="Copy ID"
                                                >
                                                    ID: {fb._id.slice(-6)}...
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(fb._id)}
                                                    className="p-1.5 md:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete feedback"
                                                >
                                                    <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Footer */}
                                <div className="flex items-center justify-between mt-3 md:mt-4 pt-3 border-t border-gray-100">
                                    <button
                                        onClick={() => setExpandedCard(expandedCard === fb._id ? null : fb._id)}
                                        className="text-xs md:text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                                    >
                                        {expandedCard === fb._id ? 'Show less' : 'Show details'}
                                        {expandedCard === fb._id ? (
                                            <ChevronUp className="w-3 h-3 md:w-4 h-4" />
                                        ) : (
                                            <ChevronDown className="w-3 h-3 md:w-4 h-4" />
                                        )}
                                    </button>

                                    <div className="text-xs text-gray-400">
                                        {formatDate(fb.created_at)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Footer Stats */}
            {filteredFeedbacks.length > 0 && (
                <div className="text-center text-xs md:text-sm text-gray-500 py-3 md:py-4">
                    Showing {filteredFeedbacks.length} of {feedbacks.length} feedback
                    {feedbacks.length !== 1 ? 's' : ''}
                    {searchTerm && ` matching "${searchTerm}"`}
                    {ratingFilter && ` with ${ratingFilter} star${ratingFilter > 1 ? 's' : ''}`}
                </div>
            )}
        </div>
    );
};

export default AdminFeedback;