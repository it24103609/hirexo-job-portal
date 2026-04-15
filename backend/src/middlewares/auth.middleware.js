const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { verifyAccessToken } = require('../utils/jwt');
const User = require('../models/User');
const { USER_STATUS } = require('../utils/constants');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    throw new AppError('Not authorized. Token missing.', 401);
  }

  const payload = verifyAccessToken(token);
  const user = await User.findById(payload.id).select('-passwordHash');

  if (!user) {
    throw new AppError('User not found', 401);
  }

  if (user.status === USER_STATUS.BLOCKED) {
    throw new AppError('Your account has been blocked', 403);
  }

  req.user = user;
  next();
});

module.exports = {
  protect
};
