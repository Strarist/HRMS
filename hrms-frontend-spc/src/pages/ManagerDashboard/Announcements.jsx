import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavigation from '../../components/BottomNavigation';
import { ArrowLeft, MessageSquare, Bell, Send, Trash2, Loader2 } from 'lucide-react';
import api from '../../api/axios';
import toast from '../../utils/toast';

const Announcements = () => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    priority: 'normal',
    sendTo: 'team'
  });

  const [announcements, setAnnouncements] = useState([]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/announcements');
      if (response.data.success) {
        setAnnouncements(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title?.trim() || !formData.message?.trim()) {
      toast.error('Please fill in title and message');
      return;
    }
    try {
      setSubmitting(true);
      const targetAudience = formData.sendTo === 'company' ? 'all' : (formData.sendTo === 'managers' ? 'managers' : 'employees');
      const payload = {
        title: formData.title.trim(),
        message: formData.message.trim(),
        priority: formData.priority,
        targetAudience
      };
      const response = await api.post('/api/announcements', payload);
      if (response.data.success) {
        toast.success('Announcement published successfully');
        setFormData({ title: '', message: '', priority: 'normal', sendTo: 'team' });
        setShowForm(false);
        await fetchAnnouncements();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create announcement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await api.delete(`/api/announcements/${id}`);
      if (response.data.success) {
        toast.success('Announcement removed');
        setAnnouncements(prev => prev.filter(a => (a._id || a.id) !== id));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete announcement');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/20 text-red-400';
      case 'normal':
        return 'bg-blue-500/20 text-blue-400';
      case 'low':
        return 'bg-gray-500/20 text-gray-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-[#1E1E2A] p-4 md:p-6 pb-24 md:pb-6">
      <div className="sticky top-0 z-10 bg-[#1E1E2A] border-b border-gray-800 px-4 py-4 -mx-4 mb-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={() => navigate('/manager/dashboard')} className="text-gray-400 hover:text-white">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">Announcements</h1>
              <p className="text-gray-400 text-sm">Create and manage team announcements</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#A88BFF] to-[#8B6FE8] text-white rounded-xl hover:shadow-lg transition-all"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="hidden md:inline">New</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {showForm && (
          <div className="bg-[#2A2A3A] rounded-2xl p-6 border border-gray-700">
            <h3 className="text-white text-lg font-semibold mb-4">Create Announcement</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Announcement title"
                  className="w-full bg-[#1E1E2A] text-white p-4 rounded-xl border border-gray-700 focus:border-[#A88BFF] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-2 block">Message *</label>
                <textarea
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  placeholder="Write your announcement message..."
                  className="w-full bg-[#1E1E2A] text-white p-4 rounded-xl border border-gray-700 focus:border-[#A88BFF] focus:outline-none min-h-[120px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    className="w-full bg-[#1E1E2A] text-white p-4 rounded-xl border border-gray-700 focus:border-[#A88BFF] focus:outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Send To</label>
                  <select
                    value={formData.sendTo}
                    onChange={(e) => setFormData({...formData, sendTo: e.target.value})}
                    className="w-full bg-[#1E1E2A] text-white p-4 rounded-xl border border-gray-700 focus:border-[#A88BFF] focus:outline-none"
                  >
                    <option value="team">My Team</option>
                    <option value="department">Entire Department</option>
                    <option value="company">All Employees</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-[#A88BFF] to-[#8B6FE8] text-white rounded-xl hover:shadow-lg transition-all font-semibold"
                >
                  <Send className="w-5 h-5" />
                  <span>Send Announcement</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-white font-semibold">Recent Announcements ({announcements.length})</h3>
          
          {loading ? (
            <div className="bg-[#2A2A3A] rounded-2xl p-12 border border-gray-700 text-center flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-[#A88BFF] animate-spin mb-3" />
              <p className="text-gray-400">Loading announcements...</p>
            </div>
          ) : announcements.length > 0 ? (
            announcements.map((announcement) => {
              const annId = announcement._id || announcement.id;
              const author = announcement.createdByName || announcement.createdByEmail || (typeof announcement.createdBy === 'string' ? announcement.createdBy : 'Management');
              return (
                <div key={annId} className="bg-[#2A2A3A] rounded-2xl p-6 border border-gray-700">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#A88BFF] to-[#8B6FE8] flex items-center justify-center flex-shrink-0">
                        <Bell className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-white font-semibold">{announcement.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(announcement.priority)}`}>
                            {(announcement.priority || 'normal').toUpperCase()}
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm mb-3 whitespace-pre-wrap">{announcement.message}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-400">
                          <span>By {author}</span>
                          <span>•</span>
                          <span>{new Date(announcement.createdAt || Date.now()).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(annId)}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete announcement"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-[#2A2A3A] rounded-2xl p-12 border border-gray-700 text-center">
              <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-white text-lg font-semibold mb-2">No Announcements</h3>
              <p className="text-gray-400">Create your first announcement to notify your team</p>
            </div>
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Announcements;
