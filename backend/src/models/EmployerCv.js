const mongoose = require('mongoose');

const employerCvSchema = new mongoose.Schema(
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
      trim: true,
      maxlength: 120
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 254
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 40
    },
    jobTitle: {
      type: String,
      trim: true,
      maxlength: 160
    },
    fileName: {
      type: String,
      required: true,
      maxlength: 180
    },
    mimeType: {
      type: String,
      default: 'application/pdf'
    },
    size: {
      type: Number,
      required: true
    },
    content: {
      type: Buffer,
      required: true,
      select: false
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

employerCvSchema.index({ employerUser: 1, uploadedAt: -1 });

module.exports = mongoose.model('EmployerCv', employerCvSchema);
