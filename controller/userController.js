const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');
exports.getAllUser = catchAsync(async (req, res) => {
  const users = await User.find();
  // const users = await Tour.find();
  res.status(200).json({
    status: 'success',
    result: users.length,
    data: {
      users,
    },
  });
});
exports.CreateUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', message: 'This Route is not defined Yet.' });
};
exports.updateUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', message: 'This Route is not defined Yet.' });
};
exports.getUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', message: 'This Route is not defined Yet.' });
};
exports.deleteUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', message: 'This Route is not defined Yet.' });
};
