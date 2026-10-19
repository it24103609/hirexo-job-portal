const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;

const User = require('../models/User');
const CandidateProfile = require('../models/CandidateProfile');
const { env } = require('./env');
const { ROLES, USER_STATUS } = require('../utils/constants');

function getCallbackUrl(provider) {
  return `${env.serverUrl.replace(/\/$/, '')}/auth/${provider}/callback`;
}

function createPlaceholderEmail(provider, providerId) {
  return `${provider}_${providerId}@oauth.hirexo.local`;
}

function extractProfileImage(profile) {
  if (Array.isArray(profile.photos) && profile.photos[0]?.value) {
    return profile.photos[0].value;
  }

  if (profile._json?.avatar_url) {
    return profile._json.avatar_url;
  }

  if (profile._json?.picture) {
    return profile._json.picture;
  }

  return '';
}

function normalizeOAuthProfile(provider, profile) {
  const email = Array.isArray(profile.emails) && profile.emails[0]?.value
    ? profile.emails[0].value.toLowerCase()
    : createPlaceholderEmail(provider, profile.id);

  return {
    provider,
    providerId: profile.id,
    email,
    name: profile.displayName || profile.username || email.split('@')[0],
    profileImage: extractProfileImage(profile)
  };
}

async function findOrCreateOAuthUser(profileData) {
  const providerKey = `${profileData.provider}.id`;
  let user = await User.findOne({
    $or: [
      { [providerKey]: profileData.providerId },
      { email: profileData.email }
    ]
  });

  if (!user) {
    user = await User.create({
      name: profileData.name,
      email: profileData.email,
      role: ROLES.CANDIDATE,
      status: USER_STATUS.ACTIVE,
      isVerified: true,
      authProvider: profileData.provider,
      profileImage: profileData.profileImage,
      [profileData.provider]: { id: profileData.providerId }
    });

    await CandidateProfile.create({ user: user._id, skills: [], education: [], savedJobs: [] });
    return user;
  }

  user.authProvider = user.authProvider || profileData.provider;
  user.profileImage = user.profileImage || profileData.profileImage;
  user.isVerified = true;
  user[profileData.provider] = {
    ...(user[profileData.provider]?.toObject?.() || user[profileData.provider] || {}),
    id: profileData.providerId
  };

  await user.save({ validateBeforeSave: false });
  return user;
}

function configurePassport() {
  if (env.googleClientId && env.googleClientSecret) {
    passport.use(new GoogleStrategy({
      clientID: env.googleClientId,
      clientSecret: env.googleClientSecret,
      callbackURL: getCallbackUrl('google')
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await findOrCreateOAuthUser(normalizeOAuthProfile('google', profile));
        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }));
  }

  if (env.githubClientId && env.githubClientSecret) {
    passport.use(new GitHubStrategy({
      clientID: env.githubClientId,
      clientSecret: env.githubClientSecret,
      callbackURL: getCallbackUrl('github'),
      scope: ['user:email']
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await findOrCreateOAuthUser(normalizeOAuthProfile('github', profile));
        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }));
  }

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
}

module.exports = {
  passport,
  configurePassport
};
