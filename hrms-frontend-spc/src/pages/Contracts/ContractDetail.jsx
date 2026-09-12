/**
 * Contract Detail Page
 * View and manage individual contract details
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from '../../utils/toast';
import {
  ArrowLeft,
  Check,
  X,
  RefreshCw,
  XCircle,
  Edit,
  AlertCircle
} from 'lucide-react';
import {
  getContractById,
  approveContract,
  rejectContract,
  renewContract,
  terminateContract,
  updateDeliverable
} from '../../api/contracts';
import { useAuth } from '../../context/AuthContext';

const ContractDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [showTerminateModal, setShowTerminateModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  // Check if user has admin privileges
  const isAdmin = user?.role === 'admin' || user?.role === 'company_admin' || user?.role === 'superadmin';

  const [renewData, setRenewData] = useState({
    newEndDate: '',
    notes: ''
  });

  const [terminateData, setTerminateData] = useState({
    terminationReason: '',
    terminationDate: new Date().toISOString().split('T')[0]
  });

  const [rejectData, setRejectData] = useState({
    rejectionReason: ''
  });

  useEffect(() => {
    fetchContract();
  }, [id]);

  const fetchContract = async () => {
    try {
      setLoading(true);
      const response = await getContractById(id);
      setContract(response.data);
    } catch (error) {
      console.error('Error fetching contract:', error);
      toast.error('Failed to load contract');
      navigate('/contracts');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!confirm('Are you sure you want to approve this contract?')) return;

    try {
      setActionLoading(true);
      await approveContract(id);
      toast.success('Contract approved successfully');
      fetchContract();
    } catch (error) {
      console.error('Error approving contract:', error);
      toast.error(error.response?.data?.message || 'Failed to approve contract');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectData.rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      setActionLoading(true);
      await rejectContract(id, rejectData.rejectionReason);
      toast.success('Contract rejected');
      setShowRejectModal(false);
      fetchContract();
    } catch (error) {
      console.error('Error rejecting contract:', error);
      toast.error(error.response?.data?.message || 'Failed to reject contract');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRenew = async () => {
    if (!renewData.newEndDate) {
      toast.error('Please select a new end date');
      return;
    }

    if (new Date(renewData.newEndDate) <= new Date(contract.endDate)) {
      toast.error('New end date must be after current end date');
      return;
    }

    try {
      setActionLoading(true);
      await renewContract(id, renewData.newEndDate, renewData.notes);
      toast.success('Contract renewed successfully');
      setShowRenewModal(false);
      fetchContract();
    } catch (error) {
      console.error('Error renewing contract:', error);
      toast.error(error.response?.data?.message || 'Failed to renew contract');
    } finally {
      setActionLoading(false);
    }
  };

  const handleTerminate = async () => {
    if (!terminateData.terminationReason.trim()) {
      toast.error('Please provide a termination reason');
      return;
    }

    if (!confirm('Are you sure you want to terminate this contract? This action cannot be undone.')) return;

    try {
      setActionLoading(true);
      await terminateContract(id, terminateData.terminationReason, terminateData.terminationDate);
      toast.success('Contract terminated');
      setShowTerminateModal(false);
      fetchContract();
    } catch (error) {
      console.error('Error terminating contract:', error);
      toast.error(error.response?.data?.message || 'Failed to terminate contract');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeliverableStatusUpdate = async (index, newStatus) => {
    try {
      const completedDate = newStatus === 'completed' ? new Date().toISOString() : null;
      await updateDeliverable(id, index, newStatus, completedDate);
      toast.success('Deliverable updated');
      fetchContract();
    } catch (error) {
      console.error('Error updating deliverable:', error);
      toast.error('Failed to update deliverable');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatContractType = (type) => {
    return type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const getStatusColor = (status) => {
    const colors = {
      'active': 'text-green-400 bg-green-400/10 border-green-400/20',
      'draft': 'text-gray-400 bg-gray-400/10 border-gray-400/20',
      'pending-renewal': 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
      'expired': 'text-red-400 bg-red-400/10 border-red-400/20',
      'terminated': 'text-red-400 bg-red-400/10 border-red-400/20',
      'completed': 'text-blue-400 bg-blue-400/10 border-blue-400/20'
    };
    return colors[status] || 'text-gray-400 bg-gray-400/10 border-gray-400/20';
  };

  const getDeliverableStatusColor = (status) => {
    const colors = {
      'pending': 'text-gray-400 bg-gray-400/10',
      'in-progress': 'text-blue-400 bg-blue-400/10',
      'completed': 'text-green-400 bg-green-400/10',
      'delayed': 'text-red-400 bg-red-400/10'
    };
    return colors[status] || 'text-gray-400 bg-gray-400/10';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-400">Contract not found</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/contracts')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">{contract.contractNumber}</h1>
            <p className="text-gray-400 mt-1">{contract.title}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {contract.approvalStatus === 'pending' && isAdmin && (
            <>
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <Check size={18} />
                Approve
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                disabled={actionLoading}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                <X size={18} />
                Reject
              </button>
            </>
          )}

          {contract.status === 'active' && contract.isRenewable && (
            <button
              onClick={() => setShowRenewModal(true)}
              disabled={actionLoading}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={18} />
              Renew
            </button>
          )}

          {contract.status === 'active' && (
            <button
              onClick={() => setShowTerminateModal(true)}
              disabled={actionLoading}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              <XCircle size={18} />
              Terminate
            </button>
          )}
        </div>
      </div>

      {/* Alert for Expiring Soon */}
      {contract.isExpiringSoon && contract.status === 'active' && (
        <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="text-yellow-400" size={32} />
          <div>
            <p className="text-yellow-400 font-semibold">Contract Expiring Soon</p>
            <p className="text-gray-300 text-sm">
              This contract will expire in {contract.daysUntilExpiry} days. Please take action to renew or terminate.
            </p>
          </div>
        </div>
      )}

      {/* Contract Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Status Card */}
        <div className="bg-dark-800 rounded-lg p-6 border border-dark-700">
          <p className="text-gray-400 text-sm mb-2">Status</p>
          <span className={`px-3 py-1 rounded-full text-sm border ${getStatusColor(contract.status)}`}>
            {contract.status}
          </span>
        </div>

        {/* Days Until Expiry */}
        <div className="bg-dark-800 rounded-lg p-6 border border-dark-700">
          <p className="text-gray-400 text-sm mb-2">Days Until Expiry</p>
          <p className={`text-2xl font-bold ${
            contract.daysUntilExpiry <= 7 ? 'text-red-400' : 
            contract.daysUntilExpiry <= 30 ? 'text-yellow-400' : 
            'text-green-400'
          }`}>
            {contract.daysUntilExpiry > 0 ? `${contract.daysUntilExpiry} days` : 'Expired'}
          </p>
        </div>

        {/* Contract Type */}
        <div className="bg-dark-800 rounded-lg p-6 border border-dark-700">
          <p className="text-gray-400 text-sm mb-2">Contract Type</p>
          <p className="text-white text-lg font-semibold">{formatContractType(contract.contractType)}</p>
        </div>
      </div>

      {/* Contract Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="bg-dark-800 rounded-lg p-6 border border-dark-700 space-y-4">
          <h2 className="text-xl font-semibold text-white mb-4">Basic Information</h2>
          
          <div>
            <p className="text-gray-400 text-sm">Employee</p>
            <p className="text-white">{contract.employeeName}</p>
            <p className="text-gray-400 text-sm">{contract.employeeCode}</p>
          </div>

          <div>
            <p className="text-gray-400 text-sm">Contract Period</p>
            <p className="text-white">{formatDate(contract.startDate)} - {formatDate(contract.endDate)}</p>
            <p className="text-gray-400 text-sm">{contract.duration} days</p>
          </div>

          {contract.description && (
            <div>
              <p className="text-gray-400 text-sm">Description</p>
              <p className="text-white">{contract.description}</p>
            </div>
          )}

          <div>
            <p className="text-gray-400 text-sm">Invoice Cycle</p>
            <p className="text-white capitalize">{contract.invoiceCycle?.replace('-', ' ')}</p>
          </div>
        </div>

        {/* Financial Details */}
        <div className="bg-dark-800 rounded-lg p-6 border border-dark-700 space-y-4">
          <h2 className="text-xl font-semibold text-white mb-4">Financial Details</h2>
          
          {contract.contractType === 'fixed-deliverable' && (
            <div>
              <p className="text-gray-400 text-sm">Total Amount</p>
              <p className="text-white text-2xl font-bold">${contract.totalAmount?.toLocaleString()}</p>
            </div>
          )}

          {contract.contractType === 'rate-based' && (
            <>
              <div>
                <p className="text-gray-400 text-sm">Rate Amount</p>
                <p className="text-white text-2xl font-bold">${contract.rateAmount?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Rate Period</p>
                <p className="text-white capitalize">{contract.ratePeriod?.replace('-', ' ')}</p>
              </div>
            </>
          )}

          {contract.contractType === 'hourly-based' && (
            <>
              <div>
                <p className="text-gray-400 text-sm">Hourly Rate</p>
                <p className="text-white text-2xl font-bold">${contract.hourlyRate}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Estimated Hours</p>
                <p className="text-white">{contract.estimatedHours} hours</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Actual Hours</p>
                <p className="text-white">{contract.actualHours || 0} hours</p>
              </div>
              {contract.maxHoursPerWeek && (
                <div>
                  <p className="text-gray-400 text-sm">Max Hours Per Week</p>
                  <p className="text-white">{contract.maxHoursPerWeek} hours</p>
                </div>
              )}
            </>
          )}

          {contract.paymentTerms && (
            <div>
              <p className="text-gray-400 text-sm">Payment Terms</p>
              <p className="text-white">{contract.paymentTerms}</p>
            </div>
          )}
        </div>
      </div>

      {/* Deliverables (for Fixed Deliverable contracts) */}
      {contract.contractType === 'fixed-deliverable' && contract.deliverables?.length > 0 && (
        <div className="bg-dark-800 rounded-lg p-6 border border-dark-700">
          <h2 className="text-xl font-semibold text-white mb-4">Deliverables</h2>
          <div className="space-y-3">
            {contract.deliverables.map((deliverable, index) => (
              <div key={index} className="bg-dark-700 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="text-white font-medium">{deliverable.description}</p>
                    <p className="text-gray-400 text-sm">Due: {formatDate(deliverable.dueDate)}</p>
                    {deliverable.completedDate && (
                      <p className="text-green-400 text-sm">Completed: {formatDate(deliverable.completedDate)}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs ${getDeliverableStatusColor(deliverable.status)}`}>
                      {deliverable.status}
                    </span>
                    {contract.status === 'active' && deliverable.status !== 'completed' && (
                      <select
                        value={deliverable.status}
                        onChange={(e) => handleDeliverableStatusUpdate(index, e.target.value)}
                        className="bg-dark-600 text-white text-sm rounded px-2 py-1"
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="delayed">Delayed</option>
                      </select>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Renewal Information */}
      {contract.isRenewable && (
        <div className="bg-dark-800 rounded-lg p-6 border border-dark-700">
          <h2 className="text-xl font-semibold text-white mb-4">Renewal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Auto-Renewal</p>
              <p className="text-white">{contract.autoRenew ? 'Enabled' : 'Disabled'}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Renewal Reminder</p>
              <p className="text-white">{contract.renewalReminderDays} days before expiry</p>
            </div>
            {contract.renewalTerms && (
              <div className="md:col-span-2">
                <p className="text-gray-400 text-sm">Renewal Terms</p>
                <p className="text-white">{contract.renewalTerms}</p>
              </div>
            )}
          </div>

          {/* Renewal History */}
          {contract.renewalHistory?.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-white mb-3">Renewal History</h3>
              <div className="space-y-2">
                {contract.renewalHistory.map((renewal, index) => (
                  <div key={index} className="bg-dark-700 rounded-lg p-3">
                    <p className="text-white text-sm">
                      Renewed on {formatDate(renewal.renewedDate)}
                    </p>
                    <p className="text-gray-400 text-sm">
                      Extended from {formatDate(renewal.previousEndDate)} to {formatDate(renewal.newEndDate)}
                    </p>
                    {renewal.notes && (
                      <p className="text-gray-400 text-sm mt-1">{renewal.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Renew Modal */}
      {showRenewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-dark-800 rounded-lg p-6 max-w-md w-full border border-dark-700">
            <h3 className="text-xl font-semibold text-white mb-4">Renew Contract</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">New End Date *</label>
                <input
                  type="date"
                  value={renewData.newEndDate}
                  onChange={(e) => setRenewData(prev => ({ ...prev, newEndDate: e.target.value }))}
                  min={new Date(contract.endDate).toISOString().split('T')[0]}
                  className="w-full bg-dark-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Notes</label>
                <textarea
                  value={renewData.notes}
                  onChange={(e) => setRenewData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  placeholder="Add any notes about the renewal"
                  className="w-full bg-dark-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowRenewModal(false)}
                className="px-4 py-2 bg-dark-700 text-white rounded-lg hover:bg-dark-600"
              >
                Cancel
              </button>
              <button
                onClick={handleRenew}
                disabled={actionLoading}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {actionLoading ? 'Renewing...' : 'Renew Contract'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Terminate Modal */}
      {showTerminateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-dark-800 rounded-lg p-6 max-w-md w-full border border-dark-700">
            <h3 className="text-xl font-semibold text-white mb-4">Terminate Contract</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Termination Date *</label>
                <input
                  type="date"
                  value={terminateData.terminationDate}
                  onChange={(e) => setTerminateData(prev => ({ ...prev, terminationDate: e.target.value }))}
                  className="w-full bg-dark-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Termination Reason *</label>
                <textarea
                  value={terminateData.terminationReason}
                  onChange={(e) => setTerminateData(prev => ({ ...prev, terminationReason: e.target.value }))}
                  rows={3}
                  placeholder="Provide reason for termination"
                  className="w-full bg-dark-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowTerminateModal(false)}
                className="px-4 py-2 bg-dark-700 text-white rounded-lg hover:bg-dark-600"
              >
                Cancel
              </button>
              <button
                onClick={handleTerminate}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading ? 'Terminating...' : 'Terminate Contract'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-dark-800 rounded-lg p-6 max-w-md w-full border border-dark-700">
            <h3 className="text-xl font-semibold text-white mb-4">Reject Contract</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Rejection Reason *</label>
                <textarea
                  value={rejectData.rejectionReason}
                  onChange={(e) => setRejectData(prev => ({ ...prev, rejectionReason: e.target.value }))}
                  rows={3}
                  placeholder="Provide reason for rejection"
                  className="w-full bg-dark-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 bg-dark-700 text-white rounded-lg hover:bg-dark-600"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading ? 'Rejecting...' : 'Reject Contract'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractDetail;
