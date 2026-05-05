const mongoose = require('mongoose');

const premiumSubscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    tier: {
      type: String,
      enum: ['FREE', 'BASIC', 'PROFESSIONAL', 'ENTERPRISE'],
      default: 'FREE'
    },
    role: {
      type: String,
      enum: ['EMPLOYER', 'CANDIDATE', 'ADMIN'],
      required: true
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'EXPIRED'],
      default: 'ACTIVE'
    },
    startDate: {
      type: Date,
      default: () => new Date()
    },
    endDate: {
      type: Date,
      required: true
    },
    monthlyPrice: {
      type: Number,
      default: 0
    },
    billingCycle: {
      type: String,
      enum: ['MONTHLY', 'QUARTERLY', 'ANNUAL'],
      default: 'MONTHLY'
    },
    paymentMethod: {
      type: String,
      enum: ['CREDIT_CARD', 'DEBIT_CARD', 'UPI', 'BANK_TRANSFER', 'WALLET'],
      default: 'CREDIT_CARD'
    },
    autoRenew: {
      type: Boolean,
      default: true
    },
    features: {
      // Employer Features
      featuredJobs: { type: Number, default: 0 }, // Number of featured listings
      jobPostingsPerMonth: { type: Number, default: 5 },
      analyticsAccess: { type: Boolean, default: false },
      candidateScreening: { type: Boolean, default: false },
      bulkHiring: { type: Boolean, default: false },
      priority: { type: Boolean, default: false }, // Priority support
      
      // Candidate Features
      profileVerification: { type: Boolean, default: false },
      premiumBadge: { type: Boolean, default: false },
      aiResumeOptimization: { type: Boolean, default: false },
      jobRecommendations: { type: Boolean, default: false },
      saveDrafts: { type: Boolean, default: false },
      
      // Admin Features
      advancedAnalytics: { type: Boolean, default: false },
      userManagement: { type: Boolean, default: false },
      contentModeration: { type: Boolean, default: false },
      revenueTracking: { type: Boolean, default: false }
    },
    usage: {
      jobPostingsUsed: { type: Number, default: 0 },
      featuredJobsUsed: { type: Number, default: 0 },
      analyticsViews: { type: Number, default: 0 },
      applicationsScreened: { type: Number, default: 0 }
    },
    notes: String
  },
  { timestamps: true }
);

// Index for efficient queries
premiumSubscriptionSchema.index({ user: 1, status: 1 });
premiumSubscriptionSchema.index({ endDate: 1 });
premiumSubscriptionSchema.index({ role: 1, status: 1 });

module.exports = mongoose.model('PremiumSubscription', premiumSubscriptionSchema);
