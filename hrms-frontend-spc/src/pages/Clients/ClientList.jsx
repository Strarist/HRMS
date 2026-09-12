import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Building2, X, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import toast from '../../utils/toast';

const ClientList = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    email: '',
    phone: '',
    clientCode: '',
    status: 'active',
    billingType: 'per-month',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    contactPerson: {
      name: '',
      designation: '',
      email: '',
      phone: ''
    },
    industry: '',
    website: '',
    notes: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await api.get('/clients');
      setClients(response.data.data);
    } catch (error) {
      toast.error('Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await api.delete(`/clients/${id}`);
        toast.success('Client deleted successfully');
        fetchClients();
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Failed to delete client');
      }
    }
  };

  const handleAdd = () => {
    setFormData({
      name: '',
      companyName: '',
      email: '',
      phone: '',
      clientCode: '',
      status: 'active',
      billingType: 'per-month',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      },
      contactPerson: {
        name: '',
        designation: '',
        email: '',
        phone: ''
      },
      industry: '',
      website: '',
      notes: ''
    });
    setErrors({});
    setSelectedClient(null);
    setShowAddModal(true);
  };

  const handleEdit = (client) => {
    setFormData({
      name: client.name || '',
      companyName: client.companyName || '',
      email: client.email || '',
      phone: client.phone || '',
      clientCode: client.clientCode || '',
      status: client.status || 'active',
      billingType: client.billingType || 'per-month',
      address: {
        street: client.address?.street || '',
        city: client.address?.city || '',
        state: client.address?.state || '',
        zipCode: client.address?.zipCode || '',
        country: client.address?.country || ''
      },
      contactPerson: {
        name: client.contactPerson?.name || '',
        designation: client.contactPerson?.designation || '',
        email: client.contactPerson?.email || '',
        phone: client.contactPerson?.phone || ''
      },
      industry: client.industry || '',
      website: client.website || '',
      notes: client.notes || ''
    });
    setErrors({});
    setSelectedClient(client);
    setShowEditModal(true);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Client name is required';
    }
    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      const payload = { ...formData };
      
      // Remove empty optional fields
      if (!payload.clientCode) delete payload.clientCode;
      if (!payload.industry) delete payload.industry;
      if (!payload.website) delete payload.website;
      if (!payload.notes) delete payload.notes;

      if (selectedClient) {
        // Update
        await api.put(`/clients/${selectedClient._id}`, payload);
        toast.success('Client updated successfully');
        setShowEditModal(false);
      } else {
        // Create
        await api.post('/clients', payload);
        toast.success('Client created successfully');
        setShowAddModal(false);
      }
      
      setSelectedClient(null);
      fetchClients();
    } catch (error) {
      toast.error(error?.response?.data?.message || `Failed to ${selectedClient ? 'update' : 'create'} client`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.clientCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || client.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const badges = {
      active: 'badge-success',
      inactive: 'badge-default',
      suspended: 'badge-danger'
    };
    return badges[status] || 'badge-default';
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
          <h1 className="text-2xl font-bold text-white">Clients</h1>
          <p className="text-gray-400 mt-1">Manage client relationships</p>
        </div>
        <button onClick={handleAdd} className="btn-primary flex items-center space-x-2">
          <Plus size={20} />
          <span>Add Client</span>
        </button>
      </div>

      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-field md:w-48"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => (
          <div key={client._id} className="card hover:border-primary-600 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary-600/20 rounded-lg flex items-center justify-center">
                  <Building2 size={24} className="text-primary-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{client.name}</h3>
                  <p className="text-sm text-gray-400">{client.clientCode}</p>
                </div>
              </div>
              <span className={`badge ${getStatusBadge(client.status)}`}>
                {client.status}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-400">
                <span className="font-medium text-gray-300 w-24">Company:</span>
                <span>{client.companyName}</span>
              </div>
              <div className="flex items-center text-sm text-gray-400">
                <span className="font-medium text-gray-300 w-24">Email:</span>
                <span className="truncate">{client.email}</span>
              </div>
              <div className="flex items-center text-sm text-gray-400">
                <span className="font-medium text-gray-300 w-24">Phone:</span>
                <span>{client.phone}</span>
              </div>
              <div className="flex items-center text-sm text-gray-400">
                <span className="font-medium text-gray-300 w-24">Billing:</span>
                <span className="capitalize">{client.billingType}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-4 border-t border-dark-800">
              <Link
                to={`/clients/${client._id}`}
                className="flex-1 btn-outline text-sm py-2 flex items-center justify-center space-x-1"
              >
                <Eye size={16} />
                <span>View</span>
              </Link>
              <button 
                onClick={() => handleEdit(client)}
                className="flex-1 btn-outline text-sm py-2 flex items-center justify-center space-x-1"
              >
                <Edit size={16} />
                <span>Edit</span>
              </button>
              <button
                onClick={() => handleDelete(client._id)}
                className="btn-outline text-sm py-2 px-3 text-red-500 hover:bg-red-500/10"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-12">
          <Building2 size={48} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">No clients found</p>
        </div>
      )}

      {/* Add Client Modal */}
      {showAddModal && (
        <ClientModal
          formData={formData}
          errors={errors}
          submitting={submitting}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onClose={() => {
            setShowAddModal(false);
            setFormData({
              name: '',
              companyName: '',
              email: '',
              phone: '',
              clientCode: '',
              status: 'active',
              billingType: 'per-month',
              address: { street: '', city: '', state: '', zipCode: '', country: '' },
              contactPerson: { name: '', designation: '', email: '', phone: '' },
              industry: '',
              website: '',
              notes: ''
            });
            setErrors({});
          }}
          title="Add Client"
        />
      )}

      {/* Edit Client Modal */}
      {showEditModal && (
        <ClientModal
          formData={formData}
          errors={errors}
          submitting={submitting}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onClose={() => {
            setShowEditModal(false);
            setSelectedClient(null);
            setFormData({
              name: '',
              companyName: '',
              email: '',
              phone: '',
              clientCode: '',
              status: 'active',
              billingType: 'per-month',
              address: { street: '', city: '', state: '', zipCode: '', country: '' },
              contactPerson: { name: '', designation: '', email: '', phone: '' },
              industry: '',
              website: '',
              notes: ''
            });
            setErrors({});
          }}
          title="Edit Client"
        />
      )}
    </div>
  );
};

// Client Modal Component
const ClientModal = ({ formData, errors, submitting, onChange, onSubmit, onClose, title }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Client Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={onChange}
                  className={`input-field w-full ${errors.name ? 'border-red-500' : ''}`}
                  required
                />
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Company Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={onChange}
                  className={`input-field w-full ${errors.companyName ? 'border-red-500' : ''}`}
                  required
                />
                {errors.companyName && <p className="text-red-400 text-xs mt-1">{errors.companyName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={onChange}
                  className={`input-field w-full ${errors.email ? 'border-red-500' : ''}`}
                  required
                />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Phone <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={onChange}
                  className={`input-field w-full ${errors.phone ? 'border-red-500' : ''}`}
                  required
                />
                {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Client Code</label>
                <input
                  type="text"
                  name="clientCode"
                  value={formData.clientCode}
                  onChange={onChange}
                  className="input-field w-full"
                  placeholder="Auto-generated if empty"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Status <span className="text-red-400">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={onChange}
                  className="input-field w-full"
                  required
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Billing Type</label>
                <select
                  name="billingType"
                  value={formData.billingType}
                  onChange={onChange}
                  className="input-field w-full"
                >
                  <option value="per-day">Per Day</option>
                  <option value="per-month">Per Month</option>
                  <option value="fte">FTE</option>
                  <option value="fixed">Fixed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Industry</label>
                <input
                  type="text"
                  name="industry"
                  value={formData.industry}
                  onChange={onChange}
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Website</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={onChange}
                  className="input-field w-full"
                  placeholder="https://"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-1">Street</label>
                <input
                  type="text"
                  name="address.street"
                  value={formData.address.street}
                  onChange={onChange}
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">City</label>
                <input
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={onChange}
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">State</label>
                <input
                  type="text"
                  name="address.state"
                  value={formData.address.state}
                  onChange={onChange}
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Zip Code</label>
                <input
                  type="text"
                  name="address.zipCode"
                  value={formData.address.zipCode}
                  onChange={onChange}
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Country</label>
                <input
                  type="text"
                  name="address.country"
                  value={formData.address.country}
                  onChange={onChange}
                  className="input-field w-full"
                />
              </div>
            </div>
          </div>

          {/* Contact Person */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Contact Person</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                <input
                  type="text"
                  name="contactPerson.name"
                  value={formData.contactPerson.name}
                  onChange={onChange}
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Designation</label>
                <input
                  type="text"
                  name="contactPerson.designation"
                  value={formData.contactPerson.designation}
                  onChange={onChange}
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  name="contactPerson.email"
                  value={formData.contactPerson.email}
                  onChange={onChange}
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
                <input
                  type="tel"
                  name="contactPerson.phone"
                  value={formData.contactPerson.phone}
                  onChange={onChange}
                  className="input-field w-full"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={onChange}
              className="input-field w-full"
              rows="4"
              placeholder="Additional notes about the client..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary px-6 py-2 flex items-center space-x-2"
              disabled={submitting}
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              <span>{submitting ? 'Saving...' : 'Save Client'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientList;
