import React from 'react';
import { Calendar, TrendingUp } from 'lucide-react';

const LeaveBalance = () => {
  const leaveBalances = [
    { type: 'Casual Leave', total: 12, used: 5, remaining: 7, color: 'bg-blue-500' },
    { type: 'Sick Leave', total: 10, used: 2, remaining: 8, color: 'bg-red-500' },
    { type: 'Earned Leave', total: 15, used: 8, remaining: 7, color: 'bg-green-500' },
    { type: 'Maternity Leave', total: 90, used: 0, remaining: 90, color: 'bg-purple-500' },
    { type: 'Paternity Leave', total: 15, used: 0, remaining: 15, color: 'bg-yellow-500' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Leave Balance</h1>
        <p className="text-gray-400 mt-1">View your leave balance and history</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Total Leaves</p>
              <h3 className="text-2xl font-bold text-white">142</h3>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <Calendar size={24} className="text-white" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Used Leaves</p>
              <h3 className="text-2xl font-bold text-white">15</h3>
            </div>
            <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
              <TrendingUp size={24} className="text-white" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Remaining Leaves</p>
              <h3 className="text-2xl font-bold text-white">127</h3>
            </div>
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <Calendar size={24} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Leave Balance Details */}
      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-6">Leave Balance by Type</h2>
        <div className="space-y-6">
          {leaveBalances.map((leave, index) => (
            <div key={index}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium">{leave.type}</span>
                <span className="text-gray-400 text-sm">
                  {leave.used} / {leave.total} days used
                </span>
              </div>
              <div className="w-full bg-dark-800 rounded-full h-3">
                <div
                  className={`${leave.color} h-3 rounded-full transition-all duration-300`}
                  style={{ width: `${(leave.used / leave.total) * 100}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-500">
                  Remaining: {leave.remaining} days
                </span>
                <span className="text-sm text-gray-500">
                  {Math.round((leave.remaining / leave.total) * 100)}% available
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leave History */}
      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-4">Recent Leave History</h2>
        <div className="space-y-4">
          {[
            { type: 'Casual Leave', dates: 'Jan 15 - Jan 17, 2024', days: 3, status: 'Approved' },
            { type: 'Sick Leave', dates: 'Dec 20 - Dec 21, 2023', days: 2, status: 'Approved' },
            { type: 'Earned Leave', dates: 'Nov 10 - Nov 15, 2023', days: 6, status: 'Approved' }
          ].map((leave, index) => (
            <div key={index} className="flex items-center justify-between py-3 border-b border-dark-800 last:border-0">
              <div>
                <p className="text-white font-medium">{leave.type}</p>
                <p className="text-sm text-gray-400">{leave.dates}</p>
              </div>
              <div className="text-right">
                <p className="text-white">{leave.days} days</p>
                <span className="badge badge-success text-xs">{leave.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeaveBalance;
