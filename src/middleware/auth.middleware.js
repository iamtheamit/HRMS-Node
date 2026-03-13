// auth.middleware.js
// This middleware validates JWT tokens on protected routes.
// It is responsible for authenticating requests, attaching the authenticated user payload, and raising structured API errors on failure.

const jwt = require('jsonwebtoken');
const ApiError = require('../utils/apiError');
const StatusCodes = require('../constants/statusCodes');
const { AUTH_MESSAGES } = require('../constants/messages');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!token) {
    return next(new ApiError(StatusCodes.UNAUTHORIZED, AUTH_MESSAGES.TOKEN_MISSING));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (err) {
    return next(new ApiError(StatusCodes.UNAUTHORIZED, AUTH_MESSAGES.INVALID_TOKEN));
  }
};

module.exports = authMiddleware;

