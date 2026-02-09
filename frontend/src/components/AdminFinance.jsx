import React, { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
    Calculator, TrendingUp, Percent, Users,
    DollarSign, Calendar, BarChart3, PieChart,
    Target, RefreshCw, Download, FileText,
    CreditCard, Crown, Activity, TrendingDown,
    ChevronUp, ChevronDown, Info, Filter
} from "lucide-react";

const red400 = "#f87171"; // Tailwind red-400

const AdminFinance = () => {
    // All inputs start empty (not zero)
    const [inputs, setInputs] = useState({
        premiumPrice: "",
        premiumMembers: "",
        commissionRate: "",
        serviceProviders: "",
        avgServiceRevenue: "",
        monthlyPremiumGrowth: "",
        serviceGrowthRate: "",
        projectionMonths: 12
    });

    // Update input values
    const handleInputChange = (field, value) => {
        setInputs(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Parse input values with fallback to 0
    const parseValue = (value) => {
        if (value === "" || value === null || value === undefined) return 0;
        const num = parseFloat(value);
        return isNaN(num) ? 0 : num;
    };

    // Calculate premium revenue
    const calculatePremiumRevenue = () => {
        const premiumPrice = parseValue(inputs.premiumPrice);
        const premiumMembers = parseValue(inputs.premiumMembers);
        return premiumMembers * premiumPrice;
    };

    // Calculate commission revenue
    const calculateCommissionRevenue = () => {
        const commissionRate = parseValue(inputs.commissionRate);
        const serviceProviders = parseValue(inputs.serviceProviders);
        const avgServiceRevenue = parseValue(inputs.avgServiceRevenue);
        const totalServiceRevenue = serviceProviders * avgServiceRevenue;
        return (totalServiceRevenue * commissionRate) / 100;
    };

    // Calculate total current revenue
    const calculateTotalRevenue = () => {
        return calculatePremiumRevenue() + calculateCommissionRevenue();
    };

    // Calculate future projections
    const calculateProjection = () => {
        const projection = [];
        const monthlyPremiumGrowth = parseValue(inputs.monthlyPremiumGrowth) / 100;
        const serviceGrowthRate = parseValue(inputs.serviceGrowthRate) / 100;

        let currentMembers = parseValue(inputs.premiumMembers);
        let currentProviders = parseValue(inputs.serviceProviders);
        const premiumPrice = parseValue(inputs.premiumPrice);
        const commissionRate = parseValue(inputs.commissionRate);
        const avgServiceRevenue = parseValue(inputs.avgServiceRevenue);

        for (let i = 0; i < inputs.projectionMonths; i++) {
            const monthData = {
                month: i + 1,
                premiumMembers: Math.round(currentMembers),
                premiumRevenue: currentMembers * premiumPrice,
                serviceProviders: Math.round(currentProviders),
                commissionRevenue: (currentProviders * avgServiceRevenue * commissionRate) / 100
            };

            monthData.totalRevenue = monthData.premiumRevenue + monthData.commissionRevenue;
            projection.push(monthData);

            // Apply growth
            currentMembers *= (1 + monthlyPremiumGrowth);
            currentProviders *= (1 + serviceGrowthRate);
        }

        return projection;
    };

    // Get calculated values
    const currentRevenue = calculateTotalRevenue();
    const premiumRevenue = calculatePremiumRevenue();
    const commissionRevenue = calculateCommissionRevenue();
    const projection = calculateProjection();
    const finalMonthProjection = projection[projection.length - 1] || { totalRevenue: 0 };

    // Format currency in INR
    const formatCurrency = (amount) => {
        if (!amount || amount === 0) return "₹0";
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    // Format numbers with commas
    const formatNumber = (num) => {
        if (!num || num === 0) return "0";
        return new Intl.NumberFormat('en-IN').format(Math.round(num));
    };

    // Get growth percentage
    const getGrowthPercentage = () => {
        if (currentRevenue === 0) return 0;
        const growth = ((finalMonthProjection.totalRevenue - currentRevenue) / currentRevenue) * 100;
        return Math.round(growth);
    };

    // Reset all inputs
    const resetCalculator = () => {
        setInputs({
            premiumPrice: "",
            premiumMembers: "",
            commissionRate: "",
            serviceProviders: "",
            avgServiceRevenue: "",
            monthlyPremiumGrowth: "",
            serviceGrowthRate: "",
            projectionMonths: 12
        });
    };

    // Export data
    const exportData = () => {
        const doc = new jsPDF();

        const pageWidth = doc.internal.pageSize.getWidth();

        // ===== HEADER =====
        doc.setFontSize(20);
        doc.setTextColor(220, 38, 38); // red
        doc.text("Financial Report", pageWidth / 2, 15, { align: "center" });

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 22, { align: "center" });

        // ===== SUMMARY BOX =====
        doc.setDrawColor(200);
        doc.rect(14, 30, pageWidth - 28, 30);

        doc.setFontSize(12);
        doc.setTextColor(0);

        doc.text(`Current Revenue: ${formatCurrency(currentRevenue)}`, 20, 40);
        doc.text(`Premium Revenue: ${formatCurrency(premiumRevenue)}`, 20, 48);
        doc.text(`Commission Revenue: ${formatCurrency(commissionRevenue)}`, 20, 56);

        doc.text(`Growth: ${getGrowthPercentage()}%`, 110, 48);

        // ===== TABLE =====
        autoTable(doc, {
            startY: 70,
            head: [[
                "Month",
                "Premium Members",
                "Premium Revenue",
                "Service Providers",
                "Commission Revenue",
                "Total Revenue"
            ]],
            body: projection.map((m) => [
                `Month ${m.month}`,
                formatNumber(m.premiumMembers),
                formatCurrency(m.premiumRevenue),
                formatNumber(m.serviceProviders),
                formatCurrency(m.commissionRevenue),
                formatCurrency(m.totalRevenue),
            ]),
            styles: {
                fontSize: 9,
                cellPadding: 3,
            },
            headStyles: {
                fillColor: [248, 113, 113], // red-400
                textColor: 255,
                halign: "center"
            },
            alternateRowStyles: {
                fillColor: [250, 250, 250]
            },
        });

        // ===== FOOTER =====
        const pageHeight = doc.internal.pageSize.getHeight();
        doc.setFontSize(9);
        doc.setTextColor(120);
        doc.text(
            "Wedding Services Admin Finance Report",
            pageWidth / 2,
            pageHeight - 10,
            { align: "center" }
        );

        // SAVE
        doc.save("financial-report.pdf");
    };

    // Check if any input has value
    const hasInputs = Object.values(inputs).some(val => val !== "" && val !== 12);

    return (
        <div id="finance-pdf" className="p-4 md:p-6 space-y-6 bg-gradient-to-br from-gray-50 to-white min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2 md:gap-3" style={{ color: "black" }}>
                        <Calculator className="w-6 h-6 md:w-8 md:h-8" />
                        Financial Calculator
                    </h1>
                    <p className="text-gray-600 text-sm md:text-base mt-1">
                        Calculate revenue and project future earnings
                    </p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={resetCalculator}
                        className="px-3 md:px-4 py-2 rounded-lg border border-red-200 hover:bg-red-50 flex items-center gap-2 text-sm transition-colors"
                        style={{ color: red400 }}
                    >
                        <RefreshCw className="w-4 h-4" />
                        Reset
                    </button>
                    <button
                        onClick={exportData}
                        disabled={!hasInputs}
                        className={`px-3 md:px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors ${hasInputs
                            ? 'bg-red-400 text-white hover:bg-red-500'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                </div>
            </div>

            {/* Main Calculator */}
            <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 border shadow-sm">
                <h2 className="text-lg md:text-xl font-bold mb-6 flex items-center gap-2">
                    <Calculator className="w-5 h-5" style={{ color: red400 }} />
                    Revenue Calculator
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Premium Membership Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Crown className="w-5 h-5" style={{ color: red400 }} />
                            <h3 className="font-medium text-gray-800">Premium Membership</h3>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Premium Price (₹/year)
                            </label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="number"
                                    min="0"
                                    placeholder="Enter price"
                                    value={inputs.premiumPrice}
                                    onChange={(e) => handleInputChange('premiumPrice', e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:outline-none"
                                    style={{ borderColor: red400 }}
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Annual subscription price per member
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Number of Premium Members
                            </label>
                            <div className="relative">
                                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="number"
                                    min="0"
                                    placeholder="Enter number"
                                    value={inputs.premiumMembers}
                                    onChange={(e) => handleInputChange('premiumMembers', e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:outline-none"
                                    style={{ borderColor: red400 }}
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Current active premium members
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Monthly Growth Rate (%)
                            </label>
                            <div className="relative">
                                <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="number"
                                    min="0"
                                    placeholder="Enter percentage"
                                    step="0.1"
                                    value={inputs.monthlyPremiumGrowth}
                                    onChange={(e) => handleInputChange('monthlyPremiumGrowth', e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:outline-none"
                                    style={{ borderColor: red400 }}
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Expected monthly growth in premium members
                            </p>
                        </div>
                    </div>

                    {/* Service Commission Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Percent className="w-5 h-5" style={{ color: red400 }} />
                            <h3 className="font-medium text-gray-800">Service Commissions</h3>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Commission Rate (%)
                            </label>
                            <div className="relative">
                                <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="number"
                                    min="0"
                                    placeholder="Enter percentage"
                                    step="0.1"
                                    value={inputs.commissionRate}
                                    onChange={(e) => handleInputChange('commissionRate', e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:outline-none"
                                    style={{ borderColor: red400 }}
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Commission percentage on service revenue
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Number of Service Providers
                            </label>
                            <div className="relative">
                                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="number"
                                    min="0"
                                    placeholder="Enter number"
                                    value={inputs.serviceProviders}
                                    onChange={(e) => handleInputChange('serviceProviders', e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:outline-none"
                                    style={{ borderColor: red400 }}
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Total registered service providers
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Average Service Revenue (₹)
                            </label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="number"
                                    min="0"
                                    placeholder="Enter amount"
                                    value={inputs.avgServiceRevenue}
                                    onChange={(e) => handleInputChange('avgServiceRevenue', e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:outline-none"
                                    style={{ borderColor: red400 }}
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Average revenue per service provider per year
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Service Growth Rate (%)
                            </label>
                            <div className="relative">
                                <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="number"
                                    min="0"
                                    placeholder="Enter percentage"
                                    step="0.1"
                                    value={inputs.serviceGrowthRate}
                                    onChange={(e) => handleInputChange('serviceGrowthRate', e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:outline-none"
                                    style={{ borderColor: red400 }}
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Expected monthly growth in service providers
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Current Revenue Results - Only show if there are inputs */}
            {hasInputs && (
                <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 border shadow-sm">
                    <h2 className="text-lg md:text-xl font-bold mb-6 flex items-center gap-2">
                        <DollarSign className="w-5 h-5" style={{ color: red400 }} />
                        Current Revenue Calculation
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-red-50 p-4 rounded-lg">
                            <p className="text-sm text-red-700 font-medium">Premium Revenue</p>
                            <p className="text-2xl font-bold text-red-900 mt-2">{formatCurrency(premiumRevenue)}</p>
                            <p className="text-xs text-red-600 mt-1">
                                {formatNumber(parseValue(inputs.premiumMembers))} members × {formatCurrency(parseValue(inputs.premiumPrice))}
                            </p>
                        </div>

                        <div className="bg-red-50 p-4 rounded-lg">
                            <p className="text-sm text-red-700 font-medium">Commission Revenue</p>
                            <p className="text-2xl font-bold text-red-900 mt-2">{formatCurrency(commissionRevenue)}</p>
                            <p className="text-xs text-red-600 mt-1">
                                {parseValue(inputs.commissionRate)}% of {formatNumber(parseValue(inputs.serviceProviders))} providers
                            </p>
                        </div>

                        <div className="bg-red-100 p-4 rounded-lg border-2" style={{ borderColor: red400 }}>
                            <p className="text-sm font-medium" style={{ color: red400 }}>Total Revenue</p>
                            <p className="text-3xl font-bold mt-2" style={{ color: red400 }}>{formatCurrency(currentRevenue)}</p>
                            <p className="text-xs mt-1" style={{ color: red400 }}>
                                Premium + Commission
                            </p>
                        </div>
                    </div>

                    {/* Revenue Breakdown */}
                    <div className="mt-6">
                        <h3 className="text-md font-medium mb-3 flex items-center gap-2">
                            <PieChart className="w-4 h-4" style={{ color: red400 }} />
                            Revenue Breakdown
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Premium Membership</span>
                                    <span>
                                        {premiumRevenue > 0 && currentRevenue > 0
                                            ? ((premiumRevenue / currentRevenue) * 100).toFixed(1)
                                            : 0}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="h-2 rounded-full"
                                        style={{
                                            width: `${premiumRevenue > 0 && currentRevenue > 0 ? (premiumRevenue / currentRevenue) * 100 : 0}%`,
                                            backgroundColor: red400
                                        }}
                                    ></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Service Commission</span>
                                    <span>
                                        {commissionRevenue > 0 && currentRevenue > 0
                                            ? ((commissionRevenue / currentRevenue) * 100).toFixed(1)
                                            : 0}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="h-2 rounded-full"
                                        style={{
                                            width: `${commissionRevenue > 0 && currentRevenue > 0 ? (commissionRevenue / currentRevenue) * 100 : 0}%`,
                                            backgroundColor: '#dc2626' // red-600 for contrast
                                        }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Future Projection - Only show if there are inputs */}
            {hasInputs && (
                <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 border shadow-sm">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                        <div>
                            <h2 className="text-lg md:text-xl font-bold mb-1 flex items-center gap-2">
                                <BarChart3 className="w-5 h-5" style={{ color: red400 }} />
                                Future Revenue Projection
                            </h2>
                            <p className="text-sm text-gray-600">
                                Project growth over selected timeframe
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Projection Period</label>
                                <select
                                    value={inputs.projectionMonths}
                                    onChange={(e) => handleInputChange('projectionMonths', e.target.value)}
                                    className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:outline-none"
                                    style={{ borderColor: red400 }}
                                >
                                    <option value={6}>6 months</option>
                                    <option value={12}>12 months</option>
                                    <option value={24}>24 months</option>
                                    <option value={36}>36 months</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Projection Results */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white border p-4 rounded-lg">
                            <p className="text-sm text-gray-600">Projected Revenue</p>
                            <p className="text-2xl font-bold mt-2" style={{ color: red400 }}>
                                {formatCurrency(finalMonthProjection.totalRevenue)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                After {inputs.projectionMonths} months
                            </p>
                        </div>

                        <div className="bg-white border p-4 rounded-lg">
                            <p className="text-sm text-gray-600">Growth Percentage</p>
                            <div className="flex items-center gap-2 mt-2">
                                {getGrowthPercentage() >= 0 ? (
                                    <ChevronUp className="w-5 h-5 text-emerald-600" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-red-600" />
                                )}
                                <p className={`text-2xl font-bold ${getGrowthPercentage() >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                    {getGrowthPercentage()}%
                                </p>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Increase from current</p>
                        </div>

                        <div className="bg-white border p-4 rounded-lg">
                            <p className="text-sm text-gray-600">Monthly Growth</p>
                            <div className="flex items-center gap-2 mt-2">
                                <TrendingUp className="w-5 h-5" style={{ color: red400 }} />
                                <p className="text-2xl font-bold" style={{ color: red400 }}>
                                    {parseValue(inputs.monthlyPremiumGrowth)}%
                                </p>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Premium members growth</p>
                        </div>
                    </div>

                    {/* Projection Table */}
                    {projection.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-2 px-2 text-gray-600 font-medium">Month</th>
                                        <th className="text-left py-2 px-2 text-gray-600 font-medium">Premium Members</th>
                                        <th className="text-left py-2 px-2 text-gray-600 font-medium">Premium Revenue</th>
                                        <th className="text-left py-2 px-2 text-gray-600 font-medium">Service Providers</th>
                                        <th className="text-left py-2 px-2 text-gray-600 font-medium">Commission Revenue</th>
                                        <th className="text-left py-2 px-2 text-gray-600 font-medium">Total Revenue</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {projection.map((month) => (
                                        <tr key={month.month} className="border-b hover:bg-red-50">
                                            <td className="py-2 px-2">Month {month.month}</td>
                                            <td className="py-2 px-2">{formatNumber(month.premiumMembers)}</td>
                                            <td className="py-2 px-2 font-medium">{formatCurrency(month.premiumRevenue)}</td>
                                            <td className="py-2 px-2">{formatNumber(month.serviceProviders)}</td>
                                            <td className="py-2 px-2 font-medium">{formatCurrency(month.commissionRevenue)}</td>
                                            <td className="py-2 px-2 font-bold" style={{ color: red400 }}>
                                                {formatCurrency(month.totalRevenue)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Projection Summary */}
                    <div className="mt-6 p-4 bg-red-50 rounded-lg">
                        <h3 className="font-medium mb-3 flex items-center gap-2" style={{ color: red400 }}>
                            <Target className="w-4 h-4" />
                            Projection Summary
                        </h3>
                        <div className="text-sm text-gray-600 space-y-2">
                            <p>
                                • Starting from {formatNumber(parseValue(inputs.premiumMembers))} premium members at {formatCurrency(parseValue(inputs.premiumPrice))} each
                            </p>
                            <p>
                                • With {parseValue(inputs.commissionRate)}% commission on {formatNumber(parseValue(inputs.serviceProviders))} service providers
                            </p>
                            <p>
                                • Applying {parseValue(inputs.monthlyPremiumGrowth)}% monthly growth for premium members
                            </p>
                            <p>
                                • And {parseValue(inputs.serviceGrowthRate)}% monthly growth for service providers
                            </p>
                            <p className="font-medium mt-2" style={{ color: red400 }}>
                                After {inputs.projectionMonths} months, projected revenue reaches {formatCurrency(finalMonthProjection.totalRevenue)}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!hasInputs && (
                <div className="bg-white rounded-lg md:rounded-xl p-8 md:p-12 border shadow-sm text-center">
                    <Calculator className="w-16 h-16 mx-auto mb-4" style={{ color: red400 }} />
                    <h3 className="text-xl font-bold mb-2" style={{ color: red400 }}>Start Calculating</h3>
                    <p className="text-gray-600 mb-4">
                        Enter your financial data in the calculator above to see revenue projections
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                            onClick={() => handleInputChange('premiumMembers', '100')}
                            className="px-4 py-2 border border-red-200 hover:bg-red-50 rounded-lg transition-colors"
                            style={{ color: red400 }}
                        >
                            Try Example: 100 Members
                        </button>
                        <button
                            onClick={() => handleInputChange('serviceProviders', '50')}
                            className="px-4 py-2 border border-red-200 hover:bg-red-50 rounded-lg transition-colors"
                            style={{ color: red400 }}
                        >
                            Try Example: 50 Providers
                        </button>
                    </div>
                </div>
            )}

            {/* Instructions */}
            <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 border shadow-sm">
                <h2 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5" style={{ color: red400 }} />
                    How to Use This Calculator
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                        <div className="flex items-start gap-2">
                            <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-medium" style={{ color: red400 }}>1</span>
                            </div>
                            <div>
                                <p className="font-medium text-gray-800">Enter Your Numbers</p>
                                <p className="text-sm text-gray-600">Fill in your current premium members, service providers, and their respective revenue numbers</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-2">
                            <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-medium" style={{ color: red400 }}>2</span>
                            </div>
                            <div>
                                <p className="font-medium text-gray-800">Set Growth Expectations</p>
                                <p className="text-sm text-gray-600">Define monthly growth percentages for both premium members and service providers</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-start gap-2">
                            <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-medium" style={{ color: red400 }}>3</span>
                            </div>
                            <div>
                                <p className="font-medium text-gray-800">Adjust Timeframe</p>
                                <p className="text-sm text-gray-600">Select how many months into the future you want to project (6, 12, 24, or 36 months)</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-2">
                            <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-medium" style={{ color: red400 }}>4</span>
                            </div>
                            <div>
                                <p className="font-medium text-gray-800">Analyze Results</p>
                                <p className="text-sm text-gray-600">Review revenue breakdown, growth projections, and export results for further analysis</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminFinance;


// Formula: PremiumMembersₙ = PremiumMembers₀ × (1 + r)ⁿ
//          ServiceProvidersₙ = ServiceProviders₀ × (1 + s)ⁿ
