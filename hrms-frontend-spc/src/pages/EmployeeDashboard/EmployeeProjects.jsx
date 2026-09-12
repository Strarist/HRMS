import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { getEmployeeProjects } from '../../api/employeeDashboard';
import toast from '../../utils/toast';
import { Briefcase, Users, Calendar, CheckCircle, Clock } from 'lucide-react';

const EmployeeProjects = () => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await getEmployeeProjects();
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'planning':
        return 'bg-blue-100 text-blue-800';
      case 'on-hold':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className={`mt-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Loading projects...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          My Projects
        </h1>
        <p className={`mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          View your assigned projects and tasks
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {projects.map((project, index) => (
          <div
            key={index}
            className={`rounded-xl p-6 ${theme === 'dark' ? 'bg-dark-800' : 'bg-white'}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {project.name}
                </h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {project.projectCode}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(project.status)}`}>
                {project.status}
              </span>
            </div>

            <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {project.description}
            </p>

            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <Briefcase className="w-4 h-4 mr-2 text-primary-600" />
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                  Client:
                </span>
                <span className={`ml-2 font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {project.client?.name || 'N/A'}
                </span>
              </div>

              <div className="flex items-center text-sm">
                <Users className="w-4 h-4 mr-2 text-primary-600" />
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                  My Role:
                </span>
                <span className={`ml-2 font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {project.myRole || 'Team Member'}
                </span>
              </div>

              <div className="flex items-center text-sm">
                <Calendar className="w-4 h-4 mr-2 text-primary-600" />
                <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                  Duration:
                </span>
                <span className={`ml-2 font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {new Date(project.startDate).toLocaleDateString()} - 
                  {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Ongoing'}
                </span>
              </div>

              {project.projectManager && (
                <div className="flex items-center text-sm">
                  <Users className="w-4 h-4 mr-2 text-primary-600" />
                  <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    Manager:
                  </span>
                  <span className={`ml-2 font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {project.projectManager.name}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {projects.length === 0 && (
        <div className={`rounded-xl p-12 text-center ${theme === 'dark' ? 'bg-dark-800' : 'bg-white'}`}>
          <Briefcase className={`w-16 h-16 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`} />
          <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            No projects assigned yet
          </p>
        </div>
      )}
    </div>
  );
};

export default EmployeeProjects;
