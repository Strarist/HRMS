import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  Users, 
  Shield, 
  Settings, 
  Eye, 
  EyeOff, 
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Copy,
  Mail
} from 'lucide-react';
import tenantRolesAPI from '../../api/tenantRoles';

const Roles = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [roleConfigs, setRoleConfigs] = useState([]);
  const [rolesAndUsers, setRolesAndUsers] = useState({ roles: [], users: [], summary: {} });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Create role form state
  const [createForm, setCreateForm] = useState({
    roleType: '',
    userEmail: '',
    userName: '',
    clientId: '6914486fef016d63d6ac03ce' // Default teasnant ID
  });

  useEffect(() => {
    fetchRoleConfigs();
    fetchRolesAndUsers();
  }, []);

  const fetchRoleConfigs = async () => {
    try {
      setLoading(true);
      console.log('Fetching role configs...');
      const response = await tenantRolesAPI.getRoleConfigs();
      console.log('Role configs response:', response);
      
      if (response.data.success) {
        setRoleConfigs(response.data.data.availableRoles);
        console.log('Role configs loaded:', response.data.data.availableRoles);
      } else {
        setError('Failed to fetch role configurations: ' + (response.data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error fetching role configs:', error);
      setError('Failed to fetch role configurations: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchRolesAndUsers = async () => {
    try {
      // Pass clientId as query parameter
      const clientId = '6914486fef016d63d6ac03ce';
      const response = await tenantRolesAPI.getRolesAndUsers(clientId);
      if (response.data.success) {
        setRolesAndUsers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching roles and users:', error);
      setError('Failed to fetch roles and users');
    }
  };

  const handleCreateRole = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('🚀 Creating role with data:', createForm);
      const response = await tenantRolesAPI.createEmployeeRole(createForm);
      console.log('✅ Role creation response:', response);
      
      if (response.data.success) {
        setSuccess(`Role "${response.data.data.role.name}" created successfully! User credentials: ${response.data.data.user.email} / ${response.data.data.user.defaultPassword}`);
        setCreateForm({ roleType: '', userEmail: '', userName: '', clientId: '6914486fef016d63d6ac03ce' });
        fetchRolesAndUsers();
      } else {
        setError(response.data.message || 'Failed to create role');
      }
    } catch (error) {
      console.error('❌ Role creation error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create role';
      setError(`Error: ${errorMessage}`);
      
      // Additional debugging info
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUserStatusToggle = async (userId, currentStatus) => {
    try {
      const response = await tenantRolesAPI.updateUserStatus(userId, { 
        isActive: !currentStatus 
      });
      if (response.data.success) {
        setSuccess(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
        fetchRolesAndUsers();
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update user status');
    }
  };

  const handlePasswordReset = async (userId) => {
    try {
      const response = await tenantRolesAPI.resetUserPassword(userId);
      if (response.data.success) {
        setSuccess(`Password reset successfully. New password: ${response.data.data.defaultPassword}`);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to reset password');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSuccess('Copied to clipboard!');
  };

  const getRoleIcon = (roleSlug) => {
    const icons = {
      'regular_employee': Users,
      'team_lead': Shield,
      'consultant': Settings,
      'intern': UserPlus
    };
    return icons[roleSlug] || Users;
  };

  const getRoleColor = (roleSlug) => {
    const colors = {
      'regular_employee': 'bg-blue-500',
      'team_lead': 'bg-green-500',
      'consultant': 'bg-purple-500',
      'intern': 'bg-orange-500'
    };
    return colors[roleSlug] || 'bg-gray-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Employee Role Management</h1>
        <p className="text-gray-400 mt-1">Create and manage employee-level roles within your tenant</p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <span className="text-red-400">{error}</span>
          <button 
            onClick={() => setError('')}
            className="ml-auto text-red-400 hover:text-red-300"
          >
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-400" />
          <span className="text-green-400">{success}</span>
          <button 
            onClick={() => setSuccess('')}
            className="ml-auto text-green-400 hover:text-green-300"
          >
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-800/50 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('create')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'create'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          <UserPlus className="h-4 w-4 inline mr-2" />
          Create Role
        </button>
        <button
          onClick={() => setActiveTab('manage')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'manage'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          <Users className="h-4 w-4 inline mr-2" />
          Manage Users
        </button>
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'overview'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          <Shield className="h-4 w-4 inline mr-2" />
          Overview
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'create' && (
        <div className="card">
          <h2 className="text-xl font-semibold text-white mb-6">Create Employee Role</h2>
          
          {/* Role Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {roleConfigs.length > 0 ? (
              roleConfigs.map((config) => {
                const IconComponent = getRoleIcon(config.type);
                const isSelected = createForm.roleType === config.type;
                
                return (
                  <div
                    key={config.type}
                    onClick={() => setCreateForm({ ...createForm, roleType: config.type })}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-600 hover:border-gray-500 bg-gray-800/50'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-lg ${getRoleColor(config.type)} flex items-center justify-center mb-3`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-white mb-1">{config.name}</h3>
                    <p className="text-sm text-gray-400 mb-2">{config.description}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Scope: {config.scope}</span>
                      <span className="text-gray-500">{config.permissionCount} permissions</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full">
                <div className="text-center py-4 mb-6">
                  <div className="text-gray-400 mb-4">
                    {loading ? 'Loading role configurations...' : 'Unable to load role configurations from API'}
                  </div>
                  <button
                    onClick={fetchRoleConfigs}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 mx-auto"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Retry Loading Roles
                  </button>
                </div>
                
                {/* Fallback Manual Role Selection */}
                <div className="border-t border-gray-700 pt-6">
                  <h3 className="text-lg font-medium text-white mb-4">Or Select Role Manually:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { type: 'regular_employee', name: 'Regular Employee', description: 'Basic employee with self-service permissions', scope: 'self' },
                      { type: 'team_lead', name: 'Team Lead', description: 'Team leader with team management permissions', scope: 'team' },
                      { type: 'consultant', name: 'Consultant', description: 'Consultant with timesheet and project focus', scope: 'self' },
                      { type: 'intern', name: 'Intern', description: 'Intern with limited permissions', scope: 'self' }
                    ].map((config) => {
                      const IconComponent = getRoleIcon(config.type);
                      const isSelected = createForm.roleType === config.type;
                      
                      return (
                        <div
                          key={config.type}
                          onClick={() => setCreateForm({ ...createForm, roleType: config.type })}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            isSelected
                              ? 'border-blue-500 bg-blue-500/10'
                              : 'border-gray-600 hover:border-gray-500 bg-gray-800/50'
                          }`}
                        >
                          <div className={`w-12 h-12 rounded-lg ${getRoleColor(config.type)} flex items-center justify-center mb-3`}>
                            <IconComponent className="h-6 w-6 text-white" />
                          </div>
                          <h3 className="font-semibold text-white mb-1">{config.name}</h3>
                          <p className="text-sm text-gray-400 mb-2">{config.description}</p>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">Scope: {config.scope}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Details Form */}
          {createForm.roleType && (
            <form onSubmit={handleCreateRole} className="space-y-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Target Tenant ID
                  </label>
                  <input
                    type="text"
                    value={createForm.clientId}
                    onChange={(e) => setCreateForm({ ...createForm, clientId: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter tenant/client ID"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    The MongoDB ObjectId of the tenant where this role will be created
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      User Name
                    </label>
                    <input
                      type="text"
                      value={createForm.userName}
                      onChange={(e) => setCreateForm({ ...createForm, userName: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter user full name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={createForm.userEmail}
                      onChange={(e) => setCreateForm({ ...createForm, userEmail: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="user@company.com"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <h4 className="font-medium text-yellow-400 mb-2">Default Credentials</h4>
                <p className="text-sm text-gray-300">
                  The user will be created with the default password: <code className="bg-gray-700 px-2 py-1 rounded">password123</code>
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  They will be required to change this password on first login.
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <UserPlus className="h-4 w-4" />
                  )}
                  {loading ? 'Creating...' : 'Create Role & User'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {activeTab === 'manage' && (
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">Manage Users</h2>
            <button
              onClick={fetchRolesAndUsers}
              className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-300">User</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-300">Role</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-300">Scope</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-300">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-300">First Login</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rolesAndUsers.users.map((user) => {
                  const IconComponent = getRoleIcon(user.roleSlug);
                  
                  return (
                    <tr key={user.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full ${getRoleColor(user.roleSlug)} flex items-center justify-center`}>
                            <IconComponent className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <div className="font-medium text-white">{user.name}</div>
                            <div className="text-sm text-gray-400 flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {user.email}
                              <button
                                onClick={() => copyToClipboard(user.email)}
                                className="ml-1 text-gray-500 hover:text-gray-300"
                              >
                                <Copy className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-white font-medium">{user.roleName}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-gray-300 capitalize">{user.scope}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.isActive
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-red-500/10 text-red-400'
                        }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.isFirstLogin
                            ? 'bg-yellow-500/10 text-yellow-400'
                            : 'bg-gray-500/10 text-gray-400'
                        }`}>
                          {user.isFirstLogin ? 'Pending' : 'Completed'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleUserStatusToggle(user.id, user.isActive)}
                            className={`p-2 rounded-md ${
                              user.isActive
                                ? 'text-red-400 hover:bg-red-500/10'
                                : 'text-green-400 hover:bg-green-500/10'
                            }`}
                            title={user.isActive ? 'Deactivate User' : 'Activate User'}
                          >
                            {user.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => handlePasswordReset(user.id)}
                            className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-md"
                            title="Reset Password"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {rolesAndUsers.users.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                No users found. Create your first employee role to get started.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Total Roles</p>
                  <p className="text-2xl font-bold text-white">{rolesAndUsers.summary.totalRoles || 0}</p>
                </div>
                <Shield className="h-8 w-8 text-blue-400" />
              </div>
            </div>
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Total Users</p>
                  <p className="text-2xl font-bold text-white">{rolesAndUsers.summary.totalUsers || 0}</p>
                </div>
                <Users className="h-8 w-8 text-green-400" />
              </div>
            </div>
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Active Users</p>
                  <p className="text-2xl font-bold text-white">{rolesAndUsers.summary.activeUsers || 0}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </div>
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">First Time Users</p>
                  <p className="text-2xl font-bold text-white">{rolesAndUsers.summary.firstTimeUsers || 0}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-yellow-400" />
              </div>
            </div>
          </div>

          {/* Roles Overview */}
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Roles Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {rolesAndUsers.roles.map((role) => {
                const IconComponent = getRoleIcon(role.slug);
                
                return (
                  <div key={role.id} className="bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-lg ${getRoleColor(role.slug)} flex items-center justify-center`}>
                        <IconComponent className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{role.name}</h4>
                        <p className="text-sm text-gray-400 capitalize">{role.scope} scope</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Users:</span>
                        <span className="text-white">{role.userCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Permissions:</span>
                        <span className="text-white">{role.permissionCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Type:</span>
                        <span className="text-white">{role.isSystemRole ? 'System' : 'Custom'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {rolesAndUsers.roles.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                No roles created yet. Start by creating your first employee role.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Roles;
