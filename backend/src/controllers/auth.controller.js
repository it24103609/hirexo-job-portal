const bcrypt = require('bcryptjs');
const User = require('../models/User');
const CandidateProfile = require('../models/CandidateProfile');
const EmployerProfile = require('../models/EmployerProfile');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const apiResponse = require('../utils/apiResponse');
const { ROLES, USER_STATUS, NOTIFICATION_TYPES } = require('../utils/constants');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { createUniqueSlug } = require('../utils/slug');
const { createNotification } = require('../services/notification.service');
const { sendEmail } = require('../services/email.service');

function buildName({ name, fullName, firstName, lastName }) {
  const directName = String(name || fullName || '').trim();
  if (directName) {
    return directName;
  }

  return [firstName, lastName].filter(Boolean).join(' ').trim();
}

function createAuthPayload(user) {
  const payload = {
    id: user._id.toString(),
    role: user.role,
    email: user.email
  };

  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload)
  };
}

async function loadProfile(user) {
  if (user.role === ROLES.CANDIDATE) {
    return CandidateProfile.findOne({ user: user._id }).populate('preferredJobTypes');
  }

  if (user.role === ROLES.EMPLOYER) {
    return EmployerProfile.findOne({ user: user._id }).populate('industry location');
  }

  return null;
}

const registerCandidate = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const name = buildName(req.body);

  if (!name || !email || !password) {
    throw new AppError('Name, email, and password are required', 400);
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new AppError('Email is already registered', 400);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    name,
    email,
    passwordHash,
    role: ROLES.CANDIDATE,
    status: USER_STATUS.ACTIVE,
    isVerified: true
  });

  await CandidateProfile.create({ user: user._id, skills: [], education: [], savedJobs: [] });
  await createNotification({
    userId: user._id,
    type: NOTIFICATION_TYPES.REGISTRATION,
    title: 'Welcome to Hirexo',
    message: 'Your candidate account has been created successfully.'
  });

  await sendEmail({
    to: user.email,
    subject: 'Welcome to Hirexo',
    text: 'Your candidate account is ready.'
  });

  const tokens = createAuthPayload(user);
  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  res.status(201).json(apiResponse({
    message: 'Candidate registered successfully',
    data: { user, ...tokens }
  }));
});

const registerEmployer = asyncHandler(async (req, res) => {
  const { email, password, companyName } = req.body;
  const name = buildName(req.body) || companyName;

  if (!name || !email || !password || !companyName) {
    throw new AppError('Company name, email, and password are required', 400);
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new AppError('Email is already registered', 400);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    name,
    email,
    passwordHash,
    role: ROLES.EMPLOYER,
    status: USER_STATUS.ACTIVE,
    isVerified: false
  });

  const slug = await createUniqueSlug(EmployerProfile, companyName, { email });
  await EmployerProfile.create({
    user: user._id,
    companyName,
    slug
  });

  await createNotification({
    userId: user._id,
    type: NOTIFICATION_TYPES.REGISTRATION,
    title: 'Employer account created',
    message: 'Your employer profile has been created. Complete your company profile to start posting jobs.'
  });

  await sendEmail({
    to: user.email,
    subject: 'Employer account created',
    text: 'Your employer account is ready.'
  });

  const tokens = createAuthPayload(user);
  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  res.status(201).json(apiResponse({
    message: 'Employer registered successfully',
    data: { user, ...tokens }
  }));
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }

  if (user.status === USER_STATUS.BLOCKED) {
    throw new AppError('Your account is blocked', 403);
  }

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  const profile = await loadProfile(user);
  const tokens = createAuthPayload(user);

  res.json(apiResponse({
    message: 'Login successful',
    data: { user, profile, ...tokens }
  }));
});

const refreshToken = asyncHandler(async (req, res) => {
  const refreshTokenValue = req.body.refreshToken || req.cookies?.refreshToken;
  if (!refreshTokenValue) {
    throw new AppError('Refresh token is required', 401);
  }

  const payload = verifyRefreshToken(refreshTokenValue);
  const user = await User.findById(payload.id);
  if (!user) {
    throw new AppError('User not found', 401);
  }

  if (user.status === USER_STATUS.BLOCKED) {
    throw new AppError('Your account has been blocked', 403);
  }

  const tokens = createAuthPayload(user);
  res.json(apiResponse({
    message: 'Token refreshed successfully',
    data: tokens
  }));
});

const me = asyncHandler(async (req, res) => {
  const profile = await loadProfile(req.user);

  res.json(apiResponse({
    message: 'Current user fetched successfully',
    data: { user: req.user, profile }
  }));
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new AppError('Current password and new password are required', 400);
  }

  const user = await User.findById(req.user._id);
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new AppError('Current password is incorrect', 400);
  }

  user.passwordHash = await bcrypt.hash(newPassword, 12);
  await user.save();

  res.json(apiResponse({
    message: 'Password updated successfully'
  }));
});

module.exports = {
  registerCandidate,
  registerEmployer,
  login,
  refreshToken,
  me,
  changePassword
};
