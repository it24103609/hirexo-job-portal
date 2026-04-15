const app = require('./app');
const connectDB = require('./config/db');
const { env, assertEnv } = require('./config/env');

async function startServer() {
  assertEnv();
  await connectDB(env.mongoUri);

  app.listen(env.port, () => {
    console.log(`Recruitment API running on port ${env.port}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
