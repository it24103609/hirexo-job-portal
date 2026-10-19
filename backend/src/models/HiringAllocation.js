const mongoose = require('mongoose');

const hiringAllocationSchema = new mongoose.Schema(
  {
    employerUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
      index: true
    },
    teamMember: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HiringTeamMember',
      required: true,
      index: true
    },
    allocationType: {
      type: String,
      enum: ['recruiter', 'interviewer', 'coordinator', 'approver'],
      default: 'recruiter'
    },
    roundName: {
      type: String,
      trim: true
    },
    workloadPercent: {
      type: Number,
      min: 0,
      max: 100,
      default: 50
    },
    status: {
      type: String,
      enum: ['active', 'paused', 'completed'],
      default: 'active'
    },
    notes: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
);

hiringAllocationSchema.index({ employerUser: 1, job: 1, teamMember: 1, allocationType: 1 }, { unique: true });

module.exports = mongoose.model('HiringAllocation', hiringAllocationSchema);
