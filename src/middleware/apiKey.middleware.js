const ApiError = require('../utils/apiError');
const StatusCodes = require('../constants/statusCodes');
const { SECURITY_MESSAGES } = require('../constants/messages');

const API_KEY_HEADER = 'x-api-key';

const apiKeyMiddleware = (req, res, next) => {
  const configuredApiKey = String(process.env.API_SECRET_KEY || '').trim();

  if (!configuredApiKey) {
    return next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, SECURITY_MESSAGES.API_KEY_NOT_CONFIGURED));
  }

  const incomingApiKey = String(req.headers[API_KEY_HEADER] || '').trim();
  if (!incomingApiKey) {
    return next(new ApiError(StatusCodes.UNAUTHORIZED, SECURITY_MESSAGES.API_KEY_MISSING));
  }

  if (incomingApiKey !== configuredApiKey) {
    return next(new ApiError(StatusCodes.FORBIDDEN, SECURITY_MESSAGES.API_KEY_INVALID));
  }

  return next();
};

module.exports = apiKeyMiddleware;