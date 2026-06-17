const connectDB = require('../config/db');
const { env, assertEnv } = require('../config/env');
const Job = require('../models/Job');
const FeaturedJob = require('../models/FeaturedJob');
const { JOB_REVIEW_STATUS, JOB_STATUS } = require('./constants');

async function seedFeaturedJobs() {
  assertEnv();
  await connectDB(env.mongoUri);

  console.log('Fetching active, approved jobs from MongoDB...');
  
  // Get active, approved jobs sorted by published date
  const jobs = await Job.find({
    reviewStatus: JOB_REVIEW_STATUS.APPROVED,
    status: JOB_STATUS.ACTIVE
  })
  .sort({ publishedAt: -1 })
  .limit(10);

  console.log(`Found ${jobs.length} active jobs`);

  if (jobs.length === 0) {
    console.log('No active jobs found. Please run seed:demo-content first.');
    process.exit(1);
  }

  // Clear existing featured jobs to avoid duplicates
  await FeaturedJob.deleteMany({});
  console.log('Cleared existing featured jobs');

  // Create featured job entries
  const featuredJobs = [];
  const featuredUntil = new Date();
  featuredUntil.setDate(featuredUntil.getDate() + 30); // Feature for 30 days

  for (let i = 0; i < Math.min(jobs.length, 6); i++) {
    const job = jobs[i];
    
    // Check if featured job already exists
    const existing = await FeaturedJob.findOne({ job: job._id });
    
    if (!existing) {
      const featuredJob = await FeaturedJob.create({
        job: job._id,
        employer: job.employerUser,
        featuredUntil: featuredUntil,
        featuredType: 'TOP_LISTING',
        displayPriority: i + 1,
        status: 'ACTIVE'
      });
      featuredJobs.push(featuredJob);
      console.log(`Created featured job: ${job.title} (Priority: ${i + 1})`);
    } else {
      console.log(`Featured job already exists: ${job.title}`);
    }
  }

  console.log(`Successfully seeded ${featuredJobs.length} featured jobs from MongoDB`);
  process.exit(0);
}

seedFeaturedJobs().catch((error) => {
  console.error('Error seeding featured jobs:', error);
  process.exit(1);
});
