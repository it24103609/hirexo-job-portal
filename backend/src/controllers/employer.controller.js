const fs = require('fs');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const apiResponse = require('../utils/apiResponse');
const EmployerProfile = require('../models/EmployerProfile');
const Job = require('../models/Job');
const Application = require('../models/Application');
const CandidateProfile = require('../models/CandidateProfile');
const { createUniqueSlug } = require('../utils/slug');
const { createNotification } = require('../services/notification.service');
const { sendEmail } = require('../services/email.service');
const { NOTIFICATION_TYPES, APPLICATION_STATUS } = require('../utils/constants');

function buildStatusEmail(status, interviewAt) {
  if (status === APPLICATION_STATUS.SHORTLISTED) {
    return {
      subject: 'Application shortlisted',
      text: 'Great news! Your job application has been shortlisted.'
    };
  }

  if (status === APPLICATION_STATUS.REJECTED) {
    return {
      subject: 'Application update',
      text: 'Your job application status has been updated to rejected.'
    };
  }

  if (status === APPLICATION_STATUS.INTERVIEW_SCHEDULED) {
    const whenText = interviewAt ? ` on ${new Date(interviewAt).toISOString()}` : '';
    return {
      subject: 'Interview scheduled',
      text: `Your interview has been scheduled${whenText}.`
    };
  }

  return {
    subject: 'Application status updated',
    text: `Your application status changed to ${status}.`
  };
}

const getProfile = asyncHandler(async (req, res) => {
  const profile = await EmployerProfile.findOne({ user: req.user._id }).populate('industry location');

  res.json(apiResponse({
    message: 'Employer profile fetched successfully',
    data: profile
  }));
});

const upsertProfile = asyncHandler(async (req, res) => {
  const existingProfile = await EmployerProfile.findOne({ user: req.user._id });
  const companyName = req.body.companyName || existingProfile?.companyName;
  const logoUrl = String(req.body.logoUrl || '').trim();

  if (!companyName) {
    throw new AppError('Company name is required', 400);
  }

  let slug = existingProfile?.slug;
  if (!existingProfile || (req.body.companyName && req.body.companyName !== existingProfile.companyName)) {
    slug = await createUniqueSlug(EmployerProfile, companyName, { user: req.user._id.toString() });
  }

  const profile = await EmployerProfile.findOneAndUpdate(
    { user: req.user._id },
    {
      $set: {
        companyName,
        slug,
        website: req.body.website,
        description: req.body.description,
        logoUrl: logoUrl || undefined,
        size: req.body.size,
        contactPerson: req.body.contactPerson,
        contactPhone: req.body.contactPhone,
        verified: req.body.verified,
        industry: req.body.industry,
        location: req.body.location,
        address: req.body.address
      },
      $setOnInsert: { user: req.user._id }
    },
    { new: true, upsert: true, runValidators: true }
  ).populate('industry location');

  if (req.user.name !== companyName) {
    const user = req.user;
    user.name = companyName;
    await user.save({ validateBeforeSave: false });
  }

  if (logoUrl) {
    await Job.updateMany(
      { employerUser: req.user._id },
      {
        $set: {
          image: {
            url: logoUrl,
            alt: `${companyName} logo`
          }
        }
      }
    );
  }

  res.json(apiResponse({
    message: 'Employer profile saved successfully',
    data: profile
  }));
});

const dashboard = asyncHandler(async (req, res) => {
  const [totalJobs, pendingJobs, activeJobs, totalApplications, shortlistedApplications] = await Promise.all([
    Job.countDocuments({ employerUser: req.user._id }),
    Job.countDocuments({ employerUser: req.user._id, reviewStatus: 'pending' }),
    Job.countDocuments({ employerUser: req.user._id, reviewStatus: 'approved', status: 'active' }),
    Application.countDocuments({ employerUser: req.user._id }),
    Application.countDocuments({ employerUser: req.user._id, status: APPLICATION_STATUS.SHORTLISTED })
  ]);

  res.json(apiResponse({
    message: 'Employer dashboard summary fetched successfully',
    data: {
      totalJobs,
      pendingJobs,
      activeJobs,
      totalApplications,
      shortlistedApplications
    }
  }));
});

const listMyJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find({ employerUser: req.user._id }).sort({ createdAt: -1 });
  res.json(apiResponse({
    message: 'Employer jobs fetched successfully',
    data: jobs
  }));
});

const listJobApplicants = asyncHandler(async (req, res) => {
  const {
    keyword = '',
    skills = '',
    minExperience = '',
    education = ''
  } = req.query;

  const job = await Job.findOne({ _id: req.params.jobId, employerUser: req.user._id });
  if (!job) {
    throw new AppError('Job not found', 404);
  }

  const applications = await Application.find({ job: job._id, employerUser: req.user._id })
    .populate('candidateUser', 'name email role status')
    .sort({ createdAt: -1 });

  if (!applications.length) {
    return res.json(apiResponse({
      message: 'Job applicants fetched successfully',
      data: { job, applications: [] }
    }));
  }

  const candidateIds = applications.map((item) => item.candidateUser?._id).filter(Boolean);
  const profiles = await CandidateProfile.find({ user: { $in: candidateIds } })
    .select('user skills experienceYears education headline summary currentCompany');
  const profileMap = new Map(profiles.map((profile) => [String(profile.user), profile]));

  const skillTerms = String(skills)
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  const keywordTerm = String(keyword || '').trim().toLowerCase();
  const educationTerm = String(education || '').trim().toLowerCase();
  const minExperienceValue = Number(minExperience);

  const matchesFilters = (application) => {
    const candidate = application.candidateUser || {};
    const profile = profileMap.get(String(candidate._id));

    if (keywordTerm) {
      const pool = [
        candidate.name,
        candidate.email,
        profile?.headline,
        profile?.summary,
        profile?.currentCompany
      ]
        .filter(Boolean)
        .map((value) => String(value).toLowerCase());

      if (!pool.some((entry) => entry.includes(keywordTerm))) {
        return false;
      }
    }

    if (skillTerms.length) {
      const candidateSkills = (profile?.skills || []).map((value) => String(value).toLowerCase());
      const hasSkill = skillTerms.every((term) => candidateSkills.some((skill) => skill.includes(term)));
      if (!hasSkill) return false;
    }

    if (!Number.isNaN(minExperienceValue) && String(minExperience).trim() !== '') {
      const years = Number(profile?.experienceYears || 0);
      if (years < minExperienceValue) return false;
    }

    if (educationTerm) {
      const educationList = (profile?.education || []).flatMap((entry) => [entry?.institution, entry?.degree, entry?.year]);
      const normalized = educationList.filter(Boolean).map((value) => String(value).toLowerCase());
      if (!normalized.some((entry) => entry.includes(educationTerm))) {
        return false;
      }
    }

    return true;
  };

  const enriched = applications
    .map((application) => {
      const asObject = application.toObject();
      return {
        ...asObject,
        candidateProfile: profileMap.get(String(asObject.candidateUser?._id)) || null
      };
    })
    .filter(matchesFilters);

  res.json(apiResponse({
    message: 'Job applicants fetched successfully',
    data: { job, applications: enriched }
  }));
});

const updateApplicantStatus = asyncHandler(async (req, res) => {
  const { status, notes } = req.body;
  if (!Object.values(APPLICATION_STATUS).includes(status)) {
    throw new AppError('Invalid application status', 400);
  }

  const application = await Application.findOne({ _id: req.params.applicationId, employerUser: req.user._id }).populate('candidateUser', 'email name');

  if (!application) {
    throw new AppError('Application not found', 404);
  }

  application.status = status;
  application.notes = notes || application.notes;

  if (status === APPLICATION_STATUS.REVIEWED) {
    application.viewedAt = new Date();
  }

  if (status === APPLICATION_STATUS.INTERVIEW_SCHEDULED) {
    const interviewAt = req.body.interviewScheduledAt || req.body.interview?.scheduledAt;
    if (!interviewAt) {
      throw new AppError('Interview date and time is required', 400);
    }

    application.interviewScheduledAt = new Date(interviewAt);
    application.interviewMode = req.body.interviewMode || req.body.interview?.mode || application.interviewMode;
    application.interviewLocation = req.body.interviewLocation || req.body.interview?.location || application.interviewLocation;
    application.interviewMeetingLink = req.body.interviewMeetingLink || req.body.interview?.meetingLink || application.interviewMeetingLink;
    application.interviewNotes = req.body.interviewNotes || req.body.interview?.notes || application.interviewNotes;
  }

  if (status === APPLICATION_STATUS.SHORTLISTED) {
    application.shortlistedAt = new Date();
  }

  if (status === APPLICATION_STATUS.REJECTED) {
    application.rejectedAt = new Date();
  }

  await application.save();

  await createNotification({
    userId: application.candidateUser._id,
    type: NOTIFICATION_TYPES.STATUS_UPDATE,
    title: 'Application status updated',
    message: `Your application status changed to ${status}.`,
    metadata: { applicationId: application._id }
  });

  if (status === APPLICATION_STATUS.INTERVIEW_SCHEDULED) {
    await createNotification({
      userId: application.candidateUser._id,
      type: NOTIFICATION_TYPES.INTERVIEW,
      title: 'Interview scheduled',
      message: `Interview scheduled on ${application.interviewScheduledAt?.toISOString()}.`,
      metadata: {
        applicationId: application._id,
        interviewScheduledAt: application.interviewScheduledAt,
        interviewMode: application.interviewMode,
        interviewLocation: application.interviewLocation,
        interviewMeetingLink: application.interviewMeetingLink
      }
    });
  }

  const statusEmail = buildStatusEmail(status, application.interviewScheduledAt);
  await sendEmail({
    to: application.candidateUser.email,
    subject: statusEmail.subject,
    text: statusEmail.text
  });

  res.json(apiResponse({
    message: 'Application status updated successfully',
    data: application
  }));
});

module.exports = {
  getProfile,
  upsertProfile,
  dashboard,
  listMyJobs,
  listJobApplicants,
  updateApplicantStatus
};
