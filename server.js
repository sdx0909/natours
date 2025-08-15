// all configurations done here...
const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config();

const app = require('./app');

// connnecting to DB
mongoose
  // .connect(process.env.DATABASE_LOCAL)
  .connect(process.env.DATABASE)
  .then((con) => {
    console.log('DB connection successful!');
  })
  .catch((err) => console.log(err));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`App running on port: ${PORT}`);
});

// developer eslint & prettier: modules
// npm i eslint prettier eslint-config-prettier eslint-plugin-prettier eslint-config-airbnb eslint-plugin-node eslint-plugin-import eslint-plugin-jsx-a11y eslint-plugin-react --save-dev

// REFERENCE GET ALL TOURS URL
