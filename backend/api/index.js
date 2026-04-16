const app = require('../src/app');
const connectDB = require('../src/config/db');
const { env, assertEnv } = require('../src/config/env');

let connectPromise;

module.exports = async function handler(req, res) {
  try {
    if (!connectPromise) {
      assertEnv();
      connectPromise = connectDB(env.mongoUri);
    }

    await connectPromise;
    return app(req, res);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server initialization failed',
      error: error.message
    });
  }
};
