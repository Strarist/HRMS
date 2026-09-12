import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { X, Package, DollarSign, Users, Settings } from 'lucide-react';
import { createPackage, updatePackage } from '../../api/superAdmin';
import toast from '../../utils/toast';

const PackageForm = ({ package: editPackage, onClose, onSuccess }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'starter',
    pricing: {
      monthly: '',
      quarterly: '',
      yearly: '',
      currency: 'USD'
    },
    features: {
      maxEmployees: '',
      maxAdmins: '2',
      storageLimit: '10',
      customBranding: false,
      apiAccess: false,
      advancedReporting: false,
      multiLocation: false,
      integrations: false
    },
    includedModules: [],
    isActive: true,
    isPopular: false,
    trialDays: '14'
  });

  const moduleOptions = [
    'hr', 'payroll', 'timesheet', 'attendance', 
    'recruitment', 'performance', 'assets', 'compliance'
  ];

  const packageTypes = [
    { value: 'starter', label: 'Starter', color: 'text-green-600' },
    { value: 'professional', label: 'Professional', color: 'text-blue-600' },
    { value: 'enterprise', label: 'Enterprise', color: 'text-purple-600' },
    { value: 'custom', label: 'Custom', color: 'text-orange-600' }
  ];

  useEffect(() => {
    if (editPackage) {
      setFormData({
        name: editPackage.name || '',
        description: editPackage.description || '',
        type: editPackage.type || 'starter',
        pricing: {
          monthly: editPackage.pricing?.monthly?.toString() || '',
          quarterly: editPackage.pricing?.quarterly?.toString() || '',
          yearly: editPackage.pricing?.yearly?.toString() || '',
          currency: editPackage.pricing?.currency || 'USD'
        },
        features: {
          maxEmployees: editPackage.features?.maxEmployees?.toString() || '',
          maxAdmins: editPackage.features?.maxAdmins?.toString() || '2',
          storageLimit: editPackage.features?.storageLimit?.toString() || '10',
          customBranding: editPackage.features?.customBranding || false,
          apiAccess: editPackage.features?.apiAccess || false,
          advancedReporting: editPackage.features?.advancedReporting || false,
          multiLocation: editPackage.features?.multiLocation || false,
          integrations: editPackage.features?.integrations || false
        },
        includedModules: editPackage.includedModules || [],
        isActive: editPackage.isActive !== undefined ? editPackage.isActive : true,
        isPopular: editPackage.isPopular || false,
        trialDays: editPackage.trialDays?.toString() || '14'
      });
    }
  }, [editPackage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const packageData = {
        ...formData,
        pricing: {
          ...formData.pricing,
          monthly: parseFloat(formData.pricing.monthly) || 0,
          quarterly: parseFloat(formData.pricing.quarterly) || 0,
          yearly: parseFloat(formData.pricing.yearly) || 0
        },
        features: {
          ...formData.features,
          maxEmployees: parseInt(formData.features.maxEmployees) || 0,
          maxAdmins: parseInt(formData.features.maxAdmins) || 2,
          storageLimit: parseInt(formData.features.storageLimit) || 10
        },
        trialDays: parseInt(formData.trialDays) || 14
      };

      if (editPackage) {
        await updatePackage(editPackage._id, packageData);
        toast.success('Package updated successfully!');
      } else {
        await createPackage(packageData);
        toast.success('Package created successfully!');
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving package:', error);
      toast.error(error.response?.data?.message || 'Failed to save package');
    } finally {
      setLoading(false);
    }
  };

  const handleModuleToggle = (module) => {
    setFormData(prev => ({
      ...prev,
      includedModules: prev.includedModules.includes(module)
        ? prev.includedModules.filter(m => m !== module)
        : [...prev.includedModules, module]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl shadow-xl ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Package className="w-6 h-6 text-blue-600" />
            <h2 className={`text-xl font-semibold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {editPackage ? 'Edit Package' : 'Create New Package'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Package Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Package Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                required
              >
                {packageTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                theme === 'dark' 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              required
            />
          </div>

          {/* Pricing */}
          <div>
            <h3 className={`text-lg font-medium mb-4 flex items-center space-x-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              <DollarSign className="w-5 h-5" />
              <span>Pricing</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Monthly Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.pricing.monthly}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    pricing: { ...prev.pricing, monthly: e.target.value }
                  }))}
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
                  Quarterly Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.pricing.quarterly}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    pricing: { ...prev.pricing, quarterly: e.target.value }
                  }))}
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
                  Yearly Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.pricing.yearly}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    pricing: { ...prev.pricing, yearly: e.target.value }
                  }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Features */}
          <div>
            <h3 className={`text-lg font-medium mb-4 flex items-center space-x-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              <Settings className="w-5 h-5" />
              <span>Features & Limits</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Max Employees
                </label>
                <input
                  type="number"
                  value={formData.features.maxEmployees}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    features: { ...prev.features, maxEmployees: e.target.value }
                  }))}
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
                  Max Admins
                </label>
                <input
                  type="number"
                  value={formData.features.maxAdmins}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    features: { ...prev.features, maxAdmins: e.target.value }
                  }))}
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
                  Storage Limit (GB)
                </label>
                <input
                  type="number"
                  value={formData.features.storageLimit}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    features: { ...prev.features, storageLimit: e.target.value }
                  }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>

            {/* Feature Toggles */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              {[
                { key: 'customBranding', label: 'Custom Branding' },
                { key: 'apiAccess', label: 'API Access' },
                { key: 'advancedReporting', label: 'Advanced Reporting' },
                { key: 'multiLocation', label: 'Multi Location' },
                { key: 'integrations', label: 'Integrations' }
              ].map(feature => (
                <div key={feature.key} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={feature.key}
                    checked={formData.features[feature.key]}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      features: { ...prev.features, [feature.key]: e.target.checked }
                    }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor={feature.key} className={`text-sm ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {feature.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Included Modules */}
          <div>
            <h3 className={`text-lg font-medium mb-4 flex items-center space-x-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              <Users className="w-5 h-5" />
              <span>Included Modules</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {moduleOptions.map(module => (
                <div key={module} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={module}
                    checked={formData.includedModules.includes(module)}
                    onChange={() => handleModuleToggle(module)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor={module} className={`text-sm capitalize ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {module}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Trial Days
              </label>
              <input
                type="number"
                value={formData.trialDays}
                onChange={(e) => setFormData(prev => ({ ...prev, trialDays: e.target.value }))}
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
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isActive" className={`text-sm ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Active Package
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPopular"
                checked={formData.isPopular}
                onChange={(e) => setFormData(prev => ({ ...prev, isPopular: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isPopular" className={`text-sm ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Popular Package
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 ${
                theme === 'dark' 
                  ? 'border-gray-600 text-gray-300' 
                  : 'border-gray-300 text-gray-700'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : (editPackage ? 'Update Package' : 'Create Package')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PackageForm;
