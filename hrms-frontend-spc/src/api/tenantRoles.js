import api from './axios';

const tenantRolesAPI = {
  // Get available employee role configurations
  getRoleConfigs: () => api.get('/tenant/roles/configs'),

  // Create new employee role and user
  createEmployeeRole: (data) => api.post('/tenant/roles', data),

  // Get all roles and users for current tenant
  getRolesAndUsers: (clientId) => api.get('/tenant/roles', { params: { clientId } }),

  // Update user status
  updateUserStatus: (userId, data) => api.put(`/tenant/roles/users/${userId}/status`, { 
    ...data, 
    clientId: '6914486fef016d63d6ac03ce' 
  }),

  // Reset user password
  resetUserPassword: (userId) => api.put(`/tenant/roles/users/${userId}/reset-password`, { 
    clientId: '6914486fef016d63d6ac03ce' 
  }),

  // Tenant user authentication
  tenantLogin: (data) => api.post('/tenant/auth/login', { 
    ...data, 
    clientId: '6914486fef016d63d6ac03ce' 
  }),

  // Change password
  changePassword: (data) => api.put('/tenant/auth/change-password', data),

  // Get user profile
  getProfile: () => api.get('/tenant/auth/profile'),

  // Update user profile
  updateProfile: (data) => api.put('/tenant/auth/profile', data),

  // Get employee dashboard
  getEmployeeDashboard: () => api.get('/tenant/employee/dashboard'),

  // Get navigation menu
  getNavigationMenu: () => api.get('/tenant/employee/navigation')
};

export default tenantRolesAPI;
