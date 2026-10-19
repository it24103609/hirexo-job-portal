const router = require('express').Router();
const contactController = require('../controllers/contact.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');
const { ROLES } = require('../utils/constants');

router.post('/', contactController.createContact);

router.get('/', protect, authorizeRoles(ROLES.ADMIN), contactController.listContacts);
router.get('/:id', protect, authorizeRoles(ROLES.ADMIN), contactController.getContact);
router.patch('/:id/reply', protect, authorizeRoles(ROLES.ADMIN), contactController.replyContact);
router.patch('/:id/status', protect, authorizeRoles(ROLES.ADMIN), contactController.updateContactStatus);
router.delete('/:id', protect, authorizeRoles(ROLES.ADMIN), contactController.deleteContact);

module.exports = router;
