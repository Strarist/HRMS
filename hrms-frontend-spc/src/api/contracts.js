/**
 * Contract Management API Service
 */

import api from './axios';

// Get all contracts
export const getContracts = async (params = {}) => {
  try {
    const response = await api.get('/contracts', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching contracts:', error);
    throw error;
  }
};

// Get contract by ID
export const getContractById = async (id) => {
  try {
    const response = await api.get(`/contracts/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching contract:', error);
    throw error;
  }
};

// Create new contract
export const createContract = async (contractData) => {
  try {
    const response = await api.post('/contracts', contractData);
    return response.data;
  } catch (error) {
    console.error('Error creating contract:', error);
    throw error;
  }
};

// Update contract
export const updateContract = async (id, contractData) => {
  try {
    const response = await api.put(`/contracts/${id}`, contractData);
    return response.data;
  } catch (error) {
    console.error('Error updating contract:', error);
    throw error;
  }
};

// Approve contract
export const approveContract = async (id) => {
  try {
    const response = await api.post(`/contracts/${id}/approve`, {});
    return response.data;
  } catch (error) {
    console.error('Error approving contract:', error);
    throw error;
  }
};

// Reject contract
export const rejectContract = async (id, rejectionReason) => {
  try {
    const response = await api.post(`/contracts/${id}/reject`, { rejectionReason });
    return response.data;
  } catch (error) {
    console.error('Error rejecting contract:', error);
    throw error;
  }
};

// Renew contract
export const renewContract = async (id, newEndDate, notes) => {
  try {
    const response = await api.post(`/contracts/${id}/renew`, { newEndDate, notes });
    return response.data;
  } catch (error) {
    console.error('Error renewing contract:', error);
    throw error;
  }
};

// Terminate contract
export const terminateContract = async (id, terminationReason, terminationDate) => {
  try {
    const response = await api.post(`/contracts/${id}/terminate`, { terminationReason, terminationDate });
    return response.data;
  } catch (error) {
    console.error('Error terminating contract:', error);
    throw error;
  }
};

// Update deliverable status
export const updateDeliverable = async (id, deliverableIndex, status, completedDate) => {
  try {
    const response = await api.put(`/contracts/${id}/deliverables/${deliverableIndex}`, { status, completedDate });
    return response.data;
  } catch (error) {
    console.error('Error updating deliverable:', error);
    throw error;
  }
};

// Update hours worked
export const updateHours = async (id, hours) => {
  try {
    const response = await api.post(`/contracts/${id}/hours`, { hours });
    return response.data;
  } catch (error) {
    console.error('Error updating hours:', error);
    throw error;
  }
};

// Get contract statistics
export const getContractStats = async () => {
  try {
    const response = await api.get('/contracts/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching contract stats:', error);
    throw error;
  }
};

export default {
  getContracts,
  getContractById,
  createContract,
  updateContract,
  approveContract,
  rejectContract,
  renewContract,
  terminateContract,
  updateDeliverable,
  updateHours,
  getContractStats
};
