const { UserModel } = require('../models/User');
const { NoteModel } = require('../models/Note');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');

/**
 * @define get all users
 * @route GET /users
 * @access Private
 */
const getAllUsersController = asyncHandler(async (req, res) => {
  const users = await UserModel.find().select('-password').lean();

  if (!users?.length) {
    return res.status(400).json({ message: 'no users found' });
  }
  res.json(users);
});

/**
 * @define create new user
 * @route POST /users
 * @access Private
 */
const createNewUserController = asyncHandler(async (req, res) => {
  const { username, password, roles } = req.body;
  // confirm data
  if (!username || !password || !Array.isArray(roles) || !roles.length) {
    return res.status(400).json({ message: 'all fields are required' });
  }

  // check for duplicated user
  const duplicatedUser = await UserModel.findOne({ username }).lean().exec();

  if (duplicatedUser) {
    return res.status(409).json({ message: 'duplicated user' });
  }

  // hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  const userObject = { username, password: hashedPassword, roles };

  // create and store new user in DB
  const user = await UserModel.create(userObject);

  if (user) {
    // created
    res.status(201).json({ message: `new user ${username} created` });
  } else {
    res.status(400).json({ message: 'Invalid user received' });
  }
});

/**
 * @define update user
 * @route PATCH /users
 * @access Private
 */
const updateUserController = asyncHandler(async (req, res) => {
  const { id, username, roles, active, password } = req.body;

  // confirm data
  if (
    !id ||
    !username ||
    !Array.isArray(roles) ||
    !roles.length ||
    typeof active !== 'boolean'
  ) {
    return res.status(400).json({ message: 'all fields are required' });
  }

  // get user
  const user = await UserModel.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: 'user not found' });
  }

  // check for duplicated
  const duplicatedUser = await UserModel.findOne({ username }).lean().exec();

  // allow update to the original user
  if (duplicatedUser && duplicatedUser?._id.toString() !== id) {
    return res.status(409).json({ message: 'Duplicated username' });
  }

  user.username = username;
  user.roles = roles;
  user.active = active;

  if (password) {
    //  hash password
    user.password = await bcrypt.hash(password, 10);
  }

  const updatedUser = await user.save();

  res.json({ message: `${updatedUser.username} updated` });
});

/**
 * @define delete user
 * @route DELETE /users
 * @access Private
 */
const deleteUserController = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'user id requried' });
  }

  const note = await NoteModel.findOne({ user: id }).lean().exec();

  if (note) {
    return res.status(400).json({ message: 'User has assign notes' });
  }

  const user = await UserModel.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: 'User not found' });
  }

  const result = await user.deleteOne();

  const reply = `Username ${result.username} with ID ${result._id} deleted`;

  res.json(reply);
});

module.exports = {
  getAllUsersController,
  createNewUserController,
  updateUserController,
  deleteUserController,
};
