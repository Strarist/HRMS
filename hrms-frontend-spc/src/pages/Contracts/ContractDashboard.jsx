/**
 * Contract Management Dashboard
 * Overview of all contracts with statistics and quick actions
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '../../utils/toast';
import { 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Clock,
  TrendingUp,
  Plus
} from 'lucide-react';
import { getContractStats, getContracts } from '../../api/contracts';

const ContractDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [expiringContracts, setExpiringContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch statistics
      const statsResponse = await getContractStats();
      setStats(statsResponse.data);
      
      // Fetch expiring contracts
      const expiringResponse = await getContracts({ expiringSoon: true, limit: 5 });
      setExpiringContracts(expiringResponse.data);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, color, bgColor, onClick }) => (
    <div 
      className={`bg-dark-800 rounded-lg p-6 border border-dark-700 hover:border-primary-500 transition-all cursor-pointer ${onClick ? 'hover:shadow-lg' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-1">{title}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
        </div>
        <div className={`${bgColor} p-4 rounded-lg`}>
          <Icon className={color} size={32} />
        </div>
      </div>
    </div>
  );

  const formatContractType = (type) => {
    return type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'active': 'text-green-400 bg-green-400/10',
      'draft': 'text-gray-400 bg-gray-400/10',
      'pending-renewal': 'text-yellow-400 bg-yellow-400/10',
      'expired': 'text-red-400 bg-red-400/10',
      'terminated': 'text-red-400 bg-red-400/10'
    };
    return colors[status] || 'text-gray-400 bg-gray-400/10';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Contract Management</h1>
          <p className="text-gray-400 mt-1">Manage employee contracts and track renewals</p>
        </div>
        <button
          onClick={() => navigate('/contracts/create')}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus size={20} />
          Create Contract
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={FileText}
          title="Total Contracts"
          value={stats?.totalContracts || 0}
          color="text-blue-400"
          bgColor="bg-blue-400/10"
          onClick={() => navigate('/contracts')}
        />
        <StatCard
          icon={CheckCircle}
          title="Active Contracts"
          value={stats?.activeContracts || 0}
          color="text-green-400"
          bgColor="bg-green-400/10"
          onClick={() => navigate('/contracts?status=active')}
        />
        <StatCard
          icon={AlertCircle}
          title="Expiring Soon"
          value={stats?.expiringContracts || 0}
          color="text-yellow-400"
          bgColor="bg-yellow-400/10"
          onClick={() => navigate('/contracts?expiringSoon=true')}
        />
        <StatCard
          icon={XCircle}
          title="Expired"
          value={stats?.expiredContracts || 0}
          color="text-red-400"
          bgColor="bg-red-400/10"
          onClick={() => navigate('/contracts?status=expired')}
        />
      </div>

      {/* Contracts by Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contract Types Distribution */}
        <div className="bg-dark-800 rounded-lg p-6 border border-dark-700">
          <h2 className="text-xl font-semibold text-white mb-4">Contracts by Type</h2>
          <div className="space-y-3">
            {stats?.contractsByType && Object.keys(stats.contractsByType).length > 0 ? (
              Object.entries(stats.contractsByType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-gray-300">{formatContractType(type)}</span>
                  <span className="text-white font-semibold">{count}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-4">No contracts available</p>
            )}
          </div>
        </div>

        {/* Pending Actions */}
        <div className="bg-dark-800 rounded-lg p-6 border border-dark-700">
          <h2 className="text-xl font-semibold text-white mb-4">Pending Actions</h2>
          <div className="space-y-3">
            <div 
              className="flex items-center justify-between p-3 bg-dark-700 rounded-lg cursor-pointer hover:bg-dark-600 transition-colors"
              onClick={() => navigate('/contracts?approvalStatus=pending')}
            >
              <div className="flex items-center gap-3">
                <Clock className="text-yellow-400" size={20} />
                <span className="text-gray-300">Pending Approval</span>
              </div>
              <span className="text-white font-semibold">{stats?.pendingApproval || 0}</span>
            </div>
            
            <div 
              className="flex items-center justify-between p-3 bg-dark-700 rounded-lg cursor-pointer hover:bg-dark-600 transition-colors"
              onClick={() => navigate('/contracts?expiringSoon=true')}
            >
              <div className="flex items-center gap-3">
                <AlertCircle className="text-orange-400" size={20} />
                <span className="text-gray-300">Renewal Required</span>
              </div>
              <span className="text-white font-semibold">{stats?.expiringContracts || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Expiring Contracts Table */}
      {expiringContracts.length > 0 && (
        <div className="bg-dark-800 rounded-lg p-6 border border-dark-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Contracts Expiring Soon</h2>
            <button
              onClick={() => navigate('/contracts?expiringSoon=true')}
              className="text-primary-400 hover:text-primary-300 text-sm flex items-center gap-1"
            >
              View All
              <TrendingUp size={16} />
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-700">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Contract #</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Employee</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Type</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Expiry Date</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Days Left</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {expiringContracts.map((contract) => (
                  <tr key={contract._id} className="border-b border-dark-700 hover:bg-dark-700/50">
                    <td className="py-3 px-4 text-white">{contract.contractNumber}</td>
                    <td className="py-3 px-4 text-white">{contract.employeeName}</td>
                    <td className="py-3 px-4 text-gray-300">{formatContractType(contract.contractType)}</td>
                    <td className="py-3 px-4 text-gray-300">{formatDate(contract.endDate)}</td>
                    <td className="py-3 px-4">
                      <span className={`font-semibold ${contract.daysUntilExpiry <= 7 ? 'text-red-400' : 'text-yellow-400'}`}>
                        {contract.daysUntilExpiry} days
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(contract.status)}`}>
                        {contract.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => navigate(`/contracts/${contract._id}`)}
                        className="text-primary-400 hover:text-primary-300 text-sm"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => navigate('/contracts/create')}
          className="bg-dark-800 border border-dark-700 rounded-lg p-6 hover:border-primary-500 transition-colors text-left group"
        >
          <Plus className="text-primary-400 mb-3 group-hover:scale-110 transition-transform" size={32} />
          <h3 className="text-white font-semibold mb-1">Create New Contract</h3>
          <p className="text-gray-400 text-sm">Add a new employee contract</p>
        </button>

        <button
          onClick={() => navigate('/contracts')}
          className="bg-dark-800 border border-dark-700 rounded-lg p-6 hover:border-primary-500 transition-colors text-left group"
        >
          <FileText className="text-blue-400 mb-3 group-hover:scale-110 transition-transform" size={32} />
          <h3 className="text-white font-semibold mb-1">View All Contracts</h3>
          <p className="text-gray-400 text-sm">Browse and manage contracts</p>
        </button>

        <button
          onClick={() => navigate('/contracts?expiringSoon=true')}
          className="bg-dark-800 border border-dark-700 rounded-lg p-6 hover:border-primary-500 transition-colors text-left group"
        >
          <AlertCircle className="text-yellow-400 mb-3 group-hover:scale-110 transition-transform" size={32} />
          <h3 className="text-white font-semibold mb-1">Renewal Alerts</h3>
          <p className="text-gray-400 text-sm">Review contracts needing renewal</p>
        </button>
      </div>
    </div>
  );
};

export default ContractDashboard;
