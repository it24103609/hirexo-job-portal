const rateLimit = require('express-rate-limit');
const { env } = require('../config/env');

const isProduction = env.nodeEnv === 'production';

const apiLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: isProduction ? env.rateLimitMax : Math.max(env.rateLimitMax, 1000),
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests, please try again later.'
});

const authLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: isProduction ? env.authRateLimitMax : Math.max(env.authRateLimitMax, 100),
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many authentication attempts, please try again later.'
});

module.exports = {
  apiLimiter,
  authLimiter
};
