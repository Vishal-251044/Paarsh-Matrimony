import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
    Trash2, Mail, Phone, User, MessageCircle,
    Search, Calendar, Filter, ChevronDown, ChevronUp,
    RefreshCw, Clock, AlertCircle, Loader2, Eye, EyeOff,
    CheckCircle, FileText
} from "lucide-react";

const gold = "oklch(70.4%_0.191_22.216)";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const AdminContact = () => {
    const [contacts, setContacts] = useState([]);
    const [filteredContacts, setFilteredContacts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [dateFilter, setDateFilter] = useState("all");
    const [expandedCard, setExpandedCard] = useState(null);
    const [selectedItems, setSelectedItems] = useState([]);
    const [bulkDeleteMode, setBulkDeleteMode] = useState(false);
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const [showMessagePreview, setShowMessagePreview] = useState({});

    const fetchContacts = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${BACKEND_URL}/api/admin/contacts`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            if (!res.ok) throw new Error("Failed to load contacts");
            const data = await res.json();
            // Ensure all contacts have a status field
            const contactsWithStatus = Array.isArray(data)
                ? data.map(contact => ({
                    ...contact,
                    status: contact.status || "new",
                    name: contact.name || "Unknown",
                    email: contact.email || "No email",
                    message: contact.message || "",
                    created_at: contact.created_at || new Date().toISOString()
                }))
                : [];
            setContacts(contactsWithStatus);
            setFilteredContacts(contactsWithStatus);
        } catch {
            toast.error("Failed to load contacts");
            setContacts([]);
            setFilteredContacts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    useEffect(() => {
        let results = [...contacts];

        // Search filter
        if (searchTerm) {
            results = results.filter(c =>
                (c.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                (c.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                (c.phone?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                (c.message?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                (c.subject?.toLowerCase() || "").includes(searchTerm.toLowerCase())
            );
        }

        // Status filter
        if (statusFilter !== "all") {
            results = results.filter(c => (c.status || "new") === statusFilter);
        }

        // Date filter
        if (dateFilter === "today") {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            results = results.filter(c => {
                const contactDate = c.created_at ? new Date(c.created_at) : new Date();
                return contactDate >= today;
            });
        } else if (dateFilter === "week") {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            results = results.filter(c => {
                const contactDate = c.created_at ? new Date(c.created_at) : new Date();
                return contactDate >= weekAgo;
            });
        }

        // Sort by newest first
        results.sort((a, b) => {
            const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
            const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
            return dateB - dateA;
        });

        setFilteredContacts(results);
    }, [contacts, searchTerm, statusFilter, dateFilter]);

    const handleDelete = async (id) => {
        if (!id) {
            toast.error("Invalid contact ID");
            return;
        }

        const t = toast.loading("Deleting contact message...");
        try {
            const res = await fetch(`${BACKEND_URL}/api/admin/contacts/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            if (!res.ok) throw new Error("Delete failed");

            toast.dismiss(t);
            toast.success("Contact message deleted successfully");
            fetchContacts();
            setSelectedItems(selectedItems.filter(item => item !== id));
        } catch {
            toast.dismiss(t);
            toast.error("Delete failed");
        }
    };

    const handleBulkDelete = async () => {
        if (selectedItems.length === 0) {
            toast.error("No messages selected");
            return;
        }

        const confirmDelete = window.confirm(
            `Are you sure you want to delete ${selectedItems.length} contact message${selectedItems.length > 1 ? 's' : ''}?`
        );

        if (!confirmDelete) return;

        const loadingToast = toast.loading(`Deleting ${selectedItems.length} message${selectedItems.length > 1 ? 's' : ''}...`);

        try {
            const deletePromises = selectedItems.map(id =>
                fetch(`${BACKEND_URL}/api/admin/contacts/${id}`, {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                })
            );

            await Promise.all(deletePromises);

            toast.dismiss(loadingToast);
            toast.success(`${selectedItems.length} message${selectedItems.length > 1 ? 's' : ''} deleted successfully`);
            fetchContacts();
            setSelectedItems([]);
            setBulkDeleteMode(false);
        } catch {
            toast.dismiss(loadingToast);
            toast.error("Bulk delete failed");
        }
    };

    const toggleSelectItem = (id) => {
        if (!id) return;
        setSelectedItems(prev =>
            prev.includes(id)
                ? prev.filter(item => item !== id)
                : [...prev, id]
        );
    };

    const selectAll = () => {
        setSelectedItems(
            filteredContacts.map(c => c._id).filter(id => id)
        );
    };

    const clearSelection = () => {
        setSelectedItems([]);
    };

    const toggleMessagePreview = (id) => {
        if (!id) return;
        setShowMessagePreview(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const updateStatus = async (id, status) => {
        if (!id) {
            toast.error("Invalid contact ID");
            return;
        }

        try {
            const res = await fetch(`${BACKEND_URL}/api/admin/contacts/${id}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ status }),
            });

            if (!res.ok) throw new Error("Status update failed");

            fetchContacts();
            toast.success(`Marked as ${status}`);
        } catch {
            toast.error("Failed to update status");
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Unknown date";

        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "Invalid date";

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
        } catch {
            return "Invalid date";
        }
    };

    const getStatusBadge = (status) => {
        const statusValue = status || "new";
        const validStatus = ["new", "read", "archived"].includes(statusValue)
            ? statusValue
            : "new";

        const statusConfig = {
            new: { color: "bg-blue-50 text-blue-700 border-blue-200", icon: AlertCircle },
            read: { color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle },
            archived: { color: "bg-gray-50 text-gray-700 border-gray-200", icon: FileText }
        };

        const config = statusConfig[validStatus];
        const Icon = config.icon;

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${config.color}`}>
                <Icon className="w-3 h-3" />
                {validStatus.charAt(0).toUpperCase() + validStatus.slice(1)}
            </span>
        );
    };

    const getMessagePreview = (message) => {
        if (!message) return "No message";
        if (typeof message !== "string") return "Invalid message format";
        return message;
    };

    const stats = {
        total: contacts.length,
        new: contacts.filter(c => (c.status || "new") === "new").length,
        read: contacts.filter(c => (c.status || "new") === "read").length,
        today: contacts.filter(c => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const contactDate = c.created_at ? new Date(c.created_at) : new Date(0);
            return contactDate >= today;
        }).length,
    };

    return (
        <div className="p-4 md:p-6 space-y-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2 md:gap-3" style={{ color: gold }}>
                            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200">
                                <MessageCircle className="w-6 h-6 md:w-8 md:h-8" />
                            </div>
                            Contact Messages
                        </h1>
                        <p className="text-gray-600 text-sm md:text-base mt-1">
                            Manage and respond to user inquiries
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
                            onClick={fetchContacts}
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
                                <p className="text-xs md:text-sm text-gray-500">Total Messages</p>
                                <p className="text-lg md:text-2xl font-bold">{stats.total}</p>
                            </div>
                            <div className="p-2 md:p-3 rounded-full bg-blue-50">
                                <MessageCircle className="w-4 h-4 md:w-6 md:h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg md:rounded-xl p-3 md:p-4 border shadow-xs md:shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs md:text-sm text-gray-500">New</p>
                                <p className="text-lg md:text-2xl font-bold">{stats.new}</p>
                            </div>
                            <div className="p-2 md:p-3 rounded-full bg-amber-50">
                                <AlertCircle className="w-4 h-4 md:w-6 md:h-6 text-amber-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg md:rounded-xl p-3 md:p-4 border shadow-xs md:shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs md:text-sm text-gray-500">Read</p>
                                <p className="text-lg md:text-2xl font-bold">{stats.read}</p>
                            </div>
                            <div className="p-2 md:p-3 rounded-full bg-emerald-50">
                                <CheckCircle className="w-4 h-4 md:w-6 md:h-6 text-emerald-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg md:rounded-xl p-3 md:p-4 border shadow-xs md:shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs md:text-sm text-gray-500">Today</p>
                                <p className="text-lg md:text-2xl font-bold">{stats.today}</p>
                            </div>
                            <div className="p-2 md:p-3 rounded-full bg-purple-50">
                                <Calendar className="w-4 h-4 md:w-6 md:h-6 text-purple-600" />
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
                            placeholder="Search by name, email, or message..."
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
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Status Filter */}
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Status</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full text-sm md:text-base border rounded-lg px-3 py-2 focus:ring-2 focus:outline-none"
                                style={{ focusRingColor: gold }}
                            >
                                <option value="all">All Status</option>
                                <option value="new">New</option>
                                <option value="read">Read</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>

                        {/* Date Filter */}
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Date</label>
                            <select
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="w-full text-sm md:text-base border rounded-lg px-3 py-2 focus:ring-2 focus:outline-none"
                                style={{ focusRingColor: gold }}
                            >
                                <option value="all">All Time</option>
                                <option value="today">Today</option>
                                <option value="week">Last 7 Days</option>
                            </select>
                        </div>
                    </div>

                    {/* Clear Filters Button */}
                    <div className="flex items-end">
                        <button
                            onClick={() => {
                                setSearchTerm("");
                                setStatusFilter("all");
                                setDateFilter("all");
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
                                        {selectedItems.length} message{selectedItems.length > 1 ? 's' : ''} selected
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

            {/* Contact Messages List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-8 md:py-12">
                    <Loader2 className="w-8 h-8 md:w-12 md:h-12 animate-spin" style={{ color: gold }} />
                    <p className="mt-4 text-gray-600">Loading messages...</p>
                </div>
            ) : filteredContacts.length === 0 ? (
                <div className="text-center py-8 md:py-12 bg-white rounded-xl border">
                    <MessageCircle className="w-10 h-10 md:w-12 md:h-12 text-gray-300 mx-auto mb-3 md:mb-4" />
                    <p className="text-gray-500 text-base md:text-lg">No messages found</p>
                    <p className="text-gray-400 text-sm md:text-base mt-1">
                        {searchTerm || statusFilter !== "all" || dateFilter !== "all"
                            ? "Try changing your filters"
                            : "No contact messages yet"}
                    </p>
                </div>
            ) : (
                <div className="space-y-3 md:space-y-4">
                    {filteredContacts.map((c) => {
                        const contactStatus = c.status || "new";
                        const contactId = c._id || `temp-${Math.random()}`;
                        const contactName = c.name || "Unknown";
                        const contactEmail = c.email || "No email";
                        const contactMessage = getMessagePreview(c.message);
                        const contactSubject = c.subject || "";
                        const contactPhone = c.phone || "";
                        const contactDate = c.created_at || new Date().toISOString();

                        return (
                            <div
                                key={contactId}
                                className={`bg-white border rounded-lg md:rounded-xl transition-all hover:shadow-md ${selectedItems.includes(contactId) ? 'ring-1 md:ring-2 ring-offset-1 md:ring-offset-2' : ''
                                    }`}
                                style={{
                                    borderColor: selectedItems.includes(contactId) ? gold : '#e5e7eb',
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
                                                        checked={selectedItems.includes(contactId)}
                                                        onChange={() => toggleSelectItem(contactId)}
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
                                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-2">
                                                        <div className="min-w-0">
                                                            <p className="font-medium text-gray-900 text-sm md:text-base truncate">
                                                                {contactName}
                                                            </p>
                                                            <p className="text-xs md:text-sm text-gray-500 truncate">
                                                                {contactEmail}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {getStatusBadge(contactStatus)}
                                                            <button
                                                                onClick={() => setExpandedCard(expandedCard === contactId ? null : contactId)}
                                                                className="p-1 md:p-2 hover:bg-gray-100 rounded-lg"
                                                            >
                                                                {expandedCard === contactId ? (
                                                                    <ChevronUp className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
                                                                ) : (
                                                                    <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
                                                                )}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Subject */}
                                    {contactSubject && (
                                        <div className="mb-2 md:mb-3">
                                            <p className="font-medium text-gray-800 text-sm md:text-base">
                                                {contactSubject}
                                            </p>
                                        </div>
                                    )}

                                    {/* Message Preview */}
                                    <div className="mb-3 md:mb-4">
                                        <p className="text-gray-600 text-sm md:text-base line-clamp-2">
                                            {showMessagePreview[contactId]
                                                ? contactMessage
                                                : `${contactMessage.substring(0, 120)}${contactMessage.length > 120 ? '...' : ''}`
                                            }
                                        </p>
                                        {contactMessage.length > 120 && (
                                            <button
                                                onClick={() => toggleMessagePreview(contactId)}
                                                className="mt-1 text-xs md:text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                                            >
                                                {showMessagePreview[contactId] ? (
                                                    <>
                                                        <EyeOff className="w-3 h-3" />
                                                        Show less
                                                    </>
                                                ) : (
                                                    <>
                                                        <Eye className="w-3 h-3" />
                                                        Read more
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>

                                    {/* Contact Info */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 md:mb-4">
                                        <div className="flex flex-wrap gap-3 md:gap-4">
                                            <span className="flex items-center gap-1 text-xs md:text-sm text-gray-600">
                                                <Mail className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                                                {contactEmail}
                                            </span>
                                            {contactPhone && (
                                                <span className="flex items-center gap-1 text-xs md:text-sm text-gray-600">
                                                    <Phone className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                                                    {contactPhone}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            {formatDate(contactDate)}
                                        </div>
                                    </div>

                                    {/* Expanded Content */}
                                    {expandedCard === contactId && (
                                        <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-200 space-y-3">
                                            {/* Status Actions */}
                                            <div className="flex flex-wrap gap-2">
                                                <span className="text-xs md:text-sm font-medium text-gray-700">Mark as:</span>
                                                <div className="flex flex-wrap gap-2">
                                                    {contactStatus !== "read" && (
                                                        <button
                                                            onClick={() => updateStatus(contactId, "read")}
                                                            className="px-3 py-1 text-xs md:text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg border border-blue-200"
                                                        >
                                                            Read
                                                        </button>
                                                    )}
                                                    {contactStatus !== "archived" && (
                                                        <button
                                                            onClick={() => updateStatus(contactId, "archived")}
                                                            className="px-3 py-1 text-xs md:text-sm bg-gray-50 text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-200"
                                                        >
                                                            Archive
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Full Details */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                                <div className="space-y-2">
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-1">Full Name</p>
                                                        <p className="text-sm text-gray-800">{contactName}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-1">Email</p>
                                                        <p className="text-sm text-gray-800">{contactEmail}</p>
                                                    </div>
                                                    {contactPhone && (
                                                        <div>
                                                            <p className="text-xs text-gray-500 mb-1">Phone</p>
                                                            <p className="text-sm text-gray-800">{contactPhone}</p>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-1">Submitted</p>
                                                        <p className="text-sm text-gray-800 flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />
                                                            {new Date(contactDate).toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-1">Message ID</p>
                                                        <button
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(contactId);
                                                                toast.success("ID copied to clipboard");
                                                            }}
                                                            className="text-xs text-gray-600 hover:text-gray-800"
                                                            title="Copy ID"
                                                        >
                                                            {contactId.slice(-8)}...
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3">
                                                <div className="text-xs md:text-sm text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        Sent at {new Date(contactDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <a
                                                        href={`mailto:${contactEmail}`}
                                                        className="px-3 py-1.5 text-xs md:text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg flex items-center gap-1"
                                                    >
                                                        <Mail className="w-3 h-3" />
                                                        Reply via Email
                                                    </a>
                                                    <button
                                                        onClick={() => handleDelete(contactId)}
                                                        className="px-3 py-1.5 text-xs md:text-sm bg-red-50 text-red-700 hover:bg-red-100 rounded-lg border border-red-200 flex items-center gap-1"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Footer */}
                                    <div className="flex items-center justify-between mt-3 md:mt-4 pt-3 border-t border-gray-100">
                                        <button
                                            onClick={() => setExpandedCard(expandedCard === contactId ? null : contactId)}
                                            className="text-xs md:text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                                        >
                                            {expandedCard === contactId ? 'Show less' : 'Show details'}
                                            {expandedCard === contactId ? (
                                                <ChevronUp className="w-3 h-3 md:w-4 h-4" />
                                            ) : (
                                                <ChevronDown className="w-3 h-3 md:w-4 h-4" />
                                            )}
                                        </button>

                                        <div className="text-xs text-gray-400">
                                            {formatDate(contactDate)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Footer Stats */}
            {filteredContacts.length > 0 && (
                <div className="text-center text-xs md:text-sm text-gray-500 py-3 md:py-4">
                    Showing {filteredContacts.length} of {contacts.length} message{contacts.length !== 1 ? 's' : ''}
                    {searchTerm && ` matching "${searchTerm}"`}
                    {statusFilter !== "all" && ` with status "${statusFilter}"`}
                    {dateFilter !== "all" && ` from ${dateFilter === "today" ? "today" : "last 7 days"}`}
                </div>
            )}
        </div>
    );
};

export default AdminContact;