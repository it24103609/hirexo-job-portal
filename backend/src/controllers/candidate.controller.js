const fs = require('fs');
const path = require('path');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const apiResponse = require('../utils/apiResponse');
const CandidateProfile = require('../models/CandidateProfile');
const Application = require('../models/Application');
const Job = require('../models/Job');

function normalizeArray(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (typeof value === 'string' && value.trim()) {
    return value.split(',').map((item) => item.trim()).filter(Boolean);
  }

  return [];
}

const getProfile = asyncHandler(async (req, res) => {
  const profile = await CandidateProfile.findOne({ user: req.user._id })
    .populate('preferredJobTypes')
    .populate('savedJobs');

  res.json(apiResponse({
    message: 'Candidate profile fetched successfully',
    data: profile
  }));
});

const upsertProfile = asyncHandler(async (req, res) => {
  const payload = {
    headline: req.body.headline,
    summary: req.body.summary,
    phone: req.body.phone,
    location: req.body.location,
    skills: normalizeArray(req.body.skills),
    experienceYears: req.body.experienceYears,
    education: Array.isArray(req.body.education) ? req.body.education : [],
    currentCompany: req.body.currentCompany,
    expectedSalaryMin: req.body.expectedSalaryMin,
    expectedSalaryMax: req.body.expectedSalaryMax,
    preferredLocations: normalizeArray(req.body.preferredLocations),
    preferredJobTypes: normalizeArray(req.body.preferredJobTypes),
    socialLinks: req.body.socialLinks || {}
  };

  const profile = await CandidateProfile.findOneAndUpdate(
    { user: req.user._id },
    { $set: payload, $setOnInsert: { user: req.user._id, savedJobs: [] } },
    { new: true, upsert: true, runValidators: true }
  );

  res.json(apiResponse({
    message: 'Candidate profile saved successfully',
    data: profile
  }));
});

const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError('Resume file is required', 400);
  }

  const profile = await CandidateProfile.findOneAndUpdate(
    { user: req.user._id },
    { $setOnInsert: { user: req.user._id, savedJobs: [] } },
    { new: true, upsert: true }
  );

  if (profile.resume?.filePath && fs.existsSync(profile.resume.filePath)) {
    fs.unlinkSync(profile.resume.filePath);
  }

  profile.resume = {
    fileName: req.file.originalname,
    filePath: req.file.path,
    mimeType: req.file.mimetype,
    size: req.file.size,
    uploadedAt: new Date()
  };

  await profile.save();

  res.status(201).json(apiResponse({
    message: 'Resume uploaded successfully',
    data: profile.resume
  }));
});

const getResume = asyncHandler(async (req, res) => {
  const profile = await CandidateProfile.findOne({ user: req.user._id }).select('resume');

  res.json(apiResponse({
    message: 'Resume fetched successfully',
    data: profile?.resume || null
  }));
});

const downloadResume = asyncHandler(async (req, res) => {
  const profile = await CandidateProfile.findOne({ user: req.user._id }).select('resume');
  if (!profile?.resume?.filePath || !fs.existsSync(profile.resume.filePath)) {
    throw new AppError('Resume not found', 404);
  }

  res.download(path.resolve(profile.resume.filePath), profile.resume.fileName);
});

const deleteResume = asyncHandler(async (req, res) => {
  const profile = await CandidateProfile.findOne({ user: req.user._id });
  if (!profile || !profile.resume) {
    throw new AppError('Resume not found', 404);
  }

  if (profile.resume.filePath && fs.existsSync(profile.resume.filePath)) {
    fs.unlinkSync(profile.resume.filePath);
  }

  profile.resume = undefined;
  await profile.save();

  res.json(apiResponse({
    message: 'Resume deleted successfully'
  }));
});

const listApplications = asyncHandler(async (req, res) => {
  const applications = await Application.find({ candidateUser: req.user._id })
    .populate('job', 'title slug companyName status reviewStatus location jobType')
    .populate('employerUser', 'name email')
    .sort({ createdAt: -1 });

  res.json(apiResponse({
    message: 'Candidate applications fetched successfully',
    data: applications
  }));
});

const listSavedJobs = asyncHandler(async (req, res) => {
  const profile = await CandidateProfile.findOne({ user: req.user._id }).populate('savedJobs');
  res.json(apiResponse({
    message: 'Saved jobs fetched successfully',
    data: profile?.savedJobs || []
  }));
});

const saveJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.jobId);
  if (!job) {
    throw new AppError('Job not found', 404);
  }

  const profile = await CandidateProfile.findOneAndUpdate(
    { user: req.user._id },
    { $addToSet: { savedJobs: job._id }, $setOnInsert: { user: req.user._id } },
    { new: true, upsert: true }
  );

  res.json(apiResponse({
    message: 'Job saved successfully',
    data: profile.savedJobs
  }));
});

const unsaveJob = asyncHandler(async (req, res) => {
  const profile = await CandidateProfile.findOneAndUpdate(
    { user: req.user._id },
    { $pull: { savedJobs: req.params.jobId } },
    { new: true }
  );

  res.json(apiResponse({
    message: 'Job removed from saved list successfully',
    data: profile?.savedJobs || []
  }));
});

const uploadProfilePicture = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError('Profile picture file is required', 400);
  }

  const profile = await CandidateProfile.findOneAndUpdate(
    { user: req.user._id },
    { $setOnInsert: { user: req.user._id, savedJobs: [] } },
    { new: true, upsert: true }
  );

  if (profile.profilePicture?.filePath && fs.existsSync(profile.profilePicture.filePath)) {
    fs.unlinkSync(profile.profilePicture.filePath);
  }

  profile.profilePicture = {
    fileName: req.file.originalname,
    filePath: req.file.path,
    mimeType: req.file.mimetype,
    size: req.file.size,
    uploadedAt: new Date()
  };

  await profile.save();

  res.status(201).json(apiResponse({
    message: 'Profile picture uploaded successfully',
    data: profile.profilePicture
  }));
});

const getProfilePicture = asyncHandler(async (req, res) => {
  const profile = await CandidateProfile.findOne({ user: req.user._id }).select('profilePicture');

  res.json(apiResponse({
    message: 'Profile picture fetched successfully',
    data: profile?.profilePicture || null
  }));
});

const downloadProfilePicture = asyncHandler(async (req, res) => {
  const profile = await CandidateProfile.findOne({ user: req.user._id }).select('profilePicture');
  if (!profile?.profilePicture?.filePath || !fs.existsSync(profile.profilePicture.filePath)) {
    throw new AppError('Profile picture not found', 404);
  }

  res.download(path.resolve(profile.profilePicture.filePath), profile.profilePicture.fileName);
});

const deleteProfilePicture = asyncHandler(async (req, res) => {
  const profile = await CandidateProfile.findOne({ user: req.user._id });
  if (!profile || !profile.profilePicture) {
    throw new AppError('Profile picture not found', 404);
  }

  if (profile.profilePicture.filePath && fs.existsSync(profile.profilePicture.filePath)) {
    fs.unlinkSync(profile.profilePicture.filePath);
  }

  profile.profilePicture = undefined;
  await profile.save();

  res.json(apiResponse({
    message: 'Profile picture deleted successfully'
  }));
});

const viewProfilePicture = asyncHandler(async (req, res) => {
  const profile = await CandidateProfile.findOne({ user: req.user._id }).select('profilePicture');
  if (!profile?.profilePicture?.filePath || !fs.existsSync(profile.profilePicture.filePath)) {
    throw new AppError('Profile picture not found', 404);
  }

  res.setHeader('Content-Type', profile.profilePicture.mimeType);
  res.sendFile(path.resolve(profile.profilePicture.filePath));
});

module.exports = {
  getProfile,
  upsertProfile,
  uploadResume,
  getResume,
  downloadResume,
  deleteResume,
  uploadProfilePicture,
  getProfilePicture,
  viewProfilePicture,
  downloadProfilePicture,
  deleteProfilePicture,
  listApplications,
  listSavedJobs,
  saveJob,
  unsaveJob
};
