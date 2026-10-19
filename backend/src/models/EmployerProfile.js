const mongoose = require('mongoose');

const employerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    website: String,
    description: String,
    logoUrl: String,
    size: String,
    contactPerson: String,
    contactPhone: String,
    verified: {
      type: Boolean,
      default: false
    },
    industry: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Industry'
    },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location'
    },
    address: String
  },
  { timestamps: true }
);

module.exports = mongoose.model('EmployerProfile', employerProfileSchema);
