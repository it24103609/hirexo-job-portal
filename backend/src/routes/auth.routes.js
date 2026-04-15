const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const { authLimiter } = require('../middlewares/rateLimit.middleware');
const { protect } = require('../middlewares/auth.middleware');

router.post('/register/candidate', authLimiter, authController.registerCandidate);
router.post('/register/employer', authLimiter, authController.registerEmployer);
router.post('/login', authLimiter, authController.login);
router.post('/refresh-token', authLimiter, authController.refreshToken);
router.get('/me', protect, authController.me);
router.patch('/change-password', protect, authController.changePassword);

module.exports = router;
