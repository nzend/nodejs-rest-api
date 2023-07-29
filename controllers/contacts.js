const { HttpError, ctrlWrapper } = require("../helpers");
const { Contact } = require("../models/contact");
const Joi = require("joi");
const AddSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().required(),
  phone: Joi.string().required(),
  favorite: Joi.boolean(),
});
const UpdateSchema = Joi.object({
  name: Joi.string(),
  email: Joi.string(),
  phone: Joi.string(),
});
const UpdateFavoriteSchema = Joi.object({
  favorite: Joi.boolean().required(),
});

// const contacts = require("../models/contacts");

const getAll = async (req, res) => {
  const { _id: owner } = req.user;
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const result = await Contact.find({ owner }, "-createdAt -updatedAt", {
    skip,
    limit,
  }).populate("owner", "email");
  res.status(200).json(result);
};
const getContactById = async (req, res) => {
  const { _id: owner } = req.user;

  const currentContacts = await Contact.find(
    { owner },
    "-createdAt -updatedAt"
  ).populate("owner", "email");


  const { id } = req.params;
  const result = (
    await Contact.find({ owner }, "-createdAt -updatedAt")
  ).filter((contact) => contact.id === id);
  if (Object.keys(result).length < 1) {
    throw HttpError(404, "Not found");
  }

  res.status(200).json(result);
};
const addContact = async (req, res) => {
  const { _id: owner } = req.user;
  const { error } = AddSchema.validate(req.body);
  if (error) {
    throw HttpError(400, error.message);
  }
  const result = await Contact.create({ ...req.body, owner });
  res.status(201).json(result);
};
const updateContact = async (req, res) => {
  if (Object.keys(req.body).length < 1) {
    throw HttpError(400, "missing fields");
  }
  const { error } = UpdateSchema.validate(req.body);
  if (error) {
    throw HttpError(400, error.message);
  }
  const { id } = req.params;
  const { _id: owner } = req.user;
  const contact = (
    await Contact.find({ owner }, "-createdAt -updatedAt")
  ).filter((contact) => contact.id === id);
 
  if (Object.keys(contact).length < 1) {
    throw HttpError(404, "Not Found");
  }

  const result = await Contact.findByIdAndUpdate(id, req.body, {
    new: true,
  });
  if (!result) {
    throw HttpError(404, "Not Found");
  }
  res.status(200).json(result);
};
const updateStatusContact = async (req, res) => {
  if (Object.keys(req.body).length < 1) {
    throw HttpError(400, "missing fields");
  }
  const { error } = UpdateFavoriteSchema.validate(req.body);
  if (error) {
    throw HttpError(400, error.message);
  }
  const { id } = req.params;
  const { _id: owner } = req.user;
  const contact = (
    await Contact.find({ owner }, "-createdAt -updatedAt")
  ).filter((contact) => contact.id === id);
 
  if (Object.keys(contact).length < 1) {
    throw HttpError(404, "Not Found");
  }
  const result = await Contact.findByIdAndUpdate(id, req.body, { new: true });
  if (!result) {
    throw HttpError(404, "Not Found");
  }
  res.status(200).json(result);
};
const deleteContact = async (req, res) => {
  const { id } = req.params;
  const { _id: owner } = req.user;
  const contact = (
    await Contact.find({ owner }, "-createdAt -updatedAt")
  ).filter((contact) => contact.id === id);
 
  if (Object.keys(contact).length < 1) {
    throw HttpError(404, "Not Found");
  }
  const result = await Contact.findByIdAndRemove(id);

  if (!result) {
    throw HttpError(404, "Not Found");
  }
  res.status(200).json({
    message: "Delete success",
  });
};
module.exports = {
  getAll: ctrlWrapper(getAll),
  getContactById: ctrlWrapper(getContactById),
  addContact: ctrlWrapper(addContact),
  updateContact: ctrlWrapper(updateContact),
  updateStatusContact: ctrlWrapper(updateStatusContact),
  deleteContact: ctrlWrapper(deleteContact),
};
