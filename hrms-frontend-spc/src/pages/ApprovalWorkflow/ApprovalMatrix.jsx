import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import api from '../../api/axios';
import toast from '../../utils/toast';

const ApprovalMatrix = () => {
  const [loading, setLoading] = useState(true);
  const [matrices, setMatrices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingMatrix, setEditingMatrix] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    entityType: 'leave_request',
    conditions: [],
    approvers: []
  });

  useEffect(() => {
    fetchMatrices();
  }, []);

  const fetchMatrices = async () => {
    try {
      setLoading(true);
      const response = await api.get('/approval-workflow/matrices');
      setMatrices(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch approval matrices');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMatrix) {
        await api.put(`/approval-workflow/matrices/${editingMatrix._id}`, formData);
        toast.success('Approval matrix updated successfully');
      } else {
        await api.post('/approval-workflow/matrices', formData);
        toast.success('Approval matrix created successfully');
      }
      setShowModal(false);
      setEditingMatrix(null);
      resetForm();
      fetchMatrices();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save approval matrix');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this matrix?')) return;
    try {
      await api.delete(`/approval-workflow/matrices/${id}`);
      toast.success('Approval matrix deleted successfully');
      fetchMatrices();
    } catch (error) {
      toast.error('Failed to delete approval matrix');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      entityType: 'leave_request',
      conditions: [],
      approvers: []
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
        <h1 className="text-2xl font-bold text-white">Approval Matrix</h1>
        <button
          onClick={() => {
            resetForm();
            setEditingMatrix(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Add Matrix
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Entity Type</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Conditions</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {matrices.map((matrix) => (
              <tr key={matrix._id} className="hover:bg-gray-750">
                <td className="px-4 py-3 text-sm text-gray-300">{matrix.name}</td>
                <td className="px-4 py-3 text-sm text-gray-300">{matrix.entityType}</td>
                <td className="px-4 py-3 text-sm text-gray-300">{matrix.conditions?.length || 0}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingMatrix(matrix);
                        setFormData({
                          name: matrix.name || '',
                          entityType: matrix.entityType || 'leave_request',
                          conditions: matrix.conditions || [],
                          approvers: matrix.approvers || []
                        });
                        setShowModal(true);
                      }}
                      className="p-1 text-blue-400 hover:text-blue-300"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(matrix._id)}
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
              {editingMatrix ? 'Edit Approval Matrix' : 'Create Approval Matrix'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Entity Type</label>
                <select
                  name="entityType"
                  value={formData.entityType}
                  onChange={(e) => setFormData(prev => ({ ...prev, entityType: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                >
                  <option value="leave_request">Leave Request</option>
                  <option value="leave_encashment">Leave Encashment</option>
                </select>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingMatrix(null);
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
                  {editingMatrix ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalMatrix;

