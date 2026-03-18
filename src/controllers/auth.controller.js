// auth.controller.js
// This controller handles authentication HTTP requests such as login and registration.
// It is responsible for receiving HTTP input, delegating to the auth service, and returning standardized ApiResponse objects.

const authService = require('../services/auth.service');
const { sendSuccess } = require('../utils/apiResponse');
const StatusCodes = require('../constants/statusCodes');
const { AUTH_MESSAGES } = require('../constants/messages');
const { RegisterDTO, LoginDTO } = require('../dtos/auth.dto');
const {
  accessTokenCookieName,
  refreshTokenCookieName,
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
  clearCookieOptions,
  frontendUrl,
} = require('../config/app');

const setAuthCookies = (res, tokens) => {
  if (tokens?.accessToken) {
    res.cookie(accessTokenCookieName, tokens.accessToken, accessTokenCookieOptions);
  }

  if (tokens?.refreshToken) {
    res.cookie(refreshTokenCookieName, tokens.refreshToken, refreshTokenCookieOptions);
  }
};

const clearAuthCookies = (res) => {
  res.clearCookie(accessTokenCookieName, clearCookieOptions);
  res.clearCookie(refreshTokenCookieName, clearCookieOptions);
};

const getRefreshTokenFromRequest = (req) => {
  if (req.body?.refreshToken) return req.body.refreshToken;
  return req.cookies?.[refreshTokenCookieName] || null;
};

const register = async (req, res, next) => {
  try {
    const dto = new RegisterDTO(req.body);
    const user = await authService.register(dto);
    return sendSuccess(res, AUTH_MESSAGES.REGISTER_SUCCESS, user, StatusCodes.CREATED);
  } catch (err) {
    return next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const dto = new LoginDTO(req.body);
    const deviceInfo = req.headers['user-agent'] || '';
    const ipAddress = req.ip || req.connection.remoteAddress || '';
    const result = await authService.login({ ...dto, deviceInfo, ipAddress });
    setAuthCookies(res, result);
    return sendSuccess(res, AUTH_MESSAGES.LOGIN_SUCCESS, result, StatusCodes.OK);
  } catch (err) {
    return next(err);
  }
};

const refresh = async (req, res, next) => {
  try {
    const refreshToken = getRefreshTokenFromRequest(req);
    const tokens = await authService.refresh(refreshToken);
    setAuthCookies(res, tokens);
    return sendSuccess(res, AUTH_MESSAGES.REFRESH_SUCCESS, tokens, StatusCodes.OK);
  } catch (err) {
    return next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    const refreshToken = getRefreshTokenFromRequest(req);
    await authService.logout(refreshToken);
    clearAuthCookies(res);
    return sendSuccess(res, AUTH_MESSAGES.LOGOUT_SUCCESS, null, StatusCodes.OK);
  } catch (err) {
    return next(err);
  }
};

const logoutAll = async (req, res, next) => {
  try {
    const userId = req.user && req.user.userId;
    await authService.logoutAll(userId);
    clearAuthCookies(res);
    return sendSuccess(res, AUTH_MESSAGES.LOGOUT_ALL_SUCCESS, null, StatusCodes.OK);
  } catch (err) {
    return next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await authService.getUserById(req.user.userId);
    return sendSuccess(res, 'User profile fetched', user, StatusCodes.OK);
  } catch (err) {
    return next(err);
  }
};

const activateAccount = async (req, res, next) => {
  try {
    // Accept token from POST body or GET query (for emailed links)
    const token = (req.body && req.body.token) || (req.query && req.query.token) || (req.params && req.params.token);
    await authService.activateAccount(token);

    // If this was triggered by a browser GET (e.g. user clicked emailed link), redirect to frontend
    if (req.method && req.method.toUpperCase() === 'GET') {
      const appUrl = String(frontendUrl || process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
      // Redirect to frontend login page with a flag indicating activation succeeded
      return res.redirect(`${appUrl}/login?activated=1`);
    }

    return sendSuccess(res, AUTH_MESSAGES.ACTIVATION_SUCCESS, null, StatusCodes.OK);
  } catch (err) {
    return next(err);
  }
};

const resetPasswordRequest = async (req, res, next) => {
  try {
    const { email } = req.body;
    await authService.requestPasswordReset(email);
    return sendSuccess(res, AUTH_MESSAGES.RESET_REQUEST_SUCCESS, null, StatusCodes.OK);
  } catch (err) {
    return next(err);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    await authService.resetPassword(token, newPassword);
    return sendSuccess(res, AUTH_MESSAGES.RESET_SUCCESS, null, StatusCodes.OK);
  } catch (err) {
    return next(err);
  }
};

const requestChangePasswordOtp = async (req, res, next) => {
  try {
    await authService.requestChangePasswordOtp(req.user.userId);
    return sendSuccess(res, AUTH_MESSAGES.CHANGE_PASSWORD_OTP_SENT, null, StatusCodes.OK);
  } catch (err) {
    return next(err);
  }
};

const changePasswordWithOtp = async (req, res, next) => {
  try {
    const { currentPassword, otp, newPassword } = req.body;
    await authService.changePasswordWithOtp(req.user.userId, { currentPassword, otp, newPassword });
    return sendSuccess(res, AUTH_MESSAGES.CHANGE_PASSWORD_SUCCESS, null, StatusCodes.OK);
  } catch (err) {
    return next(err);
  }
};

const resendActivationEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return sendSuccess(res, AUTH_MESSAGES.ACTIVATION_EMAIL_RESENT, null, StatusCodes.OK);
    }
    await authService.resendActivationEmail(email);
    return sendSuccess(res, AUTH_MESSAGES.ACTIVATION_EMAIL_RESENT, null, StatusCodes.OK);
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  logoutAll,
  activateAccount,
  resendActivationEmail,
  resetPasswordRequest,
  resetPassword,
  requestChangePasswordOtp,
  changePasswordWithOtp,
  getMe,
};

