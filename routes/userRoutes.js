const express = require('express');
const router = express.Router();
const {
  getAllUsersController,
  createNewUserController,
  updateUserController,
  deleteUserController,
} = require('../controllers/userController');

router
  .route('/')
  .get(getAllUsersController)
  .post(createNewUserController)
  .patch(updateUserController)
  .delete(deleteUserController);

module.exports = router;
