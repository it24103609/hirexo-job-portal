const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const { env, assertEnv } = require('../config/env');
const User = require('../models/User');
const CandidateProfile = require('../models/CandidateProfile');
const EmployerProfile = require('../models/EmployerProfile');
const { ROLES, USER_STATUS } = require('./constants');
const { createUniqueSlug } = require('./slug');

const users = [
  {
    email: 'alice.chen@hirexo.test',
    password: 'AlicePass123!',
    name: 'Alice Chen',
    role: ROLES.CANDIDATE,
    location: 'San Francisco'
  },
  {
    email: 'bob.kumar@hirexo.test',
    password: 'BobPass456!',
    name: 'Bob Kumar',
    role: ROLES.CANDIDATE,
    location: 'New York'
  },
  {
    email: 'carol.martinez@hirexo.test',
    password: 'CarolPass789!',
    name: 'Carol Martinez',
    role: ROLES.CANDIDATE,
    location: 'Austin'
  },
  {
    email: 'david.thompson@hirexo.test',
    password: 'DavidEmp123!',
    name: 'David Thompson',
    role: ROLES.EMPLOYER,
    companyName: 'David Thompson Hiring'
  },
  {
    email: 'elena.rodriguez@hirexo.test',
    password: 'ElenaEmp456!',
    name: 'Elena Rodriguez',
    role: ROLES.EMPLOYER,
    companyName: 'Elena Rodriguez Hiring'
  },
  {
    email: 'frank.admin@hirexo.test',
    password: 'FrankAdmin123!',
    name: 'Frank Admin',
    role: ROLES.ADMIN
  }
];

async function upsertUser(account) {
  const passwordHash = await bcrypt.hash(account.password, 12);
  let user = await User.findOne({ email: account.email });

  if (user) {
    user.name = account.name;
    user.passwordHash = passwordHash;
    user.role = account.role;
    user.status = USER_STATUS.ACTIVE;
    user.isVerified = true;
    await user.save();
  } else {
    user = await User.create({
      name: account.name,
      email: account.email,
      passwordHash,
      role: account.role,
      status: USER_STATUS.ACTIVE,
      isVerified: true
    });
  }

  if (account.role === ROLES.CANDIDATE) {
    await CandidateProfile.findOneAndUpdate(
      { user: user._id },
      {
        $set: {
          user: user._id,
          headline: `${account.name} Candidate Profile`,
          summary: 'Seeded candidate account for local testing.',
          location: account.location,
          skills: [],
          education: [],
          preferredLocations: [account.location],
          savedJobs: []
        }
      },
      { upsert: true, new: true, runValidators: true }
    );
  }

  if (account.role === ROLES.EMPLOYER) {
    const existingProfile = await EmployerProfile.findOne({ user: user._id });
    const companyName = account.companyName || account.name;
    const slug = existingProfile?.slug || await createUniqueSlug(EmployerProfile, companyName, { email: account.email });

    if (existingProfile) {
      existingProfile.companyName = companyName;
      existingProfile.slug = slug;
      existingProfile.verified = true;
      existingProfile.contactPerson = account.name;
      existingProfile.description = `Seeded employer account for ${account.name}.`;
      await existingProfile.save();
    } else {
      await EmployerProfile.create({
        user: user._id,
        companyName,
        slug,
        verified: true,
        contactPerson: account.name,
        description: `Seeded employer account for ${account.name}.`
      });
    }
  }
}

async function seedTestUsers() {
  assertEnv();
  await connectDB(env.mongoUri);

  for (const account of users) {
    await upsertUser(account);
    console.log(`Seeded: ${account.email}`);
  }

  process.exit(0);
}

seedTestUsers().catch((error) => {
  console.error(error);
  process.exit(1);
});