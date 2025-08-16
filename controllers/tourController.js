const Tour = require('./../models/tourModel');
const mongoose = require('mongoose');

// HANDLERS
exports.getAllTours = async (req, res) => {
  try {
    // console.log(`req.query > `, req.query);

    // BUILD QUERY
    // 1) Filtering
    const queryObj = { ...req.query };

    const excludeFields = ['page', 'sort', 'limit', 'fields'];
    excludeFields.forEach((ele) => {
      delete queryObj[ele];
    });

    // 2) Advanced Filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    // PARSING STRING TO OBJCET
    console.log(JSON.parse(queryStr));
    // O/P: { duration: { '$gte': '5' }, difficulty: 'easy' }

    // WE WANT : { duration: { $gte: 5 }, difficulty: 'easy' }
    // QUERY : { duration: { gte: '5' }, difficulty: 'easy' }

    const query = Tour.find(JSON.parse(queryStr));

    // EXECUTE QUERY
    const tours = await query;

    // const query = Tour.find()
    //   .where('difficulty')
    //   .equals('easy')
    //   .where('duration')
    //   .equals(5);

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
      message: error,
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
