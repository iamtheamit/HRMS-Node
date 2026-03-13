// apiError.js
// This utility defines a custom error type used for API-related failures.
// It is responsible for carrying HTTP status codes and messages through the middleware chain for consistent error handling.

class ApiError extends Error {
  constructor(statusCode, message, error = null) {
    super(message);
    this.statusCode = statusCode;
    this.error = error;
  }
}

module.exports = ApiError;

