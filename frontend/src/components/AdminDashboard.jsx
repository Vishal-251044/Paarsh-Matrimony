import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from "recharts";
import {
  Users, UserCheck, Crown, Eye, EyeOff, DollarSign,
  TrendingUp, Calendar, RefreshCw, Download, Filter,
  Activity, CreditCard, BarChart3, PieChart as PieChartIcon,
  Clock, ChevronUp, ChevronDown, Award
} from "lucide-react";

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [loginData, setLoginData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [userTypeData, setUserTypeData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState("yearly");
  const [activeTab, setActiveTab] = useState("overview");

  const gold = "oklch(70.4%_0.191_22.216)";
  const red400 = "#f87171";
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const COLORS = [red400, '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, loginRes, revenueRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/admin/dashboard/stats`),
        axios.get(`${BACKEND_URL}/admin/dashboard/logins?range=${timeRange}`),
        axios.get(`${BACKEND_URL}/admin/dashboard/revenue?range=${timeRange}`)
      ]);

      setStats(statsRes.data);

      // Process login data - last 12 months
      const loginEntries = Object.entries(loginRes.data)
        .slice(-12) // Get last 12 months
        .map(([month, count], index) => ({
          month,
          logins: count,
          name: month.substring(0, 3), // Short month name
          index: index
        }));
      setLoginData(loginEntries);

      // Process revenue data - last 12 months
      const revenueEntries = Object.entries(revenueRes.data)
        .slice(-12) // Get last 12 months
        .map(([month, amount], index) => ({
          month,
          revenue: amount,
          name: month.substring(0, 3), // Short month name
          index: index
        }));
      setRevenueData(revenueEntries);

      // Calculate user type data for pie chart
      const userType = [
        { name: 'Premium', value: statsRes.data.premiumUsers || 0 },
        { name: 'Free', value: (statsRes.data.totalUsers || 0) - (statsRes.data.premiumUsers || 0) }
      ];
      setUserTypeData(userType);

    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format number
  const formatNumber = (num) => {
    if (!num) return '0';
    return new Intl.NumberFormat('en-IN').format(num);
  };

  // Calculate growth percentage
  const calculateGrowth = (data) => {
    if (data.length < 2) return 0;
    const current = data[data.length - 1]?.revenue || 0;
    const previous = data[data.length - 2]?.revenue || 0;
    if (previous === 0) return 100;
    return ((current - previous) / previous) * 100;
  };

  // Get month name from index
  const getMonthName = (index) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[index % 12];
  };

  // Generate last 12 months labels
  const generateLast12Months = () => {
    const months = [];
    const today = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      months.push(date.toLocaleString('default', { month: 'short' }));
    }
    return months;
  };

  // Stats Card Component
  const StatsCard = ({ title, value, icon: Icon, trend, description, color = gold }) => (
    <div className="bg-white rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold" style={{ color }}>{value}</p>
          {description && (
            <p className="text-xs text-gray-400 mt-2">{description}</p>
          )}
        </div>
        <div className="p-3 rounded-lg" style={{ backgroundColor: `${color}20` }}>
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-6 space-y-6 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2 md:gap-3" style={{ color: gold }}>
            <Activity className="w-6 h-6 md:w-8 md:h-8" />
            Admin Dashboard
          </h1>
          <p className="text-gray-600 text-sm md:text-base mt-1">
            Real-time analytics and platform overview
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Time Range Filter */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:outline-none"
              style={{ borderColor: gold, focusRingColor: gold }}
            >
              <option value="weekly">This Week</option>
              <option value="monthly">This Month</option>
              <option value="quarterly">This Quarter</option>
              <option value="yearly">Last 12 Months</option>
            </select>
          </div>

          <button
            onClick={fetchData}
            disabled={loading}
            className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 flex items-center gap-2 text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Users"
          value={formatNumber(stats.totalUsers || 0)}
          icon={Users}
          trend={12.5}
          description="Active users on platform"
        />

        <StatsCard
          title="Premium Users"
          value={formatNumber(stats.premiumUsers || 0)}
          icon={Crown}
          trend={8.2}
          description="Paid subscription users"
          color="#f59e0b"
        />

        <StatsCard
          title="Published Profiles"
          value={formatNumber(stats.publishedProfiles || 0)}
          icon={Eye}
          trend={15.3}
          description="Visible to all users"
          color="#10b981"
        />

        <StatsCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue || 0)}
          icon={DollarSign}
          trend={calculateGrowth(revenueData)}
          description="All-time platform revenue"
          color="#3b82f6"
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Free Users</p>
              <p className="text-2xl font-bold mt-1" style={{ color: red400 }}>
                {formatNumber((stats.totalUsers || 0) - (stats.premiumUsers || 0))}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {(stats.totalUsers ? ((stats.totalUsers - (stats.premiumUsers || 0)) / stats.totalUsers * 100).toFixed(1) : 0)}% of total
              </p>
            </div>
            <div className="p-3 rounded-lg" style={{ backgroundColor: `${red400}20` }}>
              <UserCheck className="w-6 h-6" style={{ color: red400 }} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Hidden Profiles</p>
              <p className="text-2xl font-bold mt-1" style={{ color: red400 }}>
                {formatNumber(stats.hiddenProfiles || 0)}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Not visible to other users
              </p>
            </div>
            <div className="p-3 rounded-lg" style={{ backgroundColor: `${red400}20` }}>
              <EyeOff className="w-6 h-6" style={{ color: red400 }} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Conversion Rate</p>
              <p className="text-2xl font-bold mt-1" style={{ color: red400 }}>
                {stats.totalUsers ? ((stats.premiumUsers || 0) / stats.totalUsers * 100).toFixed(1) : 0}%
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Free to premium conversion
              </p>
            </div>
            <div className="p-3 rounded-lg" style={{ backgroundColor: `${red400}20` }}>
              <TrendingUp className="w-6 h-6" style={{ color: red400 }} />
            </div>
          </div>
        </div>
      </div>

      {/* User Distribution Chart */}
      <div className="bg-white rounded-xl p-6 border shadow-sm">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
          <PieChartIcon className="w-5 h-5" style={{ color: red400 }} />
          User Distribution Overview
        </h2>

        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
          <div className="w-full lg:w-1/2">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={userTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  outerRadius={100}
                  innerRadius={40}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {userTypeData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === 0 ? '#10b981' : red400}  
                      stroke="#fff"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [formatNumber(value), 'Users']}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: `1px solid ${red400}`,
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="w-full lg:w-1/2 space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#10b981' }}></div>
                <div>
                  <p className="font-medium">Premium Users</p>
                  <p className="text-sm text-gray-500">Active paid subscribers</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold" style={{ color: '#10b981' }}>{formatNumber(stats.premiumUsers || 0)}</p>
                <p className="text-sm text-gray-500">
                  {stats.totalUsers ? ((stats.premiumUsers || 0) / stats.totalUsers * 100).toFixed(1) : 0}% of total
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-emerald-500" style={{ backgroundColor: red400 }}></div>
                <div>
                  <p className="font-medium">Free Users</p>
                  <p className="text-sm text-gray-500">Basic plan users</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-emerald-600" style={{ color: red400 }}>
                  {formatNumber((stats.totalUsers || 0) - (stats.premiumUsers || 0))}
                </p>
                <p className="text-sm text-gray-500">
                  {stats.totalUsers ? (((stats.totalUsers - (stats.premiumUsers || 0)) / stats.totalUsers) * 100).toFixed(1) : 0}% of total
                </p>
              </div>
            </div>

            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-start gap-3">
                <Award className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Premium Conversion</p>
                  <p className="text-xs text-amber-600 mt-1">
                    {stats.premiumUsers || 0} out of {stats.totalUsers || 0} users have upgraded to premium
                  </p>
                  <div className="mt-2 w-full bg-amber-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-amber-500"
                      style={{
                        width: `${stats.totalUsers ? ((stats.premiumUsers || 0) / stats.totalUsers * 100) : 0}%`
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-amber-700 mt-1 text-center">
                    {stats.totalUsers ? ((stats.premiumUsers || 0) / stats.totalUsers * 100).toFixed(1) : 0}% conversion rate
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: red400 }}></div>
            <p className="mt-4 text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;