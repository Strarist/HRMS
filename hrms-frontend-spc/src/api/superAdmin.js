import api from './axios';

// Dashboard APIs
export const getDashboardStats = () => {
  return api.get('/super-admin/dashboard/stats');
};

export const getSystemHealth = () => {
  return api.get('/super-admin/dashboard/health');
};

// Client Management APIs
export const getClients = (params = {}) => {
  return api.get('/super-admin/clients', { params });
};

export const getClient = (id) => {
  return api.get(`/super-admin/clients/${id}`);
};

export const createClient = (data) => {
  return api.post('/super-admin/clients', data);
};

export const updateClient = (id, data) => {
  return api.put(`/super-admin/clients/${id}`, data);
};

export const updateClientStatus = (id, status) => {
  return api.patch(`/super-admin/clients/${id}/status`, { status });
};

export const updateClientSubscription = (id, data) => {
  return api.patch(`/super-admin/clients/${id}/subscription`, data);
};

export const deleteClient = (id) => {
  return api.delete(`/super-admin/clients/${id}`);
};

// Package Management APIs
export const getPackages = (params = {}) => {
  return api.get('/super-admin/packages', { params });
};

export const getPackage = (id) => {
  return api.get(`/super-admin/packages/${id}`);
};

export const createPackage = (data) => {
  return api.post('/super-admin/packages', data);
};

export const updatePackage = (id, data) => {
  return api.put(`/super-admin/packages/${id}`, data);
};

export const togglePackageStatus = (id) => {
  return api.patch(`/super-admin/packages/${id}/toggle-status`);
};

export const deletePackage = (id) => {
  return api.delete(`/super-admin/packages/${id}`);
};

// Role Management APIs
export const getRoleDefinitions = () => {
  return api.get('/super-admin/roles/definitions');
};

export const getSuperAdminUsers = (params = {}) => {
  return api.get('/super-admin/roles/users', { params });
};

export const getRoleStats = () => {
  return api.get('/super-admin/roles/stats');
};

export const getMyPermissions = () => {
  return api.get('/super-admin/roles/my-permissions');
};

export const createSuperAdminUser = (data) => {
  return api.post('/super-admin/roles/users', data);
};

export const updateUserRole = (userId, data) => {
  return api.put(`/super-admin/roles/users/${userId}`, data);
};

export const deactivateUser = (userId) => {
  return api.patch(`/super-admin/roles/users/${userId}/deactivate`);
};

// Audit Log APIs
export const getAuditLogs = (params = {}) => {
  return api.get('/super-admin/audit/logs', { params });
};

export const getAuditStats = (params = {}) => {
  return api.get('/super-admin/audit/stats', { params });
};

export const getSecurityEvents = (params = {}) => {
  return api.get('/super-admin/audit/security-events', { params });
};

export const getComplianceLogs = (params = {}) => {
  return api.get('/super-admin/audit/compliance', { params });
};

export const exportAuditLogs = (params = {}) => {
  return api.get('/super-admin/audit/export', { 
    params,
    responseType: 'blob' // For file download
  });
};

// Enhanced Package Management APIs
export const getPackageAnalytics = () => {
  return api.get('/super-admin/packages/analytics');
};

// Module Management APIs
export const getModules = (params = {}) => {
  return api.get('/super-admin/modules', { params });
};

// Client Package Assignment APIs
export const assignPackageToClient = (data) => {
  return api.post('/super-admin/packages/assign', data);
};

export const getClientPackages = (clientId, params = {}) => {
  return api.get(`/super-admin/clients/${clientId}/packages`, { params });
};

export const updateClientPackage = (clientPackageId, data) => {
  return api.put(`/super-admin/client-packages/${clientPackageId}`, data);
};

export const cancelClientPackage = (clientPackageId, data) => {
  return api.patch(`/super-admin/client-packages/${clientPackageId}/cancel`, data);
};

// Module Customization APIs
export const customizeClientModules = (clientId, data) => {
  return api.post(`/super-admin/clients/${clientId}/modules/customize`, data);
};

export const getClientModuleOverrides = (clientId) => {
  return api.get(`/super-admin/clients/${clientId}/modules/overrides`);
};
