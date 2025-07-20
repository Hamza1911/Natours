const express = require('express');
const tourController = require('../controller/tourController');
const tourRoute = express.Router();
const authController = require('../controller/authController');
// tourRoute.param('id', tourController.checkId);
tourRoute
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTour);
tourRoute.route('/tours-stats').get(tourController.getToursStats);
tourRoute.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);
tourRoute
  .route('/')
  .get(authController.protect, tourController.getAllTour)
  .post(tourController.createTour);
tourRoute
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );
module.exports = tourRoute;
