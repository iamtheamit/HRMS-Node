// auth.controller.js
// This controller handles authentication HTTP requests such as login and registration.
// It is responsible for receiving HTTP input, delegating to the auth service, and returning standardized ApiResponse objects.

const authService = require('../services/auth.service');
const { sendSuccess } = require('../utils/apiResponse');
const StatusCodes = require('../constants/statusCodes');
const { AUTH_MESSAGES } = require('../constants/messages');
const { RegisterDTO, LoginDTO } = require('../dtos/auth.dto');

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
    return sendSuccess(res, AUTH_MESSAGES.LOGIN_SUCCESS, result, StatusCodes.OK);
  } catch (err) {
    return next(err);
  }
};

const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const tokens = await authService.refresh(refreshToken);
    return sendSuccess(res, AUTH_MESSAGES.REFRESH_SUCCESS, tokens, StatusCodes.OK);
  } catch (err) {
    return next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    await authService.logout(refreshToken);
    return sendSuccess(res, AUTH_MESSAGES.LOGOUT_SUCCESS, null, StatusCodes.OK);
  } catch (err) {
    return next(err);
  }
};

const logoutAll = async (req, res, next) => {
  try {
    const userId = req.user && req.user.userId;
    await authService.logoutAll(userId);
    return sendSuccess(res, AUTH_MESSAGES.LOGOUT_ALL_SUCCESS, null, StatusCodes.OK);
  } catch (err) {
    return next(err);
  }
};

const activateAccount = async (req, res, next) => {
  try {
    const { token } = req.body;
    await authService.activateAccount(token);
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

module.exports = {
  register,
  login,
  refresh,
  logout,
  logoutAll,
  activateAccount,
  resetPasswordRequest,
  resetPassword,
};

