const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const { env, assertEnv } = require('../config/env');
const User = require('../models/User');
const { ROLES, USER_STATUS } = require('./constants');

async function seedAdmin() {
  assertEnv();
  await connectDB(env.mongoUri);

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@hirexo.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  const existing = await User.findOne({ email: adminEmail });
  if (existing) {
    console.log(`Admin already exists: ${adminEmail}`);
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);
  await User.create({
    name: 'System Admin',
    email: adminEmail,
    passwordHash,
    role: ROLES.ADMIN,
    status: USER_STATUS.ACTIVE,
    isVerified: true
  });

  console.log(`Admin seeded: ${adminEmail}`);
  process.exit(0);
}

seedAdmin().catch((error) => {
  console.error(error);
  process.exit(1);
});
