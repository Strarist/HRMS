import api from './axios';

/**
 * Employee Dashboard API Service
 * Handles all API calls for employee dashboard functionality
 * @module api/employeeDashboard
 */

// ==================== Dashboard ====================
export const getDashboardOverview = async () => {
  const response = await api.get('/employee/dashboard');
  return response.data;
};

// ==================== Profile ====================
export const getEmployeeProfile = async () => {
  const response = await api.get('/employee/profile');
  return response.data;
};

export const updateEmployeeProfile = async (data) => {
  const response = await api.put('/employee/profile', data);
  return response.data;
};

// ==================== Leave Management ====================
export const getLeaveSummary = async (year) => {
  const response = await api.get('/employee/leaves/summary', {
    params: { year }
  });
  return response.data;
};

export const getLeaveBalance = async (year) => {
  const response = await api.get('/employee/leaves/balance', {
    params: { year }
  });
  return response.data;
};

export const getLeaveApplications = async (filters = {}) => {
  const response = await api.get('/employee/leaves', {
    params: filters
  });
  return response.data;
};

export const getLeaveDetails = async (id) => {
  const response = await api.get(`/employee/leaves/${id}`);
  return response.data;
};

export const applyLeave = async (leaveData) => {
  const response = await api.post('/employee/leaves/apply', leaveData);
  return response.data;
};

export const cancelLeave = async (id) => {
  const response = await api.put(`/employee/leaves/${id}/cancel`);
  return response.data;
};

// ==================== Attendance ====================
export const getAttendanceSummary = async (month, year) => {
  const response = await api.get('/employee/attendance/summary', {
    params: { month, year }
  });
  return response.data;
};

export const getTodayAttendance = async () => {
  const response = await api.get('/employee/attendance/today');
  return response.data;
};

export const getAttendanceHistory = async (filters = {}) => {
  const response = await api.get('/employee/attendance/history', {
    params: filters
  });
  return response.data;
};

export const checkIn = async (data) => {
  const response = await api.post('/employee/attendance/check-in', data);
  return response.data;
};

export const checkOut = async (data) => {
  const response = await api.post('/employee/attendance/check-out', data);
  return response.data;
};

export const requestRegularization = async (data) => {
  const response = await api.post('/employee/attendance/regularize', data);
  return response.data;
};

// ==================== Payslips ====================
export const getPayslipHistory = async (limit = 12) => {
  const response = await api.get('/employee/payslips', {
    params: { limit }
  });
  return response.data;
};

// ==================== Projects ====================
export const getEmployeeProjects = async () => {
  const response = await api.get('/employee/projects');
  return response.data;
};

// ==================== Requests ====================
export const getEmployeeRequests = async (filters = {}) => {
  const response = await api.get('/employee/requests', {
    params: filters
  });
  return response.data;
};

export const getRequestDetails = async (id) => {
  const response = await api.get(`/employee/requests/${id}`);
  return response.data;
};

export const createRequest = async (requestData) => {
  const response = await api.post('/employee/requests', requestData);
  return response.data;
};

export const updateRequest = async (id, data) => {
  const response = await api.put(`/employee/requests/${id}`, data);
  return response.data;
};

export const closeRequest = async (id) => {
  const response = await api.put(`/employee/requests/${id}/close`);
  return response.data;
};

export const addRequestComment = async (id, message) => {
  const response = await api.post(`/employee/requests/${id}/comments`, { message });
  return response.data;
};

export default {
  getDashboardOverview,
  getEmployeeProfile,
  updateEmployeeProfile,
  getLeaveSummary,
  getLeaveBalance,
  getLeaveApplications,
  getLeaveDetails,
  applyLeave,
  cancelLeave,
  getAttendanceSummary,
  getTodayAttendance,
  getAttendanceHistory,
  checkIn,
  checkOut,
  requestRegularization,
  getPayslipHistory,
  getEmployeeProjects,
  getEmployeeRequests,
  getRequestDetails,
  createRequest,
  updateRequest,
  closeRequest,
  addRequestComment
};
