import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import {
  Bell,
  AlertTriangle,
  Calendar,
  Clock,
  DollarSign,
  Users,
  RefreshCw,
  CheckCircle,
  XCircle,
  Mail,
  Eye,
  Filter,
  Settings,
  Zap,
  CreditCard,
  Package
} from 'lucide-react';
import toast from '../../utils/toast';

const BillingAlerts = () => {
  const { theme } = useTheme();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showSettings, setShowSettings] = useState(false);
  const [alertSettings, setAlertSettings] = useState({
    renewalDays: 10,
    overdueEnabled: true,
    paymentFailureEnabled: true,
    emailNotifications: true,
    dashboardNotifications: true
  });
  const [stats, setStats] = useState({
    total: 0,
    critical: 0,
    warning: 0,
    info: 0,
    resolved: 0
  });

  useEffect(() => {
    fetchAlerts();
    fetchStats();
  }, [filter, priorityFilter]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API calls
      const mockAlerts = [
        {
          id: '1',
          type: 'subscription_expiring',
          priority: 'high',
          title: 'Subscription Expiring Soon',
          message: 'TechCorp subscription expires in 3 days',
          clientName: 'TechCorp Solutions',
          subscriptionCode: 'SUB0001',
          daysRemaining: 3,
          amount: 299,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          status: 'active',
          actionRequired: true
        },
        {
          id: '2',
          type: 'invoice_overdue',
          priority: 'critical',
          title: 'Invoice Overdue',
          message: 'Invoice INV-2024-0156 is 5 days overdue',
          clientName: 'Manufacturing Co',
          invoiceNumber: 'INV-2024-0156',
          daysOverdue: 5,
          amount: 1250,
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          status: 'active',
          actionRequired: true
        },
        {
          id: '3',
          type: 'payment_failed',
          priority: 'high',
          title: 'Payment Failed',
          message: 'Automatic payment failed for HealthCare Plus',
          clientName: 'HealthCare Plus',
          paymentId: 'PAY-2024-00234',
          amount: 599,
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
          status: 'active',
          actionRequired: true
        },
        {
          id: '4',
          type: 'renewal_success',
          priority: 'info',
          title: 'Subscription Renewed',
          message: 'Green Energy Corp subscription renewed successfully',
          clientName: 'Green Energy Corp',
          subscriptionCode: 'SUB0045',
          amount: 799,
          createdAt: new Date(Date.now() - 30 * 60 * 1000),
          status: 'resolved',
          actionRequired: false
        },
        {
          id: '5',
          type: 'subscription_expiring',
          priority: 'medium',
          title: 'Subscription Expiring',
          message: 'StartupHub subscription expires in 7 days',
          clientName: 'StartupHub',
          subscriptionCode: 'SUB0023',
          daysRemaining: 7,
          amount: 149,
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
          status: 'active',
          actionRequired: true
        }
      ];

      // Filter alerts based on current filters
      let filteredAlerts = mockAlerts;
      if (filter !== 'all') {
        filteredAlerts = filteredAlerts.filter(alert => alert.status === filter);
      }
      if (priorityFilter !== 'all') {
        filteredAlerts = filteredAlerts.filter(alert => alert.priority === priorityFilter);
      }

      setAlerts(filteredAlerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      toast.error('Failed to fetch alerts');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Mock stats - replace with actual API
      setStats({
        total: 12,
        critical: 2,
        warning: 4,
        info: 3,
        resolved: 3
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleResolveAlert = async (alertId) => {
    try {
      // Mock API call
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, status: 'resolved' } : alert
      ));
      toast.success('Alert resolved successfully');
    } catch (error) {
      toast.error('Failed to resolve alert');
    }
  };

  const handleDismissAlert = async (alertId) => {
    try {
      // Mock API call
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      toast.success('Alert dismissed');
    } catch (error) {
      toast.error('Failed to dismiss alert');
    }
  };

  const handleSendReminder = async (alert) => {
    try {
      // Mock API call
      toast.success(`Reminder sent to ${alert.clientName}`);
    } catch (error) {
      toast.error('Failed to send reminder');
    }
  };

  const getAlertIcon = (type) => {
    const icons = {
      subscription_expiring: Calendar,
      invoice_overdue: AlertTriangle,
      payment_failed: XCircle,
      renewal_success: CheckCircle,
      payment_success: CheckCircle,
      subscription_cancelled: XCircle
    };
    return icons[type] || Bell;
  };

  const getAlertColor = (priority) => {
    const colors = {
      critical: 'text-red-500 bg-red-100',
      high: 'text-orange-500 bg-orange-100',
      medium: 'text-yellow-500 bg-yellow-100',
      low: 'text-blue-500 bg-blue-100',
      info: 'text-green-500 bg-green-100'
    };
    return colors[priority] || colors.info;
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      critical: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-blue-100 text-blue-800',
      info: 'bg-green-100 text-green-800'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[priority]}`}>
        {priority.toUpperCase()}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Billing Alerts
              </h1>
              <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Monitor subscription renewals, overdue invoices, and payment notifications
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowSettings(true)}
                className={`inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium ${
                  theme === 'dark'
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </button>
              <button
                onClick={fetchAlerts}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} overflow-hidden shadow rounded-lg`}>
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Bell className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} truncate`}>
                      Total Alerts
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
                  <Zap className="h-6 w-6 text-red-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} truncate`}>
                      Critical
                    </dt>
                    <dd className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {stats.critical}
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
                  <AlertTriangle className="h-6 w-6 text-orange-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} truncate`}>
                      Warning
                    </dt>
                    <dd className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {stats.warning}
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
                  <Clock className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} truncate`}>
                      Info
                    </dt>
                    <dd className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {stats.info}
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
                      Resolved
                    </dt>
                    <dd className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {stats.resolved}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Status Filter
                </label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="all">All Alerts</option>
                  <option value="active">Active</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Priority Filter
                </label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="all">All Priorities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                  <option value="info">Info</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setFilter('all');
                    setPriorityFilter('all');
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

        {/* Alerts List */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow rounded-lg overflow-hidden`}>
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Recent Alerts
            </h3>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <CheckCircle className="h-12 w-12 text-green-400 mb-4" />
              <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>
                No alerts found
              </h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                All systems are running smoothly
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {alerts.map((alert) => {
                const Icon = getAlertIcon(alert.type);
                const iconColor = getAlertColor(alert.priority);
                
                return (
                  <div key={alert.id} className={`p-6 ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className={`flex-shrink-0 p-2 rounded-full ${iconColor}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {alert.title}
                            </h4>
                            {getPriorityBadge(alert.priority)}
                          </div>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
                            {alert.message}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span className="flex items-center">
                              <Users className="h-3 w-3 mr-1" />
                              {alert.clientName}
                            </span>
                            {alert.amount && (
                              <span className="flex items-center">
                                <DollarSign className="h-3 w-3 mr-1" />
                                {formatCurrency(alert.amount)}
                              </span>
                            )}
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatTimeAgo(alert.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        {alert.actionRequired && alert.status === 'active' && (
                          <>
                            <button
                              onClick={() => handleSendReminder(alert)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Send Reminder"
                            >
                              <Mail className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleResolveAlert(alert.id)}
                              className="text-green-600 hover:text-green-900"
                              title="Mark as Resolved"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDismissAlert(alert.id)}
                          className="text-gray-400 hover:text-gray-600"
                          title="Dismiss"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BillingAlerts;
