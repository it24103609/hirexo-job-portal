const router = require('express').Router();
const employerController = require('../controllers/employer.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');
const { ROLES } = require('../utils/constants');

router.use(protect);
router.use(authorizeRoles(ROLES.EMPLOYER, ROLES.ADMIN));

router.get('/profile', employerController.getProfile);
router.patch('/profile', employerController.upsertProfile);
router.get('/dashboard', employerController.dashboard);
router.get('/jobs', employerController.listMyJobs);
router.get('/interviews/calendar', employerController.getInterviewCalendar);
router.get('/jobs/:jobId/applications', employerController.listJobApplicants);
router.put('/applications/:applicationId/slots', employerController.saveApplicationSlots);
router.post('/applications/:applicationId/book-slot', employerController.bookApplicationSlot);
router.patch('/applications/:applicationId/status', employerController.updateApplicantStatus);

module.exports = router;
