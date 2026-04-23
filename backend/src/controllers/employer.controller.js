const fs = require('fs');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const apiResponse = require('../utils/apiResponse');
const EmployerProfile = require('../models/EmployerProfile');
const Job = require('../models/Job');
const Application = require('../models/Application');
const CandidateProfile = require('../models/CandidateProfile');
const PlatformSetting = require('../models/PlatformSetting');
const { createUniqueSlug } = require('../utils/slug');
const { buildInterviewCalendarInvite } = require('../utils/interviewCalendar');
const { DEFAULT_AI_SCORING, buildAiExplanation } = require('../utils/aiScoring');
const { createNotification, notifyAdmins } = require('../services/notification.service');
const { sendEmail } = require('../services/email.service');
const { NOTIFICATION_TYPES, APPLICATION_STATUS } = require('../utils/constants');

async function getAiScoringSettings() {
  const settings = await PlatformSetting.findOne({ key: 'default' }).lean();
  return { ...DEFAULT_AI_SCORING, ...(settings?.aiScoring || {}) };
}

function normalizeInterviewSlot(slot = {}) {
  const startsAt = slot.startsAt || slot.start || slot.interviewScheduledAt;
  const endsAt = slot.endsAt || slot.end;

  if (!startsAt) {
    throw new AppError('Interview slot start time is required', 400);
  }

  const normalizedStart = new Date(startsAt);
  if (Number.isNaN(normalizedStart.getTime())) {
    throw new AppError('Interview slot start time is invalid', 400);
  }

  const normalizedEnd = endsAt ? new Date(endsAt) : new Date(normalizedStart.getTime() + (45 * 60 * 1000));
  if (Number.isNaN(normalizedEnd.getTime()) || normalizedEnd <= normalizedStart) {
    throw new AppError('Interview slot end time must be after the start time', 400);
  }

  return {
    startsAt: normalizedStart,
    endsAt: normalizedEnd,
    mode: slot.mode || 'video',
    location: slot.location || '',
    meetingLink: slot.meetingLink || '',
    notes: slot.notes || '',
    isBooked: Boolean(slot.isBooked),
    bookedAt: slot.bookedAt || null
  };
}

function serializeCalendarEvent(application) {
  const candidateName = application.candidateUser?.name || 'Candidate';
  const jobTitle = application.job?.title || 'Role';
  const companyName = application.job?.companyName || 'Company';

  const scheduledEvent = application.interviewScheduledAt
    ? [{
        type: 'scheduled',
        id: `scheduled-${application._id}`,
        applicationId: application._id,
        jobId: application.job?._id || application.job,
        candidateName,
        jobTitle,
        companyName,
        startsAt: application.interviewScheduledAt,
        endsAt: application.interviewSlots?.find((slot) => slot.isBooked)?.endsAt || new Date(new Date(application.interviewScheduledAt).getTime() + (45 * 60 * 1000)),
        mode: application.interviewMode || 'video',
        location: application.interviewLocation || '',
        meetingLink: application.interviewMeetingLink || '',
        notes: application.interviewNotes || '',
        status: application.status
      }]
    : [];

  const slotEvents = (application.interviewSlots || []).map((slot) => ({
    type: slot.isBooked ? 'booked_slot' : 'slot',
    id: String(slot._id),
    applicationId: application._id,
    jobId: application.job?._id || application.job,
    candidateName,
    jobTitle,
    companyName,
    startsAt: slot.startsAt,
    endsAt: slot.endsAt,
    mode: slot.mode,
    location: slot.location || '',
    meetingLink: slot.meetingLink || '',
    notes: slot.notes || '',
    status: application.status,
    isBooked: slot.isBooked
  }));

  return [...scheduledEvent, ...slotEvents];
}

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

  if (status === APPLICATION_STATUS.HIRED) {
    return {
      subject: 'Offer progression update',
      text: 'Congratulations! Your application has been moved to hired.'
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
  const [totalJobs, pendingJobs, activeJobs, totalApplications, shortlistedApplications, hiredApplications] = await Promise.all([
    Job.countDocuments({ employerUser: req.user._id }),
    Job.countDocuments({ employerUser: req.user._id, reviewStatus: 'pending' }),
    Job.countDocuments({ employerUser: req.user._id, reviewStatus: 'approved', status: 'active' }),
    Application.countDocuments({ employerUser: req.user._id }),
    Application.countDocuments({ employerUser: req.user._id, status: APPLICATION_STATUS.SHORTLISTED }),
    Application.countDocuments({ employerUser: req.user._id, status: APPLICATION_STATUS.HIRED })
  ]);

  res.json(apiResponse({
    message: 'Employer dashboard summary fetched successfully',
    data: {
      totalJobs,
      pendingJobs,
      activeJobs,
      totalApplications,
      shortlistedApplications,
      hiredApplications
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
    education = '',
    sortBy = 'ai'
  } = req.query;

  const job = await Job.findOne({ _id: req.params.jobId, employerUser: req.user._id });
  if (!job) {
    throw new AppError('Job not found', 404);
  }

  const applications = await Application.find({ job: job._id, employerUser: req.user._id })
    .populate('candidateUser', 'name email role status')
    .sort({ createdAt: -1 });

  const aiScoringSettings = await getAiScoringSettings();

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
      const candidateProfile = profileMap.get(String(asObject.candidateUser?._id)) || null;
      const aiFit = buildAiExplanation(job, candidateProfile || {}, aiScoringSettings);

      return {
        ...asObject,
        candidateProfile,
        aiMatchScore: aiFit.score,
        aiMatchLabel: aiFit.label,
        aiMatchBreakdown: aiFit.breakdown,
        aiMatchExplanation: aiFit
      };
    })
    .filter(matchesFilters);

  const sorted = [...enriched].sort((left, right) => {
    if (String(sortBy).toLowerCase() === 'recent') {
      return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
    }

    return (right.aiMatchScore || 0) - (left.aiMatchScore || 0)
      || new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
  });

  res.json(apiResponse({
    message: 'Job applicants fetched successfully',
    data: { job, applications: sorted }
  }));
});

const getInterviewCalendar = asyncHandler(async (req, res) => {
  const applications = await Application.find({ employerUser: req.user._id })
    .populate('candidateUser', 'name email')
    .populate('job', 'title companyName')
    .sort({ interviewScheduledAt: 1, createdAt: -1 })
    .lean();

  const events = applications
    .filter((application) => application.interviewScheduledAt || (application.interviewSlots || []).length)
    .flatMap((application) => serializeCalendarEvent(application));

  res.json(apiResponse({
    message: 'Interview calendar fetched successfully',
    data: events
  }));
});

const saveApplicationSlots = asyncHandler(async (req, res) => {
  const application = await Application.findOne({
    _id: req.params.applicationId,
    employerUser: req.user._id
  }).populate('candidateUser', 'email name');

  if (!application) {
    throw new AppError('Application not found', 404);
  }

  const rawSlots = Array.isArray(req.body.slots) ? req.body.slots : [];
  if (!rawSlots.length) {
    throw new AppError('At least one interview slot is required', 400);
  }

  application.interviewSlots = rawSlots.map(normalizeInterviewSlot);
  await application.save();

  const job = await Job.findById(application.job).select('title companyName').lean();

  await createNotification({
    userId: application.candidateUser._id,
    type: NOTIFICATION_TYPES.INTERVIEW,
    title: 'Interview slots shared',
    message: `New interview slots are available for ${job?.title || 'your application'}.`,
    metadata: {
      applicationId: application._id,
      slotCount: application.interviewSlots.length
    }
  });

  res.json(apiResponse({
    message: 'Interview slots saved successfully',
    data: application
  }));
});

const bookApplicationSlot = asyncHandler(async (req, res) => {
  const application = await Application.findOne({
    _id: req.params.applicationId,
    employerUser: req.user._id
  }).populate('candidateUser', 'email name');

  if (!application) {
    throw new AppError('Application not found', 404);
  }

  const slotId = String(req.body.slotId || '').trim();
  if (!slotId) {
    throw new AppError('Slot id is required', 400);
  }

  const slot = application.interviewSlots.id(slotId);
  if (!slot) {
    throw new AppError('Interview slot not found', 404);
  }

  application.interviewSlots.forEach((entry) => {
    entry.isBooked = String(entry._id) === slotId;
    entry.bookedAt = String(entry._id) === slotId ? new Date() : null;
  });

  application.status = APPLICATION_STATUS.INTERVIEW_SCHEDULED;
  application.interviewScheduledAt = slot.startsAt;
  application.interviewMode = slot.mode || application.interviewMode;
  application.interviewLocation = slot.location || application.interviewLocation;
  application.interviewMeetingLink = slot.meetingLink || application.interviewMeetingLink;
  application.interviewNotes = slot.notes || application.interviewNotes;

  await application.save();

  const job = await Job.findById(application.job).select('title companyName').lean();
  const statusEmail = buildStatusEmail(APPLICATION_STATUS.INTERVIEW_SCHEDULED, application.interviewScheduledAt);

  await createNotification({
    userId: application.candidateUser._id,
    type: NOTIFICATION_TYPES.INTERVIEW,
    title: 'Interview booked',
    message: `Interview confirmed for ${application.interviewScheduledAt?.toISOString()}.`,
    metadata: {
      applicationId: application._id,
      interviewScheduledAt: application.interviewScheduledAt
    }
  });

  await notifyAdmins({
    type: NOTIFICATION_TYPES.INTERVIEW,
    title: 'Interview slot booked',
    message: `${application.candidateUser?.name || 'Candidate'} interview slot booked for ${job?.title || 'job'}.`,
    metadata: {
      applicationId: application._id,
      jobId: application.job,
      jobTitle: job?.title,
      companyName: job?.companyName,
      candidateId: application.candidateUser._id,
      candidateName: application.candidateUser?.name,
      employerId: application.employerUser,
      interviewScheduledAt: application.interviewScheduledAt,
      actorUserId: req.user._id,
      actorRole: req.user.role,
      event: 'interview_slot_booked',
      adminPath: `/admin/jobs?applicationId=${application._id}`
    }
  });

  await sendEmail({
    to: application.candidateUser.email,
    subject: statusEmail.subject,
    text: statusEmail.text,
    attachments: [{
      filename: 'hirexo-interview-invite.ics',
      content: buildInterviewCalendarInvite({
        candidateName: application.candidateUser?.name,
        companyName: job?.companyName,
        jobTitle: job?.title,
        scheduledAt: application.interviewScheduledAt,
        interviewMode: application.interviewMode,
        interviewLocation: application.interviewLocation,
        interviewMeetingLink: application.interviewMeetingLink,
        interviewNotes: application.interviewNotes
      }),
      contentType: 'text/calendar; method=REQUEST; charset=UTF-8'
    }]
  });

  res.json(apiResponse({
    message: 'Interview slot booked successfully',
    data: application
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

  if (status === APPLICATION_STATUS.HIRED) {
    application.hiredAt = new Date();
  }

  if (status === APPLICATION_STATUS.REJECTED) {
    application.rejectedAt = new Date();
    application.rejectionReason = String(req.body.rejectionReason || application.rejectionReason || 'Not specified').trim();
  } else {
    application.rejectionReason = undefined;
  }

  if (req.body.interviewFeedback) {
    application.interviewFeedback = {
      communication: Number(req.body.interviewFeedback.communication || 0),
      technicalSkills: Number(req.body.interviewFeedback.technicalSkills || 0),
      confidence: Number(req.body.interviewFeedback.confidence || 0),
      cultureFit: Number(req.body.interviewFeedback.cultureFit || 0),
      recommendation: req.body.interviewFeedback.recommendation || undefined,
      summary: String(req.body.interviewFeedback.summary || '').trim(),
      submittedAt: new Date()
    };
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
  const job = await Job.findById(application.job).select('title companyName').lean();

  await notifyAdmins({
    type: status === APPLICATION_STATUS.INTERVIEW_SCHEDULED ? NOTIFICATION_TYPES.INTERVIEW : NOTIFICATION_TYPES.STATUS_UPDATE,
    title: status === APPLICATION_STATUS.INTERVIEW_SCHEDULED ? 'Interview scheduled for application' : 'Application status changed',
    message: status === APPLICATION_STATUS.INTERVIEW_SCHEDULED
      ? `${application.candidateUser?.name || 'Candidate'} interview scheduled for ${job?.title || 'job'} at ${job?.companyName || 'an employer'}.`
      : `${application.candidateUser?.name || 'Candidate'} application moved to ${status} for ${job?.title || 'job'}.`,
    metadata: {
      applicationId: application._id,
      jobId: application.job,
      jobTitle: job?.title,
      companyName: job?.companyName,
      candidateId: application.candidateUser._id,
      candidateName: application.candidateUser?.name,
      employerId: application.employerUser,
      status,
      interviewScheduledAt: application.interviewScheduledAt,
      interviewMode: application.interviewMode,
      interviewLocation: application.interviewLocation,
      interviewMeetingLink: application.interviewMeetingLink,
      updatedByUserId: req.user._id,
      actorUserId: req.user._id,
      actorRole: req.user.role,
      event: status === APPLICATION_STATUS.INTERVIEW_SCHEDULED ? 'interview_scheduled' : status === APPLICATION_STATUS.HIRED ? 'candidate_hired' : 'application_status_changed',
      adminPath: `/admin/jobs?applicationId=${application._id}`
    }
  });

  const attachments = [];
  if (status === APPLICATION_STATUS.INTERVIEW_SCHEDULED && application.interviewScheduledAt) {
    attachments.push({
      filename: 'hirexo-interview-invite.ics',
      content: buildInterviewCalendarInvite({
        candidateName: application.candidateUser?.name,
        companyName: job?.companyName,
        jobTitle: job?.title,
        scheduledAt: application.interviewScheduledAt,
        interviewMode: application.interviewMode,
        interviewLocation: application.interviewLocation,
        interviewMeetingLink: application.interviewMeetingLink,
        interviewNotes: application.interviewNotes
      }),
      contentType: 'text/calendar; method=REQUEST; charset=UTF-8'
    });
  }

  await sendEmail({
    to: application.candidateUser.email,
    subject: statusEmail.subject,
    text: statusEmail.text,
    attachments
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
  getInterviewCalendar,
  listJobApplicants,
  saveApplicationSlots,
  bookApplicationSlot,
  updateApplicantStatus
};
