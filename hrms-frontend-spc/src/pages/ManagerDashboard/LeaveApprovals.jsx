import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavigation from '../../components/BottomNavigation';
import { ArrowLeft, CheckCircle, XCircle, Clock, Calendar, MessageSquare } from 'lucide-react';
import { config } from '../../config/api.config';
import toast from '../../utils/toast';

const LeaveApprovals = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('pending');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch leave requests from API
  useEffect(() => {
    const fetchLeaveRequests = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${config.apiBaseUrl}/manager/pending-leaves`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (data.success) {
          setLeaveRequests(data.data);
        } else {
          toast.error(data.message || 'Failed to load leave requests');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching leave requests:', error);
        toast.error('Failed to load leave requests');
        setLoading(false);
      }
    };

    fetchLeaveRequests();
  }, []);

  const filters = useMemo(() => {
    const counts = leaveRequests.reduce((acc, leave) => {
      acc[leave.status] = (acc[leave.status] || 0) + 1;
      return acc;
    }, {});

    return [
      { id: 'pending', label: 'Pending', count: counts.pending || 0 },
      { id: 'approved', label: 'Approved', count: counts.approved || 0 },
      { id: 'rejected', label: 'Rejected', count: counts.rejected || 0 }
    ];
  }, [leaveRequests]);

  const filteredLeaves = leaveRequests.filter(leave => leave.status === activeFilter);

  const handleApprove = async (leaveId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.apiBaseUrl}/manager/leave/${leaveId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ comments: '' })
      });
      
      const data = await response.json();
      if (data.success) {
        // Remove from pending list
        setLeaveRequests(prev => prev.filter(leave => leave._id !== leaveId));
        toast.success('Leave approved successfully');
      } else {
        toast.error(data.message || 'Failed to approve leave');
      }
    } catch (error) {
      console.error('Error approving leave:', error);
      toast.error('Failed to approve leave');
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${config.apiBaseUrl}/manager/leave/${selectedLeave}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: rejectReason })
      });
      
      const data = await response.json();
      if (data.success) {
        // Remove from pending list
        setLeaveRequests(leaveRequests.filter(leave => leave._id !== selectedLeave));
        toast.success('Leave rejected successfully');
      } else {
        toast.error(data.message || 'Failed to reject leave');
      }
    } catch (error) {
      console.error('Error rejecting leave:', error);
      toast.error('Failed to reject leave');
    }
    
    setShowRejectModal(false);
    setRejectReason('');
    setSelectedLeave(null);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500/20 text-green-400';
      case 'rejected':
        return 'bg-red-500/20 text-red-400';
      case 'pending':
        return 'bg-orange-500/20 text-orange-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-[#1E1E2A] p-4 md:p-6 pb-24 md:pb-6">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#1E1E2A] border-b border-gray-800 px-4 py-4 -mx-4 mb-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/manager/dashboard')}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">Leave Approvals</h1>
              <p className="text-gray-400 text-sm">Review and approve team leave requests</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Filters */}
        <div className="flex items-center space-x-2 overflow-x-auto scrollbar-hide">
          {filters.map(filter => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${
                activeFilter === filter.id
                  ? 'bg-gradient-to-r from-[#A88BFF] to-[#8B6FE8] text-white shadow-lg'
                  : 'bg-[#2A2A3A] text-gray-400 hover:text-white border border-gray-700'
              }`}
            >
              {filter.label}
              {filter.count > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  activeFilter === filter.id ? 'bg-white/20' : 'bg-gray-700'
                }`}>
                  {filter.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Leave Requests List */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-[#2A2A3A] rounded-2xl p-12 border border-gray-700 text-center">
              <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4 animate-spin" />
              <h3 className="text-white text-lg font-semibold mb-2">Loading leave requests...</h3>
              <p className="text-gray-400">Please wait while we fetch the latest data.</p>
            </div>
          ) : filteredLeaves.length > 0 ? (
            filteredLeaves.map((leave) => (
              <div key={leave._id} className="bg-[#2A2A3A] rounded-2xl p-6 border border-gray-700">
                {/* Employee Info */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#A88BFF] to-[#8B6FE8] flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {leave.employeeName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{leave.employeeName}</h3>
                      <p className="text-gray-400 text-sm">{leave.employeeEmail}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(leave.status)}`}>
                    {leave.status.toUpperCase()}
                  </span>
                </div>

                {/* Leave Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-400 text-sm">Leave Type:</span>
                      <span className="text-white text-sm font-medium">{leave.leaveType}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-400 text-sm">Duration:</span>
                      <span className="text-white text-sm font-medium">{leave.numberOfDays} day(s)</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400 text-sm">From:</span>
                      <span className="text-white text-sm font-medium">{formatDate(leave.startDate)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400 text-sm">To:</span>
                      <span className="text-white text-sm font-medium">{formatDate(leave.endDate)}</span>
                    </div>
                  </div>
                </div>

                {/* Reason */}
                <div className="p-4 bg-[#1E1E2A] rounded-xl mb-4">
                  <div className="flex items-start space-x-2">
                    <MessageSquare className="w-4 h-4 text-gray-400 mt-1" />
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Reason:</p>
                      <p className="text-white text-sm">{leave.reason}</p>
                    </div>
                  </div>
                </div>

                {/* Applied Date */}
                <p className="text-gray-400 text-xs mb-4">
                  Applied on: {formatDate(leave.appliedOn)}
                </p>

                {/* Action Buttons */}
                {leave.status === 'pending' && (
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleApprove(leave._id)}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-semibold"
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedLeave(leave._id);
                        setShowRejectModal(true);
                      }}
                      className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-semibold"
                    >
                      <XCircle className="w-5 h-5" />
                      <span>Reject</span>
                    </button>
                  </div>
                )}

                {leave.status === 'approved' && (
                  <div className="flex items-center space-x-2 text-green-400">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm">Approved on {formatDate(leave.approvedOn)}</span>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-[#2A2A3A] rounded-2xl p-12 border border-gray-700 text-center">
              <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-white text-lg font-semibold mb-2">No {activeFilter} requests</h3>
              <p className="text-gray-400">There are no {activeFilter} leave requests at the moment</p>
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#2A2A3A] rounded-2xl p-6 max-w-md w-full border border-gray-700">
            <h3 className="text-white text-lg font-semibold mb-4">Reject Leave Request</h3>
            <p className="text-gray-400 text-sm mb-4">
              Please provide a reason for rejecting this leave request.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full bg-[#1E1E2A] text-white p-4 rounded-xl border border-gray-700 focus:border-[#A88BFF] focus:outline-none mb-4 min-h-[100px]"
            />
            <div className="flex items-center space-x-3">
              <button
                onClick={handleReject}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-semibold"
              >
                Confirm Reject
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                  setSelectedLeave(null);
                }}
                className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-colors font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNavigation />
    </div>
  );
};

export default LeaveApprovals;
