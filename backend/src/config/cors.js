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
  const isDevelopment = env.nodeEnv === 'development';

  return cors({
    origin(origin, callback) {
      // Allow non-browser clients (server-to-server, curl, etc.)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      // In local development, allow localhost and 127.0.0.1 on any port.
      if (isDevelopment) {
        try {
          const parsed = new URL(origin);
          if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
            return callback(null, true);
          }
        } catch {
          // Ignore malformed origins and continue to rejection path.
        }
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
