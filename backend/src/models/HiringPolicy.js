const mongoose = require('mongoose');

const hiringPolicySchema = new mongoose.Schema(
  {
    employerUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      enum: ['sla', 'interview', 'offer', 'communication', 'workflow'],
      default: 'workflow'
    },
    description: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'archived'],
      default: 'active'
    },
    rules: {
      responseSlaHours: { type: Number, default: 24 },
      interviewReminderHours: { type: Number, default: 24 },
      offerExpiryDays: { type: Number, default: 7 },
      approvalRequired: { type: Boolean, default: false },
      autoArchiveDays: { type: Number, default: 30 }
    },
    tags: [{ type: String, trim: true }]
  },
  { timestamps: true }
);

hiringPolicySchema.index({ employerUser: 1, status: 1, category: 1 });

module.exports = mongoose.model('HiringPolicy', hiringPolicySchema);
