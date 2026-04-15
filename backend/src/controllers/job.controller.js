const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const apiResponse = require('../utils/apiResponse');
const Job = require('../models/Job');
const EmployerProfile = require('../models/EmployerProfile');
const { createUniqueSlug } = require('../utils/slug');
const { JOB_REVIEW_STATUS, JOB_STATUS, ROLES } = require('../utils/constants');

function normalizeJobImage(payload, fallbackAlt = 'Job image') {
  const image = payload.image && typeof payload.image === 'object' ? payload.image : {};
  const url = String(payload.imageUrl ?? image.url ?? '').trim();
  const alt = String(payload.imageAlt ?? image.alt ?? fallbackAlt).trim();

  if (!url) return null;
  return {
    url,
    alt: alt || fallbackAlt
  };
}

function buildFilter(query) {
  const filter = {
    reviewStatus: JOB_REVIEW_STATUS.APPROVED,
    status: JOB_STATUS.ACTIVE
  };

  if (query.keyword) {
    filter.$or = [
      { title: { $regex: query.keyword, $options: 'i' } },
      { companyName: { $regex: query.keyword, $options: 'i' } },
      { description: { $regex: query.keyword, $options: 'i' } },
      { skills: { $in: [new RegExp(query.keyword, 'i')] } }
    ];
  }

  if (query.category) filter.category = query.category;
  if (query.industry) filter.industry = query.industry;
  if (query.location) filter.location = query.location;
  if (query.jobType) filter.jobType = query.jobType;

  return filter;
}

const listJobs = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page || 1), 1);
  const limit = Math.max(Number(req.query.limit || 12), 1);
  const filter = buildFilter(req.query);

  const [jobs, total] = await Promise.all([
    Job.find(filter)
      .populate('category industry location jobType')
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Job.countDocuments(filter)
  ]);

  res.json(apiResponse({
    message: 'Jobs fetched successfully',
    data: jobs,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }));
});

const getJobBySlug = asyncHandler(async (req, res) => {
  const job = await Job.findOne({ slug: req.params.slug, reviewStatus: JOB_REVIEW_STATUS.APPROVED, status: JOB_STATUS.ACTIVE })
    .populate('category industry location jobType')
    .populate('employerUser', 'name email');

  if (!job) {
    throw new AppError('Job not found', 404);
  }

  res.json(apiResponse({
    message: 'Job fetched successfully',
    data: job
  }));
});

const featuredJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find({ reviewStatus: JOB_REVIEW_STATUS.APPROVED, status: JOB_STATUS.ACTIVE })
    .populate('category industry location jobType')
    .sort({ publishedAt: -1 })
    .limit(6);

  res.json(apiResponse({
    message: 'Featured jobs fetched successfully',
    data: jobs
  }));
});

const createJob = asyncHandler(async (req, res) => {
  const employerProfile = await EmployerProfile.findOne({ user: req.user._id });
  if (!employerProfile) {
    throw new AppError('Complete your employer profile before posting jobs', 400);
  }

  const slug = await createUniqueSlug(Job, req.body.title, { company: employerProfile.companyName });
  const image = normalizeJobImage(req.body, req.body.title || 'Job image');
  const job = await Job.create({
    employerUser: req.user._id,
    companyName: employerProfile.companyName,
    title: req.body.title,
    slug,
    category: req.body.category,
    industry: req.body.industry,
    location: req.body.location,
    jobType: req.body.jobType,
    description: req.body.description,
    responsibilities: req.body.responsibilities || [],
    requirements: req.body.requirements || [],
    skills: req.body.skills || [],
    experienceLevel: req.body.experienceLevel,
    salaryMin: req.body.salaryMin,
    salaryMax: req.body.salaryMax,
    currency: req.body.currency || 'INR',
    vacancies: req.body.vacancies || 1,
    remoteFriendly: req.body.remoteFriendly || false,
    expiresAt: req.body.expiresAt,
    tags: req.body.tags || [],
    image: image || undefined,
    reviewStatus: JOB_REVIEW_STATUS.PENDING,
    status: JOB_STATUS.ACTIVE
  });

  res.status(201).json(apiResponse({
    message: 'Job submitted for admin review',
    data: job
  }));
});

const updateJob = asyncHandler(async (req, res) => {
  const job = await Job.findOne({ _id: req.params.id, employerUser: req.user._id });
  let targetJob = job;

  if (!targetJob && req.user.role === ROLES.ADMIN) {
    targetJob = await Job.findById(req.params.id);
  }

  if (!targetJob) {
    throw new AppError('Job not found', 404);
  }

  Object.assign(targetJob, {
    title: req.body.title ?? targetJob.title,
    category: req.body.category ?? targetJob.category,
    industry: req.body.industry ?? targetJob.industry,
    location: req.body.location ?? targetJob.location,
    jobType: req.body.jobType ?? targetJob.jobType,
    description: req.body.description ?? targetJob.description,
    responsibilities: req.body.responsibilities ?? targetJob.responsibilities,
    requirements: req.body.requirements ?? targetJob.requirements,
    skills: req.body.skills ?? targetJob.skills,
    experienceLevel: req.body.experienceLevel ?? targetJob.experienceLevel,
    salaryMin: req.body.salaryMin ?? targetJob.salaryMin,
    salaryMax: req.body.salaryMax ?? targetJob.salaryMax,
    currency: req.body.currency ?? targetJob.currency,
    vacancies: req.body.vacancies ?? targetJob.vacancies,
    remoteFriendly: req.body.remoteFriendly ?? targetJob.remoteFriendly,
    expiresAt: req.body.expiresAt ?? targetJob.expiresAt,
    tags: req.body.tags ?? targetJob.tags,
    reviewStatus: req.user.role === ROLES.ADMIN ? targetJob.reviewStatus : JOB_REVIEW_STATUS.PENDING,
    publishedAt: req.user.role === ROLES.ADMIN ? targetJob.publishedAt : undefined,
    reviewedBy: req.user.role === ROLES.ADMIN ? targetJob.reviewedBy : undefined,
    reviewedAt: req.user.role === ROLES.ADMIN ? targetJob.reviewedAt : undefined
  });

  if ('image' in req.body || 'imageUrl' in req.body || 'imageAlt' in req.body) {
    const normalizedImage = normalizeJobImage(req.body, req.body.title || targetJob.title || 'Job image');
    targetJob.image = normalizedImage || undefined;
  }

  if (req.body.title && req.body.title !== targetJob.title) {
    targetJob.slug = await createUniqueSlug(Job, req.body.title, { company: targetJob.companyName });
  }

  await targetJob.save();

  res.json(apiResponse({
    message: 'Job updated successfully',
    data: targetJob
  }));
});

const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findOne({ _id: req.params.id, employerUser: req.user._id });
  let targetJob = job;

  if (!targetJob && req.user.role === ROLES.ADMIN) {
    targetJob = await Job.findById(req.params.id);
  }

  if (!targetJob) {
    throw new AppError('Job not found', 404);
  }

  await Job.deleteOne({ _id: targetJob._id });

  res.json(apiResponse({
    message: 'Job deleted successfully'
  }));
});

module.exports = {
  listJobs,
  getJobBySlug,
  featuredJobs,
  createJob,
  updateJob,
  deleteJob
};
