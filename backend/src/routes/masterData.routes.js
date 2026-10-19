const router = require('express').Router();
const masterDataController = require('../controllers/masterData.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');
const { ROLES } = require('../utils/constants');

router.get('/public/:type', masterDataController.listPublicItems);

router.use(protect);
router.use(authorizeRoles(ROLES.ADMIN));

router.get('/:type', masterDataController.listItems);
router.post('/:type', masterDataController.createItem);
router.patch('/:type/:id', masterDataController.updateItem);
router.delete('/:type/:id', masterDataController.deleteItem);

module.exports = router;
