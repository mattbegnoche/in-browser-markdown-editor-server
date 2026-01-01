// Core modules
const path = require('path');

// Third-party modules
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');

// Local modules
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

// Route handlers
const userRouter = require('./routes/userRouter');
const markdownRouter = require('./routes/markdownRouter');

// Initialize express app
const app = express();

app.enable('trust proxy');

app.use(cors()); // Enable Cross-Origin Resource Sharing for all routes
app.options('*', cors()); // Enable preflight requests for all routes
app.use(helmet()); // Set security HTTP headers
app.use(hpp()); // Prevent HTTP Parameter Pollution attacks

// Development Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate Limiting Middleware
const limiter = rateLimit({
  max: 100, // Limit each IP to 100 requests per hour
  windowMs: 60 * 60 * 1000, // 1 hour
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss()); // Place xss-clean here, after body parsing

// Compression middleware
app.use(compression());

// Routes
app.use('/api/v1/user', userRouter);
// app.use('/api/v1/markdown', markdownRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);
module.exports = app;
