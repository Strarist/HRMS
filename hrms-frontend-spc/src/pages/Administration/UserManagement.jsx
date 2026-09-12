import React, { useEffect, useState } from 'react';
import { Users, Key, Shield, Mail, Calendar, X } from 'lucide-react';
import api from '../../api/axios';
import toast from '../../utils/toast';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [resetForm, setResetForm] = useState({
    newPassword: '',
    confirmPassword: '',
    mustChangePassword: true
  });
  const [createForm, setCreateForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'employee',
    isActive: true
  });
  const [resetting, setResetting] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/user/all');
      setUsers(response.data.data);
    } catch (error) {
      toast.error('Failed to load users');
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (resetForm.newPassword !== resetForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (resetForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setResetting(true);
    try {
      // Use the correct user ID - either selectedUser._id or selectedUser.userId._id
      const userId = selectedUser._id || selectedUser.userId?._id;
      
      if (!userId) {
        toast.error('User ID not found');
        setResetting(false);
        return;
      }

      console.log('Resetting password for user ID:', userId);
      
      const response = await api.put(`/auth/admin/reset-password/${userId}`, {
        newPassword: resetForm.newPassword,
        mustChangePassword: resetForm.mustChangePassword
      });

      if (response.data.success) {
        toast.success('Password reset successfully');
        closeResetModal();
        fetchUsers(); // Refresh users list
      } else {
        toast.error(response.data.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setResetting(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    if (createForm.password !== createForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (createForm.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    if (!createForm.firstName || !createForm.lastName || !createForm.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    setCreating(true);
    try {
      const response = await api.post('/auth/register', {
        firstName: createForm.firstName,
        lastName: createForm.lastName,
        email: createForm.email,
        password: createForm.password,
        role: createForm.role,
        isActive: createForm.isActive
      });

      if (response.data.success) {
        toast.success('User created successfully');
        closeCreateModal();
        fetchUsers(); // Refresh users list
      } else {
        toast.error(response.data.message || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error(error.response?.data?.message || 'Failed to create user');
    } finally {
      setCreating(false);
    }
  };

  const openResetModal = (user) => {
    setSelectedUser(user);
    setShowResetModal(true);
  };

  const closeResetModal = () => {
    setShowResetModal(false);
    setSelectedUser(null);
    setResetForm({
      newPassword: '',
      confirmPassword: '',
      mustChangePassword: true
    });
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setCreateForm({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'employee',
      isActive: true
    });
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin: 'badge-danger',
      hr: 'badge-warning',
      manager: 'badge-info',
      employee: 'badge-success'
    };
    return badges[role] || 'badge-default';
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-gray-400 mt-1">Manage user accounts and reset passwords</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Users size={16} />
          <span>Create User</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="card p-0">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>
                    <div>
                      <p className="font-medium text-white">
                        {user.employeeId ? `${user.employeeId.firstName} ${user.employeeId.lastName}` : 'N/A'}
                      </p>
                      <p className="text-sm text-gray-400">{user.employeeId?.employeeCode || 'N/A'}</p>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center space-x-2">
                      <Mail size={16} className="text-gray-400" />
                      <span>{user.email}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${getRoleBadge(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    {user.isActive ? (
                      <span className="badge badge-success">Active</span>
                    ) : (
                      <span className="badge badge-danger">Inactive</span>
                    )}
                  </td>
                  <td>
                    {user.lastLogin ? (
                      <div className="flex items-center space-x-2">
                        <Calendar size={16} className="text-gray-400" />
                        <span className="text-sm">
                          {new Date(user.lastLogin).toLocaleDateString()}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-500">Never</span>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => openResetModal(user)}
                      className="btn-outline text-sm py-2 px-3 flex items-center space-x-2"
                    >
                      <Key size={16} />
                      <span>Reset Password</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {users.length === 0 && (
        <div className="text-center py-12">
          <Users size={48} className="mx-auto text-gray-600 mb-4" />
          <p className="text-gray-400">No users found</p>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 rounded-xl w-full max-w-md">
            <div className="border-b border-dark-800 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Reset Password</h2>
                <p className="text-sm text-gray-400 mt-1">
                  {selectedUser.firstName} {selectedUser.lastName} ({selectedUser.userId?.email})
                </p>
              </div>
              <button
                onClick={closeResetModal}
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  New Password *
                </label>
                <input
                  type="password"
                  required
                  value={resetForm.newPassword}
                  onChange={(e) => setResetForm({ ...resetForm, newPassword: e.target.value })}
                  className="input-field"
                  placeholder="Enter new password (min 8 characters)"
                  minLength={8}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  required
                  value={resetForm.confirmPassword}
                  onChange={(e) => setResetForm({ ...resetForm, confirmPassword: e.target.value })}
                  className="input-field"
                  placeholder="Confirm new password"
                  minLength={8}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="mustChangePassword"
                  checked={resetForm.mustChangePassword}
                  onChange={(e) => setResetForm({ ...resetForm, mustChangePassword: e.target.checked })}
                  className="w-4 h-4 text-primary-600 bg-dark-800 border-dark-700 rounded focus:ring-primary-500"
                />
                <label htmlFor="mustChangePassword" className="text-sm text-gray-300">
                  Require user to change password on next login
                </label>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Shield size={20} className="text-yellow-500 mt-0.5" />
                  <div className="text-sm text-yellow-200">
                    <p className="font-medium mb-1">Security Notice</p>
                    <p className="text-yellow-300/80">
                      The user will be able to login with this new password immediately. 
                      Make sure to communicate the new password securely.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeResetModal}
                  className="btn-outline"
                  disabled={resetting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={resetting}
                >
                  {resetting ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-900 rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="border-b border-dark-800 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Create New User</h2>
                <p className="text-sm text-gray-400 mt-1">Add a new user to the system</p>
              </div>
              <button
                onClick={closeCreateModal}
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={createForm.firstName}
                    onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })}
                    className="input-field"
                    placeholder="John"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={createForm.lastName}
                    onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })}
                    className="input-field"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  className="input-field"
                  placeholder="john.doe@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Role *
                </label>
                <select
                  value={createForm.role}
                  onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="employee">Employee</option>
                  <option value="hr">HR</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  className="input-field"
                  placeholder="Enter password (min 8 characters)"
                  minLength={8}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  required
                  value={createForm.confirmPassword}
                  onChange={(e) => setCreateForm({ ...createForm, confirmPassword: e.target.value })}
                  className="input-field"
                  placeholder="Confirm password"
                  minLength={8}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={createForm.isActive}
                  onChange={(e) => setCreateForm({ ...createForm, isActive: e.target.checked })}
                  className="w-4 h-4 text-primary-600 bg-dark-800 border-dark-700 rounded focus:ring-primary-500"
                />
                <label htmlFor="isActive" className="text-sm text-gray-300">
                  User is active
                </label>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Shield size={20} className="text-blue-500 mt-0.5" />
                  <div className="text-sm text-blue-200">
                    <p className="font-medium mb-1">Role Information</p>
                    <p className="text-blue-300/80 text-xs">
                      <strong>Manager:</strong> Can manage team members, approve leaves, assign projects<br/>
                      <strong>HR:</strong> Can manage employee records and HR functions<br/>
                      <strong>Admin:</strong> Full system access and configuration
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="btn-outline"
                  disabled={creating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={creating}
                >
                  {creating ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
