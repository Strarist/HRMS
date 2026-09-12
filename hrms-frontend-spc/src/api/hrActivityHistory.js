import api from './axios';

/**
 * Get HR Activity History
 */
export const getHRActivityHistory = async (params = {}) => {
  const response = await api.get('/hr-activity-history', { params });
  return response.data;
};

/**
 * Get HR Activity History for specific HR user
 */
export const getHRUserActivity = async (hrUserId, params = {}) => {
  const response = await api.get(`/hr-activity-history/hr/${hrUserId}`, { params });
  return response.data;
};

/**
 * Get HR Activity Statistics
 */
export const getHRActivityStats = async (params = {}) => {
  const response = await api.get('/hr-activity-history/stats', { params });
  return response.data;
};

/**
 * Test endpoint to create a test log
 */
export const createTestHRActivityLog = async () => {
  const response = await api.post('/hr-activity-history/test-log');
  return response.data;
};
