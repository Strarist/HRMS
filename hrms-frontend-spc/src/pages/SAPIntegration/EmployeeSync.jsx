import React, { useState } from 'react';
import { RefreshCw, Users } from 'lucide-react';
import api from '../../api/axios';
import toast from '../../utils/toast';

const EmployeeSync = () => {
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const [connectionId, setConnectionId] = useState('');

  const syncEmployees = async () => {
    if (!connectionId) {
      toast.error('Please select a connection');
      return;
    }
    try {
      setSyncing(true);
      const response = await api.post(`/sap/connections/${connectionId}/sync-employees`);
      setSyncStatus(response.data);
      toast.success('Employee sync initiated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to sync employees');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Sync Employee Master Data</h1>
        <p className="text-gray-400 mt-2">Sync employee master data from SAP</p>
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
        <button
          onClick={syncEmployees}
          disabled={syncing || !connectionId}
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

export default EmployeeSync;

