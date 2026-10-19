const mongoose = require('mongoose');

const hiringConfigurationSchema = new mongoose.Schema(
  {
    employerUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    interviewReminderHours: {
      type: Number,
      default: 24
    },
    rescheduleApprovalRequired: {
      type: Boolean,
      default: true
    },
    offerApprovalRequired: {
      type: Boolean,
      default: true
    },
    exportFormat: {
      type: String,
      enum: ['csv', 'json'],
      default: 'csv'
    },
    activitySyncMode: {
      type: String,
      enum: ['manual', 'daily', 'realtime'],
      default: 'daily'
    },
    defaultInterviewDurationMinutes: {
      type: Number,
      min: 15,
      default: 45
    },
    defaultCalendarView: {
      type: String,
      enum: ['agenda', 'month'],
      default: 'agenda'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('HiringConfiguration', hiringConfigurationSchema);
