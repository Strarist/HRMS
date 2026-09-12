import React, { useEffect, useState } from 'react';
import { Plus, Package } from 'lucide-react';
import api from '../api/axios';
import toast from '../utils/toast';

const Assets = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const response = await api.get('/assets');
      setAssets(response.data.data);
    } catch (error) {
      toast.error('Failed to load assets');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      available: 'badge-success',
      assigned: 'badge-info',
      maintenance: 'badge-warning',
      retired: 'badge-danger'
    };
    return badges[status] || 'badge-default';
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Assets</h1>
          <p className="text-gray-400 mt-1">Manage company assets</p>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <Plus size={20} />
          <span>Add Asset</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assets.map((asset) => (
          <div key={asset._id} className="card">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary-600/20 rounded-lg flex items-center justify-center">
                  <Package size={24} className="text-primary-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{asset.name}</h3>
                  <p className="text-sm text-gray-400">{asset.assetCode}</p>
                </div>
              </div>
              <span className={`badge ${getStatusBadge(asset.status)}`}>
                {asset.status}
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Category:</span>
                <span className="text-white capitalize">{asset.category}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Brand:</span>
                <span className="text-white">{asset.brand || 'N/A'}</span>
              </div>
              {asset.assignedTo && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Assigned To:</span>
                  <span className="text-white">{asset.assignedTo.firstName}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Assets;
