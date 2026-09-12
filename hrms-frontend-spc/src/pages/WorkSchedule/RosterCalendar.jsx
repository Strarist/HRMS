import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock, User } from 'lucide-react';
import api from '../../api/axios';
import toast from '../../utils/toast';

const RosterCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    fetchCalendar();
  }, [currentDate]);

  const fetchCalendar = async () => {
    try {
      setLoading(true);
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const response = await api.get(
        `/work-schedule/calendar?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );
      setAssignments(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch roster calendar');
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

  const getAssignmentsForDate = (date) => {
    if (!date) return [];
    return assignments.filter(assignment => {
      const effectiveDate = new Date(assignment.effectiveDate);
      const endDate = assignment.endDate ? new Date(assignment.endDate) : new Date('2099-12-31');
      return date >= effectiveDate && date <= endDate;
    });
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const days = getDaysInMonth();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Roster Calendar</h1>
          <p className="text-gray-400 mt-1">View work schedules by date</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 hover:bg-dark-800 rounded-lg"
          >
            <ChevronLeft size={20} className="text-gray-400" />
          </button>
          <h2 className="text-lg font-semibold text-white min-w-[200px] text-center">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 hover:bg-dark-800 rounded-lg"
          >
            <ChevronRight size={20} className="text-gray-400" />
          </button>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <div className="min-w-full">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-400">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((date, idx) => {
              const dateAssignments = getAssignmentsForDate(date);
              const isToday = date && date.toDateString() === new Date().toDateString();
              const isSelected = date && selectedDate && date.toDateString() === selectedDate.toDateString();

              return (
                <div
                  key={idx}
                  onClick={() => date && setSelectedDate(date)}
                  className={`min-h-[100px] p-2 border border-dark-700 rounded ${
                    !date ? 'bg-dark-900' :
                    isToday ? 'bg-primary-500/10 border-primary-500' :
                    isSelected ? 'bg-blue-500/10 border-blue-500' :
                    'bg-dark-800 hover:bg-dark-700 cursor-pointer'
                  }`}
                >
                  {date && (
                    <>
                      <div className={`text-sm font-medium mb-1 ${
                        isToday ? 'text-primary-400' : 'text-gray-300'
                      }`}>
                        {date.getDate()}
                      </div>
                      <div className="space-y-1">
                        {dateAssignments.slice(0, 2).map(assignment => (
                          <div
                            key={assignment._id}
                            className="text-xs bg-dark-700 p-1 rounded truncate"
                            title={`${assignment.employeeName} - ${assignment.shiftTemplateId?.name}`}
                          >
                            <div className="flex items-center space-x-1">
                              <User size={10} className="text-gray-400" />
                              <span className="text-gray-300 truncate">
                                {assignment.employeeName?.split(' ')[0]}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1 mt-0.5">
                              <Clock size={10} className="text-gray-400" />
                              <span className="text-gray-400 text-[10px]">
                                {assignment.shiftTemplateId?.code}
                              </span>
                            </div>
                          </div>
                        ))}
                        {dateAssignments.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{dateAssignments.length - 2} more
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {selectedDate && (
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">
            Assignments for {selectedDate.toLocaleDateString()}
          </h3>
          <div className="space-y-2">
            {getAssignmentsForDate(selectedDate).map(assignment => (
              <div key={assignment._id} className="p-3 bg-dark-900 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{assignment.employeeName}</p>
                    <p className="text-sm text-gray-400">
                      {assignment.shiftTemplateId?.name} ({assignment.shiftTemplateId?.code})
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-300">{assignment.location}</p>
                    <p className="text-xs text-gray-400">
                      {assignment.shiftTemplateId?.startTime} - {assignment.shiftTemplateId?.endTime}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RosterCalendar;


