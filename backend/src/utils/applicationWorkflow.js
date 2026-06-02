const AppError = require('./AppError');
const { APPLICATION_STATUS } = require('./constants');

const FINAL_STATUSES = new Set([
  APPLICATION_STATUS.HIRED,
  APPLICATION_STATUS.REJECTED
]);

const ALLOWED_STATUS_TRANSITIONS = Object.freeze({
  [APPLICATION_STATUS.PENDING]: [
    APPLICATION_STATUS.REVIEWED,
    APPLICATION_STATUS.SHORTLISTED,
    APPLICATION_STATUS.INTERVIEW_SCHEDULED,
    APPLICATION_STATUS.REJECTED
  ],
  [APPLICATION_STATUS.REVIEWED]: [
    APPLICATION_STATUS.SHORTLISTED,
    APPLICATION_STATUS.INTERVIEW_SCHEDULED,
    APPLICATION_STATUS.REJECTED
  ],
  [APPLICATION_STATUS.SHORTLISTED]: [
    APPLICATION_STATUS.INTERVIEW_SCHEDULED,
    APPLICATION_STATUS.HIRED,
    APPLICATION_STATUS.REJECTED
  ],
  [APPLICATION_STATUS.INTERVIEW_SCHEDULED]: [
    APPLICATION_STATUS.SHORTLISTED,
    APPLICATION_STATUS.HIRED,
    APPLICATION_STATUS.REJECTED
  ],
  [APPLICATION_STATUS.HIRED]: [],
  [APPLICATION_STATUS.REJECTED]: []
});

function assertValidStatusTransition(currentStatus, nextStatus) {
  if (currentStatus === nextStatus) return;

  if (FINAL_STATUSES.has(currentStatus)) {
    throw new AppError(`Cannot move application from final status ${currentStatus}`, 400);
  }

  const allowed = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(nextStatus)) {
    throw new AppError(`Invalid application status transition from ${currentStatus} to ${nextStatus}`, 400);
  }
}

function parseFutureDate(value, fieldName = 'Date and time') {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new AppError(`${fieldName} is invalid`, 400);
  }

  if (date <= new Date()) {
    throw new AppError(`${fieldName} must be in the future`, 400);
  }

  return date;
}

module.exports = {
  assertValidStatusTransition,
  parseFutureDate
};
