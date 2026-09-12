import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, MapPin, Link, Plus, X, Search, Video, Building } from 'lucide-react';
import toast from '../../utils/toast';
import api from '../../api/axios';

const ScheduleMeeting = () => {
  const [loading, setLoading] = useState(false);
  const [meetings, setMeetings] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    meetingDate: '',
    startTime: '',
    duration: 30,
    meetingType: 'online',
    location: '',
    meetingLink: '',
    attendees: []
  });

  useEffect(() => {
    fetchMeetings();
    fetchEmployees();
  }, []);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/manager/meetings');
      if (response.data.success) {
        setMeetings(response.data.data || []);
      } else {
        setMeetings([]);
      }
    } catch (error) {
      console.error('Error fetching meetings:', error);
      // Do not fall back to mock data — show empty state
      setMeetings([]);
    } finally {
      setLoading(false);
    }
  };


  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      if (response.data.success) {
        setEmployees(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.meetingDate || !formData.startTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.meetingType === 'online' && !formData.meetingLink) {
      toast.error('Meeting link is required for online meetings');
      return;
    }

    if (formData.meetingType === 'offline' && !formData.location) {
      toast.error('Location is required for offline meetings');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/api/manager/meetings', formData);
      if (response.data.success) {
        toast.success('Meeting scheduled successfully');
        await fetchMeetings();
        setFormData({ title: '', description: '', meetingDate: '', startTime: '', duration: 30, meetingType: 'online', location: '', meetingLink: '', attendees: [] });
        setShowModal(false);
      }
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      toast.error(error.response?.data?.message || 'Failed to schedule meeting');
    } finally {
      setLoading(false);
    }
  };


  const handleAttendeeToggle = (employeeId) => {
    setFormData(prev => ({
      ...prev,
      attendees: prev.attendees.includes(employeeId)
        ? prev.attendees.filter(id => id !== employeeId)
        : [...prev.attendees, employeeId]
    }));
  };

  const filteredEmployees = employees.filter(emp =>
    emp.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="min-h-screen bg-[#1E1E2A] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Calendar className="w-8 h-8 text-[#A88BFF]" />
              Schedule Meeting
            </h1>
            <p className="text-gray-400 mt-1">Schedule and manage team meetings</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#A88BFF] to-[#8B6FE8] text-white rounded-xl hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Schedule Meeting</span>
          </button>
        </div>

        {/* Meetings List */}
        <div className="bg-[#2A2A3A] rounded-2xl border border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white">Upcoming Meetings</h2>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-[#A88BFF] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : meetings.length > 0 ? (
            <div className="divide-y divide-gray-700">
              {meetings.map((meeting) => (
                <div key={meeting._id} className="p-6 hover:bg-[#1E1E2A]/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{meeting.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          meeting.status === 'scheduled' 
                            ? 'bg-blue-500/20 text-blue-300' 
                            : 'bg-gray-500/20 text-gray-300'
                        }`}>
                          {meeting.status}
                        </span>
                      </div>
                      
                      {meeting.description && (
                        <p className="text-gray-400 mb-3">{meeting.description}</p>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-300">
                          <Calendar className="w-4 h-4 text-[#A88BFF]" />
                          <span>{formatDate(meeting.meetingDate)}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-gray-300">
                          <Clock className="w-4 h-4 text-[#A88BFF]" />
                          <span>{formatTime(meeting.startTime)} ({meeting.duration} min)</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-gray-300">
                          {meeting.meetingType === 'online' ? (
                            <>
                              <Video className="w-4 h-4 text-[#A88BFF]" />
                              <span>Online Meeting</span>
                            </>
                          ) : (
                            <>
                              <Building className="w-4 h-4 text-[#A88BFF]" />
                              <span>{meeting.location}</span>
                            </>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 text-gray-300">
                          <Users className="w-4 h-4 text-[#A88BFF]" />
                          <span>{meeting.attendees.length} attendees</span>
                        </div>
                      </div>
                      
                      {meeting.meetingLink && (
                        <div className="mt-3">
                          <a
                            href={meeting.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-[#A88BFF] hover:text-[#B89CFF] transition-colors"
                          >
                            <Link className="w-4 h-4" />
                            <span className="text-sm">Join Meeting</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No meetings scheduled</h3>
              <p className="text-gray-400 mb-6">Get started by scheduling your first team meeting</p>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#A88BFF] text-white rounded-lg hover:bg-[#B89CFF] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Schedule Meeting
              </button>
            </div>
          )}
        </div>

        {/* Schedule Meeting Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#2A2A3A] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700">
              <div className="sticky top-0 bg-[#2A2A3A] border-b border-gray-700 p-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Schedule New Meeting</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Meeting Details */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Meeting Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full bg-[#1E1E2A] border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-[#A88BFF] focus:outline-none transition-colors"
                      placeholder="Enter meeting title"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full bg-[#1E1E2A] border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-[#A88BFF] focus:outline-none transition-colors resize-none"
                      rows={3}
                      placeholder="Enter meeting description (optional)"
                    />
                  </div>
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={formData.meetingDate}
                      onChange={(e) => setFormData({ ...formData, meetingDate: e.target.value })}
                      className="w-full bg-[#1E1E2A] border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-[#A88BFF] focus:outline-none transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Start Time *
                    </label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="w-full bg-[#1E1E2A] border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-[#A88BFF] focus:outline-none transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Duration (minutes)
                    </label>
                    <select
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                      className="w-full bg-[#1E1E2A] border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-[#A88BFF] focus:outline-none transition-colors"
                    >
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={45}>45 minutes</option>
                      <option value={60}>1 hour</option>
                      <option value={90}>1.5 hours</option>
                      <option value={120}>2 hours</option>
                    </select>
                  </div>
                </div>

                {/* Meeting Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Meeting Type *
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, meetingType: 'online' })}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.meetingType === 'online'
                          ? 'border-[#A88BFF] bg-[#A88BFF]/10'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <Video className="w-6 h-6 mx-auto mb-2 text-[#A88BFF]" />
                      <span className="text-white font-medium">Online Meeting</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, meetingType: 'offline' })}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        formData.meetingType === 'offline'
                          ? 'border-[#A88BFF] bg-[#A88BFF]/10'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <Building className="w-6 h-6 mx-auto mb-2 text-[#A88BFF]" />
                      <span className="text-white font-medium">In-Person Meeting</span>
                    </button>
                  </div>
                </div>

                {/* Meeting Link or Location */}
                {formData.meetingType === 'online' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Meeting Link *
                    </label>
                    <input
                      type="url"
                      value={formData.meetingLink}
                      onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                      className="w-full bg-[#1E1E2A] border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-[#A88BFF] focus:outline-none transition-colors"
                      placeholder="https://zoom.us/j/..."
                      required={formData.meetingType === 'online'}
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Location *
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full bg-[#1E1E2A] border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-[#A88BFF] focus:outline-none transition-colors"
                      placeholder="Conference Room A"
                      required={formData.meetingType === 'offline'}
                    />
                  </div>
                )}

                {/* Attendees */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Attendees
                  </label>
                  <div className="mb-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#1E1E2A] border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white focus:border-[#A88BFF] focus:outline-none transition-colors"
                        placeholder="Search employees..."
                      />
                    </div>
                  </div>
                  
                  <div className="max-h-48 overflow-y-auto bg-[#1E1E2A] rounded-lg border border-gray-700">
                    {filteredEmployees.map((employee) => (
                      <label
                        key={employee._id}
                        className="flex items-center p-3 hover:bg-[#2A2A3A] cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.attendees.includes(employee._id)}
                          onChange={() => handleAttendeeToggle(employee._id)}
                          className="w-4 h-4 text-[#A88BFF] bg-gray-700 border-gray-600 rounded focus:ring-[#A88BFF]"
                        />
                        <div className="ml-3">
                          <p className="text-white font-medium">
                            {employee.firstName} {employee.lastName}
                          </p>
                          <p className="text-sm text-gray-400">{employee.email}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                  
                  {formData.attendees.length > 0 && (
                    <p className="mt-2 text-sm text-gray-400">
                      {formData.attendees.length} employee(s) selected
                    </p>
                  )}
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-[#A88BFF] to-[#8B6FE8] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {loading ? 'Scheduling...' : 'Schedule Meeting'}
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

export default ScheduleMeeting;
