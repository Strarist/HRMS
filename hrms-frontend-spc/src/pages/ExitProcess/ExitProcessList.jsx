import React, { useEffect, useState } from 'react';
import { Plus, UserX } from 'lucide-react';
import api from '../../api/axios';
import toast from '../../utils/toast';

const ExitProcessList = () => {
  const [exitProcesses, setExitProcesses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExitProcesses();
  }, []);

  const fetchExitProcesses = async () => {
    try {
      const response = await api.get('/exit-process');
      setExitProcesses(response.data.data);
    } catch (error) {
      toast.error('Failed to load exit processes');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      initiated: 'badge-info',
      'clearance-pending': 'badge-warning',
      'clearance-completed': 'badge-success',
      completed: 'badge-success',
      cancelled: 'badge-danger'
    };
    return badges[status] || 'badge-default';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Exit Process</h1>
          <p className="text-gray-400 mt-1">Manage employee exit and clearance</p>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <Plus size={20} />
          <span>Initiate Exit</span>
        </button>
      </div>

      <div className="card p-0">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Exit Type</th>
                <th>Last Working Date</th>
                <th>Clearance Status</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {exitProcesses.map((exit) => {
                const clearances = exit.clearanceChecklist || {};
                const totalClearances = Object.keys(clearances).length;
                const completedClearances = Object.values(clearances).filter(c => c.cleared).length;

                return (
                  <tr key={exit._id}>
                    <td>
                      <div>
                        <p className="font-medium text-white">
                          {exit.employee?.firstName} {exit.employee?.lastName}
                        </p>
                        <p className="text-sm text-gray-400">{exit.employee?.employeeCode}</p>
                      </div>
                    </td>
                    <td className="capitalize">{exit.exitType}</td>
                    <td>{new Date(exit.lastWorkingDate).toLocaleDateString()}</td>
                    <td>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-dark-800 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{ width: `${(completedClearances / totalClearances) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-400">
                          {completedClearances}/{totalClearances}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadge(exit.status)}`}>
                        {exit.status}
                      </span>
                    </td>
                    <td>
                      <button className="p-2 text-blue-400 hover:bg-dark-800 rounded">
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {exitProcesses.length === 0 && (
        <div className="text-center py-12">
          <UserX size={48} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">No exit processes found</p>
        </div>
      )}
    </div>
  );
};

export default ExitProcessList;
