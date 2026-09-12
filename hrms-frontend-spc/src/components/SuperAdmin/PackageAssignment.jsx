import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import {
  Package,
  User,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter
} from 'lucide-react';
import { 
  getClients, 
  getPackages, 
  assignPackageToClient, 
  getClientPackages 
} from '../../api/superAdmin';
import toast from '../../utils/toast';

const PackageAssignment = ({ isOpen, onClose }) => {
  const { theme } = useTheme();
  const [clients, setClients] = useState([]);
  const [packages, setPackages] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [clientPackages, setClientPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [assignmentForm, setAssignmentForm] = useState({
    billingCycle: 'monthly',
    customPrice: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    autoRenew: false,
    trialDays: 0
  });

  useEffect(() => {
    if (isOpen) {
      fetchClients();
      fetchPackages();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedClient) {
      fetchClientPackages();
    }
  }, [selectedClient]);

  const fetchClients = async () => {
    try {
      console.log('🔍 Fetching clients with search:', searchTerm);
      const response = await getClients({ search: searchTerm });
      console.log('📊 Clients API response:', response);
      console.log('📊 Clients data:', response.data);
      console.log('🔍 Clients response keys:', Object.keys(response.data || {}));
      
      // Check different possible response structures for clients
      let clients = [];
      if (response.data?.data?.clients) {
        clients = response.data.data.clients;
        console.log('✅ Found clients in data.data.clients:', clients.length);
      } else if (response.data?.clients) {
        clients = response.data.clients;
        console.log('✅ Found clients in data.clients:', clients.length);
      } else if (Array.isArray(response.data)) {
        clients = response.data;
        console.log('✅ Found clients as direct array:', clients.length);
      } else {
        console.log('❌ No clients found in any expected location');
        console.log('📋 Clients response keys:', Object.keys(response.data || {}));
      }
      
      setClients(clients || []);
    } catch (error) {
      console.error('❌ Error fetching clients:', error);
      console.error('📋 Client error details:', error.response?.data);
      toast.error('Failed to fetch clients');
      setClients([]);
    }
  };

  const fetchPackages = async () => {
    try {
      console.log('🔍 Fetching packages for assignment...');
      const response = await getPackages();
      console.log('📊 Packages API response:', response);
      console.log('🔍 Packages response keys:', Object.keys(response.data || {}));
      
      // Check different possible response structures for packages
      let packages = [];
      if (response.data?.data?.packages) {
        packages = response.data.data.packages;
        console.log('✅ Found packages in data.data.packages:', packages.length);
      } else if (response.data?.packages) {
        packages = response.data.packages;
        console.log('✅ Found packages in data.packages:', packages.length);
      } else if (Array.isArray(response.data)) {
        packages = response.data;
        console.log('✅ Found packages as direct array:', packages.length);
      } else {
        console.log('❌ No packages found for assignment');
        console.log('📋 Packages response keys:', Object.keys(response.data || {}));
      }
      
      setPackages(packages || []);
    } catch (error) {
      console.error('❌ Error fetching packages for assignment:', error);
      console.error('📋 Package error details:', error.response?.data);
      toast.error('Failed to fetch packages');
      setPackages([]);
    }
  };

  const fetchClientPackages = async () => {
    try {
      const response = await getClientPackages(selectedClient._id);
      setClientPackages(response.data.clientPackages || []);
    } catch (error) {
      console.error('Error fetching client packages:', error);
    }
  };

  const handleAssignPackage = async () => {
    if (!selectedClient || !selectedPackage) {
      toast.error('Please select both client and package');
      return;
    }

    try {
      setLoading(true);
      const assignmentData = {
        clientId: selectedClient._id,
        packageId: selectedPackage._id,
        ...assignmentForm,
        customPrice: assignmentForm.customPrice ? parseFloat(assignmentForm.customPrice) : null
      };

      await assignPackageToClient(assignmentData);
      toast.success('Package assigned successfully!');
      
      // Reset form and refresh data
      setSelectedPackage(null);
      setAssignmentForm({
        billingCycle: 'monthly',
        customPrice: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
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

  const filteredClients = clients.filter(client =>
    client.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`max-w-6xl w-full max-h-[90vh] overflow-y-auto rounded-xl ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-2xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Package Assignment
            </h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Client Selection */}
            <div className={`p-4 rounded-lg border ${
              theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Select Client
              </h3>
              
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              </div>

              {/* Client List */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredClients.map((client) => (
                  <div
                    key={client._id}
                    onClick={() => setSelectedClient(client)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedClient?._id === client._id
                        ? 'bg-blue-100 dark:bg-blue-900/20 border-blue-500'
                        : theme === 'dark'
                        ? 'bg-gray-700 hover:bg-gray-600 border-gray-600'
                        : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                    } border`}
                  >
                    <div className="flex items-center space-x-3">
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className={`font-medium ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {client.companyName}
                        </p>
                        <p className="text-xs text-gray-500">{client.email}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Package Selection & Assignment */}
            <div className={`p-4 rounded-lg border ${
              theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Select Package
              </h3>

              {/* Package List */}
              <div className="space-y-3 mb-4 max-h-40 overflow-y-auto">
                {packages.map((pkg) => (
                  <div
                    key={pkg._id}
                    onClick={() => setSelectedPackage(pkg)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedPackage?._id === pkg._id
                        ? 'bg-green-100 dark:bg-green-900/20 border-green-500'
                        : theme === 'dark'
                        ? 'bg-gray-700 hover:bg-gray-600 border-gray-600'
                        : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                    } border`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Package className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className={`font-medium ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            {pkg.name}
                          </p>
                          <p className="text-xs text-gray-500">{pkg.type}</p>
                        </div>
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

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={assignmentForm.startDate}
                      onChange={(e) => setAssignmentForm({
                        ...assignmentForm,
                        startDate: e.target.value
                      })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        theme === 'dark' 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      End Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={assignmentForm.endDate}
                      onChange={(e) => setAssignmentForm({
                        ...assignmentForm,
                        endDate: e.target.value
                      })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        theme === 'dark' 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="Auto-calculated if not provided"
                    />
                    <p className={`text-xs mt-1 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      If not provided, will be calculated based on billing cycle
                    </p>
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
                    disabled={loading || !selectedClient}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-200"
                  >
                    {loading ? 'Assigning...' : 'Assign Package'}
                  </button>
                </div>
              )}
            </div>

            {/* Current Client Packages */}
            <div className={`p-4 rounded-lg border ${
              theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {selectedClient ? `${selectedClient.companyName} Packages` : 'Client Packages'}
              </h3>

              {selectedClient ? (
                <div className="space-y-3">
                  {clientPackages.length > 0 ? (
                    clientPackages.map((clientPkg) => (
                      <div
                        key={clientPkg._id}
                        className={`p-3 rounded-lg border ${
                          theme === 'dark' ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={`font-medium ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            {clientPkg.packageId?.name}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            clientPkg.status === 'active' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300'
                          }`}>
                            {clientPkg.status}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 space-y-1">
                          <p>Billing: {clientPkg.billingCycle}</p>
                          <p>End Date: {new Date(clientPkg.endDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      No packages assigned
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Select a client to view their packages
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageAssignment;
