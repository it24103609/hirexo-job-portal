const slugify = require('slugify');
const asyncHandler = require('../utils/asyncHandler');
const apiResponse = require('../utils/apiResponse');
const AppError = require('../utils/AppError');
const Category = require('../models/Category');
const Industry = require('../models/Industry');
const Location = require('../models/Location');
const JobType = require('../models/JobType');

const models = {
  categories: Category,
  industries: Industry,
  locations: Location,
  'job-types': JobType
};

function getModel(type) {
  const model = models[type];
  if (!model) {
    throw new AppError('Invalid master data type', 400);
  }

  return model;
}

const listItems = asyncHandler(async (req, res) => {
  const model = getModel(req.params.type);
  const items = await model.find().sort({ createdAt: -1 });

  res.json(apiResponse({
    message: `${req.params.type} fetched successfully`,
    data: items
  }));
});

const listPublicItems = asyncHandler(async (req, res) => {
  const model = getModel(req.params.type);
  const items = await model.find({ active: true }).sort({ name: 1 });

  res.json(apiResponse({
    message: `${req.params.type} fetched successfully`,
    data: items
  }));
});

const createItem = asyncHandler(async (req, res) => {
  const model = getModel(req.params.type);
  const name = req.body.name;

  const item = await model.create({
    name,
    slug: slugify(name, { lower: true, strict: true, trim: true }),
    active: req.body.active ?? true
  });

  res.status(201).json(apiResponse({
    message: `${req.params.type} created successfully`,
    data: item
  }));
});

const updateItem = asyncHandler(async (req, res) => {
  const model = getModel(req.params.type);
  const updatePayload = {};

  if (req.body.name) {
    updatePayload.name = req.body.name;
    updatePayload.slug = slugify(req.body.name, { lower: true, strict: true, trim: true });
  }

  if (typeof req.body.active === 'boolean') {
    updatePayload.active = req.body.active;
  }

  const item = await model.findByIdAndUpdate(req.params.id, updatePayload, { new: true, runValidators: true });

  res.json(apiResponse({
    message: `${req.params.type} updated successfully`,
    data: item
  }));
});

const deleteItem = asyncHandler(async (req, res) => {
  const model = getModel(req.params.type);
  await model.findByIdAndDelete(req.params.id);

  res.json(apiResponse({
    message: `${req.params.type} deleted successfully`
  }));
});

module.exports = {
  listItems,
  listPublicItems,
  createItem,
  updateItem,
  deleteItem
};
