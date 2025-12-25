const express = require('express');
const tourController = require('../controller/tourController');
const tourRoute = express.Router();
const authController = require('../controller/authController');
const reviewRouter = require('../routes/reviewRoutes');
// tourRoute.param('id', tourController.checkId);
tourRoute.use('/:tourId/reviews', reviewRouter);
tourRoute
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTour);
tourRoute.route('/tours-stats').get(tourController.getToursStats);
tourRoute
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan
  );
tourRoute
  .route('/')
  .get(tourController.getAllTour)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour
  );
tourRoute
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = tourRoute;
