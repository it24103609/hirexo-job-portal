const mongoose = require('mongoose');
const { APPLICATION_STATUS } = require('../utils/constants');

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
    notes: String,
    viewedAt: Date,
    shortlistedAt: Date,
    rejectedAt: Date
  },
  { timestamps: true }
);

applicationSchema.index({ job: 1, candidateUser: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
