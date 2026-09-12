import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, DollarSign, TrendingUp, Clock, Briefcase, Loader2, UserCheck, UserPlus, ClipboardList } from 'lucide-react';
import { getHRDashboardStats } from '../../api/hr';
import toast from '../../utils/toast';

const HRHome = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    pendingLeaves: 0,
    payrollThisMonth: 0,
    openPositions: 0,
    recruitment: {
      totalApplications: 0,
      shortlisted: 0,
      interviewScheduled: 0,
      selected: 0,
      rejected: 0
    },
    onboarding: {
      total: 0,
      preboarding: 0,
      inProgress: 0,
      completed: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getHRDashboardStats();
      if (response.success) {
        setStats(response.data);
      } else {
        setError(response.message || 'Failed to load dashboard stats');
        toast.error(response.message || 'Failed to load dashboard stats');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to load dashboard stats';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const statsData = [
    { name: 'Total Employees', value: stats.totalEmployees.toString(), icon: Users, color: 'from-blue-500 to-blue-600' },
    { name: 'Pending Leaves', value: stats.pendingLeaves.toString(), icon: Calendar, color: 'from-orange-500 to-orange-600' },
    { name: 'Payroll This Month', value: formatCurrency(stats.payrollThisMonth), icon: DollarSign, color: 'from-green-500 to-green-600' },
    { name: 'Open Positions', value: stats.openPositions.toString(), icon: Briefcase, color: 'from-purple-500 to-purple-600' },
  ];

  const recruitmentData = [
    { name: 'Total Applications', value: stats.recruitment?.totalApplications || 0, icon: Users, color: 'from-cyan-500 to-cyan-600' },
    { name: 'Shortlisted', value: stats.recruitment?.shortlisted || 0, icon: UserCheck, color: 'from-green-500 to-green-600' },
    { name: 'Interview Scheduled', value: stats.recruitment?.interviewScheduled || 0, icon: Calendar, color: 'from-blue-500 to-blue-600' },
    { name: 'Selected', value: stats.recruitment?.selected || 0, icon: UserPlus, color: 'from-emerald-500 to-emerald-600' },
  ];

  const onboardingData = [
    { name: 'Total Onboarding', value: stats.onboarding?.total || 0, icon: ClipboardList, color: 'from-indigo-500 to-indigo-600' },
    { name: 'Preboarding', value: stats.onboarding?.preboarding || 0, icon: Clock, color: 'from-yellow-500 to-yellow-600' },
    { name: 'In Progress', value: stats.onboarding?.inProgress || 0, icon: TrendingUp, color: 'from-orange-500 to-orange-600' },
    { name: 'Completed', value: stats.onboarding?.completed || 0, icon: UserCheck, color: 'from-green-500 to-green-600' },
  ];

  return (
    <div className="min-h-screen bg-[#1E1E2A] p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">HR Dashboard</h1>
        <p className="text-gray-400">Welcome to HR Management Portal</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500/40 text-red-300 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64 mb-8">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#A88BFF]" />
            <p className="text-gray-400">Loading dashboard stats...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsData.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.name} className="bg-[#2A2A3A] rounded-2xl p-6 border border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-gray-400 text-sm mb-1">{stat.name}</h3>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Recruitment Stats */}
      <div className="bg-[#2A2A3A] rounded-2xl p-6 border border-gray-800 mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Recruitment Pipeline</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {recruitmentData.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.name} className="bg-[#1E1E2A] rounded-xl p-4 border border-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <h3 className="text-gray-400 text-xs mb-1">{stat.name}</h3>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Onboarding Stats */}
      <div className="bg-[#2A2A3A] rounded-2xl p-6 border border-gray-800 mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Onboarding Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {onboardingData.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.name} className="bg-[#1E1E2A] rounded-xl p-4 border border-gray-800">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <h3 className="text-gray-400 text-xs mb-1">{stat.name}</h3>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-[#2A2A3A] rounded-2xl p-6 border border-gray-800">
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/employees')}
            className="p-4 bg-[#1E1E2A] rounded-xl hover:bg-[#3A3A4A] transition-colors text-left"
          >
            <Users className="w-6 h-6 text-[#A88BFF] mb-2" />
            <h3 className="text-white font-semibold mb-1">Manage Employees</h3>
            <p className="text-gray-400 text-sm">View and manage employee records</p>
          </button>
          <button
            onClick={() => navigate('/approval-workflow/pending')}
            className="p-4 bg-[#1E1E2A] rounded-xl hover:bg-[#3A3A4A] transition-colors text-left"
          >
            <Calendar className="w-6 h-6 text-[#A88BFF] mb-2" />
            <h3 className="text-white font-semibold mb-1">Leave Approvals</h3>
            <p className="text-gray-400 text-sm">Review pending leave requests</p>
          </button>
          <button
            onClick={() => navigate('/payroll')}
            className="p-4 bg-[#1E1E2A] rounded-xl hover:bg-[#3A3A4A] transition-colors text-left"
          >
            <DollarSign className="w-6 h-6 text-[#A88BFF] mb-2" />
            <h3 className="text-white font-semibold mb-1">Process Payroll</h3>
            <p className="text-gray-400 text-sm">Generate and manage payroll</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HRHome;
