const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    phone: {
      type: String,
      trim: true
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    message: {
      type: String,
      required: true,
      minlength: 20,
      maxlength: 5000
    },
    status: {
      type: String,
      enum: ['new', 'read', 'replied'],
      default: 'new',
      index: true
    },
    reply: {
      message: String,
      repliedAt: Date,
      repliedBy: mongoose.Schema.Types.ObjectId
    },
    ipAddress: String
  },
  { timestamps: true }
);

contactSchema.index({ email: 1, createdAt: -1 });
contactSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Contact', contactSchema);
