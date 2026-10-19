const crypto = require('crypto');
const slugify = require('slugify');

function toSlug(value) {
  return slugify(value || 'item', { lower: true, strict: true, trim: true });
}

async function createUniqueSlug(model, sourceValue, fallbackFields = {}) {
  const baseSlug = toSlug(sourceValue || 'item');
  const suffix = crypto.randomBytes(3).toString('hex');
  let slug = baseSlug || `item-${suffix}`;

  const existing = await model.findOne({ slug });
  if (!existing) return slug;

  const combined = Object.values(fallbackFields).filter(Boolean).join('-');
  slug = toSlug(`${baseSlug}-${combined || suffix}`);
  const duplicate = await model.findOne({ slug });
  if (!duplicate) return slug;

  return `${slug}-${suffix}`;
}

module.exports = {
  createUniqueSlug,
  slugify: toSlug
};
