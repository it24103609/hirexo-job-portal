const premiumService = require('../services/premium.service');
const AppError = require('../utils/AppError');

/**
 * Middleware to check if user has a specific premium feature
 * Usage: requirePremium('analyticsAccess')
 */
const requirePremium = (featureName) => {
  return async (req, res, next) => {
    try {
      const hasPremium = await premiumService.checkPremiumStatus(req.user._id, featureName);

      if (!hasPremium) {
        throw new AppError(
          `Premium subscription required for ${featureName.replace(/([A-Z])/g, ' $1').toLowerCase()}`,
          403
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to attach premium subscription info to request
 */
const attachPremiumInfo = async (req, res, next) => {
  try {
    const subscription = await premiumService.getSubscription(req.user._id);
    req.subscription = subscription || { tier: 'FREE', features: {} };
    next();
  } catch (error) {
    req.subscription = { tier: 'FREE', features: {} };
    next();
  }
};

/**
 * Middleware to check if user can post job (based on subscription limits)
 */
const checkJobPostingLimit = async (req, res, next) => {
  try {
    const subscription = await premiumService.getSubscription(req.user._id);

    if (!subscription) {
      throw new AppError('Subscription not found', 404);
    }

    const jobPosted = subscription.usage?.jobPostingsUsed || 0;
    const limit = subscription.features?.jobPostingsPerMonth || 2; // Free tier limit

    if (jobPosted >= limit) {
      throw new AppError(
        `Job posting limit (${limit}/month) reached. Upgrade to post more jobs.`,
        429
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check featured job limit
 */
const checkFeaturedJobLimit = async (req, res, next) => {
  try {
    const subscription = await premiumService.getSubscription(req.user._id);

    if (!subscription) {
      throw new AppError('Subscription not found', 404);
    }

    const featuredCount = subscription.usage?.featuredJobsUsed || 0;
    const limit = subscription.features?.featuredJobs || 0;

    if (featuredCount >= limit) {
      throw new AppError(
        `Featured job limit (${limit}) reached. Upgrade your plan.`,
        429
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  requirePremium,
  attachPremiumInfo,
  checkJobPostingLimit,
  checkFeaturedJobLimit
};
