import api from './axios';

/**
 * HR API Service
 * Centralized API calls for HR panel features
 */

// ==================== HR Dashboard Stats ====================
export const getHRDashboardStats = async () => {
  const response = await api.get('/dashboard/hr/stats');
  return response.data;
};

// ==================== Employee Management ====================
// Reuse existing employee endpoints
export const getEmployees = async (params = {}) => {
  const response = await api.get('/employees', { params });
  return response.data;
};

export const getEmployee = async (id) => {
  const response = await api.get(`/employees/${id}`);
  return response.data;
};

export const updateEmployee = async (id, data) => {
  const response = await api.put(`/employees/${id}`, data);
  return response.data;
};

// ==================== Leave Management ====================
// Reuse existing leave endpoints
export const getLeaves = async (params = {}) => {
  const response = await api.get('/leave', { params });
  return response.data;
};

export const getPendingLeaves = async () => {
  const response = await api.get('/leave', { params: { status: 'pending' } });
  return response.data;
};

// ==================== Payroll ====================
// Reuse existing payroll endpoints
export const getPayrolls = async (params = {}) => {
  const response = await api.get('/payroll', { params });
  return response.data;
};

export const getPayrollThisMonth = async () => {
  const currentDate = new Date();
  const response = await api.get('/payroll', {
    params: {
      month: currentDate.getMonth() + 1,
      year: currentDate.getFullYear()
    }
  });
  return response.data;
};

// ==================== Job Postings ====================
export const getJobPostings = async (params = {}) => {
  const response = await api.get('/jobs', { params });
  return response.data;
};

export const getActiveJobPostings = async () => {
  const response = await api.get('/jobs', { params: { status: 'active' } });
  return response.data;
};

export default {
  getHRDashboardStats,
  getEmployees,
  getEmployee,
  getLeaves,
  getPendingLeaves,
  getPayrolls,
  getPayrollThisMonth,
  getJobPostings,
  getActiveJobPostings
};
