// error.middleware.js
// This middleware centralizes error handling for the Express application.
// It is responsible for converting thrown errors into standardized API responses using ApiError and ApiResponse utilities.

const ApiError = require('../utils/apiError');
const { sendError } = require('../utils/apiResponse');
const StatusCodes = require('../constants/statusCodes');
const { COMMON_MESSAGES } = require('../constants/messages');

// eslint-disable-next-line no-unused-vars
const errorMiddleware = (err, req, res, next) => {
  const isApiError = err instanceof ApiError;

  // Always log the full error server-side for diagnostics (stack included)
  // Use a logging service here in production (winston/pino/etc.).
  // eslint-disable-next-line no-console
  console.error(err);

  // Map known Prisma/client errors to friendly HTTP responses
  let statusCode = (isApiError && err.statusCode) || err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  let message;

  if (err.name === 'PrismaClientValidationError') {
    // Example message: "Invalid `prisma.user.create()` invocation... Invalid value for argument `role`. Expected UserRole."
    const m = String(err.message).match(/argument `([^`]+)`/);
    const field = m ? m[1] : null;
    statusCode = StatusCodes.BAD_REQUEST;
    message = field ? `Invalid value for field '${field}'.` : 'Invalid input value.';
  } else if (err.code === 'P2002') {
    // Unique constraint failed
    // err.meta.target may contain the constrained fields
    const target = err.meta && err.meta.target ? err.meta.target.join(', ') : null;
    statusCode = StatusCodes.CONFLICT;
    message = target ? `Duplicate value for field(s): ${target}` : 'Unique constraint failed.';
  } else {
    // For non-ApiError, hide internal messages in production
    message = isApiError
      ? err.message
      : process.env.NODE_ENV === 'production'
      ? COMMON_MESSAGES.INTERNAL_SERVER_ERROR
      : err.message || COMMON_MESSAGES.INTERNAL_SERVER_ERROR;
  }

  // Only include a structured 'error' payload when an ApiError carries it.
  // Never expose stack traces or Prisma internals to clients.
  const errorPayload = isApiError && err.error ? err.error : undefined;

  return sendError(res, message, statusCode, errorPayload);
};

module.exports = errorMiddleware;

