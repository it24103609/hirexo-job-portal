const { Schema, model } = require('mongoose');

const emailLogSchema = new Schema(
  {
    to: {
      type: String,
      required: true,
      index: true
    },
    subject: {
      type: String,
      required: true
    },
    text: {
      type: String
    },
    html: {
      type: String
    },
    status: {
      type: String,
      enum: ['sent', 'failed', 'skipped'],
      required: true,
      index: true
    },
    skipped: {
      type: Boolean,
      default: false
    },
    provider: {
      type: String,
      default: 'smtp'
    },
    messageId: {
      type: String
    },
    accepted: {
      type: [String],
      default: []
    },
    rejected: {
      type: [String],
      default: []
    },
    response: {
      type: String
    },
    previewUrl: {
      type: String
    },
    error: {
      type: String
    }
  },
  { timestamps: true }
);

module.exports = model('EmailLog', emailLogSchema);
