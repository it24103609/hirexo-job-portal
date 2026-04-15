const router = require('express').Router();
const blogController = require('../controllers/blog.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');
const { ROLES } = require('../utils/constants');

router.get('/featured', blogController.featuredBlogs);
router.get('/', blogController.listBlogs);
router.get('/:slug', blogController.getBlogBySlug);

router.post('/', protect, authorizeRoles(ROLES.ADMIN), blogController.createBlog);
router.patch('/:id', protect, authorizeRoles(ROLES.ADMIN), blogController.updateBlog);
router.patch('/:id/publish', protect, authorizeRoles(ROLES.ADMIN), blogController.publishBlog);
router.delete('/:id', protect, authorizeRoles(ROLES.ADMIN), blogController.deleteBlog);

module.exports = router;
