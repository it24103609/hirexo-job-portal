const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema(
  {
    employerUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
      index: true
    },
    candidateUser: {
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
    title: {
      type: String,
      required: true,
      trim: true
    },
    salary: Number,
    currency: {
      type: String,
      default: 'LKR'
    },
    status: {
      type: String,
      enum: ['draft', 'sent', 'accepted', 'declined'],
      default: 'draft'
    },
    joiningDate: Date,
    notes: {
      type: String,
      trim: true
    },
    preparedByName: {
      type: String,
      trim: true
    },
    sentAt: Date,
    respondedAt: Date
  },
  { timestamps: true }
);

offerSchema.index({ employerUser: 1, application: 1 }, { unique: true });

module.exports = mongoose.model('Offer', offerSchema);
