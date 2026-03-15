const ApiError = require('../utils/apiError');
const StatusCodes = require('../constants/statusCodes');
const authService = require('../services/auth.service');

// permissionMiddleware(permissionName)
// Checks whether the authenticated user has the provided permission.
// SUPER_ADMIN bypasses checks.
const permissionMiddleware = (permissionName) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized'));
      }

      const has = await authService.userHasPermission(req.user.userId, permissionName);
      if (!has) {
        return next(new ApiError(StatusCodes.FORBIDDEN, 'Forbidden: insufficient permissions'));
      }

      return next();
    } catch (err) {
      return next(err);
    }
  };
};

module.exports = permissionMiddleware;
