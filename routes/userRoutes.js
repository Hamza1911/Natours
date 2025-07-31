const express = require('express');
const authController = require('./../controller/authController');
const {
  getAllUser,
  CreateUser,
  getUser,
  updateUser,
  deleteUser,
} = require('../controller/userController');
const userRoute = express.Router();
userRoute.post('/signup', authController.signup);
userRoute.post('/login', authController.login);
userRoute.post('/forgetPassword', authController.forgotPassword);
userRoute.patch('/resetPassword/:token', authController.resetPassword);
userRoute.patch(
  '/updateMyPassword',
  authController.protect,
  authController.updatePassword
);
userRoute.route('/').get(getAllUser).post(CreateUser);
userRoute.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);
module.exports = userRoute;
