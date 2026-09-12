import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Video, Users, Loader } from 'lucide-react';
import api from '../api/axios';
import toast from '../utils/toast';

const InterviewScheduleModal = ({ candidateId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    interviewType: 'Technical',
    round: '',
    scheduledDate: '',
    scheduledTime: '',
    meetingPlatform: 'Google Meet',
    meetingLink: '',
    interviewer: []
  });
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      setEmployees(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.scheduledDate || !formData.scheduledTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      await api.post(`/candidates/${candidateId}/interview`, formData);
      toast.success('Interview scheduled successfully');
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to schedule interview');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleInterviewerChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({ ...prev, interviewer: selectedOptions }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-900 rounded-lg border border-dark-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-dark-900 border-b border-dark-800 p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Schedule Interview</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Interview Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Interview Type *
            </label>
            <select
              name="interviewType"
              value={formData.interviewType}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="Technical">Technical</option>
              <option value="HR">HR</option>
              <option value="Managerial">Managerial</option>
              <option value="Cultural Fit">Cultural Fit</option>
              <option value="Final Round">Final Round</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Round */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Round Name
            </label>
            <input
              type="text"
              name="round"
              value={formData.round}
              onChange={handleChange}
              placeholder="e.g., Round 1, First Technical Interview"
              className="input-field"
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Calendar size={16} className="inline mr-2" />
                Date *
              </label>
              <input
                type="date"
                name="scheduledDate"
                value={formData.scheduledDate}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Clock size={16} className="inline mr-2" />
                Time *
              </label>
              <input
                type="time"
                name="scheduledTime"
                value={formData.scheduledTime}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>
          </div>

          {/* Meeting Platform */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Video size={16} className="inline mr-2" />
              Meeting Platform
            </label>
            <select
              name="meetingPlatform"
              value={formData.meetingPlatform}
              onChange={handleChange}
              className="input-field"
            >
              <option value="Google Meet">Google Meet</option>
              <option value="Microsoft Teams">Microsoft Teams</option>
              <option value="Zoom">Zoom</option>
              <option value="Phone">Phone</option>
              <option value="In-Person">In-Person</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Meeting Link */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Meeting Link
            </label>
            <input
              type="url"
              name="meetingLink"
              value={formData.meetingLink}
              onChange={handleChange}
              placeholder="https://meet.google.com/..."
              className="input-field"
            />
          </div>

          {/* Interviewers */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Users size={16} className="inline mr-2" />
              Assign Interviewer(s)
            </label>
            <select
              multiple
              value={formData.interviewer}
              onChange={handleInterviewerChange}
              className="input-field h-32"
            >
              {employees.map(emp => (
                <option key={emp._id} value={emp._id}>
                  {emp.firstName} {emp.lastName} - {emp.designation || 'N/A'}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-dark-800">
            <button
              type="button"
              onClick={onClose}
              className="btn-outline"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex items-center space-x-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  <span>Scheduling...</span>
                </>
              ) : (
                <>
                  <Calendar size={18} />
                  <span>Schedule Interview</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InterviewScheduleModal;
