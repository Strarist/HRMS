import React, { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import api from '../../api/axios';
import toast from '../../utils/toast';

const ComplianceReport = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      const response = await api.get('/reports/compliance');
      setReport(response.data.data);
    } catch (error) {
      toast.error('Failed to load compliance report');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Compliance Report</h1>
        <p className="text-gray-400 mt-1">Overview of compliance status</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <p className="text-sm text-gray-400 mb-1">Expiring Documents</p>
          <h3 className="text-2xl font-bold text-white">{report?.expiringDocuments?.length || 0}</h3>
        </div>
        <div className="card">
          <p className="text-sm text-gray-400 mb-1">Due Compliances</p>
          <h3 className="text-2xl font-bold text-white">{report?.dueCompliances?.length || 0}</h3>
        </div>
        <div className="card">
          <p className="text-sm text-gray-400 mb-1">Expiring Contracts</p>
          <h3 className="text-2xl font-bold text-white">{report?.expiringContracts?.length || 0}</h3>
        </div>
      </div>
    </div>
  );
};

export default ComplianceReport;
