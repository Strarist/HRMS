import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLeaveBalance, getLeaveApplications } from '../../api/employeeDashboard';
import toast from '../../utils/toast';
import BottomNavigation from '../../components/BottomNavigation';
import { ArrowLeft, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';

const ModernLeaveBalance = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('balance');
  const [loading, setLoading] = useState(true);
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchLeaveData();
  }, [selectedYear, activeTab]);

  const fetchLeaveData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'balance') {
        const response = await getLeaveBalance(selectedYear);
        setLeaveBalances(response.data);
      } else {
        const response = await getLeaveApplications({ year: selectedYear });
        setLeaveHistory(response.data);
      }
    } catch (error) {
      console.error('Error fetching leave data:', error);
      toast.error(error.response?.data?.message || 'Failed to load leave data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatDateRange = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (startDate.toDateString() === endDate.toDateString()) {
      return formatDate(start);
    }
    return `${formatDate(start)} – ${formatDate(end)}`;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-500/20 text-green-400';
      case 'rejected':
        return 'bg-red-500/20 text-red-400';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#1E1E2A] p-4 md:p-6 pb-24 md:pb-6">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#1E1E2A] border-b border-gray-800 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/employee/home')}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-white text-xl font-bold">Leave Management</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tab Navigation */}
        <div className="bg-[#2A2A3A] rounded-2xl p-1 mb-6 inline-flex border border-gray-700">
          <button
            onClick={() => setActiveTab('balance')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'balance'
                ? 'bg-[#A88BFF] text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Leave Balances
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'history'
                ? 'bg-[#A88BFF] text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Leave History
          </button>
        </div>

        {/* Year Selector for History */}
        {activeTab === 'history' && (
          <div className="mb-6">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="bg-[#2A2A3A] text-white px-4 py-3 rounded-xl border border-gray-700 focus:border-[#A88BFF] focus:outline-none"
            >
              <option value={2025}>Jan 2025 – Dec 2025</option>
              <option value={2024}>Jan 2024 – Dec 2024</option>
              <option value={2023}>Jan 2023 – Dec 2023</option>
            </select>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-[#A88BFF] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Leave Balance Tab */}
            {activeTab === 'balance' && (
              <div className="space-y-4">
                {leaveBalances.map((leave, index) => (
                  <div
                    key={index}
                    className="bg-[#2A2A3A] rounded-2xl p-6 border border-gray-700 hover:border-[#A88BFF] transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-white text-lg font-semibold mb-1">{leave.leaveType}</h3>
                        <p className="text-gray-400 text-sm">
                          {leave.consumed || 0} days consumed
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-[#A88BFF]">
                          {leave.available || 0}
                        </div>
                        <p className="text-gray-400 text-sm">days available</p>
                      </div>
                    </div>
                    {leave.total > 0 && (
                      <div className="mt-4">
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-[#A88BFF] to-[#8B6FE8] h-2 rounded-full transition-all"
                            style={{ width: `${((leave.consumed || 0) / leave.total) * 100}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-gray-400">
                          <span>Used: {leave.consumed || 0}</span>
                          <span>Total: {leave.total}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Leave History Tab */}
            {activeTab === 'history' && (
              <div className="space-y-4">
                {leaveHistory.length > 0 ? (
                  leaveHistory.map((leave, index) => (
                    <div
                      key={index}
                      className="bg-[#2A2A3A] rounded-2xl p-6 border border-gray-700 hover:border-[#A88BFF] transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Calendar className="w-5 h-5 text-[#A88BFF]" />
                            <h3 className="text-white text-lg font-semibold">
                              {formatDateRange(leave.startDate, leave.endDate)}
                            </h3>
                          </div>
                          <p className="text-gray-400 text-sm mb-1">
                            {leave.numberOfDays} {leave.numberOfDays === 1 ? 'day' : 'days'}, {leave.leaveType}
                          </p>
                          {leave.reason && (
                            <p className="text-gray-500 text-sm italic mt-2">"{leave.reason}"</p>
                          )}
                          {leave.approvedBy && (
                            <p className="text-gray-500 text-xs mt-2">
                              Approved by {leave.approvedBy}
                            </p>
                          )}
                        </div>
                        <div className="flex-shrink-0 ml-4">
                          <span
                            className={`inline-flex items-center space-x-1 px-3 py-2 rounded-full text-xs font-semibold uppercase ${getStatusColor(
                              leave.status
                            )}`}
                          >
                            {getStatusIcon(leave.status)}
                            <span>{leave.status}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-[#2A2A3A] rounded-2xl p-12 border border-gray-700 text-center">
                    <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-white text-lg font-semibold mb-2">No Leave History</h3>
                    <p className="text-gray-400">You haven't applied for any leaves in {selectedYear}</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Apply Leave Button */}
        <div className="mt-8">
          <button
            onClick={() => navigate('/employee/leave/apply')}
            className="w-full bg-gradient-to-r from-[#A88BFF] to-[#8B6FE8] text-white py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            Apply for Leave
          </button>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default ModernLeaveBalance;
