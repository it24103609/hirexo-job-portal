const mongoose = require('mongoose');

const candidateVerificationSchema = new mongoose.Schema(
  {
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    emailVerified: {
      type: Boolean,
      default: false
    },
    phoneVerified: {
      type: Boolean,
      default: false
    },
    identityVerified: {
      type: Boolean,
      default: false
    },
    backgroundCheckVerified: {
      type: Boolean,
      default: false
    },
    overallVerified: {
      type: Boolean,
      default: false
    },
    verificationBadge: {
      type: Boolean,
      default: false
    },
    verifiedAt: Date,
    verificationScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    documents: [
      {
        type: {
          type: String,
          enum: ['IDENTITY', 'CERTIFICATE', 'EXPERIENCE_LETTER', 'DEGREE']
        },
        fileName: String,
        filePath: String,
        verificationStatus: {
          type: String,
          enum: ['PENDING', 'VERIFIED', 'REJECTED'],
          default: 'PENDING'
        },
        uploadedAt: Date,
        verifiedAt: Date
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('CandidateVerification', candidateVerificationSchema);
