// apiKey.middleware.js
// Validates API requests with x-api-key header to prevent unauthorized API access.
// All /api/* routes require a valid API_SECRET_KEY from the request header.
// This adds an extra layer of security beyond JWT authentication.

const logger = require('../utils/logger');
const ApiError = require('../utils/apiError');
const StatusCodes = require('../constants/statusCodes');
const { SECURITY_MESSAGES } = require('../constants/messages');

const API_KEY_HEADER = 'x-api-key';

// Middleware function that validates the incoming request API key
const apiKeyMiddleware = (req, res, next) => {
  const configuredApiKey = String(process.env.API_SECRET_KEY || '').trim();

  // Log the endpoint being accessed
  logger.debug(`[SECURITY] API request validation`, {
    method: req.method,
    path: req.path,
    hasApiKeyHeader: !!req.headers[API_KEY_HEADER],
  });

  if (!configuredApiKey) {
    logger.error('[SECURITY] API_SECRET_KEY not configured on server', {
      endpoint: `${req.method} ${req.path}`,
    });
    return next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, SECURITY_MESSAGES.API_KEY_NOT_CONFIGURED));
  }

  // Extract API key from request header
  const incomingApiKey = String(req.headers[API_KEY_HEADER] || '').trim();
  if (!incomingApiKey) {
    logger.warn('[SECURITY] Missing API key header', {
      endpoint: `${req.method} ${req.path}`,
      ip: req.ip || req.connection.remoteAddress,
    });
    return next(new ApiError(StatusCodes.UNAUTHORIZED, SECURITY_MESSAGES.API_KEY_MISSING));
  }

  // Compare incoming key with configured server key
  if (incomingApiKey !== configuredApiKey) {
    logger.warn('[SECURITY] Invalid API key provided', {
      endpoint: `${req.method} ${req.path}`,
      providedKeyLength: incomingApiKey.length,
      ip: req.ip || req.connection.remoteAddress,
    });
    return next(new ApiError(StatusCodes.FORBIDDEN, SECURITY_MESSAGES.API_KEY_INVALID));
  }

  // API key is valid, proceed to next middleware
  logger.debug('[SECURITY] API key validation successful', {
    endpoint: `${req.method} ${req.path}`,
  });

  return next();
};

module.exports = apiKeyMiddleware;