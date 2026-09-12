import React, { useState } from 'react';
import { X, Star, MessageSquare, CheckCircle, XCircle, Clock, Loader } from 'lucide-react';
import api from '../api/axios';
import toast from '../utils/toast';

const InterviewFeedbackModal = ({ candidateId, interview, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    feedback: interview.feedback || '',
    rating: interview.rating || 0,
    decision: interview.decision || 'pending',
    notes: interview.notes || '',
    status: 'completed'
  });
  const [loading, setLoading] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.feedback || formData.rating === 0) {
      toast.error('Please provide feedback and rating');
      return;
    }

    try {
      setLoading(true);
      await api.put(`/candidates/${candidateId}/interview/${interview._id}/feedback`, formData);
      toast.success('Feedback submitted successfully');
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRatingClick = (rating) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-900 rounded-lg border border-dark-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-dark-900 border-b border-dark-800 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Interview Feedback</h2>
            <p className="text-sm text-gray-400 mt-1">
              {interview.interviewType} - {new Date(interview.scheduledDate).toLocaleDateString()}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Rating *
            </label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingClick(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    size={32}
                    className={`${
                      star <= (hoverRating || formData.rating)
                        ? 'text-yellow-500 fill-yellow-500'
                        : 'text-gray-600'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-4 text-white font-semibold">
                {formData.rating > 0 ? `${formData.rating}/5` : 'Not rated'}
              </span>
            </div>
          </div>

          {/* Feedback */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <MessageSquare size={16} className="inline mr-2" />
              Feedback Summary *
            </label>
            <textarea
              name="feedback"
              value={formData.feedback}
              onChange={handleChange}
              rows={4}
              placeholder="Provide detailed feedback about the candidate's performance..."
              className="input-field resize-none"
              required
            />
          </div>

          {/* Decision */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Decision *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, decision: 'selected' }))}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.decision === 'selected'
                    ? 'border-green-500 bg-green-500/20'
                    : 'border-dark-800 hover:border-green-500/50'
                }`}
              >
                <CheckCircle size={24} className={`mx-auto mb-2 ${
                  formData.decision === 'selected' ? 'text-green-500' : 'text-gray-400'
                }`} />
                <p className={`text-sm font-medium ${
                  formData.decision === 'selected' ? 'text-green-400' : 'text-gray-400'
                }`}>
                  Selected
                </p>
              </button>

              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, decision: 'rejected' }))}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.decision === 'rejected'
                    ? 'border-red-500 bg-red-500/20'
                    : 'border-dark-800 hover:border-red-500/50'
                }`}
              >
                <XCircle size={24} className={`mx-auto mb-2 ${
                  formData.decision === 'rejected' ? 'text-red-500' : 'text-gray-400'
                }`} />
                <p className={`text-sm font-medium ${
                  formData.decision === 'rejected' ? 'text-red-400' : 'text-gray-400'
                }`}>
                  Rejected
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

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Additional Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Any additional observations or comments..."
              className="input-field resize-none"
            />
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
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  <span>Submit Feedback</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InterviewFeedbackModal;
