const { APPLICATION_STATUS } = require('./constants');

function normalizeDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function createRoundPayload({
  roundName = 'Interview Round 1',
  order = 1,
  status = 'draft',
  scheduledAt = null,
  durationMinutes = 45,
  mode = 'video',
  location = '',
  meetingLink = '',
  notes = '',
  panelInterviewers = [],
  interviewSlots = []
} = {}) {
  return {
    roundName,
    order,
    status,
    scheduledAt: normalizeDate(scheduledAt),
    durationMinutes,
    mode,
    location,
    meetingLink,
    notes,
    panelInterviewers,
    interviewSlots
  };
}

function ensureInterviewRounds(application) {
  if (Array.isArray(application.interviewRounds) && application.interviewRounds.length) {
    return application.interviewRounds;
  }

  const hasLegacyInterviewData = application.interviewScheduledAt || application.interviewSlots?.length;
  if (!hasLegacyInterviewData) {
    application.interviewRounds = [];
    return application.interviewRounds;
  }

  application.interviewRounds = [createRoundPayload({
    roundName: 'Interview Round 1',
    order: 1,
    status: application.interviewScheduledAt ? 'scheduled' : application.interviewSlots?.length ? 'slots_shared' : 'draft',
    scheduledAt: application.interviewScheduledAt,
    mode: application.interviewMode || 'video',
    location: application.interviewLocation || '',
    meetingLink: application.interviewMeetingLink || '',
    notes: application.interviewNotes || '',
    interviewSlots: application.interviewSlots || []
  })];

  return application.interviewRounds;
}

function getInterviewRoundById(application, roundId) {
  ensureInterviewRounds(application);
  if (!roundId) return application.interviewRounds[0] || null;
  return application.interviewRounds.id ? application.interviewRounds.id(roundId) : application.interviewRounds.find((round) => String(round._id) === String(roundId));
}

function getPrimaryInterviewRound(application) {
  ensureInterviewRounds(application);
  const rounds = [...(application.interviewRounds || [])].sort((left, right) => (left.order || 0) - (right.order || 0));
  return rounds.find((round) => ['scheduled', 'slots_shared', 'reschedule_requested', 'no_show'].includes(round.status))
    || rounds.find((round) => round.scheduledAt)
    || rounds[0]
    || null;
}

function syncLegacyInterviewFields(application) {
  const round = getPrimaryInterviewRound(application);

  if (!round) {
    application.interviewScheduledAt = undefined;
    application.interviewMode = undefined;
    application.interviewLocation = undefined;
    application.interviewMeetingLink = undefined;
    application.interviewNotes = undefined;
    application.interviewSlots = [];
    return application;
  }

  application.interviewScheduledAt = round.scheduledAt || undefined;
  application.interviewMode = round.mode || undefined;
  application.interviewLocation = round.location || undefined;
  application.interviewMeetingLink = round.meetingLink || undefined;
  application.interviewNotes = round.notes || undefined;
  application.interviewSlots = round.interviewSlots || [];

  if (round.feedback?.submittedAt) {
    application.interviewFeedback = round.feedback;
  }

  if (round.status === 'scheduled') {
    application.status = application.status === APPLICATION_STATUS.HIRED ? application.status : APPLICATION_STATUS.INTERVIEW_SCHEDULED;
  }

  return application;
}

function pushInterviewTimeline(application, entry = {}) {
  application.interviewTimeline = application.interviewTimeline || [];
  application.interviewTimeline.push({
    action: entry.action || 'updated',
    actorRole: entry.actorRole || 'system',
    actorUser: entry.actorUser || undefined,
    roundId: entry.roundId || undefined,
    summary: entry.summary || '',
    metadata: entry.metadata || {},
    createdAt: new Date()
  });
}

module.exports = {
  normalizeDate,
  createRoundPayload,
  ensureInterviewRounds,
  getInterviewRoundById,
  getPrimaryInterviewRound,
  syncLegacyInterviewFields,
  pushInterviewTimeline
};
