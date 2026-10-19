# Premium Features Implementation Guide

## Overview
This document outlines the complete premium feature system for HEXORA job portal, including subscription management, featured jobs, analytics, and candidate verification.

---

## 📋 Table of Contents
1. [Premium Tiers](#premium-tiers)
2. [Database Models](#database-models)
3. [API Endpoints](#api-endpoints)
4. [Services](#services)
5. [Email Templates](#email-templates)
6. [Implementation Examples](#implementation-examples)
7. [Admin Panel Features](#admin-panel-features)

---

## 🎯 Premium Tiers

### For Employers
| Feature | FREE | BASIC | PROFESSIONAL | ENTERPRISE |
|---------|------|-------|--------------|-----------|
| Job Posts/Month | 2 | 10 | 50 | Unlimited |
| Featured Jobs | 0 | 2 | 10 | 50 |
| Analytics Access | ❌ | ✅ | ✅ | ✅ |
| Candidate Screening | ❌ | ❌ | ✅ | ✅ |
| Bulk Hiring | ❌ | ❌ | ✅ | ✅ |
| Priority Support | ❌ | ❌ | ✅ | ✅ |
| **Monthly Price** | **Free** | **₹999** | **₹2,999** | **₹9,999** |

### For Candidates
| Feature | FREE | BASIC | PROFESSIONAL | ENTERPRISE |
|---------|------|-------|--------------|-----------|
| Profile Verification | ❌ | ✅ | ✅ | ✅ |
| Premium Badge | ❌ | ✅ | ✅ | ✅ |
| AI Resume Optimization | ❌ | ❌ | ✅ | ✅ |
| Job Recommendations | ❌ | ✅ | ✅ | ✅ |
| Save Drafts | ❌ | ✅ | ✅ | ✅ |
| **Monthly Price** | **Free** | **₹299** | **₹799** | **₹2,499** |

---

## 🗄️ Database Models

### 1. PremiumSubscription
```javascript
{
  user: ObjectId,           // Reference to User
  tier: String,             // FREE, BASIC, PROFESSIONAL, ENTERPRISE
  role: String,             // EMPLOYER, CANDIDATE, ADMIN
  status: String,           // ACTIVE, INACTIVE, SUSPENDED, EXPIRED
  startDate: Date,
  endDate: Date,
  monthlyPrice: Number,     // In rupees
  billingCycle: String,     // MONTHLY, QUARTERLY, ANNUAL
  paymentMethod: String,    // CREDIT_CARD, UPI, etc.
  autoRenew: Boolean,
  features: {
    // Role-specific features
    featuredJobs: Number,
    jobPostingsPerMonth: Number,
    analyticsAccess: Boolean,
    // ... more features
  },
  usage: {
    jobPostingsUsed: Number,
    featuredJobsUsed: Number,
    analyticsViews: Number
  }
}
```

### 2. PremiumAnalytics
Tracks metrics like job views, applications, profile views, etc.

### 3. FeaturedJob
Manages featured job listings with priority and impressions tracking.

### 4. CandidateVerification
Tracks candidate verification status and verification badge.

---

## 🔌 API Endpoints

### Subscription Management

**POST** `/api/premium/subscription`
- Create a new subscription
- Body: `{ tier, role, billingCycle }`
- Returns: Subscription object with status

**GET** `/api/premium/subscription`
- Fetch user's current subscription
- Returns: Subscription details

**PUT** `/api/premium/subscription/upgrade`
- Upgrade to higher tier
- Body: `{ newTier }`
- Returns: Updated subscription

**DELETE** `/api/premium/subscription`
- Cancel active subscription
- Returns: Cancelled subscription info

### Featured Jobs

**POST** `/api/premium/featured-jobs`
- Feature a job listing
- Body: `{ jobId, durationDays, featuredType }`
- Auth: EMPLOYER role required

**GET** `/api/premium/featured-jobs?page=1&limit=10`
- Get featured jobs (public)
- Returns: Paginated featured jobs

### Analytics

**GET** `/api/premium/analytics?metricType=JOB_VIEW&days=30`
- Get user analytics
- Auth: Premium subscription required
- Query params: metricType (optional), days (default: 30)

**GET** `/api/premium/analytics/jobs/:jobId?days=30`
- Get specific job analytics
- Auth: EMPLOYER with analytics access

### Candidate Verification

**POST** `/api/premium/verification/initialize`
- Start verification process
- Auth: CANDIDATE role

**POST** `/api/premium/verification/verify-email`
- Verify email address
- Auth: CANDIDATE role

**POST** `/api/premium/verification/verify-phone`
- Verify phone number
- Body: `{ phone }`
- Auth: CANDIDATE role

**GET** `/api/premium/verification/status`
- Get verification status with badge

### Admin Endpoints

**GET** `/api/premium/admin/subscriptions?status=ACTIVE&tier=PROFESSIONAL`
- List all subscriptions
- Auth: ADMIN role
- Query: status, tier, role, page, limit

**GET** `/api/premium/admin/revenue-stats?startDate=2024-01-01&endDate=2024-01-31`
- Get revenue statistics
- Auth: ADMIN role
- Returns: Total revenue, active subscriptions, breakdown by tier

**PUT** `/api/premium/admin/suspend-subscription`
- Suspend a subscription
- Body: `{ subscriptionId, reason }`
- Auth: ADMIN role

---

## 🛠️ Services

### premiumService

#### Subscription Methods
```javascript
await premiumService.createSubscription(userId, tier, role, monthlyPrice, billingCycle);
await premiumService.upgradeSubscription(userId, newTier);
await premiumService.cancelSubscription(userId);
await premiumService.getSubscription(userId);
await premiumService.checkPremiumStatus(userId, featureName);
```

#### Featured Jobs
```javascript
await premiumService.createFeaturedJob(jobId, employerId, durationDays, featuredType);
await premiumService.getFeaturedJobs(page, limit);
await premiumService.expireFeaturedJobs(); // Cron job
```

#### Analytics
```javascript
await premiumService.trackAnalytic(userId, metricType, data);
await premiumService.getAnalytics(userId, metricType, days);
await premiumService.getJobAnalytics(jobId, days);
```

#### Candidate Verification
```javascript
await premiumService.createOrUpdateVerification(candidateId);
await premiumService.verifyEmail(candidateId);
await premiumService.verifyPhone(candidateId);
await premiumService.getVerificationStatus(candidateId);
```

---

## 📧 Email Templates

### Premium Notifications

1. **subscriptionSuccessEmail** - Confirmation after subscription
2. **subscriptionUpgradedEmail** - When upgrading tiers
3. **jobFeaturedEmail** - When job gets featured
4. **candidateVerificationCompleteEmail** - When verification is complete
5. **analyticsReportEmail** - Weekly analytics summary
6. **renewalReminderEmail** - Before subscription renewal
7. **subscriptionCancelledEmail** - When cancelled

---

## 💡 Implementation Examples

### Example 1: Create Employer Premium Subscription
```javascript
const { createSubscription } = require('../services/premium.service');

// POST /api/premium/subscription
const subscription = await premiumService.createSubscription(
  userId,
  'PROFESSIONAL',  // tier
  'EMPLOYER',      // role
  2999,            // monthlyPrice
  'MONTHLY'        // billingCycle
);
```

### Example 2: Feature a Job
```javascript
const { createFeaturedJob } = require('../services/premium.service');

const featured = await premiumService.createFeaturedJob(
  jobId,
  employerId,
  30,              // durationDays
  'TOP_LISTING'    // featuredType
);
```

### Example 3: Track Analytics
```javascript
// When someone views a job
await premiumService.trackAnalytic(employerId, 'JOB_VIEW', {
  job: jobId,
  viewerDevice: 'mobile',
  viewerLocation: 'Mumbai'
});

// When someone applies
await premiumService.trackAnalytic(employerId, 'JOB_APPLY', {
  job: jobId,
  applicantName: 'John Doe',
  applicantEmail: 'john@example.com'
});
```

### Example 4: Verify Candidate
```javascript
const verification = await premiumService.createOrUpdateVerification(candidateId);
await premiumService.verifyEmail(candidateId);
await premiumService.verifyPhone(candidateId);

const status = await premiumService.getVerificationStatus(candidateId);
// Returns: { overallVerified: true, verificationBadge: true, ... }
```

---

## 🔒 Middleware Usage

### Check Premium Feature Access
```javascript
const { requirePremium } = require('../middlewares/premium.middleware');

router.get(
  '/analytics',
  requirePremium('analyticsAccess'),
  controller
);
```

### Attach Premium Info
```javascript
const { attachPremiumInfo } = require('../middlewares/premium.middleware');

router.get('/dashboard', attachPremiumInfo, (req, res) => {
  const subscription = req.subscription; // Attached by middleware
});
```

### Check Job Posting Limit
```javascript
const { checkJobPostingLimit } = require('../middlewares/premium.middleware');

router.post('/jobs', checkJobPostingLimit, jobController.createJob);
```

---

## 📊 Admin Panel Features

### 1. Subscription Management
- View all subscriptions with filters
- See subscription status (ACTIVE, EXPIRED, SUSPENDED)
- Suspend/reactivate subscriptions
- Export subscription data

### 2. Revenue Analytics
- Total revenue by tier
- Revenue by billing cycle
- Active subscriptions count
- Monthly recurring revenue (MRR)
- Churn rate analysis

### 3. User Analytics
- Active premium users by role
- Trial conversions
- Plan upgrades
- Cancellation reasons

### 4. Featured Jobs Insights
- Top performing featured jobs
- Impressions vs applications
- ROI calculation for featured listings

---

## ⏰ Scheduled Tasks (Cron Jobs)

### 1. Expire Featured Jobs
```javascript
// Daily at 00:00 UTC
schedule.scheduleJob('0 0 * * *', async () => {
  await premiumService.expireFeaturedJobs();
});
```

### 2. Expire Subscriptions
```javascript
// Daily at 01:00 UTC
schedule.scheduleJob('0 1 * * *', async () => {
  // Find expired subscriptions and update status
});
```

### 3. Send Renewal Reminders
```javascript
// Every Monday at 09:00 UTC
schedule.scheduleJob('0 9 * * 1', async () => {
  // Find subscriptions expiring in 7 days
  // Send renewal reminder emails
});
```

---

## 🔄 Payment Integration (Razorpay/Stripe)

### Flow:
1. User selects tier and billing cycle
2. System creates subscription record with status 'PENDING'
3. Frontend redirects to payment gateway
4. Payment success → Update subscription to 'ACTIVE'
5. Send confirmation email

---

## 📈 KPIs to Track

- **Conversion Rate**: Free → Premium users
- **Monthly Recurring Revenue (MRR)**
- **Churn Rate**: Cancellations per month
- **Average Revenue Per User (ARPU)**
- **Customer Lifetime Value (CLV)**
- **Plan Mix**: Distribution of users across tiers

---

## 🚀 Future Enhancements

- AI-powered job recommendations for featured listings
- Advanced salary analytics
- Competitor salary benchmarking
- Custom branding for enterprise employers
- Dedicated account manager for enterprise
- API access for third-party integrations
- White-label solutions

---

## 📞 Support

For questions or issues related to premium features:
- Email: support@HEXORA.com
- Slack: #premium-features
- Jira: PRE project

