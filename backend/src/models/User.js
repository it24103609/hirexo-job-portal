const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLES, USER_STATUS } = require('../utils/constants');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    passwordHash: {
      type: String,
      required() {
        return this.authProvider === 'local';
      }
    },
    authProvider: {
      type: String,
      enum: ['local', 'google', 'github'],
      default: 'local',
      index: true
    },
    google: {
      id: {
        type: String,
        index: true
      }
    },
    github: {
      id: {
        type: String,
        index: true
      }
    },
    profileImage: {
      type: String,
      trim: true,
      default: ''
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.CANDIDATE,
      index: true
    },
    status: {
      type: String,
      enum: Object.values(USER_STATUS),
      default: USER_STATUS.ACTIVE,
      index: true
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    passwordResetTokenHash: {
      type: String,
      index: true
    },
    passwordResetExpiresAt: {
      type: Date
    },
    lastLoginAt: {
      type: Date
    }
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  if (!this.passwordHash) {
    return false;
  }

  return bcrypt.compare(candidatePassword, this.passwordHash);
};

userSchema.set('toJSON', {
  transform(doc, ret) {
    delete ret.passwordHash;
    return ret;
  }
});

module.exports = mongoose.model('User', userSchema);
