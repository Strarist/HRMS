import React, { useState, useEffect } from 'react';
import { Download, Filter, FileText, AlertCircle } from 'lucide-react';
import api from '../../api/axios';
import toast from '../../utils/toast';

const AttendanceReports = () => {
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('summary');
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    department: '',
    employee: ''
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
      const params = { ...filters };
      let endpoint = '';
      
      switch (reportType) {
        case 'summary':
          endpoint = '/reports/attendance/summary';
          break;
        case 'exception':
          endpoint = '/reports/attendance/exceptions';
          break;
        default:
          endpoint = '/reports/attendance/summary';
      }
      
      const response = await api.get(endpoint, { params });
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
      let endpoint = '';
      
      switch (reportType) {
        case 'summary':
          endpoint = '/reports/attendance/summary';
          break;
        case 'exception':
          endpoint = '/reports/attendance/exceptions';
          break;
        default:
          endpoint = '/reports/attendance/summary';
      }
      
      const response = await api.get(endpoint, { 
        params,
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance-report-${reportType}-${Date.now()}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(`Report exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to export report');
    }
  };

  useEffect(() => {
    if (reportData === null) {
      fetchReport();
    }
  }, [reportType]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Attendance Reports</h1>
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
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => {
                setReportType(e.target.value);
                setReportData(null);
              }}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
            >
              <option value="summary">Attendance Summary</option>
              <option value="exception">Exception Report</option>
            </select>
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
              <FileText size={20} className="text-gray-400" />
              <h2 className="text-lg font-semibold text-white">Report Results</h2>
            </div>
          </div>
          <div className="p-4">
            {reportData.data && Array.isArray(reportData.data) ? (
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Employee</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Check In</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Check Out</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Hours</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {reportData.data.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-750">
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {item.employeeName || item.employee?.name || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {item.date ? new Date(item.date).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">{item.checkIn || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">{item.checkOut || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">{item.hours || item.workingHours || '-'}</td>
                      <td className="px-4 py-3">
                        {item.status === 'exception' ? (
                          <span className="flex items-center gap-1 text-yellow-400">
                            <AlertCircle size={16} />
                            Exception
                          </span>
                        ) : (
                          <span className="text-green-400">Normal</span>
                        )}
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

export default AttendanceReports;

