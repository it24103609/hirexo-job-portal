const express = require('express');
const premiumController = require('../controllers/premium.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');
const { ROLES } = require('../utils/constants');

const router = express.Router();

// All premium routes require authentication
router.use(protect);

// ============ SUBSCRIPTION MANAGEMENT (All Users) ============
router.post('/subscription', premiumController.createSubscription);
router.get('/subscription', premiumController.getSubscription);
router.put('/subscription/upgrade', premiumController.upgradeSubscription);
router.delete('/subscription', premiumController.cancelSubscription);

// ============ FEATURED JOBS (Employers) ============
router.post(
  '/featured-jobs',
  authorizeRoles(ROLES.EMPLOYER),
  premiumController.createFeaturedJob
);
router.get('/featured-jobs', premiumController.getFeaturedJobs);

// ============ ANALYTICS (Employers & Candidates) ============
router.get(
  '/analytics',
  authorizeRoles(ROLES.EMPLOYER, ROLES.CANDIDATE),
  premiumController.getAnalytics
);
router.get(
  '/analytics/jobs/:jobId',
  authorizeRoles(ROLES.EMPLOYER),
  premiumController.getJobAnalytics
);

// ============ CANDIDATE VERIFICATION ============
router.post(
  '/verification/initialize',
  authorizeRoles(ROLES.CANDIDATE),
  premiumController.initializeVerification
);
router.post(
  '/verification/verify-email',
  authorizeRoles(ROLES.CANDIDATE),
  premiumController.verifyEmail
);
router.post(
  '/verification/verify-phone',
  authorizeRoles(ROLES.CANDIDATE),
  premiumController.verifyPhone
);
router.get(
  '/verification/status',
  authorizeRoles(ROLES.CANDIDATE),
  premiumController.getVerificationStatus
);

// ============ ADMIN ENDPOINTS ============
router.get(
  '/admin/subscriptions',
  authorizeRoles(ROLES.ADMIN),
  premiumController.getAllSubscriptions
);
router.get(
  '/admin/revenue-stats',
  authorizeRoles(ROLES.ADMIN),
  premiumController.getRevenueStats
);
router.put(
  '/admin/suspend-subscription',
  authorizeRoles(ROLES.ADMIN),
  premiumController.suspendSubscription
);

module.exports = router;
