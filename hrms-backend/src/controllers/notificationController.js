const { getTenantModel } = require('../utils/tenantModels');

const getUserId = (user) => {
  const id = user?._id || user?.id || user?.userId;
  return id != null ? id.toString() : null;
};

const ensureTenantNotificationModel = (req, res) => {
  if (!req.tenant?.connection || req.user?.role === 'superadmin') {
    res.status(403).json({
      success: false,
      message: 'Notifications are not available for this account',
    });
    return null;
  }
  return getTenantModel(req.tenant.connection, 'Notification');
};

exports.getNotifications = async (req, res) => {
  try {
    // Super admins (and any user without tenant context) get an empty inbox
    if (!req.tenant?.connection || req.user?.role === 'superadmin') {
      return res.status(200).json({
        success: true,
        count: 0,
        unreadCount: 0,
        data: [],
      });
    }

    const Notification = getTenantModel(req.tenant.connection, 'Notification');
    const userId = getUserId(req.user);
    const { isRead, type, priority } = req.query;
    const query = { recipient: userId, isActive: { $ne: false } };

    if (isRead !== undefined) query.isRead = isRead === 'true';
    if (type) query.type = type;
    if (priority) query.priority = priority;

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      isRead: false,
      isActive: { $ne: false },
    });

    res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount,
      data: notifications,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const Notification = ensureTenantNotificationModel(req, res);
    if (!Notification) return;

    const userId = getUserId(req.user);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const notification = await Notification.findById(req.params.id);

    if (!notification || notification.isActive === false) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    // Normalize both sides — ObjectId !== string always fails otherwise
    if (notification.recipient.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (!notification.isRead) {
      notification.isRead = true;
      notification.readAt = Date.now();
      await notification.save();
    }

    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const Notification = ensureTenantNotificationModel(req, res);
    if (!Notification) return;

    const userId = getUserId(req.user);
    await Notification.updateMany(
      { recipient: userId, isRead: false, isActive: { $ne: false } },
      { isRead: true, readAt: Date.now() }
    );

    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const Notification = ensureTenantNotificationModel(req, res);
    if (!Notification) return;

    const userId = getUserId(req.user);
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const notification = await Notification.findById(req.params.id);

    if (!notification || notification.isActive === false) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    if (notification.recipient.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await notification.deleteOne();
    res.status(200).json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper function to create notifications (used by other controllers)
exports.createNotification = async (tenantConnection, data) => {
  try {
    const Notification = getTenantModel(tenantConnection, 'Notification');
    const payload = { ...data };
    // Accept legacy `userId` writers
    if (!payload.recipient && payload.userId) {
      payload.recipient = payload.userId;
      delete payload.userId;
    }
    if (payload.type === 'contract-renewal') {
      payload.type = 'contract-expiry';
    }
    return await Notification.create(payload);
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};
