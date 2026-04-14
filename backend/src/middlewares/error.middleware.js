const AppError = require('../utils/AppError');

function errorHandler(err, req, res, next) {
  const error = err instanceof AppError ? err : new AppError(err.message || 'Internal Server Error', err.statusCode || 500);

  if (error.name === 'CastError') {
    error.statusCode = 400;
    error.message = 'Invalid resource identifier';
  }

  if (error.code === 11000) {
    error.statusCode = 400;
    const duplicateField = Object.keys(error.keyValue || {})[0];
    error.message = `${duplicateField} already exists`;
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message
  });
}

module.exports = errorHandler;
