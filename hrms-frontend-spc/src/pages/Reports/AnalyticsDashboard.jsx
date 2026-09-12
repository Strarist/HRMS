import React, { useState, useEffect, useCallback } from 'react';
import { BarChart3, TrendingUp, Calendar, Users } from 'lucide-react';
import api from '../../api/axios';
import toast from '../../utils/toast';

const AnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [analyticsType, setAnalyticsType] = useState('attendance');
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    groupBy: 'month'
  });
  const [analyticsData, setAnalyticsData] = useState(null);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const params = { ...filters };
      let endpoint = '';
      
      switch (analyticsType) {
        case 'attendance':
          endpoint = '/reports/analytics/attendance';
          break;
        case 'leave':
          endpoint = '/reports/analytics/leave';
          break;
        case 'compliance':
          endpoint = '/reports/analytics/compliance';
          break;
        default:
          endpoint = '/reports/analytics/attendance';
      }
      
      const response = await api.get(endpoint, { params });
      const payload = response.data;

      let summary = {
        totalRecords: 0,
        average: 0,
        maximum: 0,
        minimum: 0
      };

      let trends = [];

      if (analyticsType === 'attendance' && payload?.trends) {
        const attendanceTrends = payload.trends;
        const periods = attendanceTrends.byPeriod || {};
        const periodEntries = Object.entries(periods);

        const overallStats = attendanceTrends.overall || {};
        const presentValues = periodEntries.map(([, val]) => val.present || 0);
        const totalRecords = overallStats.totalDays || periodEntries.reduce((sum, [, val]) => sum + (val.recordCount || 0), 0);
        const totalPresent = overallStats.present ?? presentValues.reduce((sum, value) => sum + value, 0);

        summary = {
          totalRecords,
          average: totalRecords ? ((totalPresent / totalRecords) * 100).toFixed(1) : 0,
          maximum: presentValues.length ? Math.max(...presentValues) : 0,
          minimum: presentValues.length ? Math.min(...presentValues) : 0
        };

        trends = periodEntries.map(([periodLabel, details]) => ({
          label: periodLabel,
          value: details.present || 0,
          description: `Present: ${details.present || 0} • Absent: ${details.absent || 0} • Avg Hours: ${(details.averageWorkingHours || 0).toFixed(2)}`,
          change: details.presentPercentage ? details.presentPercentage.toFixed(1) : null
        }));
      } else if (analyticsType === 'leave' && payload?.patterns) {
        const patternData = payload.patterns;
        const leaveTypeEntries = Object.entries(patternData.byLeaveType || {});

        const totalRequests = payload.totalRequests || 0;
        const averageDuration = patternData.averageDuration || 0;
        const totalDays = leaveTypeEntries.reduce((sum, [, val]) => sum + (val.totalDays || 0), 0);
        const daysValues = leaveTypeEntries.map(([_, val]) => val.totalDays || 0);

        summary = {
          totalRecords: totalRequests,
          average: averageDuration.toFixed(2),
          maximum: daysValues.length ? Math.max(...daysValues) : 0,
          minimum: daysValues.length ? Math.min(...daysValues) : 0
        };

        trends = leaveTypeEntries.map(([type, details]) => ({
          label: type,
          value: details.count || 0,
          description: `Total days: ${details.totalDays || 0} • Avg duration: ${(details.averageDays || 0).toFixed(2)}`
        }));
      } else if (analyticsType === 'compliance' && payload?.metrics) {
        const metrics = payload.metrics;
        summary = {
          totalRecords: metrics.documents?.total || 0,
          average: metrics.documents?.expiring || 0,
          maximum: metrics.compliances?.overdue || 0,
          minimum: metrics.compliances?.completed || 0
        };

        trends = [
          {
            label: 'Documents',
            value: metrics.documents?.total || 0,
            description: `Expiring: ${metrics.documents?.expiring || 0} • Expired: ${metrics.documents?.expired || 0}`
          },
          {
            label: 'Compliance Tasks',
            value: metrics.compliances?.total || 0,
            description: `Pending: ${metrics.compliances?.pending || 0} • Overdue: ${metrics.compliances?.overdue || 0}`
          }
        ];
      } else {
        summary = payload?.summary || summary;
        trends = payload?.trends || [];
      }

      setAnalyticsData({ summary, trends });
    } catch (error) {
      toast.error('Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  }, [analyticsType, filters]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
        <div className="flex items-center gap-2 text-gray-400">
          <BarChart3 size={24} />
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Analytics Type</label>
            <select
              value={analyticsType}
              onChange={(e) => setAnalyticsType(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            >
              <option value="attendance">Attendance Trends</option>
              <option value="leave">Leave Patterns</option>
              <option value="compliance">Compliance Metrics</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">End Date</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-1">Group By</label>
          <select
            name="groupBy"
            value={filters.groupBy}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
          >
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
          </select>
        </div>
      </div>

      {analyticsData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Total Records</span>
              <TrendingUp size={20} className="text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              {analyticsData.summary?.totalRecords || 0}
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Average</span>
              <BarChart3 size={20} className="text-green-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              {analyticsData.summary?.average || 0}
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Maximum</span>
              <Calendar size={20} className="text-yellow-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              {analyticsData.summary?.maximum || 0}
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Minimum</span>
              <Users size={20} className="text-red-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              {analyticsData.summary?.minimum || 0}
            </div>
          </div>
        </div>
      )}

      {analyticsData && Array.isArray(analyticsData.trends) && analyticsData.trends.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Trend Analysis</h2>
          <div className="space-y-4">
            {analyticsData.trends.map((trend, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div>
                  <div className="text-white font-medium">{trend.period || trend.label}</div>
                  <div className="text-gray-400 text-sm">{trend.description}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-white">{trend.value}</div>
                  {trend.change && (
                    <div className={`text-sm ${trend.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {trend.change > 0 ? '+' : ''}{trend.change}%
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400">Loading analytics...</div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;

