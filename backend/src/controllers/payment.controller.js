const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const apiResponse = require('../utils/apiResponse');
const paymentService = require('../services/payment.service');
const premiumService = require('../services/premium.service');
const PremiumSubscription = require('../models/PremiumSubscription');

/**
 * Initialize payment for subscription
 * POST /api/payments/subscription/initialize
 */
exports.initializeSubscription = asyncHandler(async (req, res, next) => {
  const { tier, role, billingCycle = 'MONTHLY' } = req.body;
  const userId = req.user._id;

  if (!['BASIC', 'PROFESSIONAL', 'ENTERPRISE'].includes(tier)) {
    throw new AppError('Invalid tier', 400);
  }

  // Create Razorpay order
  const order = await paymentService.createOrder(userId, tier, role, billingCycle);

  res.status(200).json(
    apiResponse(
      200,
      {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        razorpayKeyId: process.env.RAZORPAY_KEY_ID
      },
      'Payment order created'
    )
  );
});

/**
 * Verify and process subscription payment
 * POST /api/payments/subscription/verify
 */
exports.verifySubscription = asyncHandler(async (req, res, next) => {
  const {
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    tier,
    role,
    billingCycle
  } = req.body;
  const userId = req.user._id;

  // Verify signature
  const isValid = paymentService.verifySignature(
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature
  );

  if (!isValid) {
    throw new AppError('Payment verification failed', 400);
  }

  // Get payment details
  const payment = await paymentService.getPaymentDetails(razorpayPaymentId);

  if (payment.status !== 'captured' && payment.status !== 'authorized') {
    throw new AppError('Payment not captured', 400);
  }

  // Process subscription
  const subscription = await paymentService.processSubscriptionPayment(
    userId,
    tier,
    role,
    billingCycle,
    razorpayPaymentId,
    razorpayOrderId
  );

  res.status(200).json(
    apiResponse(200, subscription, 'Payment verified and subscription activated')
  );
});

/**
 * Handle Razorpay webhook
 * POST /api/payments/webhook
 */
exports.handleWebhook = asyncHandler(async (req, res, next) => {
  const signature = req.headers['x-razorpay-signature'];
  const body = JSON.stringify(req.body);

  // Verify webhook signature
  const isValid = paymentService.verifySignature(
    req.body.payload.order.entity.id,
    req.body.payload.payment.entity.id,
    signature
  );

  if (!isValid) {
    throw new AppError('Invalid webhook signature', 401);
  }

  const event = req.body.event;
  const paymentEntity = req.body.payload.payment.entity;
  const orderEntity = req.body.payload.order.entity;

  switch (event) {
    case 'payment.authorized':
    case 'payment.captured':
      // Payment successful
      const { userId, tier, role, billingCycle } = orderEntity.notes;
      await paymentService.processSubscriptionPayment(
        userId,
        tier,
        role,
        billingCycle,
        paymentEntity.id,
        orderEntity.id
      );
      break;

    case 'payment.failed':
      // Payment failed - log for admin review
      console.error('Payment failed:', paymentEntity);
      break;

    case 'invoice.paid':
      // Recurring payment successful
      console.log('Recurring payment received:', paymentEntity);
      break;

    case 'subscription.authenticated':
      // Subscription authenticated
      console.log('Subscription authenticated:', req.body.payload.subscription.entity);
      break;

    default:
      console.log('Unknown webhook event:', event);
  }

  // Always respond with 200 to acknowledge receipt
  res.status(200).json({ received: true });
});

/**
 * Request refund for subscription
 * POST /api/payments/refund
 */
exports.requestRefund = asyncHandler(async (req, res, next) => {
  const { subscriptionId, reason } = req.body;
  const userId = req.user._id;

  const subscription = await PremiumSubscription.findOne({
    _id: subscriptionId,
    user: userId
  });

  if (!subscription) {
    throw new AppError('Subscription not found', 404);
  }

  if (subscription.status !== 'ACTIVE') {
    throw new AppError('Can only refund active subscriptions', 400);
  }

  // Get payment ID from notes (stored during verification)
  const paymentId = subscription.notes?.split('Payment: ')[1];

  if (!paymentId) {
    throw new AppError('Payment ID not found', 400);
  }

  // Create refund
  const refund = await paymentService.createRefund(
    paymentId,
    subscription.monthlyPrice,
    reason
  );

  // Update subscription
  subscription.status = 'INACTIVE';
  subscription.autoRenew = false;
  await subscription.save();

  res.status(200).json(
    apiResponse(200, { refund, subscription }, 'Refund processed successfully')
  );
});

/**
 * Get payment history
 * GET /api/payments/history
 */
exports.getPaymentHistory = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  const subscriptions = await PremiumSubscription.find({ user: userId })
    .select('tier status startDate endDate monthlyPrice billingCycle createdAt')
    .sort({ createdAt: -1 });

  res.status(200).json(
    apiResponse(200, subscriptions, 'Payment history fetched successfully')
  );
});
