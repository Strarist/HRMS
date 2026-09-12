/**
 * Contract List Page
 * Display and filter all employee contracts
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from '../../utils/toast';
import { 
  Filter,
  Search,
  Eye,
  Download,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { getContracts } from '../../api/contracts';

const ContractList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  
  // Filters
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || '',
    contractType: searchParams.get('contractType') || '',
    expiringSoon: searchParams.get('expiringSoon') === 'true' || false
  });

  useEffect(() => {
    fetchContracts();
  }, [pagination.page, filters]);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };
      
      const response = await getContracts(params);
      setContracts(response.data);
      setPagination(prev => ({ ...prev, ...response.pagination }));
      
    } catch (error) {
      console.error('Error fetching contracts:', error);
      toast.error('Failed to load contracts');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
    
    // Update URL params
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    setSearchParams(params);
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: '',
      contractType: '',
      expiringSoon: false
    });
    setSearchParams({});
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatContractType = (type) => {
    return type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const getStatusColor = (status) => {
    const colors = {
      'active': 'text-green-400 bg-green-400/10 border-green-400/20',
      'draft': 'text-gray-400 bg-gray-400/10 border-gray-400/20',
      'pending-renewal': 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
      'expired': 'text-red-400 bg-red-400/10 border-red-400/20',
      'terminated': 'text-red-400 bg-red-400/10 border-red-400/20',
      'completed': 'text-blue-400 bg-blue-400/10 border-blue-400/20'
    };
    return colors[status] || 'text-gray-400 bg-gray-400/10 border-gray-400/20';
  };

  const getDaysColor = (days) => {
    if (days <= 7) return 'text-red-400';
    if (days <= 30) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">All Contracts</h1>
          <p className="text-gray-400 mt-1">Browse and manage employee contracts</p>
        </div>
        <button
          onClick={() => navigate('/contracts/create')}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          Create Contract
        </button>
      </div>

      {/* Filters */}
      <div className="bg-dark-800 rounded-lg p-6 border border-dark-700 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="text-gray-400" size={20} />
          <h3 className="text-white font-semibold">Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-gray-400 text-sm mb-2">Search</label>
            <div className="relative">
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Contract # or Employee name"
                className="w-full bg-dark-700 text-white rounded-lg px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-gray-400 text-sm mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full bg-dark-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="pending-renewal">Pending Renewal</option>
              <option value="expired">Expired</option>
              <option value="terminated">Terminated</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Contract Type Filter */}
          <div>
            <label className="block text-gray-400 text-sm mb-2">Contract Type</label>
            <select
              value={filters.contractType}
              onChange={(e) => handleFilterChange('contractType', e.target.value)}
              className="w-full bg-dark-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Types</option>
              <option value="fixed-deliverable">Fixed Deliverable</option>
              <option value="rate-based">Rate Based</option>
              <option value="hourly-based">Hourly Based</option>
            </select>
          </div>

          {/* Expiring Soon Toggle */}
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.expiringSoon}
                onChange={(e) => handleFilterChange('expiringSoon', e.target.checked)}
                className="w-5 h-5 text-primary-600 bg-dark-700 border-dark-600 rounded focus:ring-primary-500"
              />
              <span className="text-gray-300">Expiring Soon</span>
            </label>
          </div>
        </div>

        {/* Clear Filters */}
        {(filters.search || filters.status || filters.contractType || filters.expiringSoon) && (
          <button
            onClick={handleClearFilters}
            className="text-primary-400 hover:text-primary-300 text-sm flex items-center gap-1"
          >
            <RefreshCw size={14} />
            Clear Filters
          </button>
        )}
      </div>

      {/* Contracts Table */}
      <div className="bg-dark-800 rounded-lg border border-dark-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : contracts.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-400">No contracts found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark-700">
                  <tr>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Contract #</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Employee</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Title</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Type</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Start Date</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">End Date</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Days Left</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Status</th>
                    <th className="text-left py-4 px-6 text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {contracts.map((contract) => (
                    <tr key={contract._id} className="border-t border-dark-700 hover:bg-dark-700/50">
                      <td className="py-4 px-6">
                        <span className="text-white font-medium">{contract.contractNumber}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="text-white">{contract.employeeName}</p>
                          <p className="text-gray-400 text-sm">{contract.employeeCode}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-300">
                        {contract.title}
                      </td>
                      <td className="py-4 px-6 text-gray-300">
                        {formatContractType(contract.contractType)}
                      </td>
                      <td className="py-4 px-6 text-gray-300">
                        {formatDate(contract.startDate)}
                      </td>
                      <td className="py-4 px-6 text-gray-300">
                        {formatDate(contract.endDate)}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`font-semibold ${getDaysColor(contract.daysUntilExpiry)}`}>
                          {contract.daysUntilExpiry > 0 ? `${contract.daysUntilExpiry} days` : 'Expired'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(contract.status)}`}>
                          {contract.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/contracts/${contract._id}`)}
                            className="text-primary-400 hover:text-primary-300 p-2 hover:bg-primary-400/10 rounded transition-colors"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-dark-700">
                <p className="text-gray-400 text-sm">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} contracts
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 bg-dark-700 text-white rounded-lg hover:bg-dark-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-gray-300">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.pages}
                    className="px-4 py-2 bg-dark-700 text-white rounded-lg hover:bg-dark-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ContractList;
