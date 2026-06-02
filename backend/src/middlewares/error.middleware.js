const AppError = require('../utils/AppError');

function redactBody(body) {
  if (!body || typeof body !== 'object') return body;

  return Object.fromEntries(
    Object.entries(body).map(([key, value]) => [
      key,
      /password|token|secret/i.test(key) ? '[redacted]' : value
    ])
  );
}

function errorHandler(err, req, res, next) {
  const error = err instanceof AppError ? err : new AppError(err.message || 'Internal Server Error', err.statusCode || 500);

  // Extra error logging
  console.error('[ERROR]', err);
  if (req && req.method && req.url) {
    console.error('[ERROR] Request:', req.method, req.url);
    if (req.body) console.error('[ERROR] Body:', redactBody(req.body));
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

  if (!res.getHeader('Access-Control-Allow-Origin')) {
    res.setHeader('Access-Control-Allow-Origin', process.env.CLIENT_URL || '*');
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    error: process.env.NODE_ENV === 'production' ? undefined : error.stack
  });
}

module.exports = errorHandler;
