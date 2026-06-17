const mongoose = require('mongoose');

const applicationMessageSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
      index: true
    },
    senderUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    recipientUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    message: {
      type: String,
      default: '',
      trim: true,
      maxlength: 1000
    },
    attachment: {
      fileName: { type: String, default: '' },
      filePath: { type: String, default: '' },
      mimeType: { type: String, default: '' },
      size: { type: Number, default: 0 }
    }
  },
  { timestamps: true }
);

applicationMessageSchema.index({ application: 1, createdAt: 1 });

module.exports = mongoose.model('ApplicationMessage', applicationMessageSchema);