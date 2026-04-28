const mongoose = require('mongoose');

const hiringApprovalSchema = new mongoose.Schema(
  {
    employerUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ['job_publish', 'offer_approval', 'interview_reschedule', 'policy_change', 'budget_signoff', 'general'],
      default: 'general',
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true
    },
    requestedByName: {
      type: String,
      trim: true
    },
    requesterRole: {
      type: String,
      trim: true,
      default: 'employer'
    },
    relatedJob: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job'
    },
    relatedApplication: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application'
    },
    relatedOffer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Offer'
    },
    dueAt: Date,
    decisionNote: {
      type: String,
      trim: true
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date
  },
  { timestamps: true }
);

hiringApprovalSchema.index({ employerUser: 1, status: 1, priority: 1 });

module.exports = mongoose.model('HiringApproval', hiringApprovalSchema);
