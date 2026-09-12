import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from '../../utils/toast';
import { useAuth } from '../../context/AuthContext';

const RosterChangeRequest = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [shiftTemplates, setShiftTemplates] = useState([]);
  const [formData, setFormData] = useState({
    requestedShiftTemplateId: '',
    requestedDate: '',
    reason: ''
  });

  useEffect(() => {
    fetchShiftTemplates();
  }, []);

  const fetchShiftTemplates = async () => {
    try {
      const response = await api.get('/work-schedule/shifts?isActive=true');
      setShiftTemplates(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch shift templates');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.requestedShiftTemplateId || !formData.requestedDate || !formData.reason) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      await api.post('/work-schedule/change-requests', formData);
      toast.success('Roster change request submitted successfully');
      navigate('/work-schedule/change-requests');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/work-schedule')}
          className="p-2 hover:bg-dark-800 rounded-lg"
        >
          <ArrowLeft size={20} className="text-gray-400" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Request Roster Change</h1>
          <p className="text-gray-400 mt-1">Submit a request to change your work schedule</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="card space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Requested Shift Template *
            </label>
            <select
              name="requestedShiftTemplateId"
              value={formData.requestedShiftTemplateId}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="">Select shift template</option>
              {shiftTemplates.map(template => (
                <option key={template._id} value={template._id}>
                  {template.name} ({template.code}) - {template.startTime} to {template.endTime}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Requested Date *
            </label>
            <input
              type="date"
              name="requestedDate"
              value={formData.requestedDate}
              onChange={handleChange}
              className="input-field"
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Reason *
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              className="input-field"
              rows="4"
              placeholder="Please provide a reason for the roster change request..."
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-dark-700">
            <button
              type="button"
              onClick={() => navigate('/work-schedule')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center space-x-2"
            >
              <Clock size={20} />
              <span>{loading ? 'Submitting...' : 'Submit Request'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default RosterChangeRequest;


