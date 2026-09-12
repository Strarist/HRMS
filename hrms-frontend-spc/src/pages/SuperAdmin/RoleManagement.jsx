import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { 
  getRoleDefinitions, 
  getSuperAdminUsers, 
  getRoleStats,
  createSuperAdminUser,
  updateUserRole,
  deactivateUser 
} from '../../api/superAdmin';
import toast from '../../utils/toast';
import {
  Users,
  Shield,
  UserPlus,
  Edit3,
  UserX,
  Eye,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Crown,
  Briefcase,
  DollarSign,
  FileText,
  Server,
  BarChart3
} from 'lucide-react';

const RoleManagement = () => {
  const { theme } = useTheme();
  const [users, setUsers] = useState([]);
  const [roleDefinitions, setRoleDefinitions] = useState({});
  const [permissions, setPermissions] = useState({});
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    page: 1
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [usersRes, rolesRes, statsRes] = await Promise.all([
        getSuperAdminUsers(filters),
        getRoleDefinitions(),
        getRoleStats()
      ]);

      // Handle nested response structure permanently
      const usersData = usersRes.data?.data || usersRes.data;
      const rolesData = rolesRes.data?.data || rolesRes.data;
      const statsData = statsRes.data?.data || statsRes.data;

      setUsers(usersData?.users || []);
      setRoleDefinitions(rolesData?.roles || {});
      setPermissions(rolesData?.permissions || {});
      setStats(statsData || null);
      
      console.log('✅ Role management data loaded successfully');
      console.log('📊 Users:', usersData?.users?.length || 0);
      console.log('🎭 Roles:', Object.keys(rolesData?.roles || {}).length);
      
    } catch (error) {
      console.error('❌ Error fetching role management data:', error);
      toast.error('Failed to fetch role management data');
      // Set safe defaults on error
      setUsers([]);
      setRoleDefinitions({});
      setPermissions({});
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (userData) => {
    try {
      await createSuperAdminUser(userData);
      toast.success('Super Admin user created successfully');
      setShowCreateModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create user');
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      await updateUserRole(userId, { internalRole: newRole });
      toast.success('User role updated successfully');
      setShowEditModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user role');
    }
  };

  const handleDeactivateUser = async (userId) => {
    if (window.confirm('Are you sure you want to deactivate this user?')) {
      try {
        await deactivateUser(userId);
        toast.success('User deactivated successfully');
        fetchData();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to deactivate user');
      }
    }
  };

  const getRoleIcon = (role) => {
    const iconMap = {
      super_admin: Crown,
      system_manager: Settings,
      finance_admin: DollarSign,
      compliance_officer: FileText,
      tech_admin: Server,
      viewer: Eye
    };
    return iconMap[role] || Users;
  };

  const getRoleColor = (role) => {
    const colorMap = {
      super_admin: 'text-purple-600 bg-purple-100 dark:bg-purple-900/20',
      system_manager: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20',
      finance_admin: 'text-green-600 bg-green-100 dark:bg-green-900/20',
      compliance_officer: 'text-orange-600 bg-orange-100 dark:bg-orange-900/20',
      tech_admin: 'text-red-600 bg-red-100 dark:bg-red-900/20',
      viewer: 'text-gray-600 bg-gray-100 dark:bg-gray-900/20'
    };
    return colorMap[role] || 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
  };

  const CreateUserModal = () => {
    const [formData, setFormData] = useState({
      email: '',
      password: '',
      internalRole: 'viewer'
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      handleCreateUser(formData);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className={`p-6 rounded-xl max-w-md w-full mx-4 ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Create Super Admin User
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className={`w-full p-2 border rounded-lg ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className={`w-full p-2 border rounded-lg ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                required
                minLength={6}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Role
              </label>
              <select
                value={formData.internalRole}
                onChange={(e) => setFormData({...formData, internalRole: e.target.value})}
                className={`w-full p-2 border rounded-lg ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                {roleDefinitions && Object.entries(roleDefinitions).map(([key, role]) => (
                  <option key={key} value={key}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create User
              </button>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${
                  theme === 'dark'
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const EditRoleModal = () => {
    const [newRole, setNewRole] = useState(selectedUser?.internalRole || '');

    const handleSubmit = (e) => {
      e.preventDefault();
      handleUpdateRole(selectedUser._id, newRole);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className={`p-6 rounded-xl max-w-md w-full mx-4 ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Update User Role
          </h3>
          
          <div className="mb-4">
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              User: <span className="font-medium">{selectedUser?.email}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                New Role
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className={`w-full p-2 border rounded-lg ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                {roleDefinitions && Object.entries(roleDefinitions).map(([key, role]) => (
                  <option key={key} value={key}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Update Role
              </button>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${
                  theme === 'dark'
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (loading || !roleDefinitions) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            User Management
          </h1>
          <p className={`mt-2 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Manage all system users, roles, and permissions
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add User</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats?.roleStats?.map((stat) => {
          const IconComponent = getRoleIcon(stat._id);
          return (
            <div key={stat._id} className={`p-6 rounded-xl border ${
              theme === 'dark' 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {roleDefinitions[stat._id]?.name || stat._id}
                  </p>
                  <p className={`text-2xl font-bold mt-1 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {stat.count}
                  </p>
                  <p className={`text-xs mt-1 ${
                    theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                  }`}>
                    {stat.active} active
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${getRoleColor(stat._id)}`}>
                  <IconComponent className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search users..."
            value={filters.search}
            onChange={(e) => setFilters({...filters, search: e.target.value, page: 1})}
            className={`w-full p-3 border rounded-lg ${
              theme === 'dark' 
                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
          />
        </div>
        <select
          value={filters.role}
          onChange={(e) => setFilters({...filters, role: e.target.value, page: 1})}
          className={`p-3 border rounded-lg ${
            theme === 'dark' 
              ? 'bg-gray-800 border-gray-600 text-white' 
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        >
          <option value="">All Users</option>
          <optgroup label="System Roles">
            <option value="superadmin">Super Admin</option>
            <option value="admin">Admin</option>
            <option value="hr">HR</option>
            <option value="employee">Employee</option>
          </optgroup>
          <optgroup label="Super Admin Internal Roles">
            {roleDefinitions && Object.entries(roleDefinitions).map(([key, role]) => (
              <option key={key} value={key}>
                {role.name}
              </option>
            ))}
          </optgroup>
        </select>
      </div>

      {/* Users List */}
      <div className={`rounded-xl border ${
        theme === 'dark' 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <th className={`text-left p-4 font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>User</th>
                <th className={`text-left p-4 font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>Role</th>
                <th className={`text-left p-4 font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>Status</th>
                <th className={`text-left p-4 font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>Last Login</th>
                <th className={`text-left p-4 font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                // Use displayRole or fallback to role for icon/color
                const roleForDisplay = user.internalRole || user.role;
                const IconComponent = getRoleIcon(roleForDisplay);
                return (
                  <tr key={user._id} className={`border-b ${
                    theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          getRoleColor(roleForDisplay)
                        }`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div>
                          <p className={`font-medium ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          getRoleColor(roleForDisplay)
                        }`}>
                          {user.displayRole || user.roleDefinition?.name || user.role}
                        </span>
                        {user.clientId && (
                          <span className="text-xs text-gray-500 mt-1">
                            {user.clientId.companyName}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-1">
                        {user.isActive ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        <span className={`text-sm ${
                          user.isActive 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {user.lastLogin 
                          ? new Date(user.lastLogin).toLocaleDateString()
                          : 'Never'
                        }
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowEditModal(true);
                          }}
                          className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}
                          title="Edit Role"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        {user.isActive && (
                          <button
                            onClick={() => handleDeactivateUser(user._id)}
                            className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            }`}
                            title="Deactivate User"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && <CreateUserModal />}
      {showEditModal && <EditRoleModal />}
    </div>
  );
};

export default RoleManagement;
