const Notification = require('../models/Notification');
const User = require('../models/User');
const { ROLES, USER_STATUS } = require('../utils/constants');

function inferCategory(type = '', metadata = {}) {
  const key = String(type || '').toLowerCase();
  if (metadata.offerId || key.includes('offer')) return 'offers';
  if (metadata.roundId || metadata.interviewScheduledAt || key.includes('interview')) return 'interviews';
  if (metadata.applicationId || key.includes('application') || key.includes('status')) return 'applications';
  if (key.includes('message')) return 'messages';
  if (metadata.approvalId || key.includes('approval') || key.includes('review')) return 'approvals';
  return 'system';
}

function inferPriority(type = '', title = '', metadata = {}) {
  const source = `${type} ${title}`.toLowerCase();
  if (metadata.priority === 'urgent' || metadata.priority === 'high') return 'high';
  if (source.includes('no-show') || source.includes('expir') || source.includes('urgent') || source.includes('cancel')) return 'high';
  if (source.includes('interview') || source.includes('offer') || source.includes('approval')) return 'medium';
  return 'low';
}

async function createNotification({ userId, type, title, message, metadata = {} }) {
  return Notification.create({
    user: userId,
    type,
    category: inferCategory(type, metadata),
    priority: inferPriority(type, title, metadata),
    title,
    message,
    metadata
  });
}

async function notifyAdmins({ type, title, message, metadata = {}, excludeUserId } = {}) {
  const filter = {
    role: ROLES.ADMIN,
    status: USER_STATUS.ACTIVE
  };

  if (excludeUserId) {
    filter._id = { $ne: excludeUserId };
  }

  const admins = await User.find(filter).select('_id').lean();
  if (!admins.length) {
    return [];
  }

  return Notification.insertMany(
    admins.map((admin) => ({
      user: admin._id,
      type,
      category: inferCategory(type, metadata),
      priority: inferPriority(type, title, metadata),
      title,
      message,
      metadata
    }))
  );
}

module.exports = {
  createNotification,
  notifyAdmins
};
