const express = require('express');
const authController = require('./../controller/authController');
const {
  getAllUser,
  CreateUser,
  getUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
  getMe,
} = require('../controller/userController');
const userRoute = express.Router();
userRoute.post('/signup', authController.signup);
userRoute.post('/login', authController.login);
userRoute.post('/forgetPassword', authController.forgotPassword);
userRoute.patch('/resetPassword/:token', authController.resetPassword);
userRoute.use(authController.protect);
userRoute.patch('/updateMyPassword', authController.updatePassword);
userRoute.get('/me', getMe, getUser);
userRoute.patch('/updateMe', updateMe);
userRoute.delete('/deleteMe', deleteMe);
userRoute.use(authController.restrictTo('admin'));
userRoute.route('/').get(getAllUser).post(CreateUser);
userRoute.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);
module.exports = userRoute;
