const mongoose = require('mongoose');

const employerTalentSchema = new mongoose.Schema(
  {
    employerUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    candidateUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application'
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job'
    },
    sourceType: {
      type: String,
      enum: ['application', 'manual'],
      default: 'application'
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      trim: true
    },
    location: {
      type: String,
      trim: true
    },
    headline: {
      type: String,
      trim: true
    },
    currentCompany: {
      type: String,
      trim: true
    },
    experienceYears: {
      type: Number,
      default: 0
    },
    skills: [{ type: String, trim: true }],
    tags: [{ type: String, trim: true }],
    stage: {
      type: String,
      enum: ['new', 'reviewing', 'contacted', 'nurturing', 'archived'],
      default: 'new'
    },
    notes: {
      type: String,
      trim: true
    },
    lastContactedAt: Date
  },
  { timestamps: true }
);

employerTalentSchema.index(
  { employerUser: 1, candidateUser: 1, job: 1 },
  {
    unique: true,
    partialFilterExpression: {
      candidateUser: { $exists: true }
    }
  }
);

module.exports = mongoose.model('EmployerTalent', employerTalentSchema);
