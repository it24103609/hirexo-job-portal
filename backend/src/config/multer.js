const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { env } = require('./env');

const isVercelRuntime = String(process.env.VERCEL || '').toLowerCase() === '1';
const uploadRoot = isVercelRuntime
  ? path.resolve('/tmp', env.uploadDir)
  : path.resolve(process.cwd(), env.uploadDir);

if (!fs.existsSync(uploadRoot)) {
  fs.mkdirSync(uploadRoot, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, uploadRoot);
  },
  filename(req, file, callback) {
    const safeName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`;
    callback(null, safeName);
  }
});

function fileFilter(req, file, callback) {
  const allowedMimeTypes = new Set(['application/pdf']);
  const allowedExtensions = /\.pdf$/i;
  const isPdf = allowedMimeTypes.has(file.mimetype) && allowedExtensions.test(file.originalname);

  if (!isPdf) {
    return callback(new Error('Only PDF files are allowed'));
  }

  callback(null, true);
}

function imageFileFilter(req, file, callback) {
  const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/jpg']);
  const allowedExtensions = /\.(jpg|jpeg|png|webp)$/i;
  const isImage = allowedMimeTypes.has(file.mimetype) && allowedExtensions.test(file.originalname);

  if (!isImage) {
    return callback(new Error('Only image files (JPG, PNG, WebP) are allowed'));
  }

  callback(null, true);
}

const resumeUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: env.maxFileSize }
});

const profilePictureUpload = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: env.maxFileSize }
});

module.exports = {
  resumeUpload,
  profilePictureUpload,
  uploadRoot
};
