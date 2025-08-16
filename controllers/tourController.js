const Tour = require('./../models/tourModel');
const mongoose = require('mongoose');

// CUSTOM-MIDDLEWARE
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

// HANDLERS
exports.getAllTours = async (req, res) => {
  try {
    console.log(`req.query > `, req.query);

    // BUILD QUERY
    // 1A) Filtering
    const queryObj = { ...req.query };

    const excludeFields = ['page', 'sort', 'limit', 'fields'];
    excludeFields.forEach((ele) => {
      delete queryObj[ele];
    });

    // 1B) Advanced Filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    // PARSING STRING TO OBJECT
    console.log('parsing > ', JSON.parse(queryStr)); // view only for Filtering
    // O/P: { duration: { '$gte': '5' }, difficulty: 'easy' }

    let query = Tour.find(JSON.parse(queryStr));
    // NOTE : for sorting it is like
    // let query = Tour.find({}); // fetching all records

    // 2) Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      // console.log(`sortBy >`, sortBy);
      query = query.sort(sortBy);
      // query = query.sort(req.query.sort);
    } else {
      query = query.sort('-createdAt');
    }

    // 3) Field limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }

    // 4) Pagination
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100;
    const skip = (page - 1) * limit;

    console.log(`skip`, skip);

    if (req.query.page) {
      const numTours = await Tour.countDocuments();
      if (skip >= numTours) throw new Error('This page does not exists');
    }

    query = query.skip(skip).limit(limit);

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
