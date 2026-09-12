import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import api from '../../api/axios';
import toast from '../../utils/toast';

const AccrualPolicies = () => {
  const [loading, setLoading] = useState(true);
  const [policies, setPolicies] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [formData, setFormData] = useState({
    leaveType: '',
    accrualFrequency: 'monthly',
    accrualAmount: 0,
    yearlyAllocation: 0,
    maxAccumulation: 0,
    carryForwardEnabled: false,
    maxCarryForward: 0,
    proRataEnabled: true,
    proRataCalculation: 'calendar-days',
    isActive: true
  });

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const response = await api.get('/leave-accrual/policies');
      setPolicies(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch accrual policies');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) || 0 : value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPolicy) {
        await api.put(`/leave-accrual/policies/${editingPolicy._id}`, formData);
        toast.success('Accrual policy updated successfully');
      } else {
        await api.post('/leave-accrual/policies', formData);
        toast.success('Accrual policy created successfully');
      }
      setShowModal(false);
      setEditingPolicy(null);
      resetForm();
      fetchPolicies();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save accrual policy');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this policy?')) return;
    try {
      await api.delete(`/leave-accrual/policies/${id}`);
      toast.success('Accrual policy deleted successfully');
      fetchPolicies();
    } catch (error) {
      toast.error('Failed to delete accrual policy');
    }
  };

  const resetForm = () => {
    setFormData({
      leaveType: '',
      accrualFrequency: 'monthly',
      accrualAmount: 0,
      yearlyAllocation: 0,
      maxAccumulation: 0,
      carryForwardEnabled: false,
      maxCarryForward: 0,
      proRataEnabled: true,
      proRataCalculation: 'calendar-days',
      isActive: true
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Leave Accrual Policies</h1>
        <button
          onClick={() => {
            resetForm();
            setEditingPolicy(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Add Policy
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Leave Type</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Frequency</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Accrual Rate</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Max Accrual</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Carry Forward</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {policies.map((policy) => (
              <tr key={policy._id} className="hover:bg-gray-750">
              <td className="px-4 py-3 text-sm text-gray-300">{policy.leaveType}</td>
              <td className="px-4 py-3 text-sm text-gray-300 capitalize">{policy.accrualFrequency}</td>
              <td className="px-4 py-3 text-sm text-gray-300">{policy.accrualAmount || 0}</td>
              <td className="px-4 py-3 text-sm text-gray-300">{policy.maxAccumulation || 'Unlimited'}</td>
              <td className="px-4 py-3 text-sm text-gray-300">
                {policy.carryForwardEnabled ? `Yes (Max: ${policy.maxCarryForward || 0})` : 'No'}
              </td>
                <td className="px-4 py-3">
                  {policy.isActive ? (
                    <span className="flex items-center gap-1 text-green-400">
                      <CheckCircle size={16} />
                      Active
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-400">
                      <XCircle size={16} />
                      Inactive
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingPolicy(policy);
                        setFormData({
                          leaveType: policy.leaveType || '',
                          accrualFrequency: policy.accrualFrequency || 'monthly',
                          accrualAmount: policy.accrualAmount || 0,
                          yearlyAllocation: policy.yearlyAllocation || 0,
                          maxAccumulation: policy.maxAccumulation || 0,
                          carryForwardEnabled: policy.carryForwardEnabled || false,
                          maxCarryForward: policy.maxCarryForward || 0,
                          proRataEnabled: policy.proRataEnabled !== undefined ? policy.proRataEnabled : true,
                          proRataCalculation: policy.proRataCalculation || 'calendar-days',
                          isActive: policy.isActive !== undefined ? policy.isActive : true
                        });
                        setShowModal(true);
                      }}
                      className="p-1 text-blue-400 hover:text-blue-300"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(policy._id)}
                      className="p-1 text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingPolicy ? 'Edit Accrual Policy' : 'Create Accrual Policy'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Leave Type</label>
                <select
                  name="leaveType"
                  value={formData.leaveType}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  <option value="">Select Leave Type</option>
                  <option value="Personal Leave">Personal Leave</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Comp Offs">Comp Offs</option>
                  <option value="Floater Leave">Floater Leave</option>
                  <option value="Marriage Leave">Marriage Leave</option>
                  <option value="Maternity Leave">Maternity Leave</option>
                  <option value="Paternity Leave">Paternity Leave</option>
                  <option value="Unpaid Leave">Unpaid Leave</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Accrual Frequency</label>
                  <select
                    name="accrualFrequency"
                    value={formData.accrualFrequency}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="quarterly">Quarterly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Accrual Amount (days)</label>
                  <input
                    type="number"
                    name="accrualAmount"
                    value={formData.accrualAmount}
                    onChange={handleChange}
                    required
                    step="0.1"
                    min="0"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Yearly Allocation (optional)</label>
                  <input
                    type="number"
                    name="yearlyAllocation"
                    value={formData.yearlyAllocation}
                    onChange={handleChange}
                    step="0.1"
                    min="0"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Max Accumulation (0 = unlimited)</label>
                  <input
                    type="number"
                    name="maxAccumulation"
                    value={formData.maxAccumulation}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Max Carry Forward</label>
                  <input
                    type="number"
                    name="maxCarryForward"
                    value={formData.maxCarryForward}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="carryForwardEnabled"
                    checked={formData.carryForwardEnabled}
                    onChange={handleChange}
                    className="w-4 h-4"
                  />
                  <label className="text-sm font-medium text-gray-300">Enable Carry Forward</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="proRataEnabled"
                    checked={formData.proRataEnabled}
                    onChange={handleChange}
                    className="w-4 h-4"
                  />
                  <label className="text-sm font-medium text-gray-300">Enable Pro-Rata Calculation</label>
                </div>
                {formData.proRataEnabled && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Pro-Rata Calculation Method</label>
                    <select
                      name="proRataCalculation"
                      value={formData.proRataCalculation}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    >
                      <option value="calendar-days">Calendar Days</option>
                      <option value="working-days">Working Days</option>
                      <option value="months">Months</option>
                    </select>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="w-4 h-4"
                  />
                  <label className="text-sm font-medium text-gray-300">Active</label>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingPolicy(null);
                    resetForm();
                  }}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingPolicy ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccrualPolicies;

