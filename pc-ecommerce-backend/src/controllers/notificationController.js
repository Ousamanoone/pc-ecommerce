const Notification = require('../models/Notification');

// @desc    Lấy danh sách thông báo của người dùng hoặc Admin
// @route   GET /api/v1/notifications
exports.getMyNotifications = async (req, res) => {
  try {
    const query = req.user.role === 'admin' || req.user.role === 'staff'
      ? { $or: [{ recipient: req.user._id }, { roleTarget: 'ADMIN' }, { roleTarget: 'ALL' }] }
      : { $or: [{ recipient: req.user._id }, { roleTarget: 'ALL' }] };

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Đánh dấu 1 thông báo là đã đọc
// @route   PUT /api/v1/notifications/:id/read
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.isRead = true;
    await notification.save();
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Đánh dấu toàn bộ là đã đọc
// @route   PUT /api/v1/notifications/read-all
exports.markAllAsRead = async (req, res) => {
  try {
    const query = req.user.role === 'admin' || req.user.role === 'staff'
      ? { $or: [{ recipient: req.user._id }, { roleTarget: 'ADMIN' }, { roleTarget: 'ALL' }] }
      : { recipient: req.user._id };

    await Notification.updateMany(query, { isRead: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};