import React from 'react';
import { BarChart, Download } from 'lucide-react';

const AttendanceReports = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Attendance Reports</h1>
          <p className="text-gray-400 mt-1">View and download attendance reports</p>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <Download size={20} />
          <span>Export Report</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <p className="text-sm text-gray-400 mb-1">Average Attendance</p>
          <h3 className="text-2xl font-bold text-white">92.5%</h3>
        </div>
        <div className="card">
          <p className="text-sm text-gray-400 mb-1">Total Present</p>
          <h3 className="text-2xl font-bold text-white">1,850</h3>
        </div>
        <div className="card">
          <p className="text-sm text-gray-400 mb-1">Total Absent</p>
          <h3 className="text-2xl font-bold text-white">150</h3>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <BarChart size={20} />
          <span>Monthly Attendance Trend</span>
        </h3>
        <div className="h-64 flex items-center justify-center text-gray-400">
          Chart visualization would go here
        </div>
      </div>
    </div>
  );
};

export default AttendanceReports;
