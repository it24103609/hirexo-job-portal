const router = require('express').Router();
const candidateController = require('../controllers/candidate.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');
const { ROLES } = require('../utils/constants');
const { resumeUpload, profilePictureUpload, handleUploadErrors } = require('../middlewares/upload.middleware');

router.use(protect);
router.use(authorizeRoles(ROLES.CANDIDATE, ROLES.ADMIN));

router.get('/profile', candidateController.getProfile);
router.patch('/profile', candidateController.upsertProfile);
router.post('/profile-picture', profilePictureUpload.single('profilePicture'), handleUploadErrors, candidateController.uploadProfilePicture);
router.get('/profile-picture/view', candidateController.viewProfilePicture);
router.get('/profile-picture/download', candidateController.downloadProfilePicture);
router.get('/profile-picture', candidateController.getProfilePicture);
router.delete('/profile-picture', candidateController.deleteProfilePicture);
router.post('/resume', resumeUpload.single('resume'), handleUploadErrors, candidateController.uploadResume);
router.get('/resume', candidateController.getResume);
router.get('/resume/download', candidateController.downloadResume);
router.delete('/resume', candidateController.deleteResume);
router.get('/applications', candidateController.listApplications);
router.get('/saved-jobs', candidateController.listSavedJobs);
router.post('/saved-jobs/:jobId', candidateController.saveJob);
router.delete('/saved-jobs/:jobId', candidateController.unsaveJob);

module.exports = router;
