import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import api from '../../api/axios';
import toast from '../../utils/toast';

const SyncLogs = () => {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState({
    deviceId: '',
    syncType: '',
    status: ''
  });

  useEffect(() => {
    fetchLogs();
  }, [filters]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.deviceId) params.deviceId = filters.deviceId;
      if (filters.syncType) params.syncType = filters.syncType;
      if (filters.status) params.status = filters.status;
      
      const response = await api.get('/biometric/sync-logs', { params });
      setLogs(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch sync logs');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle size={16} className="text-green-400" />;
      case 'failed':
        return <XCircle size={16} className="text-red-400" />;
      default:
        return <Clock size={16} className="text-yellow-400" />;
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Sync Logs</h1>
        <div className="flex items-center gap-2 text-gray-400">
          <FileText size={24} />
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Device</label>
            <input
              type="text"
              name="deviceId"
              value={filters.deviceId}
              onChange={(e) => setFilters(prev => ({ ...prev, deviceId: e.target.value }))}
              placeholder="Filter by device"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Sync Type</label>
            <select
              name="syncType"
              value={filters.syncType}
              onChange={(e) => setFilters(prev => ({ ...prev, syncType: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            >
              <option value="">All</option>
              <option value="employee">Employee Sync</option>
              <option value="attendance">Attendance Pull</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            >
              <option value="">All</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Device</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Sync Type</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Records</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Sync Date</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Message</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {logs.map((log) => (
              <tr key={log._id} className="hover:bg-gray-750">
                <td className="px-4 py-3 text-sm text-gray-300">
                  {log.deviceName || log.device?.deviceName || '-'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-300">{log.syncType}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    {getStatusIcon(log.status)}
                    <span className="text-sm text-gray-300">{log.status}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-300">{log.recordsProcessed || 0}</td>
                <td className="px-4 py-3 text-sm text-gray-300">
                  {new Date(log.syncDate).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm text-gray-300">{log.message || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && (
          <div className="text-center py-8 text-gray-400">No sync logs found</div>
        )}
      </div>
    </div>
  );
};

export default SyncLogs;

