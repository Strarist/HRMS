import React, { useState, useEffect } from 'react';
import { toast } from '../../utils/toast';
import {
  Building,
  Plus,
  Edit,
  Trash2,
  Users,
  Search,
  X,
  Save,
  User,
  Eye
} from 'lucide-react';
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from '../../api/department';
import { getEmployees, updateEmployee } from '../../api/hr';

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showViewEmployeesModal, setShowViewEmployeesModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    head: ''
  });

  useEffect(() => {
    fetchDepartments();
    fetchEmployees();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await getDepartments();
      setDepartments(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch departments');
      console.error('Error fetching departments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await getEmployees();
      setEmployees(response.data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to load employees');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createDepartment(formData);
      toast.success('Department created successfully');
      setShowCreateModal(false);
      setFormData({ name: '', code: '', description: '', head: '' });
      fetchDepartments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create department');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateDepartment(selectedDepartment._id, formData);
      toast.success('Department updated successfully');
      setShowEditModal(false);
      setSelectedDepartment(null);
      setFormData({ name: '', code: '', description: '', head: '' });
      fetchDepartments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update department');
    }
  };

  const handleDelete = async (departmentId) => {
    if (!confirm('Are you sure you want to delete this department? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteDepartment(departmentId);
      toast.success('Department deleted successfully');
      fetchDepartments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete department');
    }
  };

  const openEditModal = (department) => {
    setSelectedDepartment(department);
    setFormData({
      name: department.name || '',
      code: department.code || '',
      description: department.description || '',
      head: department.head?._id || department.head || ''
    });
    setShowEditModal(true);
  };

  const openAssignModal = (department) => {
    setSelectedDepartment(department);
    setShowAssignModal(true);
  };

  const openViewEmployeesModal = (department) => {
    setSelectedDepartment(department);
    setShowViewEmployeesModal(true);
  };

  const handleAssignEmployee = async (employeeId, departmentId) => {
    try {
      // Update employee department
      await updateEmployee(employeeId, { departmentId });
      toast.success('Employee assigned to department successfully');
      fetchEmployees(); // Refresh the employee list to show updated assignments
    } catch (error) {
      toast.error('Failed to assign employee to department');
    }
  };

  const filteredDepartments = departments.filter(dept =>
    dept.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEmployeeCount = (departmentId) => {
    return employees.filter(emp => emp.departmentId === departmentId).length;
  };

  const getDepartmentHead = (headId) => {
    const head = employees.find(emp => emp._id === headId);
    return head ? `${head.firstName} ${head.lastName}` : 'Not Assigned';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1E1E2A]">
        <div className="text-white">Loading departments...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1E1E2A] text-white p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Building className="h-8 w-8 text-[#A88BFF]" />
            Department Management
          </h1>
          <p className="text-gray-400 mt-1">Create and manage departments, assign employees</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-[#A88BFF] to-[#7DB539] hover:from-[#A88BFF]/80 hover:to-[#7DB539]/80 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200"
        >
          <Plus className="h-5 w-5" />
          Create Department
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search departments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#2A2A3A] border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#A88BFF] focus:border-transparent"
          />
        </div>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDepartments.map((department) => (
          <div key={department._id} className="bg-[#2A2A3A] rounded-xl border border-gray-800 p-6 hover:border-[#A88BFF] transition-all duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#A88BFF]/20 rounded-lg">
                  <Building className="h-6 w-6 text-[#A88BFF]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{department.name}</h3>
                  <p className="text-sm text-gray-400">{department.code}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(department)}
                  className="p-2 text-gray-400 hover:text-[#A88BFF] hover:bg-[#A88BFF]/10 rounded-lg transition-colors"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(department._id)}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <p className="text-gray-300 text-sm mb-4 line-clamp-2">
              {department.description || 'No description available'}
            </p>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Head:</span>
                <span className="text-white">{getDepartmentHead(department.head)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Employees:</span>
                <span className="text-white">{getEmployeeCount(department._id)}</span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <button
                onClick={() => openAssignModal(department)}
                className="bg-[#A88BFF]/20 hover:bg-[#A88BFF]/30 text-[#A88BFF] py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition-colors text-sm"
              >
                <Users className="h-3.5 w-3.5" />
                Assign Employees
              </button>
              <button
                onClick={() => openViewEmployeesModal(department)}
                className="bg-[#7DB539]/20 hover:bg-[#7DB539]/30 text-[#7DB539] py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition-colors text-sm"
              >
                <Eye className="h-3.5 w-3.5" />
                View Employees
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Department Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#2A2A3A] rounded-xl border border-gray-800 p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Create Department</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Department Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1E1E2A] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#A88BFF] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Department Code *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 bg-[#1E1E2A] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#A88BFF] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-[#1E1E2A] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#A88BFF] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Department Head
                </label>
                <select
                  value={formData.head}
                  onChange={(e) => setFormData({ ...formData, head: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1E1E2A] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#A88BFF] focus:border-transparent"
                >
                  <option value="">Select Department Head</option>
                  {employees.map((employee) => (
                    <option key={employee._id} value={employee._id}>
                      {employee.firstName} {employee.lastName} - {employee.designation}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-[#A88BFF] to-[#7DB539] hover:from-[#A88BFF]/80 hover:to-[#7DB539]/80 text-white rounded-lg transition-colors"
                >
                  Create Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Department Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#2A2A3A] rounded-xl border border-gray-800 p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Edit Department</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Department Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1E1E2A] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#A88BFF] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Department Code *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 bg-[#1E1E2A] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#A88BFF] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-[#1E1E2A] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#A88BFF] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Department Head
                </label>
                <select
                  value={formData.head}
                  onChange={(e) => setFormData({ ...formData, head: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1E1E2A] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#A88BFF] focus:border-transparent"
                >
                  <option value="">Select Department Head</option>
                  {employees.map((employee) => (
                    <option key={employee._id} value={employee._id}>
                      {employee.firstName} {employee.lastName} - {employee.designation}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-[#A88BFF] to-[#7DB539] hover:from-[#A88BFF]/80 hover:to-[#7DB539]/80 text-white rounded-lg transition-colors"
                >
                  Update Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Employees Modal */}
      {showViewEmployeesModal && selectedDepartment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#2A2A3A] rounded-xl border border-gray-800 p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                Employees in {selectedDepartment.name}
              </h2>
              <button
                onClick={() => setShowViewEmployeesModal(false)}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              {employees.filter(employee => 
                employee.departmentId === selectedDepartment._id || 
                employee.department === selectedDepartment._id ||
                (employee.department?._id && employee.department._id === selectedDepartment._id)
              ).length > 0 ? (
                employees
                  .filter(employee => 
                    employee.departmentId === selectedDepartment._id || 
                    employee.department === selectedDepartment._id ||
                    (employee.department?._id && employee.department._id === selectedDepartment._id)
                  )
                  .map((employee) => (
                    <div key={employee._id} className="flex items-center justify-between p-4 bg-[#1E1E2A] rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#A88BFF] to-[#7DB539] rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {employee.firstName?.[0]}{employee.lastName?.[0]}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {employee.firstName} {employee.lastName}
                          </p>
                          <p className="text-gray-400 text-sm">{employee.designation}</p>
                          <p className="text-gray-500 text-xs">{employee.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-400 text-sm">{employee.employeeCode || 'N/A'}</p>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No employees assigned to this department</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-6">
              <button
                onClick={() => setShowViewEmployeesModal(false)}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Employees Modal */}
      {showAssignModal && selectedDepartment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#2A2A3A] rounded-xl border border-gray-800 p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                Assign Employees to {selectedDepartment.name}
              </h2>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-gray-400 hover:text-white p-1"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              {employees.filter(employee => !employee.departmentId).map((employee) => (
                <div key={employee._id} className="flex items-center justify-between p-4 bg-[#1E1E2A] rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#A88BFF] to-[#7DB539] rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {employee.firstName?.[0]}{employee.lastName?.[0]}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        {employee.firstName} {employee.lastName}
                      </p>
                      <p className="text-gray-400 text-sm">{employee.designation}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-sm">
                      {employee.departmentId === selectedDepartment._id ? 'Assigned' : 'Not Assigned'}
                    </span>
                    <button
                      onClick={() => handleAssignEmployee(employee._id, selectedDepartment._id)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        employee.departmentId === selectedDepartment._id
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-[#A88BFF] hover:bg-[#A88BFF]/80 text-white'
                      }`}
                    >
                      {employee.departmentId === selectedDepartment._id ? 'Assigned' : 'Assign'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-6">
              <button
                onClick={() => setShowAssignModal(false)}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {filteredDepartments.length === 0 && !loading && (
        <div className="text-center py-12">
          <Building className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No departments found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first department'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-[#A88BFF] to-[#7DB539] hover:from-[#A88BFF]/80 hover:to-[#7DB539]/80 text-white px-6 py-3 rounded-lg flex items-center gap-2 mx-auto"
            >
              <Plus className="h-5 w-5" />
              Create Department
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default DepartmentManagement;