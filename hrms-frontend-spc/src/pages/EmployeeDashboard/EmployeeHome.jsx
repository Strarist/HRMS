import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { getDashboardOverview } from '../../api/employeeDashboard';
import toast from '../../utils/toast';
import {
  Calendar,
  Clock,
  Briefcase,
  FileText,
  AlertCircle,
  CheckCircle,
  Users,
  CalendarDays,
  Bell
} from 'lucide-react';

const EmployeeHome = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await getDashboardOverview();
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error(error.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className={`mt-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  const { employee, quickStats, upcomingHolidays, activeProjects, recentNotifications } = dashboardData || {};

  const statsCards = [
    {
      title: 'Remaining Leaves',
      value: quickStats?.remainingLeaves || 0,
      icon: Calendar,
      color: 'blue',
      bgColor: 'bg-blue-500',
      link: '/employee/leave'
    },
    {
      title: 'Pending Leaves',
      value: quickStats?.pendingLeaves || 0,
      icon: CalendarDays,
      color: 'yellow',
      bgColor: 'bg-yellow-500',
      link: '/employee/leave'
    },
    {
      title: 'Attendance',
      value: `${quickStats?.attendancePercentage || 0}%`,
      icon: Clock,
      color: 'green',
      bgColor: 'bg-green-500',
      link: '/employee/attendance'
    },
    {
      title: 'Active Projects',
      value: quickStats?.activeProjects || 0,
      icon: Briefcase,
      color: 'purple',
      bgColor: 'bg-purple-500',
      link: '/employee/projects'
    },
    {
      title: 'Pending Requests',
      value: quickStats?.pendingRequests || 0,
      icon: FileText,
      color: 'orange',
      bgColor: 'bg-orange-500',
      link: '/employee/requests'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className={`rounded-xl p-6 ${
        theme === 'dark' 
          ? 'bg-gradient-to-r from-primary-900 to-primary-800' 
          : 'bg-gradient-to-r from-primary-600 to-primary-700'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Welcome back, {employee?.name?.split(' ')[0] || 'Employee'}! 👋
            </h1>
            <p className="text-primary-100">
              {employee?.designation} • {employee?.department}
            </p>
            <p className="text-primary-200 text-sm mt-1">
              Employee Code: {employee?.employeeCode}
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
              {employee?.profileImage ? (
                <img 
                  src={employee.profileImage} 
                  alt="Profile" 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-4xl font-bold text-white">
                  {employee?.name?.charAt(0) || 'E'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              onClick={() => navigate(stat.link)}
              className={`rounded-xl p-6 cursor-pointer transition-all hover:scale-105 ${
                theme === 'dark'
                  ? 'bg-dark-800 hover:bg-dark-700'
                  : 'bg-white hover:shadow-lg'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {stat.title}
                  </p>
                  <p className={`text-3xl font-bold mt-2 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Holidays */}
        <div className={`rounded-xl p-6 ${
          theme === 'dark' ? 'bg-dark-800' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-lg font-semibold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              <CalendarDays className="w-5 h-5 inline mr-2" />
              Upcoming Holidays
            </h2>
          </div>
          <div className="space-y-3">
            {upcomingHolidays && upcomingHolidays.length > 0 ? (
              upcomingHolidays.slice(0, 5).map((holiday, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    theme === 'dark' ? 'bg-dark-700' : 'bg-gray-50'
                  }`}
                >
                  <div>
                    <p className={`font-medium ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {holiday.name}
                    </p>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {new Date(holiday.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    holiday.type === 'public'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {holiday.type}
                  </span>
                </div>
              ))
            ) : (
              <p className={`text-center py-8 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                No upcoming holidays
              </p>
            )}
          </div>
        </div>

        {/* Active Projects */}
        <div className={`rounded-xl p-6 ${
          theme === 'dark' ? 'bg-dark-800' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-lg font-semibold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              <Briefcase className="w-5 h-5 inline mr-2" />
              Active Projects
            </h2>
            <button
              onClick={() => navigate('/employee/projects')}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {activeProjects && activeProjects.length > 0 ? (
              activeProjects.slice(0, 5).map((project, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    theme === 'dark' ? 'bg-dark-700' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className={`font-medium ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {project.name}
                      </p>
                      <p className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {project.client} • {project.projectCode}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      project.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className={`text-center py-8 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                No active projects
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Notifications */}
      <div className={`rounded-xl p-6 ${
        theme === 'dark' ? 'bg-dark-800' : 'bg-white'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-lg font-semibold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            <Bell className="w-5 h-5 inline mr-2" />
            Recent Notifications
          </h2>
        </div>
        <div className="space-y-3">
          {recentNotifications && recentNotifications.length > 0 ? (
            recentNotifications.map((notification, index) => (
              <div
                key={index}
                className={`flex items-start p-3 rounded-lg ${
                  theme === 'dark' ? 'bg-dark-700' : 'bg-gray-50'
                }`}
              >
                <div className={`p-2 rounded-lg mr-3 ${
                  notification.type === 'success' ? 'bg-green-100' :
                  notification.type === 'warning' ? 'bg-yellow-100' :
                  'bg-blue-100'
                }`}>
                  {notification.type === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : notification.type === 'warning' ? (
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                  ) : (
                    <Bell className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {notification.title}
                  </p>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {notification.message}
                  </p>
                  <p className={`text-xs mt-1 ${
                    theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                  }`}>
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className={`text-center py-8 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              No new notifications
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeHome;
