// upload.middleware.js
// Parses multipart uploads into memory for forwarding to Cloudinary.

const multer = require('multer');
const ApiError = require('../utils/apiError');
const StatusCodes = require('../constants/statusCodes');

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_FILES = 10;

const allowedMimePrefixes = ['image/', 'video/'];
const allowedMimeTypes = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
]);

const fileFilter = (req, file, cb) => {
  const mimeType = String(file.mimetype || '').toLowerCase();
  const isAllowedPrefix = allowedMimePrefixes.some((prefix) => mimeType.startsWith(prefix));
  const isAllowedType = allowedMimeTypes.has(mimeType);

  if (!isAllowedPrefix && !isAllowedType) {
    return cb(new ApiError(StatusCodes.BAD_REQUEST, `Unsupported file type: ${mimeType || 'unknown'}`));
  }

  return cb(null, true);
};

const uploadMediaMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES,
  },
  fileFilter,
});

module.exports = {
  uploadMediaMiddleware,
};
