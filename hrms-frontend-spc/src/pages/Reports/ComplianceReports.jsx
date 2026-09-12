import React, { useState, useEffect } from 'react';
import { Download, Filter, FileText, Shield } from 'lucide-react';
import api from '../../api/axios';
import toast from '../../utils/toast';

const ComplianceReports = () => {
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    year: new Date().getFullYear(),
    department: '',
    complianceType: ''
  });
  const [reportData, setReportData] = useState(null);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reports/compliance/status', { params: filters });
      setReportData(response.data);
      toast.success('Report generated successfully');
    } catch (error) {
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format) => {
    try {
      const params = { ...filters, export: format };
      const response = await api.get('/reports/compliance/status', { 
        params,
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `compliance-report-${Date.now()}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(`Report exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to export report');
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Compliance Reports</h1>
        <div className="flex gap-2">
          <button
            onClick={() => exportReport('excel')}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download size={20} />
            Export Excel
          </button>
          <button
            onClick={() => exportReport('pdf')}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <Download size={20} />
            Export PDF
          </button>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-gray-400" />
          <h2 className="text-lg font-semibold text-white">Report Configuration</h2>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-4">
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
            <label className="block text-sm font-medium text-gray-300 mb-1">Department</label>
            <input
              type="text"
              name="department"
              value={filters.department}
              onChange={handleFilterChange}
              placeholder="Filter by department"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Compliance Type</label>
            <input
              type="text"
              name="complianceType"
              value={filters.complianceType}
              onChange={handleFilterChange}
              placeholder="Filter by type"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            />
          </div>
        </div>
        <button
          onClick={fetchReport}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate Report'}
        </button>
      </div>

      {reportData && (
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center gap-2">
              <Shield size={20} className="text-gray-400" />
              <h2 className="text-lg font-semibold text-white">Compliance Status</h2>
            </div>
          </div>
          <div className="p-4">
            {reportData.data && Array.isArray(reportData.data) ? (
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Employee</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Compliance Type</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Due Date</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Completion Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {reportData.data.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-750">
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {item.employeeName || item.employee?.name || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">{item.complianceType || '-'}</td>
                      <td className="px-4 py-3">
                        {item.status === 'compliant' ? (
                          <span className="text-green-400">Compliant</span>
                        ) : (
                          <span className="text-red-400">Non-Compliant</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {item.completionDate ? new Date(item.completionDate).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8 text-gray-400">No data available</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplianceReports;

