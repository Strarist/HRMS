import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Clock, Mail } from 'lucide-react';
import api from '../../api/axios';
import toast from '../../utils/toast';

const ScheduledReports = () => {
  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [formData, setFormData] = useState({
    reportType: '',
    frequency: 'daily',
    recipients: [],
    format: 'excel',
    isActive: true
  });

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reports/scheduled');
      setSchedules(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch scheduled reports');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSchedule) {
        await api.put(`/reports/scheduled/${editingSchedule._id}`, formData);
        toast.success('Scheduled report updated successfully');
      } else {
        await api.post('/reports/scheduled', formData);
        toast.success('Scheduled report created successfully');
      }
      setShowModal(false);
      setEditingSchedule(null);
      resetForm();
      fetchSchedules();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save scheduled report');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this scheduled report?')) return;
    try {
      await api.delete(`/reports/scheduled/${id}`);
      toast.success('Scheduled report deleted successfully');
      fetchSchedules();
    } catch (error) {
      toast.error('Failed to delete scheduled report');
    }
  };

  const resetForm = () => {
    setFormData({
      reportType: '',
      frequency: 'daily',
      recipients: [],
      format: 'excel',
      isActive: true
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Scheduled Reports</h1>
        <button
          onClick={() => {
            resetForm();
            setEditingSchedule(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Schedule Report
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Report Type</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Frequency</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Format</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Recipients</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {schedules.map((schedule) => (
              <tr key={schedule._id} className="hover:bg-gray-750">
                <td className="px-4 py-3 text-sm text-gray-300">{schedule.reportType}</td>
                <td className="px-4 py-3 text-sm text-gray-300">
                  <div className="flex items-center gap-1">
                    <Clock size={16} />
                    {schedule.frequency}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-300">{schedule.format}</td>
                <td className="px-4 py-3 text-sm text-gray-300">
                  <div className="flex items-center gap-1">
                    <Mail size={16} />
                    {schedule.recipients?.length || 0} recipients
                  </div>
                </td>
                <td className="px-4 py-3">
                  {schedule.isActive ? (
                    <span className="text-green-400">Active</span>
                  ) : (
                    <span className="text-red-400">Inactive</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingSchedule(schedule);
                        setFormData({
                          reportType: schedule.reportType || '',
                          frequency: schedule.frequency || 'daily',
                          recipients: schedule.recipients || [],
                          format: schedule.format || 'excel',
                          isActive: schedule.isActive !== undefined ? schedule.isActive : true
                        });
                        setShowModal(true);
                      }}
                      className="p-1 text-blue-400 hover:text-blue-300"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(schedule._id)}
                      className="p-1 text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingSchedule ? 'Edit Scheduled Report' : 'Schedule Report'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Report Type</label>
                <select
                  name="reportType"
                  value={formData.reportType}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  <option value="">Select report type</option>
                  <option value="leave_entitlement">Leave Entitlement</option>
                  <option value="leave_balance">Leave Balance</option>
                  <option value="attendance_summary">Attendance Summary</option>
                  <option value="compliance_status">Compliance Status</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Frequency</label>
                  <select
                    name="frequency"
                    value={formData.frequency}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Format</label>
                  <select
                    name="format"
                    value={formData.format}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  >
                    <option value="excel">Excel</option>
                    <option value="pdf">PDF</option>
                    <option value="csv">CSV</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <label className="text-sm font-medium text-gray-300">Active</label>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingSchedule(null);
                    resetForm();
                  }}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingSchedule ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduledReports;

