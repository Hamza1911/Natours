const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const ApiFeatures = require('../utils/apiFeatures');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Modal.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError('No document found with that Id', 404));
    }
    res.status(204).json({
      status: 'Success',
      data: null,
    });
  });
exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'Success',
      data: {
        data: doc,
      },
    });
  });
exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: 'Success',
      data: {
        data: doc,
      },
    });

    res.status(400).json({
      status: 'Fail',
      message: err,
    });
  });
exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;
    if (!doc) {
      return next(new AppError('No document found with that Id', 404));
    }
    res.status(200).json({
      status: 'Success',
      data: {
        doc,
      },
    });
  });
exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    const features = new ApiFeatures(Model.find(filter), req.query)
      .Filter()
      .Sort()
      .Fields()
      .Pagination();
    const doc = await features.query;
    res.status(200).json({
      status: 'success',
      result: doc.length,
      data: {
        doc,
      },
    });
  });
