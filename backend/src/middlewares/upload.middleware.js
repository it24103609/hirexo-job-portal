const { resumeUpload } = require('../config/multer');
const AppError = require('../utils/AppError');

function handleUploadErrors(err, req, res, next) {
  if (!err) {
    return next();
  }

  if (err.message === 'Only PDF files are allowed') {
    return next(new AppError(err.message, 400));
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    return next(new AppError('File size exceeds the allowed limit', 400));
  }

  return next(err);
}

module.exports = {
  resumeUpload,
  handleUploadErrors
};
