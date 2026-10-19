const express = require('express');
const paymentController = require('../controllers/payment.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

// All payment routes require authentication (except webhook)
router.use((req, res, next) => {
  if (req.path === '/webhook') {
    return next(); // Skip auth for webhook
  }
  protect(req, res, next);
});

// Subscription payment flow
router.post(
  '/subscription/initialize',
  paymentController.initializeSubscription
);

router.post(
  '/subscription/verify',
  paymentController.verifySubscription
);

// Webhook for Razorpay events
router.post(
  '/webhook',
  paymentController.handleWebhook
);

// Refund
router.post(
  '/refund',
  protect,
  paymentController.requestRefund
);

// Payment history
router.get(
  '/history',
  paymentController.getPaymentHistory
);

module.exports = router;
