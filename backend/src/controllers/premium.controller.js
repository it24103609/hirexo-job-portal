const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const premiumService = require('../services/premium.service');
const apiResponse = require('../utils/apiResponse');
const PremiumSubscription = require('../models/PremiumSubscription');

// ============ SUBSCRIPTION MANAGEMENT ============

exports.createSubscription = asyncHandler(async (req, res, next) => {
  const { tier, role, billingCycle = 'MONTHLY' } = req.body;
  const userId = req.user._id;

  // Validate tier
  if (!['BASIC', 'PROFESSIONAL', 'ENTERPRISE'].includes(tier)) {
    throw new AppError('Invalid tier selected', 400);
  }

  // Pricing map
  const tierPrices = {
    BASIC: role === 'EMPLOYER' ? 999 : 299,
    PROFESSIONAL: role === 'EMPLOYER' ? 2999 : 799,
    ENTERPRISE: role === 'EMPLOYER' ? 9999 : 2499
  };

  const subscription = await premiumService.createSubscription(
    userId,
    tier,
    role,
    tierPrices[tier],
    billingCycle
  );

  res
    .status(201)
    .json(
      apiResponse(201, subscription, 'Subscription created successfully. Proceeding to payment.')
    );
});

exports.upgradeSubscription = asyncHandler(async (req, res, next) => {
  const { newTier } = req.body;
  const userId = req.user._id;

  const subscription = await premiumService.upgradeSubscription(userId, newTier);

  res.status(200).json(apiResponse(200, subscription, 'Subscription upgraded successfully'));
});

exports.cancelSubscription = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  const subscription = await premiumService.cancelSubscription(userId);

  if (!subscription) {
    throw new AppError('No active subscription found', 404);
  }

  res.status(200).json(apiResponse(200, subscription, 'Subscription cancelled successfully'));
});

exports.getSubscription = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  const subscription = await premiumService.getSubscription(userId);

  if (!subscription) {
    throw new AppError('No subscription found for this user', 404);
  }

  res.status(200).json(apiResponse(200, subscription, 'Subscription details fetched'));
});

// ============ FEATURED JOBS ============

exports.createFeaturedJob = asyncHandler(async (req, res, next) => {
  const { jobId, durationDays = 30, featuredType = 'TOP_LISTING' } = req.body;
  const employerId = req.user._id;

  // Check if employer has premium subscription
  const canFeature = await premiumService.checkPremiumStatus(employerId, 'analyticsAccess');
  if (!canFeature) {
    throw new AppError('Premium subscription required to feature jobs', 403);
  }

  const featured = await premiumService.createFeaturedJob(jobId, employerId, durationDays, featuredType);

  res.status(201).json(apiResponse(201, featured, 'Job featured successfully'));
});

exports.getFeaturedJobs = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;

  const result = await premiumService.getFeaturedJobs(parseInt(page), parseInt(limit));

  res.status(200).json(apiResponse(200, result, 'Featured jobs fetched successfully'));
});

// ============ ANALYTICS ============

exports.getAnalytics = asyncHandler(async (req, res, next) => {
  const { metricType, days = 30 } = req.query;
  const userId = req.user._id;

  // Check if user has analytics access
  const hasAccess = await premiumService.checkPremiumStatus(userId, 'analyticsAccess');
  if (!hasAccess) {
    throw new AppError('Premium subscription required for analytics', 403);
  }

  const analytics = await premiumService.getAnalytics(userId, metricType, parseInt(days));

  res.status(200).json(apiResponse(200, analytics, 'Analytics fetched successfully'));
});

exports.getJobAnalytics = asyncHandler(async (req, res, next) => {
  const { jobId } = req.params;
  const { days = 30 } = req.query;
  const userId = req.user._id;

  // Check if user has analytics access
  const hasAccess = await premiumService.checkPremiumStatus(userId, 'analyticsAccess');
  if (!hasAccess) {
    throw new AppError('Premium subscription required for analytics', 403);
  }

  const analytics = await premiumService.getJobAnalytics(jobId, parseInt(days));

  res.status(200).json(apiResponse(200, analytics, 'Job analytics fetched successfully'));
});

// ============ CANDIDATE VERIFICATION ============

exports.initializeVerification = asyncHandler(async (req, res, next) => {
  const candidateId = req.user._id;

  const verification = await premiumService.createOrUpdateVerification(candidateId);

  res.status(200).json(apiResponse(200, verification, 'Verification initialized'));
});

exports.verifyEmail = asyncHandler(async (req, res, next) => {
  const candidateId = req.user._id;

  const verification = await premiumService.verifyEmail(candidateId);

  res.status(200).json(apiResponse(200, verification, 'Email verified successfully'));
});

exports.verifyPhone = asyncHandler(async (req, res, next) => {
  const { phone } = req.body;
  const candidateId = req.user._id;

  // TODO: Add phone verification logic (OTP, etc.)

  const verification = await premiumService.verifyPhone(candidateId);

  res.status(200).json(apiResponse(200, verification, 'Phone verified successfully'));
});

exports.getVerificationStatus = asyncHandler(async (req, res, next) => {
  const candidateId = req.user._id;

  const verification = await premiumService.getVerificationStatus(candidateId);

  if (!verification) {
    throw new AppError('Verification not found', 404);
  }

  res.status(200).json(apiResponse(200, verification, 'Verification status fetched'));
});

// ============ ADMIN ENDPOINTS ============

exports.getAllSubscriptions = asyncHandler(async (req, res, next) => {
  const { status, tier, role, page = 1, limit = 20 } = req.query;

  const query = {};
  if (status) query.status = status;
  if (tier) query.tier = tier;
  if (role) query.role = role;

  const subscriptions = await PremiumSubscription.find(query)
    .populate('user', 'name email')
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

  const total = await PremiumSubscription.countDocuments(query);

  res.status(200).json(
    apiResponse(200, { subscriptions, total, pages: Math.ceil(total / limit) }, 'All subscriptions fetched')
  );
});

exports.getRevenueStats = asyncHandler(async (req, res, next) => {
  const { startDate, endDate } = req.query;

  const query = {
    status: 'ACTIVE'
  };

  if (startDate && endDate) {
    query.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const subscriptions = await PremiumSubscription.find(query);

  const stats = {
    totalRevenue: subscriptions.reduce((sum, sub) => sum + sub.monthlyPrice, 0),
    activeSubscriptions: subscriptions.length,
    byTier: {},
    byRole: {}
  };

  subscriptions.forEach((sub) => {
    stats.byTier[sub.tier] = (stats.byTier[sub.tier] || 0) + 1;
    stats.byRole[sub.role] = (stats.byRole[sub.role] || 0) + 1;
  });

  res.status(200).json(apiResponse(200, stats, 'Revenue statistics fetched'));
});

exports.suspendSubscription = asyncHandler(async (req, res, next) => {
  const { subscriptionId, reason } = req.body;

  const subscription = await PremiumSubscription.findByIdAndUpdate(
    subscriptionId,
    { status: 'SUSPENDED', notes: reason },
    { new: true }
  );

  if (!subscription) {
    throw new AppError('Subscription not found', 404);
  }

  res.status(200).json(apiResponse(200, subscription, 'Subscription suspended'));
});
