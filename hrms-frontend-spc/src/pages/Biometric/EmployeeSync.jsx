import React, { useState, useEffect } from 'react';
import { RefreshCw, Users, CheckCircle } from 'lucide-react';
import api from '../../api/axios';
import toast from '../../utils/toast';

const EmployeeSync = () => {
  const [loading, setLoading] = useState(true);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);

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

  const syncEmployees = async () => {
    if (!selectedDevice) {
      toast.error('Please select a device');
      return;
    }
    try {
      setSyncing(true);
      const response = await api.post(`/biometric/devices/${selectedDevice}/sync-employees`);
      setSyncStatus(response.data);
      toast.success('Employee sync initiated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to sync employees');
    } finally {
      setSyncing(false);
    }
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Employee Sync to Devices</h1>
        <p className="text-gray-400 mt-2">Sync employees to biometric devices</p>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">Select Device</label>
          <select
            value={selectedDevice}
            onChange={(e) => setSelectedDevice(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
          >
            <option value="">Select a device</option>
            {devices.map((device) => (
              <option key={device._id} value={device._id}>
                {device.deviceName} - {device.location}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={syncEmployees}
          disabled={syncing || !selectedDevice}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw size={20} className={syncing ? 'animate-spin' : ''} />
          {syncing ? 'Syncing...' : 'Sync Employees'}
        </button>
      </div>

      {syncStatus && (
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users size={20} className="text-gray-400" />
            <h2 className="text-lg font-semibold text-white">Sync Status</h2>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-300">
              <CheckCircle size={16} className="text-green-400" />
              <span>Total Employees: {syncStatus.totalEmployees || 0}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <CheckCircle size={16} className="text-green-400" />
              <span>Synced: {syncStatus.synced || 0}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <CheckCircle size={16} className="text-yellow-400" />
              <span>Failed: {syncStatus.failed || 0}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeSync;

