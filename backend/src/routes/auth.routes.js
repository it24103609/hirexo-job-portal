const router = require('express').Router();
const { passport } = require('../config/passport');
const authController = require('../controllers/auth.controller');
const { authLimiter } = require('../middlewares/rateLimit.middleware');
const { protect } = require('../middlewares/auth.middleware');
const { env } = require('../config/env');

function oauthFailureRedirect(provider) {
  return `${env.clientUrl.replace(/\/$/, '')}/auth?oauth=${provider}_failed`;
}

function requireOAuthProvider(provider) {
  return (req, res, next) => {
    const clientId = env[`${provider}ClientId`];
    const clientSecret = env[`${provider}ClientSecret`];

    if (!clientId || !clientSecret) {
      return res.status(503).json({
        success: false,
        message: `${provider} OAuth is not configured on the server.`
      });
    }

    next();
  };
}

router.post('/register/candidate', authLimiter, authController.registerCandidate);
router.post('/register/employer', authLimiter, authController.registerEmployer);
router.post('/login', authLimiter, authController.login);
router.post('/forgot-password', authLimiter, authController.forgotPassword);
router.post('/reset-password', authLimiter, authController.resetPassword);
router.post('/refresh-token', authLimiter, authController.refreshToken);
router.get('/me', protect, authController.me);
router.patch('/change-password', protect, authController.changePassword);

router.get('/google', authLimiter, requireOAuthProvider('google'), authController.createOAuthState, (req, res, next) => {
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    state: req.oauthState,
    session: false
  })(req, res, next);
});

router.get(
  '/google/callback',
  authController.verifyOAuthState,
  passport.authenticate('google', {
    failureRedirect: oauthFailureRedirect('google'),
    session: false
  }),
  authController.oauthCallback
);

router.get('/github', authLimiter, requireOAuthProvider('github'), authController.createOAuthState, (req, res, next) => {
  passport.authenticate('github', {
    scope: ['user:email'],
    state: req.oauthState,
    session: false
  })(req, res, next);
});

router.get(
  '/github/callback',
  authController.verifyOAuthState,
  passport.authenticate('github', {
    failureRedirect: oauthFailureRedirect('github'),
    session: false
  }),
  authController.oauthCallback
);

module.exports = router;
