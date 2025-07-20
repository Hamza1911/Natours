const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  });
  const token = signToken(newUser._id);
  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  //1) check if email and passwprd exist
  if (!email || !password) {
    return next(new AppError('Please Provide email and password', 400));
  }

  //2) check if the user exist && password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('incorrect email or password', 401));
  }
  //3) if everything is ok ,send token to client

  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
    message: 'User Loged in successfully',
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  //1) getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get Access', 401)
    );
  }
  //2) VErifcation Token
  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //3) Check if user still exists

  const currentUser = await User.findById(decode.id);
  if (!currentUser) {
    return next(
      new AppError('The User Belonging to this token does no longer exits', 401)
    );
  }
  //4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decode.iat)) {
    return next(
      new AppError('User recently changed password! Please Log in again', 401)
    );
  }
  // Greant Access to protected route
  req.user = currentUser;
  next();
});
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          'You do not have the permission to Perform this action  ',
          403
        )
      );
    }
    next();
  };
};
