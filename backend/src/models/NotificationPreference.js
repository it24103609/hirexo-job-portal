const mongoose = require('mongoose');

const notificationPreferenceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    emailEnabled: {
      type: Boolean,
      default: true
    },
    digestFrequency: {
      type: String,
      enum: ['instant', 'daily', 'weekly'],
      default: 'instant'
    },
    categories: {
      applications: { type: Boolean, default: true },
      interviews: { type: Boolean, default: true },
      offers: { type: Boolean, default: true },
      approvals: { type: Boolean, default: true },
      messages: { type: Boolean, default: true },
      system: { type: Boolean, default: true }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('NotificationPreference', notificationPreferenceSchema);
