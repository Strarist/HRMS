import api from './axios';

// Subscription Management API
export const getSubscriptions = (params = {}) => {
  return api.get('/super-admin/subscriptions', { params });
};

export const getSubscription = (id) => {
  return api.get(`/super-admin/subscriptions/${id}`);
};

export const createSubscription = (data) => {
  return api.post('/super-admin/subscriptions', data);
};

export const updateSubscription = (id, data) => {
  return api.put(`/super-admin/subscriptions/${id}`, data);
};

export const renewSubscription = (id, data) => {
  return api.patch(`/super-admin/subscriptions/${id}/renew`, data);
};

export const cancelSubscription = (id, data) => {
  return api.patch(`/super-admin/subscriptions/${id}/cancel`, data);
};

export const suspendSubscription = (id, data) => {
  return api.patch(`/super-admin/subscriptions/${id}/suspend`, data);
};

export const reactivateSubscription = (id, data) => {
  return api.patch(`/super-admin/subscriptions/${id}/reactivate`, data);
};

export const getExpiringSubscriptions = (days = 10) => {
  return api.get('/super-admin/subscriptions/expiring', { params: { days } });
};

export const getExpiredSubscriptions = () => {
  return api.get('/super-admin/subscriptions/expired');
};

// Invoice Management API
export const getInvoices = (params = {}) => {
  return api.get('/super-admin/invoices', { params });
};

export const getInvoice = (id) => {
  return api.get(`/super-admin/invoices/${id}`);
};

export const generateInvoice = (data) => {
  return api.post('/super-admin/invoices/generate', data);
};

export const updateInvoice = (id, data) => {
  return api.put(`/super-admin/invoices/${id}`, data);
};

export const markInvoiceAsPaid = (id, data) => {
  return api.patch(`/super-admin/invoices/${id}/mark-paid`, data);
};

export const sendInvoiceReminder = (id, data) => {
  return api.patch(`/super-admin/invoices/${id}/send-reminder`, data);
};

export const getOverdueInvoices = () => {
  return api.get('/super-admin/invoices/overdue');
};

export const getInvoicesDueSoon = (days = 7) => {
  return api.get('/super-admin/invoices/due-soon', { params: { days } });
};

// Payment Management API
export const getPayments = (params = {}) => {
  return api.get('/super-admin/payments', { params });
};

export const getPayment = (id) => {
  return api.get(`/super-admin/payments/${id}`);
};

export const createPayment = (data) => {
  return api.post('/super-admin/payments', data);
};

export const updatePaymentStatus = (id, data) => {
  return api.patch(`/super-admin/payments/${id}/status`, data);
};

export const processRefund = (id, data) => {
  return api.patch(`/super-admin/payments/${id}/refund`, data);
};

export const verifyPayment = (id, data) => {
  return api.patch(`/super-admin/payments/${id}/verify`, data);
};

export const reconcilePayment = (id, data) => {
  return api.patch(`/super-admin/payments/${id}/reconcile`, data);
};

export const getPendingPayments = () => {
  return api.get('/super-admin/payments/pending');
};

export const getFailedPayments = () => {
  return api.get('/super-admin/payments/failed');
};

export const getPaymentStats = (params = {}) => {
  return api.get('/super-admin/payments/stats', { params });
};

// Revenue Analytics API
export const getRevenueDashboard = (period = 'month') => {
  return api.get('/super-admin/revenue/dashboard', { params: { period } });
};

export const getRevenueReport = (params = {}) => {
  return api.get('/super-admin/revenue/report', { params });
};

export const getSubscriptionAnalytics = () => {
  return api.get('/super-admin/revenue/subscription-analytics');
};

export const getRevenueStats = (params = {}) => {
  return api.get('/super-admin/billing/revenue-stats', { params });
};

// Billing Automation API
export const runDailyAutomation = () => {
  return api.post('/super-admin/billing/automation/run-daily');
};

export const getAutomationStatus = () => {
  return api.get('/super-admin/billing/automation/status');
};

export const getAutomationSettings = () => {
  return api.get('/super-admin/billing/automation/settings');
};

export const updateAutomationSettings = (data) => {
  return api.put('/super-admin/billing/automation/settings', data);
};

export const triggerRenewalAlert = (subscriptionId) => {
  return api.post(`/super-admin/billing/automation/trigger-renewal/${subscriptionId}`);
};

export const triggerAutoRenewal = (subscriptionId) => {
  return api.post(`/super-admin/billing/automation/trigger-auto-renewal/${subscriptionId}`);
};

export const testNotifications = (data) => {
  return api.post('/super-admin/billing/automation/test-notifications', data);
};

// Helper functions for formatting
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const calculateDaysRemaining = (endDate) => {
  const today = new Date();
  const end = new Date(endDate);
  const diffTime = end - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const calculateDaysOverdue = (dueDate) => {
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = today - due;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};
