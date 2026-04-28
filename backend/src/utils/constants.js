const ROLES = Object.freeze({
  ADMIN: 'admin',
  EMPLOYER: 'employer',
  CANDIDATE: 'candidate'
});

const USER_STATUS = Object.freeze({
  ACTIVE: 'active',
  BLOCKED: 'blocked'
});

const JOB_REVIEW_STATUS = Object.freeze({
  DRAFT: 'draft',
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
});

const JOB_STATUS = Object.freeze({
  DRAFT: 'draft',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  EXPIRED: 'expired'
});

const APPLICATION_STATUS = Object.freeze({
  PENDING: 'pending',
  REVIEWED: 'reviewed',
  INTERVIEW_SCHEDULED: 'interview_scheduled',
  SHORTLISTED: 'shortlisted',
  HIRED: 'hired',
  REJECTED: 'rejected'
});

const NOTIFICATION_TYPES = Object.freeze({
  REGISTRATION: 'registration',
  APPLICATION: 'application',
  STATUS_UPDATE: 'status_update',
  JOB_REVIEW: 'job_review',
  INTERVIEW: 'interview',
  MESSAGE: 'message'
});

module.exports = {
  ROLES,
  USER_STATUS,
  JOB_REVIEW_STATUS,
  JOB_STATUS,
  APPLICATION_STATUS,
  NOTIFICATION_TYPES
};
