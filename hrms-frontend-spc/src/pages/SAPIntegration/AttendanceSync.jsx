import React, { useState } from 'react';
import { RefreshCw, Clock } from 'lucide-react';
import api from '../../api/axios';
import toast from '../../utils/toast';

const AttendanceSync = () => {
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const [connectionId, setConnectionId] = useState('');
  const [formData, setFormData] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const syncAttendance = async () => {
    if (!connectionId) {
      toast.error('Please select a connection');
      return;
    }
    try {
      setSyncing(true);
      const response = await api.post(`/sap/connections/${connectionId}/sync-attendance`, {
        startDate: formData.startDate,
        endDate: formData.endDate
      });
      setSyncStatus(response.data);
      toast.success('Attendance sync initiated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to sync attendance');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Sync Attendance Data</h1>
        <p className="text-gray-400 mt-2">Sync attendance data from SAP</p>
      </div>

      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">Connection ID</label>
          <input
            type="text"
            value={connectionId}
            onChange={(e) => setConnectionId(e.target.value)}
            placeholder="Enter SAP connection ID"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
          />
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
          onClick={syncAttendance}
          disabled={syncing || !connectionId}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw size={20} className={syncing ? 'animate-spin' : ''} />
          {syncing ? 'Syncing...' : 'Sync Attendance'}
        </button>
      </div>

      {syncStatus && (
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={20} className="text-gray-400" />
            <h2 className="text-lg font-semibold text-white">Sync Status</h2>
          </div>
          <div className="space-y-2 text-gray-300">
            <div>Total Records: {syncStatus.totalRecords || 0}</div>
            <div>Synced: {syncStatus.synced || 0}</div>
            <div>Failed: {syncStatus.failed || 0}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceSync;

