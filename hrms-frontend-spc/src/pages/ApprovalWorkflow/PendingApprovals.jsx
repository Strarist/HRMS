import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, XCircle, Clock, Filter, User, Mail, Phone, 
  Briefcase, Building, FileText, AlertCircle, Eye, RefreshCw,
  UserCheck, Calendar, MessageSquare
} from 'lucide-react';
import api from '../../api/axios';
import toast from '../../utils/toast';

const PendingApprovals = () => {
  const [loading, setLoading] = useState(true);
  const [approvals, setApprovals] = useState([]);
  const [filters, setFilters] = useState({
    requestType: '',
    status: 'pending'
  });
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchApprovals();
  }, [filters]);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      // Fetch from the correct approvals endpoint
      const response = await api.get('/approvals/pending');
      setApprovals(response.data.data || []);
    } catch (error) {
      console.error('Error fetching approvals:', error);
      toast.error('Failed to fetch pending approvals');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (approval) => {
    if (!window.confirm('Are you sure you want to approve this request?')) {
      return;
    }
    
    setProcessingId(approval._id);
    try {
      await api.put(`/approvals/${approval._id}/approve`, {
        comments: 'Approved'
      });
      toast.success('Request approved successfully');
      fetchApprovals();
    } catch (error) {
      console.error('Error approving:', error);
      toast.error(error.response?.data?.message || 'Failed to approve request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    
    setProcessingId(selectedApproval._id);
    try {
      await api.put(`/approvals/${selectedApproval._id}/reject`, {
        comments: rejectReason
      });
      toast.success('Request rejected');
      setRejectModalOpen(false);
      setRejectReason('');
      setSelectedApproval(null);
      fetchApprovals();
    } catch (error) {
      console.error('Error rejecting:', error);
      toast.error(error.response?.data?.message || 'Failed to reject request');
    } finally {
      setProcessingId(null);
    }
  };

  const openRejectModal = (approval) => {
    setSelectedApproval(approval);
    setRejectReason('');
    setRejectModalOpen(true);
  };

  const getRequestTypeLabel = (type) => {
    const labels = {
      'onboarding_approval': 'Onboarding Approval',
      'leave': 'Leave Request',
      'attendance': 'Attendance',
      'expense': 'Expense',
      'payroll': 'Payroll',
      'asset': 'Asset',
      'document': 'Document',
      'offboarding': 'Offboarding',
      'other': 'Other'
    };
    return labels[type] || type;
  };

  const getRequestTypeColor = (type) => {
    const colors = {
      'onboarding_approval': 'bg-blue-500',
      'leave': 'bg-green-500',
      'attendance': 'bg-yellow-500',
      'expense': 'bg-purple-500',
      'payroll': 'bg-indigo-500',
      'asset': 'bg-orange-500',
      'document': 'bg-cyan-500',
      'offboarding': 'bg-red-500',
      'other': 'bg-gray-500'
    };
    return colors[type] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Pending Approvals</h1>
          <p className="text-gray-400 mt-1">Review and process approval requests</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={fetchApprovals}
            className="btn-outline flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-900/20 border border-amber-800 rounded-lg">
            <Clock size={20} className="text-amber-400" />
            <span className="text-amber-400 font-medium">{approvals.length} Pending</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-gray-400" />
          <h2 className="text-lg font-semibold text-white">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Request Type</label>
            <select
              value={filters.requestType}
              onChange={(e) => setFilters(prev => ({ ...prev, requestType: e.target.value }))}
              className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white"
            >
              <option value="">All Types</option>
              <option value="onboarding_approval">Onboarding Approval</option>
              <option value="leave">Leave Request</option>
              <option value="expense">Expense</option>
              <option value="attendance">Attendance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Approvals List */}
      <div className="space-y-4">
        {approvals
          .filter(a => !filters.requestType || a.requestType === filters.requestType)
          .map((approval) => (
          <ApprovalCard
            key={approval._id}
            approval={approval}
            onApprove={() => handleApprove(approval)}
            onReject={() => openRejectModal(approval)}
            onViewDetails={() => {
              setSelectedApproval(approval);
              setShowDetailsModal(true);
            }}
            processing={processingId === approval._id}
            getRequestTypeLabel={getRequestTypeLabel}
            getRequestTypeColor={getRequestTypeColor}
          />
        ))}
      </div>

      {approvals.length === 0 && (
        <div className="card p-12 text-center">
          <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">All Caught Up!</h3>
          <p className="text-gray-400">No pending approvals at the moment.</p>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedApproval && (
        <ApprovalDetailsModal
          approval={selectedApproval}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedApproval(null);
          }}
          onApprove={() => {
            setShowDetailsModal(false);
            handleApprove(selectedApproval);
          }}
          onReject={() => {
            setShowDetailsModal(false);
            openRejectModal(selectedApproval);
          }}
          getRequestTypeLabel={getRequestTypeLabel}
        />
      )}

      {/* Reject Modal */}
      {rejectModalOpen && selectedApproval && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 border border-dark-700 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center space-x-2 mb-4">
              <XCircle className="text-red-500" size={24} />
              <h3 className="text-xl font-bold text-white">Reject Request</h3>
            </div>
            
            <p className="text-gray-400 mb-4">
              Please provide a reason for rejecting this {getRequestTypeLabel(selectedApproval.requestType).toLowerCase()} request.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Rejection Reason <span className="text-red-400">*</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter reason for rejection..."
                className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-gray-500 focus:border-red-500 focus:outline-none"
                rows={4}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setRejectModalOpen(false);
                  setSelectedApproval(null);
                  setRejectReason('');
                }}
                className="btn-outline"
                disabled={processingId === selectedApproval._id}
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim() || processingId === selectedApproval._id}
                className="btn-danger flex items-center space-x-2"
              >
                {processingId === selectedApproval._id ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Rejecting...</span>
                  </>
                ) : (
                  <>
                    <XCircle size={16} />
                    <span>Reject Request</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Approval Card Component
const ApprovalCard = ({ approval, onApprove, onReject, onViewDetails, processing, getRequestTypeLabel, getRequestTypeColor }) => {
  const isOnboarding = approval.requestType === 'onboarding_approval';
  const details = approval.onboardingDetails || approval.metadata || {};
  
  return (
    <div className="card hover:border-primary-500/50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center space-x-3 mb-3">
            <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getRequestTypeColor(approval.requestType)}`}>
              {getRequestTypeLabel(approval.requestType)}
            </span>
            <span className="text-gray-500 text-sm">
              {new Date(approval.createdAt).toLocaleDateString()} at {new Date(approval.createdAt).toLocaleTimeString()}
            </span>
          </div>

          {/* Onboarding Approval Details */}
          {isOnboarding && (
            <div className="space-y-3">
              {/* Candidate Info */}
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
                  <User size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">
                    {details.candidateName || approval.metadata?.candidateName || 'Unknown Candidate'}
                  </h3>
                  <p className="text-primary-400 text-sm font-medium">
                    {details.position || approval.metadata?.position || 'Position not specified'}
                  </p>
                </div>
              </div>

              {/* Candidate Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <Mail size={14} className="text-gray-500" />
                  <span>{details.candidateEmail || approval.metadata?.candidateEmail || 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <Phone size={14} className="text-gray-500" />
                  <span>{details.candidatePhone || approval.metadata?.candidatePhone || 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <Building size={14} className="text-gray-500" />
                  <span>{details.department || approval.metadata?.department || 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <FileText size={14} className="text-gray-500" />
                  <span>ID: {details.candidateCode || details.onboardingId || 'N/A'}</span>
                </div>
              </div>

              {/* HR Info */}
              <div className="mt-3 p-3 bg-dark-800/50 rounded-lg">
                <div className="flex items-center space-x-2 text-sm">
                  <UserCheck size={14} className="text-blue-400" />
                  <span className="text-gray-400">Requested by:</span>
                  <span className="text-white font-medium">
                    {details.assignedHR?.name || approval.metadata?.requestedByName || approval.requestedBy?.firstName + ' ' + approval.requestedBy?.lastName || 'HR'}
                  </span>
                  <span className="text-gray-500">
                    ({details.assignedHR?.email || approval.metadata?.requestedByEmail || approval.requestedBy?.email || 'N/A'})
                  </span>
                </div>
                {approval.metadata?.notes && (
                  <div className="flex items-start space-x-2 text-sm mt-2">
                    <MessageSquare size={14} className="text-gray-500 mt-0.5" />
                    <span className="text-gray-400">{approval.metadata.notes}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Generic Approval Details */}
          {!isOnboarding && (
            <div className="space-y-2">
              <p className="text-white">
                Requested by: {approval.requestedBy?.firstName} {approval.requestedBy?.lastName}
              </p>
              {approval.metadata?.notes && (
                <p className="text-gray-400 text-sm">{approval.metadata.notes}</p>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col space-y-2 ml-4">
          <button
            onClick={onViewDetails}
            className="btn-outline btn-sm flex items-center space-x-1"
          >
            <Eye size={14} />
            <span>Details</span>
          </button>
          <button
            onClick={onApprove}
            disabled={processing}
            className="btn-success btn-sm flex items-center space-x-1"
          >
            {processing ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <CheckCircle size={14} />
            )}
            <span>Approve</span>
          </button>
          <button
            onClick={onReject}
            disabled={processing}
            className="btn-danger btn-sm flex items-center space-x-1"
          >
            <XCircle size={14} />
            <span>Reject</span>
          </button>
        </div>
      </div>

      {/* SLA Warning */}
      {approval.slaStatus?.expectedCompletionDate && new Date(approval.slaStatus.expectedCompletionDate) < new Date() && (
        <div className="mt-3 p-2 bg-red-900/20 border border-red-800 rounded-lg flex items-center space-x-2">
          <AlertCircle size={16} className="text-red-400" />
          <span className="text-sm text-red-400">SLA Breached - Please process urgently</span>
        </div>
      )}
    </div>
  );
};

// Approval Details Modal
const ApprovalDetailsModal = ({ approval, onClose, onApprove, onReject, getRequestTypeLabel }) => {
  const isOnboarding = approval.requestType === 'onboarding_approval';
  const details = approval.onboardingDetails || approval.metadata || {};

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-dark-900 border border-dark-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-dark-900 border-b border-dark-700 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">{getRequestTypeLabel(approval.requestType)}</h2>
            <p className="text-gray-400 mt-1">Review request details</p>
          </div>
          <button onClick={onClose} className="btn-outline p-2">
            <XCircle size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {isOnboarding && (
            <>
              {/* Candidate Information */}
              <div className="card bg-dark-800">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                  <User size={20} className="text-primary-500" />
                  <span>Candidate Information</span>
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500 text-sm">Full Name</p>
                    <p className="text-white font-medium">{details.candidateName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Candidate ID</p>
                    <p className="text-white font-medium">{details.candidateCode || details.onboardingId || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Email</p>
                    <p className="text-white font-medium">{details.candidateEmail || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Phone</p>
                    <p className="text-white font-medium">{details.candidatePhone || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Job Information */}
              <div className="card bg-dark-800">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                  <Briefcase size={20} className="text-primary-500" />
                  <span>Job Information</span>
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500 text-sm">Position</p>
                    <p className="text-white font-medium">{details.position || approval.metadata?.jobTitle || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Department</p>
                    <p className="text-white font-medium">{details.department || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Requesting HR */}
              <div className="card bg-dark-800">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                  <UserCheck size={20} className="text-primary-500" />
                  <span>Requested By</span>
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500 text-sm">HR Name</p>
                    <p className="text-white font-medium">
                      {details.assignedHR?.name || approval.metadata?.requestedByName || 
                       (approval.requestedBy ? `${approval.requestedBy.firstName} ${approval.requestedBy.lastName}` : 'N/A')}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">HR Email</p>
                    <p className="text-white font-medium">
                      {details.assignedHR?.email || approval.metadata?.requestedByEmail || approval.requestedBy?.email || 'N/A'}
                    </p>
                  </div>
                </div>
                {approval.metadata?.notes && (
                  <div className="mt-4">
                    <p className="text-gray-500 text-sm">Notes</p>
                    <p className="text-white mt-1">{approval.metadata.notes}</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Timeline */}
          <div className="card bg-dark-800">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <Calendar size={20} className="text-primary-500" />
              <span>Request Timeline</span>
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                <span className="text-gray-400 text-sm">Created:</span>
                <span className="text-white">{new Date(approval.createdAt).toLocaleString()}</span>
              </div>
              {approval.slaStatus?.expectedCompletionDate && (
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${new Date(approval.slaStatus.expectedCompletionDate) < new Date() ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                  <span className="text-gray-400 text-sm">SLA Deadline:</span>
                  <span className={new Date(approval.slaStatus.expectedCompletionDate) < new Date() ? 'text-red-400' : 'text-yellow-400'}>
                    {new Date(approval.slaStatus.expectedCompletionDate).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-dark-900 border-t border-dark-700 p-6 flex justify-end space-x-3">
          <button onClick={onClose} className="btn-outline">
            Cancel
          </button>
          <button onClick={onReject} className="btn-danger flex items-center space-x-2">
            <XCircle size={16} />
            <span>Reject</span>
          </button>
          <button onClick={onApprove} className="btn-success flex items-center space-x-2">
            <CheckCircle size={16} />
            <span>Approve</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PendingApprovals;
