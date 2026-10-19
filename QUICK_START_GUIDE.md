# Quick Start Guide - Premium Features

## 🚀 5-Minute Setup

### 1. Install Packages
```bash
cd backend
npm install razorpay node-schedule
```

### 2. Add Environment Variables to `.env`
```env
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
SENDGRID_API_KEY=SG.xxxxx
ENABLE_CRON=true
PREMIUM_FEATURES_ENABLED=true
```

### 3. Update Job Routes (One change)
**File:** `backend/src/routes/job.routes.js`

```javascript
const { checkJobPostingLimit } = require('../middlewares/premium.middleware');

// Add to POST /jobs route:
router.post('/jobs',
  authMiddleware,
  roleMiddleware([ROLES.EMPLOYER]),
  checkJobPostingLimit,  // ← ADD THIS LINE
  jobController.createJob
);
```

### 4. Update Job Controller (Optional but recommended)
**File:** `backend/src/controllers/job.controller.js`

Add this after job creation in `createJob` function:
```javascript
// Track analytics
const premiumService = require('../services/premium.service');
await premiumService.trackAnalytic(req.user._id, 'JOB_CREATED', {
  job: job._id,
  jobTitle: job.title
});
```

### 5. Copy Frontend Components
Copy `frontend/src/components/Premium/PremiumComponents.jsx` to your components folder.

### 6. Create Subscribe Page
**File:** `frontend/src/pages/Subscribe.jsx`

```jsx
import React from 'react';
import { SubscriptionPlans } from '../components/Premium/PremiumComponents';

export default function Subscribe() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SubscriptionPlans />
    </div>
  );
}
```

### 7. Test
```bash
# Terminal 1: Backend
npm run dev

# Terminal 2: Frontend
npm run dev

# Visit: http://localhost:3000/subscribe
```

---

## 📁 Files Created

### Backend Models (4)
```
backend/src/models/
├── PremiumSubscription.js
├── PremiumAnalytics.js
├── FeaturedJob.js
└── CandidateVerification.js
```

### Backend Services & Controllers
```
backend/src/services/
├── premium.service.js (NEW)
└── payment.service.js (NEW)

backend/src/controllers/
├── premium.controller.js (NEW)
└── payment.controller.js (NEW)
```

### Backend Routes & Middleware
```
backend/src/routes/
├── premium.routes.js (NEW)
└── payment.routes.js (NEW)

backend/src/middlewares/
└── premium.middleware.js (NEW)
```

### Utilities
```
backend/src/utils/
├── emailTemplates.js (UPDATED - 7 new templates)
├── aiResumeScorer.js (NEW)
└── cronJobs.js (NEW)
```

### Frontend Components
```
frontend/src/components/Premium/
└── PremiumComponents.jsx (NEW)
```

### Documentation
```
PREMIUM_FEATURES.md
PREMIUM_INTEGRATION_GUIDE.md
PREMIUM_IMPLEMENTATION_SUMMARY.md
COMPLETE_INTEGRATION_GUIDE.md
CONTROLLER_INTEGRATION_GUIDE.js
QUICK_START_GUIDE.md (this file)
```

---

## 🎯 What Each Component Does

| File | Purpose |
|------|---------|
| PremiumSubscription | Store subscription data (tier, status, features) |
| PremiumAnalytics | Track job views, saves, applications |
| FeaturedJob | Manage featured job listings |
| CandidateVerification | Candidate verification & badges |
| premium.service | Core business logic for all features |
| payment.service | Razorpay integration |
| premium.controller | API endpoints for premium features |
| payment.controller | Payment processing endpoints |
| cronJobs | Automated tasks (expiry, renewal, reports) |
| emailTemplates | Email notifications for users |
| aiResumeScorer | Resume analysis algorithm |

---

## 🔌 Key API Endpoints

### Subscriptions
- `POST /api/premium/subscription` - Create subscription
- `GET /api/premium/subscription` - Get current subscription
- `PUT /api/premium/subscription/upgrade` - Upgrade tier
- `DELETE /api/premium/subscription` - Cancel

### Payments
- `POST /api/payments/subscription/initialize` - Start payment
- `POST /api/payments/subscription/verify` - Verify payment
- `POST /api/payments/webhook` - Razorpay webhook

### Featured Jobs
- `POST /api/premium/featured-jobs` - Feature a job
- `GET /api/premium/featured-jobs` - List featured jobs

### Analytics
- `GET /api/premium/analytics` - Get user analytics
- `GET /api/premium/analytics/jobs/:jobId` - Job-specific analytics

### Verification
- `POST /api/premium/verification/initialize` - Start verification
- `POST /api/premium/verification/verify-email` - Verify email
- `GET /api/premium/verification/status` - Check status

---

## 💰 Pricing Tiers

### Employers
- **FREE**: 2 jobs/month
- **BASIC** ₹999: 10 jobs + 2 featured + analytics
- **PROFESSIONAL** ₹2,999: 50 jobs + 10 featured + screening
- **ENTERPRISE** ₹9,999: Unlimited + priority support

### Candidates
- **FREE**: Basic features
- **BASIC** ₹299: Profile verification + badge
- **PROFESSIONAL** ₹799: AI resume optimization
- **ENTERPRISE** ₹2,499: All premium features

---

## ⏰ Automated Tasks (Cron Jobs)

```
00:00 UTC Daily  → Expire featured jobs
01:00 UTC Daily  → Expire subscriptions
09:00 UTC Mon    → Send renewal reminders
18:00 UTC Fri    → Send analytics reports
03:00 UTC Daily  → Cleanup old data
```

---

## 🧪 Test Payment Flow

1. **Create subscription**
   ```
   POST /api/payments/subscription/initialize
   ```

2. **Razorpay modal opens** with test card
   - Card: 4111 1111 1111 1111
   - Exp: 12/25
   - CVV: 123

3. **Verify payment**
   ```
   POST /api/payments/subscription/verify
   ```

4. **Subscription created** ✅

---

## ❌ Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| Job posting limit not enforced | Add `checkJobPostingLimit` middleware |
| Analytics not tracking | Call `premiumService.trackAnalytic()` |
| Cron not running | Set `ENABLE_CRON=true` in .env |
| Payment webhook fails | Check webhook URL is public |
| Email not sending | Verify `SENDGRID_API_KEY` |

---

## 📊 Admin Dashboard Queries

```javascript
// Get all subscriptions
GET /api/premium/admin/subscriptions

// Get revenue stats
GET /api/premium/admin/revenue-stats

// Suspend subscription
PUT /api/premium/admin/suspend-subscription
```

---

## 🎓 Example: Complete Job Flow with Premium

```javascript
// 1. User creates job (checks limit with middleware)
POST /api/jobs/jobs → checkJobPostingLimit validates subscription

// 2. Premium service tracks creation
premiumService.trackAnalytic('JOB_CREATED', ...)

// 3. Job appears in listings (with featured status)
GET /api/jobs → Response includes isFeatured flag

// 4. User wants to feature job
POST /api/premium/featured-jobs

// 5. Featured job appears at top
GET /api/jobs/featured → Returns featured jobs first

// 6. Analytics tracked
- Job views → premiumService.trackAnalytic('JOB_VIEW', ...)
- Job saves → premiumService.trackAnalytic('JOB_SAVE', ...)
- Applications → premiumService.trackAnalytic('JOB_APPLY', ...)

// 7. Employer views analytics
GET /api/premium/analytics → Returns metrics

// 8. Every Friday → Automated report sent
CronJobs → generateAnalyticsReports() → Email sent
```

---

## ✨ Features Ready to Use

✅ Subscription management with 4 tiers
✅ Payment processing (Razorpay)
✅ Featured jobs with priority display
✅ Real-time analytics tracking
✅ Candidate verification system
✅ Email notifications
✅ Admin revenue dashboard
✅ Automated cron jobs
✅ AI resume scoring
✅ Role-based access control

---

## 📈 Next: Advanced Features (Optional)

- Custom branding for enterprise
- API access for integrations
- Advanced candidate screening
- Salary benchmarking
- Competitor analysis
- White-label solutions
- Mobile app integration

---

## 🚀 Deploy to Production

1. Set real Razorpay credentials
2. Configure email service
3. Setup database indexes
4. Configure webhook
5. Enable cron jobs
6. Monitor logs
7. Test end-to-end

---

## 💡 Pro Tips

1. **Test Mode First**: Use Razorpay test credentials during development
2. **Monitor Logs**: Watch cron job logs for issues
3. **Email Templates**: Customize email templates for branding
4. **Analytics**: Use daily reports to optimize features
5. **Pricing**: Monitor churn to adjust pricing strategy

---

## 🎯 Success Metrics

Track these after launch:
- Conversion rate (Free → Premium)
- Average revenue per user
- Monthly recurring revenue
- Churn rate
- Featured job ROI
- Customer satisfaction

---

## 📞 Need Help?

1. Check `COMPLETE_INTEGRATION_GUIDE.md` for detailed steps
2. Review `CONTROLLER_INTEGRATION_GUIDE.js` for code examples
3. Check logs: `tail -f logs/app.log`
4. Test endpoints with Postman
5. Review error messages in responses

---

**🎉 You're all set! Premium features are ready to launch.**

