// apiResponse.js
// This utility defines a standardized API response structure for successful operations.
// It is responsible for ensuring all controllers return a uniform response shape across the HRMS backend.

class ApiResponse {
  constructor(success, message, data = null) {
    this.success = success;
    this.message = message;
    this.data = data;
  }
}

const sendSuccess = (res, message, data = null, statusCode = 200) => {
  const payload = new ApiResponse(true, message, data);
  return res.status(statusCode).json(payload);
};

const sendError = (res, message, statusCode = 500, error = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error,
  });
};

module.exports = {
  ApiResponse,
  sendSuccess,
  sendError,
};

