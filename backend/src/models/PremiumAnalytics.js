const mongoose = require('mongoose');

const premiumAnalyticsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job'
    },
    metricType: {
      type: String,
      enum: ['JOB_VIEW', 'JOB_SAVE', 'JOB_APPLY', 'PROFILE_VIEW', 'CANDIDATE_SCREENED'],
      required: true
    },
    count: {
      type: Number,
      default: 1
    },
    date: {
      type: Date,
      default: () => new Date()
    },
    data: {
      // Job Analytics
      applicantName: String,
      applicantEmail: String,
      screeningScore: Number, // AI scoring
      viewerLocation: String,
      viewerDevice: String,
      
      // Candidate Analytics
      viewerRole: String,
      viewerCompany: String,
      duration: Number // viewing duration in seconds
    }
  },
  { timestamps: true }
);

// Compound index for efficient analytics queries
premiumAnalyticsSchema.index({ user: 1, date: 1 });
premiumAnalyticsSchema.index({ job: 1, date: 1 });
premiumAnalyticsSchema.index({ metricType: 1, date: 1 });

module.exports = mongoose.model('PremiumAnalytics', premiumAnalyticsSchema);
