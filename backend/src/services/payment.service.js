const Razorpay = require('razorpay');
const crypto = require('crypto');
const PremiumSubscription = require('../models/PremiumSubscription');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const apiResponse = require('../utils/apiResponse');
const emailService = require('./email.service');
const { subscriptionSuccessEmail } = require('../utils/emailTemplates');

class PaymentService {
  constructor() {
    this.razorpay = null;
  }

  getRazorpayClient() {
    if (this.razorpay) {
      return this.razorpay;
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay credentials are required');
    }

    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    return this.razorpay;
  }

  /**
   * Create order for subscription payment
   */
  async createOrder(userId, tier, role, billingCycle) {
    try {
      const razorpay = this.getRazorpayClient();

      const tierPrices = {
        BASIC: role === 'EMPLOYER' ? 99900 : 29900,          // in paise
        PROFESSIONAL: role === 'EMPLOYER' ? 299900 : 79900,
        ENTERPRISE: role === 'EMPLOYER' ? 999900 : 249900
      };

      const amount = tierPrices[tier];
      if (!amount) {
        throw new Error('Invalid tier');
      }

      const order = await razorpay.orders.create({
        amount,
        currency: 'INR',
        receipt: `sub_${userId}_${Date.now()}`,
        payment_capture: 1,
        notes: {
          userId,
          tier,
          role,
          billingCycle
        }
      });

      return order;
    } catch (error) {
      throw new Error(`Failed to create Razorpay order: ${error.message}`);
    }
  }

  /**
   * Verify payment signature
   */
  verifySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature) {
    try {
      if (!process.env.RAZORPAY_KEY_SECRET) {
        throw new Error('Razorpay credentials are required');
      }

      const body = `${razorpayOrderId}|${razorpayPaymentId}`;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest('hex');

      return expectedSignature === razorpaySignature;
    } catch (error) {
      throw new Error('Signature verification failed');
    }
  }

  /**
   * Fetch payment details from Razorpay
   */
  async getPaymentDetails(paymentId) {
    try {
      const razorpay = this.getRazorpayClient();
      const payment = await razorpay.payments.fetch(paymentId);
      return payment;
    } catch (error) {
      throw new Error(`Failed to fetch payment: ${error.message}`);
    }
  }

  /**
   * Fetch order details
   */
  async getOrderDetails(orderId) {
    try {
      const razorpay = this.getRazorpayClient();
      const order = await razorpay.orders.fetch(orderId);
      return order;
    } catch (error) {
      throw new Error(`Failed to fetch order: ${error.message}`);
    }
  }

  /**
   * Process subscription after successful payment
   */
  async processSubscriptionPayment(
    userId,
    tier,
    role,
    billingCycle,
    paymentId,
    razorpayOrderId
  ) {
    try {
      const premiumService = require('./premium.service');

      // Create subscription
      const subscription = await premiumService.createSubscription(
        userId,
        tier,
        role,
        Math.round(
          (role === 'EMPLOYER'
            ? { BASIC: 999, PROFESSIONAL: 2999, ENTERPRISE: 9999 }
            : { BASIC: 299, PROFESSIONAL: 799, ENTERPRISE: 2499 })[tier] || 0
        ),
        billingCycle
      );

      // Update with payment details
      subscription.paymentMethod = 'RAZORPAY';
      subscription.notes = `Razorpay Order: ${razorpayOrderId}, Payment: ${paymentId}`;
      await subscription.save();

      // Send confirmation email
      const user = await User.findById(userId);
      await emailService.send({
        to: user.email,
        subject: `Welcome to Hirexo ${tier} Plan!`,
        html: subscriptionSuccessEmail({
          name: user.name,
          tier,
          role,
          renewalDate: subscription.endDate,
          price: subscription.monthlyPrice
        })
      });

      return subscription;
    } catch (error) {
      throw new Error(`Failed to process subscription: ${error.message}`);
    }
  }

  /**
   * Create refund for cancelled subscription
   */
  async createRefund(paymentId, amount, reason) {
    try {
      const razorpay = this.getRazorpayClient();
      const refund = await razorpay.payments.refund(paymentId, {
        amount: Math.round(amount * 100), // convert to paise
        notes: { reason }
      });

      return refund;
    } catch (error) {
      throw new Error(`Failed to create refund: ${error.message}`);
    }
  }

  /**
   * Setup auto-renewal subscription
   */
  async setupAutoRenewal(customerId, planId) {
    try {
      const razorpay = this.getRazorpayClient();

      // Note: Requires Razorpay Plans API setup
      // This is a placeholder for subscription plan management
      const subscription = await razorpay.subscriptions.create({
        plan_id: planId,
        customer_notify: 1,
        quantity: 1
      });

      return subscription;
    } catch (error) {
      throw new Error(`Failed to setup auto-renewal: ${error.message}`);
    }
  }
}

module.exports = new PaymentService();
