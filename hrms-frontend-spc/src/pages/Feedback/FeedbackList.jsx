  const openCreateModal = () => {
    setNewFeedback({
      employee: '',
      project: '',
      feedbackType: 'quarterly',
      feedbackBy: 'manager',
      overallRating: '',
      comments: ''
    });
    setCreateError('');
    setShowCreateModal(true);
  };

  const handleFeedbackFieldChange = (e) => {
    const { name, value } = e.target;
    setNewFeedback(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateFeedback = async (e) => {
    e.preventDefault();
    if (!newFeedback.employee || !newFeedback.feedbackType || !newFeedback.feedbackBy) {
      setCreateError('Please fill in all required fields.');
      return;
    }

    setCreating(true);
    setCreateError('');

    try {
      const payload = {
        employee: newFeedback.employee,
        project: newFeedback.project || undefined,
        feedbackType: newFeedback.feedbackType,
        feedbackBy: newFeedback.feedbackBy,
        overallRating: newFeedback.overallRating ? Number(newFeedback.overallRating) : undefined,
        comments: newFeedback.comments || undefined,
        ratings: newFeedback.overallRating
          ? [{ category: 'overall', rating: Number(newFeedback.overallRating), comments: newFeedback.comments }]
          : []
      };

      await api.post('/feedback', payload);
      toast.success('Feedback added successfully');
      setShowCreateModal(false);
      fetchFeedbacks();
    } catch (error) {
      const message = error?.response?.data?.message || 'Failed to create feedback';
      setCreateError(message);
      toast.error(message);
    } finally {
      setCreating(false);
    }
  };
import React, { useEffect, useMemo, useState } from 'react';
import {
  Plus,
  MessageSquare,
  TrendingUp,
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  Gauge,
  Activity,
  X
} from 'lucide-react';
import api from '../../api/axios';
import toast from '../../utils/toast';

const FeedbackList = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState('');
  const [feedbackError, setFeedbackError] = useState('');
  const [performanceData, setPerformanceData] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [newFeedback, setNewFeedback] = useState({
    employee: '',
    project: '',
    feedbackType: 'quarterly',
    feedbackBy: 'manager',
    overallRating: '',
    comments: ''
  });

  const feedbackTypes = [
    { value: 'mid-project', label: 'Mid Project' },
    { value: 'end-project', label: 'End Project' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'annual', label: 'Annual' },
    { value: 'exit', label: 'Exit Interview' }
  ];

  const feedbackSources = [
    { value: 'manager', label: 'Manager' },
    { value: 'client', label: 'Client' },
    { value: 'peer', label: 'Peer' },
    { value: 'self', label: 'Self Assessment' }
  ];

  const defaultStart = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - 90);
    return date.toISOString().split('T')[0];
  }, []);

  const defaultEnd = useMemo(() => new Date().toISOString().split('T')[0], []);

  const [filters, setFilters] = useState({
    startDate: defaultStart,
    endDate: defaultEnd
  });

  useEffect(() => {
    fetchFeedbacks();
    fetchEmployees();
    fetchProjects();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchPerformanceAnalytics(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.startDate, filters.endDate]);

  const fetchFeedbacks = async () => {
    setFeedbackLoading(true);
    try {
      const response = await api.get('/feedback');
      setFeedbacks(response.data.data);
    } catch (error) {
      setFeedbackError(error?.response?.data?.message || 'Failed to load feedback');
      toast.error('Failed to load feedback');
    } finally {
      setFeedbackLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/employees', {
        params: {
          status: 'active',
          fields: 'firstName,lastName,employeeCode'
        }
      });
      const list = Array.isArray(res.data?.data)
        ? res.data.data.map(emp => ({
            value: emp._id,
            label: `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.employeeCode || 'Employee'
          }))
        : [];
      setEmployees(list);
    } catch (error) {
      console.warn('Failed to load employees for feedback modal');
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects', {
        params: {
          status: 'active',
          fields: 'name'
        }
      });
      const list = Array.isArray(res.data?.data)
        ? res.data.data.map(project => ({ value: project._id, label: project.name || 'Project' }))
        : [];
      setProjects(list);
    } catch (error) {
      console.warn('Failed to load projects for feedback modal');
    }
  };

  const fetchPerformanceAnalytics = async (activeFilters) => {
    setAnalyticsLoading(true);
    setAnalyticsError('');
    try {
      const response = await api.get('/reports/analytics/performance', {
        params: {
          startDate: activeFilters.startDate,
          endDate: activeFilters.endDate
        }
      });

      setPerformanceData(response.data?.indicators || null);
    } catch (error) {
      setPerformanceData(null);
      const message = error?.response?.data?.message || 'Failed to load performance analytics';
      setAnalyticsError(message);
      toast.error(message);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: 'badge-default',
      submitted: 'badge-warning',
      acknowledged: 'badge-success',
      disputed: 'badge-danger'
    };
    return badges[status] || 'badge-default';
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const summaryCards = useMemo(() => {
    if (!performanceData) return [];
    const attendanceRate = performanceData.attendance?.attendanceRate ?? 0;
    const leaveApprovalRate = performanceData.leave?.approvalRate ?? 0;
    const averageLeaveDays = performanceData.leave?.totalRequests
      ? Math.round((performanceData.leave.totalLeaveDays / performanceData.leave.totalRequests) * 100) / 100
      : 0;

    return [
      {
        title: 'Active Employees',
        value: performanceData.activeEmployees ?? 0,
        icon: Users,
        accent: 'text-purple-400 bg-purple-500/10 border-purple-500/30'
      },
      {
        title: 'Attendance Rate',
        value: `${attendanceRate.toFixed(1)}%`,
        icon: TrendingUp,
        accent: 'text-green-400 bg-green-500/10 border-green-500/30'
      },
      {
        title: 'Leave Approval Rate',
        value: `${leaveApprovalRate.toFixed(1)}%`,
        icon: CheckCircle2,
        accent: 'text-blue-400 bg-blue-500/10 border-blue-500/30'
      },
      {
        title: 'Avg Leave Days',
        value: `${averageLeaveDays.toFixed(1)} days`,
        icon: Calendar,
        accent: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30'
      }
    ];
  }, [performanceData]);

  const secondaryMetrics = useMemo(() => {
    if (!performanceData) return [];

    return [
      {
        label: 'Present Days',
        value: performanceData.attendance?.presentDays ?? 0,
        description: 'Total days employees were marked present',
        icon: Clock
      },
      {
        label: 'Total Leave Requests',
        value: performanceData.leave?.totalRequests ?? 0,
        description: 'Requests submitted in the selected period',
        icon: Gauge
      },
      {
        label: 'Approved Leave Days',
        value: performanceData.leave?.totalLeaveDays ?? 0,
        description: 'Total days approved during the period',
        icon: CheckCircle2
      },
      {
        label: 'Recent Actions Logged',
        value: performanceData.leave?.approvedRequests ?? 0,
        description: 'Approved leave requests indicating engagement',
        icon: Activity
      }
    ];
  }, [performanceData]);

  if (feedbackLoading && analyticsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Performance Overview</h1>
          <p className="text-gray-400 mt-1">Insights across attendance, leave, and qualitative feedback</p>
        </div>
        <button className="btn-primary flex items-center space-x-2" onClick={openCreateModal}>
          <Plus size={20} />
          <span>Add Feedback</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-[#2A2A3A] border border-gray-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex flex-col text-xs text-gray-400">
            <span>Start Date</span>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              max={filters.endDate}
              className="mt-1 px-3 py-2 bg-[#1E1E2A] border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-[#A88BFF]"
            />
          </div>
          <div className="flex flex-col text-xs text-gray-400">
            <span>End Date</span>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              min={filters.startDate}
              className="mt-1 px-3 py-2 bg-[#1E1E2A] border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-[#A88BFF]"
            />
          </div>
        </div>
        <div className="flex flex-col items-start md:items-end gap-2 text-xs text-gray-500">
          <span>Period updates automatically when you adjust the dates.</span>
          <span>Showing data from {new Date(filters.startDate).toLocaleDateString()} to {new Date(filters.endDate).toLocaleDateString()}.</span>
        </div>
      </div>

      {/* Performance Analytics */}
      <div className="space-y-4">
        {analyticsError && (
          <div className="bg-red-500/10 border border-red-500/40 text-red-300 text-sm rounded-xl px-4 py-3">
            {analyticsError}
          </div>
        )}

        {analyticsLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-10 h-10 border-4 border-[#A88BFF] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : performanceData ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {summaryCards.map(card => (
                <div
                  key={card.title}
                  className={`bg-[#1E1E2A] border border-gray-800 rounded-2xl px-5 py-6 flex flex-col gap-3 hover:border-[#A88BFF]/60 transition-colors`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-400">{card.title}</p>
                    <span className={`inline-flex items-center justify-center w-9 h-9 rounded-full border ${card.accent}`}>
                      <card.icon className="w-4 h-4" />
                    </span>
                  </div>
                  <p className="text-3xl font-semibold text-white">{card.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {secondaryMetrics.map(metric => (
                <div key={metric.label} className="bg-[#1E1E2A] border border-gray-800 rounded-2xl p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <metric.icon className="w-4 h-4 text-[#A88BFF]" />
                    <span>{metric.label}</span>
                  </div>
                  <p className="text-2xl font-semibold text-white">{metric.value}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{metric.description}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="bg-[#1E1E2A] border border-gray-800 rounded-2xl p-6 text-center text-gray-400">
            No performance analytics available for the selected period.
          </div>
        )}
      </div>

      {/* Feedback Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Performance Feedback</h2>
          <p className="text-gray-400 text-sm">Qualitative insights from submitted feedback records</p>
        </div>
        {feedbackLoading && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <div className="w-3 h-3 border-2 border-[#A88BFF] border-t-transparent rounded-full animate-spin"></div>
            Refreshing feedback...
          </div>
        )}
      </div>

      {feedbackError && (
        <div className="bg-red-500/10 border border-red-500/40 text-red-300 text-sm rounded-xl px-4 py-3">
          {feedbackError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {feedbacks.map((feedback) => (
          <div key={feedback._id} className="card">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {feedback.employee?.firstName} {feedback.employee?.lastName}
                </h3>
                <p className="text-sm text-gray-400 capitalize">{feedback.feedbackType}</p>
              </div>
              <span className={`badge ${getStatusBadge(feedback.status)}`}>
                {feedback.status}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Project:</span>
                <span className="text-white">{feedback.project?.name || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Overall Rating:</span>
                <span className="text-white font-bold">{feedback.overallRating || 'N/A'}/5</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Submitted By:</span>
                <span className="text-white capitalize">{feedback.feedbackBy}</span>
              </div>
            </div>

            <button className="w-full btn-primary text-sm">
              View Details
            </button>
          </div>
        ))}
      </div>

      {feedbacks.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare size={48} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">No feedback records found</p>
          <button className="btn-primary text-sm" onClick={openCreateModal}>
            Add Feedback
          </button>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-2xl bg-[#2A2A3A] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#A88BFF]" />
                  Add Performance Feedback
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Capture key performance observations for an employee.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFeedback} className="px-6 py-5 space-y-5 max-h-[75vh] overflow-y-auto">
              {createError && (
                <div className="bg-red-500/10 border border-red-500/40 text-red-300 text-sm rounded-xl px-4 py-3">
                  {createError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex flex-col gap-2 text-xs text-gray-300">
                  <span>Employee <span className="text-red-400">*</span></span>
                  <select
                    name="employee"
                    value={newFeedback.employee}
                    onChange={handleFeedbackFieldChange}
                    className="px-3 py-2 bg-[#1E1E2A] border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-[#A88BFF]"
                    required
                  >
                    <option value="">Select employee</option>
                    {employees.map(emp => (
                      <option key={emp.value} value={emp.value}>{emp.label}</option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-2 text-xs text-gray-300">
                  <span>Project</span>
                  <select
                    name="project"
                    value={newFeedback.project}
                    onChange={handleFeedbackFieldChange}
                    className="px-3 py-2 bg-[#1E1E2A] border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-[#A88BFF]"
                  >
                    <option value="">Not specified</option>
                    {projects.map(project => (
                      <option key={project.value} value={project.value}>{project.label}</option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-2 text-xs text-gray-300">
                  <span>Feedback Type <span className="text-red-400">*</span></span>
                  <select
                    name="feedbackType"
                    value={newFeedback.feedbackType}
                    onChange={handleFeedbackFieldChange}
                    className="px-3 py-2 bg-[#1E1E2A] border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-[#A88BFF]"
                    required
                  >
                    {feedbackTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-2 text-xs text-gray-300">
                  <span>Feedback From <span className="text-red-400">*</span></span>
                  <select
                    name="feedbackBy"
                    value={newFeedback.feedbackBy}
                    onChange={handleFeedbackFieldChange}
                    className="px-3 py-2 bg-[#1E1E2A] border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-[#A88BFF]"
                    required
                  >
                    {feedbackSources.map(source => (
                      <option key={source.value} value={source.value}>{source.label}</option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-2 text-xs text-gray-300">
                  <span>Overall Rating</span>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    step={0.1}
                    name="overallRating"
                    value={newFeedback.overallRating}
                    onChange={handleFeedbackFieldChange}
                    className="px-3 py-2 bg-[#1E1E2A] border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-[#A88BFF]"
                    placeholder="1-5"
                  />
                </label>
              </div>

              <label className="flex flex-col gap-2 text-xs text-gray-300">
                <span>Comments</span>
                <textarea
                  name="comments"
                  value={newFeedback.comments}
                  onChange={handleFeedbackFieldChange}
                  rows={4}
                  className="px-3 py-2 bg-[#1E1E2A] border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-[#A88BFF]"
                  placeholder="Provide key highlights, achievements, or areas of improvement"
                />
              </label>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg border border-gray-700 text-xs text-gray-300 hover:border-gray-500 hover:text-white"
                  disabled={creating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#A88BFF] text-xs text-white font-medium hover:bg-[#B89CFF] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  disabled={creating}
                >
                  {creating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3 h-3" />
                      Save Feedback
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackList;
