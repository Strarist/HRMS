import React, { useState, useEffect } from 'react';
import { DollarSign, CheckCircle, XCircle, Clock, Filter } from 'lucide-react';
import api from '../../api/axios';
import toast from '../../utils/toast';

const EncashmentHistory = () => {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    leaveType: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchRequests();
  }, [filters]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.leaveType) params.leaveType = filters.leaveType;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      
      const response = await api.get('/leave-encashment/requests', { params });
      setRequests(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch encashment history');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'yellow', icon: Clock },
      approved: { color: 'green', icon: CheckCircle },
      rejected: { color: 'red', icon: XCircle },
      processed: { color: 'blue', icon: DollarSign }
    };
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <span className={`flex items-center gap-1 text-${config.color}-400`}>
        <Icon size={16} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const totalAmount = requests
    .filter(r => r.status === 'processed')
    .reduce((sum, r) => sum + (r.encashmentAmount || 0), 0);

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
        <h1 className="text-2xl font-bold text-white">Encashment History</h1>
        <div className="flex items-center gap-2 text-gray-400">
          <DollarSign size={20} />
          <span className="text-lg font-semibold">Total Processed: ₹{totalAmount.toLocaleString()}</span>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-gray-400" />
          <h2 className="text-lg font-semibold text-white">Filters</h2>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="processed">Processed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Leave Type</label>
            <input
              type="text"
              name="leaveType"
              value={filters.leaveType}
              onChange={handleFilterChange}
              placeholder="Filter by leave type"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">End Date</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Leave Type</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Days</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Amount</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Request Date</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Processed Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {requests.map((request) => (
              <tr key={request._id} className="hover:bg-gray-750">
                <td className="px-4 py-3 text-sm text-gray-300">{request.leaveType}</td>
                <td className="px-4 py-3 text-sm text-gray-300">{request.numberOfDays}</td>
                <td className="px-4 py-3 text-sm text-gray-300">
                  ₹{request.encashmentAmount?.toLocaleString() || '0'}
                </td>
                <td className="px-4 py-3">{getStatusBadge(request.status)}</td>
                <td className="px-4 py-3 text-sm text-gray-300">
                  {new Date(request.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-sm text-gray-300">
                  {request.processedDate ? new Date(request.processedDate).toLocaleDateString() : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {requests.length === 0 && (
          <div className="text-center py-8 text-gray-400">No encashment requests found</div>
        )}
      </div>
    </div>
  );
};

export default EncashmentHistory;

