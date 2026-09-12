import React, { useState } from 'react';
import { X, Phone, Calendar, CheckCircle, XCircle, Clock, Loader, UserPlus } from 'lucide-react';
import api from '../api/axios';
import toast from '../utils/toast';

const HRCallModal = ({ candidateId, hrCall, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    status: hrCall?.status || 'pending',
    scheduledDate: hrCall?.scheduledDate ? new Date(hrCall.scheduledDate).toISOString().split('T')[0] : '',
    completedDate: hrCall?.completedDate ? new Date(hrCall.completedDate).toISOString().split('T')[0] : '',
    summary: hrCall?.summary || '',
    decision: hrCall?.decision || 'pending'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.status === 'completed' && !formData.summary) {
      toast.error('Please provide a summary for completed calls');
      return;
    }

    try {
      setLoading(true);
      const submitData = { ...formData };
      
      // Set completed date to now if marking as completed
      if (formData.status === 'completed' && !formData.completedDate) {
        submitData.completedDate = new Date().toISOString().split('T')[0];
      }

      await api.put(`/candidates/${candidateId}/hr-call`, submitData);
      toast.success('HR call updated successfully');
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update HR call');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-900 rounded-lg border border-dark-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-dark-900 border-b border-dark-800 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">HR Call / Final Discussion</h2>
            <p className="text-sm text-gray-400 mt-1">
              Manage final HR discussion with candidate
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Call Status *
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, status: 'pending' }))}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.status === 'pending'
                    ? 'border-gray-500 bg-gray-500/20'
                    : 'border-dark-800 hover:border-gray-500/50'
                }`}
              >
                <Clock size={24} className={`mx-auto mb-2 ${
                  formData.status === 'pending' ? 'text-gray-400' : 'text-gray-600'
                }`} />
                <p className={`text-sm font-medium ${
                  formData.status === 'pending' ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Pending
                </p>
              </button>

              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, status: 'scheduled' }))}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.status === 'scheduled'
                    ? 'border-blue-500 bg-blue-500/20'
                    : 'border-dark-800 hover:border-blue-500/50'
                }`}
              >
                <Calendar size={24} className={`mx-auto mb-2 ${
                  formData.status === 'scheduled' ? 'text-blue-500' : 'text-gray-400'
                }`} />
                <p className={`text-sm font-medium ${
                  formData.status === 'scheduled' ? 'text-blue-400' : 'text-gray-400'
                }`}>
                  Scheduled
                </p>
              </button>

              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, status: 'completed' }))}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.status === 'completed'
                    ? 'border-green-500 bg-green-500/20'
                    : 'border-dark-800 hover:border-green-500/50'
                }`}
              >
                <CheckCircle size={24} className={`mx-auto mb-2 ${
                  formData.status === 'completed' ? 'text-green-500' : 'text-gray-400'
                }`} />
                <p className={`text-sm font-medium ${
                  formData.status === 'completed' ? 'text-green-400' : 'text-gray-400'
                }`}>
                  Completed
                </p>
              </button>
            </div>
          </div>

          {/* Scheduled Date (if scheduled) */}
          {formData.status === 'scheduled' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Calendar size={16} className="inline mr-2" />
                Scheduled Date
              </label>
              <input
                type="date"
                name="scheduledDate"
                value={formData.scheduledDate}
                onChange={handleChange}
                className="input-field"
              />
            </div>
          )}

          {/* Completed Date (if completed) */}
          {formData.status === 'completed' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Calendar size={16} className="inline mr-2" />
                Completed Date
              </label>
              <input
                type="date"
                name="completedDate"
                value={formData.completedDate}
                onChange={handleChange}
                className="input-field"
              />
            </div>
          )}

          {/* Summary */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Phone size={16} className="inline mr-2" />
              Call Summary {formData.status === 'completed' && '*'}
            </label>
            <textarea
              name="summary"
              value={formData.summary}
              onChange={handleChange}
              rows={4}
              placeholder="Provide a summary of the HR discussion..."
              className="input-field resize-none"
              required={formData.status === 'completed'}
            />
          </div>

          {/* Decision (if completed) */}
          {formData.status === 'completed' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Final Decision *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, decision: 'move-to-onboarding' }))}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.decision === 'move-to-onboarding'
                      ? 'border-green-500 bg-green-500/20'
                      : 'border-dark-800 hover:border-green-500/50'
                  }`}
                >
                  <UserPlus size={24} className={`mx-auto mb-2 ${
                    formData.decision === 'move-to-onboarding' ? 'text-green-500' : 'text-gray-400'
                  }`} />
                  <p className={`text-sm font-medium ${
                    formData.decision === 'move-to-onboarding' ? 'text-green-400' : 'text-gray-400'
                  }`}>
                    Onboarding
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, decision: 'reject' }))}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.decision === 'reject'
                      ? 'border-red-500 bg-red-500/20'
                      : 'border-dark-800 hover:border-red-500/50'
                  }`}
                >
                  <XCircle size={24} className={`mx-auto mb-2 ${
                    formData.decision === 'reject' ? 'text-red-500' : 'text-gray-400'
                  }`} />
                  <p className={`text-sm font-medium ${
                    formData.decision === 'reject' ? 'text-red-400' : 'text-gray-400'
                  }`}>
                    Reject
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, decision: 'on-hold' }))}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.decision === 'on-hold'
                      ? 'border-yellow-500 bg-yellow-500/20'
                      : 'border-dark-800 hover:border-yellow-500/50'
                  }`}
                >
                  <Clock size={24} className={`mx-auto mb-2 ${
                    formData.decision === 'on-hold' ? 'text-yellow-500' : 'text-gray-400'
                  }`} />
                  <p className={`text-sm font-medium ${
                    formData.decision === 'on-hold' ? 'text-yellow-400' : 'text-gray-400'
                  }`}>
                    On Hold
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, decision: 'pending' }))}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.decision === 'pending'
                      ? 'border-blue-500 bg-blue-500/20'
                      : 'border-dark-800 hover:border-blue-500/50'
                  }`}
                >
                  <Clock size={24} className={`mx-auto mb-2 ${
                    formData.decision === 'pending' ? 'text-blue-500' : 'text-gray-400'
                  }`} />
                  <p className={`text-sm font-medium ${
                    formData.decision === 'pending' ? 'text-blue-400' : 'text-gray-400'
                  }`}>
                    Pending
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* Warning for decisions */}
          {formData.decision === 'move-to-onboarding' && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <p className="text-sm text-green-400">
                ✓ Candidate will be moved to offer-accepted stage and can be moved to onboarding
              </p>
            </div>
          )}
          {formData.decision === 'reject' && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <p className="text-sm text-red-400">
                ⚠ Candidate will be marked as rejected
              </p>
            </div>
          )}

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
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  <span>Save HR Call</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HRCallModal;
