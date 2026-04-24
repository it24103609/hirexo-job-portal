const mongoose = require('mongoose');
const { APPLICATION_STATUS } = require('../utils/constants');

const interviewSlotSchema = new mongoose.Schema(
  {
    startsAt: {
      type: Date,
      required: true
    },
    endsAt: {
      type: Date,
      required: true
    },
    mode: {
      type: String,
      enum: ['phone', 'video', 'onsite'],
      default: 'video'
    },
    location: String,
    meetingLink: String,
    notes: String,
    isBooked: {
      type: Boolean,
      default: false
    },
    bookedAt: Date
  },
  { _id: true }
);

const interviewPanelMemberSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HiringTeamMember'
    },
    name: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    title: {
      type: String,
      trim: true
    }
  },
  { _id: true }
);

const interviewRoundSchema = new mongoose.Schema(
  {
    roundName: {
      type: String,
      required: true,
      trim: true
    },
    order: {
      type: Number,
      default: 1,
      min: 1
    },
    status: {
      type: String,
      enum: ['draft', 'slots_shared', 'scheduled', 'completed', 'cancelled', 'reschedule_requested', 'no_show'],
      default: 'draft'
    },
    scheduledAt: Date,
    durationMinutes: {
      type: Number,
      default: 45,
      min: 15
    },
    mode: {
      type: String,
      enum: ['phone', 'video', 'onsite'],
      default: 'video'
    },
    location: String,
    meetingLink: String,
    notes: String,
    panelInterviewers: [interviewPanelMemberSchema],
    interviewSlots: [interviewSlotSchema],
    reminderSentAt: Date,
    reminderLeadHours: {
      type: Number,
      default: 24
    },
    cancelledAt: Date,
    cancellationReason: String,
    completedAt: Date,
    noShowAt: Date,
    noShowReason: String,
    rescheduleRequestedAt: Date,
    rescheduleRequestReason: String,
    feedback: {
      communication: Number,
      technicalSkills: Number,
      confidence: Number,
      cultureFit: Number,
      recommendation: {
        type: String,
        enum: ['strong_yes', 'yes', 'maybe', 'no']
      },
      summary: String,
      submittedAt: Date
    }
  },
  { _id: true }
);

const interviewTimelineSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      trim: true
    },
    actorRole: {
      type: String,
      trim: true
    },
    actorUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    roundId: mongoose.Schema.Types.ObjectId,
    summary: {
      type: String,
      trim: true
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: true }
);

const screeningAnswerSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    question: {
      type: String,
      required: true,
      trim: true
    },
    answer: {
      type: String,
      trim: true
    },
    type: {
      type: String,
      enum: ['text', 'textarea', 'yes_no', 'number', 'select'],
      default: 'text'
    },
    knockout: {
      type: Boolean,
      default: false
    }
  },
  { _id: false }
);

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
      index: true
    },
    candidateUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    employerUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: Object.values(APPLICATION_STATUS),
      default: APPLICATION_STATUS.PENDING,
      index: true
    },
    candidateSource: {
      type: String,
      trim: true,
      default: 'Hirexo Portal'
    },
    rejectionReason: {
      type: String,
      trim: true
    },
    coverLetter: String,
    screeningAnswers: [screeningAnswerSchema],
    resumeSnapshot: {
      fileName: String,
      filePath: String,
      size: Number
    },
    interviewScheduledAt: Date,
    interviewMode: {
      type: String,
      enum: ['phone', 'video', 'onsite']
    },
    interviewLocation: String,
    interviewMeetingLink: String,
    interviewNotes: String,
    interviewSlots: [interviewSlotSchema],
    interviewRounds: [interviewRoundSchema],
    interviewTimeline: [interviewTimelineSchema],
    interviewFeedback: {
      communication: Number,
      technicalSkills: Number,
      confidence: Number,
      cultureFit: Number,
      recommendation: {
        type: String,
        enum: ['strong_yes', 'yes', 'maybe', 'no']
      },
      summary: String,
      submittedAt: Date
    },
    notes: String,
    viewedAt: Date,
    shortlistedAt: Date,
    hiredAt: Date,
    rejectedAt: Date
  },
  { timestamps: true }
);

applicationSchema.index({ job: 1, candidateUser: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
