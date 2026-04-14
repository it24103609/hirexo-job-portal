const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const apiResponse = require('../utils/apiResponse');
const Blog = require('../models/Blog');

const listBlogs = asyncHandler(async (req, res) => {
  const { tag, featured, skip = 0, limit = 10 } = req.query;
  const filter = { published: true };
  if (tag) filter.tags = tag;
  if (featured === 'true') filter.featured = true;

  const blogs = await Blog.find(filter)
    .select('-content')
    .populate('author', 'name email')
    .sort({ publishedAt: -1 })
    .skip(parseInt(skip))
    .limit(parseInt(limit));

  const total = await Blog.countDocuments(filter);

  res.json(apiResponse({
    message: 'Blogs fetched successfully',
    data: blogs,
    pagination: { skip: parseInt(skip), limit: parseInt(limit), total }
  }));
});

const getBlogBySlug = asyncHandler(async (req, res) => {
  const blog = await Blog.findOne({ slug: req.params.slug, published: true })
    .populate('author', 'name email');

  if (!blog) {
    throw new AppError('Blog not found', 404);
  }

  await Blog.updateOne({ _id: blog._id }, { $inc: { viewCount: 1 } });

  res.json(apiResponse({
    message: 'Blog fetched successfully',
    data: blog
  }));
});

const featuredBlogs = asyncHandler(async (req, res) => {
  const blogs = await Blog.find({ published: true, featured: true })
    .select('-content')
    .populate('author', 'name email')
    .sort({ publishedAt: -1 })
    .limit(5);

  res.json(apiResponse({
    message: 'Featured blogs fetched successfully',
    data: blogs
  }));
});

const createBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.create({
    ...req.body,
    author: req.user._id
  });

  res.status(201).json(apiResponse({
    message: 'Blog created successfully',
    data: blog
  }));
});

const updateBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    throw new AppError('Blog not found', 404);
  }

  if (String(blog.author) !== String(req.user._id) && req.user.role !== 'admin') {
    throw new AppError('You cannot update this blog', 403);
  }

  const fields = ['title', 'content', 'excerpt', 'tags', 'featured', 'published', 'image'];
  fields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      blog[field] = req.body[field];
    }
  });

  if (req.body.published === true && !blog.publishedAt) {
    blog.publishedAt = new Date();
  }

  const updated = await blog.save();

  res.json(apiResponse({
    message: 'Blog updated successfully',
    data: updated
  }));
});

const publishBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    throw new AppError('Blog not found', 404);
  }

  blog.published = true;
  blog.publishedAt = new Date();
  await blog.save();

  res.json(apiResponse({
    message: 'Blog published successfully',
    data: blog
  }));
});

const deleteBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    throw new AppError('Blog not found', 404);
  }

  if (String(blog.author) !== String(req.user._id) && req.user.role !== 'admin') {
    throw new AppError('You cannot delete this blog', 403);
  }

  await Blog.deleteOne({ _id: req.params.id });

  res.json(apiResponse({
    message: 'Blog deleted successfully',
    data: null
  }));
});

module.exports = {
  listBlogs,
  getBlogBySlug,
  featuredBlogs,
  createBlog,
  updateBlog,
  publishBlog,
  deleteBlog
};
