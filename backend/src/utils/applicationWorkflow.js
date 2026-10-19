const AppError = require('./AppError');
const { APPLICATION_STATUS } = require('./constants');

const VALID_STATUSES = new Set(Object.values(APPLICATION_STATUS));

function assertValidStatusTransition(currentStatus, nextStatus) {
  if (currentStatus === nextStatus) return;

  if (!VALID_STATUSES.has(nextStatus)) {
    throw new AppError(`Invalid application status: ${nextStatus}`, 400);
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
