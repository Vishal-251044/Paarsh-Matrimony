import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AdminFeedback from '../components/AdminFeedback';
import AdminContact from '../components/AdminContact';
import AdminFinance from '../components/AdminFinance';
import AdminDashboard from '../components/AdminDashboard';
import AdminNotification from '../components/AdminNotification';
import {
    Home as HomeIcon,
    LayoutDashboard,
    Bell,
    DollarSign,
    Settings,
    Palette,
    MessageSquare,
    Phone,
    Menu,
    X,
    Plus,
    Trash2,
    Edit2,
    Check,
    X as XCircle,
    Search,
    Filter,
    MapPin,
    Building2,
    Phone as PhoneIcon,
    Percent,
    Tag,
    Calendar,
    Camera,
    Utensils,
    Brush,
    Sparkles,
    Users,
} from 'lucide-react';
import { SearchCheck } from 'lucide-react';
import AdminVerification from '../components/AdminVerification';

const themeColor = "#f87171";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const navSections = [
    { id: 'dashboard', name: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, description: 'Overview of your system metrics and statistics.' },
    { id: 'notification', name: 'Notification', icon: <Bell className="w-5 h-5" />, description: 'Manage and view all system notifications and alerts.' },
    { id: 'verification', name: 'Verification', icon: <SearchCheck className="w-5 h-5" />, description: 'Verify the profiles.' },
    { id: 'finance', name: 'Finance', icon: <DollarSign className="w-5 h-5" />, description: 'Track revenue, expenses, and financial reports.' },
    { id: 'services', name: 'Services', icon: <Settings className="w-5 h-5" />, description: 'Manage and configure all platform services.' },
    { id: 'feedback', name: 'Feedback', icon: <MessageSquare className="w-5 h-5" />, description: 'View and respond to user feedback.' },
    { id: 'contact', name: 'Contact', icon: <Phone className="w-5 h-5" />, description: 'Access contact information and support channels.' }
];

const serviceCategories = [
    { value: "Wedding Venues", icon: <Building2 className="w-4 h-4" /> },
    { value: "Wedding Photographers", icon: <Camera className="w-4 h-4" /> },
    { value: "Caterers for Weddings", icon: <Utensils className="w-4 h-4" /> },
    { value: "Makeup Artists", icon: <Brush className="w-4 h-4" /> },
    { value: "Decorators", icon: <Sparkles className="w-4 h-4" /> },
    { value: "Wedding Planners", icon: <Users className="w-4 h-4" /> }
];

// Memoized ServicesContent component defined outside Admin to prevent recreation
const ServicesContent = React.memo(({
    showAddForm,
    setShowAddForm,
    formData,
    handleInputChange,
    handleSubmit,
    isEditing,
    loading,
    resetForm,
    services,
    filteredServices,
    filters,
    handleFilterChange,
    resetFilters,
    handleEdit,
    handleDelete,
    showFilters,
    setShowFilters
}) => {
    const getCategoryIcon = useCallback((category) => {
        const found = serviceCategories.find(cat => cat.value === category);
        return found ? found.icon : <Settings className="w-4 h-4" />;
    }, []);

    // Local handlers for form fields with validation
    const handleStateChange = useCallback((e) => {
        const value = e.target.value;
        // Allow only letters and single spaces
        const filteredValue = value.replace(/[^a-zA-Z\s]/g, "");
        e.target.value = filteredValue;
        handleInputChange(e);
    }, [handleInputChange]);

    const handleCityChange = useCallback((e) => {
        const value = e.target.value;
        // Allow only letters and single spaces
        const filteredValue = value.replace(/[^a-zA-Z\s]/g, "");
        e.target.value = filteredValue;
        handleInputChange(e);
    }, [handleInputChange]);

    const handleProviderNameChange = useCallback((e) => {
        const value = e.target.value;
        // Allow only letters, numbers, and basic punctuation
        const filteredValue = value.replace(/[^a-zA-Z0-9\s&.,'-]/g, "");
        e.target.value = filteredValue;
        handleInputChange(e);
    }, [handleInputChange]);

    const handleProviderAddressChange = useCallback((e) => {
        const value = e.target.value;
        // Allow letters, numbers, spaces, and common address characters
        const filteredValue = value.replace(/[^a-zA-Z0-9\s,.-/#&]/g, "");
        e.target.value = filteredValue;
        handleInputChange(e);
    }, [handleInputChange]);

    const handleContactNumberChange = useCallback((e) => {
        const value = e.target.value;
        // Allow only numbers, limit to 10 digits
        const filteredValue = value.replace(/\D/g, "").slice(0, 10);
        e.target.value = filteredValue;
        handleInputChange(e);
    }, [handleInputChange]);

    const handleDiscountTokenChange = useCallback((e) => {
        const value = e.target.value;
        // Allow only alphanumeric characters
        const filteredValue = value.replace(/[^a-zA-Z0-9]/g, "");
        e.target.value = filteredValue.toUpperCase();
        handleInputChange(e);
    }, [handleInputChange]);

    const handleDiscountRateChange = useCallback((e) => {
        const value = e.target.value;
        // Allow only numbers, limit to 2 digits, range 0-100
        const filteredValue = value.replace(/\D/g, "").slice(0, 2);
        const numValue = parseInt(filteredValue) || "";
        if (numValue === "" || (numValue >= 0 && numValue <= 100)) {
            e.target.value = numValue === "" ? "" : numValue.toString();
            handleInputChange(e);
        }
    }, [handleInputChange]);

    // Local handlers for filter fields
    const handleSearchFilterChange = useCallback((e) => {
        const value = e.target.value;
        const filteredValue = value.replace(/[^a-zA-Z0-9\s]/g, "");
        e.target.value = filteredValue;
        handleFilterChange(e);
    }, [handleFilterChange]);

    const handleStateFilterChange = useCallback((e) => {
        const value = e.target.value;
        const filteredValue = value.replace(/[^a-zA-Z\s]/g, "");
        e.target.value = filteredValue;
        handleFilterChange(e);
    }, [handleFilterChange]);

    const handleCityFilterChange = useCallback((e) => {
        const value = e.target.value;
        const filteredValue = value.replace(/[^a-zA-Z\s]/g, "");
        e.target.value = filteredValue;
        handleFilterChange(e);
    }, [handleFilterChange]);

    // Handle blur events to trim whitespace
    const handleBlur = useCallback((e) => {
        const { name, value } = e.target;
        const trimmedValue = value.trim();
        if (value !== trimmedValue) {
            e.target.value = trimmedValue;
            handleInputChange(e);
        }
    }, [handleInputChange]);

    const handleFilterBlur = useCallback((e) => {
        const { name, value } = e.target;
        const trimmedValue = value.trim();
        if (value !== trimmedValue) {
            e.target.value = trimmedValue;
            handleFilterChange(e);
        }
    }, [handleFilterChange]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Settings className="w-6 h-6" />
                        Wedding Services
                    </h1>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        <Filter className="w-4 h-4" />
                        Filters
                        {Object.values(filters).some(filter => filter) && (
                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        )}
                    </button>
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: themeColor }}
                    >
                        <Plus className="w-5 h-5" />
                        <span className="hidden sm:inline">Add New Service</span>
                        <span className="sm:hidden">Add</span>
                    </button>
                </div>
            </div>

            {/* Filters Section */}
            {showFilters && (
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Filter className="w-5 h-5" />
                            Filter Services
                        </h3>
                        <button
                            onClick={resetFilters}
                            className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                        >
                            Clear all
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                <Search className="w-4 h-4" />
                                Search
                            </label>
                            <input
                                type="text"
                                name="search"
                                value={filters.search}
                                onChange={handleSearchFilterChange}
                                onBlur={handleFilterBlur}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent"
                                placeholder="Search providers..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                <Building2 className="w-4 h-4" />
                                Category
                            </label>
                            <select
                                name="category"
                                value={filters.category}
                                onChange={handleFilterChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent"
                            >
                                <option value="">All Categories</option>
                                {serviceCategories.map((category, index) => (
                                    <option key={index} value={category.value}>
                                        {category.value}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                State
                            </label>
                            <input
                                type="text"
                                name="state"
                                value={filters.state}
                                onChange={handleStateFilterChange}
                                onBlur={handleFilterBlur}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent"
                                placeholder="Filter by state"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                City
                            </label>
                            <input
                                type="text"
                                name="city"
                                value={filters.city}
                                onChange={handleCityFilterChange}
                                onBlur={handleFilterBlur}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent"
                                placeholder="Filter by city"
                            />
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-600">
                            Showing {filteredServices.length} of {services.length} services
                        </p>
                    </div>
                </div>
            )}

            {/* Add/Edit Form */}
            {showAddForm && (
                <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-sm mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                            {isEditing ? (
                                <>
                                    <Edit2 className="w-5 h-5" />
                                    Edit Service
                                </>
                            ) : (
                                <>
                                    <Plus className="w-5 h-5" />
                                    Add New Service
                                </>
                            )}
                        </h2>
                        <button
                            onClick={resetForm}
                            className="p-2 rounded-lg hover:bg-gray-100"
                        >
                            <XCircle className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    State *
                                </label>
                                <input
                                    type="text"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleStateChange}
                                    onBlur={handleBlur}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent"
                                    placeholder="Enter state"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    City *
                                </label>
                                <input
                                    type="text"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleCityChange}
                                    onBlur={handleBlur}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent"
                                    placeholder="Enter city"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                    <Settings className="w-4 h-4" />
                                    Service Category *
                                </label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent"
                                    required
                                >
                                    <option value="">Choose a service</option>
                                    {serviceCategories.map((category, index) => (
                                        <option key={index} value={category.value}>
                                            {category.value}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                    <Building2 className="w-4 h-4" />
                                    Provider Name *
                                </label>
                                <input
                                    type="text"
                                    name="providerName"
                                    value={formData.providerName}
                                    onChange={handleProviderNameChange}
                                    onBlur={handleBlur}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent"
                                    placeholder="Enter provider name"
                                    required
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    Provider Address *
                                </label>
                                <textarea
                                    name="providerAddress"
                                    value={formData.providerAddress}
                                    onChange={handleProviderAddressChange}
                                    onBlur={handleBlur}
                                    rows="3"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent"
                                    placeholder="Enter full address"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                    <PhoneIcon className="w-4 h-4" />
                                    Contact Number *
                                </label>
                                <input
                                    type="tel"
                                    name="contactNumber"
                                    value={formData.contactNumber}
                                    onChange={handleContactNumberChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent"
                                    placeholder="Enter contact number"
                                    maxLength={10}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                    <Tag className="w-4 h-4" />
                                    Discount Token
                                </label>
                                <input
                                    type="text"
                                    name="discountToken"
                                    value={formData.discountToken}
                                    onChange={handleDiscountTokenChange}
                                    onBlur={handleBlur}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent"
                                    placeholder="Enter discount token (optional)"
                                    maxLength={10}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                    <Percent className="w-4 h-4" />
                                    Discount Rate (%)
                                </label>
                                <input
                                    type="number"
                                    name="discountRate"
                                    value={formData.discountRate}
                                    onChange={handleDiscountRateChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent"
                                    placeholder="Enter discount rate (0-100)"
                                    min="0"
                                    max="100"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                            >
                                <XCircle className="w-4 h-4" />
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                                style={{ backgroundColor: themeColor }}
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        {isEditing ? 'Updating...' : 'Adding...'}
                                    </>
                                ) : (
                                    <>
                                        {isEditing ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                                        {isEditing ? 'Update Service' : 'Add Service'}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Services List */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-4 md:px-6 py-4 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                All Services ({filteredServices.length})
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">
                                {services.length} total services • {filteredServices.length} filtered
                            </p>
                        </div>
                    </div>
                </div>

                {loading && !showAddForm ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4">
                        <div className="w-12 h-12 border-4 border-red-400 border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-600">Loading services...</p>
                    </div>
                ) : filteredServices.length === 0 ? (
                    <div className="text-center py-12 px-4">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                            <Settings className="w-10 h-10 text-gray-400" />
                        </div>
                        <p className="text-lg font-medium text-gray-900">No services found</p>
                        <p className="text-gray-600 mt-1">
                            {services.length === 0
                                ? "Add your first service to get started"
                                : "No services match your filters"}
                        </p>
                        {services.length > 0 && (
                            <button
                                onClick={resetFilters}
                                className="mt-4 px-4 py-2 text-sm text-red-600 hover:text-red-700"
                            >
                                Clear all filters
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto -mx-4 md:mx-0">
                        <div className="min-w-full inline-block align-middle">
                            <div className="overflow-hidden">
                                {/* Mobile View - Cards */}
                                <div className="md:hidden">
                                    <div className="px-4 py-3 space-y-4">
                                        {filteredServices.map((service) => (
                                            <div key={service._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <h3 className="font-medium text-gray-900">{service.providerName}</h3>
                                                        <p className="text-sm text-gray-500 mt-1 truncate">{service.providerAddress}</p>

                                                        <div className="flex items-center gap-2 mt-2">
                                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                                {getCategoryIcon(service.category)}
                                                                {service.category}
                                                            </span>

                                                            {service.discountRate && (
                                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                    <Percent className="w-3 h-3" />
                                                                    {service.discountRate}%
                                                                </span>
                                                            )}
                                                        </div>

                                                        <div className="mt-3 space-y-2">
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                                <span className="text-gray-700">{service.city}, {service.state}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <PhoneIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                                <span className="text-gray-700">{service.contactNumber}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col gap-1 ml-2">
                                                        <button
                                                            onClick={() => handleEdit(service)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(service._id)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Tablet & Desktop View - Table */}
                                <table className="hidden md:table w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Provider
                                            </th>
                                            <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Category
                                            </th>
                                            <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider lg:table-cell hidden">
                                                Location
                                            </th>
                                            <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Contact
                                            </th>
                                            <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Discount
                                            </th>
                                            <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {filteredServices.map((service) => (
                                            <tr key={service._id} className="hover:bg-gray-50">
                                                <td className="px-4 md:px-6 py-4">
                                                    <div>
                                                        <div className="font-medium text-gray-900">{service.providerName}</div>
                                                        <div className="text-sm text-gray-500 truncate max-w-[200px]">
                                                            {service.providerAddress}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 md:px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        {getCategoryIcon(service.category)}
                                                        <span className="text-sm text-gray-900">{service.category}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 md:px-6 py-4 hidden lg:table-cell">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                        <div>
                                                            <div className="text-gray-900">{service.city}</div>
                                                            <div className="text-gray-500 text-xs">{service.state}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 md:px-6 py-4">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <PhoneIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                        <span className="text-gray-900">{service.contactNumber}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 md:px-6 py-4">
                                                    {service.discountRate ? (
                                                        <div className="flex items-center gap-2">
                                                            <Percent className="w-4 h-4 text-green-600 flex-shrink-0" />
                                                            <div>
                                                                <div className="text-sm font-medium text-green-600">
                                                                    {service.discountRate}% off
                                                                </div>
                                                                {service.discountToken && (
                                                                    <div className="text-xs text-gray-500 flex items-center gap-1">
                                                                        <Tag className="w-3 h-3" />
                                                                        {service.discountToken}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-gray-500">—</span>
                                                    )}
                                                </td>
                                                <td className="px-4 md:px-6 py-4">
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() => handleEdit(service)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(service._id)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
});

// Add display name for debugging
ServicesContent.displayName = 'ServicesContent';

const Admin = () => {
    const [activeSection, setActiveSection] = useState('dashboard');
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [services, setServices] = useState([]);
    const [filteredServices, setFilteredServices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const navigate = useNavigate();

    // Filter state
    const [filters, setFilters] = useState({
        category: '',
        state: '',
        city: '',
        search: ''
    });

    // Form state
    const [formData, setFormData] = useState({
        state: '',
        city: '',
        category: '',
        providerName: '',
        providerAddress: '',
        contactNumber: '',
        discountToken: '',
        discountRate: ''
    });

    // Fetch services on component mount and when activeSection changes to services
    useEffect(() => {
        if (activeSection === 'services') {
            fetchServices();
        }
    }, [activeSection]);

    // Apply filters whenever services or filters change
    useEffect(() => {
        applyFilters();
    }, [services, filters]);

    const fetchServices = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${BACKEND_URL}/api/services`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch services');
            }

            const data = await response.json();
            setServices(data);
            setFilteredServices(data);
        } catch (error) {
            console.error('Error fetching services:', error);
            toast.error('Failed to load services. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Updated handlers that properly use the event object
    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    }, []);

    const handleFilterChange = useCallback((e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    }, []);

    const resetForm = useCallback(() => {
        setFormData({
            state: '',
            city: '',
            category: '',
            providerName: '',
            providerAddress: '',
            contactNumber: '',
            discountToken: '',
            discountRate: ''
        });
        setIsEditing(false);
        setEditingId(null);
        setShowAddForm(false);
        toast('Form reset', { icon: '🔄' });
    }, []);

    const resetFilters = useCallback(() => {
        setFilters({
            category: '',
            state: '',
            city: '',
            search: ''
        });
        toast('Filters cleared', { icon: '🧹' });
    }, []);

    const validateForm = useCallback(() => {
        const requiredFields = ['state', 'city', 'category', 'providerName', 'providerAddress', 'contactNumber'];
        for (const field of requiredFields) {
            if (!formData[field] || !formData[field].toString().trim()) {
                toast.error(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
                return false;
            }
        }

        // Contact number validation
        if (formData.contactNumber && formData.contactNumber.length !== 10) {
            toast.error('Contact number must be exactly 10 digits');
            return false;
        }

        // Discount rate validation
        if (formData.discountRate && (isNaN(formData.discountRate) || formData.discountRate < 0 || formData.discountRate > 100)) {
            toast.error('Discount rate must be a number between 0 and 100');
            return false;
        }

        return true;
    }, [formData]);

    const applyFilters = useCallback(() => {
        let result = [...services];

        // Apply category filter
        if (filters.category) {
            result = result.filter(service =>
                service.category.toLowerCase() === filters.category.toLowerCase()
            );
        }

        // Apply state filter
        if (filters.state) {
            result = result.filter(service =>
                service.state.toLowerCase().includes(filters.state.toLowerCase())
            );
        }

        // Apply city filter
        if (filters.city) {
            result = result.filter(service =>
                service.city.toLowerCase().includes(filters.city.toLowerCase())
            );
        }

        // Apply search filter
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            result = result.filter(service =>
                service.providerName.toLowerCase().includes(searchTerm) ||
                service.category.toLowerCase().includes(searchTerm) ||
                service.city.toLowerCase().includes(searchTerm) ||
                service.state.toLowerCase().includes(searchTerm)
            );
        }

        setFilteredServices(result);
    }, [services, filters]);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const loadingToast = toast.loading(isEditing ? 'Updating service...' : 'Adding service...');

        try {
            setLoading(true);
            const url = isEditing
                ? `${BACKEND_URL}/api/services/${editingId}`
                : `${BACKEND_URL}/api/services`;

            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error(`Failed to ${isEditing ? 'update' : 'add'} service`);
            }

            const result = await response.json();

            toast.dismiss(loadingToast);
            toast.success(isEditing ? 'Service updated successfully!' : 'Service added successfully!', {
                icon: isEditing ? '✅' : '🎉'
            });

            resetForm();
            fetchServices();

        } catch (error) {
            console.error('Error saving service:', error);
            toast.dismiss(loadingToast);
            toast.error(`Failed to ${isEditing ? 'update' : 'add'} service. Please try again.`);
        } finally {
            setLoading(false);
        }
    }, [isEditing, editingId, formData, validateForm, resetForm]);

    const handleEdit = useCallback((service) => {
        setFormData({
            state: service.state || '',
            city: service.city || '',
            category: service.category || '',
            providerName: service.providerName || '',
            providerAddress: service.providerAddress || '',
            contactNumber: service.contactNumber || '',
            discountToken: service.discountToken || '',
            discountRate: service.discountRate || ''
        });
        setIsEditing(true);
        setEditingId(service._id);
        setShowAddForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        toast('Editing service...', { icon: '✏️' });
    }, []);

    const handleDelete = useCallback(async (id) => {
        const confirmDelete = await new Promise((resolve) => {
            toast.custom((t) => (
                <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
                    <div className="flex-1 w-0 p-4">
                        <div className="flex items-start">
                            <div className="flex-shrink-0 pt-0.5">
                                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                    <Trash2 className="w-5 h-5 text-red-600" />
                                </div>
                            </div>
                            <div className="ml-3 flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                    Delete Service
                                </p>
                                <p className="mt-1 text-sm text-gray-500">
                                    Are you sure you want to delete this service? This action cannot be undone.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex border-l border-gray-200">
                        <button
                            onClick={() => {
                                toast.dismiss(t.id);
                                resolve(false);
                            }}
                            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-500 focus:outline-none"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                toast.dismiss(t.id);
                                resolve(true);
                            }}
                            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-red-600 hover:text-red-500 focus:outline-none"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            ), {
                duration: Infinity,
            });
        });

        if (!confirmDelete) return;

        const loadingToast = toast.loading('Deleting service...');

        try {
            setLoading(true);
            const response = await fetch(`${BACKEND_URL}/api/services/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete service');
            }

            toast.dismiss(loadingToast);
            toast.success('Service deleted successfully!', { icon: '🗑️' });
            fetchServices();
        } catch (error) {
            console.error('Error deleting service:', error);
            toast.dismiss(loadingToast);
            toast.error('Failed to delete service. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    // Memoized ServicesContent props to prevent unnecessary re-renders
    const servicesContentProps = useMemo(() => ({
        showAddForm,
        setShowAddForm,
        formData,
        handleInputChange,
        handleSubmit,
        isEditing,
        loading,
        resetForm,
        services,
        filteredServices,
        filters,
        handleFilterChange,
        resetFilters,
        handleEdit,
        handleDelete,
        showFilters,
        setShowFilters
    }), [
        showAddForm,
        formData,
        handleInputChange,
        handleSubmit,
        isEditing,
        loading,
        resetForm,
        services,
        filteredServices,
        filters,
        handleFilterChange,
        resetFilters,
        handleEdit,
        handleDelete,
        showFilters
    ]);

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {/* Toast Container */}
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                    },
                    success: {
                        style: {
                            background: '#10B981',
                        },
                        iconTheme: {
                            primary: '#fff',
                            secondary: '#10B981',
                        },
                    },
                    error: {
                        style: {
                            background: '#EF4444',
                        },
                        iconTheme: {
                            primary: '#fff',
                            secondary: '#EF4444',
                        },
                    },
                    loading: {
                        style: {
                            background: '#F59E0B',
                        },
                    },
                }}
            />

            <Navbar />

            {/* Mobile Hamburger */}
            <div className="fixed bottom-4 right-4 z-40 lg:hidden">
                <button
                    onClick={() => setMobileSidebarOpen(true)}
                    className="p-4 rounded-full bg-red-400 shadow-lg flex items-center justify-center hover:bg-red-500 transition-colors shadow-lg"
                    style={{ color: 'white' }}
                >
                    <Menu className="w-6 h-6" />
                </button>
            </div>

            <div className="flex flex-1 pt-16">
                {/* Desktop Sidebar (left) */}
                <aside className="hidden lg:flex flex-col bg-white border-r border-gray-200 h-[calc(100vh-4rem)] w-20 overflow-y-auto sticky top-16">
                    <div className="flex flex-col p-4 space-y-2">
                        {/* Home */}
                        <button
                            onClick={() => navigate('/')}
                            className="flex items-center justify-center w-full p-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors group relative"
                            title="Home"
                        >
                            <HomeIcon className="w-5 h-5" />
                            <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                Home
                            </span>
                        </button>

                        {navSections.map(section => (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={`flex items-center justify-center w-full p-3 rounded-lg transition-colors group relative ${activeSection === section.id
                                    ? 'bg-red-400 text-white'
                                    : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                style={{ backgroundColor: activeSection === section.id ? themeColor : 'transparent' }}
                                title={section.name}
                            >
                                {section.icon}
                                <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    {section.name}
                                </span>
                            </button>
                        ))}
                    </div>
                </aside>

                {/* Mobile Sidebar (right) */}
                {mobileSidebarOpen && (
                    <aside className="fixed inset-0 z-50 flex lg:hidden justify-end">
                        {/* Background overlay */}
                        <div
                            className="fixed inset-0 bg-black bg-opacity-30"
                            onClick={() => setMobileSidebarOpen(false)}
                        />
                        <div className="bg-white w-20 h-full flex flex-col p-4 space-y-2 shadow-lg relative z-50 justify-between">
                            {/* Sidebar Buttons */}
                            <div className="flex flex-col space-y-2">
                                {/* Home */}
                                <button
                                    onClick={() => {
                                        navigate('/');
                                        setMobileSidebarOpen(false);
                                    }}
                                    className="flex items-center justify-center w-full p-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                                >
                                    <HomeIcon className="w-5 h-5" />
                                </button>

                                {navSections.map(section => (
                                    <button
                                        key={section.id}
                                        onClick={() => {
                                            setActiveSection(section.id);
                                            setMobileSidebarOpen(false);
                                        }}
                                        className={`flex items-center justify-center w-full p-3 rounded-lg transition-colors ${activeSection === section.id
                                            ? 'bg-red-400 text-white'
                                            : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                        style={{ backgroundColor: activeSection === section.id ? themeColor : 'transparent' }}
                                    >
                                        {section.icon}
                                    </button>
                                ))}
                            </div>

                            {/* Close Button at bottom */}
                            <div className="flex justify-center mt-auto">
                                <button
                                    onClick={() => setMobileSidebarOpen(false)}
                                    className="p-2 rounded-lg hover:bg-gray-100"
                                    style={{ color: themeColor }}
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </aside>
                )}

                {/* Main Content */}
                <main className="flex-1 p-4 md:p-6 transition-all duration-300 w-full">
                    {activeSection === 'services' ? (
                        <ServicesContent {...servicesContentProps} />
                    ) : activeSection === 'feedback' ? (
                        <AdminFeedback />
                    ) : activeSection === 'contact' ? (
                        <AdminContact />
                    ) : activeSection === 'finance' ? (
                        <AdminFinance />
                    ) : activeSection === 'verification' ? (
                        <AdminVerification />
                    ) : activeSection === 'notification' ? (
                        <AdminNotification />
                    ) : (
                        <AdminDashboard />
                    )}
                </main>
            </div>

            {/* Footer */}
            <div className="mt-auto">
                <Footer />
            </div>
        </div>
    );
};

export default Admin;