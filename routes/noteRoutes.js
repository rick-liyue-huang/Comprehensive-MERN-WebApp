const express = require('express');
const {
  getAllNotesWithUserController,
  createNewNoteController,
  updateNoteController,
  deleteNoteController,
} = require('../controllers/noteControllers');

const router = express.Router();

router
  .route('/')
  .get(getAllNotesWithUserController)
  .post(createNewNoteController)
  .patch(updateNoteController)
  .delete(deleteNoteController);

module.exports = router;
