# Premium Features Integration Guide

## Quick Start Integration

### Step 1: Import in Job Controller
```javascript
// backend/src/controllers/job.controller.js
const premiumService = require('../services/premium.service');
const { checkJobPostingLimit } = require('../middlewares/premium.middleware');
```

### Step 2: Update Job Creation Route
```javascript
// Add middleware to check job posting limits
router.post('/jobs', 
  authMiddleware,
  roleMiddleware([ROLES.EMPLOYER]),
  checkJobPostingLimit,  // NEW: Check premium limit
  jobController.createJob
);

// In createJob controller:
exports.createJob = asyncHandler(async (req, res, next) => {
  const job = await Job.create({...jobData});
  
  // Track job posting for analytics
  await premiumService.trackAnalytic(req.user._id, 'JOB_CREATED', {
    job: job._id,
    jobTitle: job.title
  });
  
  res.status(201).json(apiResponse(201, job, 'Job created successfully'));
});
```

### Step 3: Add Featured Job Support in Job Routes
```javascript
// In job.routes.js
const { createFeaturedJob } = require('../controllers/premium.controller');

// Feature a job
router.post('/:jobId/feature',
  authMiddleware,
  roleMiddleware([ROLES.EMPLOYER]),
  createFeaturedJob
);
```

### Step 4: Update Candidate Profile Controller
```javascript
// backend/src/controllers/candidate.controller.js
const premiumService = require('../services/premium.service');

// Add verification initialization
exports.initializeProfileVerification = asyncHandler(async (req, res, next) => {
  const verification = await premiumService.createOrUpdateVerification(req.user._id);
  res.status(200).json(apiResponse(200, verification, 'Verification process started'));
});

// Add to candidate routes
router.post('/profile/verify-email',
  authMiddleware,
  roleMiddleware([ROLES.CANDIDATE]),
  candidateController.verifyEmail
);
```

### Step 5: Integrate Analytics Tracking
```javascript
// When job is viewed
exports.getJob = asyncHandler(async (req, res, next) => {
  const job = await Job.findById(req.params.jobId);
  
  // Track view
  if (req.user) {
    await premiumService.trackAnalytic(job.employer, 'JOB_VIEW', {
      job: job._id,
      viewerRole: req.user.role,
      viewerDevice: req.headers['user-agent']
    });
  }
  
  res.status(200).json(apiResponse(200, job, 'Job details fetched'));
});

// When job is saved by candidate
exports.saveJob = asyncHandler(async (req, res, next) => {
  await EmployerSavedView.create({
    user: req.user._id,
    job: req.params.jobId,
    savedAt: new Date()
  });
  
  // Track save
  const job = await Job.findById(req.params.jobId);
  await premiumService.trackAnalytic(job.employer, 'JOB_SAVE', {
    job: job._id,
    candidate: req.user._id
  });
  
  res.status(200).json(apiResponse(200, null, 'Job saved successfully'));
});

// When candidate applies
exports.applyToJob = asyncHandler(async (req, res, next) => {
  const application = await Application.create({...});
  
  // Track application
  const job = await Job.findById(req.params.jobId);
  await premiumService.trackAnalytic(job.employer, 'JOB_APPLY', {
    job: job._id,
    applicantName: req.user.name,
    applicantEmail: req.user.email,
    screeningScore: calculateScreeningScore(application)
  });
  
  res.status(201).json(apiResponse(201, application, 'Application submitted'));
});
```

### Step 6: Display Premium Badge on Job
```javascript
// In job listing/detail response
exports.getJobs = asyncHandler(async (req, res, next) => {
  const jobs = await Job.find({...});
  
  // Enrich with featured status
  const featuredJobs = new Set();
  const featured = await FeaturedJob.find({
    status: 'ACTIVE',
    featuredUntil: { $gt: new Date() }
  });
  
  featured.forEach(f => featuredJobs.add(f.job.toString()));
  
  const jobsWithFeature = jobs.map(job => ({
    ...job.toObject(),
    isFeatured: featuredJobs.has(job._id.toString()),
    featureType: 'TOP_LISTING' // or from FeaturedJob
  }));
  
  res.status(200).json(apiResponse(200, jobsWithFeature, 'Jobs fetched'));
});
```

### Step 7: Add Premium Validation Middleware
```javascript
// In job controller - validate employer can post
exports.createJob = asyncHandler(async (req, res, next) => {
  const subscription = await premiumService.getSubscription(req.user._id);
  
  if (!subscription) {
    throw new AppError('Please create a subscription to post jobs', 403);
  }
  
  const jobsUsed = subscription.usage.jobPostingsUsed;
  const limit = subscription.features.jobPostingsPerMonth;
  
  if (jobsUsed >= limit) {
    throw new AppError(
      `You have reached your job posting limit (${limit}/month). Upgrade your plan.`,
      429
    );
  }
  
  // Create job
  const job = await Job.create({...});
  
  // Update usage
  await PremiumSubscription.findByIdAndUpdate(
    subscription._id,
    { $inc: { 'usage.jobPostingsUsed': 1 } }
  );
  
  res.status(201).json(apiResponse(201, job, 'Job posted successfully'));
});
```

### Step 8: Add Email Notifications
```javascript
// When subscription is created
const emailService = require('../services/email.service');
const { subscriptionSuccessEmail } = require('../utils/emailTemplates');

await emailService.send({
  to: user.email,
  subject: 'Premium Subscription Activated',
  html: subscriptionSuccessEmail({
    name: user.name,
    tier: subscription.tier,
    role: subscription.role,
    renewalDate: subscription.endDate,
    price: subscription.monthlyPrice
  })
});

// When job is featured
const { jobFeaturedEmail } = require('../utils/emailTemplates');
const employer = await User.findById(jobId.employer);
const featured = await FeaturedJob.findOne({ job: jobId });

await emailService.send({
  to: employer.email,
  subject: 'Your job is now featured!',
  html: jobFeaturedEmail({
    employerName: employer.name,
    jobTitle: job.title,
    featuredUntil: featured.featuredUntil,
    featuredType: featured.featuredType
  })
});
```

---

## Data Structures for Frontend

### Subscription Object
```json
{
  "_id": "630a1b2c3d4e5f6g7h8i9j0k",
  "user": "630a1b2c3d4e5f6g7h8i9j0l",
  "tier": "PROFESSIONAL",
  "role": "EMPLOYER",
  "status": "ACTIVE",
  "startDate": "2024-01-15",
  "endDate": "2024-02-15",
  "monthlyPrice": 2999,
  "billingCycle": "MONTHLY",
  "features": {
    "jobPostingsPerMonth": 50,
    "featuredJobs": 10,
    "analyticsAccess": true,
    "candidateScreening": true
  },
  "usage": {
    "jobPostingsUsed": 3,
    "featuredJobsUsed": 1,
    "analyticsViews": 45
  }
}
```

### Analytics Object
```json
{
  "2024-01-15": {
    "JOB_VIEW": 120,
    "JOB_SAVE": 25,
    "JOB_APPLY": 8
  },
  "2024-01-16": {
    "JOB_VIEW": 95,
    "JOB_SAVE": 18,
    "JOB_APPLY": 5
  }
}
```

### Verification Object
```json
{
  "_id": "630a1b2c3d4e5f6g7h8i9j0k",
  "candidate": "630a1b2c3d4e5f6g7h8i9j0l",
  "emailVerified": true,
  "phoneVerified": true,
  "identityVerified": false,
  "overallVerified": true,
  "verificationBadge": true,
  "verificationScore": 75,
  "verifiedAt": "2024-01-15T10:30:00Z"
}
```

---

## Environment Variables
```env
# Payment Gateway
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Email Service
SENDGRID_API_KEY=your_sendgrid_key

# Analytics
ANALYTICS_ENABLED=true

# Subscription
SUBSCRIPTION_CHECK_INTERVAL=86400000  # 24 hours in milliseconds
```

---

## Testing Premium Features

### Test Create Subscription
```bash
curl -X POST http://localhost:5000/api/premium/subscription \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tier": "PROFESSIONAL",
    "role": "EMPLOYER",
    "billingCycle": "MONTHLY"
  }'
```

### Test Get Analytics
```bash
curl -X GET "http://localhost:5000/api/premium/analytics?metricType=JOB_VIEW&days=7" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Feature a Job
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

## Database Indexes for Performance
```javascript
// In migration/seed file
db.premiumsubscriptions.createIndex({ "user": 1, "status": 1 });
db.premiumsubscriptions.createIndex({ "endDate": 1 });
db.premiumanalytics.createIndex({ "user": 1, "date": 1 });
db.premiumanalytics.createIndex({ "job": 1, "date": 1 });
db.featuredjobs.createIndex({ "featuredUntil": 1, "status": 1 });
```

---

## Common Issues & Solutions

### Issue: Job posting limit not enforced
**Solution**: Ensure `checkJobPostingLimit` middleware is added to job creation route

### Issue: Analytics not tracking
**Solution**: Verify `premiumService.trackAnalytic()` is called in all relevant controllers

### Issue: Featured jobs not showing premium badge
**Solution**: Ensure job listing response includes featured job lookup

### Issue: Email not sending on subscription
**Solution**: Check SENDGRID_API_KEY is set and email service is initialized

---

## Next Steps

1. ✅ Models and Services created
2. ✅ API endpoints ready
3. ✅ Email templates added
4. ⏳ Frontend components (Next)
5. ⏳ Payment gateway integration (Next)
6. ⏳ Analytics dashboard (Next)
7. ⏳ Automated cron jobs (Next)

