const mongoose = require('mongoose');

const featuredJobSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
      unique: true,
      index: true
    },
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    featuredUntil: {
      type: Date,
      required: true
    },
    featuredType: {
      type: String,
      enum: ['TOP_LISTING', 'HIGHLIGHTED', 'PREMIUM_BADGE', 'SPONSORED'],
      default: 'TOP_LISTING'
    },
    displayPriority: {
      type: Number,
      default: 1 // 1 = highest priority
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'EXPIRED', 'CANCELLED'],
      default: 'ACTIVE'
    },
    impressions: {
      type: Number,
      default: 0
    },
    clicks: {
      type: Number,
      default: 0
    },
    applications: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

// Index for expired jobs
featuredJobSchema.index({ featuredUntil: 1, status: 1 });

module.exports = mongoose.model('FeaturedJob', featuredJobSchema);
