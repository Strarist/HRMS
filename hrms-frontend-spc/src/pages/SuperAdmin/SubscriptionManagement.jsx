import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import {
  CreditCard,
  Plus,
  Search,
  Edit,
  Eye,
  RefreshCw,
  Ban,
  Play,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Download,
  Users,
  Package
} from 'lucide-react';
import toast from '../../utils/toast';
import NewSubscriptionModal from '../../components/SuperAdmin/NewSubscriptionModal';

const SubscriptionManagement = () => {
  const { theme } = useTheme();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [billingCycleFilter, setBillingCycleFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expiring: 0,
    expired: 0
  });

  useEffect(() => {
    fetchSubscriptions();
    fetchStats();
  }, [searchTerm, statusFilter, billingCycleFilter, currentPage]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      
      // Check if we have authentication token
      const token = localStorage.getItem('token');
      console.log('🔑 Auth token exists:', !!token);
      
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm,
        status: statusFilter,
        billingCycle: billingCycleFilter
      };

      console.log('📡 Making API request to:', '/api/super-admin/subscriptions');
      console.log('📊 Request params:', params);

      // Use the billing API service instead of direct fetch
      const { getSubscriptions } = await import('../../api/billing');
      const response = await getSubscriptions(params);
      
      console.log('✅ API Response received:', response);
      
      if (response.data?.success) {
        setSubscriptions(response.data.data.subscriptions || []);
        setTotalPages(response.data.data.pagination?.pages || 1);
        console.log('📋 Subscriptions loaded:', response.data.data.subscriptions?.length || 0);
      } else {
        console.warn('⚠️ API response not successful:', response.data);
        // For now, set empty data to show UI
        setSubscriptions([]);
      }
    } catch (error) {
      console.error('❌ Error fetching subscriptions:', error);
      
      // Enhanced error reporting
      if (error.response?.status === 401) {
        console.error('🚫 Authentication failed - token may be invalid or expired');
        toast.error('Authentication failed. Please log in again.');
      } else if (error.response?.status === 403) {
        console.error('🚫 Access forbidden - insufficient permissions');
        toast.error('Access denied. You don\'t have permission to view subscriptions.');
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        console.error('🌐 Network error - backend server may be down');
        toast.error('Cannot connect to server. Please check if the backend is running on port 5000.');
      } else {
        console.error('💥 Unexpected error:', error.message);
        toast.error('Failed to fetch subscriptions: ' + error.message);
      }
      
      // Set empty data to show UI
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Get real subscription statistics
      const { getSubscriptions } = await import('../../api/billing');
      
      // Fetch all subscriptions to calculate stats
      const [allSubs, expiringSubs, expiredSubs] = await Promise.all([
        getSubscriptions({ limit: 1000 }), // Get all subscriptions
        getSubscriptions({ status: 'active', expiring: true }),
        getSubscriptions({ status: 'expired' })
      ]);

      const total = allSubs.data?.data?.total || 0;
      const active = allSubs.data?.data?.subscriptions?.filter(sub => sub.status === 'active').length || 0;
      const expiring = expiringSubs.data?.data?.total || 0;
      const expired = expiredSubs.data?.data?.total || 0;

      setStats({
        total,
        active,
        expiring,
        expired
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Fallback to mock data if API fails
      setStats({
        total: 0,
        active: 0,
        expiring: 0,
        expired: 0
      });
    }
  };

  const handleRenewSubscription = async (subscriptionId) => {
    try {
      const response = await fetch(`/api/super-admin/subscriptions/${subscriptionId}/renew`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        toast.success('Subscription renewed successfully');
        fetchSubscriptions();
      }
    } catch (error) {
      toast.error('Failed to renew subscription');
    }
  };

  const handleSuspendSubscription = async (subscriptionId) => {
    try {
      const response = await fetch(`/api/super-admin/subscriptions/${subscriptionId}/suspend`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Manual suspension' })
      });
      
      if (response.ok) {
        toast.success('Subscription suspended successfully');
        fetchSubscriptions();
      }
    } catch (error) {
      toast.error('Failed to suspend subscription');
    }
  };

  const handleReactivateSubscription = async (subscriptionId) => {
    try {
      const response = await fetch(`/api/super-admin/subscriptions/${subscriptionId}/reactivate`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        toast.success('Subscription reactivated successfully');
        fetchSubscriptions();
      }
    } catch (error) {
      toast.error('Failed to reactivate subscription');
    }
  };

  const handleNewSubscriptionSuccess = (newSubscription) => {
    console.log('✅ New subscription created:', newSubscription);
    // Refresh the subscriptions list
    fetchSubscriptions();
    fetchStats();
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      pending_payment: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      expired: { color: 'bg-red-100 text-red-800', icon: XCircle },
      suspended: { color: 'bg-gray-100 text-gray-800', icon: Ban },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle }
    };

    const config = statusConfig[status] || statusConfig.active;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const getBillingCycleBadge = (cycle) => {
    const colors = {
      monthly: 'bg-blue-100 text-blue-800',
      quarterly: 'bg-purple-100 text-purple-800',
      yearly: 'bg-green-100 text-green-800'
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors[cycle] || 'bg-gray-100 text-gray-800'}`}>
        {cycle?.toUpperCase()}
      </span>
    );
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysRemaining = (endDate) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Subscription Management
              </h1>
              <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Manage client subscriptions, billing cycles, and renewals
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Subscription
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} overflow-hidden shadow rounded-lg`}>
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CreditCard className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} truncate`}>
                      Total Subscriptions
                    </dt>
                    <dd className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {stats.total}
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
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} truncate`}>
                      Active
                    </dt>
                    <dd className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {stats.active}
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
                  <AlertTriangle className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} truncate`}>
                      Expiring Soon
                    </dt>
                    <dd className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {stats.expiring}
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
                  <XCircle className="h-6 w-6 text-red-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} truncate`}>
                      Expired
                    </dt>
                    <dd className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {stats.expired}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow rounded-lg mb-6`}>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search subscriptions..."
                    className={`pl-10 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="pending_payment">Pending Payment</option>
                  <option value="expired">Expired</option>
                  <option value="suspended">Suspended</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Billing Cycle
                </label>
                <select
                  value={billingCycleFilter}
                  onChange={(e) => setBillingCycleFilter(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">All Cycles</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('');
                    setBillingCycleFilter('');
                  }}
                  className={`px-4 py-2 border rounded-md text-sm font-medium ${
                    theme === 'dark'
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Subscriptions Table */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow rounded-lg overflow-hidden`}>
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Subscriptions
            </h3>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      Client
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      Package
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      Status
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      Billing
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      End Date
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      Revenue
                    </th>
                    <th className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${theme === 'dark' ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'}`}>
                  {subscriptions.map((subscription) => {
                    const daysRemaining = getDaysRemaining(subscription.endDate);
                    const isExpiringSoon = daysRemaining <= 10 && daysRemaining > 0;
                    
                    return (
                      <tr key={subscription._id} className={theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'
                              }`}>
                                <Users className="h-5 w-5 text-gray-500" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {subscription.clientId?.companyName}
                              </div>
                              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                {subscription.subscriptionCode}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Package className="h-4 w-4 text-gray-400 mr-2" />
                            <div>
                              <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {subscription.packageId?.name}
                              </div>
                              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                {subscription.packageId?.type}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(subscription.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            {getBillingCycleBadge(subscription.billingCycle)}
                            <div className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              {formatCurrency(subscription.effectivePrice, subscription.currency)}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {formatDate(subscription.endDate)}
                            </div>
                            {isExpiringSoon && (
                              <div className="text-sm text-yellow-600 flex items-center mt-1">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                {daysRemaining} days left
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {formatCurrency(subscription.totalRevenue, subscription.currency)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => {
                                setSelectedSubscription(subscription);
                                setShowDetailsModal(true);
                              }}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            
                            {subscription.status === 'active' && (
                              <button
                                onClick={() => handleRenewSubscription(subscription._id)}
                                className="text-green-600 hover:text-green-900"
                                title="Renew"
                              >
                                <RefreshCw className="h-4 w-4" />
                              </button>
                            )}
                            
                            {subscription.status === 'active' && (
                              <button
                                onClick={() => handleSuspendSubscription(subscription._id)}
                                className="text-yellow-600 hover:text-yellow-900"
                                title="Suspend"
                              >
                                <Ban className="h-4 w-4" />
                              </button>
                            )}
                            
                            {subscription.status === 'suspended' && (
                              <button
                                onClick={() => handleReactivateSubscription(subscription._id)}
                                className="text-green-600 hover:text-green-900"
                                title="Reactivate"
                              >
                                <Play className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded text-sm ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded text-sm ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* New Subscription Modal */}
        <NewSubscriptionModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleNewSubscriptionSuccess}
        />
      </div>
    </div>
  );
};

export default SubscriptionManagement;
