const asyncHandler = require('../utils/asyncHandler');
const apiResponse = require('../utils/apiResponse');
const Notification = require('../models/Notification');

const listMyNotifications = asyncHandler(async (req, res) => {
  const { limit = 50 } = req.query;
  const max = Math.min(Number(limit) || 50, 100);

  const notifications = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(max);

  const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });

  res.json(apiResponse({
    message: 'Notifications fetched successfully',
    data: notifications,
    meta: { unreadCount }
  }));
});

const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { isRead: true },
    { new: true }
  );

  res.json(apiResponse({
    message: 'Notification marked as read',
    data: notification
  }));
});

const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });

  res.json(apiResponse({
    message: 'All notifications marked as read',
    data: null
  }));
});

module.exports = {
  listMyNotifications,
  markAsRead,
  markAllAsRead
};