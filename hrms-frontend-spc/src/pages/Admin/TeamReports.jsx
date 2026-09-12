import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Calendar, Download, Filter, ChevronDown, Activity, Briefcase, Award, AlertCircle } from 'lucide-react';
import toast from '../../utils/toast';
import api from '../../api/axios';

const TeamReports = () => {
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState({
    overview: {
      totalEmployees: 0,
      activeProjects: 0,
      avgPerformance: 0,
      totalDepartments: 0
    },
    departmentStats: [],
    performanceData: [],
    attendanceData: [],
    projectDistribution: []
  });
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  useEffect(() => {
    fetchReports();
  }, [selectedPeriod, selectedDepartment]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/reports/team?period=${selectedPeriod}&department=${selectedDepartment}`);
      if (response.data.success) {
        setReports(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load team reports');
    } finally {
      setLoading(false);
    }
  };


  const handleExportReport = (format) => {
    toast.success(`Exporting report as ${format.toUpperCase()}...`);
    // In a real implementation, this would trigger a download
  };

  const getPerformanceColor = (value) => {
    if (value >= 90) return 'text-green-400';
    if (value >= 80) return 'text-blue-400';
    if (value >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getStatusColor = (status) => {
    const colors = {
      'Completed': 'bg-green-500',
      'In Progress': 'bg-blue-500',
      'On Hold': 'bg-yellow-500',
      'Cancelled': 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  return (
    <div className="min-h-screen bg-[#1E1E2A] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-[#A88BFF]" />
              Team Reports
            </h1>
            <p className="text-gray-400 mt-1">Comprehensive analytics and insights for your team</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#2A2A3A] rounded-lg border border-gray-700 p-1">
              <button
                onClick={() => setSelectedPeriod('week')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedPeriod === 'week'
                    ? 'bg-[#A88BFF] text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setSelectedPeriod('month')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedPeriod === 'month'
                    ? 'bg-[#A88BFF] text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setSelectedPeriod('quarter')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedPeriod === 'quarter'
                    ? 'bg-[#A88BFF] text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Quarter
              </button>
              <button
                onClick={() => setSelectedPeriod('year')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedPeriod === 'year'
                    ? 'bg-[#A88BFF] text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Year
              </button>
            </div>
            
            <div className="relative">
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="appearance-none bg-[#2A2A3A] border border-gray-700 rounded-lg px-4 py-2 pr-10 text-white focus:border-[#A88BFF] focus:outline-none transition-colors"
              >
                <option value="all">All Departments</option>
                <option value="engineering">Engineering</option>
                <option value="sales">Sales</option>
                <option value="marketing">Marketing</option>
                <option value="hr">HR</option>
                <option value="finance">Finance</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>

            <div className="relative group">
              <button className="flex items-center gap-2 px-4 py-2 bg-[#2A2A3A] border border-gray-700 rounded-lg text-white hover:border-[#A88BFF] transition-colors">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-[#2A2A3A] border border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <button
                  onClick={() => handleExportReport('pdf')}
                  className="w-full text-left px-4 py-2 text-white hover:bg-[#1E1E2A] transition-colors rounded-t-lg"
                >
                  Export as PDF
                </button>
                <button
                  onClick={() => handleExportReport('excel')}
                  className="w-full text-left px-4 py-2 text-white hover:bg-[#1E1E2A] transition-colors"
                >
                  Export as Excel
                </button>
                <button
                  onClick={() => handleExportReport('csv')}
                  className="w-full text-left px-4 py-2 text-white hover:bg-[#1E1E2A] transition-colors rounded-b-lg"
                >
                  Export as CSV
                </button>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-[#A88BFF] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-[#2A2A3A] rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#A88BFF] to-[#8B6FE8] rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-white">{reports.overview.totalEmployees}</h3>
                <p className="text-gray-400 text-sm mt-1">Total Employees</p>
                <div className="mt-3 flex items-center text-xs text-green-400">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  <span>+12% from last month</span>
                </div>
              </div>

              <div className="bg-[#2A2A3A] rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  <Activity className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-white">{reports.overview.activeProjects}</h3>
                <p className="text-gray-400 text-sm mt-1">Active Projects</p>
                <div className="mt-3 flex items-center text-xs text-blue-400">
                  <Activity className="w-3 h-3 mr-1" />
                  <span>+3 this week</span>
                </div>
              </div>

              <div className="bg-[#2A2A3A] rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-white">{reports.overview.avgPerformance}%</h3>
                <p className="text-gray-400 text-sm mt-1">Avg Performance</p>
                <div className="mt-3 flex items-center text-xs text-green-400">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  <span>+5% improvement</span>
                </div>
              </div>

              <div className="bg-[#2A2A3A] rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                </div>
                <h3 className="text-2xl font-bold text-white">{reports.overview.totalDepartments}</h3>
                <p className="text-gray-400 text-sm mt-1">Departments</p>
                <div className="mt-3 flex items-center text-xs text-gray-400">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  <span>All operational</span>
                </div>
              </div>
            </div>

            {/* Performance Chart */}
            <div className="bg-[#2A2A3A] rounded-2xl border border-gray-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Performance Trends</h3>
              <div className="h-64 flex items-end justify-between gap-4">
                {reports.performanceData.map((data, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div className="w-full flex flex-col items-center gap-2">
                      <div
                        className="w-full bg-gradient-to-t from-[#A88BFF] to-[#B89CFF] rounded-t-lg transition-all duration-300 hover:opacity-80"
                        style={{ height: `${(data.performance / 100) * 200}px` }}
                        title={`Performance: ${data.performance}%`}
                      />
                      <div
                        className="w-full bg-gray-600 rounded-t-lg opacity-50"
                        style={{ height: `${(data.target / 100) * 200}px` }}
                        title={`Target: ${data.target}%`}
                      />
                    </div>
                    <span className="text-xs text-gray-400 mt-2">{data.month}</span>
                    <div className="text-xs text-white mt-1">{data.performance}%</div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-6 mt-6">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-[#A88BFF] rounded"></div>
                  <span className="text-sm text-gray-400">Actual Performance</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-600 rounded"></div>
                  <span className="text-sm text-gray-400">Target</span>
                </div>
              </div>
            </div>

            {/* Department Statistics */}
            <div className="bg-[#2A2A3A] rounded-2xl border border-gray-700 p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Department Statistics</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Department</th>
                      <th className="text-center py-3 px-4 text-gray-400 font-medium">Employees</th>
                      <th className="text-center py-3 px-4 text-gray-400 font-medium">Avg Performance</th>
                      <th className="text-center py-3 px-4 text-gray-400 font-medium">Active Projects</th>
                      <th className="text-right py-3 px-4 text-gray-400 font-medium">Budget</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {reports.departmentStats.map((dept, index) => (
                      <tr key={index} className="hover:bg-[#1E1E2A]/50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#A88BFF] to-[#8B6FE8] rounded-lg flex items-center justify-center">
                              <Users className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-white font-medium">{dept.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center text-white">{dept.employees}</td>
                        <td className="py-4 px-4 text-center">
                          <span className={`font-semibold ${getPerformanceColor(dept.avgPerformance)}`}>
                            {dept.avgPerformance}%
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center text-white">{dept.activeProjects}</td>
                        <td className="py-4 px-4 text-right text-white">
                          ${(dept.budget / 1000).toFixed(0)}K
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Project Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-[#2A2A3A] rounded-2xl border border-gray-700 p-6">
                <h3 className="text-xl font-semibold text-white mb-6">Project Distribution</h3>
                <div className="space-y-4">
                  {reports.projectDistribution.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded ${getStatusColor(item.status)}`}></div>
                        <span className="text-white">{item.status}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-32 bg-gray-700 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full ${getStatusColor(item.status)} transition-all duration-300`}
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                        <span className="text-white font-medium w-12 text-right">{item.count}</span>
                        <span className="text-gray-400 text-sm w-12 text-right">{item.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#2A2A3A] rounded-2xl border border-gray-700 p-6">
                <h3 className="text-xl font-semibold text-white mb-6">Attendance Overview</h3>
                <div className="space-y-4">
                  {reports.attendanceData.map((data, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-white">{data.month}</span>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span className="text-gray-300 text-sm">{data.present}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <span className="text-gray-300 text-sm">{data.absent}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <span className="text-gray-300 text-sm">{data.leave}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamReports;
