const { resumeUpload, employerCvUpload, profilePictureUpload, messageAttachmentUpload } = require('../config/multer');
const AppError = require('../utils/AppError');

function handleUploadErrors(err, req, res, next) {
  if (!err) {
    return next();
  }

  if (err.message?.includes('Only PDF files are allowed') || err.message?.includes('Only image files')) {
    return next(new AppError(err.message, 400));
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    return next(new AppError('File size exceeds the allowed limit', 400));
  }

  if (err.name === 'MulterError') {
    return next(new AppError(err.message, 400));
  }

  return next(err);
}

module.exports = {
  resumeUpload,
  employerCvUpload,
  profilePictureUpload,
  messageAttachmentUpload,
  handleUploadErrors
};
