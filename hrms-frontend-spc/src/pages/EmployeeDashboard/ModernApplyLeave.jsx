import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { applyLeave, getLeaveApplications } from '../../api/employeeDashboard';
import toast from '../../utils/toast';
import BottomNavigation from '../../components/BottomNavigation';
import { ArrowLeft, Calendar, ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';

const ModernApplyLeave = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [upcomingLeaves, setUpcomingLeaves] = useState([]);
  const [formData, setFormData] = useState({
    leaveType: '',
    reason: '',
    notifyTeammates: []
  });

  useEffect(() => {
    fetchUpcomingLeaves();
  }, []);

  const fetchUpcomingLeaves = async () => {
    try {
      const response = await getLeaveApplications({ status: 'approved' });
      const upcoming = response.data.filter(leave => new Date(leave.startDate) >= new Date());
      setUpcomingLeaves(upcoming.slice(0, 5));
    } catch (error) {
      console.error('Error fetching upcoming leaves:', error);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const isDateSelected = (day) => {
    if (!day) return false;
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    if (startDate && !endDate) {
      return date.toDateString() === startDate.toDateString();
    }
    if (startDate && endDate) {
      return date >= startDate && date <= endDate;
    }
    return false;
  };

  const isDateInRange = (day) => {
    if (!day || !startDate || !endDate) return false;
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return date > startDate && date < endDate;
  };

  const handleDateClick = (day) => {
    const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    
    if (!startDate || (startDate && endDate)) {
      setStartDate(selectedDate);
      setEndDate(null);
    } else if (selectedDate >= startDate) {
      setEndDate(selectedDate);
    } else {
      setStartDate(selectedDate);
      setEndDate(null);
    }
  };

  const calculateDays = () => {
    if (!startDate || !endDate) return startDate ? 1 : 0;
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const handleSubmit = async () => {
    if (!formData.leaveType || !startDate || !endDate) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      await applyLeave({
        leaveType: formData.leaveType,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        reason: formData.reason,
        notifyTeammates: formData.notifyTeammates
      });
      toast.success('Leave application submitted successfully!');
      navigate('/employee/leave/balance');
    } catch (error) {
      console.error('Error applying for leave:', error);
      toast.error(error.response?.data?.message || 'Failed to submit leave application');
    } finally {
      setLoading(false);
    }
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: startingDayOfWeek }, (_, i) => null);
  const calendarDays = [...blanks, ...days];

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const leaveTypes = [
    'Personal Leave',
    'Sick Leave',
    'Comp Offs',
    'Floater Leave',
    'Marriage Leave',
    'Maternity Leave',
    'Unpaid Leave'
  ];

  return (
    <div className="min-h-screen bg-[#1E1E2A] p-4 md:p-6 pb-24 md:pb-6">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#1E1E2A] border-b border-gray-800 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => step === 1 ? navigate('/employee/home') : setStep(1)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-white text-xl font-bold">
              {step === 1 ? 'Select Date' : 'Apply Leave'}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {step === 1 ? (
          <>
            {/* Date Selection */}
            <div className="bg-[#2A2A3A] rounded-2xl p-6 border border-gray-700 mb-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Start Date</label>
                  <div className="bg-[#1E1E2A] rounded-xl p-4 border border-gray-700">
                    <p className="text-white font-semibold">
                      {startDate ? startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Select date'}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">End Date</label>
                  <div className="bg-[#1E1E2A] rounded-xl p-4 border border-gray-700">
                    <p className="text-white font-semibold">
                      {endDate ? endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Select date'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Calendar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => setCurrentMonth(new Date(year, month - 1))}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <h3 className="text-white text-lg font-semibold">
                    {monthNames[month]} {year}
                  </h3>
                  <button
                    onClick={() => setCurrentMonth(new Date(year, month + 1))}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {dayNames.map((day) => (
                    <div key={day} className="text-center text-gray-400 text-sm font-medium py-2">
                      {day}
                    </div>
                  ))}
                  {calendarDays.map((day, index) => (
                    <button
                      key={index}
                      onClick={() => day && handleDateClick(day)}
                      disabled={!day}
                      className={`aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-all ${
                        !day
                          ? 'invisible'
                          : isDateSelected(day) && startDate && endDate
                          ? 'bg-gradient-to-br from-[#A88BFF] to-[#8B6FE8] text-white'
                          : isDateSelected(day)
                          ? 'bg-[#A88BFF] text-white'
                          : isDateInRange(day)
                          ? 'bg-[#A88BFF]/30 text-white'
                          : 'bg-[#1E1E2A] text-gray-400 hover:bg-[#A88BFF]/20 hover:text-white'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Upcoming Leaves */}
            {upcomingLeaves.length > 0 && (
              <div className="bg-[#2A2A3A] rounded-2xl p-6 border border-gray-700 mb-6">
                <h3 className="text-white text-lg font-semibold mb-4">Upcoming Leaves</h3>
                <div className="space-y-3">
                  {upcomingLeaves.map((leave, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-[#1E1E2A] rounded-xl">
                      <div>
                        <p className="text-white font-medium">{leave.leaveType}</p>
                        <p className="text-gray-400 text-sm">
                          {new Date(leave.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - 
                          {new Date(leave.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      <span className="text-[#A88BFF] text-sm font-medium">
                        {leave.numberOfDays} {leave.numberOfDays === 1 ? 'day' : 'days'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-[#2A2A3A] border-t border-gray-700 p-4">
              <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Leave request is for</p>
                  <p className="text-white text-lg font-bold">
                    {calculateDays()} {calculateDays() === 1 ? 'Day' : 'Days'}
                  </p>
                </div>
                <button
                  onClick={() => setStep(2)}
                  disabled={!startDate || !endDate}
                  className={`px-8 py-3 rounded-2xl font-semibold transition-all ${
                    startDate && endDate
                      ? 'bg-gradient-to-r from-[#A88BFF] to-[#8B6FE8] text-white hover:shadow-lg'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  NEXT
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Leave Application Form */}
            <div className="bg-[#2A2A3A] rounded-2xl p-6 border border-gray-700 mb-24">
              <div className="space-y-6">
                {/* Leave Type */}
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Leave Type *</label>
                  <select
                    value={formData.leaveType}
                    onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                    className="w-full bg-[#1E1E2A] text-white px-4 py-3 rounded-xl border border-gray-700 focus:border-[#A88BFF] focus:outline-none"
                  >
                    <option value="">Select leave type</option>
                    {leaveTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Date Summary */}
                <div className="bg-[#1E1E2A] rounded-xl p-4 border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Duration</p>
                      <p className="text-white font-semibold">
                        {startDate?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - 
                        {endDate?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[#A88BFF] text-2xl font-bold">{calculateDays()}</p>
                      <p className="text-gray-400 text-sm">days</p>
                    </div>
                  </div>
                </div>

                {/* Note to Approver */}
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Note to Approver</label>
                  <textarea
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    placeholder="Add a reason for your leave..."
                    rows={4}
                    className="w-full bg-[#1E1E2A] text-white px-4 py-3 rounded-xl border border-gray-700 focus:border-[#A88BFF] focus:outline-none resize-none"
                  />
                </div>

                {/* Notify Teammates */}
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Notify your teammates</label>
                  <button className="w-full bg-[#1E1E2A] text-gray-400 px-4 py-3 rounded-xl border border-gray-700 hover:border-[#A88BFF] transition-colors flex items-center justify-center space-x-2">
                    <Plus className="w-5 h-5" />
                    <span>Add teammates to notify</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="fixed bottom-0 left-0 right-0 bg-[#2A2A3A] border-t border-gray-700 p-4">
              <div className="max-w-7xl mx-auto">
                <button
                  onClick={handleSubmit}
                  disabled={loading || !formData.leaveType}
                  className={`w-full py-4 rounded-2xl font-semibold transition-all ${
                    loading || !formData.leaveType
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#A88BFF] to-[#8B6FE8] text-white hover:shadow-lg'
                  }`}
                >
                  {loading ? 'Submitting...' : 'Request Leave'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default ModernApplyLeave;
