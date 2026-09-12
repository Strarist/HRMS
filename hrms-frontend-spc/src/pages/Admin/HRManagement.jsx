import React, { useEffect, useState } from 'react';
import {
  Users, Plus, Search, Filter, Edit, Trash2, UserPlus, Shield,
  Mail, Phone, Calendar, MoreHorizontal, Eye, CheckCircle, XCircle
} from 'lucide-react';
import api from '../../api/axios';
import toast from '../../utils/toast';

const HRManagement = () => {
  const [hrUsers, setHrUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchHRUsers();
  }, []);

  const fetchHRUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/user/all');

      // Check if response has data
      if (response.data && response.data.data) {
        // Filter to show only HR, admin, and manager users for management
        const hrAndAdminUsers = response.data.data.filter(user =>
          user.role === 'hr' || user.role === 'admin' || user.role === 'company_admin' || user.role === 'manager'
        );
        setHrUsers(hrAndAdminUsers);
      } else {
        console.warn('No data in response:', response.data);
        setHrUsers([]);
      }
    } catch (error) {
      console.error('Error fetching HR users:', error);
      console.error('Error details:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to load HR users');
      setHrUsers([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = hrUsers.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || user.isActive === (filterStatus === 'active');
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await api.put(`/user/${userId}/status`, { isActive: newStatus });
      toast.success(`User ${newStatus ? 'activated' : 'deactivated'} successfully`);
      fetchHRUsers(); // Refresh the list
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error(error.response?.data?.message || 'Failed to update user status');
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to remove ${user.firstName} ${user.lastName} (${user.email})? This action cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/user/${user._id}`);
      toast.success('User removed successfully');
      fetchHRUsers(); // Refresh the list
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error.response?.data?.message || 'Failed to remove user');
    }
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      'hr': { label: 'HR', bgColor: 'bg-blue-500/10', textColor: 'text-blue-400', borderColor: 'border-blue-500/30', icon: Users },
      'manager': { label: 'Manager', bgColor: 'bg-green-500/10', textColor: 'text-green-400', borderColor: 'border-green-500/30', icon: Shield },
      'admin': { label: 'Admin', bgColor: 'bg-purple-500/10', textColor: 'text-purple-400', borderColor: 'border-purple-500/30', icon: Shield },
      'company_admin': { label: 'Company Admin', bgColor: 'bg-orange-500/10', textColor: 'text-orange-400', borderColor: 'border-orange-500/30', icon: Shield }
    };

    const config = roleConfig[role] || roleConfig['hr'];
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${config.bgColor} ${config.textColor} border ${config.borderColor}`}>
        <IconComponent size={12} />
        {config.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#1E1E2A] p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Users className="w-8 h-8 text-[#A88BFF]" />
            HR Management
          </h1>
          <p className="text-gray-400 mt-1">Manage HR users, managers, and administrators</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#A88BFF] text-white text-sm font-medium hover:bg-[#B89CFF] transition-colors shadow-lg shadow-[#A88BFF]/20"
        >
          <Plus size={18} />
          <span>Add HR User</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 p-6 rounded-xl border border-blue-500/20 hover:border-blue-500/40 transition-all hover:shadow-lg hover:shadow-blue-500/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400 mb-2">Total HR Users</p>
              <p className="text-3xl font-bold text-white">{hrUsers.length}</p>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <Users className="h-8 w-8 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 p-6 rounded-xl border border-green-500/20 hover:border-green-500/40 transition-all hover:shadow-lg hover:shadow-green-500/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400 mb-2">Active Users</p>
              <p className="text-3xl font-bold text-white">
                {hrUsers.filter(user => user.isActive).length}
              </p>
            </div>
            <div className="p-3 bg-green-500/20 rounded-xl">
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 p-6 rounded-xl border border-purple-500/20 hover:border-purple-500/40 transition-all hover:shadow-lg hover:shadow-purple-500/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400 mb-2">Administrators</p>
              <p className="text-3xl font-bold text-white">
                {hrUsers.filter(user => user.role === 'admin' || user.role === 'company_admin').length}
              </p>
            </div>
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <Shield className="h-8 w-8 text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-[#2A2A3A] rounded-xl border border-gray-800 p-4">
        <div className="flex flex-col md:flex-row gap-4 md:items-center">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#1E1E2A] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#A88BFF] focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 bg-[#1E1E2A] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#A88BFF] focus:border-transparent transition-all cursor-pointer"
            >
              <option value="all" className="bg-[#1E1E2A]">All Users</option>
              <option value="active" className="bg-[#1E1E2A]">Active Only</option>
              <option value="inactive" className="bg-[#1E1E2A]">Inactive Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#2A2A3A] rounded-xl border border-gray-800 overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 border-4 border-[#A88BFF] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading HR users...</p>
          </div>
        ) : filteredUsers.length === 0 && hrUsers.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No HR users found</h3>
            <p className="text-sm text-gray-400 mb-6">
              Get started by adding your first HR user.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#A88BFF] text-white text-sm font-medium hover:bg-[#B89CFF] transition-colors"
            >
              <Plus size={16} />
              <span>Add HR User</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#232334] border-b border-gray-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-[#1E1E2A]/60 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#A88BFF] to-[#7DB539] flex items-center justify-center shadow-lg">
                            <span className="text-sm font-bold text-white">
                              {user.firstName?.[0]}{user.lastName?.[0]}
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full ${
                        user.isActive
                          ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                          : 'bg-red-500/10 text-red-400 border border-red-500/30'
                      }`}>
                        {user.isActive ? (
                          <CheckCircle size={12} className="text-green-400" />
                        ) : (
                          <XCircle size={12} className="text-red-400" />
                        )}
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-300">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        }) : 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDetailsModal(true);
                          }}
                          className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 border border-blue-500/30 transition-all"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleStatusChange(user._id, !user.isActive)}
                          className={`p-2 rounded-lg border transition-all ${
                            user.isActive
                              ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 border-red-500/30'
                              : 'bg-green-500/10 text-green-400 hover:bg-green-500/20 hover:text-green-300 border-green-500/30'
                          }`}
                          title={user.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {user.isActive ? <XCircle size={16} /> : <CheckCircle size={16} />}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 border border-red-500/30 transition-all"
                          title="Remove User"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUsers.length === 0 && hrUsers.length > 0 && (
              <div className="p-12 text-center">
                <div className="mx-auto w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 text-gray-500" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No users found</h3>
                <p className="text-sm text-gray-400">
                  Try adjusting your search or filters.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {showDetailsModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#2A2A3A] rounded-2xl border border-gray-800 p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">User Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
              >
                <XCircle size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4 pb-4 border-b border-gray-800">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#A88BFF] to-[#7DB539] flex items-center justify-center shadow-lg">
                  <span className="text-xl font-bold text-white">
                    {selectedUser.firstName?.[0]}{selectedUser.lastName?.[0]}
                  </span>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white mb-1">{selectedUser.firstName} {selectedUser.lastName}</h4>
                  {getRoleBadge(selectedUser.role)}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-[#1E1E2A] rounded-lg border border-gray-800">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Mail size={18} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Email</p>
                    <p className="text-sm font-medium text-white">{selectedUser.email}</p>
                  </div>
                </div>
                {selectedUser.phone && (
                  <div className="flex items-center gap-3 p-3 bg-[#1E1E2A] rounded-lg border border-gray-800">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <Phone size={18} className="text-green-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Phone</p>
                      <p className="text-sm font-medium text-white">{selectedUser.phone}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 p-3 bg-[#1E1E2A] rounded-lg border border-gray-800">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Calendar size={18} className="text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Joined Date</p>
                    <p className="text-sm font-medium text-white">
                      {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      }) : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-[#1E1E2A] rounded-lg border border-gray-800">
                  <div className={`p-2 rounded-lg ${
                    selectedUser.isActive ? 'bg-green-500/10' : 'bg-red-500/10'
                  }`}>
                    {selectedUser.isActive ? (
                      <CheckCircle size={18} className="text-green-400" />
                    ) : (
                      <XCircle size={18} className="text-red-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Status</p>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${
                      selectedUser.isActive
                        ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                        : 'bg-red-500/10 text-red-400 border border-red-500/30'
                    }`}>
                      {selectedUser.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-800">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-6 py-2.5 text-gray-300 border border-gray-700 rounded-lg hover:bg-gray-700 hover:text-white hover:border-gray-600 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <CreateUserModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onUserCreated={fetchHRUsers}
        />
      )}
    </div>
  );
};

// Create User Modal Component
const CreateUserModal = ({ isOpen, onClose, onUserCreated }) => {
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'hr',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/user/create', formData);

      if (response.data.success) {
        // Show appropriate message based on email status
        if (response.data.emailSent) {
          toast.success('HR user created successfully! Welcome email with credentials sent.');
        } else if (response.data.emailError) {
          toast.success('HR user created successfully!', {
            duration: 3000
          });
          toast.error(`Email could not be sent: ${response.data.emailError}. Temporary password: ${response.data.tempPassword}`, {
            duration: 8000
          });
        } else {
          toast.success('HR user created successfully!');
        }
        
        setFormData({
          email: '',
          firstName: '',
          lastName: '',
          role: 'hr',
          phone: ''
        });
        onUserCreated(); // Refresh the user list
        onClose();
      }
    } catch (error) {
      console.error('Error creating user:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create user';
      toast.error(errorMessage);

      if (error.response?.data?.message?.includes('already exists')) {
        setErrors({ email: 'A user with this email already exists' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#2A2A3A] rounded-2xl border border-gray-800 p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-white">Add New HR User</h3>
            <p className="text-sm text-gray-400 mt-1">Create a new HR user account</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
          >
            <XCircle size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email Address <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full px-4 py-2.5 bg-[#1E1E2A] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#A88BFF] focus:border-transparent transition-all ${
                errors.email ? 'border-red-500' : 'border-gray-700'
              }`}
              placeholder="hr@example.com"
            />
            {errors.email && (
              <p className="text-red-400 text-xs mt-1.5">{errors.email}</p>
            )}
          </div>

          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              First Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              className={`w-full px-4 py-2.5 bg-[#1E1E2A] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#A88BFF] focus:border-transparent transition-all ${
                errors.firstName ? 'border-red-500' : 'border-gray-700'
              }`}
              placeholder="John"
            />
            {errors.firstName && (
              <p className="text-red-400 text-xs mt-1.5">{errors.firstName}</p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Last Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              className={`w-full px-4 py-2.5 bg-[#1E1E2A] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#A88BFF] focus:border-transparent transition-all ${
                errors.lastName ? 'border-red-500' : 'border-gray-700'
              }`}
              placeholder="Doe"
            />
            {errors.lastName && (
              <p className="text-red-400 text-xs mt-1.5">{errors.lastName}</p>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Role <span className="text-red-400">*</span>
            </label>
            <select
              value={formData.role}
              onChange={(e) => handleInputChange('role', e.target.value)}
              className={`w-full px-4 py-2.5 bg-[#1E1E2A] border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#A88BFF] focus:border-transparent transition-all cursor-pointer ${
                errors.role ? 'border-red-500' : 'border-gray-700'
              }`}
            >
              <option value="hr" className="bg-[#1E1E2A]">HR</option>
              <option value="manager" className="bg-[#1E1E2A]">Manager</option>
              <option value="admin" className="bg-[#1E1E2A]">Admin</option>
              <option value="employee" className="bg-[#1E1E2A]">Employee</option>
            </select>
            {errors.role && (
              <p className="text-red-400 text-xs mt-1.5">{errors.role}</p>
            )}
            <p className="text-xs text-gray-500 mt-1.5">
              Note: Only Company Admins can create Admin-level users
            </p>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Phone Number <span className="text-gray-500">(Optional)</span>
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full px-4 py-2.5 bg-[#1E1E2A] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#A88BFF] focus:border-transparent transition-all"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          {/* Info Box */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-blue-500/20 rounded-lg">
                <Mail className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-300 mb-1">Email Notification</p>
                <p className="text-xs text-blue-400/80">
                  A welcome email with login credentials will be sent to the new user automatically.
                </p>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-gray-300 border border-gray-700 rounded-lg hover:bg-gray-700 hover:text-white hover:border-gray-600 transition-all"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-[#A88BFF] text-white rounded-lg hover:bg-[#B89CFF] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-lg shadow-[#A88BFF]/20"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  <span>Create User</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HRManagement;