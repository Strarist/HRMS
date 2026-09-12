import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNavigation from '../../components/BottomNavigation';
import { config } from '../../config/api.config';
import {
  ArrowLeft,
  Users,
  UserCheck,
  CalendarCheck,
  Briefcase,
  Clock,
  Loader2
} from 'lucide-react';

const defaultStats = {
  totalMembers: 0,
  present: 0,
  onLeave: 0
};

const TeamReports = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [teamStats, setTeamStats] = useState(defaultStats);
  const [teamMembers, setTeamMembers] = useState([]);
  const [projects, setProjects] = useState({ current: [], past: [] });
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication token missing. Please login again.');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const headers = { 'Authorization': `Bearer ${token}` };

        const [statsRes, membersRes, projectsRes] = await Promise.all([
          fetch(`${config.apiBaseUrl}/manager/team-stats`, { headers }),
          fetch(`${config.apiBaseUrl}/manager/team-members`, { headers }),
          fetch(`${config.apiBaseUrl}/manager/projects`, { headers })
        ]);

        const [statsJson, membersJson, projectsJson] = await Promise.all([
          statsRes.json(),
          membersRes.json(),
          projectsRes.json()
        ]);

        if (!statsJson.success) {
          throw new Error(statsJson.message || 'Unable to load team statistics');
        }
        if (!membersJson.success) {
          throw new Error(membersJson.message || 'Unable to load team members');
        }
        if (!projectsJson.success) {
          throw new Error(projectsJson.message || 'Unable to load projects');
        }

        setTeamStats(statsJson.data || defaultStats);
        setTeamMembers(Array.isArray(membersJson.data) ? membersJson.data : []);

        // API may return an array of projects OR { current, past }
        const projectPayload = projectsJson.data;
        if (Array.isArray(projectPayload)) {
          const current = projectPayload.filter(
            (p) => !p.status || ['active', 'in_progress', 'ongoing'].includes(String(p.status).toLowerCase())
          );
          const past = projectPayload.filter(
            (p) => p.status && ['completed', 'closed', 'archived', 'cancelled'].includes(String(p.status).toLowerCase())
          );
          setProjects({
            current: current.length ? current : projectPayload,
            past
          });
        } else {
          setProjects({
            current: Array.isArray(projectPayload?.current) ? projectPayload.current : [],
            past: Array.isArray(projectPayload?.past) ? projectPayload.past : []
          });
        }
        setError(null);
      } catch (err) {
        console.error('Failed to load team reports:', err);
        const message = err?.message || 'Failed to load team reports';
        if (message.toLowerCase().includes('client must be connected')) {
          setError('Unable to reach the tenant database. Please ensure the backend is running and refresh the page.');
        } else {
          setError(message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const attendanceSummary = useMemo(() => {
    const total = teamStats.totalMembers || 0;
    const present = teamStats.present || 0;
    const onLeave = teamStats.onLeave || 0;
    const absent = Math.max(total - present - onLeave, 0);

    const rate = total > 0 ? Math.round((present / total) * 100) : 0;

    return {
      total,
      present,
      onLeave,
      absent,
      rate
    };
  }, [teamStats]);

  return (
    <div className="min-h-screen bg-[#1E1E2A] pb-24 md:pb-6">
      <div className="sticky top-0 z-10 bg-[#1E1E2A] border-b border-gray-800 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/manager/dashboard')}
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Back to Manager Dashboard"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">Team Reports</h1>
              <p className="text-gray-400 text-sm">Overview of your team performance and staffing</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 card">
            <Loader2 className="w-10 h-10 text-[#A88BFF] animate-spin mb-3" />
            <p className="text-gray-400">Loading team reports...</p>
          </div>
        ) : error ? (
          <div className="card border border-red-500/40 bg-red-500/10 text-red-200 p-6">
            <h2 className="text-lg font-semibold mb-2">Unable to load team data</h2>
            <p className="text-sm">{error}</p>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <SummaryCard
                icon={Users}
                label="Team Members"
                value={attendanceSummary.total}
                subtitle="Total active members"
              />
              <SummaryCard
                icon={UserCheck}
                label="Present Today"
                value={attendanceSummary.present}
                accent="text-green-400"
                subtitle={`Attendance rate ${attendanceSummary.rate}%`}
              />
              <SummaryCard
                icon={CalendarCheck}
                label="On Leave"
                value={attendanceSummary.onLeave}
                accent="text-yellow-400"
                subtitle="Approved leaves"
              />
              <SummaryCard
                icon={Clock}
                label="Absent"
                value={attendanceSummary.absent}
                accent="text-red-400"
                subtitle="Not checked-in today"
              />
            </div>

            {/* Team Composition */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Team Composition</h2>
                <span className="text-sm text-gray-400">Active members: {teamMembers.length}</span>
              </div>
              {teamMembers.length === 0 ? (
                <p className="text-gray-400 text-sm">No team members assigned yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="text-left text-sm text-gray-400">
                        <th className="pb-3">Name</th>
                        <th className="pb-3">Email</th>
                        <th className="pb-3">Designation</th>
                        <th className="pb-3">Department</th>
                        <th className="pb-3">Employee Code</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm text-gray-300 divide-y divide-gray-800">
                      {teamMembers.map(member => (
                        <tr key={member._id || member.email || member.employeeCode} className="hover:bg-[#2A2A3A] transition-colors">
                          <td className="py-3 pr-4 font-medium text-white">
                            {member.firstName || ''} {member.lastName || ''}
                          </td>
                          <td className="py-3 pr-4">{member.email || '—'}</td>
                          <td className="py-3 pr-4">{member.designation || member.position || '—'}</td>
                          <td className="py-3 pr-4">{member.department?.name || (typeof member.department === 'string' ? member.department : '—')}</td>
                          <td className="py-3 pr-4">{member.employeeCode || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Project Allocation */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ProjectOverview title="Active Projects" projects={projects?.current} emptyMessage="No active projects" />
              <ProjectOverview title="Recent Projects" projects={projects?.past?.slice?.(0, 5)} emptyMessage="No recent projects" />
            </div>
          </>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

const SummaryCard = ({ icon: Icon, label, value, subtitle, accent }) => (
  <div className="card p-5">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-400">{label}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
      <div className="p-3 rounded-xl bg-[#A88BFF]/10">
        <Icon className={`w-6 h-6 text-[#A88BFF] ${accent || ''}`} />
      </div>
    </div>
    {subtitle && <p className="text-xs text-gray-500 mt-3">{subtitle}</p>}
  </div>
);

const ProjectOverview = ({ title, projects, emptyMessage }) => {
  const list = Array.isArray(projects) ? projects : [];

  return (
  <div className="card p-6">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold text-white flex items-center gap-2">
        <Briefcase className="w-5 h-5 text-[#A88BFF]" />
        {title}
      </h2>
      <span className="text-xs text-gray-400 uppercase tracking-wide">{list.length} Projects</span>
    </div>

    {list.length === 0 ? (
      <p className="text-gray-400 text-sm">{emptyMessage}</p>
    ) : (
      <div className="space-y-3">
        {list.map(project => (
          <div key={project._id || project.id || project.projectCode || project.name} className="bg-[#1E1E2A] rounded-xl p-4 border border-gray-800">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white font-medium">{project.name || 'Untitled project'}</p>
                <p className="text-xs text-gray-500">{project.projectCode || ''}</p>
              </div>
              <span className="text-xs text-gray-400 capitalize">{project.status || '—'}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-gray-400">
              <span><span className="text-gray-500">Client:</span> {project.client?.name || '—'}</span>
              <span><span className="text-gray-500">Team Size:</span> {project.teamSize || project.teamMembers?.length || project.assignedManagers?.length || 0}</span>
              <span><span className="text-gray-500">Role:</span> {project.userRole || project.managerRole || '—'}</span>
              <span><span className="text-gray-500">Duration:</span> {formatDateRange(project.startDate, project.endDate)}</span>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
  );
};

const formatDateRange = (start, end) => {
  if (!start) return '—';
  const startDate = new Date(start).toLocaleDateString();
  const endDate = end ? new Date(end).toLocaleDateString() : 'Present';
  return `${startDate} → ${endDate}`;
};

export default TeamReports;
