const mongoose = require('mongoose');

const platformSettingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
      default: 'default'
    },
    aiScoring: {
      skillsWeight: { type: Number, default: 60, min: 0, max: 100 },
      experienceWeight: { type: Number, default: 20, min: 0, max: 100 },
      locationWeight: { type: Number, default: 10, min: 0, max: 100 },
      profileWeight: { type: Number, default: 10, min: 0, max: 100 },
      highFitThreshold: { type: Number, default: 80, min: 1, max: 100 },
      moderateFitThreshold: { type: Number, default: 60, min: 1, max: 100 }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('PlatformSetting', platformSettingSchema);
