const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookiesOption = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIES_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookiesOption.secure = true;
  res.cookie('jwt', token, cookiesOption);
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    role: req.body.role,
  });
  createSendToken(newUser, 201, res);
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
  createSendToken(user, 200, res);
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

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1) get user based on the email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with the email address', 404));
  }
  //2) Generate the reset password token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  //3) senf it to user's email

  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/users/resetPassword/${resetToken}`;
  const message = `Forgot your password? Submit a PATCH request with your new password and
passwordConfirm to: ${resetURL}. \nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your Password reset token valid for 10 min',
      message,
    });
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError('There was an Error Sending the email. Try again Later', 500)
    );
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  //1) Get the user based on the token
  const hasedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hasedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2 if token has not expired , and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is Invalid or has Expired'));
  }
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  await user.save();
  //3) update changedPasswordAt property for the user
  //4) Log the user in ,send JWT
  createSendToken(user, 200, res);
});
exports.updatePassword = catchAsync(async (req, res, next) => {
  //!) Get user from collection
  const user = await User.findById(req.user.id).select('+password');
  //2)check if Posted Current Pasword is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your Current password is Incorrect', 401));
  }

  //3)if so, update Password
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  await user.save();
  //4) log user in ,send JWT
  createSendToken(user, 200, res);
});
