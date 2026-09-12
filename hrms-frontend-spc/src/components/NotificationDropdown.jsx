import React from 'react';
import { Check, CheckCheck, X, Clock, AlertTriangle, Info, FileText } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

const NotificationDropdown = ({ isOpen, onClose }) => {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    removeNotification
  } = useNotifications();

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-red-500';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'document-expiry':
      case 'contract-expiry':
        return <AlertTriangle size={16} className="text-red-500" />;
      case 'leave-request':
        return <Clock size={16} className="text-blue-500" />;
      case 'feedback-request':
        return <Info size={16} className="text-purple-500" />;
      default:
        return <FileText size={16} className="text-gray-500" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const handleMarkAsRead = async (notificationId, e) => {
    e.stopPropagation();
    try {
      await markAsRead(notificationId);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleDelete = async (notificationId, e) => {
    e.stopPropagation();
    try {
      await removeNotification(notificationId);
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-10"
        onClick={onClose}
      />

      {/* Dropdown */}
      <div className="absolute right-0 mt-2 w-96 theme-surface theme-border rounded-lg shadow-lg z-20 max-h-96 overflow-hidden"
        style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderWidth: '1px', borderStyle: 'solid' }}>

        {/* Header */}
        <div className="px-4 py-3 border-b theme-border"
          style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium theme-text" style={{ color: 'var(--color-text)' }}>
              Notifications {unreadCount > 0 && `(${unreadCount})`}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center space-x-1"
              >
                <CheckCheck size={14} />
                <span>Mark all read</span>
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="max-h-80 overflow-y-auto">
          {error && (
            <div className="px-4 py-2 text-xs text-red-600 bg-red-50 dark:bg-red-900/20 border-b"
              style={{ borderColor: 'var(--color-border)' }}>
              {error}
            </div>
          )}
          {loading ? (
            <div className="px-4 py-8 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm theme-text-secondary mt-2" style={{ color: 'var(--color-textSecondary)' }}>
                Loading notifications...
              </p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <Info size={24} className="mx-auto theme-text-secondary mb-2" style={{ color: 'var(--color-textSecondary)' }} />
              <p className="text-sm theme-text-secondary" style={{ color: 'var(--color-textSecondary)' }}>
                No notifications yet
              </p>
            </div>
          ) : (
            <div className="divide-y theme-border" style={{ borderColor: 'var(--color-border)' }}>
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`px-4 py-3 hover transition-colors ${
                    !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                  style={{
                    backgroundColor: notification.isRead
                      ? 'var(--color-surface)'
                      : 'var(--color-surfaceHover)'
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="flex-shrink-0 mt-1">
                        {getTypeIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="text-sm font-medium theme-text truncate"
                            style={{ color: 'var(--color-text)' }}>
                            {notification.title}
                          </p>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                          )}
                        </div>
                        <p className="text-sm theme-text-secondary mb-2"
                          style={{ color: 'var(--color-textSecondary)' }}>
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs ${getPriorityColor(notification.priority)} capitalize`}>
                              {notification.priority}
                            </span>
                            <span className="text-xs theme-text-secondary"
                              style={{ color: 'var(--color-textSecondary)' }}>
                              {formatDate(notification.createdAt)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            {!notification.isRead && (
                              <button
                                onClick={(e) => handleMarkAsRead(notification._id, e)}
                                className="p-1 text-blue-600 hover:text-blue-800 rounded"
                                title="Mark as read"
                              >
                                <Check size={14} />
                              </button>
                            )}
                            <button
                              onClick={(e) => handleDelete(notification._id, e)}
                              className="p-1 text-red-600 hover:text-red-800 rounded"
                              title="Delete notification"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="px-4 py-2 border-t theme-border text-center"
            style={{ borderColor: 'var(--color-border)' }}>
            <button
              onClick={onClose}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationDropdown;