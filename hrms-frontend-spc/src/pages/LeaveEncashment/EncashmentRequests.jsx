import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle, XCircle, Clock, DollarSign } from 'lucide-react';
import api from '../../api/axios';
import toast from '../../utils/toast';

const EncashmentRequests = () => {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [eligibility, setEligibility] = useState(null);
  const [checkingEligibility, setCheckingEligibility] = useState(false);
  const [formData, setFormData] = useState({
    leaveType: '',
    numberOfDays: 0,
    reason: ''
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/leave-encashment/requests');
      setRequests(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch encashment requests');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const checkEligibility = async () => {
    if (!formData.leaveType || !formData.numberOfDays) {
      toast.error('Please select leave type and enter number of days');
      return;
    }
    try {
      setCheckingEligibility(true);
      const response = await api.post('/leave-encashment/check-eligibility', {
        leaveType: formData.leaveType,
        numberOfDays: formData.numberOfDays
      });
      setEligibility(response.data.data);
      toast.success('Eligibility checked successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to check eligibility');
      setEligibility(null);
    } finally {
      setCheckingEligibility(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!eligibility || !eligibility.isEligible) {
      toast.error('Please check eligibility first');
      return;
    }
    try {
      await api.post('/leave-encashment/requests', formData);
      toast.success('Encashment request created successfully');
      setShowModal(false);
      setEligibility(null);
      setFormData({
        leaveType: '',
        numberOfDays: 0,
        reason: ''
      });
      fetchRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create encashment request');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'yellow', icon: Clock },
      approved: { color: 'green', icon: CheckCircle },
      rejected: { color: 'red', icon: XCircle },
      processed: { color: 'blue', icon: DollarSign }
    };
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <span className={`flex items-center gap-1 text-${config.color}-400`}>
        <Icon size={16} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Leave Encashment Requests</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          New Request
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Leave Type</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Days</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Amount</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Request Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {requests.map((request) => (
              <tr key={request._id} className="hover:bg-gray-750">
                <td className="px-4 py-3 text-sm text-gray-300">{request.leaveType}</td>
                <td className="px-4 py-3 text-sm text-gray-300">{request.numberOfDays}</td>
                <td className="px-4 py-3 text-sm text-gray-300">
                  ₹{request.encashmentAmount?.toLocaleString() || '0'}
                </td>
                <td className="px-4 py-3">{getStatusBadge(request.status)}</td>
                <td className="px-4 py-3 text-sm text-gray-300">
                  {new Date(request.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">Create Encashment Request</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Leave Type</label>
                <input
                  type="text"
                  name="leaveType"
                  value={formData.leaveType}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder="e.g., Personal Leave"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Number of Days</label>
                <input
                  type="number"
                  name="numberOfDays"
                  value={formData.numberOfDays}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
              </div>
              <div>
                <button
                  type="button"
                  onClick={checkEligibility}
                  disabled={checkingEligibility}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50"
                >
                  {checkingEligibility ? 'Checking...' : 'Check Eligibility'}
                </button>
              </div>
              {eligibility && (
                <div className={`p-4 rounded-lg ${eligibility.isEligible ? 'bg-green-900/30' : 'bg-red-900/30'}`}>
                  <div className="text-sm font-medium text-white mb-2">
                    {eligibility.isEligible ? '✓ Eligible' : '✗ Not Eligible'}
                  </div>
                  {eligibility.isEligible && (
                    <div className="space-y-1 text-sm text-gray-300">
                      <div>Estimated Amount: ₹{eligibility.estimatedAmount?.toLocaleString() || '0'}</div>
                      <div>Available Balance: {eligibility.availableBalance || 0} days</div>
                    </div>
                  )}
                  {eligibility.reason && (
                    <div className="text-sm text-gray-400 mt-2">{eligibility.reason}</div>
                  )}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Reason</label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEligibility(null);
                    setFormData({
                      leaveType: '',
                      numberOfDays: 0,
                      reason: ''
                    });
                  }}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!eligibility || !eligibility.isEligible}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EncashmentRequests;

