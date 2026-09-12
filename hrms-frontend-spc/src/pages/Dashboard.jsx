import React, { useEffect, useState } from 'react';
import { Users, CheckCircle, Briefcase, UserCheck } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  ResponsiveContainer 
} from 'recharts';
import api from '../api/axios';
import toast from '../utils/toast';
import { useTheme } from '../context/ThemeContext';

const Dashboard = () => {
  const { theme } = useTheme();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Failed to load dashboard data');
      // Set default empty data structure
      setStats({
        employees: { total: 0, active: 0 },
        jobs: { active: 0 },
        candidates: { total: 0 },
        charts: {
          employeeTrend: [],
          jobOpeningsTrend: [],
          candidatesByStage: [],
          candidatesBySource: []
        }
      });
    } finally {
      setLoading(false);
    }
  };

  // Chart colors - using theme color #7DB539 as primary
  const CHART_COLORS = {
    primary: '#7DB539',
    primaryLight: '#9BC55A',
    secondary: '#3b82f6',
    accent: '#8b5cf6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#06b6d4'
  };

  const PIE_CHART_COLORS = [
    CHART_COLORS.primary,
    CHART_COLORS.secondary,
    CHART_COLORS.accent,
    CHART_COLORS.success,
    CHART_COLORS.warning,
    CHART_COLORS.info,
    CHART_COLORS.danger
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-[#1E1E2A]">
        <div className="w-12 h-12 border-4 border-[#A88BFF] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total HR Users',
      value: stats?.employees?.total || 0,
      icon: Users,
      color: 'bg-blue-500',
      bgGradient: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Active HR Users',
      value: stats?.employees?.active || 0,
      icon: CheckCircle,
      color: 'bg-green-500',
      bgGradient: 'from-green-500 to-green-600'
    },
    {
      title: 'Job Openings',
      value: stats?.jobs?.active || 0,
      icon: Briefcase,
      color: 'bg-indigo-500',
      bgGradient: 'from-indigo-500 to-indigo-600'
    },
    {
      title: 'Number of Candidates',
      value: stats?.candidates?.total || 0,
      icon: UserCheck,
      color: 'bg-purple-500',
      bgGradient: 'from-purple-500 to-purple-600'
    }
  ];

  // Format month labels for charts
  const formatMonthLabel = (monthStr) => {
    if (!monthStr) return '';
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-[#1E1E2A] space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          Dashboard
        </h1>
        <p className="text-gray-400 mt-1">
          Overview of your organization
        </p>
      </div>

      {/* Stats Grid - 4 Cards Only */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const gradientColors = [
            'from-blue-500/10 to-blue-600/10 border-blue-500/20 hover:border-blue-500/40',
            'from-green-500/10 to-green-600/10 border-green-500/20 hover:border-green-500/40',
            'from-indigo-500/10 to-indigo-600/10 border-indigo-500/20 hover:border-indigo-500/40',
            'from-purple-500/10 to-purple-600/10 border-purple-500/20 hover:border-purple-500/40'
          ];
          const iconBgColors = [
            'bg-blue-500/20 text-blue-400',
            'bg-green-500/20 text-green-400',
            'bg-indigo-500/20 text-indigo-400',
            'bg-purple-500/20 text-purple-400'
          ];
          return (
            <div 
              key={index} 
              className={`bg-gradient-to-br ${gradientColors[index]} p-6 rounded-xl border hover:shadow-lg hover:shadow-${stat.color.split('-')[0]}-500/10 transition-all`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400 mb-2">
                    {stat.title}
                  </p>
                  <h3 className="text-3xl font-bold text-white">
                    {stat.value.toLocaleString()}
                  </h3>
                </div>
                <div className={`${iconBgColors[index]} p-3 rounded-xl`}>
                  <stat.icon size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Employee Growth Trend (Line Chart) */}
        <div className="bg-[#2A2A3A] rounded-xl border border-gray-800 p-6 shadow-xl">
          <h3 className="text-lg font-semibold mb-4 text-white">
            HR Users Growth Trend
          </h3>
          {stats?.charts?.employeeTrend && stats.charts.employeeTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.charts.employeeTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="month" 
                  tickFormatter={formatMonthLabel}
                  stroke="#9ca3af"
                />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#f3f4f6'
                  }}
                  labelFormatter={formatMonthLabel}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke={CHART_COLORS.secondary} 
                  strokeWidth={2}
                  name="Total HR Users"
                  dot={{ fill: CHART_COLORS.secondary, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="active" 
                  stroke={CHART_COLORS.primary} 
                  strokeWidth={2}
                  name="Active HR Users"
                  dot={{ fill: CHART_COLORS.primary, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">
              No data available
            </div>
          )}
        </div>

        {/* Chart 2: Job Openings Trend (Bar Chart) */}
        <div className="bg-[#2A2A3A] rounded-xl border border-gray-800 p-6 shadow-xl">
          <h3 className="text-lg font-semibold mb-4 text-white">
            Job Openings Trend
          </h3>
          {stats?.charts?.jobOpeningsTrend && stats.charts.jobOpeningsTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.charts.jobOpeningsTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="month" 
                  tickFormatter={formatMonthLabel}
                  stroke="#9ca3af"
                />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#f3f4f6'
                  }}
                  labelFormatter={formatMonthLabel}
                />
                <Bar 
                  dataKey="count" 
                  fill={CHART_COLORS.primary}
                  radius={[8, 8, 0, 0]}
                  name="Active Jobs"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">
              No data available
            </div>
          )}
        </div>

        {/* Chart 3: Candidates by Stage (Pie Chart) */}
        <div className="bg-[#2A2A3A] rounded-xl border border-gray-800 p-6 shadow-xl">
          <h3 className="text-lg font-semibold mb-4 text-white">
            Candidates by Stage
          </h3>
          {stats?.charts?.candidatesByStage && stats.charts.candidatesByStage.length > 0 ? (
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={stats.charts.candidatesByStage.filter(item => item.count > 0)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ stage, count, percent }) => {
                      // Only show label if percentage is >= 5% to avoid clutter
                      if (percent >= 0.05) {
                        return `${(percent * 100).toFixed(0)}%`;
                      }
                      return '';
                    }}
                    outerRadius={90}
                    innerRadius={30}
                    fill={CHART_COLORS.primary}
                    dataKey="count"
                    nameKey="stage"
                    paddingAngle={2}
                  >
                    {stats.charts.candidatesByStage.filter(item => item.count > 0).map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#f3f4f6'
                    }}
                    formatter={(value, name) => [
                      `${value} (${((value / stats.charts.candidatesByStage.reduce((sum, item) => sum + item.count, 0)) * 100).toFixed(1)}%)`,
                      name
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Custom Legend */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4 w-full max-w-md">
                {stats.charts.candidatesByStage
                  .filter(item => item.count > 0)
                  .map((entry, index) => {
                    const total = stats.charts.candidatesByStage.reduce((sum, item) => sum + item.count, 0);
                    const percentage = ((entry.count / total) * 100).toFixed(1);
                    return (
                      <div 
                        key={entry.stage} 
                        className="flex items-center space-x-2 text-sm"
                      >
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ 
                            backgroundColor: PIE_CHART_COLORS[index % PIE_CHART_COLORS.length] 
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate text-gray-200">
                            {entry.stage}
                          </div>
                          <div className="text-xs text-gray-400">
                            {entry.count} ({percentage}%)
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">
              No data available
            </div>
          )}
        </div>

        {/* Chart 4: Candidates by Source (Horizontal Bar Chart) */}
        <div className="bg-[#2A2A3A] rounded-xl border border-gray-800 p-6 shadow-xl">
          <h3 className="text-lg font-semibold mb-4 text-white">
            Candidates by Source
          </h3>
          {stats?.charts?.candidatesBySource && stats.charts.candidatesBySource.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                data={stats.charts.candidatesBySource}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" />
                <YAxis 
                  dataKey="source" 
                  type="category" 
                  width={70}
                  stroke="#9ca3af"
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#f3f4f6'
                  }}
                />
                <Bar 
                  dataKey="count" 
                  fill={CHART_COLORS.primary}
                  radius={[0, 8, 8, 0]}
                  name="Candidates"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">
              No data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
