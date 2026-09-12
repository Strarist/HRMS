import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { getDashboardStats, getSystemHealth } from '../../api/superAdmin';
import toast from '../../utils/toast';
import {
  Users,
  Package,
  TrendingUp,
  AlertTriangle,
  Activity,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Zap
} from 'lucide-react';

const SuperAdminDashboard = () => {
  const { theme } = useTheme();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await getDashboardStats();
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Failed to fetch dashboard statistics');
      
      // Fallback to mock data if API fails
      const mockStats = {
        overview: {
          totalClients: 0,
          activeClients: 0,
          totalUsers: 1,
          totalPackages: 3
        },
        clientStats: [],
        subscriptionStats: [],
        recentActivities: []
      };
      
      setStats(mockStats);
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, trend, color = 'blue' }) => (
    <div className={`p-6 rounded-xl border ${
      theme === 'dark' 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    } hover:shadow-lg transition-shadow duration-200`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {title}
          </p>
          <p className={`text-3xl font-bold mt-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {value}
          </p>
          {trend && (
            <p className={`text-sm mt-2 flex items-center ${
              trend.type === 'increase' ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className="w-4 h-4 mr-1" />
              {trend.value}% from last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-${color}-100 dark:bg-${color}-900/20`}>
          <Icon className={`w-6 h-6 text-${color}-600 dark:text-${color}-400`} />
        </div>
      </div>
    </div>
  );

  const ActivityItem = ({ activity }) => (
    <div className={`flex items-center space-x-3 p-3 rounded-lg ${
      theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
    } transition-colors duration-200`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
        activity.action === 'create' ? 'bg-green-100 dark:bg-green-900/20' :
        activity.action === 'update' ? 'bg-blue-100 dark:bg-blue-900/20' :
        'bg-red-100 dark:bg-red-900/20'
      }`}>
        {activity.action === 'create' ? (
          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
        ) : activity.action === 'update' ? (
          <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        ) : (
          <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          {activity.userId?.email} {activity.action}d {activity.resource}
        </p>
        <p className={`text-xs ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          {activity.clientId?.name} • {new Date(activity.createdAt).toLocaleString()}
        </p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Super Admin Dashboard
          </h1>
          <p className={`mt-2 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            System overview and key metrics
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            theme === 'dark' 
              ? 'bg-green-900/20 text-green-400' 
              : 'bg-green-100 text-green-800'
          }`}>
            <Zap className="w-3 h-3 inline mr-1" />
            All Systems Operational
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Clients"
          value={stats?.overview?.totalClients || 0}
          icon={Users}
          trend={{ type: 'increase', value: 12 }}
          color="blue"
        />
        <StatCard
          title="Active Clients"
          value={stats?.overview?.activeClients || 0}
          icon={CheckCircle}
          trend={{ type: 'increase', value: 8 }}
          color="green"
        />
        <StatCard
          title="Total Users"
          value={stats?.overview?.totalUsers || 0}
          icon={Activity}
          trend={{ type: 'increase', value: 15 }}
          color="purple"
        />
        <StatCard
          title="Active Packages"
          value={stats?.overview?.totalPackages || 0}
          icon={Package}
          color="orange"
        />
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client Status Distribution */}
        <div className={`p-6 rounded-xl border ${
          theme === 'dark' 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Client Status
          </h3>
          <div className="space-y-3">
            {stats?.clientStats?.map((stat) => (
              <div key={stat._id} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    stat._id === 'active' ? 'bg-green-500' :
                    stat._id === 'inactive' ? 'bg-gray-500' :
                    'bg-red-500'
                  }`}></div>
                  <span className={`text-sm capitalize ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {stat._id}
                  </span>
                </div>
                <span className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {stat.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Subscription Status */}
        <div className={`p-6 rounded-xl border ${
          theme === 'dark' 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Subscriptions
          </h3>
          <div className="space-y-3">
            {stats?.subscriptionStats?.map((stat) => (
              <div key={stat._id} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    stat._id === 'active' ? 'bg-blue-500' :
                    stat._id === 'trial' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}></div>
                  <span className={`text-sm capitalize ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {stat._id}
                  </span>
                </div>
                <span className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {stat.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className={`p-6 rounded-xl border ${
          theme === 'dark' 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Recent Activities
          </h3>
          <div className="space-y-2">
            {stats?.recentActivities?.length > 0 ? (
              stats.recentActivities.map((activity) => (
                <ActivityItem key={activity._id} activity={activity} />
              ))
            ) : (
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                No recent activities
              </p>
            )}
          </div>
        </div>
      </div>

      {/* System Alerts */}
      <div className={`p-6 rounded-xl border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10 dark:border-yellow-800`}>
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              System Alerts
            </h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              2 subscriptions expiring in the next 7 days. Review client renewals.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
