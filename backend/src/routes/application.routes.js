const router = require('express').Router();
const applicationController = require('../controllers/application.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');
const { ROLES } = require('../utils/constants');

router.post('/', protect, authorizeRoles(ROLES.CANDIDATE, ROLES.ADMIN), applicationController.applyForJob);
router.get('/my', protect, authorizeRoles(ROLES.CANDIDATE, ROLES.ADMIN), applicationController.getMyApplications);
router.get('/job/:jobId', protect, authorizeRoles(ROLES.EMPLOYER, ROLES.ADMIN), applicationController.getApplicationsByJob);
router.get('/:id', protect, authorizeRoles(ROLES.CANDIDATE, ROLES.EMPLOYER, ROLES.ADMIN), applicationController.getApplicationById);
router.get('/:id/resume', protect, authorizeRoles(ROLES.CANDIDATE, ROLES.EMPLOYER, ROLES.ADMIN), applicationController.downloadApplicationResume);
router.patch('/:id/status', protect, authorizeRoles(ROLES.EMPLOYER, ROLES.ADMIN), applicationController.updateApplicationStatus);
router.get('/:id/messages', protect, authorizeRoles(ROLES.CANDIDATE, ROLES.EMPLOYER, ROLES.ADMIN), applicationController.getApplicationMessages);
router.post('/:id/messages', protect, authorizeRoles(ROLES.CANDIDATE, ROLES.EMPLOYER, ROLES.ADMIN), applicationController.sendApplicationMessage);

module.exports = router;
