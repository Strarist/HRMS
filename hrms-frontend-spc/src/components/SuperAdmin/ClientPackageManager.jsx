import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { 
  getPackages, 
  getClientPackages, 
  assignPackageToClient, 
  updateClientPackage,
  cancelClientPackage 
} from '../../api/superAdmin';
import toast from '../../utils/toast';

const ClientPackageManager = ({ clientId, clientName, isOpen, onClose }) => {
  const { theme } = useTheme();
  const [packages, setPackages] = useState([]);
  const [clientPackages, setClientPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [assignmentForm, setAssignmentForm] = useState({
    billingCycle: 'monthly',
    customPrice: '',
    startDate: new Date().toISOString().split('T')[0],
    autoRenew: false,
    trialDays: 0
  });

  useEffect(() => {
    if (isOpen && clientId) {
      fetchPackages();
      fetchClientPackages();
    }
  }, [isOpen, clientId]);

  const fetchPackages = async () => {
    try {
      const response = await getPackages();
      if (response.data?.data?.packages) {
        setPackages(response.data.data.packages);
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
      toast.error('Failed to fetch packages');
    }
  };

  const fetchClientPackages = async () => {
    try {
      const response = await getClientPackages(clientId);
      if (response.data?.clientPackages) {
        setClientPackages(response.data.clientPackages);
      }
    } catch (error) {
      console.error('Error fetching client packages:', error);
    }
  };

  const handleAssignPackage = async () => {
    if (!selectedPackage) return;

    try {
      setLoading(true);
      const assignmentData = {
        clientId,
        packageId: selectedPackage._id,
        ...assignmentForm,
        customPrice: assignmentForm.customPrice ? parseFloat(assignmentForm.customPrice) : null
      };

      await assignPackageToClient(assignmentData);
      toast.success('Package assigned successfully!');
      
      setShowAssignForm(false);
      setSelectedPackage(null);
      setAssignmentForm({
        billingCycle: 'monthly',
        customPrice: '',
        startDate: new Date().toISOString().split('T')[0],
        autoRenew: false,
        trialDays: 0
      });
      
      fetchClientPackages();
    } catch (error) {
      console.error('Error assigning package:', error);
      toast.error(error.response?.data?.message || 'Failed to assign package');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPackage = async (clientPackageId, packageName) => {
    if (!window.confirm(`Are you sure you want to cancel the "${packageName}" package for ${clientName}?`)) {
      return;
    }

    try {
      await cancelClientPackage(clientPackageId, { 
        reason: 'Cancelled by Super Admin' 
      });
      toast.success('Package cancelled successfully');
      fetchClientPackages();
    } catch (error) {
      console.error('Error cancelling package:', error);
      toast.error('Failed to cancel package');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      trial: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      expired: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300',
      suspended: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
    };
    return colors[status] || colors.active;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-xl ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className={`text-2xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Package Management
              </h2>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Managing packages for: <span className="font-medium">{clientName}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Current Packages */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Current Packages
                </h3>
                <button
                  onClick={() => setShowAssignForm(true)}
                  className="flex items-center space-x-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors duration-200"
                >
                  <Plus className="w-4 h-4" />
                  <span>Assign Package</span>
                </button>
              </div>

              <div className="space-y-3">
                {clientPackages.length > 0 ? (
                  clientPackages.map((clientPkg) => (
                    <div
                      key={clientPkg._id}
                      className={`p-4 rounded-lg border ${
                        theme === 'dark' ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className={`font-medium ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {clientPkg.packageId?.name || 'Unknown Package'}
                        </h4>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(clientPkg.status)}`}>
                          {clientPkg.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 mb-3">
                        <div className="flex items-center space-x-1">
                          <DollarSign className="w-4 h-4" />
                          <span>
                            ${clientPkg.customPrice || clientPkg.packageId?.pricing?.monthly || 0}
                            /{clientPkg.billingCycle}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>Ends: {new Date(clientPkg.endDate).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleCancelPackage(clientPkg._id, clientPkg.packageId?.name)}
                          className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                          title="Cancel Package"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Package className={`w-12 h-12 mx-auto mb-4 opacity-50 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                    <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      No packages assigned to this client
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Available Packages or Assignment Form */}
            <div>
              {showAssignForm ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-lg font-semibold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      Assign New Package
                    </h3>
                    <button
                      onClick={() => {
                        setShowAssignForm(false);
                        setSelectedPackage(null);
                      }}
                      className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
                    >
                      Cancel
                    </button>
                  </div>

                  {/* Package Selection */}
                  <div className="space-y-3 mb-4 max-h-40 overflow-y-auto">
                    {packages.map((pkg) => (
                      <div
                        key={pkg._id}
                        onClick={() => setSelectedPackage(pkg)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                          selectedPackage?._id === pkg._id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : theme === 'dark'
                            ? 'border-gray-600 bg-gray-700 hover:bg-gray-600'
                            : 'border-gray-200 bg-white hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`font-medium ${
                              theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                              {pkg.name}
                            </p>
                            <p className="text-xs text-gray-500">{pkg.type}</p>
                          </div>
                          <span className={`text-sm font-medium ${
                            theme === 'dark' ? 'text-green-400' : 'text-green-600'
                          }`}>
                            ${pkg.pricing.monthly}/mo
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Assignment Form */}
                  {selectedPackage && (
                    <div className="space-y-3">
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Billing Cycle
                        </label>
                        <select
                          value={assignmentForm.billingCycle}
                          onChange={(e) => setAssignmentForm({
                            ...assignmentForm,
                            billingCycle: e.target.value
                          })}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            theme === 'dark' 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        >
                          <option value="monthly">Monthly</option>
                          <option value="quarterly">Quarterly</option>
                          <option value="yearly">Yearly</option>
                        </select>
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-1 ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Custom Price (optional)
                        </label>
                        <input
                          type="number"
                          placeholder={`Default: $${selectedPackage.pricing[assignmentForm.billingCycle] || selectedPackage.pricing.monthly}`}
                          value={assignmentForm.customPrice}
                          onChange={(e) => setAssignmentForm({
                            ...assignmentForm,
                            customPrice: e.target.value
                          })}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            theme === 'dark' 
                              ? 'bg-gray-700 border-gray-600 text-white' 
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="autoRenew"
                          checked={assignmentForm.autoRenew}
                          onChange={(e) => setAssignmentForm({
                            ...assignmentForm,
                            autoRenew: e.target.checked
                          })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="autoRenew" className={`text-sm ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Auto Renew
                        </label>
                      </div>

                      <button
                        onClick={handleAssignPackage}
                        disabled={loading}
                        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-200"
                      >
                        {loading ? 'Assigning...' : 'Assign Package'}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <h3 className={`text-lg font-semibold mb-4 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Available Packages
                  </h3>
                  <div className="space-y-3">
                    {packages.map((pkg) => (
                      <div
                        key={pkg._id}
                        className={`p-3 rounded-lg border ${
                          theme === 'dark' ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`font-medium ${
                              theme === 'dark' ? 'text-white' : 'text-gray-900'
                            }`}>
                              {pkg.name}
                            </p>
                            <p className="text-xs text-gray-500">{pkg.type} • {pkg.includedModules?.length || 0} modules</p>
                          </div>
                          <span className={`text-sm font-medium ${
                            theme === 'dark' ? 'text-green-400' : 'text-green-600'
                          }`}>
                            ${pkg.pricing.monthly}/mo
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientPackageManager;
