import React, { useEffect, useState } from 'react';
import { Plus, CheckSquare } from 'lucide-react';
import api from '../../api/axios';
import toast from '../../utils/toast';

const ComplianceList = () => {
  const [compliances, setCompliances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchCompliances();
  }, []);

  const fetchCompliances = async () => {
    try {
      const response = await api.get('/compliance');
      setCompliances(response.data.data);
    } catch (error) {
      toast.error('Failed to load compliance records');
    } finally {
      setLoading(false);
    }
  };

  const filteredCompliances = compliances.filter(comp => 
    filterStatus === 'all' || comp.status === filterStatus
  );

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge-warning',
      'in-progress': 'badge-info',
      completed: 'badge-success',
      failed: 'badge-danger',
      expired: 'badge-default'
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
          <h1 className="text-2xl font-bold text-white">Compliance Tracker</h1>
          <p className="text-gray-400 mt-1">Track compliance requirements and deadlines</p>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <Plus size={20} />
          <span>Add Compliance</span>
        </button>
      </div>

      <div className="card">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input-field w-48"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      <div className="card p-0">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Title</th>
                <th>Type</th>
                <th>Client</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCompliances.map((compliance) => {
                const daysUntilDue = compliance.dueDate ? 
                  Math.ceil((new Date(compliance.dueDate) - new Date()) / (1000 * 60 * 60 * 24)) : null;
                
                return (
                  <tr key={compliance._id}>
                    <td>
                      {compliance.employee?.firstName} {compliance.employee?.lastName}
                    </td>
                    <td>{compliance.title}</td>
                    <td className="capitalize">{compliance.complianceType}</td>
                    <td>{compliance.client?.name || '-'}</td>
                    <td>
                      <div>
                        {compliance.dueDate ? new Date(compliance.dueDate).toLocaleDateString() : '-'}
                        {daysUntilDue !== null && daysUntilDue <= 15 && daysUntilDue > 0 && (
                          <span className="block text-xs text-yellow-500">
                            Due in {daysUntilDue} days
                          </span>
                        )}
                        {daysUntilDue !== null && daysUntilDue <= 0 && (
                          <span className="block text-xs text-red-500">Overdue</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadge(compliance.status)}`}>
                        {compliance.status}
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

      {filteredCompliances.length === 0 && (
        <div className="text-center py-12">
          <CheckSquare size={48} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">No compliance records found</p>
        </div>
      )}
    </div>
  );
};

export default ComplianceList;
