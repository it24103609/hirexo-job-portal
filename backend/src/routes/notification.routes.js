const router = require('express').Router();
const notificationController = require('../controllers/notification.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');
const { ROLES } = require('../utils/constants');

router.use(protect);
router.use(authorizeRoles(ROLES.CANDIDATE, ROLES.EMPLOYER, ROLES.ADMIN));

router.get('/my', notificationController.listMyNotifications);
router.patch('/:id/read', notificationController.markAsRead);
router.patch('/read-all', notificationController.markAllAsRead);

module.exports = router;