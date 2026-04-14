const cors = require('cors');
const { env } = require('./env');

function getAllowedOrigins() {
  const origins = new Set();

  if (env.clientUrl) {
    origins.add(env.clientUrl.trim());
  }

  const extraOrigins = String(process.env.CLIENT_URLS || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  for (const origin of extraOrigins) {
    origins.add(origin);
  }

  return origins;
}

function corsMiddleware() {
  const allowedOrigins = getAllowedOrigins();
  const allowVercelPreviews = String(process.env.ALLOW_VERCEL_PREVIEWS || 'false').toLowerCase() === 'true';

  return cors({
    origin(origin, callback) {
      // Allow non-browser clients (server-to-server, curl, etc.)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      if (allowVercelPreviews && /\.vercel\.app$/.test(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
  });
}

module.exports = corsMiddleware;
