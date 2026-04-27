const asyncHandler = require('../utils/asyncHandler');
const apiResponse = require('../utils/apiResponse');
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Blog = require('../models/Blog');
const Contact = require('../models/Contact');
const EmployerProfile = require('../models/EmployerProfile');
const CandidateProfile = require('../models/CandidateProfile');
const PlatformSetting = require('../models/PlatformSetting');
const { JOB_REVIEW_STATUS, JOB_STATUS, ROLES, USER_STATUS, APPLICATION_STATUS } = require('../utils/constants');
const { createNotification } = require('../services/notification.service');
const { sendEmail } = require('../services/email.service');

const DEFAULT_AI_SCORING = {
  skillsWeight: 60,
  experienceWeight: 20,
  locationWeight: 10,
  profileWeight: 10,
  highFitThreshold: 80,
  moderateFitThreshold: 60
};

function normalizeAiScoring(input = {}) {
  const base = { ...DEFAULT_AI_SCORING, ...(input || {}) };
  const toNumber = (value, fallback) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  const skillsWeight = Math.max(0, Math.min(100, toNumber(base.skillsWeight, DEFAULT_AI_SCORING.skillsWeight)));
  const experienceWeight = Math.max(0, Math.min(100, toNumber(base.experienceWeight, DEFAULT_AI_SCORING.experienceWeight)));
  const locationWeight = Math.max(0, Math.min(100, toNumber(base.locationWeight, DEFAULT_AI_SCORING.locationWeight)));
  const profileWeight = Math.max(0, Math.min(100, toNumber(base.profileWeight, DEFAULT_AI_SCORING.profileWeight)));

  let highFitThreshold = Math.max(1, Math.min(100, toNumber(base.highFitThreshold, DEFAULT_AI_SCORING.highFitThreshold)));
  let moderateFitThreshold = Math.max(1, Math.min(100, toNumber(base.moderateFitThreshold, DEFAULT_AI_SCORING.moderateFitThreshold)));

  if (moderateFitThreshold >= highFitThreshold) {
    moderateFitThreshold = Math.max(1, highFitThreshold - 1);
  }

  return {
    skillsWeight,
    experienceWeight,
    locationWeight,
    profileWeight,
    highFitThreshold,
    moderateFitThreshold
  };
}

function getPeriodStart(days) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - days + 1);
  return date;
}

const dashboard = asyncHandler(async (req, res) => {
  const [totalJobs, activeJobs, pendingJobs, totalEmployers, totalCandidates, totalApplications, totalBlogs, publishedBlogs, totalContacts, newContacts] = await Promise.all([
    Job.countDocuments(),
    Job.countDocuments({ reviewStatus: JOB_REVIEW_STATUS.APPROVED, status: JOB_STATUS.ACTIVE }),
    Job.countDocuments({ reviewStatus: JOB_REVIEW_STATUS.PENDING }),
    User.countDocuments({ role: ROLES.EMPLOYER }),
    User.countDocuments({ role: ROLES.CANDIDATE }),
    Application.countDocuments(),
    Blog.countDocuments(),
    Blog.countDocuments({ published: true }),
    Contact.countDocuments(),
    Contact.countDocuments({ status: 'new' })
  ]);

  res.json(apiResponse({
    message: 'Admin dashboard fetched successfully',
    data: {
      totalJobs,
      activeJobs,
      pendingJobs,
      totalEmployers,
      totalCandidates,
      totalApplications,
      totalBlogs,
      publishedBlogs,
      totalContacts,
      newContacts
    }
  }));
});

const listUsers = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.status) filter.status = req.query.status;

  const users = await User.find(filter).sort({ createdAt: -1 });
  res.json(apiResponse({
    message: 'Users fetched successfully',
    data: users
  }));
});

const blockUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { status: USER_STATUS.BLOCKED }, { new: true });
  res.json(apiResponse({
    message: 'User blocked successfully',
    data: user
  }));
});

const unblockUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { status: USER_STATUS.ACTIVE }, { new: true });
  res.json(apiResponse({
    message: 'User unblocked successfully',
    data: user
  }));
});

const listPendingJobs = asyncHandler(async (req, res) => {
  const requestedStatus = String(req.query.status || '').trim().toLowerCase();
  const allowedStatuses = Object.values(JOB_REVIEW_STATUS);
  const filter = {};

  if (!requestedStatus) {
    // Keep old behavior by default: show only pending jobs.
    filter.reviewStatus = JOB_REVIEW_STATUS.PENDING;
  } else if (requestedStatus !== 'all') {
    if (!allowedStatuses.includes(requestedStatus)) {
      throw new (require('../utils/AppError'))('Invalid review status filter', 400);
    }
    filter.reviewStatus = requestedStatus;
  }

  const [jobs, pendingCount, approvedCount, rejectedCount, totalCount] = await Promise.all([
    Job.find(filter)
      .populate('employerUser', 'name email')
      .sort({ createdAt: -1 }),
    Job.countDocuments({ reviewStatus: JOB_REVIEW_STATUS.PENDING }),
    Job.countDocuments({ reviewStatus: JOB_REVIEW_STATUS.APPROVED }),
    Job.countDocuments({ reviewStatus: JOB_REVIEW_STATUS.REJECTED }),
    Job.countDocuments()
  ]);

  res.json(apiResponse({
    message: 'Pending jobs fetched successfully',
    data: jobs,
    meta: {
      status: requestedStatus || JOB_REVIEW_STATUS.PENDING,
      counts: {
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        all: totalCount
      }
    }
  }));
});

const approveJob = asyncHandler(async (req, res) => {
  const job = await Job.findByIdAndUpdate(
    req.params.id,
    {
      reviewStatus: JOB_REVIEW_STATUS.APPROVED,
      status: JOB_STATUS.ACTIVE,
      reviewedBy: req.user._id,
      reviewedAt: new Date(),
      publishedAt: new Date()
    },
    { new: true }
  );

  if (job) {
    await createNotification({
      userId: job.employerUser,
      type: 'job_review',
      title: 'Job approved',
      message: `Your job ${job.title} has been approved and published.`,
      metadata: { jobId: job._id }
    });

    const employer = await EmployerProfile.findOne({ user: job.employerUser }).populate('user');
    const employerEmail = employer?.user?.email || (await User.findById(job.employerUser).select('email'))?.email;
    if (employerEmail) {
      await sendEmail({
        to: employerEmail,
        subject: 'Job approved',
        text: `Your job ${job.title} has been approved.`
      });
    }
  }

  res.json(apiResponse({
    message: 'Job approved successfully',
    data: job
  }));
});

const rejectJob = asyncHandler(async (req, res) => {
  const job = await Job.findByIdAndUpdate(
    req.params.id,
    {
      reviewStatus: JOB_REVIEW_STATUS.REJECTED,
      status: JOB_STATUS.INACTIVE,
      reviewedBy: req.user._id,
      reviewedAt: new Date()
    },
    { new: true }
  );

  if (job) {
    await createNotification({
      userId: job.employerUser,
      type: 'job_review',
      title: 'Job rejected',
      message: `Your job ${job.title} has been rejected.`,
      metadata: { jobId: job._id }
    });
  }

  res.json(apiResponse({
    message: 'Job rejected successfully',
    data: job
  }));
});

const listApplications = asyncHandler(async (req, res) => {
  const requestedStatus = String(req.query.status || '').trim().toLowerCase();
  const allowedStatuses = Object.values(APPLICATION_STATUS);
  const filter = {};

  if (requestedStatus && requestedStatus !== 'all') {
    if (!allowedStatuses.includes(requestedStatus)) {
      throw new (require('../utils/AppError'))('Invalid application status filter', 400);
    }
    filter.status = requestedStatus;
  }

  const [applications, pendingCount, reviewedCount, shortlistedCount, rejectedCount, interviewCount, totalCount] = await Promise.all([
    Application.find(filter)
      .populate('job', 'title companyName')
      .populate('candidateUser', 'name email')
      .populate('employerUser', 'name email')
      .sort({ createdAt: -1 })
      .limit(200),
    Application.countDocuments({ status: APPLICATION_STATUS.PENDING }),
    Application.countDocuments({ status: APPLICATION_STATUS.REVIEWED }),
    Application.countDocuments({ status: APPLICATION_STATUS.SHORTLISTED }),
    Application.countDocuments({ status: APPLICATION_STATUS.REJECTED }),
    Application.countDocuments({ status: APPLICATION_STATUS.INTERVIEW_SCHEDULED }),
    Application.countDocuments()
  ]);

  res.json(apiResponse({
    message: 'Applications fetched successfully',
    data: applications,
    meta: {
      status: requestedStatus || 'all',
      counts: {
        pending: pendingCount,
        reviewed: reviewedCount,
        shortlisted: shortlistedCount,
        rejected: rejectedCount,
        interview_scheduled: interviewCount,
        all: totalCount
      }
    }
  }));
});

const listBlogs = asyncHandler(async (req, res) => {
  const blogs = await Blog.find()
    .populate('author', 'name email')
    .sort({ createdAt: -1 });

  const total = await Blog.countDocuments();
  res.json(apiResponse({
    message: 'Blogs fetched successfully',
    data: blogs,
    total
  }));
});

const deleteBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    const AppError = require('../utils/AppError');
    throw new AppError('Blog not found', 404);
  }

  await Blog.deleteOne({ _id: req.params.id });

  res.json(apiResponse({
    message: 'Blog deleted successfully',
    data: null
  }));
});

const listContacts = asyncHandler(async (req, res) => {
  const { status, skip = 0, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const contacts = await Contact.find(filter)
    .sort({ createdAt: -1 })
    .skip(parseInt(skip))
    .limit(parseInt(limit));

  const stats = {
    new: await Contact.countDocuments({ status: 'new' }),
    read: await Contact.countDocuments({ status: 'read' }),
    replied: await Contact.countDocuments({ status: 'replied' }),
    total: await Contact.countDocuments()
  };

  res.json(apiResponse({
    message: 'Contacts fetched successfully',
    data: contacts,
    stats,
    pagination: { skip: parseInt(skip), limit: parseInt(limit), total: stats.total }
  }));
});

const deleteContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id);
  if (!contact) {
    const AppError = require('../utils/AppError');
    throw new AppError('Contact not found', 404);
  }

  await Contact.deleteOne({ _id: req.params.id });

  res.json(apiResponse({
    message: 'Contact deleted successfully',
    data: null
  }));
});

const reports = asyncHandler(async (req, res) => {
  const [applicationsPerJobAgg, employerUsers, jobActivityAgg, applicationActivityAgg, candidateTotal, candidateThisMonth, candidateLast30DaysAgg] = await Promise.all([
    Application.aggregate([
      {
        $group: {
          _id: '$job',
          applications: { $sum: 1 },
          shortlisted: {
            $sum: {
              $cond: [{ $eq: ['$status', 'shortlisted'] }, 1, 0]
            }
          },
          rejected: {
            $sum: {
              $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0]
            }
          },
          pending: {
            $sum: {
              $cond: [{ $eq: ['$status', 'pending'] }, 1, 0]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'jobs',
          localField: '_id',
          foreignField: '_id',
          as: 'job'
        }
      },
      { $unwind: '$job' },
      {
        $project: {
          _id: 0,
          jobId: '$job._id',
          title: '$job.title',
          companyName: '$job.companyName',
          employerUser: '$job.employerUser',
          applications: 1,
          shortlisted: 1,
          rejected: 1,
          pending: 1
        }
      },
      { $sort: { applications: -1, title: 1 } },
      { $limit: 20 }
    ]),
    User.find({ role: ROLES.EMPLOYER }).select('_id name email lastLoginAt').lean(),
    Job.aggregate([
      {
        $group: {
          _id: '$employerUser',
          jobsPosted: { $sum: 1 },
          pendingReviewJobs: {
            $sum: {
              $cond: [{ $eq: ['$reviewStatus', JOB_REVIEW_STATUS.PENDING] }, 1, 0]
            }
          },
          approvedJobs: {
            $sum: {
              $cond: [{ $eq: ['$reviewStatus', JOB_REVIEW_STATUS.APPROVED] }, 1, 0]
            }
          },
          activeJobs: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$reviewStatus', JOB_REVIEW_STATUS.APPROVED] },
                    { $eq: ['$status', JOB_STATUS.ACTIVE] }
                  ]
                },
                1,
                0
              ]
            }
          },
          lastJobPostedAt: { $max: '$createdAt' }
        }
      }
    ]),
    Application.aggregate([
      {
        $group: {
          _id: '$employerUser',
          totalApplicationsReceived: { $sum: 1 },
          lastApplicationAt: { $max: '$createdAt' }
        }
      }
    ]),
    User.countDocuments({ role: ROLES.CANDIDATE }),
    User.countDocuments({ role: ROLES.CANDIDATE, createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } }),
    User.aggregate([
      {
        $match: {
          role: ROLES.CANDIDATE,
          createdAt: { $gte: getPeriodStart(30) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ])
  ]);

  const employerMap = new Map(employerUsers.map((user) => [String(user._id), user]));
  const jobActivityMap = new Map(jobActivityAgg.map((item) => [String(item._id), item]));
  const applicationActivityMap = new Map(applicationActivityAgg.map((item) => [String(item._id), item]));

  const employerActivity = employerUsers
    .map((user) => {
      const jobActivity = jobActivityMap.get(String(user._id)) || {};
      const applicationActivity = applicationActivityMap.get(String(user._id)) || {};
      return {
        employerUserId: user._id,
        name: user.name,
        email: user.email,
        jobsPosted: jobActivity.jobsPosted || 0,
        pendingReviewJobs: jobActivity.pendingReviewJobs || 0,
        approvedJobs: jobActivity.approvedJobs || 0,
        activeJobs: jobActivity.activeJobs || 0,
        totalApplicationsReceived: applicationActivity.totalApplicationsReceived || 0,
        lastJobPostedAt: jobActivity.lastJobPostedAt || null,
        lastApplicationAt: applicationActivity.lastApplicationAt || null,
        lastLoginAt: user.lastLoginAt || null
      };
    })
    .sort((a, b) => {
      if (b.totalApplicationsReceived !== a.totalApplicationsReceived) {
        return b.totalApplicationsReceived - a.totalApplicationsReceived;
      }
      return b.jobsPosted - a.jobsPosted;
    });

  const applicationsPerJob = applicationsPerJobAgg.map((item) => {
    const employer = employerMap.get(String(item.employerUser));
    return {
      ...item,
      employerName: employer?.name || 'Unknown employer',
      employerEmail: employer?.email || '-'
    };
  });

  const candidateRegistrations = {
    total: candidateTotal,
    thisMonth: candidateThisMonth,
    last30Days: candidateLast30DaysAgg.map((item) => ({
      date: `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`,
      count: item.count
    }))
  };

  res.json(apiResponse({
    message: 'Admin reports fetched successfully',
    data: {
      applicationsPerJob,
      employerActivity,
      candidateRegistrations
    }
  }));
});

const getSettings = asyncHandler(async (req, res) => {
  const settings = await PlatformSetting.findOne({ key: 'default' }).lean();

  res.json(apiResponse({
    message: 'Platform settings fetched successfully',
    data: {
      aiScoring: normalizeAiScoring(settings?.aiScoring)
    }
  }));
});

const updateSettings = asyncHandler(async (req, res) => {
  const nextAiScoring = normalizeAiScoring(req.body?.aiScoring || {});

  const settings = await PlatformSetting.findOneAndUpdate(
    { key: 'default' },
    {
      $set: {
        aiScoring: nextAiScoring
      },
      $setOnInsert: { key: 'default' }
    },
    { new: true, upsert: true, runValidators: true }
  ).lean();

  res.json(apiResponse({
    message: 'Platform settings updated successfully',
    data: {
      aiScoring: normalizeAiScoring(settings?.aiScoring)
    }
  }));
});

module.exports = {
  dashboard,
  listUsers,
  blockUser,
  unblockUser,
  listPendingJobs,
  listApplications,
  approveJob,
  rejectJob,
  listBlogs,
  deleteBlog,
  listContacts,
  deleteContact,
  reports,
  getSettings,
  updateSettings
};
