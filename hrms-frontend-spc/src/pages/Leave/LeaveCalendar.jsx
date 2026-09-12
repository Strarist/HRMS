import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Filter, Users, X } from 'lucide-react';
import api from '../../api/axios';
import toast from '../../utils/toast';

const LeaveCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [filters, setFilters] = useState({
    department: '',
    leaveType: ''
  });
  const [departments, setDepartments] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  const leaveTypes = [
    'Personal Leave',
    'Sick Leave',
    'Casual Leave',
    'Comp Offs',
    'Floater Leave',
    'Marriage Leave',
    'Maternity Leave',
    'Paternity Leave',
    'Unpaid Leave'
  ];

  useEffect(() => {
    fetchDepartments();
    fetchLeaveCalendar();
  }, [currentDate, filters]);

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/departments');
      setDepartments(response.data.data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchLeaveCalendar = async () => {
    try {
      setLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const startDate = new Date(year, month, 1).toISOString();
      const endDate = new Date(year, month + 1, 0).toISOString();

      const params = {
        startDate,
        endDate,
        ...(filters.department && { department: filters.department }),
        ...(filters.leaveType && { leaveType: filters.leaveType })
      };

      const response = await api.get('/dashboard/leave-calendar', { params });
      setCalendarData(response.data.data?.calendar || {});
    } catch (error) {
      console.error('Error fetching leave calendar:', error);
      toast.error('Failed to load leave calendar');
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getLeavesForDate = (date) => {
    if (!date) return [];
    const dateKey = date.toISOString().split('T')[0];
    return calendarData[dateKey] || [];
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const days = getDaysInMonth();
  const selectedDateLeaves = selectedDate ? getLeavesForDate(selectedDate) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Leave Calendar</h1>
          <p className="text-gray-400 mt-1">View employees on leave by date</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="btn-outline flex items-center space-x-2"
        >
          <Filter size={18} />
          <span>Filters</span>
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Filters</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Department
              </label>
              <select
                value={filters.department}
                onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                className="input-field"
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                  <option key={dept._id} value={dept._id}>{dept.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Leave Type
              </label>
              <select
                value={filters.leaveType}
                onChange={(e) => setFilters({ ...filters, leaveType: e.target.value })}
                className="input-field"
              >
                <option value="">All Leave Types</option>
                {leaveTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Calendar */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-dark-800 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} className="text-gray-400" />
          </button>
          <h2 className="text-xl font-bold text-white">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-dark-800 rounded-lg transition-colors"
          >
            <ChevronRight size={20} className="text-gray-400" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-semibold text-gray-400 py-2">
                  {day}
                </div>
              ))}
              {days.map((date, index) => {
                const leaves = getLeavesForDate(date);
                const isCurrentDay = isToday(date);
                
                return (
                  <div
                    key={index}
                    onClick={() => date && setSelectedDate(date)}
                    className={`
                      min-h-[80px] p-2 rounded-lg border transition-all cursor-pointer
                      ${!date ? 'border-transparent' : 'border-dark-800 hover:border-primary-600'}
                      ${isCurrentDay ? 'bg-primary-600/20 border-primary-600' : 'bg-dark-800/50'}
                      ${selectedDate && date && date.toDateString() === selectedDate.toDateString() ? 'ring-2 ring-primary-600' : ''}
                    `}
                  >
                    {date && (
                      <>
                        <div className={`text-sm font-medium mb-1 ${isCurrentDay ? 'text-primary-400' : 'text-gray-300'}`}>
                          {date.getDate()}
                        </div>
                        {leaves.length > 0 && (
                          <div className="space-y-1">
                            {leaves.slice(0, 2).map((leave, idx) => (
                              <div
                                key={idx}
                                className="text-xs px-1 py-0.5 rounded bg-yellow-500/20 text-yellow-400 truncate"
                                title={`${leave.employeeName} - ${leave.leaveType}`}
                              >
                                {leave.employeeName.split(' ')[0]}
                              </div>
                            ))}
                            {leaves.length > 2 && (
                              <div className="text-xs text-gray-400">
                                +{leaves.length - 2} more
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Selected Date Details */}
            {selectedDate && selectedDateLeaves.length > 0 && (
              <div className="mt-6 pt-6 border-t border-dark-800">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Leaves on {formatDate(selectedDate)}
                </h3>
                <div className="space-y-3">
                  {selectedDateLeaves.map(leave => (
                    <div key={leave.id} className="bg-dark-800/50 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Users size={16} className="text-gray-400" />
                            <h4 className="font-semibold text-white">{leave.employeeName}</h4>
                            {leave.employeeCode && (
                              <span className="text-xs text-gray-400">({leave.employeeCode})</span>
                            )}
                          </div>
                          <div className="space-y-1 text-sm">
                            <p className="text-gray-400">
                              <span className="text-white font-medium">Leave Type:</span> {leave.leaveType}
                            </p>
                            <p className="text-gray-400">
                              <span className="text-white font-medium">Duration:</span>{' '}
                              {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                              {' '}({leave.numberOfDays} day{leave.numberOfDays !== 1 ? 's' : ''})
                            </p>
                            {leave.reason && (
                              <p className="text-gray-400">
                                <span className="text-white font-medium">Reason:</span> {leave.reason}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LeaveCalendar;
