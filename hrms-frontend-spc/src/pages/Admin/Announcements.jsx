import React, { useState, useEffect } from 'react';
import { MessageSquare, Plus, X, Edit2, Trash2, Send, Calendar, Users, Eye, Bell, Megaphone } from 'lucide-react';
import toast from '../../utils/toast';
import api from '../../api/axios';

const Announcements = () => {
  const [loading, setLoading] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    priority: 'normal',
    targetAudience: 'all',
    scheduledFor: '',
    isActive: true
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/announcements');
      if (response.data.success) {
        setAnnouncements(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toast.error('Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      
      if (editingAnnouncement) {
        const response = await api.put(`/api/announcements/${editingAnnouncement._id}`, formData);
        if (response.data.success) {
          toast.success('Announcement updated successfully');
          await fetchAnnouncements();
        }
      } else {
        const response = await api.post('/api/announcements', formData);
        if (response.data.success) {
          toast.success('Announcement created successfully');
          await fetchAnnouncements();
        }
      }
      
      setFormData({ title: '', message: '', priority: 'normal', targetAudience: 'all', scheduledFor: '', isActive: true });
      setEditingAnnouncement(null);
      setShowModal(false);
    } catch (error) {
      console.error('Error saving announcement:', error);
      toast.error(error.response?.data?.message || 'Failed to save announcement');
    } finally {
      setLoading(false);
    }
  };


  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      message: announcement.message,
      priority: announcement.priority,
      targetAudience: announcement.targetAudience,
      scheduledFor: announcement.scheduledFor,
      isActive: announcement.isActive
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        await api.delete(`/api/announcements/${id}`);
        setAnnouncements(announcements.filter(ann => ann._id !== id));
        toast.success('Announcement deleted successfully');
      } catch (error) {
        console.error('Error deleting announcement:', error);
        toast.error('Failed to delete announcement');
      }
    }
  };


  const handleToggleStatus = async (id) => {
    try {
      const target = announcements.find(ann => ann._id === id);
      if (!target) return;
      const response = await api.put(`/api/announcements/${id}`, { isActive: !target.isActive });
      if (response.data.success) {
        setAnnouncements(announcements.map(ann =>
          ann._id === id ? { ...ann, isActive: !ann.isActive } : ann
        ));
        toast.success(`Announcement ${!target.isActive ? 'activated' : 'deactivated'}`);
      }
    } catch (error) {
      console.error('Error toggling announcement status:', error);
      toast.error('Failed to update announcement status');
    }
  };


  const getPriorityBadge = (priority) => {
    const badges = {
      urgent: 'bg-red-500/20 text-red-300 border-red-500/30',
      high: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      normal: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      low: 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    };
    return badges[priority] || badges.normal;
  };

  const getAudienceBadge = (audience) => {
    const badges = {
      all: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      employees: 'bg-green-500/20 text-green-300 border-green-500/30',
      managers: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      admins: 'bg-red-500/20 text-red-300 border-red-500/30'
    };
    return badges[audience] || badges.all;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const stats = {
    total: announcements.length,
    active: announcements.filter(ann => ann.isActive).length,
    totalViews: announcements.reduce((sum, ann) => sum + ann.views, 0),
    totalRecipients: announcements.reduce((sum, ann) => sum + ann.recipients, 0)
  };

  return (
    <div className="min-h-screen bg-[#1E1E2A] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Megaphone className="w-8 h-8 text-[#A88BFF]" />
              Announcements
            </h1>
            <p className="text-gray-400 mt-1">Manage company announcements and communications</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#A88BFF] to-[#8B6FE8] text-white rounded-xl hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>New Announcement</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#2A2A3A] rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-sm">Total Announcements</p>
              <MessageSquare className="w-5 h-5 text-[#A88BFF]" />
            </div>
            <h3 className="text-2xl font-bold text-white">{stats.total}</h3>
          </div>

          <div className="bg-[#2A2A3A] rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-sm">Active</p>
              <Bell className="w-5 h-5 text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-white">{stats.active}</h3>
          </div>

          <div className="bg-[#2A2A3A] rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-sm">Total Views</p>
              <Eye className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold text-white">{stats.totalViews}</h3>
          </div>

          <div className="bg-[#2A2A3A] rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-sm">Recipients</p>
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold text-white">{stats.totalRecipients}</h3>
          </div>
        </div>

        {/* Announcements List */}
        <div className="bg-[#2A2A3A] rounded-2xl border border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white">All Announcements</h2>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-[#A88BFF] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : announcements.length > 0 ? (
            <div className="divide-y divide-gray-700">
              {announcements.map((announcement) => (
                <div key={announcement._id} className="p-6 hover:bg-[#1E1E2A]/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{announcement.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityBadge(announcement.priority)}`}>
                          {announcement.priority}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getAudienceBadge(announcement.targetAudience)}`}>
                          {announcement.targetAudience}
                        </span>
                        {!announcement.isActive && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-300 border-gray-500/30">
                            Inactive
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-300 mb-4 leading-relaxed">{announcement.message}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Created: {formatDate(announcement.createdAt)}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>{announcement.recipients} recipients</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          <span>{announcement.views} views</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          <span>By {announcement.createdBy}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleToggleStatus(announcement._id)}
                        className={`p-2 rounded-lg transition-colors ${
                          announcement.isActive
                            ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                            : 'bg-gray-500/10 text-gray-400 hover:bg-gray-500/20'
                        }`}
                        title={announcement.isActive ? 'Deactivate' : 'Activate'}
                      >
                        <Bell className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleEdit(announcement)}
                        className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDelete(announcement._id)}
                        className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Megaphone className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No announcements yet</h3>
              <p className="text-gray-400 mb-6">Create your first announcement to keep everyone informed</p>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#A88BFF] text-white rounded-lg hover:bg-[#B89CFF] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Announcement
              </button>
            </div>
          )}
        </div>

        {/* Create/Edit Announcement Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#2A2A3A] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700">
              <div className="sticky top-0 bg-[#2A2A3A] border-b border-gray-700 p-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">
                  {editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingAnnouncement(null);
                    setFormData({
                      title: '',
                      message: '',
                      priority: 'normal',
                      targetAudience: 'all',
                      scheduledFor: '',
                      isActive: true
                    });
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-[#1E1E2A] border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-[#A88BFF] focus:outline-none transition-colors"
                    placeholder="Enter announcement title"
                    required
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Message *
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-[#1E1E2A] border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-[#A88BFF] focus:outline-none transition-colors resize-none"
                    rows={6}
                    placeholder="Enter your announcement message..."
                    required
                  />
                </div>

                {/* Priority and Audience */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full bg-[#1E1E2A] border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-[#A88BFF] focus:outline-none transition-colors"
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Target Audience
                    </label>
                    <select
                      value={formData.targetAudience}
                      onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                      className="w-full bg-[#1E1E2A] border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-[#A88BFF] focus:outline-none transition-colors"
                    >
                      <option value="all">All Users</option>
                      <option value="employees">Employees Only</option>
                      <option value="managers">Managers Only</option>
                      <option value="admins">Admins Only</option>
                    </select>
                  </div>
                </div>

                {/* Schedule */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Schedule For (optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.scheduledFor}
                    onChange={(e) => setFormData({ ...formData, scheduledFor: e.target.value })}
                    className="w-full bg-[#1E1E2A] border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-[#A88BFF] focus:outline-none transition-colors"
                  />
                  <p className="text-xs text-gray-400 mt-1">Leave empty to publish immediately</p>
                </div>

                {/* Active Status */}
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-[#A88BFF] bg-gray-700 border-gray-600 rounded focus:ring-[#A88BFF]"
                  />
                  <label htmlFor="isActive" className="text-sm text-gray-300">
                    Publish immediately (active)
                  </label>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingAnnouncement(null);
                      setFormData({
                        title: '',
                        message: '',
                        priority: 'normal',
                        targetAudience: 'all',
                        scheduledFor: '',
                        isActive: true
                      });
                    }}
                    className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-[#A88BFF] to-[#8B6FE8] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : (
                      <>
                        <Send className="w-4 h-4 inline mr-2" />
                        {editingAnnouncement ? 'Update Announcement' : 'Publish Announcement'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Announcements;
