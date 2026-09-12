import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import api from '../../api/axios';
import toast from '../../utils/toast';

const EncashmentRules = () => {
  const [loading, setLoading] = useState(true);
  const [rules, setRules] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [formData, setFormData] = useState({
    leaveType: '',
    minBalance: 0,
    maxDaysPerRequest: 0,
    maxDaysPerYear: 0,
    calculationMethod: 'daily_rate',
    calculationRate: 0,
    isActive: true,
    eligibilityCriteria: {
      minServiceMonths: 0,
      allowedDepartments: [],
      allowedDesignations: []
    }
  });

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const response = await api.get('/leave-encashment/rules');
      setRules(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch encashment rules');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('eligibilityCriteria.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        eligibilityCriteria: {
          ...prev.eligibilityCriteria,
          [field]: type === 'number' ? parseFloat(value) || 0 : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) || 0 : value)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRule) {
        await api.put(`/leave-encashment/rules/${editingRule._id}`, formData);
        toast.success('Encashment rule updated successfully');
      } else {
        await api.post('/leave-encashment/rules', formData);
        toast.success('Encashment rule created successfully');
      }
      setShowModal(false);
      setEditingRule(null);
      resetForm();
      fetchRules();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save encashment rule');
    }
  };

  const handleEdit = (rule) => {
    setEditingRule(rule);
    setFormData({
      leaveType: rule.leaveType || '',
      minBalance: rule.minBalance || 0,
      maxDaysPerRequest: rule.maxDaysPerRequest || 0,
      maxDaysPerYear: rule.maxDaysPerYear || 0,
      calculationMethod: rule.calculationMethod || 'daily_rate',
      calculationRate: rule.calculationRate || 0,
      isActive: rule.isActive !== undefined ? rule.isActive : true,
      eligibilityCriteria: rule.eligibilityCriteria || {
        minServiceMonths: 0,
        allowedDepartments: [],
        allowedDesignations: []
      }
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this rule?')) return;
    try {
      await api.delete(`/leave-encashment/rules/${id}`);
      toast.success('Encashment rule deleted successfully');
      fetchRules();
    } catch (error) {
      toast.error('Failed to delete encashment rule');
    }
  };

  const resetForm = () => {
    setFormData({
      leaveType: '',
      minBalance: 0,
      maxDaysPerRequest: 0,
      maxDaysPerYear: 0,
      calculationMethod: 'daily_rate',
      calculationRate: 0,
      isActive: true,
      eligibilityCriteria: {
        minServiceMonths: 0,
        allowedDepartments: [],
        allowedDesignations: []
      }
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
        <h1 className="text-2xl font-bold text-white">Leave Encashment Rules</h1>
        <button
          onClick={() => {
            resetForm();
            setEditingRule(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Add Rule
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Leave Type</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Min Balance</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Max Days/Request</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Calculation Method</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {rules.map((rule) => (
              <tr key={rule._id} className="hover:bg-gray-750">
                <td className="px-4 py-3 text-sm text-gray-300">{rule.leaveType}</td>
                <td className="px-4 py-3 text-sm text-gray-300">{rule.minBalance}</td>
                <td className="px-4 py-3 text-sm text-gray-300">{rule.maxDaysPerRequest}</td>
                <td className="px-4 py-3 text-sm text-gray-300">{rule.calculationMethod}</td>
                <td className="px-4 py-3">
                  {rule.isActive ? (
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
                      onClick={() => handleEdit(rule)}
                      className="p-1 text-blue-400 hover:text-blue-300"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(rule._id)}
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
              {editingRule ? 'Edit Encashment Rule' : 'Create Encashment Rule'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Leave Type</label>
                <input
                  type="text"
                  name="leaveType"
                  value={formData.leaveType}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Min Balance</label>
                  <input
                    type="number"
                    name="minBalance"
                    value={formData.minBalance}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Max Days/Request</label>
                  <input
                    type="number"
                    name="maxDaysPerRequest"
                    value={formData.maxDaysPerRequest}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Max Days/Year</label>
                  <input
                    type="number"
                    name="maxDaysPerYear"
                    value={formData.maxDaysPerYear}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Calculation Method</label>
                  <select
                    name="calculationMethod"
                    value={formData.calculationMethod}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  >
                    <option value="daily_rate">Daily Rate</option>
                    <option value="monthly_salary">Monthly Salary</option>
                    <option value="fixed_amount">Fixed Amount</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Calculation Rate</label>
                <input
                  type="number"
                  name="calculationRate"
                  value={formData.calculationRate}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Min Service Months</label>
                <input
                  type="number"
                  name="eligibilityCriteria.minServiceMonths"
                  value={formData.eligibilityCriteria.minServiceMonths}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
              </div>
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
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingRule(null);
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
                  {editingRule ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EncashmentRules;

