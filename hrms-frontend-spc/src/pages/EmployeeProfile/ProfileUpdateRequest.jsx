import React, { useState, useEffect } from 'react';
import { Plus, Check, X, Clock, FileEdit } from 'lucide-react';
import api from '../../api/axios';
import toast from '../../utils/toast';
import { useAuth } from '../../context/AuthContext';

const ProfileUpdateRequest = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    fieldName: '',
    fieldCategory: '',
    oldValue: '',
    newValue: '',
    reason: ''
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/employee/profile/update-requests');
      setRequests(response.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch update requests');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/employee/profile/update-requests', formData);
      toast.success('Profile update request submitted successfully');
      setIsModalOpen(false);
      setFormData({
        fieldName: '',
        fieldCategory: '',
        oldValue: '',
        newValue: '',
        reason: ''
      });
      fetchRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit request');
    }
  };

  const handleApproveReject = async (id, action, comments = '') => {
    try {
      await api.post(`/employee/profile/update-requests/${id}/approve`, {
        action,
        comments
      });
      toast.success(`Request ${action}d successfully`);
      fetchRequests();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${action} request`);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-400';
      case 'rejected': return 'text-red-400';
      case 'pending': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="text-white">Loading...</div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <FileEdit size={20} /> Profile Update Requests
        </h2>
        {user.role === 'employee' && (
          <button
            onClick={() => {
              setFormData({
                fieldName: '',
                fieldCategory: '',
                oldValue: '',
                newValue: '',
                reason: ''
              });
              setIsModalOpen(true);
            }}
            className="btn-primary"
          >
            <Plus size={20} /> New Request
          </button>
        )}
      </div>

      <div className="space-y-4">
        {requests.map((request) => (
          <div key={request._id} className="bg-dark-700 p-4 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-lg font-semibold text-white capitalize">
                  {request.fieldName.replace(/([A-Z])/g, ' $1').trim()}
                </h3>
                <p className="text-gray-400 text-sm capitalize">{request.fieldCategory}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)} bg-opacity-20`}>
                {request.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-gray-400 text-sm">Old Value</p>
                <p className="text-white">{String(request.oldValue || 'N/A')}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">New Value</p>
                <p className="text-white">{String(request.newValue || 'N/A')}</p>
              </div>
            </div>

            {request.reason && (
              <div className="mt-2">
                <p className="text-gray-400 text-sm">Reason</p>
                <p className="text-white">{request.reason}</p>
              </div>
            )}

            {request.slaDeadline && request.status === 'pending' && (
              <div className="mt-2 flex items-center gap-2 text-yellow-400 text-sm">
                <Clock size={14} />
                SLA Deadline: {new Date(request.slaDeadline).toLocaleString()}
              </div>
            )}

            {(user.role === 'manager' || user.role === 'hr' || user.role === 'admin') && 
             request.status === 'pending' && 
             request.currentApprover?._id === user._id && (
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => {
                    const comments = window.prompt('Enter approval comments (optional):');
                    handleApproveReject(request._id, 'approve', comments || '');
                  }}
                  className="btn-primary flex items-center gap-2"
                >
                  <Check size={18} /> Approve
                </button>
                <button
                  onClick={() => {
                    const comments = window.prompt('Enter rejection reason:');
                    if (comments) {
                      handleApproveReject(request._id, 'reject', comments);
                    }
                  }}
                  className="btn-secondary flex items-center gap-2"
                >
                  <X size={18} /> Reject
                </button>
              </div>
            )}

            {request.approvals && request.approvals.length > 0 && (
              <div className="mt-4">
                <p className="text-gray-400 text-sm mb-2">Approval Status:</p>
                <div className="space-y-1">
                  {request.approvals.map((approval, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <span className="text-gray-400">{approval.approverName}:</span>
                      <span className={getStatusColor(approval.status)}>
                        {approval.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-dark-700 p-6 rounded-lg shadow-xl w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">New Profile Update Request</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Field Category *</label>
                <select
                  name="fieldCategory"
                  value={formData.fieldCategory}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-dark-600 border border-gray-600 rounded-md text-white"
                  required
                >
                  <option value="">Select</option>
                  <option value="personal">Personal</option>
                  <option value="address">Address</option>
                  <option value="contact">Contact</option>
                  <option value="family">Family</option>
                  <option value="education">Education</option>
                  <option value="experience">Experience</option>
                  <option value="certification">Certification</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Field Name *</label>
                <input
                  type="text"
                  name="fieldName"
                  value={formData.fieldName}
                  onChange={handleChange}
                  placeholder="e.g., phone, email, permanentAddress"
                  className="w-full px-3 py-2 bg-dark-600 border border-gray-600 rounded-md text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Current Value</label>
                <input
                  type="text"
                  name="oldValue"
                  value={formData.oldValue}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-dark-600 border border-gray-600 rounded-md text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">New Value *</label>
                <input
                  type="text"
                  name="newValue"
                  value={formData.newValue}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-dark-600 border border-gray-600 rounded-md text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Reason *</label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 bg-dark-600 border border-gray-600 rounded-md text-white"
                  required
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
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

export default ProfileUpdateRequest;

