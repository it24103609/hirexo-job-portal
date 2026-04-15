const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const apiResponse = require('../utils/apiResponse');
const Contact = require('../models/Contact');
const { sendEmail } = require('../services/email.service');

const createContact = asyncHandler(async (req, res) => {
  const contact = await Contact.create({
    ...req.body,
    ipAddress: req.ip
  });

  await sendEmail({
    to: req.body.email,
    subject: 'We received your message',
    text: `Hi ${req.body.name}, thank you for contacting Hirexo. We will respond to your inquiry shortly.`
  });

  res.status(201).json(apiResponse({
    message: 'Message received successfully',
    data: contact
  }));
});

const listContacts = asyncHandler(async (req, res) => {
  const { status, skip = 0, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const contacts = await Contact.find(filter)
    .sort({ createdAt: -1 })
    .skip(parseInt(skip))
    .limit(parseInt(limit));

  const total = await Contact.countDocuments(filter);

  res.json(apiResponse({
    message: 'Contacts fetched successfully',
    data: contacts,
    pagination: { skip: parseInt(skip), limit: parseInt(limit), total }
  }));
});

const getContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id);
  if (!contact) {
    throw new AppError('Contact not found', 404);
  }

  if (contact.status === 'new') {
    contact.status = 'read';
    await contact.save();
  }

  res.json(apiResponse({
    message: 'Contact fetched successfully',
    data: contact
  }));
});

const replyContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id);
  if (!contact) {
    throw new AppError('Contact not found', 404);
  }

  contact.reply = {
    message: req.body.message,
    repliedAt: new Date(),
    repliedBy: req.user._id
  };
  contact.status = 'replied';
  await contact.save();

  await sendEmail({
    to: contact.email,
    subject: `Re: ${contact.subject}`,
    text: req.body.message
  });

  res.json(apiResponse({
    message: 'Reply sent successfully',
    data: contact
  }));
});

const updateContactStatus = asyncHandler(async (req, res) => {
  const contact = await Contact.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true, runValidators: true }
  );

  if (!contact) {
    throw new AppError('Contact not found', 404);
  }

  res.json(apiResponse({
    message: 'Contact status updated successfully',
    data: contact
  }));
});

const deleteContact = asyncHandler(async (req, res) => {
  const contact = await Contact.findById(req.params.id);
  if (!contact) {
    throw new AppError('Contact not found', 404);
  }

  await Contact.deleteOne({ _id: req.params.id });

  res.json(apiResponse({
    message: 'Contact deleted successfully',
    data: null
  }));
});

module.exports = {
  createContact,
  listContacts,
  getContact,
  replyContact,
  updateContactStatus,
  deleteContact
};
