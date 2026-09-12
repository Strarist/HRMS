import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification
} from '../api/notifications';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const response = await getNotifications();
      const list = response.data || [];
      setNotifications(list);
      setUnreadCount(
        typeof response.unreadCount === 'number'
          ? response.unreadCount
          : list.filter((n) => !n.isRead).length
      );
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const markAsRead = useCallback(async (notificationId) => {
    try {
      setError(null);
      await markNotificationAsRead(notificationId);
      setNotifications((prev) => {
        const next = prev.map((notif) =>
          notif._id === notificationId
            ? { ...notif, isRead: true, readAt: new Date() }
            : notif
        );
        setUnreadCount(next.filter((n) => !n.isRead).length);
        return next;
      });
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setError('Failed to mark notification as read');
      throw err;
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      setError(null);
      await markAllNotificationsAsRead();
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true, readAt: new Date() }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      setError('Failed to mark all notifications as read');
      throw err;
    }
  }, []);

  const removeNotification = useCallback(async (notificationId) => {
    try {
      setError(null);
      await deleteNotification(notificationId);
      setNotifications((prev) => {
        const next = prev.filter((notif) => notif._id !== notificationId);
        setUnreadCount(next.filter((n) => !n.isRead).length);
        return next;
      });
    } catch (err) {
      console.error('Error deleting notification:', err);
      setError('Failed to delete notification');
      throw err;
    }
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
    setError(null);
  }, []);

  const refreshNotifications = useCallback(async () => {
    await fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    } else {
      clearAllNotifications();
    }
  }, [user, fetchNotifications, clearAllNotifications]);

  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [user, fetchNotifications]);

  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    refreshNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
