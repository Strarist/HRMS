import React, { useState, useEffect } from 'react';
import { Clock, Filter, Calendar } from 'lucide-react';
import api from '../../api/axios';
import toast from '../../utils/toast';

const AccrualHistory = () => {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [filters, setFilters] = useState({
    leaveType: '',
    year: new Date().getFullYear(),
    employee: ''
  });

  useEffect(() => {
    fetchHistory();
  }, [filters]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.leaveType) params.leaveType = filters.leaveType;
      if (filters.year) params.year = filters.year;
      if (filters.employee) params.employee = filters.employee;
      
      const response = await api.get('/leave-accrual/history', { params });
      setHistory(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch accrual history');
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
        <h1 className="text-2xl font-bold text-white">Accrual History</h1>
        <div className="flex items-center gap-2 text-gray-400">
          <Clock size={24} />
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-gray-400" />
          <h2 className="text-lg font-semibold text-white">Filters</h2>
        </div>
        <div className="grid grid-cols-3 gap-4">
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
            <label className="block text-sm font-medium text-gray-300 mb-1">Year</label>
            <input
              type="number"
              name="year"
              value={filters.year}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Employee</label>
            <input
              type="text"
              name="employee"
              value={filters.employee}
              onChange={handleFilterChange}
              placeholder="Filter by employee"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Employee</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Leave Type</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Accrued</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Carried Forward</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Total</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Accrual Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {history.map((item, index) => (
              <tr key={index} className="hover:bg-gray-750">
                <td className="px-4 py-3 text-sm text-gray-300">
                  {item.employeeName || item.employee?.name || '-'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-300">{item.leaveType || '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-300">{item.accrued || 0}</td>
                <td className="px-4 py-3 text-sm text-gray-300">{item.carriedForward || 0}</td>
                <td className="px-4 py-3 text-sm text-gray-300">{item.total || 0}</td>
                <td className="px-4 py-3 text-sm text-gray-300">
                  <div className="flex items-center gap-1">
                    <Calendar size={16} />
                    {item.accrualDate ? new Date(item.accrualDate).toLocaleDateString() : '-'}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {history.length === 0 && (
          <div className="text-center py-8 text-gray-400">No accrual history found</div>
        )}
      </div>
    </div>
  );
};

export default AccrualHistory;

