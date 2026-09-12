import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Users,
  Settings,
  X,
  Save,
  AlertCircle,
  Info
} from 'lucide-react';
import api from '../../api/axios';
import toast from '../../utils/toast';

const LEAVE_TYPES = [
  'Personal Leave',
  'Sick Leave',
  'Casual Leave',
  'Comp Offs',
  'Floater Leave',
  'Marriage Leave',
  'Maternity Leave',
  'Paternity Leave',
  'Unpaid Leave'
];

const LeaveManagement = () => {
  const [loading, setLoading] = useState(true);
  const [quotas, setQuotas] = useState({ defaults: [], overrides: [], summary: {} });
  const [departments, setDepartments] = useState([]);
  const [showDefaultModal, setShowDefaultModal] = useState(false);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [editingQuota, setEditingQuota] = useState(null);
  const [editingOverride, setEditingOverride] = useState(null);
  const [defaultFormData, setDefaultFormData] = useState({
    leaveType: '',
    yearlyAllocation: 0,
    accrualFrequency: 'yearly',
    carryForwardEnabled: false,
    maxCarryForward: 0,
    isActive: true
  });
  const [overrideFormData, setOverrideFormData] = useState({
    leaveType: '',
    yearlyAllocation: 0,
    applicableTo: 'specific-departments',
    departments: [],
    designations: [],
    locations: [],
    accrualFrequency: 'yearly',
    carryForwardEnabled: false,
    maxCarryForward: 0,
    isActive: true
  });
  const [applyYear, setApplyYear] = useState(new Date().getFullYear());
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [quotasRes, deptsRes] = await Promise.all([
        api.get('/leave-management/quotas'),
        api.get('/departments')
      ]);
      setQuotas(quotasRes.data.data);
      setDepartments(deptsRes.data.data || []);
    } catch (error) {
      toast.error('Failed to load leave management data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditDefault = (quota) => {
    setEditingQuota(quota);
    setDefaultFormData({
      leaveType: quota.leaveType,
      yearlyAllocation: quota.default.yearlyAllocation || 0,
      accrualFrequency: quota.default.accrualFrequency || 'yearly',
      carryForwardEnabled: quota.default.carryForwardEnabled || false,
      maxCarryForward: quota.default.maxCarryForward || 0,
      isActive: quota.default.isActive !== false
    });
    setShowDefaultModal(true);
  };

  const handleSaveDefault = async (e) => {
    e.preventDefault();
    try {
      await api.post('/leave-management/quota/default', defaultFormData);
      toast.success('Default quota saved successfully');
      setShowDefaultModal(false);
      setEditingQuota(null);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save default quota');
    }
  };

  const handleCreateOverride = () => {
    setEditingOverride(null);
    setOverrideFormData({
      leaveType: '',
      yearlyAllocation: 0,
      applicableTo: 'specific-departments',
      departments: [],
      designations: [],
      locations: [],
      accrualFrequency: 'yearly',
      carryForwardEnabled: false,
      maxCarryForward: 0,
      isActive: true
    });
    setShowOverrideModal(true);
  };

  const handleEditOverride = (override) => {
    setEditingOverride(override);
    setOverrideFormData({
      leaveType: override.leaveType,
      yearlyAllocation: override.yearlyAllocation || 0,
      applicableTo: override.applicableTo,
      departments: override.departments?.map(d => d._id || d) || [],
      designations: override.designations || [],
      locations: override.locations || [],
      accrualFrequency: override.accrualFrequency || 'yearly',
      carryForwardEnabled: override.carryForwardEnabled || false,
      maxCarryForward: override.maxCarryForward || 0,
      isActive: override.isActive !== false
    });
    setShowOverrideModal(true);
  };

  const handleSaveOverride = async (e) => {
    e.preventDefault();
    try {
      if (editingOverride) {
        await api.put(`/leave-management/quota/override/${editingOverride._id}`, overrideFormData);
        toast.success('Override updated successfully');
      } else {
        await api.post('/leave-management/quota/override', overrideFormData);
        toast.success('Override created successfully');
      }
      setShowOverrideModal(false);
      setEditingOverride(null);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save override');
    }
  };

  const handleDeleteOverride = async (id) => {
    if (!window.confirm('Are you sure you want to delete this override?')) return;
    try {
      await api.delete(`/leave-management/quota/override/${id}`);
      toast.success('Override deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete override');
    }
  };

  const handleApplyQuotas = async () => {
    try {
      setApplying(true);
      const response = await api.post('/leave-management/quota/apply', { year: applyYear });
      toast.success(`Quotas applied successfully! Applied: ${response.data.data.applied}, Skipped: ${response.data.data.skipped}`);
      setShowApplyModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to apply quotas');
    } finally {
      setApplying(false);
    }
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Leave Management</h1>
          <p className="text-gray-400 mt-1">Configure leave quotas for all employees</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowApplyModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Users size={18} />
            <span>Apply to Employees</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-500">
              <Calendar size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Categories</p>
              <p className="text-xl font-bold text-white">{quotas.summary.totalCategories || LEAVE_TYPES.length}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-green-500">
              <CheckCircle size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Active Defaults</p>
              <p className="text-xl font-bold text-white">{quotas.summary.activeDefaults || 0}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-purple-500">
              <Settings size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Group Overrides</p>
              <p className="text-xl font-bold text-white">{quotas.summary.totalOverrides || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Default Quotas Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Default Leave Quotas</h2>
          <p className="text-sm text-gray-400">These quotas apply to all employees by default</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Leave Category</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Yearly Allocation</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Accrual Frequency</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Carry Forward</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {quotas.defaults.map((quota) => (
                <tr key={quota.leaveType} className="hover:bg-gray-800/50">
                  <td className="px-4 py-3 text-sm text-white font-medium">{quota.leaveType}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">
                    {quota.default.yearlyAllocation || 0} days
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300 capitalize">
                    {quota.default.accrualFrequency || 'yearly'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">
                    {quota.default.carryForwardEnabled ? (
                      <span className="text-green-400">Yes ({quota.default.maxCarryForward || 0} days)</span>
                    ) : (
                      <span className="text-gray-500">No</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {quota.default.isActive !== false ? (
                      <span className="flex items-center space-x-1 text-green-400">
                        <CheckCircle size={16} />
                        <span>Active</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-1 text-gray-500">
                        <XCircle size={16} />
                        <span>Inactive</span>
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleEditDefault(quota)}
                      className="text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                    >
                      <Edit2 size={16} />
                      <span>Edit</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Group Overrides Section */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Group Overrides</h2>
          <button
            onClick={handleCreateOverride}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>Add Override</span>
          </button>
        </div>
        {quotas.overrides.length === 0 ? (
          <div className="text-center py-8">
            <Info size={48} className="mx-auto text-gray-600 mb-4" />
            <p className="text-gray-400">No group overrides configured</p>
            <p className="text-sm text-gray-500 mt-2">Create overrides to set different quotas for specific departments, designations, or locations</p>
          </div>
        ) : (
          <div className="space-y-4">
            {quotas.overrides.map((override) => (
              <div key={override._id} className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-white font-medium">{override.leaveType}</h3>
                      <span className="text-sm text-gray-400">
                        {override.yearlyAllocation} days/year
                      </span>
                      {override.isActive ? (
                        <span className="badge badge-success">Active</span>
                      ) : (
                        <span className="badge badge-warning">Inactive</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-400">
                      <p>
                        <span className="font-medium">Applies to:</span>{' '}
                        {override.applicableTo === 'specific-departments' && (
                          <span>
                            Departments: {override.departments?.map(d => d.name || d).join(', ') || 'None'}
                          </span>
                        )}
                        {override.applicableTo === 'specific-designations' && (
                          <span>
                            Designations: {override.designations?.join(', ') || 'None'}
                          </span>
                        )}
                        {override.applicableTo === 'specific-locations' && (
                          <span>
                            Locations: {override.locations?.join(', ') || 'None'}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditOverride(override)}
                      className="text-blue-400 hover:text-blue-300 p-2"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteOverride(override._id)}
                      className="text-red-400 hover:text-red-300 p-2"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Default Quota Modal */}
      {showDefaultModal && (
        <DefaultQuotaModal
          formData={defaultFormData}
          setFormData={setDefaultFormData}
          onClose={() => {
            setShowDefaultModal(false);
            setEditingQuota(null);
          }}
          onSave={handleSaveDefault}
          leaveType={editingQuota?.leaveType}
        />
      )}

      {/* Override Modal */}
      {showOverrideModal && (
        <OverrideModal
          formData={overrideFormData}
          setFormData={setOverrideFormData}
          departments={departments}
          onClose={() => {
            setShowOverrideModal(false);
            setEditingOverride(null);
          }}
          onSave={handleSaveOverride}
          isEditing={!!editingOverride}
        />
      )}

      {/* Apply Quotas Modal */}
      {showApplyModal && (
        <ApplyQuotasModal
          year={applyYear}
          setYear={setApplyYear}
          onClose={() => setShowApplyModal(false)}
          onApply={handleApplyQuotas}
          applying={applying}
        />
      )}
    </div>
  );
};

// Default Quota Modal
const DefaultQuotaModal = ({ formData, setFormData, onClose, onSave, leaveType }) => {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) || 0 : value)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">
            {leaveType ? `Edit ${leaveType}` : 'Set Default Quota'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={onSave} className="space-y-4">
          {leaveType && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Leave Category
              </label>
              <input
                type="text"
                value={leaveType}
                disabled
                className="input-field w-full bg-gray-700"
              />
            </div>
          )}

          {!leaveType && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Leave Category *
              </label>
              <select
                name="leaveType"
                value={formData.leaveType}
                onChange={handleChange}
                className="input-field w-full"
                required
              >
                <option value="">Select Leave Type</option>
                {LEAVE_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Yearly Allocation (days) *
            </label>
            <input
              type="number"
              name="yearlyAllocation"
              value={formData.yearlyAllocation}
              onChange={handleChange}
              className="input-field w-full"
              min="0"
              step="0.5"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Accrual Frequency
            </label>
            <select
              name="accrualFrequency"
              value={formData.accrualFrequency}
              onChange={handleChange}
              className="input-field w-full"
            >
              <option value="yearly">Yearly (one-time allocation)</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="one-time">One-time</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="carryForwardEnabled"
              checked={formData.carryForwardEnabled}
              onChange={handleChange}
              className="rounded"
            />
            <label className="text-sm text-gray-300">Enable Carry Forward</label>
          </div>

          {formData.carryForwardEnabled && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Max Carry Forward (days)
              </label>
              <input
                type="number"
                name="maxCarryForward"
                value={formData.maxCarryForward}
                onChange={handleChange}
                className="input-field w-full"
                min="0"
              />
            </div>
          )}

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="rounded"
            />
            <label className="text-sm text-gray-300">Active</label>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary flex items-center justify-center space-x-2"
            >
              <Save size={18} />
              <span>Save</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Override Modal
const OverrideModal = ({ formData, setFormData, departments, onClose, onSave, isEditing }) => {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) || 0 : value)
    }));
  };

  const handleDepartmentChange = (deptId) => {
    setFormData(prev => {
      const depts = prev.departments || [];
      if (depts.includes(deptId)) {
        return { ...prev, departments: depts.filter(d => d !== deptId) };
      } else {
        return { ...prev, departments: [...depts, deptId] };
      }
    });
  };

  const handleDesignationChange = (e) => {
    const designations = e.target.value.split(',').map(d => d.trim()).filter(d => d);
    setFormData(prev => ({ ...prev, designations }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">
            {isEditing ? 'Edit Group Override' : 'Create Group Override'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={onSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Leave Category *
            </label>
            <select
              name="leaveType"
              value={formData.leaveType}
              onChange={handleChange}
              className="input-field w-full"
              required
            >
              <option value="">Select Leave Type</option>
              {LEAVE_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Yearly Allocation (days) *
            </label>
            <input
              type="number"
              name="yearlyAllocation"
              value={formData.yearlyAllocation}
              onChange={handleChange}
              className="input-field w-full"
              min="0"
              step="0.5"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Applies To *
            </label>
            <select
              name="applicableTo"
              value={formData.applicableTo}
              onChange={handleChange}
              className="input-field w-full"
              required
            >
              <option value="specific-departments">Specific Departments</option>
              <option value="specific-designations">Specific Designations</option>
              <option value="specific-locations">Specific Locations</option>
            </select>
          </div>

          {formData.applicableTo === 'specific-departments' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select Departments *
              </label>
              <div className="max-h-40 overflow-y-auto border border-gray-700 rounded-lg p-2">
                {departments.map(dept => (
                  <label key={dept._id} className="flex items-center space-x-2 p-2 hover:bg-gray-700 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.departments.includes(dept._id)}
                      onChange={() => handleDepartmentChange(dept._id)}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-300">{dept.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {formData.applicableTo === 'specific-designations' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Designations (comma-separated) *
              </label>
              <input
                type="text"
                value={formData.designations.join(', ')}
                onChange={handleDesignationChange}
                className="input-field w-full"
                placeholder="e.g., Manager, Senior Developer, HR Executive"
                required
              />
            </div>
          )}

          {formData.applicableTo === 'specific-locations' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Locations (comma-separated) *
              </label>
              <input
                type="text"
                value={formData.locations.join(', ')}
                onChange={(e) => {
                  const locations = e.target.value.split(',').map(l => l.trim()).filter(l => l);
                  setFormData(prev => ({ ...prev, locations }));
                }}
                className="input-field w-full"
                placeholder="e.g., Mumbai, Delhi, Bangalore"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Accrual Frequency
            </label>
            <select
              name="accrualFrequency"
              value={formData.accrualFrequency}
              onChange={handleChange}
              className="input-field w-full"
            >
              <option value="yearly">Yearly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="one-time">One-time</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="carryForwardEnabled"
              checked={formData.carryForwardEnabled}
              onChange={handleChange}
              className="rounded"
            />
            <label className="text-sm text-gray-300">Enable Carry Forward</label>
          </div>

          {formData.carryForwardEnabled && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Max Carry Forward (days)
              </label>
              <input
                type="number"
                name="maxCarryForward"
                value={formData.maxCarryForward}
                onChange={handleChange}
                className="input-field w-full"
                min="0"
              />
            </div>
          )}

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="rounded"
            />
            <label className="text-sm text-gray-300">Active</label>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn-primary flex items-center justify-center space-x-2"
            >
              <Save size={18} />
              <span>{isEditing ? 'Update' : 'Create'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Apply Quotas Modal
const ApplyQuotasModal = ({ year, setYear, onClose, onApply, applying }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Apply Quotas to Employees</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-blue-900/20 border border-blue-800 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle size={20} className="text-blue-400 mt-0.5" />
              <div>
                <p className="text-sm text-blue-300 font-medium mb-1">What this does:</p>
                <ul className="text-xs text-blue-200 space-y-1 list-disc list-inside">
                  <li>Applies default quotas to all active employees</li>
                  <li>Applies group overrides where applicable</li>
                  <li>Creates/updates LeaveBalance records for the selected year</li>
                  <li>Calculates pro-rated allocation for mid-year employees</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Year
            </label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="input-field w-full"
              min="2020"
              max="2100"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700"
              disabled={applying}
            >
              Cancel
            </button>
            <button
              onClick={onApply}
              disabled={applying}
              className="flex-1 btn-primary flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {applying ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Applying...</span>
                </>
              ) : (
                <>
                  <Users size={18} />
                  <span>Apply to All Employees</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveManagement;
