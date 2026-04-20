import createHttpError from 'http-errors';
import fs from 'node:fs/promises';
import saveFileToCloudinary from '../utils/saveFileToCloudinary.js';
import {
  getAllContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
} from '../services/contacts.js';

export const getContactsController = async (req, res) => {
  const {
    page = 1,
    perPage = 10,
    sortBy,
    sortOrder = 'asc',
    type,
    isFavourite,
  } = req.query;

  const parsedPage = Math.max(1, Number(page) || 1);
  const parsedPerPage = Math.max(1, Number(perPage) || 10);

  const contacts = await getAllContacts({
    page: parsedPage,
    perPage: parsedPerPage,
    sortBy,
    sortOrder,
    type,
    isFavourite,
    userId: req.user._id,
  });

  res.status(200).json({
    status: 200,
    message: 'Successfully found contacts!',
    data: contacts,
  });
};

export const getContactByIdController = async (req, res) => {
  const { contactId } = req.params;

  const contact = await getContactById(contactId, req.user._id);

  if (!contact) {
    throw createHttpError(404, 'Contact not found');
  }

  res.status(200).json({
    status: 200,
    message: `Successfully found contact with id ${contactId}!`,
    data: contact,
  });
};

export const createContactController = async (req, res) => {
  let photo;

  if (req.file) {
    photo = await saveFileToCloudinary(req.file.path);
    await fs.unlink(req.file.path);
  }

  const newContact = await createContact({
    ...req.body,
    userId: req.user._id,
    ...(photo ? { photo } : {}),
  });

  res.status(201).json({
    status: 201,
    message: 'Successfully created a contact!',
    data: newContact,
  });
};

export const patchContactController = async (req, res) => {
  const { contactId } = req.params;
  let photo;

  if (req.file) {
    photo = await saveFileToCloudinary(req.file.path);
    await fs.unlink(req.file.path);
  }

  const updatedContact = await updateContact(
    contactId,
    {
      ...req.body,
      ...(photo ? { photo } : {}),
    },
    req.user._id,
  );

  if (!updatedContact) {
    throw createHttpError(404, 'Contact not found');
  }

  res.status(200).json({
    status: 200,
    message: 'Successfully patched a contact!',
    data: updatedContact,
  });
};

export const deleteContactController = async (req, res) => {
  const { contactId } = req.params;

  const deletedContact = await deleteContact(contactId, req.user._id);

  if (!deletedContact) {
    throw createHttpError(404, 'Contact not found');
  }

  res.status(204).send();
};