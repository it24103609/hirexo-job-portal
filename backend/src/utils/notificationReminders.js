const Notification = require('../models/Notification');
const Application = require('../models/Application');
const Offer = require('../models/Offer');
const Job = require('../models/Job');
const HiringApproval = require('../models/HiringApproval');
const User = require('../models/User');
const { ROLES, JOB_REVIEW_STATUS } = require('./constants');
const { createNotification } = require('../services/notification.service');

async function createUniqueReminder({ userId, type, title, message, metadata = {} }) {
  const reminderKey = metadata.reminderKey;
  if (!reminderKey) {
    return createNotification({ userId, type, title, message, metadata });
  }

  const existing = await Notification.findOne({ user: userId, 'metadata.reminderKey': reminderKey }).lean();
  if (existing) {
    return null;
  }

  return createNotification({ userId, type, title, message, metadata: { ...metadata, reminderKey } });
}

async function processCandidateReminders(user) {
  const now = new Date();
  const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  let created = 0;

  const [applications, offers] = await Promise.all([
    Application.find({ candidateUser: user._id }).populate('job', 'title').lean(),
    Offer.find({ candidateUser: user._id, status: 'sent' }).populate('job', 'title').lean()
  ]);

  for (const application of applications) {
    for (const round of application.interviewRounds || []) {
      if (!round.scheduledAt || round.status !== 'scheduled') continue;
      const scheduledAt = new Date(round.scheduledAt);
      if (scheduledAt < now || scheduledAt > next24Hours) continue;

      const createdNotification = await createUniqueReminder({
        userId: user._id,
        type: 'interview',
        title: `${round.roundName} reminder`,
        message: `${round.roundName} for ${application.job?.title || 'your application'} is coming up within 24 hours.`,
        metadata: {
          applicationId: application._id,
          roundId: round._id,
          scheduledAt,
          reminderKey: `candidate-interview-${application._id}-${round._id}`
        }
      });
      if (createdNotification) created += 1;
    }
  }

  for (const offer of offers) {
    const sentAt = new Date(offer.sentAt || offer.createdAt || now);
    const expiryDate = new Date(sentAt.getTime() + 5 * 24 * 60 * 60 * 1000);
    if (expiryDate < now || expiryDate > next24Hours) continue;

    const createdNotification = await createUniqueReminder({
      userId: user._id,
      type: 'offer',
      title: 'Offer response reminder',
      message: `${offer.job?.title || offer.title} offer is nearing its response window.`,
      metadata: {
        offerId: offer._id,
        applicationId: offer.application,
        reminderKey: `candidate-offer-${offer._id}`
      }
    });
    if (createdNotification) created += 1;
  }

  return created;
}

async function processEmployerReminders(user) {
  const now = new Date();
  const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  let created = 0;

  const [applications, approvals, offers, jobs] = await Promise.all([
    Application.find({ employerUser: user._id }).populate('candidateUser', 'name').populate('job', 'title').lean(),
    HiringApproval.find({ employerUser: user._id, status: 'pending' }).lean(),
    Offer.find({ employerUser: user._id, status: 'sent' }).populate('job', 'title').lean(),
    Job.find({ employerUser: user._id, reviewStatus: JOB_REVIEW_STATUS.APPROVED }).select('title expiresAt').lean()
  ]);

  for (const application of applications) {
    for (const round of application.interviewRounds || []) {
      if (round.status === 'reschedule_requested') {
        const createdNotification = await createUniqueReminder({
          userId: user._id,
          type: 'approval',
          title: 'Interview reschedule request pending',
          message: `${application.candidateUser?.name || 'Candidate'} requested a change for ${round.roundName}.`,
          metadata: {
            applicationId: application._id,
            roundId: round._id,
            reminderKey: `employer-reschedule-${application._id}-${round._id}`
          }
        });
        if (createdNotification) created += 1;
      }

      if (!round.scheduledAt || round.status !== 'scheduled') continue;
      const scheduledAt = new Date(round.scheduledAt);
      if (scheduledAt < now || scheduledAt > next24Hours) continue;

      const createdNotification = await createUniqueReminder({
        userId: user._id,
        type: 'interview',
        title: `${round.roundName} starts soon`,
        message: `${application.candidateUser?.name || 'Candidate'} interview for ${application.job?.title || 'role'} is within 24 hours.`,
        metadata: {
          applicationId: application._id,
          roundId: round._id,
          reminderKey: `employer-interview-${application._id}-${round._id}`
        }
      });
      if (createdNotification) created += 1;
    }
  }

  for (const approval of approvals) {
    const dueAt = approval.dueAt ? new Date(approval.dueAt) : null;
    if (!dueAt || dueAt < now || dueAt > next24Hours) continue;
    const createdNotification = await createUniqueReminder({
      userId: user._id,
      type: 'approval',
      title: 'Approval due soon',
      message: `${approval.title} is due within 24 hours.`,
      metadata: {
        approvalId: approval._id,
        priority: approval.priority,
        reminderKey: `employer-approval-${approval._id}`
      }
    });
    if (createdNotification) created += 1;
  }

  for (const offer of offers) {
    const sentAt = new Date(offer.sentAt || offer.createdAt || now);
    const expiryDate = new Date(sentAt.getTime() + 5 * 24 * 60 * 60 * 1000);
    if (expiryDate < now || expiryDate > next24Hours) continue;
    const createdNotification = await createUniqueReminder({
      userId: user._id,
      type: 'offer',
      title: 'Offer awaiting response',
      message: `${offer.job?.title || offer.title} offer response window is closing soon.`,
      metadata: {
        offerId: offer._id,
        reminderKey: `employer-offer-${offer._id}`
      }
    });
    if (createdNotification) created += 1;
  }

  for (const job of jobs) {
    if (!job.expiresAt) continue;
    const expiresAt = new Date(job.expiresAt);
    if (expiresAt < now || expiresAt > next24Hours) continue;
    const createdNotification = await createUniqueReminder({
      userId: user._id,
      type: 'status_update',
      title: 'Job closing soon',
      message: `${job.title} will expire within 24 hours.`,
      metadata: {
        jobId: job._id,
        reminderKey: `employer-job-${job._id}`
      }
    });
    if (createdNotification) created += 1;
  }

  return created;
}

async function processAdminReminders(user) {
  const now = new Date();
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  let created = 0;

  const [pendingJobs, pendingApplications] = await Promise.all([
    Job.find({ reviewStatus: JOB_REVIEW_STATUS.PENDING, createdAt: { $lte: twoDaysAgo } }).select('title').lean(),
    Application.find({ status: 'pending', createdAt: { $lte: twoDaysAgo } }).populate('job', 'title').populate('candidateUser', 'name').lean()
  ]);

  for (const job of pendingJobs) {
    const createdNotification = await createUniqueReminder({
      userId: user._id,
      type: 'job_review',
      title: 'Job moderation overdue',
      message: `${job.title} has been pending review for more than 2 days.`,
      metadata: {
        jobId: job._id,
        reminderKey: `admin-job-${job._id}`
      }
    });
    if (createdNotification) created += 1;
  }

  for (const application of pendingApplications) {
    const createdNotification = await createUniqueReminder({
      userId: user._id,
      type: 'application',
      title: 'Application review backlog',
      message: `${application.candidateUser?.name || 'Candidate'} for ${application.job?.title || 'role'} is still pending review.`,
      metadata: {
        applicationId: application._id,
        reminderKey: `admin-application-${application._id}`
      }
    });
    if (createdNotification) created += 1;
  }

  return created;
}

async function processReminderNotificationsForUser(user) {
  if (!user?._id || !user.role) return { created: 0 };

  let created = 0;
  if (user.role === ROLES.CANDIDATE) created = await processCandidateReminders(user);
  else if (user.role === ROLES.EMPLOYER) created = await processEmployerReminders(user);
  else if (user.role === ROLES.ADMIN) created = await processAdminReminders(user);

  return { created };
}

async function processReminderNotificationsForAllUsers() {
  const users = await User.find({ role: { $in: [ROLES.CANDIDATE, ROLES.EMPLOYER, ROLES.ADMIN] } }).select('_id role').lean();
  let created = 0;
  for (const user of users) {
    const result = await processReminderNotificationsForUser(user);
    created += result.created;
  }
  return { created };
}

module.exports = {
  processReminderNotificationsForUser,
  processReminderNotificationsForAllUsers
};
