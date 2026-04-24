const fs = require('fs');
const path = require('path');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const apiResponse = require('../utils/apiResponse');
const Application = require('../models/Application');
const ApplicationMessage = require('../models/ApplicationMessage');
const Job = require('../models/Job');
const CandidateProfile = require('../models/CandidateProfile');
const PlatformSetting = require('../models/PlatformSetting');
const { buildInterviewCalendarInvite } = require('../utils/interviewCalendar');
const { ensureInterviewRounds, getInterviewRoundById, syncLegacyInterviewFields, pushInterviewTimeline } = require('../utils/interviewWorkflow');
const { DEFAULT_AI_SCORING, buildAiExplanation } = require('../utils/aiScoring');
const { JOB_REVIEW_STATUS, JOB_STATUS, APPLICATION_STATUS, NOTIFICATION_TYPES, ROLES } = require('../utils/constants');
const { createNotification, notifyAdmins } = require('../services/notification.service');
const { sendEmail } = require('../services/email.service');

function normalizeCandidateSource(value) {
  const allowed = ['Hirexo Portal', 'LinkedIn', 'Referral', 'Website', 'Agency'];
  return allowed.includes(value) ? value : 'Hirexo Portal';
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

function userCanAccessApplication(application, user) {
  const isCandidate = String(application.candidateUser?._id || application.candidateUser) === String(user._id);
  const isEmployer = String(application.employerUser?._id || application.employerUser) === String(user._id);
  return isCandidate || isEmployer || user.role === 'admin';
}

function getAdminReplyThread(messages, userId, preferredAdminId) {
  const adminThreads = messages.filter((item) =>
    String(item.recipientUser?._id || item.recipientUser) === String(userId)
    && item.senderUser?.role === ROLES.ADMIN
  );

  if (!adminThreads.length) return null;

  if (preferredAdminId) {
    const matchingThread = adminThreads.find(
      (item) => String(item.senderUser?._id || item.senderUser) === String(preferredAdminId)
    );
    if (matchingThread) return matchingThread;
  }

  return adminThreads[adminThreads.length - 1];
}

function buildMessagePermissions(messages, user) {
  if (user.role === ROLES.ADMIN) {
    return {
      allowedRecipientRoles: [ROLES.CANDIDATE, ROLES.EMPLOYER],
      defaultRecipientRole: ROLES.CANDIDATE,
      canMessageAdmin: false,
      adminReplyUserId: null
    };
  }

  const defaultRecipientRole = user.role === ROLES.CANDIDATE ? ROLES.EMPLOYER : ROLES.CANDIDATE;
  const permissions = {
    allowedRecipientRoles: [defaultRecipientRole],
    defaultRecipientRole,
    canMessageAdmin: false,
    adminReplyUserId: null
  };

  const adminReplyThread = getAdminReplyThread(messages, user._id);
  if (adminReplyThread) {
    permissions.allowedRecipientRoles.push(ROLES.ADMIN);
    permissions.canMessageAdmin = true;
    permissions.adminReplyUserId = adminReplyThread.senderUser?._id || null;
  }

  return permissions;
}

async function getAiScoringSettings() {
  const settings = await PlatformSetting.findOne({ key: 'default' }).lean();
  return { ...DEFAULT_AI_SCORING, ...(settings?.aiScoring || {}) };
}

function findInterviewSlot(application, slotId) {
  if (!application?.interviewSlots?.id) return null;
  return application.interviewSlots.id(slotId);
}

function normalizeScreeningAnswers(job, value) {
  const answers = Array.isArray(value) ? value : [];
  const questions = Array.isArray(job?.screeningQuestions) ? job.screeningQuestions : [];

  return questions.map((question) => {
    const match = answers.find((item) => String(item?.questionId) === String(question._id));
    return {
      questionId: question._id,
      question: question.question,
      answer: String(match?.answer || '').trim(),
      type: question.type || 'text',
      knockout: Boolean(question.knockout)
    };
  });
}

const applyForJob = asyncHandler(async (req, res) => {
  const job = await Job.findOne({ _id: req.body.jobId, reviewStatus: JOB_REVIEW_STATUS.APPROVED, status: JOB_STATUS.ACTIVE });
  if (!job) {
    throw new AppError('Job not available for application', 404);
  }

  const existingApplication = await Application.findOne({ job: job._id, candidateUser: req.user._id });
  if (existingApplication) {
    throw new AppError('You have already applied for this job', 400);
  }

  const profile = await CandidateProfile.findOne({ user: req.user._id });
  if (!profile?.resume?.filePath) {
    throw new AppError('Upload your resume before applying', 400);
  }

  const application = await Application.create({
    job: job._id,
    candidateUser: req.user._id,
    employerUser: job.employerUser,
    candidateSource: normalizeCandidateSource(req.body.candidateSource),
    coverLetter: req.body.coverLetter,
    screeningAnswers: normalizeScreeningAnswers(job, req.body.screeningAnswers),
    resumeSnapshot: {
      fileName: profile.resume.fileName,
      filePath: profile.resume.filePath,
      size: profile.resume.size
    },
    status: APPLICATION_STATUS.PENDING
  });

  await createNotification({
    userId: req.user._id,
    type: NOTIFICATION_TYPES.APPLICATION,
    title: 'Application submitted',
    message: `You applied for ${job.title}.`,
    metadata: { jobId: job._id, applicationId: application._id }
  });

  await createNotification({
    userId: job.employerUser,
    type: NOTIFICATION_TYPES.APPLICATION,
    title: 'New job application received',
    message: `${req.user.name} applied for ${job.title}.`,
    metadata: { jobId: job._id, applicationId: application._id, candidateId: req.user._id }
  });

  await notifyAdmins({
    type: NOTIFICATION_TYPES.APPLICATION,
    title: 'New application submitted',
    message: `${req.user.name} applied for ${job.title} at ${job.companyName || 'an employer'}.`,
    metadata: {
      jobId: job._id,
      jobTitle: job.title,
      companyName: job.companyName,
      applicationId: application._id,
      candidateId: req.user._id,
      candidateName: req.user.name,
      employerId: job.employerUser,
      event: 'application_submitted',
      actorUserId: req.user._id,
      actorRole: req.user.role,
      adminPath: `/admin/jobs?applicationId=${application._id}`
    }
  });

  await sendEmail({
    to: req.user.email,
    subject: 'Application confirmation',
    text: `Your application for ${job.title} was submitted successfully.`
  });

  res.status(201).json(apiResponse({
    message: 'Application submitted successfully',
    data: application
  }));
});

const getMyApplications = asyncHandler(async (req, res) => {
  const applications = await Application.find({ candidateUser: req.user._id })
    .populate('job', 'title slug companyName status reviewStatus location jobType')
    .sort({ createdAt: -1 });

  res.json(apiResponse({
    message: 'Applications fetched successfully',
    data: applications
  }));
});

const getApplicationsByJob = asyncHandler(async (req, res) => {
  const job = await Job.findOne({ _id: req.params.jobId, employerUser: req.user._id });
  if (!job) {
    throw new AppError('Job not found', 404);
  }

  const applications = await Application.find({ job: job._id, employerUser: req.user._id })
    .populate('candidateUser', 'name email role status')
    .sort({ createdAt: -1 });

  res.json(apiResponse({
    message: 'Job applications fetched successfully',
    data: applications
  }));
});

const getApplicationById = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id)
    .populate('candidateUser', 'name email role status')
    .populate('employerUser', 'name email role status')
    .populate('job', 'title slug companyName location jobType status reviewStatus description')
    .lean();

  if (!application) {
    throw new AppError('Application not found', 404);
  }

  if (!userCanAccessApplication(application, req.user)) {
    throw new AppError('You cannot access this application', 403);
  }

  const candidateProfile = application.candidateUser?._id
    ? await CandidateProfile.findOne({ user: application.candidateUser._id })
        .select('headline summary skills experienceYears education currentCompany location phone resume socialLinks')
        .lean()
    : null;

  const aiScoringSettings = await getAiScoringSettings();
  const aiMatchExplanation = buildAiExplanation(application.job || {}, candidateProfile || {}, aiScoringSettings);

  res.json(apiResponse({
    message: 'Application fetched successfully',
    data: {
      ...application,
      candidateProfile,
      aiMatchScore: aiMatchExplanation.score,
      aiMatchLabel: aiMatchExplanation.label,
      aiMatchBreakdown: aiMatchExplanation.breakdown,
      aiMatchExplanation
    }
  }));
});

const downloadApplicationResume = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id);
  if (!application) {
    throw new AppError('Application not found', 404);
  }

  const canAccessAsCandidate = String(application.candidateUser) === String(req.user._id);
  const canAccessAsEmployer = String(application.employerUser) === String(req.user._id);
  const canAccessAsAdmin = req.user.role === 'admin';

  if (!canAccessAsCandidate && !canAccessAsEmployer && !canAccessAsAdmin) {
    throw new AppError('You cannot access this resume', 403);
  }

  const resumePath = application.resumeSnapshot?.filePath;
  if (!resumePath || !fs.existsSync(resumePath)) {
    throw new AppError('Resume file not found', 404);
  }

  res.download(path.resolve(resumePath), application.resumeSnapshot.fileName || 'resume.pdf');
});

const updateApplicationStatus = asyncHandler(async (req, res) => {
  if (!Object.values(APPLICATION_STATUS).includes(req.body.status)) {
    throw new AppError('Invalid application status', 400);
  }

  const application = await Application.findById(req.params.id).populate('candidateUser', 'email name');
  if (!application) {
    throw new AppError('Application not found', 404);
  }

  if (String(application.employerUser) !== String(req.user._id) && req.user.role !== 'admin') {
    throw new AppError('You cannot update this application', 403);
  }

  application.status = req.body.status;
  application.notes = req.body.notes || application.notes;

  if (req.body.status === APPLICATION_STATUS.REVIEWED) {
    application.viewedAt = new Date();
  }

  if (req.body.status === APPLICATION_STATUS.INTERVIEW_SCHEDULED) {
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

  if (req.body.status === APPLICATION_STATUS.SHORTLISTED) {
    application.shortlistedAt = new Date();
  }

  if (req.body.status === APPLICATION_STATUS.HIRED) {
    application.hiredAt = new Date();
  }

  if (req.body.status === APPLICATION_STATUS.REJECTED) {
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
    message: `Your application status changed to ${req.body.status}.`,
    metadata: { applicationId: application._id }
  });

  if (req.body.status === APPLICATION_STATUS.INTERVIEW_SCHEDULED) {
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

  const statusEmail = buildStatusEmail(req.body.status, application.interviewScheduledAt);
  const job = await Job.findById(application.job).select('title companyName').lean();

  await notifyAdmins({
    type: req.body.status === APPLICATION_STATUS.INTERVIEW_SCHEDULED ? NOTIFICATION_TYPES.INTERVIEW : NOTIFICATION_TYPES.STATUS_UPDATE,
    title: req.body.status === APPLICATION_STATUS.INTERVIEW_SCHEDULED ? 'Interview scheduled for application' : 'Application status changed',
    message: req.body.status === APPLICATION_STATUS.INTERVIEW_SCHEDULED
      ? `${application.candidateUser?.name || 'Candidate'} interview scheduled for ${job?.title || 'job'} at ${job?.companyName || 'an employer'}.`
      : `${application.candidateUser?.name || 'Candidate'} application moved to ${req.body.status} for ${job?.title || 'job'}.`,
    metadata: {
      applicationId: application._id,
      jobId: application.job,
      jobTitle: job?.title,
      companyName: job?.companyName,
      candidateId: application.candidateUser._id,
      candidateName: application.candidateUser?.name,
      employerId: application.employerUser,
      status: req.body.status,
      interviewScheduledAt: application.interviewScheduledAt,
      interviewMode: application.interviewMode,
      interviewLocation: application.interviewLocation,
      interviewMeetingLink: application.interviewMeetingLink,
      updatedByUserId: req.user._id,
      actorUserId: req.user._id,
      actorRole: req.user.role,
      event: req.body.status === APPLICATION_STATUS.INTERVIEW_SCHEDULED ? 'interview_scheduled' : req.body.status === APPLICATION_STATUS.HIRED ? 'candidate_hired' : 'application_status_changed',
      adminPath: `/admin/jobs?applicationId=${application._id}`
    },
    excludeUserId: req.user.role === 'admin' ? req.user._id : undefined
  });

  const attachments = [];
  if (req.body.status === APPLICATION_STATUS.INTERVIEW_SCHEDULED && application.interviewScheduledAt) {
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

const getApplicationMessages = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id)
    .populate('candidateUser', 'name email')
    .populate('employerUser', 'name email')
    .populate('job', 'title companyName');

  if (!application) {
    throw new AppError('Application not found', 404);
  }

  if (!userCanAccessApplication(application, req.user)) {
    throw new AppError('You cannot access messages for this application', 403);
  }

  const messages = await ApplicationMessage.find({ application: application._id })
    .populate('senderUser', 'name role email')
    .populate('recipientUser', 'name role email')
    .sort({ createdAt: 1 })
    .limit(200);

  res.json(apiResponse({
    message: 'Application messages fetched successfully',
    data: {
      applicationId: application._id,
      jobTitle: application.job?.title,
      companyName: application.job?.companyName,
      messages
    },
    meta: {
      permissions: buildMessagePermissions(messages, req.user)
    }
  }));
});

const bookInterviewSlot = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id)
    .populate('candidateUser', 'name email')
    .populate('job', 'title companyName');

  if (!application) {
    throw new AppError('Application not found', 404);
  }

  if (String(application.candidateUser?._id || application.candidateUser) !== String(req.user._id) && req.user.role !== ROLES.ADMIN) {
    throw new AppError('You cannot book a slot for this application', 403);
  }

  const slotId = String(req.body.slotId || '').trim();
  if (!slotId) {
    throw new AppError('Slot id is required', 400);
  }

  ensureInterviewRounds(application);
  const round = getInterviewRoundById(application, req.body.roundId);
  const slot = round?.interviewSlots?.id ? round.interviewSlots.id(slotId) : findInterviewSlot(application, slotId);
  if (!slot) {
    throw new AppError('Interview slot not found', 404);
  }

  const targetSlots = round ? round.interviewSlots : application.interviewSlots;
  targetSlots.forEach((entry) => {
    entry.isBooked = String(entry._id) === slotId;
    entry.bookedAt = String(entry._id) === slotId ? new Date() : null;
  });

  if (round) {
    round.status = 'scheduled';
    round.scheduledAt = slot.startsAt;
    round.mode = slot.mode || round.mode;
    round.location = slot.location || round.location;
    round.meetingLink = slot.meetingLink || round.meetingLink;
    round.notes = slot.notes || round.notes;
  }

  application.status = APPLICATION_STATUS.INTERVIEW_SCHEDULED;
  application.interviewScheduledAt = slot.startsAt;
  application.interviewMode = slot.mode || application.interviewMode;
  application.interviewLocation = slot.location || application.interviewLocation;
  application.interviewMeetingLink = slot.meetingLink || application.interviewMeetingLink;
  application.interviewNotes = slot.notes || application.interviewNotes;
  syncLegacyInterviewFields(application);
  pushInterviewTimeline(application, {
    action: 'slot_booked',
    actorRole: req.user.role,
    actorUser: req.user._id,
    roundId: round?._id,
    summary: `${round?.roundName || 'Interview round'} booked by candidate`,
    metadata: { slotId }
  });

  await application.save();

  await createNotification({
    userId: application.candidateUser._id,
    type: NOTIFICATION_TYPES.INTERVIEW,
    title: 'Interview booked',
    message: `You confirmed an interview slot for ${application.job?.title || 'your application'}.`,
    metadata: {
      applicationId: application._id,
      interviewScheduledAt: application.interviewScheduledAt
    }
  });

  await createNotification({
    userId: application.employerUser,
    type: NOTIFICATION_TYPES.INTERVIEW,
    title: 'Candidate booked an interview slot',
    message: `${application.candidateUser?.name || 'Candidate'} selected an interview slot for ${application.job?.title || 'your role'}.`,
    metadata: {
      applicationId: application._id,
      interviewScheduledAt: application.interviewScheduledAt
    }
  });

  await notifyAdmins({
    type: NOTIFICATION_TYPES.INTERVIEW,
    title: 'Candidate booked interview slot',
    message: `${application.candidateUser?.name || 'Candidate'} booked an interview slot for ${application.job?.title || 'job'} at ${application.job?.companyName || 'an employer'}.`,
    metadata: {
      applicationId: application._id,
      jobId: application.job?._id || application.job,
      jobTitle: application.job?.title,
      companyName: application.job?.companyName,
      candidateId: application.candidateUser._id,
      candidateName: application.candidateUser?.name,
      employerId: application.employerUser,
      interviewScheduledAt: application.interviewScheduledAt,
      actorUserId: req.user._id,
      actorRole: req.user.role,
      event: 'candidate_booked_interview_slot',
      adminPath: `/admin/jobs?applicationId=${application._id}`
    }
  });

  await sendEmail({
    to: application.candidateUser.email,
    subject: 'Interview slot confirmed',
    text: `Your interview for ${application.job?.title || 'the role'} is confirmed on ${application.interviewScheduledAt?.toISOString()}.`,
    attachments: [{
      filename: 'hirexo-interview-invite.ics',
      content: buildInterviewCalendarInvite({
        candidateName: application.candidateUser?.name,
        companyName: application.job?.companyName,
        jobTitle: application.job?.title,
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

const requestInterviewReschedule = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id)
    .populate('candidateUser', 'name email')
    .populate('job', 'title companyName');

  if (!application) {
    throw new AppError('Application not found', 404);
  }

  if (String(application.candidateUser?._id || application.candidateUser) !== String(req.user._id) && req.user.role !== ROLES.ADMIN) {
    throw new AppError('You cannot request a reschedule for this application', 403);
  }

  ensureInterviewRounds(application);
  const round = getInterviewRoundById(application, req.body.roundId);
  if (!round) {
    throw new AppError('Interview round not found', 404);
  }

  round.status = 'reschedule_requested';
  round.rescheduleRequestedAt = new Date();
  round.rescheduleRequestReason = String(req.body.reason || 'Candidate requested a different interview time').trim();
  syncLegacyInterviewFields(application);
  pushInterviewTimeline(application, {
    action: 'reschedule_requested',
    actorRole: req.user.role,
    actorUser: req.user._id,
    roundId: round._id,
    summary: `${round.roundName} reschedule requested`,
    metadata: { reason: round.rescheduleRequestReason }
  });
  await application.save();

  await createNotification({
    userId: application.employerUser,
    type: NOTIFICATION_TYPES.INTERVIEW,
    title: `${round.roundName} reschedule requested`,
    message: `${application.candidateUser?.name || 'Candidate'} requested to reschedule ${round.roundName}.`,
    metadata: {
      applicationId: application._id,
      roundId: round._id,
      reason: round.rescheduleRequestReason
    }
  });

  res.json(apiResponse({
    message: 'Reschedule request sent successfully',
    data: application
  }));
});

const sendApplicationMessage = asyncHandler(async (req, res) => {
  const text = String(req.body.message || '').trim();
  if (!text) {
    throw new AppError('Message is required', 400);
  }

  const application = await Application.findById(req.params.id)
    .populate('candidateUser', 'name email')
    .populate('employerUser', 'name email')
    .populate('job', 'title companyName');

  if (!application) {
    throw new AppError('Application not found', 404);
  }

  if (!userCanAccessApplication(application, req.user)) {
    throw new AppError('You cannot send a message for this application', 403);
  }

  const senderIsCandidate = String(application.candidateUser?._id) === String(req.user._id);
  const senderIsEmployer = String(application.employerUser?._id) === String(req.user._id);
  const senderIsAdmin = req.user.role === ROLES.ADMIN;
  const requestedRecipientRole = String(req.body.recipientRole || '').trim().toLowerCase();
  let recipient = null;

  if (senderIsAdmin) {
    if (![ROLES.CANDIDATE, ROLES.EMPLOYER].includes(requestedRecipientRole)) {
      throw new AppError('Admin must choose candidate or employer as the recipient', 400);
    }

    recipient = requestedRecipientRole === ROLES.CANDIDATE ? application.candidateUser : application.employerUser;
  } else if (senderIsCandidate || senderIsEmployer) {
    const defaultRecipient = senderIsCandidate ? application.employerUser : application.candidateUser;
    const defaultRecipientRole = senderIsCandidate ? ROLES.EMPLOYER : ROLES.CANDIDATE;

    if (!requestedRecipientRole || requestedRecipientRole === defaultRecipientRole) {
      recipient = defaultRecipient;
    } else if (requestedRecipientRole === ROLES.ADMIN) {
      const existingMessages = await ApplicationMessage.find({
        application: application._id,
        recipientUser: req.user._id
      })
        .populate('senderUser', 'name role email')
        .populate('recipientUser', 'name role email')
        .sort({ createdAt: 1 });

      const adminReplyThread = getAdminReplyThread(existingMessages, req.user._id, req.body.recipientUserId);
      if (!adminReplyThread?.senderUser?._id) {
        throw new AppError('Admin must message first before you can reply', 403);
      }

      recipient = adminReplyThread.senderUser;
    } else {
      throw new AppError('Invalid message recipient', 400);
    }
  } else {
    throw new AppError('You cannot send messages for this application', 403);
  }

  const senderName = req.user.name || (senderIsCandidate ? application.candidateUser?.name : application.employerUser?.name) || 'User';

  const message = await ApplicationMessage.create({
    application: application._id,
    senderUser: req.user._id,
    recipientUser: recipient._id,
    message: text
  });

  await createNotification({
    userId: recipient._id,
    type: NOTIFICATION_TYPES.MESSAGE,
    title: 'New application message',
    message: `${senderName}: ${text.slice(0, 120)}`,
    metadata: {
      applicationId: application._id,
      jobId: application.job?._id
    }
  });

  if (recipient.email) {
    await sendEmail({
      to: recipient.email,
      subject: `New message about ${application.job?.title || 'your application'}`,
      text: `${senderName} sent you a message:\n\n${text}`
    });
  }

  const populated = await ApplicationMessage.findById(message._id)
    .populate('senderUser', 'name role email')
    .populate('recipientUser', 'name role email');

  res.status(201).json(apiResponse({
    message: 'Message sent successfully',
    data: populated
  }));
});

module.exports = {
  applyForJob,
  getMyApplications,
  getApplicationsByJob,
  getApplicationById,
  downloadApplicationResume,
  updateApplicationStatus,
  getApplicationMessages,
  bookInterviewSlot,
  requestInterviewReschedule,
  sendApplicationMessage
};
