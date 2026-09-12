import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Calendar } from 'lucide-react';
import api from '../../api/axios';
import toast from '../../utils/toast';

const Delegations = () => {
  const [loading, setLoading] = useState(true);
  const [delegations, setDelegations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingDelegation, setEditingDelegation] = useState(null);
  const [formData, setFormData] = useState({
    delegatorId: '',
    delegateId: '',
    entityType: 'leave_request',
    startDate: '',
    endDate: '',
    isActive: true
  });

  useEffect(() => {
    fetchDelegations();
  }, []);

  const fetchDelegations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/approval-workflow/delegations');
      setDelegations(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch delegations');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDelegation) {
        await api.put(`/approval-workflow/delegations/${editingDelegation._id}`, formData);
        toast.success('Delegation updated successfully');
      } else {
        await api.post('/approval-workflow/delegations', formData);
        toast.success('Delegation created successfully');
      }
      setShowModal(false);
      setEditingDelegation(null);
      resetForm();
      fetchDelegations();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save delegation');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this delegation?')) return;
    try {
      await api.delete(`/approval-workflow/delegations/${id}`);
      toast.success('Delegation deleted successfully');
      fetchDelegations();
    } catch (error) {
      toast.error('Failed to delete delegation');
    }
  };

  const resetForm = () => {
    setFormData({
      delegatorId: '',
      delegateId: '',
      entityType: 'leave_request',
      startDate: '',
      endDate: '',
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
        <h1 className="text-2xl font-bold text-white">Approval Delegations</h1>
        <button
          onClick={() => {
            resetForm();
            setEditingDelegation(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Add Delegation
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Delegator</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Delegate</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Entity Type</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Start Date</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">End Date</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {delegations.map((delegation) => (
              <tr key={delegation._id} className="hover:bg-gray-750">
                <td className="px-4 py-3 text-sm text-gray-300">
                  {delegation.delegatorName || delegation.delegator?.name || '-'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-300">
                  {delegation.delegateName || delegation.delegate?.name || '-'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-300">{delegation.entityType}</td>
                <td className="px-4 py-3 text-sm text-gray-300">
                  {delegation.startDate ? new Date(delegation.startDate).toLocaleDateString() : '-'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-300">
                  {delegation.endDate ? new Date(delegation.endDate).toLocaleDateString() : '-'}
                </td>
                <td className="px-4 py-3">
                  {delegation.isActive ? (
                    <span className="text-green-400">Active</span>
                  ) : (
                    <span className="text-red-400">Inactive</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingDelegation(delegation);
                        setFormData({
                          delegatorId: delegation.delegatorId || '',
                          delegateId: delegation.delegateId || '',
                          entityType: delegation.entityType || 'leave_request',
                          startDate: delegation.startDate ? new Date(delegation.startDate).toISOString().split('T')[0] : '',
                          endDate: delegation.endDate ? new Date(delegation.endDate).toISOString().split('T')[0] : '',
                          isActive: delegation.isActive !== undefined ? delegation.isActive : true
                        });
                        setShowModal(true);
                      }}
                      className="p-1 text-blue-400 hover:text-blue-300"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(delegation._id)}
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
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingDelegation ? 'Edit Delegation' : 'Create Delegation'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Delegator ID</label>
                <input
                  type="text"
                  name="delegatorId"
                  value={formData.delegatorId}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Delegate ID</label>
                <input
                  type="text"
                  name="delegateId"
                  value={formData.delegateId}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Entity Type</label>
                <select
                  name="entityType"
                  value={formData.entityType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  <option value="leave_request">Leave Request</option>
                  <option value="leave_encashment">Leave Encashment</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
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
                    setEditingDelegation(null);
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
                  {editingDelegation ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Delegations;

