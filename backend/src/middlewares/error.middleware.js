const AppError = require('../utils/AppError');

function errorHandler(err, req, res, next) {
  const error = err instanceof AppError ? err : new AppError(err.message || 'Internal Server Error', err.statusCode || 500);

  // Extra error logging
  console.error('[ERROR]', err);
  if (req && req.method && req.url) {
    console.error('[ERROR] Request:', req.method, req.url);
    if (req.body) console.error('[ERROR] Body:', req.body);
    if (req.headers) console.error('[ERROR] Headers:', req.headers);
  }

  if (error.name === 'CastError') {
    error.statusCode = 400;
    error.message = 'Invalid resource identifier';
  }

  if (error.code === 11000) {
    error.statusCode = 400;
    const duplicateField = Object.keys(error.keyValue || {})[0];
    error.message = `${duplicateField} already exists`;
  }

  // Always set CORS headers for error responses
  res.setHeader('Access-Control-Allow-Origin', process.env.CLIENT_URL || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    error: process.env.NODE_ENV === 'production' ? undefined : error.stack
  });
}

module.exports = errorHandler;
