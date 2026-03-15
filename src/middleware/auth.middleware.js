// auth.middleware.js
// This middleware validates JWT tokens on protected routes.
// It is responsible for authenticating requests, attaching the authenticated user payload, and raising structured API errors on failure.

const jwt = require('jsonwebtoken');
const ApiError = require('../utils/apiError');
const StatusCodes = require('../constants/statusCodes');
const { AUTH_MESSAGES } = require('../constants/messages');
const authRepository = require('../repositories/auth.repository');
const { accessTokenCookieName } = require('../config/app');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
  const cookieToken = req.cookies && req.cookies[accessTokenCookieName];
  const token = bearerToken || cookieToken;

  if (!token) {
    return next(new ApiError(StatusCodes.UNAUTHORIZED, AUTH_MESSAGES.TOKEN_MISSING));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // attach minimal user info and fetch fresh user
    const user = await authRepository.findUserById(decoded.userId);
    if (!user) return next(new ApiError(StatusCodes.UNAUTHORIZED, AUTH_MESSAGES.INVALID_TOKEN));

    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
      employeeId: user.employee ? user.employee.id : null,
    };
    return next();
  } catch (err) {
    return next(new ApiError(StatusCodes.UNAUTHORIZED, AUTH_MESSAGES.INVALID_TOKEN));
  }
};

module.exports = authMiddleware;

