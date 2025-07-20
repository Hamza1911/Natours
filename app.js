const express = require('express');
const fs = require('fs');
const app = express();
const morgan = require('morgan');

const globalErrorHandler = require('./controller/errorController');
const AppError = require('./utils/appError');
const tour = require('./routes/tourRoutes');
const user = require('./routes/userRoutes');
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json());

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.get('/', (req, res) => {
  res
    .status(200)
    .json({ message: 'Hello From the Server Side ', app: 'Natours' });
});

// Routes

app.use('/api/v1/tours', tour);
app.use('/api/v1/users', user);

// app.all('*', (req, res, next) => {
//   next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
// });
app.use((req, res, next) => {
  next(new AppError(`can't find ${req.originalUrl} on this server`, 404));
});
// app.all(/.*/, (req, res, next) => {
//   next(new AppError(`can't find ${req.originalUrl} on this server`, 404));
// });

// To this order:
// app.all('*', (req, res, next) => {
//   next(new AppError(`can't find ${req.originalUrl} on this server`, 404));
// });

app.use(globalErrorHandler);

module.exports = app;
