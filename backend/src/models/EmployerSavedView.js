const mongoose = require('mongoose');

const employerSavedViewSchema = new mongoose.Schema(
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
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job'
    },
    filters: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  { timestamps: true }
);

employerSavedViewSchema.index({ employerUser: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('EmployerSavedView', employerSavedViewSchema);
