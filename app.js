// Third-party modules
const express = require('express');
const helmet = require('helmet');
const hpp = require('hpp');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const compression = require('compression');

// Local modules
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

// Route handlers
const userRouter = require('./routes/userRouter');
const markdownRouter = require('./routes/markdownRouter');

// MongoDB Connection (for Vercel serverless only)
// When running on Vercel, DATABASE env var exists but server.js isn't used
if (process.env.VERCEL && process.env.DATABASE && process.env.DB_PASSWORD) {
  const mongoose = require('mongoose');
  const DB = process.env.DATABASE.replace(
    '<db_password>',
    process.env.DB_PASSWORD,
  );

  mongoose
    .connect(DB, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    })
    .then(() => console.log('DB connection successful!'))
    .catch((err) => console.error('MongoDB connection error:', err));
}

// Initialize express app
const app = express();

app.enable('trust proxy');

app.use(cors()); // Enable Cross-Origin Resource Sharing for all routes
app.options('/*path', cors()); // Enable preflight requests for all routes
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
  standardHeaders: true,
  legacyHeaders: false,
  // Skip trust proxy validation for development
  validate: { trustProxy: false },
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Compression middleware
app.use(compression());

// Routes
app.use('/api/v1/users', userRouter);
app.use('/api/v1/markdowns', markdownRouter);

app.all('/*path', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);
module.exports = app;
