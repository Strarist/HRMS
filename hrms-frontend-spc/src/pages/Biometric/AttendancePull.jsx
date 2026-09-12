import React, { useState, useEffect } from 'react';
import { Download, Calendar, RefreshCw } from 'lucide-react';
import api from '../../api/axios';
import toast from '../../utils/toast';

const AttendancePull = () => {
  const [loading, setLoading] = useState(true);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [pulling, setPulling] = useState(false);
  const [formData, setFormData] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
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

  const pullAttendance = async () => {
    if (!selectedDevice) {
      toast.error('Please select a device');
      return;
    }
    try {
      setPulling(true);
      const response = await api.post(`/biometric/devices/${selectedDevice}/pull-attendance`, {
        startDate: formData.startDate,
        endDate: formData.endDate
      });
      toast.success(`Pulled ${response.data.recordsPulled || 0} attendance records`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to pull attendance');
    } finally {
      setPulling(false);
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
        <h1 className="text-2xl font-bold text-white">Pull Attendance Data</h1>
        <p className="text-gray-400 mt-2">Pull attendance data from biometric devices</p>
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
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Start Date</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">End Date</label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
          </div>
        </div>
        <button
          onClick={pullAttendance}
          disabled={pulling || !selectedDevice}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <Download size={20} className={pulling ? 'animate-spin' : ''} />
          {pulling ? 'Pulling...' : 'Pull Attendance'}
        </button>
      </div>
    </div>
  );
};

export default AttendancePull;

