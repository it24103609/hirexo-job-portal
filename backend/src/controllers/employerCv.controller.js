const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const apiResponse = require('../utils/apiResponse');
const Application = require('../models/Application');
const CandidateProfile = require('../models/CandidateProfile');
const EmployerCv = require('../models/EmployerCv');

function resolveStoredFilePath(filePath) {
  if (!filePath) return null;

  const candidates = [
    path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath),
    path.resolve(__dirname, '../../..', filePath)
  ];

  return candidates.find((candidate) => fs.existsSync(candidate)) || null;
}

function readTextField(value, label, maxLength, required = false) {
  if (value !== undefined && typeof value !== 'string') {
    throw new AppError(`${label} must be text`, 400);
  }

  const text = (value || '').trim();
  if (required && !text) {
    throw new AppError(`${label} is required`, 400);
  }
  if (text.length > maxLength) {
    throw new AppError(`${label} must be ${maxLength} characters or fewer`, 400);
  }
  if (/[\x00-\x1f\x7f-\x9f]/.test(text)) {
    throw new AppError(`${label} contains invalid characters`, 400);
  }
  return text;
}

function safePdfFileName(originalName) {
  const baseName = path.posix.basename(String(originalName || 'cv.pdf').replace(/\\/g, '/'));
  const stem = baseName.replace(/\.pdf$/i, '').replace(/[\x00-\x1f\x7f-\x9f"'\u200e-\u200f\u202a-\u202e\u2066-\u2069]/g, '');
  return `${stem.slice(0, 176).trim().replace(/[. ]+$/g, '') || 'cv'}.pdf`;
}

function uploadedItem(cv) {
  return {
    id: String(cv._id),
    source: 'uploaded',
    name: cv.name,
    email: cv.email || '',
    phone: cv.phone || '',
    jobTitle: cv.jobTitle || '',
    fileName: cv.fileName,
    size: cv.size,
    uploadedAt: cv.uploadedAt
  };
}

const listCvs = asyncHandler(async (req, res) => {
  const [applications, uploads] = await Promise.all([
    Application.find({ employerUser: req.user._id })
      .select('candidateUser job resumeSnapshot.fileName resumeSnapshot.size createdAt')
      .populate('candidateUser', 'name email')
      .populate('job', 'title')
      .lean(),
    EmployerCv.find({ employerUser: req.user._id })
      .select('name email phone jobTitle fileName size uploadedAt')
      .lean()
  ]);

  const candidateIds = applications.map((application) => application.candidateUser?._id).filter(Boolean);
  const profiles = candidateIds.length
    ? await CandidateProfile.find({ user: { $in: candidateIds } })
      .select('user phone resume')
      .lean()
    : [];
  const profileByUser = new Map(profiles.map((profile) => [String(profile.user), profile]));

  const applicationItems = applications.flatMap((application) => {
    const profile = profileByUser.get(String(application.candidateUser?._id));
    const resume = application.resumeSnapshot?.fileName
      ? application.resumeSnapshot
      : profile?.resume;
    if (!resume?.fileName) return [];

    return [{
      id: String(application._id),
      applicationId: String(application._id),
      source: 'application',
      name: application.candidateUser?.name || 'Candidate',
      email: application.candidateUser?.email || '',
      phone: profile?.phone || '',
      jobTitle: application.job?.title || '',
      fileName: resume.fileName,
      size: resume.size || 0,
      uploadedAt: application.createdAt
    }];
  });

  const items = [...applicationItems, ...uploads.map(uploadedItem)]
    .sort((left, right) => new Date(right.uploadedAt) - new Date(left.uploadedAt));

  res.json(apiResponse({
    message: 'Employer CVs fetched successfully',
    data: { items }
  }));
});

const uploadCv = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new AppError('PDF CV is required', 400);
  }

  const name = readTextField(req.body.name, 'Candidate name', 120, true);
  const email = readTextField(req.body.email, 'Email', 254);
  const phone = readTextField(req.body.phone, 'Phone', 40);
  const jobTitle = readTextField(req.body.jobTitle, 'Job title', 160);

  if (!req.file.buffer || req.file.buffer.subarray(0, 5).toString('ascii') !== '%PDF-') {
    throw new AppError('Uploaded file is not a valid PDF', 400);
  }

  const cv = await EmployerCv.create({
    employerUser: req.user._id,
    name,
    email,
    phone,
    jobTitle,
    fileName: safePdfFileName(req.file.originalname),
    mimeType: 'application/pdf',
    size: req.file.size,
    content: req.file.buffer
  });

  res.status(201).json(apiResponse({
    message: 'CV uploaded successfully',
    data: uploadedItem(cv)
  }));
});

const downloadCv = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new AppError('CV not found', 404);
  }

  const uploaded = await EmployerCv.findOne({
    _id: req.params.id,
    employerUser: req.user._id
  }).select('+content');

  if (uploaded) {
    res.attachment(uploaded.fileName).type('application/pdf');
    return res.send(uploaded.content);
  }

  const application = await Application.findOne({
    _id: req.params.id,
    employerUser: req.user._id
  }).select('+resumeSnapshot.content');

  if (!application) {
    throw new AppError('CV not found', 404);
  }

  let fileName = application.resumeSnapshot?.fileName || 'resume.pdf';
  if (application.resumeSnapshot?.content?.length) {
    res.attachment(fileName).type(application.resumeSnapshot.mimeType || 'application/pdf');
    return res.send(application.resumeSnapshot.content);
  }

  const snapshotPath = resolveStoredFilePath(application.resumeSnapshot?.filePath);
  if (snapshotPath) {
    return res.download(snapshotPath, fileName);
  }

  const profile = await CandidateProfile.findOne({ user: application.candidateUser })
    .select('resume +resumeContent');
  if (profile?.resumeContent?.length) {
    fileName = profile.resume?.fileName || fileName;
    res.attachment(fileName).type(profile.resume?.mimeType || 'application/pdf');
    return res.send(profile.resumeContent);
  }

  const currentPath = resolveStoredFilePath(profile?.resume?.filePath);
  if (currentPath) {
    return res.download(currentPath, profile.resume.fileName || fileName);
  }

  throw new AppError('CV file not found', 404);
});

const deleteCv = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    throw new AppError('CV not found', 404);
  }

  const cv = await EmployerCv.findOneAndDelete({
    _id: req.params.id,
    employerUser: req.user._id
  });
  if (!cv) {
    throw new AppError('Uploaded CV not found', 404);
  }

  res.json(apiResponse({ message: 'CV deleted successfully' }));
});

module.exports = { listCvs, uploadCv, downloadCv, deleteCv };
