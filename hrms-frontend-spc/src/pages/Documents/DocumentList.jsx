import React, { useEffect, useState } from 'react';
import { Plus, FileText, AlertTriangle, CheckCircle } from 'lucide-react';
import api from '../../api/axios';
import toast from '../../utils/toast';

const DocumentList = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await api.get('/documents');
      setDocuments(response.data.data);
    } catch (error) {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesType = filterType === 'all' || doc.documentType === filterType;
    const matchesStatus = filterStatus === 'all' || doc.status === filterStatus;
    return matchesType && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge-warning',
      verified: 'badge-success',
      rejected: 'badge-danger',
      expired: 'badge-default'
    };
    return badges[status] || 'badge-default';
  };

  const getExpiryWarning = (expiryDate) => {
    if (!expiryDate) return null;
    const daysUntilExpiry = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysUntilExpiry <= 0) return 'Expired';
    if (daysUntilExpiry <= 30) return `Expires in ${daysUntilExpiry} days`;
    return null;
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
          <h1 className="text-2xl font-bold text-white">Documents</h1>
          <p className="text-gray-400 mt-1">Manage employee documents and compliance</p>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <Plus size={20} />
          <span>Upload Document</span>
        </button>
      </div>

      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="input-field md:w-48"
          >
            <option value="all">All Types</option>
            <option value="aadhaar">Aadhaar</option>
            <option value="pan">PAN</option>
            <option value="passport">Passport</option>
            <option value="offer-letter">Offer Letter</option>
            <option value="contract">Contract</option>
            <option value="education">Education</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-field md:w-48"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      <div className="card p-0">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Document Type</th>
                <th>Document Name</th>
                <th>Issue Date</th>
                <th>Expiry Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.map((doc) => {
                const expiryWarning = getExpiryWarning(doc.expiryDate);
                return (
                  <tr key={doc._id}>
                    <td>
                      {doc.employee?.firstName} {doc.employee?.lastName}
                    </td>
                    <td className="capitalize">{doc.documentType}</td>
                    <td>{doc.documentName}</td>
                    <td>
                      {doc.issueDate ? new Date(doc.issueDate).toLocaleDateString() : '-'}
                    </td>
                    <td>
                      <div className="flex items-center space-x-2">
                        <span>
                          {doc.expiryDate ? new Date(doc.expiryDate).toLocaleDateString() : '-'}
                        </span>
                        {expiryWarning && (
                          <span className="flex items-center text-xs text-yellow-500">
                            <AlertTriangle size={14} className="mr-1" />
                            {expiryWarning}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadge(doc.status)}`}>
                        {doc.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-blue-400 hover:bg-dark-800 rounded">
                          View
                        </button>
                        {doc.status === 'pending' && (
                          <button className="p-2 text-green-400 hover:bg-dark-800 rounded">
                            <CheckCircle size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredDocuments.length === 0 && (
        <div className="text-center py-12">
          <FileText size={48} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">No documents found</p>
        </div>
      )}
    </div>
  );
};

export default DocumentList;
