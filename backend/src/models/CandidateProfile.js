const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema(
  {
    institution: String,
    degree: String,
    year: String
  },
  { _id: false }
);

const resumeSchema = new mongoose.Schema(
  {
    fileName: String,
    filePath: String,
    mimeType: String,
    size: Number,
    uploadedAt: Date
  },
  { _id: false }
);

const profilePictureSchema = new mongoose.Schema(
  {
    fileName: String,
    filePath: String,
    mimeType: String,
    size: Number,
    uploadedAt: Date
  },
  { _id: false }
);

const candidateProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    headline: {
      type: String,
      trim: true
    },
    summary: {
      type: String,
      trim: true
    },
    phone: String,
    location: String,
    skills: [{ type: String, trim: true }],
    experienceYears: {
      type: Number,
      min: 0,
      default: 0
    },
    education: [educationSchema],
    currentCompany: String,
    expectedSalaryMin: Number,
    expectedSalaryMax: Number,
    preferredLocations: [{ type: String, trim: true }],
    preferredJobTypes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'JobType' }],
    socialLinks: {
      linkedin: String,
      portfolio: String,
      github: String
    },
    profilePicture: profilePictureSchema,
    resume: resumeSchema,
    savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }]
  },
  { timestamps: true }
);

module.exports = mongoose.model('CandidateProfile', candidateProfileSchema);
