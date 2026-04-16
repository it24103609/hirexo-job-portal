const bcrypt = require('bcryptjs');
const crypto = require('crypto');
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

function createPasswordResetToken() {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  return { rawToken, hashedToken };
}

function buildResetPasswordEmail({ name, resetUrl }) {
  const safeName = name || 'there';

  return {
    subject: 'Reset your Hirexo password',
    text: `Hello ${safeName},\n\nWe received a request to reset your Hirexo password.\n\nUse this link to set a new password:\n${resetUrl}\n\nThis link will expire in 30 minutes. If you did not request this, you can ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
        <h2 style="margin-bottom: 12px;">Reset your Hirexo password</h2>
        <p>Hello ${safeName},</p>
        <p>We received a request to reset your Hirexo password.</p>
        <p>
          <a href="${resetUrl}" style="display: inline-block; background: #0f766e; color: #ffffff; padding: 12px 18px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Set a new password
          </a>
        </p>
        <p>If the button does not work, copy and paste this link into your browser:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>This link will expire in 30 minutes. If you did not request this, you can ignore this email.</p>
      </div>
    `
  };
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

const forgotPassword = asyncHandler(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();

  if (!email) {
    throw new AppError('Email is required', 400);
  }

  const user = await User.findOne({ email });

  if (user && user.status !== USER_STATUS.BLOCKED) {
    const { rawToken, hashedToken } = createPasswordResetToken();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    user.passwordResetToken = hashedToken;
    user.passwordResetExpiresAt = expiresAt;
    await user.save({ validateBeforeSave: false });

    const clientUrl = String(process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
    const resetUrl = `${clientUrl}/reset-password?token=${rawToken}`;
    const emailContent = buildResetPasswordEmail({ name: user.name, resetUrl });

    await sendEmail({
      to: user.email,
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html
    });
  }

  res.json(apiResponse({
    message: 'If an account exists for that email, a password reset link has been sent.'
  }));
});

const resetPassword = asyncHandler(async (req, res) => {
  const rawToken = String(req.body.token || '').trim();
  const newPassword = String(req.body.newPassword || '');

  if (!rawToken || !newPassword) {
    throw new AppError('Reset token and new password are required', 400);
  }

  if (newPassword.length < 6) {
    throw new AppError('Password must be at least 6 characters', 400);
  }

  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpiresAt: { $gt: new Date() }
  });

  if (!user) {
    throw new AppError('Reset link is invalid or expired', 400);
  }

  user.passwordHash = await bcrypt.hash(newPassword, 12);
  user.passwordResetToken = null;
  user.passwordResetExpiresAt = null;
  await user.save({ validateBeforeSave: false });

  res.json(apiResponse({
    message: 'Password reset successfully'
  }));
});

module.exports = {
  registerCandidate,
  registerEmployer,
  login,
  refreshToken,
  me,
  changePassword,
  forgotPassword,
  resetPassword
};
