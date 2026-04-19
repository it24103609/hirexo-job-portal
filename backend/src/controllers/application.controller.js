const fs = require('fs');
const path = require('path');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const apiResponse = require('../utils/apiResponse');
const Application = require('../models/Application');
const ApplicationMessage = require('../models/ApplicationMessage');
const Job = require('../models/Job');
const CandidateProfile = require('../models/CandidateProfile');
const { buildInterviewCalendarInvite } = require('../utils/interviewCalendar');
const { JOB_REVIEW_STATUS, JOB_STATUS, APPLICATION_STATUS, NOTIFICATION_TYPES } = require('../utils/constants');
const { createNotification } = require('../services/notification.service');
const { sendEmail } = require('../services/email.service');

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

function userCanAccessApplication(application, user) {
  const isCandidate = String(application.candidateUser?._id || application.candidateUser) === String(user._id);
  const isEmployer = String(application.employerUser?._id || application.employerUser) === String(user._id);
  return isCandidate || isEmployer || user.role === 'admin';
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
    coverLetter: req.body.coverLetter,
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

  if (req.body.status === APPLICATION_STATUS.REJECTED) {
    application.rejectedAt = new Date();
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
    .populate('senderUser', 'name role')
    .sort({ createdAt: 1 })
    .limit(200);

  res.json(apiResponse({
    message: 'Application messages fetched successfully',
    data: {
      applicationId: application._id,
      jobTitle: application.job?.title,
      companyName: application.job?.companyName,
      messages
    }
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

  if (!senderIsCandidate && !senderIsEmployer) {
    throw new AppError('Only candidate or employer can send messages', 403);
  }

  const recipient = senderIsCandidate ? application.employerUser : application.candidateUser;
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

  const populated = await ApplicationMessage.findById(message._id).populate('senderUser', 'name role');

  res.status(201).json(apiResponse({
    message: 'Message sent successfully',
    data: populated
  }));
});

module.exports = {
  applyForJob,
  getMyApplications,
  getApplicationsByJob,
  downloadApplicationResume,
  updateApplicationStatus,
  getApplicationMessages,
  sendApplicationMessage
};
