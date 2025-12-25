const express = require('express');
const fs = require('fs');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('@exortek/express-mongo-sanitize');
const xssFilters = require('xss-filters');
const hpp = require('hpp');

const globalErrorHandler = require('./controller/errorController');
const AppError = require('./utils/appError');
const tour = require('./routes/tourRoutes');
const user = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const app = express();
// helemt for the http security
app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
// Body Parser,reading data from the body into req.body
app.use(express.json({ limit: '10kb' }));

// data SAnitization against non-sql injection
app.use(mongoSanitize());

//Data Sanitization against Xss
// app.use(xss());
app.use((req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach((key) => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = xssFilters.inHTMLData(req.body[key]);
      }
    });
  }
  if (req.query) {
    Object.keys(req.query).forEach((key) => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = xssFilters.inHTMLData(req.query[key]);
      }
    });
  }
  next();
});

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration ',
      'ratingQuantity',
      'ratingAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// Test MiddleWare
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.get('/', (req, res) => {
  res
    .status(200)
    .json({ message: 'Hello From the Server Side ', app: 'Natours' });
});
// Rate Limter
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from  this Ip, Please Try again in a hour',
});

app.use('/api', limiter);
// Routes
app.use('/api/v1/tours', tour);
app.use('/api/v1/users', user);
app.use('/api/v1/reviews', reviewRouter);

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
