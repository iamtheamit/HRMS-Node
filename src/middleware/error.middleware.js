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

  const statusCode =
    (isApiError && err.statusCode) || err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  const message = err.message || COMMON_MESSAGES.INTERNAL_SERVER_ERROR;

  let errorPayload;
  if (isApiError && err.error) {
    errorPayload = err.error;
  } else if (process.env.NODE_ENV !== 'production') {
    errorPayload = {
      name: err.name,
      stack: err.stack,
    };
  }

  return sendError(res, message, statusCode, errorPayload);
};

module.exports = errorMiddleware;

