const router = require('express').Router();
const jobController = require('../controllers/job.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');
const { ROLES } = require('../utils/constants');

router.get('/featured', jobController.featuredJobs);
router.get('/', jobController.listJobs);
router.get('/:slug', jobController.getJobBySlug);

router.post('/', protect, authorizeRoles(ROLES.EMPLOYER, ROLES.ADMIN), jobController.createJob);
router.patch('/:id', protect, authorizeRoles(ROLES.EMPLOYER, ROLES.ADMIN), jobController.updateJob);
router.delete('/:id', protect, authorizeRoles(ROLES.EMPLOYER, ROLES.ADMIN), jobController.deleteJob);

module.exports = router;
