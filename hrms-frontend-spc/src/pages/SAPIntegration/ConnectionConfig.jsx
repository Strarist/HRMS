import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, TestTube, CheckCircle, XCircle } from 'lucide-react';
import api from '../../api/axios';
import toast from '../../utils/toast';

const ConnectionConfig = () => {
  const [loading, setLoading] = useState(true);
  const [connections, setConnections] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingConnection, setEditingConnection] = useState(null);
  const [formData, setFormData] = useState({
    connectionName: '',
    host: '',
    port: 8000,
    client: '',
    username: '',
    password: '',
    systemNumber: '',
    isActive: true
  });

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      setLoading(true);
      const response = await api.get('/sap/connections');
      setConnections(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch SAP connections');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) || 0 : value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingConnection) {
        await api.put(`/sap/connections/${editingConnection._id}`, formData);
        toast.success('SAP connection updated successfully');
      } else {
        await api.post('/sap/connections', formData);
        toast.success('SAP connection created successfully');
      }
      setShowModal(false);
      setEditingConnection(null);
      resetForm();
      fetchConnections();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save SAP connection');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this connection?')) return;
    try {
      await api.delete(`/sap/connections/${id}`);
      toast.success('SAP connection deleted successfully');
      fetchConnections();
    } catch (error) {
      toast.error('Failed to delete SAP connection');
    }
  };

  const testConnection = async (id) => {
    try {
      const response = await api.post(`/sap/connections/${id}/test`);
      if (response.data.success) {
        toast.success('Connection test successful');
      } else {
        toast.error('Connection test failed');
      }
      fetchConnections();
    } catch (error) {
      toast.error('Connection test failed');
    }
  };

  const resetForm = () => {
    setFormData({
      connectionName: '',
      host: '',
      port: 8000,
      client: '',
      username: '',
      password: '',
      systemNumber: '',
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
        <h1 className="text-2xl font-bold text-white">SAP Connection Configuration</h1>
        <button
          onClick={() => {
            resetForm();
            setEditingConnection(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Add Connection
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Connection Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Host</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Client</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {connections.map((connection) => (
              <tr key={connection._id} className="hover:bg-gray-750">
                <td className="px-4 py-3 text-sm text-gray-300">{connection.connectionName}</td>
                <td className="px-4 py-3 text-sm text-gray-300">{connection.host}:{connection.port}</td>
                <td className="px-4 py-3 text-sm text-gray-300">{connection.client}</td>
                <td className="px-4 py-3">
                  {connection.status === 'connected' ? (
                    <span className="flex items-center gap-1 text-green-400">
                      <CheckCircle size={16} />
                      Connected
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-400">
                      <XCircle size={16} />
                      Disconnected
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => testConnection(connection._id)}
                      className="p-1 text-yellow-400 hover:text-yellow-300"
                      title="Test Connection"
                    >
                      <TestTube size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setEditingConnection(connection);
                        setFormData({
                          connectionName: connection.connectionName || '',
                          host: connection.host || '',
                          port: connection.port || 8000,
                          client: connection.client || '',
                          username: connection.username || '',
                          password: '',
                          systemNumber: connection.systemNumber || '',
                          isActive: connection.isActive !== undefined ? connection.isActive : true
                        });
                        setShowModal(true);
                      }}
                      className="p-1 text-blue-400 hover:text-blue-300"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(connection._id)}
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
              {editingConnection ? 'Edit SAP Connection' : 'Add SAP Connection'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Connection Name</label>
                <input
                  type="text"
                  name="connectionName"
                  value={formData.connectionName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Host</label>
                  <input
                    type="text"
                    name="host"
                    value={formData.host}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Port</label>
                  <input
                    type="number"
                    name="port"
                    value={formData.port}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Client</label>
                  <input
                    type="text"
                    name="client"
                    value={formData.client}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">System Number</label>
                  <input
                    type="text"
                    name="systemNumber"
                    value={formData.systemNumber}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required={!editingConnection}
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
                    setEditingConnection(null);
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
                  {editingConnection ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectionConfig;

