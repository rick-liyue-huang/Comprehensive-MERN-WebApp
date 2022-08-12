const express = require('express');
const router = express.Router();
const {
  getAllUsersController,
  createNewUserController,
  updateUserController,
  deleteUserController,
} = require('../controllers/userControllers');

router
  .route('/')
  .get(getAllUsersController)
  .post(createNewUserController)
  .patch(updateUserController)
  .delete(deleteUserController);

module.exports = router;
