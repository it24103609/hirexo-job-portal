const router = require('express').Router();
const adminController = require('../controllers/admin.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');
const { ROLES } = require('../utils/constants');
router.get('/blogs', protect, authorizeRoles(ROLES.ADMIN), adminController.listBlogs);
router.delete('/blogs/:id', protect, authorizeRoles(ROLES.ADMIN), adminController.deleteBlog);
router.get('/contacts', protect, authorizeRoles(ROLES.ADMIN), adminController.listContacts);
router.delete('/contacts/:id', protect, authorizeRoles(ROLES.ADMIN), adminController.deleteContact);

router.use(protect);
router.use(authorizeRoles(ROLES.ADMIN));

router.get('/dashboard', adminController.dashboard);
router.get('/reports', adminController.reports);
router.get('/users', adminController.listUsers);
router.patch('/users/:id/block', adminController.blockUser);
router.patch('/users/:id/unblock', adminController.unblockUser);
router.get('/jobs/pending', adminController.listPendingJobs);
router.get('/applications', adminController.listApplications);
router.patch('/jobs/:id/approve', adminController.approveJob);
router.patch('/jobs/:id/reject', adminController.rejectJob);

module.exports = router;
