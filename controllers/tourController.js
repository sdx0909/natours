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

exports.getTourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      {
        // (OPTIONAL)
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          _id: { $toUpper: '$difficulty' }, // GROUP BY difficulty
          // _id: '$ratingsAverage', // GROUP BY ratingsAverage
          // _id: null, // FOR WHOLE DATA
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      {
        $sort: { avgPrice: 1 },
      },
      // ADVANCED MATCHING
      // {
      //   $match: { _id: { $ne: 'EASY' } },
      // },
    ]);

    res.status(200).json({
      status: 'success',
      data: stats,
    });
  } catch (err) {
    res.status(400).json({
      success: 'fail',
      message: err,
    });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
    const year = req.params.year * 1;

    // go with step by step
    const plan = await Tour.aggregate([
      // seperating array elements into individual document
      {
        $unwind: '$startDates',
      },
      // startdate within respective year
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`), // start-date-of-year
            $lte: new Date(`${year}-12-31`), // last-date-of-year
          },
        },
      },
      // grouping and showing how many tours within a month
      {
        $group: {
          _id: { $month: '$startDates' },
          numTourStarts: { $sum: 1 },
          tours: { $push: '$name' },
        },
      },
      // adding new field in data with month value
      {
        $addFields: {
          month: '$_id',
        },
      },
      // remove _id in projection
      {
        $project: { _id: 0 },
      },
      // sort the data in descending order
      {
        $sort: {
          numTourStarts: -1,
        },
      },
      {
        $limit: 12, // for 12 months
      },
    ]);

    res.status(200).json({
      status: 'success',
      results: plan.length,
      data: plan,
    });
  } catch (err) {
    res.status(400).json({
      success: 'fail',
      message: err,
    });
  }
};
