import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Wifi, WifiOff, TestTube } from 'lucide-react';
import api from '../../api/axios';
import toast from '../../utils/toast';

const DeviceManagement = () => {
  const [loading, setLoading] = useState(true);
  const [devices, setDevices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingDevice, setEditingDevice] = useState(null);
  const [formData, setFormData] = useState({
    deviceName: '',
    deviceType: 'zkteco',
    ipAddress: '',
    port: 4370,
    location: '',
    serialNumber: '',
    isActive: true
  });

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const response = await api.get('/biometric/devices');
      setDevices(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch devices');
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
      if (editingDevice) {
        await api.put(`/biometric/devices/${editingDevice._id}`, formData);
        toast.success('Device updated successfully');
      } else {
        await api.post('/biometric/devices', formData);
        toast.success('Device created successfully');
      }
      setShowModal(false);
      setEditingDevice(null);
      resetForm();
      fetchDevices();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save device');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this device?')) return;
    try {
      await api.delete(`/biometric/devices/${id}`);
      toast.success('Device deleted successfully');
      fetchDevices();
    } catch (error) {
      toast.error('Failed to delete device');
    }
  };

  const testConnection = async (id) => {
    try {
      const response = await api.post(`/biometric/devices/${id}/test`);
      if (response.data.success) {
        toast.success('Connection test successful');
      } else {
        toast.error('Connection test failed');
      }
      fetchDevices();
    } catch (error) {
      toast.error('Connection test failed');
    }
  };

  const resetForm = () => {
    setFormData({
      deviceName: '',
      deviceType: 'zkteco',
      ipAddress: '',
      port: 4370,
      location: '',
      serialNumber: '',
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
        <h1 className="text-2xl font-bold text-white">Biometric Device Management</h1>
        <button
          onClick={() => {
            resetForm();
            setEditingDevice(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Add Device
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Device Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Type</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">IP Address</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Location</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {devices.map((device) => (
              <tr key={device._id} className="hover:bg-gray-750">
                <td className="px-4 py-3 text-sm text-gray-300">{device.deviceName}</td>
                <td className="px-4 py-3 text-sm text-gray-300">{device.deviceType}</td>
                <td className="px-4 py-3 text-sm text-gray-300">{device.ipAddress}:{device.port}</td>
                <td className="px-4 py-3 text-sm text-gray-300">{device.location}</td>
                <td className="px-4 py-3">
                  {device.isConnected ? (
                    <span className="flex items-center gap-1 text-green-400">
                      <Wifi size={16} />
                      Connected
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-400">
                      <WifiOff size={16} />
                      Disconnected
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => testConnection(device._id)}
                      className="p-1 text-yellow-400 hover:text-yellow-300"
                      title="Test Connection"
                    >
                      <TestTube size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setEditingDevice(device);
                        setFormData({
                          deviceName: device.deviceName || '',
                          deviceType: device.deviceType || 'zkteco',
                          ipAddress: device.ipAddress || '',
                          port: device.port || 4370,
                          location: device.location || '',
                          serialNumber: device.serialNumber || '',
                          isActive: device.isActive !== undefined ? device.isActive : true
                        });
                        setShowModal(true);
                      }}
                      className="p-1 text-blue-400 hover:text-blue-300"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(device._id)}
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
              {editingDevice ? 'Edit Device' : 'Add Device'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Device Name</label>
                <input
                  type="text"
                  name="deviceName"
                  value={formData.deviceName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Device Type</label>
                  <select
                    name="deviceType"
                    value={formData.deviceType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  >
                    <option value="zkteco">ZKTeco</option>
                    <option value="essl">eSSL</option>
                  </select>
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
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">IP Address</label>
                <input
                  type="text"
                  name="ipAddress"
                  value={formData.ipAddress}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Serial Number</label>
                <input
                  type="text"
                  name="serialNumber"
                  value={formData.serialNumber}
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
                    setEditingDevice(null);
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
                  {editingDevice ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeviceManagement;

