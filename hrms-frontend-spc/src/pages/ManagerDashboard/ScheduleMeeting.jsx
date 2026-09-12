import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavigation from '../../components/BottomNavigation';
import { config } from '../../config/api.config';
import { ArrowLeft, Calendar, Clock, Users, MapPin, Video, Link2 } from 'lucide-react';
import toast from '../../utils/toast';

const ScheduleMeeting = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: '30',
    meetingType: 'online',
    location: '',
    meetingLink: '',
    selectedAttendees: []
  });

  const [teamMembers, setTeamMembers] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Fetch team members from API
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${config.apiBaseUrl}/manager/team-members`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (data.success) {
          // Format data for display
          const formattedMembers = data.data.map(member => ({
            id: member._id,
            name: `${member.firstName} ${member.lastName}`,
            designation: member.designation || 'Employee'
          }));
          setTeamMembers(formattedMembers);
        }
      } catch (error) {
        console.error('Error fetching team members:', error);
      }
    };

    fetchTeamMembers();
  }, []);

  const handleAttendeeToggle = (attendeeId) => {
    setFormData(prev => ({
      ...prev,
      selectedAttendees: prev.selectedAttendees.includes(attendeeId)
        ? prev.selectedAttendees.filter(id => id !== attendeeId)
        : [...prev.selectedAttendees, attendeeId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.meetingType === 'online' && !formData.meetingLink.trim()) {
      toast.error('Please provide a meeting link for online meetings');
      return;
    }

    if (formData.meetingType === 'offline' && !formData.location.trim()) {
      toast.error('Please specify meeting location for offline meetings');
      return;
    }

    if (formData.selectedAttendees.length === 0) {
      toast.error('Select at least one attendee');
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token missing');
        return;
      }

      const payload = {
        title: formData.title,
        description: formData.description,
        meetingDate: formData.date,
        startTime: formData.time,
        duration: Number(formData.duration),
        meetingType: formData.meetingType,
        location: formData.meetingType === 'offline' ? formData.location : undefined,
        meetingLink: formData.meetingType === 'online' ? formData.meetingLink : undefined,
        attendees: formData.selectedAttendees
      };

      const response = await fetch(`${config.apiBaseUrl}/manager/meetings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Meeting scheduled successfully');
        navigate('/manager/dashboard');
      } else {
        toast.error(data.message || 'Failed to schedule meeting');
      }
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      toast.error('Failed to schedule meeting');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1E1E2A] p-4 md:p-6 pb-24 md:pb-6">
      <div className="sticky top-0 z-10 bg-[#1E1E2A] border-b border-gray-800 px-4 py-4 -mx-4 mb-6">
        <div className="max-w-3xl mx-auto flex items-center space-x-4">
          <button onClick={() => navigate('/manager/dashboard')} className="text-gray-400 hover:text-white">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">Schedule Meeting</h1>
            <p className="text-gray-400 text-sm">Create a new team meeting</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-[#2A2A3A] rounded-2xl p-6 border border-gray-700 space-y-4">
            <div>
              <label className="text-gray-400 text-sm mb-2 block">Meeting Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="e.g., Sprint Planning, Team Standup"
                className="w-full bg-[#1E1E2A] text-white p-4 rounded-xl border border-gray-700 focus:border-[#A88BFF] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-gray-400 text-sm mb-2 block">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Meeting agenda and objectives"
                className="w-full bg-[#1E1E2A] text-white p-4 rounded-xl border border-gray-700 focus:border-[#A88BFF] focus:outline-none min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Date *</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full bg-[#1E1E2A] text-white p-4 rounded-xl border border-gray-700 focus:border-[#A88BFF] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-2 block">Time *</label>
                <input
                  type="time"
                  required
                  value={formData.time}
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                  className="w-full bg-[#1E1E2A] text-white p-4 rounded-xl border border-gray-700 focus:border-[#A88BFF] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Duration (minutes)</label>
                <select
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  className="w-full bg-[#1E1E2A] text-white p-4 rounded-xl border border-gray-700 focus:border-[#A88BFF] focus:outline-none"
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="90">1.5 hours</option>
                  <option value="120">2 hours</option>
                </select>
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-2 block">Meeting Type</label>
                <select
                  value={formData.meetingType}
                  onChange={(e) => setFormData({...formData, meetingType: e.target.value})}
                  className="w-full bg-[#1E1E2A] text-white p-4 rounded-xl border border-gray-700 focus:border-[#A88BFF] focus:outline-none"
                >
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
            </div>

            {formData.meetingType === 'offline' && (
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="Meeting room or location"
                  className="w-full bg-[#1E1E2A] text-white p-4 rounded-xl border border-gray-700 focus:border-[#A88BFF] focus:outline-none"
                />
              </div>
            )}
            {formData.meetingType === 'online' && (
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Meeting Link *</label>
                <div className="flex items-center space-x-3 bg-[#1E1E2A] text-white p-4 rounded-xl border border-gray-700 focus-within:border-[#A88BFF]">
                  <Link2 className="w-5 h-5 text-[#A88BFF]" />
                  <input
                    type="url"
                    required
                    value={formData.meetingLink}
                    onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                    placeholder="https://meet.google.com/..."
                    className="bg-transparent flex-1 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="bg-[#2A2A3A] rounded-2xl p-6 border border-gray-700">
            <h3 className="text-white font-semibold mb-4">Select Attendees ({formData.selectedAttendees.length})</h3>
            <div className="space-y-2">
              {teamMembers.map((member) => (
                <label
                  key={member.id}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                    formData.selectedAttendees.includes(member.id)
                      ? 'bg-[#A88BFF]/20 border border-[#A88BFF]'
                      : 'bg-[#1E1E2A] hover:bg-[#1E1E2A]/50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.selectedAttendees.includes(member.id)}
                      onChange={() => handleAttendeeToggle(member.id)}
                      className="w-5 h-5 rounded accent-[#A88BFF]"
                    />
                    <div>
                      <p className="text-white font-medium">{member.name}</p>
                      <p className="text-gray-400 text-sm">{member.designation}</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={
              submitting ||
              formData.selectedAttendees.length === 0 ||
              !formData.title.trim() ||
              !formData.date ||
              !formData.time ||
              (formData.meetingType === 'online' && !formData.meetingLink.trim()) ||
              (formData.meetingType === 'offline' && !formData.location.trim())
            }
            className="w-full bg-gradient-to-r from-[#A88BFF] to-[#8B6FE8] text-white py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Scheduling...' : 'Schedule Meeting'}
          </button>
        </form>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default ScheduleMeeting;
