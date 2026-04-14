const AppError = require('../utils/AppError');

function validate(requiredFields = []) {
  return (req, res, next) => {
    const missingFields = requiredFields.filter((field) => {
      const value = req.body?.[field];
      return value === undefined || value === null || value === '';
    });

    if (missingFields.length > 0) {
      return next(new AppError(`Missing required fields: ${missingFields.join(', ')}`, 400));
    }

    return next();
  };
}

module.exports = {
  validate
};
