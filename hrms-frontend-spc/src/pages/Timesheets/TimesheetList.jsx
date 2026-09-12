import React, { useEffect, useState } from 'react';
import { Plus, Clock, Check, X, Loader2, Calendar } from 'lucide-react';
import api from '../../api/axios';
import toast from '../../utils/toast';
import { useAuth } from '../../context/AuthContext';

const TimesheetList = () => {
  const { user } = useAuth();
  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [weekStartDate, setWeekStartDate] = useState('');
  const [formData, setFormData] = useState({
    employee: '',
    project: '',
    client: '',
    entries: [
      { date: '', hours: '', taskDescription: '', billable: true },
      { date: '', hours: '', taskDescription: '', billable: true },
      { date: '', hours: '', taskDescription: '', billable: true },
      { date: '', hours: '', taskDescription: '', billable: true },
      { date: '', hours: '', taskDescription: '', billable: true },
      { date: '', hours: '', taskDescription: '', billable: true },
      { date: '', hours: '', taskDescription: '', billable: true }
    ],
    notes: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchTimesheets();
    if (showAddModal) {
      fetchProjects();
      fetchClients();
      fetchEmployees();
    }
  }, [showAddModal]);

  const fetchTimesheets = async () => {
    try {
      const response = await api.get('/timesheets');
      setTimesheets(response.data.data);
    } catch (error) {
      toast.error('Failed to load timesheets');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects?status=active');
      setProjects(response.data.data || []);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await api.get('/clients?status=active');
      setClients(response.data.data || []);
    } catch (error) {
      console.error('Failed to load clients:', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      setEmployees(response.data.data || []);
    } catch (error) {
      console.error('Failed to load employees:', error);
    }
  };

  const getWeekDates = (startDate) => {
    if (!startDate) return [];
    const start = new Date(startDate);
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const handleAdd = () => {
    // Initialize with current week (Monday to Sunday)
    const today = new Date();
    const currentDay = today.getDay();
    const diff = today.getDate() - currentDay + (currentDay === 0 ? -6 : 1); // Adjust to Monday
    const monday = new Date(today);
    monday.setDate(monday.getDate() - currentDay + (currentDay === 0 ? -6 : 1));
    monday.setHours(0, 0, 0, 0);
    
    const weekStart = monday.toISOString().split('T')[0];
    const weekDates = getWeekDates(weekStart);

    setWeekStartDate(weekStart);
    setFormData({
      employee: user?.role === 'employee' ? '' : '', // Will be auto-set for employees
      project: '',
      client: '',
      entries: weekDates.map(date => ({
        date,
        hours: '',
        taskDescription: '',
        billable: true
      })),
      notes: ''
    });
    setErrors({});
    setShowAddModal(true);
  };

  const handleWeekStartChange = (date) => {
    setWeekStartDate(date);
    const weekDates = getWeekDates(date);
    setFormData(prev => ({
      ...prev,
      entries: weekDates.map((weekDate, index) => ({
        date: weekDate,
        hours: prev.entries[index]?.hours || '',
        taskDescription: prev.entries[index]?.taskDescription || '',
        billable: prev.entries[index]?.billable !== false
      }))
    }));
  };

  const handleProjectChange = (projectId) => {
    const project = projects.find(p => p._id === projectId);
    setFormData(prev => ({
      ...prev,
      project: projectId,
      client: project?.client?._id || project?.client || ''
    }));
  };

  const handleEntryChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      entries: prev.entries.map((entry, i) => 
        i === index ? { ...entry, [field]: value } : entry
      )
    }));
  };

  const calculateTotalHours = () => {
    return formData.entries.reduce((sum, entry) => {
      const hours = parseFloat(entry.hours) || 0;
      return sum + hours;
    }, 0);
  };

  const calculateBillableHours = () => {
    return formData.entries.reduce((sum, entry) => {
      if (entry.billable) {
        const hours = parseFloat(entry.hours) || 0;
        return sum + hours;
      }
      return sum;
    }, 0);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.employee && user?.role !== 'employee' && user?.role !== 'hr') {
      newErrors.employee = 'Employee is required';
    }
    if (!formData.project) {
      newErrors.project = 'Project is required';
    }
    if (!formData.client) {
      newErrors.client = 'Client is required';
    }
    if (!weekStartDate) {
      newErrors.weekStartDate = 'Week start date is required';
    }

    // Validate entries
    const hasEntries = formData.entries.some(entry => entry.hours && parseFloat(entry.hours) > 0);
    if (!hasEntries) {
      newErrors.entries = 'At least one entry with hours is required';
    }

    formData.entries.forEach((entry, index) => {
      if (entry.hours && entry.hours !== '') {
        const hours = parseFloat(entry.hours);
        if (isNaN(hours) || hours < 0 || hours > 24) {
          newErrors[`entry_${index}_hours`] = 'Hours must be between 0 and 24';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      // Calculate week end date (7 days after start)
      const start = new Date(weekStartDate);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);

      // Filter out empty entries and convert hours to numbers
      const entries = formData.entries
        .filter(entry => entry.hours && parseFloat(entry.hours) > 0)
        .map(entry => ({
          date: entry.date,
          hours: parseFloat(entry.hours),
          taskDescription: entry.taskDescription || '',
          billable: entry.billable !== false
        }));

      const payload = {
        ...(user?.role !== 'employee' && formData.employee ? { employee: formData.employee } : {}), // Only send if not employee
        project: formData.project,
        client: formData.client,
        weekStartDate: weekStartDate,
        weekEndDate: end.toISOString().split('T')[0],
        entries,
        ...(formData.notes ? { notes: formData.notes } : {})
      };

      await api.post('/timesheets', payload);
      toast.success('Timesheet created successfully');
      setShowAddModal(false);
      fetchTimesheets();
      
      // Reset form
      setFormData({
        employee: '',
        project: '',
        client: '',
        entries: Array(7).fill({ date: '', hours: '', taskDescription: '', billable: true }),
        notes: ''
      });
      setWeekStartDate('');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to create timesheet');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/timesheets/${id}/approve`);
      toast.success('Timesheet approved successfully');
      fetchTimesheets();
    } catch (error) {
      toast.error('Failed to approve timesheet');
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      await api.put(`/timesheets/${id}/reject`, { rejectionReason: reason });
      toast.success('Timesheet rejected');
      fetchTimesheets();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to reject timesheet');
    }
  };

  const filteredTimesheets = timesheets.filter(ts => 
    filterStatus === 'all' || ts.status === filterStatus
  );

  const getStatusBadge = (status) => {
    const badges = {
      draft: 'badge-default',
      submitted: 'badge-warning',
      approved: 'badge-success',
      rejected: 'badge-danger',
      invoiced: 'badge-info'
    };
    return badges[status] || 'badge-default';
  };

  const canApprove = user?.role === 'admin' || user?.role === 'hr' || user?.role === 'client';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Timesheets</h1>
          <p className="text-gray-400 mt-1">Track project hours and billing</p>
        </div>
        <button onClick={handleAdd} className="btn-primary flex items-center space-x-2">
          <Plus size={20} />
          <span>New Timesheet</span>
        </button>
      </div>

      <div className="card">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input-field w-48"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="submitted">Submitted</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="invoiced">Invoiced</option>
        </select>
      </div>

      <div className="card p-0">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Project</th>
                <th>Client</th>
                <th>Week</th>
                <th>Total Hours</th>
                <th>Billable Hours</th>
                <th>Status</th>
                {canApprove && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredTimesheets.map((timesheet) => (
                <tr key={timesheet._id}>
                  <td>
                    {timesheet.employee?.firstName} {timesheet.employee?.lastName}
                  </td>
                  <td>{timesheet.project?.name}</td>
                  <td>{timesheet.client?.name}</td>
                  <td>
                    {new Date(timesheet.weekStartDate).toLocaleDateString()} - 
                    {new Date(timesheet.weekEndDate).toLocaleDateString()}
                  </td>
                  <td>{timesheet.totalHours} hrs</td>
                  <td>{timesheet.totalBillableHours} hrs</td>
                  <td>
                    <span className={`badge ${getStatusBadge(timesheet.status)}`}>
                      {timesheet.status}
                    </span>
                  </td>
                  {canApprove && (
                    <td>
                      {timesheet.status === 'submitted' && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleApprove(timesheet._id)}
                            className="p-2 text-green-400 hover:bg-dark-800 rounded"
                            title="Approve"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => handleReject(timesheet._id)}
                            className="p-2 text-red-400 hover:bg-dark-800 rounded"
                            title="Reject"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredTimesheets.length === 0 && (
        <div className="text-center py-12">
          <Clock size={48} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">No timesheets found</p>
        </div>
      )}

      {/* Add Timesheet Modal */}
      {showAddModal && (
        <TimesheetModal
          formData={formData}
          errors={errors}
          submitting={submitting}
          weekStartDate={weekStartDate}
          projects={projects}
          clients={clients}
          employees={employees}
          user={user}
          onChange={(field, value) => setFormData(prev => ({ ...prev, [field]: value }))}
          onWeekStartChange={handleWeekStartChange}
          onProjectChange={handleProjectChange}
          onEntryChange={handleEntryChange}
          onSubmit={handleSubmit}
          onClose={() => {
            setShowAddModal(false);
            setFormData({
              employee: '',
              project: '',
              client: '',
              entries: Array(7).fill({ date: '', hours: '', taskDescription: '', billable: true }),
              notes: ''
            });
            setWeekStartDate('');
            setErrors({});
          }}
          calculateTotalHours={calculateTotalHours}
          calculateBillableHours={calculateBillableHours}
        />
      )}
    </div>
  );
};

// Timesheet Modal Component
const TimesheetModal = ({ 
  formData, 
  errors, 
  submitting, 
  weekStartDate, 
  projects, 
  clients, 
  employees, 
  user,
  onChange, 
  onWeekStartChange,
  onProjectChange,
  onEntryChange,
  onSubmit, 
  onClose,
  calculateTotalHours,
  calculateBillableHours
}) => {
  // Generate week dates when weekStartDate changes
  const getWeekDates = () => {
    if (!weekStartDate) return [];
    const start = new Date(weekStartDate);
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const weekDates = getWeekDates();

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Create New Timesheet</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {user?.role !== 'employee' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Employee <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={formData.employee}
                    onChange={(e) => onChange('employee', e.target.value)}
                    className={`input-field w-full ${errors.employee ? 'border-red-500' : ''}`}
                    required={user?.role !== 'employee'}
                  >
                    <option value="">Select Employee</option>
                    {employees.map(emp => (
                      <option key={emp._id} value={emp._id}>
                        {emp.firstName} {emp.lastName} ({emp.employeeCode || emp.email})
                      </option>
                    ))}
                  </select>
                  {errors.employee && <p className="text-red-400 text-xs mt-1">{errors.employee}</p>}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Week Start Date <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  value={weekStartDate}
                  onChange={(e) => onWeekStartChange(e.target.value)}
                  className={`input-field w-full ${errors.weekStartDate ? 'border-red-500' : ''}`}
                  required
                />
                {errors.weekStartDate && <p className="text-red-400 text-xs mt-1">{errors.weekStartDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Project <span className="text-red-400">*</span>
                </label>
                <select
                  value={formData.project}
                  onChange={(e) => onProjectChange(e.target.value)}
                  className={`input-field w-full ${errors.project ? 'border-red-500' : ''}`}
                  required
                >
                  <option value="">Select Project</option>
                  {projects.map(project => (
                    <option key={project._id} value={project._id}>
                      {project.name} ({project.projectCode})
                    </option>
                  ))}
                </select>
                {errors.project && <p className="text-red-400 text-xs mt-1">{errors.project}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Client <span className="text-red-400">*</span>
                </label>
                <select
                  value={formData.client}
                  onChange={(e) => onChange('client', e.target.value)}
                  className={`input-field w-full ${errors.client ? 'border-red-500' : ''}`}
                  required
                >
                  <option value="">Select Client</option>
                  {clients.map(client => (
                    <option key={client._id} value={client._id}>
                      {client.name} ({client.clientCode})
                    </option>
                  ))}
                </select>
                {errors.client && <p className="text-red-400 text-xs mt-1">{errors.client}</p>}
              </div>
            </div>
          </div>

          {/* Time Entries */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Time Entries</h3>
            <div className="space-y-3">
              {formData.entries.map((entry, index) => (
                <div key={index} className="p-4 bg-gray-700 rounded-lg">
                  <div className="grid grid-cols-12 gap-3 items-center">
                    <div className="col-span-12 md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        {dayNames[index]}
                      </label>
                      <input
                        type="date"
                        value={entry.date}
                        onChange={(e) => onEntryChange(index, 'date', e.target.value)}
                        className="input-field w-full text-sm"
                        readOnly
                      />
                    </div>
                    <div className="col-span-12 md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-1">Hours</label>
                      <input
                        type="number"
                        value={entry.hours}
                        onChange={(e) => onEntryChange(index, 'hours', e.target.value)}
                        className={`input-field w-full text-sm ${errors[`entry_${index}_hours`] ? 'border-red-500' : ''}`}
                        min="0"
                        max="24"
                        step="0.25"
                        placeholder="0.00"
                      />
                      {errors[`entry_${index}_hours`] && (
                        <p className="text-red-400 text-xs mt-1">{errors[`entry_${index}_hours`]}</p>
                      )}
                    </div>
                    <div className="col-span-12 md:col-span-6">
                      <label className="block text-sm font-medium text-gray-300 mb-1">Task Description</label>
                      <input
                        type="text"
                        value={entry.taskDescription}
                        onChange={(e) => onEntryChange(index, 'taskDescription', e.target.value)}
                        className="input-field w-full text-sm"
                        placeholder="What did you work on..."
                      />
                    </div>
                    <div className="col-span-12 md:col-span-2 flex items-end">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={entry.billable}
                          onChange={(e) => onEntryChange(index, 'billable', e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-300">Billable</span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
              {errors.entries && <p className="text-red-400 text-xs">{errors.entries}</p>}
            </div>

            {/* Summary */}
            <div className="mt-4 p-4 bg-gray-700 rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Total Hours</p>
                  <p className="text-white font-bold text-lg">{calculateTotalHours().toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-400">Billable Hours</p>
                  <p className="text-white font-bold text-lg">{calculateBillableHours().toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-gray-400">Non-Billable Hours</p>
                  <p className="text-white font-bold text-lg">{(calculateTotalHours() - calculateBillableHours()).toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => onChange('notes', e.target.value)}
              className="input-field w-full"
              rows="3"
              placeholder="Additional notes..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary px-6 py-2 flex items-center space-x-2"
              disabled={submitting}
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              <span>{submitting ? 'Creating...' : 'Create Timesheet'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TimesheetList;
