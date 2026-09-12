import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { X, Save, Building, Mail, Phone, MapPin, User, CreditCard, Calendar, Clock, Users, Briefcase, FileText } from 'lucide-react';
import { createClient, updateClient } from '../api/superAdmin';
import toast from '../utils/toast';

const ClientForm = ({ client, onClose, onSuccess }) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    companyName: '',
    clientCode: '',
    email: '',
    adminEmail: '', // Admin user login email
    phone: '',
    address: '',
    contactPerson: '',
    subscriptionPlan: 'basic',
    subscriptionStartDate: new Date().toISOString().split('T')[0],
    subscriptionEndDate: '',
    maxUsers: 10,
    status: 'active',
    industry: '',
    website: '',
    taxId: '',
    notes: ''
  });

  useEffect(() => {
    if (client) {
      setFormData({
        companyName: client.companyName || '',
        clientCode: client.clientCode || '',
        email: client.email || '',
        adminEmail: client.contactPerson?.email || '', // Use contact person email as admin email
        phone: client.phone || '',
        address: typeof client.address === 'string' ? client.address : '',
        contactPerson: client.contactPerson?.name || '',
        subscriptionPlan: client.subscription?.plan || 'basic',
        subscriptionStartDate: client.subscription?.startDate ? new Date(client.subscription.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        subscriptionEndDate: client.subscription?.endDate ? new Date(client.subscription.endDate).toISOString().split('T')[0] : '',
        maxUsers: client.subscription?.maxUsers || 10,
        status: client.status || 'active',
        industry: client.industry || '',
        website: client.website || '',
        taxId: client.taxId || '',
        notes: client.notes || ''
      });
    }
  }, [client]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const clientData = {
        clientCode: formData.clientCode,
        name: formData.companyName, // Use companyName for name field
        companyName: formData.companyName,
        email: formData.email,
        adminEmail: formData.adminEmail, // Admin user email
        phone: formData.phone,
        address: formData.address,
        contactPerson: {
          name: formData.contactPerson,
          email: formData.adminEmail || formData.email, // Use admin email or fallback to company email
          phone: formData.phone
        },
        status: formData.status,
        industry: formData.industry,
        website: formData.website,
        taxId: formData.taxId,
        notes: formData.notes,
        subscription: {
          plan: formData.subscriptionPlan,
          startDate: formData.subscriptionStartDate,
          endDate: formData.subscriptionEndDate,
          maxUsers: formData.maxUsers,
          status: 'active'
        }
      };

      if (client) {
        await updateClient(client._id, clientData);
        toast.success('Client updated successfully');
      } else {
        await createClient(clientData);
        toast.success('Client created successfully');
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving client:', error);
      toast.error(error.response?.data?.message || 'Failed to save client');
    }
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${
      theme === 'dark' ? 'dark' : ''
    }`}>
      <div className={`w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden ${
        theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
      }`}>
        <div className={`flex items-center justify-between p-4 border-b ${
          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <h2 className="text-xl font-semibold">
            {client ? 'Edit Client' : 'Add New Client'}
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-full hover:bg-opacity-10 hover:bg-gray-500 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Company Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium flex items-center">
                <Building className="w-5 h-5 mr-2 text-blue-500" />
                Company Information
              </h3>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600' 
                      : 'bg-white border-gray-300'
                  }`}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Client Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="clientCode"
                  value={formData.clientCode}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600' 
                      : 'bg-white border-gray-300'
                  }`}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Industry
                </label>
                <input
                  type="text"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600' 
                      : 'bg-white border-gray-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Website
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">https://</span>
                  </div>
                  <input
                    type="text"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 pl-16 rounded-lg border ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600' 
                        : 'bg-white border-gray-300'
                    }`}
                    placeholder="example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Tax ID
                </label>
                <input
                  type="text"
                  name="taxId"
                  value={formData.taxId}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600' 
                      : 'bg-white border-gray-300'
                  }`}
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-500" />
                Contact Information
              </h3>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Contact Person <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600' 
                      : 'bg-white border-gray-300'
                  }`}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Company Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-500" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-10 px-3 py-2 rounded-lg border ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600' 
                        : 'bg-white border-gray-300'
                    }`}
                    placeholder="company@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Admin User Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-gray-500" />
                  </div>
                  <input
                    type="email"
                    name="adminEmail"
                    value={formData.adminEmail}
                    onChange={handleChange}
                    className={`w-full pl-10 px-3 py-2 rounded-lg border ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600' 
                        : 'bg-white border-gray-300'
                    }`}
                    placeholder="admin@example.com"
                    required
                  />
                </div>
                <p className={`text-xs mt-1 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  This email will be used to create the admin user account (password: password123)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Phone <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-4 w-4 text-gray-500" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full pl-10 px-3 py-2 rounded-lg border ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600' 
                        : 'bg-white border-gray-300'
                    }`}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Address
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-3">
                    <MapPin className="h-4 w-4 text-gray-500" />
                  </div>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="3"
                    className={`w-full pl-10 px-3 py-2 rounded-lg border ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600' 
                        : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Subscription Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-blue-500" />
                Subscription Details
              </h3>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Plan <span className="text-red-500">*</span>
                </label>
                <select
                  name="subscriptionPlan"
                  value={formData.subscriptionPlan}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600' 
                      : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="free">Free</option>
                  <option value="basic">Basic</option>
                  <option value="standard">Standard</option>
                  <option value="premium">Premium</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      name="subscriptionStartDate"
                      value={formData.subscriptionStartDate}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' 
                          ? 'bg-gray-700 border-gray-600' 
                          : 'bg-white border-gray-300'
                      }`}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    End Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      name="subscriptionEndDate"
                      value={formData.subscriptionEndDate}
                      onChange={handleChange}
                      min={formData.subscriptionStartDate}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark' 
                          ? 'bg-gray-700 border-gray-600' 
                          : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Maximum Users <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Users className="h-4 w-4 text-gray-500" />
                  </div>
                  <input
                    type="number"
                    name="maxUsers"
                    min="1"
                    value={formData.maxUsers}
                    onChange={handleChange}
                    className={`w-full pl-10 px-3 py-2 rounded-lg border ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600' 
                        : 'bg-white border-gray-300'
                    }`}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600' 
                      : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-500" />
                Additional Information
              </h3>
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="4"
                  className={`w-full px-3 py-2 rounded-lg border ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600' 
                      : 'bg-white border-gray-300'
                  }`}
                  placeholder="Any additional notes about this client..."
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              {client ? 'Update Client' : 'Create Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientForm;
