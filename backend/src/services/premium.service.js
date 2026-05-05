const PremiumSubscription = require('../models/PremiumSubscription');
const PremiumAnalytics = require('../models/PremiumAnalytics');
const FeaturedJob = require('../models/FeaturedJob');
const CandidateVerification = require('../models/CandidateVerification');
const User = require('../models/User');

class PremiumService {
  // ============ SUBSCRIPTION MANAGEMENT ============

  async createSubscription(userId, tier, role, monthlyPrice, billingCycle = 'MONTHLY') {
    try {
      // Calculate end date based on billing cycle
      const startDate = new Date();
      const endDate = this.calculateEndDate(startDate, billingCycle);

      const features = this.getFeaturesByTier(tier, role);

      const subscription = await PremiumSubscription.create({
        user: userId,
        tier,
        role,
        status: 'ACTIVE',
        startDate,
        endDate,
        monthlyPrice,
        billingCycle,
        features
      });

      return subscription;
    } catch (error) {
      throw new Error(`Failed to create subscription: ${error.message}`);
    }
  }

  async upgradeSubscription(userId, newTier) {
    try {
      const subscription = await PremiumSubscription.findOne({
        user: userId,
        status: { $in: ['ACTIVE', 'EXPIRED'] }
      });

      if (!subscription) {
        throw new Error('No active subscription found');
      }

      const newFeatures = this.getFeaturesByTier(newTier, subscription.role);
      const priceMultiplier = { BASIC: 1, PROFESSIONAL: 2.5, ENTERPRISE: 5 };

      subscription.tier = newTier;
      subscription.features = newFeatures;
      subscription.monthlyPrice = subscription.monthlyPrice * (priceMultiplier[newTier] || 1);
      subscription.startDate = new Date();
      subscription.endDate = this.calculateEndDate(new Date(), subscription.billingCycle);

      await subscription.save();
      return subscription;
    } catch (error) {
      throw new Error(`Failed to upgrade subscription: ${error.message}`);
    }
  }

  async cancelSubscription(userId) {
    try {
      const subscription = await PremiumSubscription.findOneAndUpdate(
        { user: userId, status: 'ACTIVE' },
        { status: 'CANCELLED', autoRenew: false },
        { new: true }
      );

      return subscription;
    } catch (error) {
      throw new Error(`Failed to cancel subscription: ${error.message}`);
    }
  }

  async getSubscription(userId) {
    try {
      return await PremiumSubscription.findOne({ user: userId }).populate('user');
    } catch (error) {
      throw new Error(`Failed to fetch subscription: ${error.message}`);
    }
  }

  async checkPremiumStatus(userId, featureName) {
    try {
      const subscription = await PremiumSubscription.findOne({
        user: userId,
        status: 'ACTIVE'
      });

      if (!subscription) return false;

      // Check if feature is available in current tier
      return subscription.features[featureName] || false;
    } catch (error) {
      console.error('Error checking premium status:', error);
      return false;
    }
  }

  // ============ FEATURED JOBS ============

  async createFeaturedJob(jobId, employerId, durationDays = 30, featuredType = 'TOP_LISTING') {
    try {
      const featuredUntil = new Date();
      featuredUntil.setDate(featuredUntil.getDate() + durationDays);

      const featured = await FeaturedJob.create({
        job: jobId,
        employer: employerId,
        featuredUntil,
        featuredType,
        status: 'ACTIVE'
      });

      // Update usage
      await PremiumSubscription.findOneAndUpdate(
        { user: employerId, status: 'ACTIVE' },
        { $inc: { 'usage.featuredJobsUsed': 1 } }
      );

      return featured;
    } catch (error) {
      throw new Error(`Failed to create featured job: ${error.message}`);
    }
  }

  async getFeaturedJobs(page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;

      const featured = await FeaturedJob.find({
        status: 'ACTIVE',
        featuredUntil: { $gt: new Date() }
      })
        .populate('job')
        .populate('employer')
        .sort({ displayPriority: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await FeaturedJob.countDocuments({
        status: 'ACTIVE',
        featuredUntil: { $gt: new Date() }
      });

      return { featured, total, pages: Math.ceil(total / limit) };
    } catch (error) {
      throw new Error(`Failed to fetch featured jobs: ${error.message}`);
    }
  }

  async expireFeaturedJobs() {
    try {
      const result = await FeaturedJob.updateMany(
        { status: 'ACTIVE', featuredUntil: { $lte: new Date() } },
        { status: 'EXPIRED' }
      );

      return result;
    } catch (error) {
      throw new Error(`Failed to expire featured jobs: ${error.message}`);
    }
  }

  // ============ ANALYTICS ============

  async trackAnalytic(userId, metricType, data = {}) {
    try {
      const analytic = await PremiumAnalytics.create({
        user: userId,
        metricType,
        data,
        date: new Date()
      });

      return analytic;
    } catch (error) {
      throw new Error(`Failed to track analytic: ${error.message}`);
    }
  }

  async getAnalytics(userId, metricType = null, days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const query = {
        user: userId,
        date: { $gte: startDate }
      };

      if (metricType) {
        query.metricType = metricType;
      }

      const analytics = await PremiumAnalytics.find(query)
        .sort({ date: -1 })
        .lean();

      // Group by date and metric type
      const grouped = this.groupAnalytics(analytics);

      return grouped;
    } catch (error) {
      throw new Error(`Failed to fetch analytics: ${error.message}`);
    }
  }

  async getJobAnalytics(jobId, days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const analytics = await PremiumAnalytics.find({
        job: jobId,
        date: { $gte: startDate }
      })
        .sort({ date: -1 })
        .lean();

      const summary = {
        totalViews: 0,
        totalSaves: 0,
        totalApplications: 0,
        trending: []
      };

      analytics.forEach((item) => {
        if (item.metricType === 'JOB_VIEW') summary.totalViews += item.count;
        if (item.metricType === 'JOB_SAVE') summary.totalSaves += item.count;
        if (item.metricType === 'JOB_APPLY') summary.totalApplications += item.count;
      });

      return { summary, details: analytics };
    } catch (error) {
      throw new Error(`Failed to fetch job analytics: ${error.message}`);
    }
  }

  // ============ CANDIDATE VERIFICATION ============

  async createOrUpdateVerification(candidateId) {
    try {
      const verification = await CandidateVerification.findOneAndUpdate(
        { candidate: candidateId },
        {
          candidate: candidateId,
          verificationScore: 0
        },
        { upsert: true, new: true }
      );

      return verification;
    } catch (error) {
      throw new Error(`Failed to create verification: ${error.message}`);
    }
  }

  async verifyEmail(candidateId) {
    try {
      const verification = await CandidateVerification.findOneAndUpdate(
        { candidate: candidateId },
        {
          emailVerified: true,
          $inc: { verificationScore: 25 }
        },
        { new: true }
      );

      await this.updateOverallVerification(candidateId);
      return verification;
    } catch (error) {
      throw new Error(`Failed to verify email: ${error.message}`);
    }
  }

  async verifyPhone(candidateId) {
    try {
      const verification = await CandidateVerification.findOneAndUpdate(
        { candidate: candidateId },
        {
          phoneVerified: true,
          $inc: { verificationScore: 25 }
        },
        { new: true }
      );

      await this.updateOverallVerification(candidateId);
      return verification;
    } catch (error) {
      throw new Error(`Failed to verify phone: ${error.message}`);
    }
  }

  async updateOverallVerification(candidateId) {
    try {
      const verification = await CandidateVerification.findOne({ candidate: candidateId });

      const verified =
        verification.emailVerified &&
        verification.phoneVerified &&
        verification.verificationScore >= 50;

      verification.overallVerified = verified;
      if (verified) {
        verification.verificationBadge = true;
        verification.verifiedAt = new Date();
      }

      await verification.save();
      return verification;
    } catch (error) {
      throw new Error(`Failed to update verification: ${error.message}`);
    }
  }

  async getVerificationStatus(candidateId) {
    try {
      return await CandidateVerification.findOne({ candidate: candidateId });
    } catch (error) {
      throw new Error(`Failed to fetch verification: ${error.message}`);
    }
  }

  // ============ UTILITY FUNCTIONS ============

  calculateEndDate(startDate, billingCycle) {
    const endDate = new Date(startDate);

    switch (billingCycle) {
      case 'MONTHLY':
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case 'QUARTERLY':
        endDate.setMonth(endDate.getMonth() + 3);
        break;
      case 'ANNUAL':
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
    }

    return endDate;
  }

  getFeaturesByTier(tier, role) {
    const features = {
      FREE: {},
      BASIC: {},
      PROFESSIONAL: {},
      ENTERPRISE: {}
    };

    if (role === 'EMPLOYER') {
      features.FREE = {
        jobPostingsPerMonth: 2,
        analyticsAccess: false,
        candidateScreening: false,
        bulkHiring: false
      };

      features.BASIC = {
        jobPostingsPerMonth: 10,
        featuredJobs: 2,
        analyticsAccess: true,
        candidateScreening: false,
        bulkHiring: false,
        priority: false
      };

      features.PROFESSIONAL = {
        jobPostingsPerMonth: 50,
        featuredJobs: 10,
        analyticsAccess: true,
        candidateScreening: true,
        bulkHiring: true,
        priority: true
      };

      features.ENTERPRISE = {
        jobPostingsPerMonth: 999,
        featuredJobs: 50,
        analyticsAccess: true,
        candidateScreening: true,
        bulkHiring: true,
        priority: true
      };
    } else if (role === 'CANDIDATE') {
      features.FREE = {
        profileVerification: false,
        premiumBadge: false,
        aiResumeOptimization: false,
        jobRecommendations: false
      };

      features.BASIC = {
        profileVerification: true,
        premiumBadge: true,
        aiResumeOptimization: false,
        jobRecommendations: true,
        saveDrafts: true
      };

      features.PROFESSIONAL = {
        profileVerification: true,
        premiumBadge: true,
        aiResumeOptimization: true,
        jobRecommendations: true,
        saveDrafts: true
      };

      features.ENTERPRISE = {
        profileVerification: true,
        premiumBadge: true,
        aiResumeOptimization: true,
        jobRecommendations: true,
        saveDrafts: true
      };
    }

    return features[tier] || {};
  }

  groupAnalytics(analytics) {
    const grouped = {};

    analytics.forEach((item) => {
      const date = item.date.toISOString().split('T')[0];
      if (!grouped[date]) {
        grouped[date] = {};
      }

      if (!grouped[date][item.metricType]) {
        grouped[date][item.metricType] = 0;
      }

      grouped[date][item.metricType] += item.count;
    });

    return grouped;
  }
}

module.exports = new PremiumService();
