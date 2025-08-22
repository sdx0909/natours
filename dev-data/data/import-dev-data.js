const fs = require('fs');
const Tour = require('./../../models/tourModel');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config();

// CONNECTING TO DB
mongoose
  .connect(process.env.DATABASE_LOCAL)
  // .connect(process.env.DATABASE)
  .then((con) => {
    console.log('DB connection successful!');
  })
  .catch((err) => console.log(err));

// READ JSON FILE
const tours = JSON.parse(
  // PARSING INTO OBJECT
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'),
);

// IMPORT DATA INTO DB
// COMMAND > node dev-data\data\import-dev-data.js --import
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data successfully loaded!');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

// DELETE DATA FROM DB
// COMMAND > node dev-data\data\import-dev-data.js --delete
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data successfully deleted!');
  } catch (error) {
    console.log(error);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

// console.log(process.argv);
// OUTPUT:
// [
//   'C:\\Program Files\\nodejs\\node.exe',
//   'D:\\Udemy-Nodejs\\natours\\dev-data\\data\\import-dev-data.js',
//   '--import'
// ]
