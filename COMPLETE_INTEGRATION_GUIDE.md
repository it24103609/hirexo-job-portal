# Complete Premium Features Integration Guide

## 🎯 Overview
This document provides step-by-step instructions to fully integrate premium features including payment processing, job flows, analytics, and automation.

---

## 📋 Implementation Checklist

### Phase 1: Backend Setup ✅ COMPLETED
- [x] Models created (PremiumSubscription, PremiumAnalytics, FeaturedJob, CandidateVerification)
- [x] Premium service with all methods
- [x] Premium controllers and routes
- [x] Payment service with Razorpay integration
- [x] Payment controllers and routes
- [x] Premium middleware
- [x] Email templates
- [x] Cron jobs for automation
- [x] App.js configured

### Phase 2: Job Flow Integration ⏳ IN PROGRESS
**Steps:**
1. Update job.controller.js with premium tracking
2. Add checkJobPostingLimit middleware to job routes
3. Add featured jobs display logic
4. Track analytics on job views/saves/applications

**Files to modify:**
- `backend/src/controllers/job.controller.js`
- `backend/src/routes/job.routes.js`

**Code reference:** See CONTROLLER_INTEGRATION_GUIDE.js

### Phase 3: Frontend Components ⏳ IN PROGRESS
**Components to create:**
- SubscriptionPlans (pricing cards)
- PaymentCheckout (Razorpay integration)
- AnalyticsDashboard (charts and metrics)
- CandidateVerification (verification UI)
- FeaturedJobDisplay (show featured badge)

**Files created:**
- `frontend/src/components/Premium/PremiumComponents.jsx`

### Phase 4: Payment Integration ⏳ IN PROGRESS
**Setup Razorpay:**
1. Create account at razorpay.com
2. Get API keys
3. Add to .env

**Webhook setup:**
1. Configure webhook URL: `https://yourdomain.com/api/payments/webhook`
2. Subscribe to events: payment.captured, subscription.authenticated, etc.

### Phase 5: Deployment ⏳ PENDING
- Test all endpoints
- Set environment variables
- Deploy to production
- Monitor cron jobs

---

## 🔧 Step-by-Step Integration

### Step 1: Update Job Controller

**File:** `backend/src/controllers/job.controller.js`

Add at the top:
```javascript
const premiumService = require('../services/premium.service');
```

In `createJob` function, after creating the job, add:
```javascript
// Track job posting for analytics
try {
  await premiumService.trackAnalytic(req.user._id, 'JOB_CREATED', {
    job: job._id,
    jobTitle: job.title,
    jobCategory: job.category
  });
} catch (error) {
  console.error('Failed to track job creation:', error);
}
```

### Step 2: Update Job Routes

**File:** `backend/src/routes/job.routes.js`

Update the POST jobs route:
```javascript
const { checkJobPostingLimit } = require('../middlewares/premium.middleware');

router.post('/jobs',
  authMiddleware,
  roleMiddleware([ROLES.EMPLOYER]),
  checkJobPostingLimit,  // NEW: Add this middleware
  jobController.createJob
);
```

Add a route for featured jobs:
```javascript
router.get('/featured',
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const premiumService = require('../services/premium.service');
    const result = await premiumService.getFeaturedJobs(parseInt(page), parseInt(limit));
    
    res.status(200).json(apiResponse(200, result.featured, 'Featured jobs fetched', {
      pagination: {
        page,
        limit,
        total: result.total,
        pages: result.pages
      }
    }));
  })
);
```

### Step 3: Track Analytics in Job Views

**File:** `backend/src/controllers/application.controller.js` or relevant controller

When getting jobs:
```javascript
exports.getJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find({...});

  // Track views for analytics
  if (req.user) {
    for (const job of jobs) {
      try {
        await premiumService.trackAnalytic(job.employerUser, 'JOB_VIEW', {
          job: job._id,
          viewerRole: req.user.role,
          viewerDevice: req.get('user-agent'),
          viewerLocation: req.body?.location
        });
      } catch (error) {
        console.error('Failed to track job view:', error);
      }
    }
  }

  res.json(apiResponse(200, jobs, 'Jobs fetched'));
});
```

### Step 4: Add Featured Jobs Display

In your job listing response, enrich jobs with featured status:

```javascript
const enrichJobsWithFeatured = async (jobs) => {
  const FeaturedJob = require('../models/FeaturedJob');
  
  const featured = await FeaturedJob.find({
    job: { $in: jobs.map(j => j._id) },
    status: 'ACTIVE',
    featuredUntil: { $gt: new Date() }
  }).lean();

  const featuredMap = new Map(
    featured.map(f => [f.job.toString(), {
      isFeatured: true,
      type: f.featuredType,
      priority: f.displayPriority
    }])
  );

  return jobs.map(job => ({
    ...job.toObject(),
    featuredStatus: featuredMap.get(job._id.toString()) || { isFeatured: false }
  }));
};
```

### Step 5: Setup Environment Variables

**File:** `.env`

```env
# Razorpay
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxx

# Email
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxx

# Premium Features
PREMIUM_FEATURES_ENABLED=true
ANALYTICS_ENABLED=true
ENABLE_CRON=true

# Feature flags
FEATURED_JOBS_ENABLED=true
CANDIDATE_VERIFICATION_ENABLED=true
```

### Step 6: Install Required Packages

```bash
# Backend
npm install razorpay node-schedule

# Frontend
npm install axios
```

### Step 7: Frontend Setup

Copy the components from `frontend/src/components/Premium/PremiumComponents.jsx` to your project.

Create pages:
- `frontend/src/pages/Subscribe.jsx` - Subscription selection page
- `frontend/src/pages/Payment.jsx` - Payment processing page
- `frontend/src/pages/Dashboard/Analytics.jsx` - Analytics dashboard
- `frontend/src/pages/Profile/Verification.jsx` - Verification page

Example Subscribe page:
```jsx
import { SubscriptionPlans } from '../components/Premium/PremiumComponents';

export default function Subscribe() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SubscriptionPlans />
    </div>
  );
}
```

### Step 8: Setup Razorpay Webhook

1. Go to https://dashboard.razorpay.com/settings/webhooks
2. Click "Add New Webhook"
3. Enter webhook URL: `https://yourdomain.com/api/payments/webhook`
4. Select events:
   - `payment.authorized`
   - `payment.captured`
   - `payment.failed`
   - `subscription.authenticated`
5. Save and test webhook

### Step 9: Test Payment Flow

1. Start backend: `npm run dev`
2. Start frontend: `npm run dev`
3. Go to `/subscribe`
4. Select a plan
5. Click "Upgrade Now"
6. Use Razorpay test card: 4111 1111 1111 1111
7. Verify payment is processed

### Step 10: Monitor Cron Jobs

Cron jobs run automatically if `ENABLE_CRON=true`:
- **00:00 UTC**: Expire featured jobs
- **01:00 UTC**: Expire subscriptions
- **09:00 UTC on Mondays**: Send renewal reminders
- **18:00 UTC on Fridays**: Send analytics reports
- **03:00 UTC Daily**: Cleanup old analytics

Check logs:
```bash
# View cron job logs
tail -f logs/app.log | grep CRON
```

---

## 🚀 API Usage Examples

### Create Subscription
```bash
curl -X POST http://localhost:5000/api/payments/subscription/initialize \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tier": "PROFESSIONAL",
    "role": "EMPLOYER",
    "billingCycle": "MONTHLY"
  }'
```

### Get Analytics
```bash
curl -X GET "http://localhost:5000/api/premium/analytics?days=7" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Feature a Job
```bash
curl -X POST http://localhost:5000/api/premium/featured-jobs \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "jobId": "630a1b2c3d4e5f6g7h8i9j0l",
    "durationDays": 30,
    "featuredType": "TOP_LISTING"
  }'
```

---

## 📊 Database Indexes

For optimal performance, create these indexes:

```javascript
// In MongoDB
db.premiumsubscriptions.createIndex({ "user": 1, "status": 1 });
db.premiumsubscriptions.createIndex({ "endDate": 1 });
db.premiumanalytics.createIndex({ "user": 1, "date": 1 });
db.premiumanalytics.createIndex({ "job": 1, "date": 1 });
db.featuredjobs.createIndex({ "featuredUntil": 1, "status": 1 });
```

---

## 🔍 Troubleshooting

### Cron jobs not running
- Check: `ENABLE_CRON=true` in .env
- Check logs for errors
- Verify MongoDB connection

### Payment webhook not receiving events
- Check webhook URL is publicly accessible
- Check firewall/security settings
- Test webhook in Razorpay dashboard

### Analytics not tracking
- Check: `ANALYTICS_ENABLED=true` in .env
- Verify premiumService calls are in controllers
- Check database for PremiumAnalytics records

### Job posting limit not enforced
- Check middleware is added to route
- Verify subscription exists for user
- Check subscription status is 'ACTIVE'

---

## 📈 Monitoring & Analytics

### Key Metrics to Track
- Total premium users
- Monthly recurring revenue (MRR)
- Conversion rate (Free → Premium)
- Churn rate
- Average revenue per user (ARPU)
- Featured job ROI

### Admin Dashboard Queries
```javascript
// Get revenue stats
GET /api/premium/admin/revenue-stats?startDate=2024-01-01&endDate=2024-01-31

// Get all subscriptions
GET /api/premium/admin/subscriptions?status=ACTIVE&tier=PROFESSIONAL
```

---

## ✅ Deployment Checklist

- [ ] All environment variables set
- [ ] Database indexes created
- [ ] Razorpay credentials configured
- [ ] Email service configured
- [ ] Cron jobs tested
- [ ] Payment webhook tested
- [ ] Frontend components integrated
- [ ] Analytics tracking tested
- [ ] Featured jobs displaying correctly
- [ ] Email notifications sending
- [ ] Admin dashboard accessible
- [ ] Error handling tested
- [ ] Logging configured
- [ ] Rate limiting configured
- [ ] HTTPS enabled

---

## 📞 Support

For issues or questions:
1. Check logs: `tail -f logs/app.log`
2. Review API response errors
3. Check MongoDB for data
4. Test endpoints with Postman
5. Review troubleshooting section

---

## 🎯 Next Steps After Integration

1. Monitor analytics for first week
2. Adjust pricing based on customer feedback
3. Create admin dashboard for revenue tracking
4. Setup automated invoicing
5. Implement refund policies
6. Create help documentation
7. Launch marketing campaign

**Estimated Timeline:**
- Phase 2-3: 2-3 days
- Phase 4: 1 day
- Phase 5: 1 day
- **Total: 4-5 days**

