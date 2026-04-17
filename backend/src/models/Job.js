const mongoose = require('mongoose');
const { JOB_REVIEW_STATUS, JOB_STATUS } = require('../utils/constants');

const jobSchema = new mongoose.Schema(
  {
    employerUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    companyName: {
      type: String,
      required: true,
      trim: true
    },
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      index: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    category: {
      type: String,
      trim: true,
      index: true
    },
    industry: {
      type: String,
      trim: true,
      index: true
    },
    location: {
      type: String,
      trim: true,
      index: true
    },
    jobType: {
      type: String,
      trim: true,
      index: true
    },
    description: {
      type: String,
      required: [true, 'Description is required']
    },
    image: {
      url: { type: String, trim: true },
      alt: { type: String, trim: true }
    },
    responsibilities: [{ type: String, trim: true }],
    requirements: [{ type: String, trim: true }],
    skills: [{ type: String, trim: true }],
    experienceLevel: String,
    salaryMin: Number,
    salaryMax: Number,
    currency: {
      type: String,
      default: 'INR'
    },
    vacancies: {
      type: Number,
      default: 1,
      min: 1
    },
    remoteFriendly: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      enum: Object.values(JOB_STATUS),
      default: JOB_STATUS.ACTIVE,
      index: true
    },
    reviewStatus: {
      type: String,
      enum: Object.values(JOB_REVIEW_STATUS),
      default: JOB_REVIEW_STATUS.PENDING,
      index: true
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date,
    publishedAt: Date,
    expiresAt: Date,
    tags: [{ type: String, trim: true }]
  },
  { timestamps: true }
);

jobSchema.index({ employerUser: 1, reviewStatus: 1, status: 1 });

module.exports = mongoose.model('Job', jobSchema);
