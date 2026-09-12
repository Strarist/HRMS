import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { getEmployeeRequests, createRequest, addRequestComment } from '../../api/employeeDashboard';
import toast from '../../utils/toast';
import { FileText, Plus, X, MessageCircle, Clock, CheckCircle, XCircle } from 'lucide-react';

const EmployeeRequests = () => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [formData, setFormData] = useState({
    requestType: 'hr-query',
    priority: 'medium',
    subject: '',
    description: ''
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await getEmployeeRequests();
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createRequest(formData);
      toast.success('Request submitted successfully');
      setShowCreateModal(false);
      fetchRequests();
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create request');
    }
  };

  const resetForm = () => {
    setFormData({
      requestType: 'hr-query',
      priority: 'medium',
      subject: '',
      description: ''
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending-info':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-orange-100 text-orange-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const requestTypes = [
    { value: 'id-card-reissue', label: 'ID Card Reissue' },
    { value: 'hr-query', label: 'HR Query' },
    { value: 'bank-update', label: 'Bank Update' },
    { value: 'document-upload', label: 'Document Upload' },
    { value: 'address-change', label: 'Address Change' },
    { value: 'emergency-contact-update', label: 'Emergency Contact Update' },
    { value: 'salary-certificate', label: 'Salary Certificate' },
    { value: 'experience-letter', label: 'Experience Letter' },
    { value: 'noc-request', label: 'NOC Request' },
    { value: 'other', label: 'Other' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className={`mt-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Loading requests...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Request Center
          </h1>
          <p className={`mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Submit and track your requests
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Request
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {requests.map((request, index) => (
          <div
            key={index}
            className={`rounded-xl p-6 cursor-pointer transition-all hover:shadow-lg ${
              theme === 'dark' ? 'bg-dark-800 hover:bg-dark-700' : 'bg-white hover:shadow-xl'
            }`}
            onClick={() => setSelectedRequest(request)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {request.subject}
                  </h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getStatusColor(request.status)}`}>
                    {request.status.replace('-', ' ')}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getPriorityColor(request.priority)}`}>
                    {request.priority}
                  </span>
                </div>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {request.requestNumber} • {request.requestType.replace('-', ' ')}
                </p>
              </div>
            </div>
            <p className={`text-sm mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {request.description}
            </p>
            <div className="flex items-center justify-between text-sm">
              <span className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>
                Created: {new Date(request.createdAt).toLocaleDateString()}
              </span>
              {request.comments && request.comments.length > 0 && (
                <span className={`flex items-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  <MessageCircle className="w-4 h-4 mr-1" />
                  {request.comments.length} comments
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {requests.length === 0 && (
        <div className={`rounded-xl p-12 text-center ${theme === 'dark' ? 'bg-dark-800' : 'bg-white'}`}>
          <FileText className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
          <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            No requests submitted yet
          </p>
        </div>
      )}

      {/* Create Request Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl max-w-2xl w-full ${theme === 'dark' ? 'bg-dark-800' : 'bg-white'}`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Create New Request
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className={`p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-dark-700' : 'hover:bg-gray-100'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Request Type *
                  </label>
                  <select
                    value={formData.requestType}
                    onChange={(e) => setFormData({ ...formData, requestType: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-dark-700 border-dark-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    required
                  >
                    {requestTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Priority *
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-dark-700 border-dark-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    required
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Subject *
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-dark-700 border-dark-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    required
                    maxLength={200}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="5"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      theme === 'dark' ? 'bg-dark-700 border-dark-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    required
                    maxLength={2000}
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className={`px-4 py-2 rounded-lg ${
                      theme === 'dark' ? 'bg-dark-700 text-gray-300 hover:bg-dark-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeRequests;
