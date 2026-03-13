// statusCodes.js
// This constants file centralizes HTTP status code values used across the application.
// It is responsible for providing semantic names for status codes to keep services and controllers expressive and consistent.

const StatusCodes = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

module.exports = StatusCodes;

