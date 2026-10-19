const mongoose = require('mongoose');
const { slugify } = require('../utils/slug');

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true
    },
    content: {
      type: String,
      required: true,
      minlength: 100
    },
    excerpt: {
      type: String,
      maxlength: 500
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    tags: [String],
    featured: {
      type: Boolean,
      default: false
    },
    published: {
      type: Boolean,
      default: false
    },
    publishedAt: Date,
    image: {
      url: String,
      alt: String
    },
    viewCount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

blogSchema.pre('save', async function (next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title);
  }
  next();
});

blogSchema.index({ published: 1, createdAt: -1 });
blogSchema.index({ tags: 1 });

module.exports = mongoose.model('Blog', blogSchema);
