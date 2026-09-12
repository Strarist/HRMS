import api from './axios';

/**
 * Get notifications for the current user
 * @param {Object} params - Query parameters
 * @param {boolean} params.isRead - Filter by read status
 * @param {string} params.type - Filter by notification type
 * @param {string} params.priority - Filter by priority level
 */
export const getNotifications = async (params = {}) => {
  const response = await api.get('/notifications', { params });
  return response.data;
};

/**
 * Mark a specific notification as read
 * @param {string} notificationId - ID of the notification to mark as read
 */
export const markNotificationAsRead = async (notificationId) => {
  const response = await api.put(`/notifications/${notificationId}/read`);
  return response.data;
};

/**
 * Mark all notifications as read for the current user
 */
export const markAllNotificationsAsRead = async () => {
  const response = await api.put('/notifications/mark-all-read');
  return response.data;
};

/**
 * Delete a specific notification
 * @param {string} notificationId - ID of the notification to delete
 */
export const deleteNotification = async (notificationId) => {
  const response = await api.delete(`/notifications/${notificationId}`);
  return response.data;
};

/**
 * Get notification count (unread only)
 */
export const getNotificationCount = async () => {
  const response = await api.get('/notifications', {
    params: { isRead: false, count: true }
  });
  return response.data;
};