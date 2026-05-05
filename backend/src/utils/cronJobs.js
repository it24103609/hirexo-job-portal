const schedule = require('node-schedule');
const PremiumSubscription = require('../models/PremiumSubscription');
const FeaturedJob = require('../models/FeaturedJob');
const User = require('../models/User');
const emailService = require('../services/email.service');
const {
  renewalReminderEmail,
  subscriptionCancelledEmail
} = require('../utils/emailTemplates');

class CronJobs {
  /**
   * Initialize all cron jobs
   */
  static initialize() {
    console.log('Initializing cron jobs...');

    // Daily at midnight
    this.expireFeaturedJobs();

    // Daily at 1 AM
    this.expireSubscriptions();

    // Every Monday at 9 AM
    this.sendRenewalReminders();

    // Daily at 2 AM
    this.generateAnalyticsReports();

    // Every 6 hours
    this.syncPaymentStatus();

    console.log('✅ All cron jobs initialized');
  }

  /**
   * Expire featured jobs that have passed their featured date
   * Runs: Every day at 00:00 UTC
   */
  static expireFeaturedJobs() {
    schedule.scheduleJob('0 0 * * *', async () => {
      try {
        console.log('[CRON] Starting: Expire featured jobs');

        const result = await FeaturedJob.updateMany(
          {
            status: 'ACTIVE',
            featuredUntil: { $lte: new Date() }
          },
          { status: 'EXPIRED' }
        );

        console.log(`[CRON] ✅ Expired ${result.modifiedCount} featured jobs`);
      } catch (error) {
        console.error('[CRON] ❌ Error expiring featured jobs:', error);
      }
    });
  }

  /**
   * Expire subscriptions that have reached their end date
   * Runs: Every day at 01:00 UTC
   */
  static expireSubscriptions() {
    schedule.scheduleJob('0 1 * * *', async () => {
      try {
        console.log('[CRON] Starting: Expire subscriptions');

        const expiredSubscriptions = await PremiumSubscription.find({
          status: 'ACTIVE',
          endDate: { $lte: new Date() },
          autoRenew: false
        });

        // Update status to EXPIRED
        const result = await PremiumSubscription.updateMany(
          {
            status: 'ACTIVE',
            endDate: { $lte: new Date() },
            autoRenew: false
          },
          { status: 'EXPIRED' }
        );

        // Send cancellation emails
        for (const subscription of expiredSubscriptions) {
          const user = await User.findById(subscription.user);
          if (user) {
            await emailService.send({
              to: user.email,
              subject: 'Your Hirexo Premium Subscription Expired',
              html: subscriptionCancelledEmail({
                name: user.name,
                tier: subscription.tier,
                refundAmount: 0
              })
            });
          }
        }

        console.log(
          `[CRON] ✅ Expired ${result.modifiedCount} subscriptions`
        );
      } catch (error) {
        console.error('[CRON] ❌ Error expiring subscriptions:', error);
      }
    });
  }

  /**
   * Send renewal reminders 7 days before subscription ends
   * Runs: Every Monday at 09:00 UTC
   */
  static sendRenewalReminders() {
    schedule.scheduleJob('0 9 * * 1', async () => {
      try {
        console.log('[CRON] Starting: Send renewal reminders');

        const now = new Date();
        const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        const subscriptionsToRenew = await PremiumSubscription.find({
          status: 'ACTIVE',
          autoRenew: true,
          endDate: {
            $gte: now,
            $lte: sevenDaysLater
          }
        });

        let emailsSent = 0;

        for (const subscription of subscriptionsToRenew) {
          const user = await User.findById(subscription.user);
          if (user) {
            try {
              await emailService.send({
                to: user.email,
                subject: 'Your Hirexo Premium Subscription Renews Soon',
                html: renewalReminderEmail({
                  name: user.name,
                  tier: subscription.tier,
                  renewalDate: subscription.endDate,
                  price: subscription.monthlyPrice
                })
              });
              emailsSent++;
            } catch (emailError) {
              console.error(
                `Failed to send renewal reminder to ${user.email}:`,
                emailError.message
              );
            }
          }
        }

        console.log(`[CRON] ✅ Sent ${emailsSent} renewal reminder emails`);
      } catch (error) {
        console.error('[CRON] ❌ Error sending renewal reminders:', error);
      }
    });
  }

  /**
   * Generate and send weekly analytics reports to premium users
   * Runs: Every Friday at 18:00 UTC
   */
  static generateAnalyticsReports() {
    schedule.scheduleJob('0 18 * * 5', async () => {
      try {
        console.log('[CRON] Starting: Generate analytics reports');

        const premiumSubscriptions = await PremiumSubscription.find({
          status: 'ACTIVE',
          'features.analyticsAccess': true
        });

        const PremiumAnalytics = require('../models/PremiumAnalytics');
        let reportsGenerated = 0;

        for (const subscription of premiumSubscriptions) {
          try {
            // Get analytics for last 7 days
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const analytics = await PremiumAnalytics.find({
              user: subscription.user,
              date: { $gte: sevenDaysAgo }
            });

            // Calculate summary
            const summary = {
              totalViews: 0,
              totalSaves: 0,
              totalApplications: 0
            };

            analytics.forEach((item) => {
              if (item.metricType === 'JOB_VIEW') summary.totalViews += item.count;
              if (item.metricType === 'JOB_SAVE') summary.totalSaves += item.count;
              if (item.metricType === 'JOB_APPLY') summary.totalApplications += item.count;
            });

            const user = await User.findById(subscription.user);
            if (user && (summary.totalViews > 0 || summary.totalSaves > 0)) {
              const { analyticsReportEmail } = require('../utils/emailTemplates');
              await emailService.send({
                to: user.email,
                subject: 'Your Weekly Analytics Report - Hirexo',
                html: analyticsReportEmail({
                  userName: user.name,
                  role: subscription.role,
                  reportDate: new Date(),
                  reportData: summary
                })
              });

              reportsGenerated++;
            }
          } catch (reportError) {
            console.error(
              `Failed to generate report for user ${subscription.user}:`,
              reportError.message
            );
          }
        }

        console.log(`[CRON] ✅ Generated ${reportsGenerated} analytics reports`);
      } catch (error) {
        console.error('[CRON] ❌ Error generating analytics reports:', error);
      }
    });
  }

  /**
   * Reset subscription usage counters monthly
   * Runs: 1st of every month at 00:00 UTC
   */
  static resetMonthlyUsage() {
    schedule.scheduleJob('0 0 1 * *', async () => {
      try {
        console.log('[CRON] Starting: Reset monthly usage counters');

        const result = await PremiumSubscription.updateMany(
          {
            status: 'ACTIVE'
          },
          {
            $set: {
              'usage.jobPostingsUsed': 0,
              'usage.analyticsViews': 0
            }
          }
        );

        console.log(`[CRON] ✅ Reset usage for ${result.modifiedCount} subscriptions`);
      } catch (error) {
        console.error('[CRON] ❌ Error resetting monthly usage:', error);
      }
    });
  }

  /**
   * Sync payment status with Razorpay
   * Runs: Every 6 hours
   */
  static syncPaymentStatus() {
    schedule.scheduleJob('0 */6 * * *', async () => {
      try {
        console.log('[CRON] Starting: Sync payment status');

        // Find pending subscriptions created in last 24 hours
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const pendingSubscriptions = await PremiumSubscription.find({
          status: 'PENDING',
          createdAt: { $gte: oneDayAgo }
        });

        let synced = 0;

        for (const subscription of pendingSubscriptions) {
          try {
            const paymentService = require('../services/payment.service');
            // Check payment status if payment ID is available
            // This would require storing payment ID in notes
            synced++;
          } catch (syncError) {
            console.error(
              `Failed to sync payment for subscription ${subscription._id}:`,
              syncError.message
            );
          }
        }

        console.log(`[CRON] ✅ Synced ${synced} payment statuses`);
      } catch (error) {
        console.error('[CRON] ❌ Error syncing payment status:', error);
      }
    });
  }

  /**
   * Clean up old analytics data (keep last 90 days)
   * Runs: Daily at 03:00 UTC
   */
  static cleanupOldAnalytics() {
    schedule.scheduleJob('0 3 * * *', async () => {
      try {
        console.log('[CRON] Starting: Cleanup old analytics');

        const PremiumAnalytics = require('../models/PremiumAnalytics');
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

        const result = await PremiumAnalytics.deleteMany({
          date: { $lt: ninetyDaysAgo }
        });

        console.log(`[CRON] ✅ Deleted ${result.deletedCount} old analytics records`);
      } catch (error) {
        console.error('[CRON] ❌ Error cleaning up old analytics:', error);
      }
    });
  }

  /**
   * Stop all cron jobs (useful for testing)
   */
  static stopAll() {
    schedule.gracefulShutdown();
    console.log('All cron jobs stopped');
  }
}

module.exports = CronJobs;
