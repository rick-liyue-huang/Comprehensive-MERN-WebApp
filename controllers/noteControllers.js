const asyncHandler = require('express-async-handler');
const { NoteModel } = require('../models/Note');
const { UserModel } = require('../models/User');

/**
 * @desc all notes
 * @route GET /notes
 * @access Private
 */
const getAllNotesWithUserController = asyncHandler(async (req, res) => {
  // get all notes from MongoDB
  const notes = await NoteModel.find().lean();

  // if no notes
  if (!notes?.length) {
    return resizeBy.status(400).json({ message: 'No notes found' });
  }

  /**
   * add username to each note before sending the response
   * see Promise.all with map
   */
  const notesWithUser = await Promise.all(
    notes.map(async (note) => {
      const user = await UserModel.findById(note.user).lean().exec();
      return { ...note, username: user.username };
    })
  );

  res.json(notesWithUser);
});

const createNewNoteController = asyncHandler(async (req, res) => {
  const { user, title, text } = req.body;

  // confirm the data
  if (!user || !title || !text) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // check the duplicated title
  const duplicatedNote = await NoteModel.findOne({ title }).lean().exec();

  if (duplicatedNote) {
    return res.status(400).json({ message: 'Duplicated note' });
  }

  // create the note and store in DB
  const note = await NoteModel.create({ user, title, text });

  if (note) {
    return res.status(201).json({ message: 'New note creted' });
  } else {
    return res.status(400).json({ message: 'Invalid note received' });
  }
});

const updateNoteController = asyncHandler(async (req, res) => {
  const { id, user, title, text, completed } = req.body;

  // confirm the data
  if (!id || !user || !title || !text || typeof completed !== 'boolean') {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // confirm the note is existing
  const note = await NoteModel.findById(id).exec();

  if (!note) {
    return res.status(400).json({ message: 'Note not found' });
  }

  // check the duplicated note
  const duplicatedNote = await NoteModel.findOne({ title }).lean().exec();

  if (duplicatedNote && duplicatedNote?._id.toString() !== id) {
    return res.status(400).json({ message: 'Duplicated note' });
  }

  // update the note
  note.user = user;
  note.title = title;
  note.text = text;
  note.completed = completed;

  const updatedNote = await note.save();

  res.json(`'${updatedNote.title}' updated`);
});

const deleteNoteController = asyncHandler(async (req, res) => {
  const { id } = req.body;

  // confirm data
  if (!id) {
    return res.status(400).json({ message: 'fields id is required' });
  }

  // confirm the note exists
  const note = await NoteModel.findById(id).exec();

  if (!note) {
    return res.status(400).json({ message: 'Note not found' });
  }

  const result = await note.deleteOne();

  const reply = `Note ${result.title} with ID ${result._id} deleted`;

  res.json(reply);
});

module.exports = {
  getAllNotesWithUserController,
  createNewNoteController,
  updateNoteController,
  deleteNoteController,
};
