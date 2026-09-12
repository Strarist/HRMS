import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import api from '../../api/axios';
import toast from '../../utils/toast';

const Workflows = () => {
  const [loading, setLoading] = useState(true);
  const [workflows, setWorkflows] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState(null);
  const [formData, setFormData] = useState({
    workflowName: '',
    entityType: 'leave_request',
    levels: [{ level: 1, approverType: 'reporting_manager', slaHours: 24 }],
    isActive: true
  });

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const response = await api.get('/approval-workflow/workflows');
      setWorkflows(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch workflows');
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

  const addLevel = () => {
    setFormData(prev => ({
      ...prev,
      levels: [...prev.levels, { 
        level: prev.levels.length + 1, 
        approverType: 'reporting_manager', 
        slaHours: 24 
      }]
    }));
  };

  const removeLevel = (index) => {
    setFormData(prev => ({
      ...prev,
      levels: prev.levels.filter((_, i) => i !== index).map((level, i) => ({ ...level, level: i + 1 }))
    }));
  };

  const updateLevel = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      levels: prev.levels.map((level, i) => 
        i === index ? { ...level, [field]: value } : level
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingWorkflow) {
        await api.put(`/approval-workflow/workflows/${editingWorkflow._id}`, formData);
        toast.success('Workflow updated successfully');
      } else {
        await api.post('/approval-workflow/workflows', formData);
        toast.success('Workflow created successfully');
      }
      setShowModal(false);
      setEditingWorkflow(null);
      resetForm();
      fetchWorkflows();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save workflow');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this workflow?')) return;
    try {
      await api.delete(`/approval-workflow/workflows/${id}`);
      toast.success('Workflow deleted successfully');
      fetchWorkflows();
    } catch (error) {
      toast.error('Failed to delete workflow');
    }
  };

  const resetForm = () => {
    setFormData({
      workflowName: '',
      entityType: 'leave_request',
      levels: [{ level: 1, approverType: 'reporting_manager', slaHours: 24 }],
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
        <h1 className="text-2xl font-bold text-white">Approval Workflows</h1>
        <button
          onClick={() => {
            resetForm();
            setEditingWorkflow(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Add Workflow
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Workflow Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Entity Type</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Levels</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {workflows.map((workflow) => (
              <tr key={workflow._id} className="hover:bg-gray-750">
                <td className="px-4 py-3 text-sm text-gray-300">{workflow.workflowName}</td>
                <td className="px-4 py-3 text-sm text-gray-300">{workflow.entityType}</td>
                <td className="px-4 py-3 text-sm text-gray-300">{workflow.levels?.length || 0}</td>
                <td className="px-4 py-3">
                  {workflow.isActive ? (
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
                        setEditingWorkflow(workflow);
                        setFormData({
                          workflowName: workflow.workflowName || '',
                          entityType: workflow.entityType || 'leave_request',
                          levels: workflow.levels || [{ level: 1, approverType: 'reporting_manager', slaHours: 24 }],
                          isActive: workflow.isActive !== undefined ? workflow.isActive : true
                        });
                        setShowModal(true);
                      }}
                      className="p-1 text-blue-400 hover:text-blue-300"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(workflow._id)}
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
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingWorkflow ? 'Edit Workflow' : 'Create Workflow'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Workflow Name</label>
                <input
                  type="text"
                  name="workflowName"
                  value={formData.workflowName}
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
                  <option value="overtime">Overtime</option>
                </select>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-300">Approval Levels</label>
                  <button
                    type="button"
                    onClick={addLevel}
                    className="text-sm text-blue-400 hover:text-blue-300"
                  >
                    + Add Level
                  </button>
                </div>
                {formData.levels.map((level, index) => (
                  <div key={index} className="bg-gray-700 p-3 rounded-lg mb-2">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white font-medium">Level {level.level}</span>
                      {formData.levels.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLevel(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Approver Type</label>
                        <select
                          value={level.approverType}
                          onChange={(e) => updateLevel(index, 'approverType', e.target.value)}
                          className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm"
                        >
                          <option value="reporting_manager">Reporting Manager</option>
                          <option value="role_based">Role Based</option>
                          <option value="specific_user">Specific User</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">SLA (Hours)</label>
                        <input
                          type="number"
                          value={level.slaHours}
                          onChange={(e) => updateLevel(index, 'slaHours', parseInt(e.target.value))}
                          className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-white text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
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
                    setEditingWorkflow(null);
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
                  {editingWorkflow ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workflows;

