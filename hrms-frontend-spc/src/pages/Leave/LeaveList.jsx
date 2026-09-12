import React, { useEffect, useState } from 'react';
import { Plus, Search, Check, X, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import toast from '../../utils/toast';
import { useAuth } from '../../context/AuthContext';

const LeaveList = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const response = await api.get('/leave');
      setLeaves(response.data.data);
    } catch (error) {
      toast.error('Failed to load leaves');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/leave/${id}/approve`);
      toast.success('Leave approved successfully');
      fetchLeaves();
    } catch (error) {
      toast.error('Failed to approve leave');
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      await api.put(`/leave/${id}/reject`, { rejectionReason: reason });
      toast.success('Leave rejected');
      fetchLeaves();
    } catch (error) {
      toast.error('Failed to reject leave');
    }
  };

  const filteredLeaves = leaves.filter(leave => 
    filterStatus === 'all' || leave.status === filterStatus
  );

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge-warning',
      approved: 'badge-success',
      rejected: 'badge-danger',
      cancelled: 'badge-default'
    };
    return badges[status] || 'badge-default';
  };

  const getLeaveTypeBadge = (type) => {
    const badges = {
      sick: 'badge-danger',
      casual: 'badge-info',
      earned: 'badge-success',
      maternity: 'badge-warning',
      paternity: 'badge-warning',
      unpaid: 'badge-default'
    };
    return badges[type] || 'badge-default';
  };

  const canApprove = user?.role === 'admin' || user?.role === 'hr';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Leave Management</h1>
          <p className="text-gray-400 mt-1">Manage leave requests</p>
        </div>
        <Link to="/leave/apply" className="btn-primary flex items-center space-x-2">
          <Plus size={20} />
          <span>Apply Leave</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-field w-48"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Leave Table */}
      <div className="card p-0">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Leave Type</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Days</th>
                <th>Reason</th>
                <th>Status</th>
                {canApprove && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredLeaves.map((leave) => (
                <tr key={leave._id}>
                  <td>
                    <div>
                      <p className="font-medium text-white">
                        {leave.employee?.firstName} {leave.employee?.lastName}
                      </p>
                      <p className="text-sm text-gray-400">{leave.employee?.employeeCode}</p>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${getLeaveTypeBadge(leave.leaveType)}`}>
                      {leave.leaveType}
                    </span>
                  </td>
                  <td>{new Date(leave.startDate).toLocaleDateString()}</td>
                  <td>{new Date(leave.endDate).toLocaleDateString()}</td>
                  <td>{leave.numberOfDays}</td>
                  <td className="max-w-xs truncate">{leave.reason}</td>
                  <td>
                    <span className={`badge ${getStatusBadge(leave.status)}`}>
                      {leave.status}
                    </span>
                  </td>
                  {canApprove && (
                    <td>
                      {leave.status === 'pending' && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleApprove(leave._id)}
                            className="p-2 text-green-400 hover:bg-dark-800 rounded"
                            title="Approve"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => handleReject(leave._id)}
                            className="p-2 text-red-400 hover:bg-dark-800 rounded"
                            title="Reject"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredLeaves.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">No leave requests found</p>
        </div>
      )}
    </div>
  );
};

export default LeaveList;
