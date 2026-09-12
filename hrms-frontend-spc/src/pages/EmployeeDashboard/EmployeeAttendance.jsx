import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../context/ThemeContext';
import {
  getTodayAttendance,
  getAttendanceSummary,
  checkIn,
  checkOut,
  requestRegularization
} from '../../api/employeeDashboard';
import { checkOfficeNetwork, onNetworkChange } from '../../utils/networkUtils';
import toast from '../../utils/toast';
import {
  Clock,
  LogIn,
  LogOut,
  Calendar,
  TrendingUp,
  MapPin,
  AlertCircle,
  Wifi,
  WifiOff,
  AlertTriangle
} from 'lucide-react';

const EmployeeAttendance = () => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [attendanceSummary, setAttendanceSummary] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [location, setLocation] = useState('office');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [networkStatus, setNetworkStatus] = useState({
    isOnline: navigator.onLine,
    isOfficeNetwork: false,
    isLoading: true,
    lastChecked: null,
    error: null
  });

  // Check network status on component mount and when network changes
  useEffect(() => {
    const checkNetwork = async () => {
      try {
        setNetworkStatus(prev => ({ ...prev, isLoading: true }));
        const { isOfficeNetwork, reason } = await checkOfficeNetwork();
        setNetworkStatus({
          isOnline: navigator.onLine,
          isOfficeNetwork,
          isLoading: false,
          lastChecked: new Date(),
          error: isOfficeNetwork ? null : (reason || 'Not connected to office network')
        });
      } catch (error) {
        console.error('Network check failed:', error);
        setNetworkStatus(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to verify network. Please try again.'
        }));
      }
    };

    // Initial check
    checkNetwork();

    // Set up network change listener
    const cleanup = onNetworkChange(({ isOnline, isOfficeNetwork, reason }) => {
      setNetworkStatus({
        isOnline,
        isOfficeNetwork: !!isOfficeNetwork,
        isLoading: false,
        lastChecked: new Date(),
        error: isOnline ? (isOfficeNetwork ? null : (reason || 'Not connected to office network')) : 'You are offline'
      });
    });

    // Set up time update
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    // Cleanup
    return () => {
      cleanup();
      clearInterval(timer);
    };
  }, []);

  // Fetch attendance data
  useEffect(() => {
    fetchTodayAttendance();
    fetchAttendanceSummary();
  }, [networkStatus.isOfficeNetwork]);

  useEffect(() => {
    fetchAttendanceSummary();
  }, [selectedMonth, selectedYear]);

  const fetchTodayAttendance = async () => {
    try {
      const response = await getTodayAttendance();
      setTodayAttendance(response.data);
    } catch (error) {
      console.error('Error fetching today attendance:', error);
    }
  };

  const fetchAttendanceSummary = async () => {
    try {
      setLoading(true);
      const response = await getAttendanceSummary(selectedMonth, selectedYear);
      setAttendanceSummary(response.data);
    } catch (error) {
      console.error('Error fetching attendance summary:', error);
      toast.error('Failed to load attendance summary');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      await checkIn({ location, notes: '' });
      toast.success('Checked in successfully!');
      fetchTodayAttendance();
      fetchAttendanceSummary();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to check in');
    }
  };

  const handleCheckOut = async () => {
    try {
      await checkOut({ notes: '' });
      toast.success('Checked out successfully!');
      fetchTodayAttendance();
      fetchAttendanceSummary();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to check out');
    }
  };

  const formatTime = (date) => {
    if (!date) return '--:--';
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (hours) => {
    if (!hours) return '0h 0m';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      case 'late':
        return 'bg-yellow-100 text-yellow-800';
      case 'half-day':
        return 'bg-orange-100 text-orange-800';
      case 'on-leave':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (loading && !attendanceSummary) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className={`mt-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Loading attendance data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Attendance Tracking
        </h1>
        <p className={`mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Mark your attendance and view history
        </p>
      </div>

      {/* Today's Attendance Card */}
      <div className={`rounded-xl p-6 ${
        theme === 'dark' 
          ? 'bg-gradient-to-r from-primary-900 to-primary-800' 
          : 'bg-gradient-to-r from-primary-600 to-primary-700'
      }`}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Time */}
          <div className="text-white">
            <p className="text-sm text-primary-100 mb-2">Current Time</p>
            <p className="text-4xl font-bold">
              {currentTime.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}
            </p>
            <p className="text-primary-200 mt-1">
              {currentTime.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>

          {/* Check In/Out Status */}
          <div className="text-white">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-primary-100">Check In</span>
                <span className="text-xl font-semibold">
                  {formatTime(todayAttendance?.checkIn)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-primary-100">Check Out</span>
                <span className="text-xl font-semibold">
                  {formatTime(todayAttendance?.checkOut)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-primary-100">Work Hours</span>
                <span className="text-xl font-semibold">
                  {formatDuration(todayAttendance?.workHours)}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col justify-center space-y-3">
            {/* Network Status Indicator */}
            <div className={`p-3 rounded-lg mb-2 ${
              networkStatus.isLoading 
                ? 'bg-yellow-100 dark:bg-yellow-900' 
                : networkStatus.isOfficeNetwork 
                  ? 'bg-green-100 dark:bg-green-900' 
                  : 'bg-red-100 dark:bg-red-900'
            }`}>
              <div className="flex items-start space-x-2">
                {networkStatus.isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600 mt-0.5"></div>
                    <div>
                      <p className="text-sm font-medium">Checking network...</p>
                      <p className="text-xs mt-1 text-gray-600 dark:text-gray-300">
                        Verifying your network connection
                      </p>
                    </div>
                  </>
                ) : networkStatus.isOfficeNetwork ? (
                  <>
                    <Wifi className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-800 dark:text-green-200">
                        Connected to Office Network
                      </p>
                      {networkStatus.reason && (
                        <p className="text-xs mt-1 text-green-700 dark:text-green-300">
                          {networkStatus.reason}
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-800 dark:text-red-200">
                        Network Access Required
                      </p>
                      <p className="text-xs mt-1 text-red-700 dark:text-red-300">
                        {networkStatus.error || 'Please connect to the office network to mark attendance.'}
                      </p>
                      <button 
                        onClick={async () => {
                          try {
                            const result = await checkOfficeNetwork();
                            setNetworkStatus({
                              ...result,
                              lastChecked: new Date(),
                              isLoading: false
                            });
                          } catch (e) {
                            console.error('Network check failed:', e);
                          }
                        }}
                        className="mt-2 text-xs bg-white dark:bg-dark-700 px-2 py-1 rounded text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                      >
                        Retry Connection
                      </button>
                    </div>
                  </>
                )}
              </div>
              {!networkStatus.isLoading && networkStatus.lastChecked && (
                <p className="text-xs mt-1 text-gray-600 dark:text-gray-400">
                  Last checked: {new Date(networkStatus.lastChecked).toLocaleTimeString()}
                </p>
              )}
            </div>

            <div className="mb-2">
              <label className="block text-sm text-primary-100 mb-2">Location</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg ${
                  theme === 'dark'
                    ? 'bg-dark-700 border-dark-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } border`}
                disabled={!networkStatus.isOfficeNetwork || (todayAttendance?.checkIn && !todayAttendance?.checkOut)}
              >
                <option value="office">Office</option>
                <option value="remote">Remote</option>
                <option value="field">Field</option>
                <option value="client-site">Client Site</option>
              </select>
            </div>
            
            {!networkStatus.isOfficeNetwork ? (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    {networkStatus.error || 'Please connect to the authorized office network to mark attendance.'}
                  </p>
                </div>
              </div>
            ) : !todayAttendance?.checkIn ? (
              <button
                onClick={handleCheckIn}
                disabled={!networkStatus.isOfficeNetwork}
                className={`flex items-center justify-center px-6 py-3 rounded-lg font-semibold transition-colors ${
                  networkStatus.isOfficeNetwork 
                    ? 'bg-white text-primary-600 hover:bg-primary-50' 
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                <LogIn className="w-5 h-5 mr-2" />
                Check In
              </button>
            ) : !todayAttendance?.checkOut ? (
              <button
                onClick={handleCheckOut}
                disabled={!networkStatus.isOfficeNetwork}
                className={`flex items-center justify-center px-6 py-3 rounded-lg font-semibold transition-colors ${
                  networkStatus.isOfficeNetwork 
                    ? 'bg-white text-primary-600 hover:bg-primary-50' 
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                <LogOut className="w-5 h-5 mr-2" />
                Check Out
              </button>
            ) : (
              <div className="flex items-center justify-center px-6 py-3 bg-green-500 text-white rounded-lg font-semibold">
                <Clock className="w-5 h-5 mr-2" />
                Attendance Marked
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Month Selector */}
      <div className="flex items-center space-x-4">
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          className={`px-4 py-2 rounded-lg border ${
            theme === 'dark'
              ? 'bg-dark-800 border-dark-600 text-white'
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        >
          {months.map((month, index) => (
            <option key={index} value={index}>
              {month}
            </option>
          ))}
        </select>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          className={`px-4 py-2 rounded-lg border ${
            theme === 'dark'
              ? 'bg-dark-800 border-dark-600 text-white'
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        >
          {[2024, 2025, 2026].map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`rounded-xl p-6 ${theme === 'dark' ? 'bg-dark-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Present Days
              </p>
              <p className={`text-3xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {attendanceSummary?.summary?.present || 0}
              </p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className={`rounded-xl p-6 ${theme === 'dark' ? 'bg-dark-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Absent Days
              </p>
              <p className={`text-3xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {attendanceSummary?.summary?.absent || 0}
              </p>
            </div>
            <div className="bg-red-500 p-3 rounded-lg">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className={`rounded-xl p-6 ${theme === 'dark' ? 'bg-dark-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Avg Work Hours
              </p>
              <p className={`text-3xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {attendanceSummary?.summary?.averageWorkHours || 0}
              </p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className={`rounded-xl p-6 ${theme === 'dark' ? 'bg-dark-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Late Marks
              </p>
              <p className={`text-3xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {attendanceSummary?.summary?.late || 0}
              </p>
            </div>
            <div className="bg-yellow-500 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Records */}
      <div className={`rounded-xl p-6 ${theme === 'dark' ? 'bg-dark-800' : 'bg-white'}`}>
        <h2 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Attendance Records
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${theme === 'dark' ? 'border-dark-700' : 'border-gray-200'}`}>
                <th className={`text-left py-3 px-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Date
                </th>
                <th className={`text-left py-3 px-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Check In
                </th>
                <th className={`text-left py-3 px-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Check Out
                </th>
                <th className={`text-left py-3 px-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Work Hours
                </th>
                <th className={`text-left py-3 px-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Location
                </th>
                <th className={`text-left py-3 px-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {attendanceSummary?.records && attendanceSummary.records.length > 0 ? (
                attendanceSummary.records.map((record, index) => (
                  <tr
                    key={index}
                    className={`border-b ${theme === 'dark' ? 'border-dark-700' : 'border-gray-100'}`}
                  >
                    <td className={`py-3 px-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {new Date(record.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {formatTime(record.checkIn)}
                    </td>
                    <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {formatTime(record.checkOut)}
                    </td>
                    <td className={`py-3 px-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {formatDuration(record.workHours)}
                    </td>
                    <td className={`py-3 px-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      <span className="capitalize">{record.location}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(record.status)}`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className={`py-8 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    No attendance records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeAttendance;
