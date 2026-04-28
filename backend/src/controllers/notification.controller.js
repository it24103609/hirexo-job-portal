const asyncHandler = require('../utils/asyncHandler');
const apiResponse = require('../utils/apiResponse');
const Notification = require('../models/Notification');
const NotificationPreference = require('../models/NotificationPreference');
const { processReminderNotificationsForUser } = require('../utils/notificationReminders');

function inferCategory(item) {
  if (item.category) return item.category;
  const source = `${item.type || ''} ${item.title || ''} ${item.message || ''}`.toLowerCase();
  if (source.includes('offer')) return 'offers';
  if (source.includes('interview')) return 'interviews';
  if (source.includes('approval') || source.includes('review')) return 'approvals';
  if (source.includes('message')) return 'messages';
  if (source.includes('application') || source.includes('status')) return 'applications';
  return 'system';
}

function inferPriority(item) {
  if (item.priority) return item.priority;
  const source = `${item.type || ''} ${item.title || ''}`.toLowerCase();
  if (source.includes('no-show') || source.includes('expir') || source.includes('urgent') || source.includes('cancel')) return 'high';
  if (source.includes('interview') || source.includes('offer') || source.includes('approval')) return 'medium';
  return 'low';
}

function buildAction(item, role) {
  const metadata = item.metadata || {};

  if (role === 'candidate') {
    if (metadata.offerId) return { label: 'View offer', to: '/candidate/applications' };
    if (metadata.applicationId) return { label: 'View application', to: `/candidate/applications?applicationId=${metadata.applicationId}` };
    if (metadata.roundId || item.category === 'interviews') return { label: 'Open interviews', to: '/candidate/interviews' };
  }

  if (role === 'employer') {
    if (metadata.roundId || item.category === 'interviews') return { label: 'Open interview hub', to: '/employer/interviews' };
    if (metadata.offerId) return { label: 'Open offers', to: '/employer/offers' };
    if (metadata.approvalId || item.category === 'approvals') return { label: 'Open approvals', to: '/employer/approvals' };
    if (metadata.applicationId) return { label: 'View candidate', to: `/employer/applicants/${metadata.applicationId}` };
  }

  if (role === 'admin') {
    if (item.category === 'interviews') return { label: 'Open interviews', to: '/admin/interviews' };
    if (item.category === 'approvals' || metadata.approvalId) return { label: 'Open reports', to: '/admin/reports' };
    if (metadata.applicationId) return { label: 'Open moderation', to: '/admin/jobs' };
  }

  return null;
}

function defaultPreferences() {
  return {
    emailEnabled: true,
    digestFrequency: 'instant',
    categories: {
      applications: true,
      interviews: true,
      offers: true,
      approvals: true,
      messages: true,
      system: true
    }
  };
}

const listMyNotifications = asyncHandler(async (req, res) => {
  const { limit = 50, category = 'all' } = req.query;
  const max = Math.min(Number(limit) || 50, 100);
  const filter = { user: req.user._id };

  if (category && category !== 'all') {
    filter.category = category;
  }

  const [notifications, unreadCount, unreadByCategoryAgg, preferences] = await Promise.all([
    Notification.find(filter)
    .sort({ createdAt: -1 })
    .limit(max),
    Notification.countDocuments({ user: req.user._id, isRead: false }),
    Notification.aggregate([
      { $match: { user: req.user._id, isRead: false } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]),
    NotificationPreference.findOne({ user: req.user._id }).lean()
  ]);

  const unreadByCategory = unreadByCategoryAgg.reduce((accumulator, item) => {
    accumulator[item._id || 'system'] = item.count;
    return accumulator;
  }, {});

  const data = notifications.map((item) => {
    const plain = item.toObject();
    plain.category = inferCategory(plain);
    plain.priority = inferPriority(plain);
    plain.action = buildAction(plain, req.user.role);
    return plain;
  });

  res.json(apiResponse({
    message: 'Notifications fetched successfully',
    data,
    meta: {
      unreadCount,
      unreadByCategory,
      preferences: preferences || defaultPreferences()
    }
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

const getPreferences = asyncHandler(async (req, res) => {
  const preferences = await NotificationPreference.findOne({ user: req.user._id }).lean();

  res.json(apiResponse({
    message: 'Notification preferences fetched successfully',
    data: preferences || defaultPreferences()
  }));
});

const updatePreferences = asyncHandler(async (req, res) => {
  const payload = {
    emailEnabled: req.body.emailEnabled !== undefined ? Boolean(req.body.emailEnabled) : true,
    digestFrequency: req.body.digestFrequency || 'instant',
    categories: {
      applications: req.body.categories?.applications !== undefined ? Boolean(req.body.categories.applications) : true,
      interviews: req.body.categories?.interviews !== undefined ? Boolean(req.body.categories.interviews) : true,
      offers: req.body.categories?.offers !== undefined ? Boolean(req.body.categories.offers) : true,
      approvals: req.body.categories?.approvals !== undefined ? Boolean(req.body.categories.approvals) : true,
      messages: req.body.categories?.messages !== undefined ? Boolean(req.body.categories.messages) : true,
      system: req.body.categories?.system !== undefined ? Boolean(req.body.categories.system) : true
    }
  };

  const preferences = await NotificationPreference.findOneAndUpdate(
    { user: req.user._id },
    { $set: { user: req.user._id, ...payload } },
    { new: true, upsert: true, runValidators: true }
  ).lean();

  res.json(apiResponse({
    message: 'Notification preferences updated successfully',
    data: preferences
  }));
});

const processReminders = asyncHandler(async (req, res) => {
  const result = await processReminderNotificationsForUser(req.user);

  res.json(apiResponse({
    message: 'Reminder notifications processed successfully',
    data: result
  }));
});

module.exports = {
  listMyNotifications,
  markAsRead,
  markAllAsRead,
  getPreferences,
  updatePreferences,
  processReminders
};
