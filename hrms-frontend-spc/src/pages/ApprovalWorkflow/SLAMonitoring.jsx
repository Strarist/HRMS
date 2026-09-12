import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import api from '../../api/axios';
import toast from '../../utils/toast';

const SLAMonitoring = () => {
  const [loading, setLoading] = useState(true);
  const [slaData, setSlaData] = useState(null);

  useEffect(() => {
    fetchSLAData();
  }, []);

  const fetchSLAData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/approval-workflow/sla');
      setSlaData(response.data);
    } catch (error) {
      toast.error('Failed to fetch SLA monitoring data');
    } finally {
      setLoading(false);
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
        <h1 className="text-2xl font-bold text-white">SLA Monitoring</h1>
        <div className="flex items-center gap-2 text-gray-400">
          <Clock size={24} />
        </div>
      </div>

      {slaData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Total Pending</span>
              <Clock size={20} className="text-yellow-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              {slaData.summary?.totalPending || 0}
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">At Risk</span>
              <AlertTriangle size={20} className="text-red-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              {slaData.summary?.atRisk || 0}
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">On Time</span>
              <CheckCircle size={20} className="text-green-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              {slaData.summary?.onTime || 0}
            </div>
          </div>
        </div>
      )}

      {slaData && slaData.items && (
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Entity Type</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Employee</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Request Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">SLA Deadline</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Time Remaining</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {slaData.items.map((item, index) => (
                <tr key={index} className="hover:bg-gray-750">
                  <td className="px-4 py-3 text-sm text-gray-300">{item.entityType}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">
                    {item.employeeName || item.employee?.name || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">
                    {new Date(item.requestDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">
                    {item.slaDeadline ? new Date(item.slaDeadline).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-4 py-3">
                    {item.status === 'at_risk' ? (
                      <span className="flex items-center gap-1 text-red-400">
                        <AlertTriangle size={16} />
                        At Risk
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-green-400">
                        <CheckCircle size={16} />
                        On Time
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">
                    {item.timeRemaining || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SLAMonitoring;

