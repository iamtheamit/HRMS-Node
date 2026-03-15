// media.controller.js
// Handles media upload requests and returns Cloudinary metadata/URLs.

const mediaService = require('../services/media.service');
const { sendSuccess } = require('../utils/apiResponse');
const StatusCodes = require('../constants/statusCodes');
const { MEDIA_MESSAGES } = require('../constants/messages');

const uploadMedia = async (req, res, next) => {
  try {
    const files = Array.isArray(req.files) ? req.files : req.file ? [req.file] : [];
    const folder = req.body?.folder || 'hrms/general';
    const resourceType = req.body?.resourceType || 'auto';

    const uploads = await mediaService.uploadMediaFiles(files, { folder, resourceType });

    return sendSuccess(
      res,
      MEDIA_MESSAGES.UPLOAD_SUCCESS,
      {
        total: uploads.length,
        files: uploads,
      },
      StatusCodes.CREATED
    );
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  uploadMedia,
};
