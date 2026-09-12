import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  CreditCard,
  Calendar,
  Package,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
  Download,
  RefreshCw,
  Filter
} from 'lucide-react';
import toast from '../../utils/toast';

const RevenueDashboard = () => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month');
  const [dashboardData, setDashboardData] = useState({
    overview: {
      totalRevenue: 0,
      revenueGrowth: 0,
      totalInvoices: 0,
      invoiceGrowth: 0,
      averageInvoiceValue: 0,
      activeSubscriptions: 0,
      pendingRevenue: 0,
      pendingInvoices: 0
    },
    trends: [],
    packagePerformance: [],
    clientRevenue: [],
    paymentMethodStats: [],
    upcomingRenewals: { renewals: [], summary: { totalValue: 0, count: 0 } },
    overdueInvoices: { summary: { totalOverdue: 0, count: 0 }, byAge: [] }
  });

  useEffect(() => {
    fetchDashboardData();
  }, [period]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/super-admin/revenue/dashboard?period=${period}`);
      const data = await response.json();
      
      if (data.success) {
        setDashboardData(data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const getGrowthIcon = (growth) => {
    return growth >= 0 ? TrendingUp : TrendingDown;
  };

  const getGrowthColor = (growth) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Revenue Dashboard
              </h1>
              <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Comprehensive revenue analytics and financial insights
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
              <button
                onClick={fetchDashboardData}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} overflow-hidden shadow rounded-lg`}>
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <DollarSign className="h-6 w-6 text-green-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} truncate`}>
                          Total Revenue
                        </dt>
                        <dd className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {formatCurrency(dashboardData.overview.totalRevenue)}
                        </dd>
                        <dd className={`flex items-center text-sm ${getGrowthColor(dashboardData.overview.revenueGrowth)}`}>
                          {React.createElement(getGrowthIcon(dashboardData.overview.revenueGrowth), { className: 'h-4 w-4 mr-1' })}
                          {formatPercentage(dashboardData.overview.revenueGrowth)}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} overflow-hidden shadow rounded-lg`}>
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CreditCard className="h-6 w-6 text-blue-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} truncate`}>
                          Total Invoices
                        </dt>
                        <dd className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {dashboardData.overview.totalInvoices}
                        </dd>
                        <dd className={`flex items-center text-sm ${getGrowthColor(dashboardData.overview.invoiceGrowth)}`}>
                          {React.createElement(getGrowthIcon(dashboardData.overview.invoiceGrowth), { className: 'h-4 w-4 mr-1' })}
                          {formatPercentage(dashboardData.overview.invoiceGrowth)}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} overflow-hidden shadow rounded-lg`}>
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Users className="h-6 w-6 text-purple-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} truncate`}>
                          Active Subscriptions
                        </dt>
                        <dd className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {dashboardData.overview.activeSubscriptions}
                        </dd>
                        <dd className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          Avg: {formatCurrency(dashboardData.overview.averageInvoiceValue)}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} overflow-hidden shadow rounded-lg`}>
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Clock className="h-6 w-6 text-yellow-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} truncate`}>
                          Pending Revenue
                        </dt>
                        <dd className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {formatCurrency(dashboardData.overview.pendingRevenue)}
                        </dd>
                        <dd className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {dashboardData.overview.pendingInvoices} invoices
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Revenue Trends Chart */}
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow rounded-lg p-6`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Revenue Trends
                  </h3>
                  <BarChart3 className="h-5 w-5 text-gray-400" />
                </div>
                <div className="h-64 flex items-center justify-center">
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Chart visualization would go here
                    <br />
                    (Revenue trends over time)
                  </div>
                </div>
              </div>

              {/* Package Performance */}
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow rounded-lg p-6`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Package Performance
                  </h3>
                  <PieChart className="h-5 w-5 text-gray-400" />
                </div>
                <div className="space-y-3">
                  {dashboardData.packagePerformance.slice(0, 5).map((pkg, index) => (
                    <div key={pkg._id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Package className="h-4 w-4 text-gray-400 mr-2" />
                        <span className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {pkg.packageName}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {formatCurrency(pkg.totalRevenue)}
                        </div>
                        <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {pkg.totalInvoices} invoices
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Clients & Payment Methods */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Top Clients */}
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow rounded-lg p-6`}>
                <h3 className={`text-lg font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Top Clients by Revenue
                </h3>
                <div className="space-y-3">
                  {dashboardData.clientRevenue.slice(0, 5).map((client, index) => (
                    <div key={client._id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                          theme === 'dark' ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-900'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="ml-3">
                          <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {client.clientName}
                          </div>
                          <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {client.totalInvoices} invoices
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {formatCurrency(client.totalRevenue)}
                        </div>
                        <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          Avg: {formatCurrency(client.averageInvoiceValue)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Methods */}
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow rounded-lg p-6`}>
                <h3 className={`text-lg font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Payment Methods
                </h3>
                <div className="space-y-3">
                  {dashboardData.paymentMethodStats.map((method, index) => (
                    <div key={method._id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CreditCard className="h-4 w-4 text-gray-400 mr-2" />
                        <span className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {method._id.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {formatCurrency(method.totalAmount)}
                        </div>
                        <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {method.count} payments
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Alerts & Upcoming Renewals */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upcoming Renewals */}
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow rounded-lg p-6`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Upcoming Renewals
                  </h3>
                  <div className="flex items-center text-sm text-green-600">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatCurrency(dashboardData.upcomingRenewals.summary.totalValue)}
                  </div>
                </div>
                <div className="space-y-3">
                  {dashboardData.upcomingRenewals.renewals.slice(0, 5).map((renewal) => (
                    <div key={renewal._id} className="flex items-center justify-between">
                      <div>
                        <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {renewal.clientId?.companyName}
                        </div>
                        <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          {renewal.packageId?.name}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {formatCurrency(renewal.basePrice)}
                        </div>
                        <div className="text-xs text-yellow-600">
                          {new Date(renewal.endDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {dashboardData.upcomingRenewals.summary.count > 5 && (
                  <div className={`mt-3 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    +{dashboardData.upcomingRenewals.summary.count - 5} more renewals
                  </div>
                )}
              </div>

              {/* Overdue Invoices */}
              <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow rounded-lg p-6`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Overdue Invoices
                  </h3>
                  <div className="flex items-center text-sm text-red-600">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    {formatCurrency(dashboardData.overdueInvoices.summary.totalOverdue)}
                  </div>
                </div>
                
                {dashboardData.overdueInvoices.summary.count > 0 ? (
                  <div className="space-y-3">
                    {dashboardData.overdueInvoices.byAge.map((ageGroup, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <AlertTriangle className="h-4 w-4 text-red-400 mr-2" />
                          <span className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {ageGroup._id === '365+' ? '365+ days' : `${ageGroup._id}-${ageGroup._id + 29} days`}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {formatCurrency(ageGroup.totalAmount)}
                          </div>
                          <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            {ageGroup.count} invoices
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-2" />
                      <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        No overdue invoices
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RevenueDashboard;
