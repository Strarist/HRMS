import React, { useState, useEffect } from 'react';
import BottomNavigation from '../../components/BottomNavigation';
import { Briefcase, Users, Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { getEmployeeProjects } from '../../api/employeeDashboard';
import toast from '../../utils/toast';

const ModernProjects = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await getEmployeeProjects();
      
      // Transform backend data to match component format
      const transformedProjects = response.data.map(project => ({
        id: project._id,
        name: project.name,
        projectCode: project.projectCode,
        client: project.client?.name || project.client?.companyName || 'N/A',
        status: project.status,
        progress: calculateProgress(project.status),
        team: project.teamSize || 0,
        deadline: project.endDate ? new Date(project.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Ongoing',
        role: project.myRole,
        description: project.description,
        startDate: project.startDate,
        projectManager: project.projectManager
      }));
      
      setProjects(transformedProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (status) => {
    switch (status) {
      case 'completed':
        return 100;
      case 'active':
        return 60;
      case 'on-hold':
        return 40;
      case 'planning':
        return 20;
      default:
        return 0;
    }
  };

  const filters = [
    { id: 'all', label: 'All Projects' },
    { id: 'active', label: 'Active' },
    { id: 'completed', label: 'Completed' }
  ];

  const filteredProjects = activeFilter === 'all' 
    ? projects 
    : projects.filter(p => p.status === activeFilter);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1E1E2A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#A88BFF] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1E1E2A] p-4 md:p-6 pb-24 md:pb-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">My Projects</h1>
          <p className="text-gray-400 mt-1">Track your project assignments and progress</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#2A2A3A] rounded-2xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-sm">Total Projects</p>
              <Briefcase className="w-5 h-5 text-[#A88BFF]" />
            </div>
            <h3 className="text-3xl font-bold text-white">{projects.length}</h3>
          </div>

          <div className="bg-[#2A2A3A] rounded-2xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-sm">Active</p>
              <AlertCircle className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-3xl font-bold text-white">
              {projects.filter(p => p.status === 'active').length}
            </h3>
          </div>

          <div className="bg-[#2A2A3A] rounded-2xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400 text-sm">Completed</p>
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <h3 className="text-3xl font-bold text-white">
              {projects.filter(p => p.status === 'completed').length}
            </h3>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-hide">
          {filters.map(filter => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                activeFilter === filter.id
                  ? 'bg-gradient-to-r from-[#A88BFF] to-[#8B6FE8] text-white shadow-lg'
                  : 'bg-[#2A2A3A] text-gray-400 hover:text-white border border-gray-700'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Projects List */}
        <div className="space-y-4">
          {filteredProjects.map(project => (
            <div key={project.id} className="bg-[#2A2A3A] rounded-2xl p-6 border border-gray-700 hover:border-[#A88BFF] transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#A88BFF] to-[#8B6FE8] flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white text-lg font-semibold">{project.name}</h3>
                    <p className="text-gray-400 text-sm mt-1">{project.client}</p>
                    <p className="text-[#A88BFF] text-sm mt-1">{project.role}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  project.status === 'active'
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'bg-green-500/20 text-green-400'
                }`}>
                  {project.status.toUpperCase()}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Progress</span>
                  <span className="text-white font-medium">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-[#A88BFF] to-[#8B6FE8] h-2 rounded-full transition-all"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Project Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400 text-sm">{project.team} members</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400 text-sm">{project.deadline}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400 text-sm">
                    {project.status === 'completed' ? 'Completed' : 'In Progress'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="bg-[#2A2A3A] rounded-2xl p-12 border border-gray-700 text-center">
            <Briefcase className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-white text-lg font-semibold mb-2">No projects found</h3>
            <p className="text-gray-400">No projects match the selected filter</p>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default ModernProjects;
