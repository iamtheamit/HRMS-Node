// media.service.js
// Uploads one or more in-memory files to Cloudinary.

const cloudinary = require('../config/cloudinary');
const ApiError = require('../utils/apiError');
const StatusCodes = require('../constants/statusCodes');

const ensureCloudinaryConfig = () => {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Cloudinary configuration is missing');
  }
};

const sanitizeFolder = (value) =>
  String(value || 'hrms/general')
    .trim()
    .replace(/\\+/g, '/')
    .replace(/[^a-zA-Z0-9_\-/]/g, '')
    .replace(/\/+/g, '/')
    .replace(/^\/+|\/+$/g, '') || 'hrms/general';

const uploadSingleFile = (file, options) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder,
        resource_type: options.resourceType,
        use_filename: true,
        unique_filename: true,
        overwrite: false,
      },
      (error, result) => {
        if (error || !result) {
          return reject(new ApiError(StatusCodes.BAD_REQUEST, error?.message || 'Cloud upload failed'));
        }

        return resolve({
          originalName: file.originalname,
          fieldName: file.fieldname,
          mimeType: file.mimetype,
          bytes: file.size,
          publicId: result.public_id,
          url: result.secure_url,
          format: result.format,
          resourceType: result.resource_type,
          width: result.width || null,
          height: result.height || null,
          createdAt: result.created_at,
        });
      }
    );

    uploadStream.end(file.buffer);
  });
};

const uploadMediaFiles = async (files, options = {}) => {
  ensureCloudinaryConfig();

  if (!Array.isArray(files) || files.length === 0) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'At least one file is required');
  }

  const normalizedOptions = {
    folder: sanitizeFolder(options.folder),
    resourceType: options.resourceType || 'auto',
  };

  const uploadedFiles = await Promise.all(
    files.map((file) => uploadSingleFile(file, normalizedOptions))
  );

  return uploadedFiles;
};

module.exports = {
  uploadMediaFiles,
};
