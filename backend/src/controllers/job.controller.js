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

function normalizeTextValue(value) {
  return String(value ?? '').trim();
}

function buildTextMatch(value) {
  const cleaned = normalizeTextValue(value);
  if (!cleaned) return null;
  return { $regex: `^${cleaned}$`, $options: 'i' };
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

  const categoryFilter = buildTextMatch(query.category);
  const industryFilter = buildTextMatch(query.industry);
  const locationFilter = buildTextMatch(query.location);
  const jobTypeFilter = buildTextMatch(query.jobType);

  if (categoryFilter) filter.category = categoryFilter;
  if (industryFilter) filter.industry = industryFilter;
  if (locationFilter) filter.location = locationFilter;
  if (jobTypeFilter) filter.jobType = jobTypeFilter;

  return filter;
}

const listJobs = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page || 1), 1);
  const limit = Math.max(Number(req.query.limit || 12), 1);
  const filter = buildFilter(req.query);

  const [jobs, total] = await Promise.all([
    Job.find(filter)
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

  const saveAsDraft = Boolean(req.body.saveAsDraft);

  const slug = await createUniqueSlug(Job, req.body.title, { company: employerProfile.companyName });
  const image = normalizeJobImage(req.body, req.body.title || 'Job image') || (
    employerProfile.logoUrl
      ? { url: employerProfile.logoUrl, alt: `${employerProfile.companyName} logo` }
      : null
  );
  const job = await Job.create({
    employerUser: req.user._id,
    companyName: employerProfile.companyName,
    title: req.body.title,
    slug,
    category: normalizeTextValue(req.body.category),
    industry: normalizeTextValue(req.body.industry),
    location: normalizeTextValue(req.body.location),
    jobType: normalizeTextValue(req.body.jobType),
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
    reviewStatus: saveAsDraft ? JOB_REVIEW_STATUS.DRAFT : JOB_REVIEW_STATUS.PENDING,
    status: saveAsDraft ? JOB_STATUS.DRAFT : JOB_STATUS.ACTIVE
  });

  res.status(201).json(apiResponse({
    message: saveAsDraft ? 'Job saved as draft' : 'Job submitted for admin review',
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

  const previousTitle = targetJob.title;
  const saveAsDraft = Boolean(req.body.saveAsDraft);
  const nextReviewStatus = req.user.role === ROLES.ADMIN
    ? targetJob.reviewStatus
    : saveAsDraft
      ? JOB_REVIEW_STATUS.DRAFT
      : JOB_REVIEW_STATUS.PENDING;
  const nextStatus = req.user.role === ROLES.ADMIN
    ? targetJob.status
    : saveAsDraft
      ? JOB_STATUS.DRAFT
      : JOB_STATUS.ACTIVE;

  Object.assign(targetJob, {
    title: req.body.title ?? targetJob.title,
    category: req.body.category === undefined ? targetJob.category : normalizeTextValue(req.body.category),
    industry: req.body.industry === undefined ? targetJob.industry : normalizeTextValue(req.body.industry),
    location: req.body.location === undefined ? targetJob.location : normalizeTextValue(req.body.location),
    jobType: req.body.jobType === undefined ? targetJob.jobType : normalizeTextValue(req.body.jobType),
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
    reviewStatus: nextReviewStatus,
    status: nextStatus,
    publishedAt: req.user.role === ROLES.ADMIN || saveAsDraft ? targetJob.publishedAt : undefined,
    reviewedBy: req.user.role === ROLES.ADMIN ? targetJob.reviewedBy : undefined,
    reviewedAt: req.user.role === ROLES.ADMIN ? targetJob.reviewedAt : undefined
  });

  if ('image' in req.body || 'imageUrl' in req.body || 'imageAlt' in req.body) {
    const normalizedImage = normalizeJobImage(req.body, req.body.title || targetJob.title || 'Job image');
    targetJob.image = normalizedImage || undefined;
  }

  if (req.body.title && req.body.title !== previousTitle) {
    targetJob.slug = await createUniqueSlug(Job, req.body.title, { company: targetJob.companyName });
  }

  await targetJob.save();

  res.json(apiResponse({
    message: saveAsDraft ? 'Job draft saved successfully' : 'Job updated successfully',
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
