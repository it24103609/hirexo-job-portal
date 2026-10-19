/**
 * Premium Integration Code for Existing Controllers
 * 
 * Add this code to your existing controllers to enable premium features
 */

// ============ FOR JOB CONTROLLER ============
// At the top of job.controller.js, add these imports:
/*
const premiumService = require('../services/premium.service');
const { checkJobPostingLimit } = require('../middlewares/premium.middleware');
*/

// Update the createJob function to include this after job creation:
const createJobWithPremium = `
  // EXISTING CODE...
  const job = await Job.create({...jobData});

  // NEW: Track job posting for analytics
  try {
    await premiumService.trackAnalytic(req.user._id, 'JOB_CREATED', {
      job: job._id,
      jobTitle: job.title
    });
  } catch (error) {
    console.error('Failed to track job creation analytics:', error);
  }

  res.status(201).json(apiResponse({...}));
`;

// In job.routes.js, update the createJob route:
const createJobRoute = `
router.post('/jobs',
  authMiddleware,
  roleMiddleware([ROLES.EMPLOYER]),
  checkJobPostingLimit,  // NEW: Check premium limit
  jobController.createJob
);
`;

// Add this route to display featured jobs:
const featuredJobsRoute = `
router.get('/featured', 
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const result = await premiumService.getFeaturedJobs(parseInt(page), parseInt(limit));
    
    res.status(200).json(apiResponse(200, result.featured, 'Featured jobs fetched', {
      page,
      limit,
      total: result.total,
      pages: result.pages
    }));
  })
);
`;

// ============ FOR APPLICATION CONTROLLER ============
// At the top of application.controller.js, add:
/*
const premiumService = require('../services/premium.service');
*/

// Update getJobs to track views:
const getJobsWithTracking = `
exports.getJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find({...});

  // NEW: Track job views for analytics
  if (req.user) {
    for (const job of jobs) {
      try {
        await premiumService.trackAnalytic(job.employer, 'JOB_VIEW', {
          job: job._id,
          viewerRole: req.user.role,
          viewerDevice: req.get('user-agent')
        });
      } catch (error) {
        console.error('Failed to track view:', error);
      }
    }
  }

  res.json(apiResponse({...}));
});
`;

// Track job saves:
const saveJobWithTracking = `
exports.saveJob = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  
  const saved = await CandidateSavedJob.create({
    user: req.user._id,
    job: jobId
  });

  // NEW: Track save analytics
  try {
    const job = await Job.findById(jobId);
    await premiumService.trackAnalytic(job.employer, 'JOB_SAVE', {
      job: jobId,
      candidate: req.user._id
    });
  } catch (error) {
    console.error('Failed to track save:', error);
  }

  res.status(201).json(apiResponse(201, saved, 'Job saved successfully'));
});
`;

// Track applications:
const applyWithTracking = `
exports.applyJob = asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  const application = await Application.create({
    candidate: req.user._id,
    job: jobId,
    ...req.body
  });

  // NEW: Track application analytics
  try {
    const job = await Job.findById(jobId);
    const candidate = await User.findById(req.user._id);
    
    // Calculate screening score if provided
    let screeningScore = 0;
    if (req.body.screeningAnswers) {
      screeningScore = calculateScreeningScore(req.body.screeningAnswers);
    }

    await premiumService.trackAnalytic(job.employer, 'JOB_APPLY', {
      job: jobId,
      applicantName: candidate.name,
      applicantEmail: candidate.email,
      screeningScore
    });
  } catch (error) {
    console.error('Failed to track application:', error);
  }

  res.status(201).json(apiResponse(201, application, 'Application submitted'));
});
`;

// ============ FOR CANDIDATE CONTROLLER ============
// Add this route to initialize verification:
const initVerificationRoute = `
router.post('/profile/verify-initialize',
  authMiddleware,
  roleMiddleware([ROLES.CANDIDATE]),
  asyncHandler(async (req, res) => {
    const premiumService = require('../services/premium.service');
    const verification = await premiumService.createOrUpdateVerification(req.user._id);
    res.status(200).json(apiResponse(200, verification, 'Verification initialized'));
  })
);

router.post('/profile/verify-email',
  authMiddleware,
  roleMiddleware([ROLES.CANDIDATE]),
  asyncHandler(async (req, res) => {
    const premiumService = require('../services/premium.service');
    const verification = await premiumService.verifyEmail(req.user._id);
    res.status(200).json(apiResponse(200, verification, 'Email verified'));
  })
);
`;

// ============ ENHANCE JOB LISTING TO SHOW FEATURED STATUS ============
const enrichJobWithFeaturedStatus = `
const enrichJobsWithFeatures = async (jobs) => {
  const FeaturedJob = require('../models/FeaturedJob');
  
  const featured = await FeaturedJob.find({
    job: { $in: jobs.map(j => j._id) },
    status: 'ACTIVE',
    featuredUntil: { $gt: new Date() }
  });

  const featuredMap = new Map();
  featured.forEach(f => {
    featuredMap.set(f.job.toString(), {
      isFeatured: true,
      featureType: f.featuredType,
      displayPriority: f.displayPriority,
      impressions: f.impressions,
      clicks: f.clicks,
      applications: f.applications
    });
  });

  return jobs.map(job => ({
    ...job.toObject(),
    featured: featuredMap.get(job._id.toString()) || { isFeatured: false }
  }));
};

// Use in getJobs:
exports.getJobs = asyncHandler(async (req, res) => {
  let jobs = await Job.find({...});
  
  // NEW: Enrich with featured status
  jobs = await enrichJobsWithFeatures(jobs);
  
  // Sort featured jobs to top
  jobs.sort((a, b) => {
    if (a.featured.isFeatured && !b.featured.isFeatured) return -1;
    if (!a.featured.isFeatured && b.featured.isFeatured) return 1;
    return (b.featured.displayPriority || 999) - (a.featured.displayPriority || 999);
  });

  res.json(apiResponse({...jobs}));
});
`;

// ============ ENVIRONMENT VARIABLES TO ADD ============
const envVariables = `
# Payment Gateway - Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Email Service
SENDGRID_API_KEY=your_sendgrid_api_key

# Cron Jobs
ENABLE_CRON=true  # Set to false in development if not needed

# Feature Flags
PREMIUM_FEATURES_ENABLED=true
ANALYTICS_ENABLED=true
FEATURED_JOBS_ENABLED=true
`;

module.exports = {
  integrationGuide: {
    jobController: {
      createJobWithPremium,
      createJobRoute,
      featuredJobsRoute,
      enrichJobWithFeaturedStatus
    },
    applicationController: {
      getJobsWithTracking,
      saveJobWithTracking,
      applyWithTracking
    },
    candidateController: {
      initVerificationRoute
    },
    environmentVariables: envVariables
  }
};
