const fs = require('fs');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const apiResponse = require('../utils/apiResponse');
const EmployerProfile = require('../models/EmployerProfile');
const Job = require('../models/Job');
const Application = require('../models/Application');
const CandidateProfile = require('../models/CandidateProfile');
const PlatformSetting = require('../models/PlatformSetting');
const HiringTeamMember = require('../models/HiringTeamMember');
const EmployerSavedView = require('../models/EmployerSavedView');
const EmployerTalent = require('../models/EmployerTalent');
const Offer = require('../models/Offer');
const HiringApproval = require('../models/HiringApproval');
const HiringAllocation = require('../models/HiringAllocation');
const HiringPolicy = require('../models/HiringPolicy');
const HiringConfiguration = require('../models/HiringConfiguration');
const { createUniqueSlug } = require('../utils/slug');
const { buildInterviewCalendarInvite } = require('../utils/interviewCalendar');
const {
  normalizeDate,
  createRoundPayload,
  ensureInterviewRounds,
  getInterviewRoundById,
  getPrimaryInterviewRound,
  syncLegacyInterviewFields,
  pushInterviewTimeline
} = require('../utils/interviewWorkflow');
const { DEFAULT_AI_SCORING, buildAiExplanation } = require('../utils/aiScoring');
const { createNotification, notifyAdmins } = require('../services/notification.service');
const { sendEmail } = require('../services/email.service');
const { NOTIFICATION_TYPES, APPLICATION_STATUS } = require('../utils/constants');

async function getAiScoringSettings() {
  const settings = await PlatformSetting.findOne({ key: 'default' }).lean();
  return { ...DEFAULT_AI_SCORING, ...(settings?.aiScoring || {}) };
}

function normalizeStringArray(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || '').trim()).filter(Boolean);
  }

  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeObjectIdArray(value) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item || '').trim()).filter(Boolean);
}

function normalizePanelInterviewers(value) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => ({
      member: item?.member || item?._id || undefined,
      name: String(item?.name || '').trim(),
      email: String(item?.email || '').trim().toLowerCase(),
      title: String(item?.title || '').trim()
    }))
    .filter((item) => item.member || item.name || item.email);
}

function buildTalentPayload({ application, profile, body }) {
  const candidate = application?.candidateUser || {};
  const payload = body || {};

  return {
    name: String(payload.name || candidate.name || '').trim(),
    email: String(payload.email || candidate.email || '').trim().toLowerCase(),
    phone: String(payload.phone || profile?.phone || '').trim(),
    location: String(payload.location || profile?.location || '').trim(),
    headline: String(payload.headline || profile?.headline || '').trim(),
    currentCompany: String(payload.currentCompany || profile?.currentCompany || '').trim(),
    experienceYears: Number(payload.experienceYears ?? profile?.experienceYears ?? 0),
    skills: normalizeStringArray(payload.skills || profile?.skills || []),
    tags: normalizeStringArray(payload.tags),
    notes: String(payload.notes || '').trim()
  };
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

  ensureInterviewRounds(application);

  return (application.interviewRounds || []).flatMap((round) => {
    const duration = Number(round.durationMinutes || 45);
    const scheduledEvent = round.scheduledAt
      ? [{
          type: 'scheduled',
          id: `scheduled-${application._id}-${round._id}`,
          roundId: round._id,
          roundName: round.roundName,
          applicationId: application._id,
          jobId: application.job?._id || application.job,
          candidateName,
          jobTitle,
          companyName,
          startsAt: round.scheduledAt,
          endsAt: round.interviewSlots?.find((slot) => slot.isBooked)?.endsAt || new Date(new Date(round.scheduledAt).getTime() + (duration * 60 * 1000)),
          mode: round.mode || 'video',
          location: round.location || '',
          meetingLink: round.meetingLink || '',
          notes: round.notes || '',
          status: round.status
        }]
      : [];

    const slotEvents = (round.interviewSlots || []).map((slot) => ({
      type: slot.isBooked ? 'booked_slot' : 'slot',
      id: String(slot._id),
      roundId: round._id,
      roundName: round.roundName,
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
      status: round.status,
      isBooked: slot.isBooked
    }));

    return [...scheduledEvent, ...slotEvents];
  });
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

function getMonthWindow(length = 6) {
  const now = new Date();
  return Array.from({ length }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (length - index - 1), 1);
    return {
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      label: date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
      applications: 0,
      interviews: 0,
      offers: 0
    };
  });
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
    .sort({ interviewScheduledAt: 1, createdAt: -1 });

  const events = applications
    .filter((application) => application.interviewScheduledAt || (application.interviewSlots || []).length || (application.interviewRounds || []).length)
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

  ensureInterviewRounds(application);
  const round = getInterviewRoundById(application, req.body.roundId) || application.interviewRounds[0];
  if (!round) {
    throw new AppError('Interview round not found', 404);
  }

  round.interviewSlots = rawSlots.map(normalizeInterviewSlot);
  round.status = 'slots_shared';
  round.mode = req.body.mode || round.mode || 'video';
  round.location = req.body.location || round.location || '';
  round.meetingLink = req.body.meetingLink || round.meetingLink || '';
  round.notes = req.body.notes || round.notes || '';
  round.panelInterviewers = normalizePanelInterviewers(req.body.panelInterviewers || round.panelInterviewers || []);
  syncLegacyInterviewFields(application);
  pushInterviewTimeline(application, {
    action: 'slots_shared',
    actorRole: req.user.role,
    actorUser: req.user._id,
    roundId: round._id,
    summary: `${round.roundName} slots shared`,
    metadata: { slotCount: round.interviewSlots.length }
  });
  await application.save();

  const job = await Job.findById(application.job).select('title companyName').lean();

  await createNotification({
    userId: application.candidateUser._id,
    type: NOTIFICATION_TYPES.INTERVIEW,
    title: `${round.roundName} slots shared`,
    message: `New interview slots are available for ${round.roundName} for ${job?.title || 'your application'}.`,
    metadata: {
      applicationId: application._id,
      roundId: round._id,
      roundName: round.roundName,
      slotCount: round.interviewSlots.length
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

  ensureInterviewRounds(application);
  const round = getInterviewRoundById(application, req.body.roundId) || getPrimaryInterviewRound(application);
  if (!round) {
    throw new AppError('Interview round not found', 404);
  }

  const slot = round.interviewSlots.id(slotId);
  if (!slot) {
    throw new AppError('Interview slot not found', 404);
  }

  round.interviewSlots.forEach((entry) => {
    entry.isBooked = String(entry._id) === slotId;
    entry.bookedAt = String(entry._id) === slotId ? new Date() : null;
  });

  round.status = 'scheduled';
  round.scheduledAt = slot.startsAt;
  round.mode = slot.mode || round.mode;
  round.location = slot.location || round.location;
  round.meetingLink = slot.meetingLink || round.meetingLink;
  round.notes = slot.notes || round.notes;
  application.status = APPLICATION_STATUS.INTERVIEW_SCHEDULED;
  syncLegacyInterviewFields(application);
  pushInterviewTimeline(application, {
    action: 'slot_booked',
    actorRole: req.user.role,
    actorUser: req.user._id,
    roundId: round._id,
    summary: `${round.roundName} slot booked`,
    metadata: { slotId }
  });

  await application.save();

  const job = await Job.findById(application.job).select('title companyName').lean();
  const statusEmail = buildStatusEmail(APPLICATION_STATUS.INTERVIEW_SCHEDULED, application.interviewScheduledAt);

  await createNotification({
    userId: application.candidateUser._id,
    type: NOTIFICATION_TYPES.INTERVIEW,
    title: 'Interview booked',
    message: `${round.roundName} confirmed for ${application.interviewScheduledAt?.toISOString()}.`,
    metadata: {
      applicationId: application._id,
      roundId: round._id,
      roundName: round.roundName,
      interviewScheduledAt: application.interviewScheduledAt
    }
  });

  await notifyAdmins({
    type: NOTIFICATION_TYPES.INTERVIEW,
    title: 'Interview slot booked',
    message: `${application.candidateUser?.name || 'Candidate'} booked ${round.roundName} for ${job?.title || 'job'}.`,
    metadata: {
      applicationId: application._id,
      jobId: application.job,
      jobTitle: job?.title,
      companyName: job?.companyName,
      roundId: round._id,
      roundName: round.roundName,
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
        interviewMode: round.mode,
        interviewLocation: round.location,
        interviewMeetingLink: round.meetingLink,
        interviewNotes: round.notes
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
    ensureInterviewRounds(application);
    const round = getInterviewRoundById(application, req.body.roundId) || getPrimaryInterviewRound(application) || application.interviewRounds.create(createRoundPayload({
      roundName: 'Interview Round 1',
      order: 1
    }));

    if (!round._id) {
      application.interviewRounds.push(round);
    }

    round.status = 'scheduled';
    round.scheduledAt = normalizeDate(interviewAt);
    round.mode = req.body.interviewMode || req.body.interview?.mode || round.mode;
    round.location = req.body.interviewLocation || req.body.interview?.location || round.location;
    round.meetingLink = req.body.interviewMeetingLink || req.body.interview?.meetingLink || round.meetingLink;
    round.notes = req.body.interviewNotes || req.body.interview?.notes || round.notes;
    round.panelInterviewers = normalizePanelInterviewers(req.body.panelInterviewers || round.panelInterviewers || []);
    syncLegacyInterviewFields(application);
    pushInterviewTimeline(application, {
      action: 'interview_scheduled',
      actorRole: req.user.role,
      actorUser: req.user._id,
      roundId: round._id,
      summary: `${round.roundName} scheduled`,
      metadata: { scheduledAt: round.scheduledAt }
    });
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
    const feedback = {
      communication: Number(req.body.interviewFeedback.communication || 0),
      technicalSkills: Number(req.body.interviewFeedback.technicalSkills || 0),
      confidence: Number(req.body.interviewFeedback.confidence || 0),
      cultureFit: Number(req.body.interviewFeedback.cultureFit || 0),
      recommendation: req.body.interviewFeedback.recommendation || undefined,
      summary: String(req.body.interviewFeedback.summary || '').trim(),
      submittedAt: new Date()
    };
    application.interviewFeedback = feedback;
    ensureInterviewRounds(application);
    const round = getInterviewRoundById(application, req.body.roundId) || getPrimaryInterviewRound(application);
    if (round) {
      round.feedback = feedback;
      if (req.body.markRoundCompleted !== false) {
        round.status = 'completed';
        round.completedAt = new Date();
      }
      pushInterviewTimeline(application, {
        action: 'feedback_submitted',
        actorRole: req.user.role,
        actorUser: req.user._id,
        roundId: round._id,
        summary: `${round.roundName} feedback submitted`
      });
    }
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

const getInterviewHub = asyncHandler(async (req, res) => {
  const applications = await Application.find({ employerUser: req.user._id })
    .populate('candidateUser', 'name email')
    .populate('job', 'title companyName')
    .sort({ updatedAt: -1, createdAt: -1 });

  const data = applications
    .filter((application) => (application.interviewRounds || []).length || application.interviewScheduledAt || (application.interviewSlots || []).length)
    .map((application) => {
      ensureInterviewRounds(application);
      syncLegacyInterviewFields(application);
      return application;
    });

  res.json(apiResponse({
    message: 'Interview hub fetched successfully',
    data
  }));
});

const createInterviewRound = asyncHandler(async (req, res) => {
  const application = await Application.findOne({
    _id: req.params.applicationId,
    employerUser: req.user._id
  }).populate('candidateUser', 'email name');

  if (!application) {
    throw new AppError('Application not found', 404);
  }

  ensureInterviewRounds(application);
  const nextOrder = Math.max(0, ...application.interviewRounds.map((round) => Number(round.order || 0))) + 1;
  application.interviewRounds.push(createRoundPayload({
    roundName: String(req.body.roundName || `Interview Round ${nextOrder}`).trim(),
    order: Number(req.body.order || nextOrder),
    durationMinutes: Number(req.body.durationMinutes || 45),
    mode: req.body.mode || 'video',
    location: req.body.location || '',
    meetingLink: req.body.meetingLink || '',
    notes: req.body.notes || '',
    panelInterviewers: normalizePanelInterviewers(req.body.panelInterviewers)
  }));

  const round = application.interviewRounds[application.interviewRounds.length - 1];
  pushInterviewTimeline(application, {
    action: 'round_created',
    actorRole: req.user.role,
    actorUser: req.user._id,
    roundId: round._id,
    summary: `${round.roundName} created`
  });
  syncLegacyInterviewFields(application);
  await application.save();

  res.status(201).json(apiResponse({
    message: 'Interview round created successfully',
    data: application
  }));
});

const updateInterviewRound = asyncHandler(async (req, res) => {
  const application = await Application.findOne({
    _id: req.params.applicationId,
    employerUser: req.user._id
  }).populate('candidateUser', 'email name');

  if (!application) {
    throw new AppError('Application not found', 404);
  }

  const round = getInterviewRoundById(application, req.params.roundId);
  if (!round) {
    throw new AppError('Interview round not found', 404);
  }

  const action = String(req.body.action || 'update').trim().toLowerCase();
  if (req.body.roundName !== undefined) round.roundName = String(req.body.roundName || round.roundName).trim();
  if (req.body.order !== undefined) round.order = Number(req.body.order || round.order || 1);
  if (req.body.durationMinutes !== undefined) round.durationMinutes = Number(req.body.durationMinutes || round.durationMinutes || 45);
  if (req.body.mode !== undefined) round.mode = req.body.mode || round.mode;
  if (req.body.location !== undefined) round.location = req.body.location || '';
  if (req.body.meetingLink !== undefined) round.meetingLink = req.body.meetingLink || '';
  if (req.body.notes !== undefined) round.notes = req.body.notes || '';
  if (req.body.panelInterviewers !== undefined) round.panelInterviewers = normalizePanelInterviewers(req.body.panelInterviewers);

  if (action === 'schedule' || req.body.scheduledAt) {
    const scheduledAt = normalizeDate(req.body.scheduledAt);
    if (!scheduledAt) {
      throw new AppError('Valid scheduled time is required', 400);
    }
    round.scheduledAt = scheduledAt;
    round.status = 'scheduled';
  }

  if (action === 'cancel') {
    round.status = 'cancelled';
    round.cancelledAt = new Date();
    round.cancellationReason = String(req.body.reason || 'Cancelled by employer').trim();
    await createNotification({
      userId: application.candidateUser._id,
      type: NOTIFICATION_TYPES.INTERVIEW,
      title: `${round.roundName} cancelled`,
      message: `${round.roundName} has been cancelled.`,
      metadata: { applicationId: application._id, roundId: round._id }
    });
  }

  if (action === 'reschedule') {
    const scheduledAt = normalizeDate(req.body.scheduledAt);
    if (!scheduledAt) {
      throw new AppError('Valid rescheduled time is required', 400);
    }
    round.scheduledAt = scheduledAt;
    round.status = 'scheduled';
    round.rescheduleRequestedAt = undefined;
    round.rescheduleRequestReason = undefined;
    await createNotification({
      userId: application.candidateUser._id,
      type: NOTIFICATION_TYPES.INTERVIEW,
      title: `${round.roundName} rescheduled`,
      message: `${round.roundName} was rescheduled to ${scheduledAt.toISOString()}.`,
      metadata: { applicationId: application._id, roundId: round._id, scheduledAt }
    });
  }

  if (action === 'complete') {
    round.status = 'completed';
    round.completedAt = new Date();
  }

  if (action === 'no_show') {
    round.status = 'no_show';
    round.noShowAt = new Date();
    round.noShowReason = String(req.body.reason || 'Candidate did not attend').trim();
  }

  const incomingFeedback = req.body.feedback || req.body.interviewFeedback;
  if (incomingFeedback) {
    round.feedback = {
      communication: Number(incomingFeedback.communication || 0),
      technicalSkills: Number(incomingFeedback.technicalSkills || 0),
      confidence: Number(incomingFeedback.confidence || 0),
      cultureFit: Number(incomingFeedback.cultureFit || 0),
      recommendation: incomingFeedback.recommendation || undefined,
      summary: String(incomingFeedback.summary || '').trim(),
      submittedAt: new Date()
    };
    application.interviewFeedback = round.feedback;
    if (req.body.markRoundCompleted !== false && !['cancelled', 'no_show'].includes(action)) {
      round.status = 'completed';
      round.completedAt = new Date();
    }
  }

  pushInterviewTimeline(application, {
    action,
    actorRole: req.user.role,
    actorUser: req.user._id,
    roundId: round._id,
    summary: `${round.roundName} ${action}`
  });

  if (incomingFeedback) {
    pushInterviewTimeline(application, {
      action: 'feedback_submitted',
      actorRole: req.user.role,
      actorUser: req.user._id,
      roundId: round._id,
      summary: `${round.roundName} scorecard submitted`
    });
  }
  syncLegacyInterviewFields(application);
  await application.save();

  res.json(apiResponse({
    message: 'Interview round updated successfully',
    data: application
  }));
});

const sendInterviewReminders = asyncHandler(async (req, res) => {
  const now = new Date();
  const next24Hours = new Date(now.getTime() + (24 * 60 * 60 * 1000));

  const applications = await Application.find({ employerUser: req.user._id })
    .populate('candidateUser', 'email name')
    .populate('job', 'title companyName');

  let reminded = 0;

  for (const application of applications) {
    ensureInterviewRounds(application);

    for (const round of application.interviewRounds || []) {
      const scheduledAt = normalizeDate(round.scheduledAt);
      if (!scheduledAt || round.status !== 'scheduled') continue;
      if (scheduledAt < now || scheduledAt > next24Hours) continue;
      if (round.reminderSentAt) continue;

      await createNotification({
        userId: application.candidateUser._id,
        type: NOTIFICATION_TYPES.INTERVIEW,
        title: `${round.roundName} reminder`,
        message: `${round.roundName} for ${application.job?.title || 'your application'} starts at ${scheduledAt.toISOString()}.`,
        metadata: { applicationId: application._id, roundId: round._id, scheduledAt }
      });

      if (application.candidateUser?.email) {
        await sendEmail({
          to: application.candidateUser.email,
          subject: `Reminder: ${round.roundName}`,
          text: `${round.roundName} for ${application.job?.title || 'your role'} is scheduled on ${scheduledAt.toISOString()}.`
        });
      }

      round.reminderSentAt = new Date();
      pushInterviewTimeline(application, {
        action: 'reminder_sent',
        actorRole: req.user.role,
        actorUser: req.user._id,
        roundId: round._id,
        summary: `${round.roundName} reminder sent`
      });
      reminded += 1;
    }

    syncLegacyInterviewFields(application);
    await application.save();
  }

  res.json(apiResponse({
    message: 'Interview reminders processed successfully',
    data: { reminded }
  }));
});

const getHiringTeam = asyncHandler(async (req, res) => {
  const members = await HiringTeamMember.find({ employerUser: req.user._id }).sort({ createdAt: -1 });

  res.json(apiResponse({
    message: 'Hiring team fetched successfully',
    data: members
  }));
});

const upsertHiringTeamMember = asyncHandler(async (req, res) => {
  const payload = {
    name: String(req.body.name || '').trim(),
    email: String(req.body.email || '').trim().toLowerCase(),
    title: String(req.body.title || '').trim(),
    permissions: normalizeStringArray(req.body.permissions),
    status: ['active', 'inactive'].includes(req.body.status) ? req.body.status : 'active',
    notes: String(req.body.notes || '').trim()
  };

  if (!payload.name || !payload.email) {
    throw new AppError('Team member name and email are required', 400);
  }

  const query = req.params.memberId
    ? { _id: req.params.memberId, employerUser: req.user._id }
    : { employerUser: req.user._id, email: payload.email };

  const member = await HiringTeamMember.findOneAndUpdate(
    query,
    {
      $set: payload,
      $setOnInsert: { employerUser: req.user._id }
    },
    { new: true, upsert: true, runValidators: true }
  );

  res.json(apiResponse({
    message: 'Hiring team member saved successfully',
    data: member
  }));
});

const removeHiringTeamMember = asyncHandler(async (req, res) => {
  const member = await HiringTeamMember.findOneAndDelete({ _id: req.params.memberId, employerUser: req.user._id });
  if (!member) {
    throw new AppError('Team member not found', 404);
  }

  await Job.updateMany(
    { employerUser: req.user._id, collaboratorMembers: member._id },
    { $pull: { collaboratorMembers: member._id } }
  );
  await Job.updateMany(
    { employerUser: req.user._id, hiringLeadMember: member._id },
    { $unset: { hiringLeadMember: '' } }
  );

  res.json(apiResponse({
    message: 'Hiring team member removed successfully'
  }));
});

const getSavedViews = asyncHandler(async (req, res) => {
  const jobId = String(req.query.jobId || '').trim();
  const filter = { employerUser: req.user._id };
  if (jobId) filter.$or = [{ job: jobId }, { job: { $exists: false } }, { job: null }];

  const views = await EmployerSavedView.find(filter).sort({ createdAt: -1 });
  res.json(apiResponse({
    message: 'Saved views fetched successfully',
    data: views
  }));
});

const saveSavedView = asyncHandler(async (req, res) => {
  const name = String(req.body.name || '').trim();
  if (!name) {
    throw new AppError('View name is required', 400);
  }

  const view = await EmployerSavedView.findOneAndUpdate(
    { employerUser: req.user._id, name },
    {
      $set: {
        name,
        job: req.body.jobId || undefined,
        filters: req.body.filters || {}
      },
      $setOnInsert: { employerUser: req.user._id }
    },
    { new: true, upsert: true, runValidators: true }
  );

  res.json(apiResponse({
    message: 'Saved view stored successfully',
    data: view
  }));
});

const bulkUpdateApplicants = asyncHandler(async (req, res) => {
  const applicationIds = normalizeObjectIdArray(req.body.applicationIds);
  const action = String(req.body.action || '').trim();

  if (!applicationIds.length) {
    throw new AppError('Select at least one application', 400);
  }

  const applications = await Application.find({
    _id: { $in: applicationIds },
    employerUser: req.user._id
  }).populate('candidateUser', 'name email');

  if (!applications.length) {
    throw new AppError('Applications not found', 404);
  }

  if (action === 'move_status') {
    const status = String(req.body.status || '').trim();
    if (!Object.values(APPLICATION_STATUS).includes(status)) {
      throw new AppError('Valid status is required for bulk update', 400);
    }

    const now = new Date();
    await Promise.all(applications.map(async (application) => {
      application.status = status;
      if (status === APPLICATION_STATUS.REVIEWED) application.viewedAt = now;
      if (status === APPLICATION_STATUS.SHORTLISTED) application.shortlistedAt = now;
      if (status === APPLICATION_STATUS.HIRED) application.hiredAt = now;
      if (status === APPLICATION_STATUS.REJECTED) {
        application.rejectedAt = now;
        application.rejectionReason = String(req.body.rejectionReason || application.rejectionReason || 'Bulk update').trim();
      }
      await application.save();
    }));

    return res.json(apiResponse({
      message: 'Applicants updated successfully',
      data: { updated: applications.length }
    }));
  }

  if (action === 'add_to_talent_pool') {
    const candidateIds = applications.map((application) => application.candidateUser?._id).filter(Boolean);
    const profiles = await CandidateProfile.find({ user: { $in: candidateIds } }).lean();
    const profileMap = new Map(profiles.map((profile) => [String(profile.user), profile]));

    const operations = applications.map((application) => {
      const profile = profileMap.get(String(application.candidateUser?._id));
      const payload = buildTalentPayload({ application, profile, body: req.body });

      return {
        updateOne: {
          filter: {
            employerUser: req.user._id,
            candidateUser: application.candidateUser?._id,
            job: application.job
          },
          update: {
            $set: {
              ...payload,
              employerUser: req.user._id,
              candidateUser: application.candidateUser?._id,
              application: application._id,
              job: application.job,
              sourceType: 'application',
              stage: req.body.stage || 'reviewing'
            }
          },
          upsert: true
        }
      };
    });

    if (operations.length) {
      await EmployerTalent.bulkWrite(operations);
    }

    return res.json(apiResponse({
      message: 'Candidates added to talent pool successfully',
      data: { added: operations.length }
    }));
  }

  throw new AppError('Unsupported bulk action', 400);
});

const listTalentPool = asyncHandler(async (req, res) => {
  const keyword = String(req.query.keyword || '').trim();
  const stage = String(req.query.stage || '').trim();
  const filter = { employerUser: req.user._id };

  if (stage) filter.stage = stage;
  if (keyword) {
    filter.$or = [
      { name: { $regex: keyword, $options: 'i' } },
      { email: { $regex: keyword, $options: 'i' } },
      { headline: { $regex: keyword, $options: 'i' } },
      { skills: { $in: [new RegExp(keyword, 'i')] } },
      { tags: { $in: [new RegExp(keyword, 'i')] } }
    ];
  }

  const talent = await EmployerTalent.find(filter)
    .populate('application', 'status createdAt')
    .populate('job', 'title companyName')
    .sort({ updatedAt: -1, createdAt: -1 });

  res.json(apiResponse({
    message: 'Talent pool fetched successfully',
    data: talent
  }));
});

const createTalentEntry = asyncHandler(async (req, res) => {
  const payload = buildTalentPayload({ body: req.body });
  if (!payload.name) {
    throw new AppError('Candidate name is required', 400);
  }

  const talent = await EmployerTalent.create({
    employerUser: req.user._id,
    sourceType: 'manual',
    stage: req.body.stage || 'new',
    ...payload
  });

  res.status(201).json(apiResponse({
    message: 'Talent profile created successfully',
    data: talent
  }));
});

const updateTalentEntry = asyncHandler(async (req, res) => {
  const talent = await EmployerTalent.findOne({ _id: req.params.talentId, employerUser: req.user._id });
  if (!talent) {
    throw new AppError('Talent profile not found', 404);
  }

  const payload = buildTalentPayload({ body: req.body, application: { candidateUser: { name: talent.name, email: talent.email } } });
  Object.assign(talent, {
    ...payload,
    stage: req.body.stage || talent.stage,
    lastContactedAt: req.body.lastContactedAt ? new Date(req.body.lastContactedAt) : talent.lastContactedAt
  });
  await talent.save();

  res.json(apiResponse({
    message: 'Talent profile updated successfully',
    data: talent
  }));
});

const listOffers = asyncHandler(async (req, res) => {
  const offers = await Offer.find({ employerUser: req.user._id })
    .populate('candidateUser', 'name email')
    .populate('application', 'status')
    .populate('job', 'title companyName')
    .sort({ updatedAt: -1, createdAt: -1 });

  res.json(apiResponse({
    message: 'Offers fetched successfully',
    data: offers
  }));
});

const upsertOffer = asyncHandler(async (req, res) => {
  const application = await Application.findOne({
    _id: req.body.applicationId || req.params.offerId,
    employerUser: req.user._id
  }).populate('candidateUser', 'name email');

  if (!application) {
    throw new AppError('Application not found', 404);
  }

  const job = await Job.findById(application.job).select('title companyName').lean();
  const offer = await Offer.findOneAndUpdate(
    { employerUser: req.user._id, application: application._id },
    {
      $set: {
        title: String(req.body.title || job?.title || 'Offer').trim(),
        salary: Number(req.body.salary || 0),
        currency: req.body.currency || 'LKR',
        joiningDate: req.body.joiningDate || undefined,
        notes: String(req.body.notes || '').trim(),
        preparedByName: String(req.body.preparedByName || req.user.name || '').trim(),
        status: ['draft', 'sent', 'accepted', 'declined'].includes(req.body.status) ? req.body.status : 'draft',
        sentAt: req.body.status === 'sent' ? new Date() : undefined,
        respondedAt: ['accepted', 'declined'].includes(req.body.status) ? new Date() : undefined,
        candidateUser: application.candidateUser._id,
        job: application.job
      },
      $setOnInsert: {
        employerUser: req.user._id,
        application: application._id
      }
    },
    { new: true, upsert: true, runValidators: true }
  );

  if (offer.status === 'sent') {
    await createNotification({
      userId: application.candidateUser._id,
      type: NOTIFICATION_TYPES.STATUS_UPDATE,
      title: 'Offer shared',
      message: `A job offer is ready for ${job?.title || 'your application'}.`,
      metadata: { applicationId: application._id, offerId: offer._id }
    });
  }

  res.json(apiResponse({
    message: 'Offer saved successfully',
    data: offer
  }));
});

const updateOfferStatus = asyncHandler(async (req, res) => {
  const offer = await Offer.findOne({ _id: req.params.offerId, employerUser: req.user._id });
  if (!offer) {
    throw new AppError('Offer not found', 404);
  }

  const status = String(req.body.status || '').trim();
  if (!['draft', 'sent', 'accepted', 'declined'].includes(status)) {
    throw new AppError('Invalid offer status', 400);
  }

  offer.status = status;
  if (status === 'sent') offer.sentAt = new Date();
  if (status === 'accepted' || status === 'declined') offer.respondedAt = new Date();
  await offer.save();

  res.json(apiResponse({
    message: 'Offer status updated successfully',
    data: offer
  }));
});

const getHiringActivityCalendar = asyncHandler(async (req, res) => {
  const [jobs, applications, offers, approvals, allocations, policies, configuration] = await Promise.all([
    Job.find({ employerUser: req.user._id }).select('title expiresAt createdAt').lean(),
    Application.find({ employerUser: req.user._id })
      .populate('candidateUser', 'name')
      .populate('job', 'title companyName')
      .sort({ createdAt: -1 })
      .lean(),
    Offer.find({ employerUser: req.user._id }).populate('job', 'title companyName').sort({ createdAt: -1 }).lean(),
    HiringApproval.find({ employerUser: req.user._id }).sort({ createdAt: -1 }).lean(),
    HiringAllocation.find({ employerUser: req.user._id, status: 'active' }).lean(),
    HiringPolicy.find({ employerUser: req.user._id, status: 'active' }).lean(),
    HiringConfiguration.findOne({ employerUser: req.user._id }).lean()
  ]);

  const events = [];

  jobs.forEach((job) => {
    if (job.createdAt) {
      events.push({
        type: 'job_created',
        title: `${job.title} created`,
        startsAt: job.createdAt,
        status: 'done'
      });
    }
    if (job.expiresAt) {
      events.push({
        type: 'job_deadline',
        title: `${job.title} closes`,
        startsAt: job.expiresAt,
        status: 'upcoming'
      });
    }
  });

  applications.forEach((application) => {
    if (application.createdAt) {
      events.push({
        type: 'application',
        title: `${application.candidateUser?.name || 'Candidate'} applied to ${application.job?.title || 'role'}`,
        startsAt: application.createdAt,
        status: application.status
      });
    }

    ensureInterviewRounds(application);
    (application.interviewRounds || []).forEach((round) => {
      if (round.scheduledAt) {
        events.push({
          type: 'interview',
          title: `${round.roundName} · ${application.candidateUser?.name || 'Candidate'}`,
          startsAt: round.scheduledAt,
          status: round.status,
          meta: { jobTitle: application.job?.title || 'Role' }
        });
      }
    });
  });

  offers.forEach((offer) => {
    if (offer.sentAt || offer.createdAt) {
      events.push({
        type: 'offer',
        title: `${offer.job?.title || offer.title} offer ${offer.status}`,
        startsAt: offer.sentAt || offer.createdAt,
        status: offer.status
      });
    }
    if (offer.joiningDate) {
      events.push({
        type: 'joining',
        title: `${offer.job?.title || offer.title} joining date`,
        startsAt: offer.joiningDate,
        status: offer.status
      });
    }
  });

  approvals.forEach((approval) => {
    events.push({
      type: 'approval',
      title: approval.title,
      startsAt: approval.dueAt || approval.createdAt,
      status: approval.status,
      priority: approval.priority
    });
  });

  events.sort((left, right) => new Date(left.startsAt || 0) - new Date(right.startsAt || 0));

  res.json(apiResponse({
    message: 'Hiring activity calendar fetched successfully',
    data: {
      events,
      summary: {
        totalEvents: events.length,
        interviewsUpcoming: events.filter((event) => event.type === 'interview' && new Date(event.startsAt) >= new Date()).length,
        approvalsPending: approvals.filter((item) => item.status === 'pending').length,
        activeAllocations: allocations.length,
        activePolicies: policies.length,
        syncMode: configuration?.activitySyncMode || 'daily'
      }
    }
  }));
});

const listHiringApprovals = asyncHandler(async (req, res) => {
  const approvals = await HiringApproval.find({ employerUser: req.user._id })
    .populate('relatedJob', 'title')
    .populate('relatedApplication', 'status')
    .populate('relatedOffer', 'title status')
    .sort({ status: 1, dueAt: 1, createdAt: -1 });

  res.json(apiResponse({
    message: 'Hiring approvals fetched successfully',
    data: approvals
  }));
});

const createHiringApproval = asyncHandler(async (req, res) => {
  const approval = await HiringApproval.create({
    employerUser: req.user._id,
    type: req.body.type || 'general',
    title: String(req.body.title || '').trim(),
    description: String(req.body.description || '').trim(),
    priority: req.body.priority || 'medium',
    requestedByName: String(req.body.requestedByName || req.user.name || 'Employer').trim(),
    requesterRole: String(req.body.requesterRole || req.user.role || 'employer').trim(),
    relatedJob: req.body.relatedJob || undefined,
    relatedApplication: req.body.relatedApplication || undefined,
    relatedOffer: req.body.relatedOffer || undefined,
    dueAt: normalizeDate(req.body.dueAt)
  });

  res.status(201).json(apiResponse({
    message: 'Hiring approval created successfully',
    data: approval
  }));
});

const updateHiringApproval = asyncHandler(async (req, res) => {
  const approval = await HiringApproval.findOne({ _id: req.params.approvalId, employerUser: req.user._id });
  if (!approval) {
    throw new AppError('Hiring approval not found', 404);
  }

  if (req.body.status) approval.status = req.body.status;
  if (req.body.priority) approval.priority = req.body.priority;
  if (req.body.title !== undefined) approval.title = String(req.body.title || approval.title).trim();
  if (req.body.description !== undefined) approval.description = String(req.body.description || '').trim();
  if (req.body.decisionNote !== undefined) approval.decisionNote = String(req.body.decisionNote || '').trim();
  if (req.body.dueAt !== undefined) approval.dueAt = normalizeDate(req.body.dueAt);
  if (['approved', 'rejected'].includes(String(approval.status || '').toLowerCase())) {
    approval.reviewedBy = req.user._id;
    approval.reviewedAt = new Date();
  }

  await approval.save();

  res.json(apiResponse({
    message: 'Hiring approval updated successfully',
    data: approval
  }));
});

const listHiringAllocations = asyncHandler(async (req, res) => {
  const [allocations, jobs, team] = await Promise.all([
    HiringAllocation.find({ employerUser: req.user._id })
      .populate('job', 'title companyName')
      .populate('teamMember', 'name email title')
      .sort({ status: 1, updatedAt: -1 }),
    Job.find({ employerUser: req.user._id }).select('title companyName').sort({ createdAt: -1 }).lean(),
    HiringTeamMember.find({ employerUser: req.user._id }).select('name email title status').sort({ createdAt: -1 }).lean()
  ]);

  res.json(apiResponse({
    message: 'Hiring allocations fetched successfully',
    data: {
      allocations,
      jobs,
      team
    }
  }));
});

const upsertHiringAllocation = asyncHandler(async (req, res) => {
  const allocationId = req.params.allocationId;
  const payload = {
    employerUser: req.user._id,
    job: req.body.job,
    teamMember: req.body.teamMember,
    allocationType: req.body.allocationType || 'recruiter',
    roundName: String(req.body.roundName || '').trim(),
    workloadPercent: Number(req.body.workloadPercent || 50),
    status: req.body.status || 'active',
    notes: String(req.body.notes || '').trim()
  };

  const allocation = allocationId
    ? await HiringAllocation.findOneAndUpdate({ _id: allocationId, employerUser: req.user._id }, { $set: payload }, { new: true, runValidators: true })
    : await HiringAllocation.create(payload);

  if (!allocation) {
    throw new AppError('Hiring allocation not found', 404);
  }

  res.json(apiResponse({
    message: 'Hiring allocation saved successfully',
    data: allocation
  }));
});

const removeHiringAllocation = asyncHandler(async (req, res) => {
  const allocation = await HiringAllocation.findOneAndDelete({ _id: req.params.allocationId, employerUser: req.user._id });
  if (!allocation) {
    throw new AppError('Hiring allocation not found', 404);
  }

  res.json(apiResponse({
    message: 'Hiring allocation removed successfully',
    data: null
  }));
});

const listHiringPolicies = asyncHandler(async (req, res) => {
  const [policies, configuration] = await Promise.all([
    HiringPolicy.find({ employerUser: req.user._id }).sort({ status: 1, updatedAt: -1 }),
    HiringConfiguration.findOne({ employerUser: req.user._id }).lean()
  ]);

  res.json(apiResponse({
    message: 'Hiring policies fetched successfully',
    data: {
      policies,
      configuration: configuration || {
        interviewReminderHours: 24,
        rescheduleApprovalRequired: true,
        offerApprovalRequired: true,
        exportFormat: 'csv',
        activitySyncMode: 'daily',
        defaultInterviewDurationMinutes: 45,
        defaultCalendarView: 'agenda'
      }
    }
  }));
});

const upsertHiringPolicy = asyncHandler(async (req, res) => {
  const policyId = req.params.policyId;
  const payload = {
    employerUser: req.user._id,
    name: String(req.body.name || '').trim(),
    category: req.body.category || 'workflow',
    description: String(req.body.description || '').trim(),
    status: req.body.status || 'active',
    rules: {
      responseSlaHours: Number(req.body.rules?.responseSlaHours || 24),
      interviewReminderHours: Number(req.body.rules?.interviewReminderHours || 24),
      offerExpiryDays: Number(req.body.rules?.offerExpiryDays || 7),
      approvalRequired: Boolean(req.body.rules?.approvalRequired),
      autoArchiveDays: Number(req.body.rules?.autoArchiveDays || 30)
    },
    tags: normalizeStringArray(req.body.tags || [])
  };

  const policy = policyId
    ? await HiringPolicy.findOneAndUpdate({ _id: policyId, employerUser: req.user._id }, { $set: payload }, { new: true, runValidators: true })
    : await HiringPolicy.create(payload);

  if (!policy) {
    throw new AppError('Hiring policy not found', 404);
  }

  res.json(apiResponse({
    message: 'Hiring policy saved successfully',
    data: policy
  }));
});

const getHiringConfigurations = asyncHandler(async (req, res) => {
  const configuration = await HiringConfiguration.findOne({ employerUser: req.user._id }).lean();

  res.json(apiResponse({
    message: 'Hiring configuration fetched successfully',
    data: configuration || {
      interviewReminderHours: 24,
      rescheduleApprovalRequired: true,
      offerApprovalRequired: true,
      exportFormat: 'csv',
      activitySyncMode: 'daily',
      defaultInterviewDurationMinutes: 45,
      defaultCalendarView: 'agenda'
    }
  }));
});

const updateHiringConfigurations = asyncHandler(async (req, res) => {
  const configuration = await HiringConfiguration.findOneAndUpdate(
    { employerUser: req.user._id },
    {
      $set: {
        interviewReminderHours: Number(req.body.interviewReminderHours || 24),
        rescheduleApprovalRequired: Boolean(req.body.rescheduleApprovalRequired),
        offerApprovalRequired: Boolean(req.body.offerApprovalRequired),
        exportFormat: req.body.exportFormat || 'csv',
        activitySyncMode: req.body.activitySyncMode || 'daily',
        defaultInterviewDurationMinutes: Number(req.body.defaultInterviewDurationMinutes || 45),
        defaultCalendarView: req.body.defaultCalendarView || 'agenda'
      },
      $setOnInsert: { employerUser: req.user._id }
    },
    { new: true, upsert: true, runValidators: true }
  ).lean();

  res.json(apiResponse({
    message: 'Hiring configuration updated successfully',
    data: configuration
  }));
});

const getExportCenter = asyncHandler(async (req, res) => {
  const [jobs, applications, offers, approvals, allocations, policies] = await Promise.all([
    Job.find({ employerUser: req.user._id }).select('title companyName createdAt reviewStatus status').lean(),
    Application.find({ employerUser: req.user._id })
      .populate('candidateUser', 'name email')
      .populate('job', 'title companyName')
      .sort({ createdAt: -1 })
      .lean(),
    Offer.find({ employerUser: req.user._id }).populate('job', 'title').sort({ createdAt: -1 }).lean(),
    HiringApproval.find({ employerUser: req.user._id }).sort({ createdAt: -1 }).lean(),
    HiringAllocation.find({ employerUser: req.user._id }).populate('job', 'title').populate('teamMember', 'name email').lean(),
    HiringPolicy.find({ employerUser: req.user._id }).lean()
  ]);

  const monthly = getMonthWindow(6);
  const monthlyMap = new Map(monthly.map((item) => [item.key, item]));

  applications.forEach((application) => {
    const date = new Date(application.createdAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const bucket = monthlyMap.get(key);
    if (bucket) bucket.applications += 1;
    ensureInterviewRounds(application);
    (application.interviewRounds || []).forEach((round) => {
      if (!round.scheduledAt) return;
      const roundDate = new Date(round.scheduledAt);
      const roundKey = `${roundDate.getFullYear()}-${String(roundDate.getMonth() + 1).padStart(2, '0')}`;
      const roundBucket = monthlyMap.get(roundKey);
      if (roundBucket) roundBucket.interviews += 1;
    });
  });

  offers.forEach((offer) => {
    const date = new Date(offer.sentAt || offer.createdAt);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const bucket = monthlyMap.get(key);
    if (bucket) bucket.offers += 1;
  });

  const jobPerformance = jobs.map((job) => {
    const relatedApplications = applications.filter((application) => String(application.job?._id || application.job) === String(job._id));
    return {
      jobId: job._id,
      title: job.title,
      companyName: job.companyName,
      applications: relatedApplications.length,
      shortlisted: relatedApplications.filter((item) => item.status === 'shortlisted').length,
      interviews: relatedApplications.filter((item) => item.status === 'interview_scheduled').length,
      hired: relatedApplications.filter((item) => item.status === 'hired').length
    };
  }).sort((left, right) => right.applications - left.applications);

  res.json(apiResponse({
    message: 'Export center data fetched successfully',
    data: {
      summary: {
        jobs: jobs.length,
        applications: applications.length,
        offers: offers.length,
        approvalsPending: approvals.filter((item) => item.status === 'pending').length,
        activeAllocations: allocations.filter((item) => item.status === 'active').length,
        activePolicies: policies.filter((item) => item.status === 'active').length
      },
      monthly,
      jobPerformance,
      exports: {
        applications: applications.map((item) => ({
          candidate: item.candidateUser?.name || 'Candidate',
          email: item.candidateUser?.email || '-',
          job: item.job?.title || 'Role',
          company: item.job?.companyName || '-',
          status: item.status,
          appliedAt: item.createdAt
        })),
        approvals: approvals.map((item) => ({
          title: item.title,
          type: item.type,
          priority: item.priority,
          status: item.status,
          dueAt: item.dueAt || null
        })),
        allocations: allocations.map((item) => ({
          job: item.job?.title || 'Role',
          teamMember: item.teamMember?.name || item.teamMember?.email || 'Member',
          allocationType: item.allocationType,
          workloadPercent: item.workloadPercent,
          status: item.status
        }))
      }
    }
  }));
});

module.exports = {
  getProfile,
  upsertProfile,
  dashboard,
  listMyJobs,
  getInterviewCalendar,
  getInterviewHub,
  listJobApplicants,
  createInterviewRound,
  updateInterviewRound,
  sendInterviewReminders,
  saveApplicationSlots,
  bookApplicationSlot,
  updateApplicantStatus,
  getHiringTeam,
  upsertHiringTeamMember,
  removeHiringTeamMember,
  getSavedViews,
  saveSavedView,
  bulkUpdateApplicants,
  listTalentPool,
  createTalentEntry,
  updateTalentEntry,
  listOffers,
  upsertOffer,
  updateOfferStatus,
  getHiringActivityCalendar,
  listHiringApprovals,
  createHiringApproval,
  updateHiringApproval,
  listHiringAllocations,
  upsertHiringAllocation,
  removeHiringAllocation,
  listHiringPolicies,
  upsertHiringPolicy,
  getHiringConfigurations,
  updateHiringConfigurations,
  getExportCenter
};
