const express = require('express');

const app = express();
const morgan = require('morgan');
const userRouter = require('./routes/userRoutes');
const tourRouter = require('./routes/tourRoutes');

// 1) MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'));

	// custom-middleware :
	app.use((req, res, next) => {
		console.log('Hello from middleware!');
		next();
	});

	app.use((req, res, next) => {
		req.requestTime = new Date().toISOString();
		next();
	});
}

app.use(express.json()); // middleware for parsing JSON data: inbuilt
app.use(express.static(`${__dirname}/public`));

// 3) ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// exporting the app
module.exports = app;
