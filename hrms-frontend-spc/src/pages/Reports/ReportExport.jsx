import React, { useState } from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';
import api from '../../api/axios';
import toast from '../../utils/toast';

const ReportExport = () => {
  const [loading, setLoading] = useState({});

  const downloadReport = async (reportType, params = {}) => {
    setLoading(prev => ({ ...prev, [reportType]: true }));
    
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await api.get(`/reports/export/${reportType}?${queryString}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportType}-${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Report downloaded successfully');
    } catch (error) {
      toast.error('Failed to download report');
    } finally {
      setLoading(prev => ({ ...prev, [reportType]: false }));
    }
  };

  const reports = [
    {
      id: 'employees',
      title: 'Employee Report',
      description: 'Export all employee data with personal and employment details',
      icon: FileSpreadsheet
    },
    {
      id: 'attendance',
      title: 'Attendance Report',
      description: 'Export attendance records with work hours and status',
      icon: FileSpreadsheet
    },
    {
      id: 'timesheets',
      title: 'Timesheet Report',
      description: 'Export project-wise timesheet data for billing',
      icon: FileSpreadsheet
    },
    {
      id: 'payroll',
      title: 'Payroll Report',
      description: 'Export salary details, deductions, and net pay',
      icon: FileSpreadsheet
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Export Reports</h1>
        <p className="text-gray-400 mt-1">Download data in Excel format</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report) => (
          <div key={report.id} className="card">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-primary-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <report.icon size={24} className="text-primary-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">{report.title}</h3>
                <p className="text-sm text-gray-400 mb-4">{report.description}</p>
                <button
                  onClick={() => downloadReport(report.id)}
                  disabled={loading[report.id]}
                  className="btn-primary text-sm flex items-center space-x-2"
                >
                  <Download size={16} />
                  <span>{loading[report.id] ? 'Downloading...' : 'Download Excel'}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportExport;
