const mongoose = require('mongoose');

const hiringTeamMemberSchema = new mongoose.Schema(
  {
    employerUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    title: {
      type: String,
      trim: true
    },
    permissions: [{
      type: String,
      enum: ['jobs', 'applicants', 'messages', 'offers', 'analytics']
    }],
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    },
    notes: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
);

hiringTeamMemberSchema.index({ employerUser: 1, email: 1 }, { unique: true });

module.exports = mongoose.model('HiringTeamMember', hiringTeamMemberSchema);
