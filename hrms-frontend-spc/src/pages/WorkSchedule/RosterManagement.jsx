import React, { useState, useEffect } from 'react';
import { Plus, Upload, Calendar, Clock, User } from 'lucide-react';
import api from '../../api/axios';
import toast from '../../utils/toast';
import { useAuth } from '../../context/AuthContext';
import RosterUpload from '../../components/RosterUpload';

const RosterManagement = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    location: '',
    status: 'active'
  });

  useEffect(() => {
    fetchAssignments();
  }, [filters]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.location) params.append('location', filters.location);
      if (filters.status) params.append('status', filters.status);

      const response = await api.get(`/work-schedule/rosters?${params.toString()}`);
      setAssignments(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch roster assignments');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading roster assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Roster Management</h1>
          <p className="text-gray-400 mt-1">Manage employee work schedules</p>
        </div>
        {(user.role === 'admin' || user.role === 'hr') && (
          <div className="flex space-x-3">
            <button
              onClick={() => setShowUpload(true)}
              className="btn-secondary flex items-center space-x-2"
            >
              <Upload size={20} />
              <span>Bulk Upload</span>
            </button>
            <button className="btn-primary flex items-center space-x-2">
              <Plus size={20} />
              <span>Add Assignment</span>
            </button>
          </div>
        )}
      </div>

      <div className="card p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Location
            </label>
            <input
              type="text"
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              className="input-field"
              placeholder="Filter by location"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="input-field"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-dark-700">
              <th className="text-left p-4 text-sm font-medium text-gray-300">Employee</th>
              <th className="text-left p-4 text-sm font-medium text-gray-300">Shift</th>
              <th className="text-left p-4 text-sm font-medium text-gray-300">Location</th>
              <th className="text-left p-4 text-sm font-medium text-gray-300">Effective Date</th>
              <th className="text-left p-4 text-sm font-medium text-gray-300">End Date</th>
              <th className="text-left p-4 text-sm font-medium text-gray-300">Status</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map(assignment => (
              <tr key={assignment._id} className="border-b border-dark-700 hover:bg-dark-800">
                <td className="p-4">
                  <div className="flex items-center space-x-2">
                    <User size={16} className="text-gray-400" />
                    <span className="text-white">
                      {assignment.employeeName || `${assignment.employeeId?.firstName} ${assignment.employeeId?.lastName}`}
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  {assignment.shiftTemplateId ? (
                    <div className="flex items-center space-x-2">
                      <Clock size={16} className="text-gray-400" />
                      <span className="text-gray-300">
                        {assignment.shiftTemplateId.name} ({assignment.shiftTemplateId.code})
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="p-4 text-gray-300">{assignment.location}</td>
                <td className="p-4 text-gray-300">
                  {new Date(assignment.effectiveDate).toLocaleDateString()}
                </td>
                <td className="p-4 text-gray-300">
                  {assignment.endDate ? new Date(assignment.endDate).toLocaleDateString() : '-'}
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs rounded ${
                    assignment.status === 'active' ? 'bg-green-500/20 text-green-400' :
                    assignment.status === 'inactive' ? 'bg-gray-500/20 text-gray-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {assignment.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {assignments.length === 0 && (
          <div className="p-8 text-center text-gray-400">
            No roster assignments found
          </div>
        )}
      </div>

      {showUpload && (
        <RosterUpload
          onClose={() => setShowUpload(false)}
          onSuccess={() => {
            setShowUpload(false);
            fetchAssignments();
          }}
        />
      )}
    </div>
  );
};

export default RosterManagement;


