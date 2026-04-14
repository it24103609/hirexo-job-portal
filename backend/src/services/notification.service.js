const Notification = require('../models/Notification');

async function createNotification({ userId, type, title, message, metadata = {} }) {
  return Notification.create({
    user: userId,
    type,
    title,
    message,
    metadata
  });
}

module.exports = {
  createNotification
};
