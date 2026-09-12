import React, { useEffect, useState } from 'react';
import { Plus, Search, FolderKanban, X, Loader2, Eye } from 'lucide-react';
import api from '../../api/axios';
import toast from '../../utils/toast';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [clients, setClients] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    client: '',
    description: '',
    location: '',
    startDate: '',
    endDate: '',
    status: 'planning',
    projectManager: '',
    budget: {
      estimated: '',
      actual: '',
      currency: 'USD'
    }
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchProjects();
    fetchClients();
    fetchEmployees();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data.data);
    } catch (error) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
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
      // Filter employees who can be project managers (managers, hr, admin, company_admin)
      const managerRoles = ['manager', 'hr', 'admin', 'company_admin'];
      const managers = (response.data.data || []).filter(emp => 
        managerRoles.includes(emp.role)
      );
      setEmployees(managers);
    } catch (error) {
      console.error('Failed to load employees:', error);
    }
  };

  const handleAdd = () => {
    setFormData({
      name: '',
      client: '',
      description: '',
      location: '',
      startDate: '',
      endDate: '',
      status: 'planning',
      projectManager: '',
      budget: {
        estimated: '',
        actual: '',
        currency: 'USD'
      }
    });
    setErrors({});
    setSelectedProject(null);
    setShowAddModal(true);
  };

  const handleEdit = (project) => {
    setFormData({
      name: project.name || '',
      client: project.client?._id || project.client || '',
      description: project.description || '',
      location: project.location || '',
      startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
      endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
      status: project.status || 'planning',
      projectManager: project.projectManager?._id || project.projectManager || '',
      budget: {
        estimated: project.budget?.estimated || '',
        actual: project.budget?.actual || '',
        currency: project.budget?.currency || 'USD'
      }
    });
    setErrors({});
    setSelectedProject(project);
    setShowEditModal(true);
  };

  const handleViewDetails = (project) => {
    setSelectedProject(project);
    setShowViewModal(true);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    }
    if (!formData.client) {
      newErrors.client = 'Client is required';
    }
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    if (formData.endDate && formData.startDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

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
      const payload = {
        ...formData,
        budget: {
          estimated: formData.budget.estimated ? parseFloat(formData.budget.estimated) : undefined,
          actual: formData.budget.actual ? parseFloat(formData.budget.actual) : undefined,
          currency: formData.budget.currency
        }
      };

      // Remove empty optional fields
      if (!payload.description) delete payload.description;
      if (!payload.endDate) delete payload.endDate;
      if (!payload.projectManager) delete payload.projectManager;
      if (!payload.budget.estimated) delete payload.budget.estimated;
      if (!payload.budget.actual) delete payload.budget.actual;

      if (selectedProject) {
        // Update
        await api.put(`/projects/${selectedProject._id}`, payload);
        toast.success('Project updated successfully');
        setShowEditModal(false);
      } else {
        // Create
        await api.post('/projects', payload);
        toast.success('Project created successfully');
        setShowAddModal(false);
      }
      
      setSelectedProject(null);
      fetchProjects();
    } catch (error) {
      toast.error(error?.response?.data?.message || `Failed to ${selectedProject ? 'update' : 'create'} project`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const filteredProjects = projects.filter(project => 
    filterStatus === 'all' || project.status === filterStatus
  );

  const getStatusBadge = (status) => {
    const badges = {
      planning: 'badge-info',
      active: 'badge-success',
      'on-hold': 'badge-warning',
      completed: 'badge-default',
      cancelled: 'badge-danger'
    };
    return badges[status] || 'badge-default';
  };

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
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-gray-400 mt-1">Manage client projects and assignments</p>
        </div>
        <button onClick={handleAdd} className="btn-primary flex items-center space-x-2">
          <Plus size={20} />
          <span>Add Project</span>
        </button>
      </div>

      <div className="card">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input-field w-48"
        >
          <option value="all">All Status</option>
          <option value="planning">Planning</option>
          <option value="active">Active</option>
          <option value="on-hold">On Hold</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <div key={project._id} className="card hover:border-primary-600 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary-600/20 rounded-lg flex items-center justify-center">
                  <FolderKanban size={24} className="text-primary-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                  <p className="text-sm text-gray-400">{project.projectCode}</p>
                </div>
              </div>
              <span className={`badge ${getStatusBadge(project.status)}`}>
                {project.status}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-400">
                <span className="font-medium text-gray-300 w-24">Client:</span>
                <span>{project.client?.name}</span>
              </div>
              <div className="flex items-center text-sm text-gray-400">
                <span className="font-medium text-gray-300 w-24">Location:</span>
                <span>{project.location}</span>
              </div>
              <div className="flex items-center text-sm text-gray-400">
                <span className="font-medium text-gray-300 w-24">Manager:</span>
                <span>
                  {project.projectManager ? 
                    `${project.projectManager.firstName} ${project.projectManager.lastName}` : 
                    'Not assigned'}
                </span>
              </div>
              <div className="flex items-center text-sm text-gray-400">
                <span className="font-medium text-gray-300 w-24">Team Size:</span>
                <span>{project.teamMembers?.filter(tm => tm.isActive).length || 0}</span>
              </div>
              <div className="flex items-center text-sm text-gray-400">
                <span className="font-medium text-gray-300 w-24">Duration:</span>
                <span>
                  {new Date(project.startDate).toLocaleDateString()} - 
                  {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Ongoing'}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleViewDetails(project)}
                className="flex-1 btn-primary text-sm"
              >
                <Eye size={16} className="inline mr-1" />
                View Details
              </button>
              <button
                onClick={() => handleEdit(project)}
                className="btn-outline text-sm px-3"
                title="Edit Project"
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <FolderKanban size={48} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">No projects found</p>
        </div>
      )}

      {/* Add Project Modal */}
      {showAddModal && (
        <ProjectModal
          formData={formData}
          errors={errors}
          submitting={submitting}
          clients={clients}
          employees={employees}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onClose={() => {
            setShowAddModal(false);
            setFormData({
              name: '',
              client: '',
              description: '',
              location: '',
              startDate: '',
              endDate: '',
              status: 'planning',
              projectManager: '',
              budget: { estimated: '', actual: '', currency: 'USD' }
            });
            setErrors({});
          }}
          title="Add Project"
        />
      )}

      {/* Edit Project Modal */}
      {showEditModal && (
        <ProjectModal
          formData={formData}
          errors={errors}
          submitting={submitting}
          clients={clients}
          employees={employees}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onClose={() => {
            setShowEditModal(false);
            setSelectedProject(null);
            setFormData({
              name: '',
              client: '',
              description: '',
              location: '',
              startDate: '',
              endDate: '',
              status: 'planning',
              projectManager: '',
              budget: { estimated: '', actual: '', currency: 'USD' }
            });
            setErrors({});
          }}
          title="Edit Project"
        />
      )}

      {/* View Project Details Modal */}
      {showViewModal && selectedProject && (
        <ProjectDetailsModal
          project={selectedProject}
          onClose={() => {
            setShowViewModal(false);
            setSelectedProject(null);
          }}
          onEdit={() => {
            setShowViewModal(false);
            handleEdit(selectedProject);
          }}
        />
      )}
    </div>
  );
};

// Project Modal Component
const ProjectModal = ({ formData, errors, submitting, clients, employees, onChange, onSubmit, onClose, title }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Project Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={onChange}
                  className={`input-field w-full ${errors.name ? 'border-red-500' : ''}`}
                  required
                />
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Client <span className="text-red-400">*</span>
                </label>
                <select
                  name="client"
                  value={formData.client}
                  onChange={onChange}
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

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Location <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={onChange}
                  className={`input-field w-full ${errors.location ? 'border-red-500' : ''}`}
                  required
                />
                {errors.location && <p className="text-red-400 text-xs mt-1">{errors.location}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Status <span className="text-red-400">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={onChange}
                  className="input-field w-full"
                  required
                >
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="on-hold">On Hold</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Start Date <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={onChange}
                  className={`input-field w-full ${errors.startDate ? 'border-red-500' : ''}`}
                  required
                />
                {errors.startDate && <p className="text-red-400 text-xs mt-1">{errors.startDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={onChange}
                  min={formData.startDate}
                  className={`input-field w-full ${errors.endDate ? 'border-red-500' : ''}`}
                />
                {errors.endDate && <p className="text-red-400 text-xs mt-1">{errors.endDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Project Manager</label>
                <select
                  name="projectManager"
                  value={formData.projectManager}
                  onChange={onChange}
                  className="input-field w-full"
                >
                  <option value="">Not Assigned</option>
                  {employees.map(emp => (
                    <option key={emp._id} value={emp._id}>
                      {emp.firstName} {emp.lastName} ({emp.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={onChange}
              className="input-field w-full"
              rows="4"
              placeholder="Project description..."
            />
          </div>

          {/* Budget */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Budget</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Estimated Amount</label>
                <input
                  type="number"
                  name="budget.estimated"
                  value={formData.budget.estimated}
                  onChange={onChange}
                  className="input-field w-full"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Actual Amount</label>
                <input
                  type="number"
                  name="budget.actual"
                  value={formData.budget.actual}
                  onChange={onChange}
                  className="input-field w-full"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Currency</label>
                <select
                  name="budget.currency"
                  value={formData.budget.currency}
                  onChange={onChange}
                  className="input-field w-full"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="INR">INR</option>
                </select>
              </div>
            </div>
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
              <span>{submitting ? 'Saving...' : 'Save Project'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Project Details Modal Component
const ProjectDetailsModal = ({ project, onClose, onEdit }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Project Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Project Information */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Project Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Project Name</p>
                <p className="text-white font-medium">{project.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Project Code</p>
                <p className="text-white font-medium">{project.projectCode}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Client</p>
                <p className="text-white font-medium">{project.client?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Status</p>
                <p className="text-white font-medium capitalize">{project.status}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Location</p>
                <p className="text-white font-medium">{project.location}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Project Manager</p>
                <p className="text-white font-medium">
                  {project.projectManager ? 
                    `${project.projectManager.firstName} ${project.projectManager.lastName}` : 
                    'Not assigned'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Start Date</p>
                <p className="text-white font-medium">
                  {new Date(project.startDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">End Date</p>
                <p className="text-white font-medium">
                  {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Ongoing'}
                </p>
              </div>
            </div>
            {project.description && (
              <div className="mt-4">
                <p className="text-sm text-gray-400 mb-2">Description</p>
                <p className="text-white">{project.description}</p>
              </div>
            )}
          </div>

          {/* Budget */}
          {project.budget && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Budget</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Estimated</p>
                  <p className="text-white font-medium">
                    {project.budget.estimated ? 
                      `${project.budget.currency || 'USD'} ${project.budget.estimated.toLocaleString()}` : 
                      'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Actual</p>
                  <p className="text-white font-medium">
                    {project.budget.actual ? 
                      `${project.budget.currency || 'USD'} ${project.budget.actual.toLocaleString()}` : 
                      'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Team Members */}
          {project.teamMembers && project.teamMembers.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Team Members</h3>
              <div className="space-y-2">
                {project.teamMembers.filter(tm => tm.isActive).map((member, idx) => (
                  <div key={idx} className="p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">
                          {member.employee?.firstName} {member.employee?.lastName}
                        </p>
                        <p className="text-sm text-gray-400">{member.role}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400">Status</p>
                        <p className="text-green-400">Active</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700"
            >
              Close
            </button>
            <button
              onClick={onEdit}
              className="btn-primary px-6 py-2"
            >
              Edit Project
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectList;
