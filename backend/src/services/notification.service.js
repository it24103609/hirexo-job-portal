const Notification = require('../models/Notification');
const User = require('../models/User');
const { ROLES, USER_STATUS } = require('../utils/constants');

async function createNotification({ userId, type, title, message, metadata = {} }) {
  return Notification.create({
    user: userId,
    type,
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
