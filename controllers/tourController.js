const Tour = require('./../models/tourModel');
const mongoose = require('mongoose');
const APIFeatures = require('./../utils/apiFeatures');

// CUSTOM-MIDDLEWARE
exports.aliasTopTours = (req, res, next) => {
  const query = new URLSearchParams(req.query);
  query.set('limit', '5');
  query.set('sort', '-ratingsAverage,price');
  query.set('fields', 'name,price,ratingsAverage,summary,difficulty');

  // Rebuild the URL so Express reparses req.query
  req.url = `${req.path}?${query.toString()}`;

  // console.log('aliasData triggered:', req.url); // optional debug);

  // TODO : NOT WORKING PROPERLY
  // req.query.limit = '5';
  // req.query.sort = '-ratingsAverage,price';
  // req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  // console.log('req.query > ', req.query);
  next();
};

// HANDLERS
exports.getAllTours = async (req, res) => {
  try {
    // console.log(`req.query >`, req.query);

    // EXECUTE QUERY
    const features = new APIFeatures(Tour.find(), req.query)
      .sort()
      .limitFields()
      .paginate()
      .filter();

    const tours = await features.query;

    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: 'fail',
      message: error.message,
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    // brief -> Tour.findOne({ _id: req.params.id })

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      success: 'fail',
      message: err,
      printStack: err.printStack,
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    // const newTour = new Tour({});
    // newTour.save()

    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      success: 'fail',
      message: err,
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      data: { tour },
    });
  } catch (err) {
    res.status(400).json({
      success: 'fail',
      message: err,
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(400).json({
      success: 'fail',
      message: err,
    });
  }
};
const tourSchema = new mongoose.Schema();
