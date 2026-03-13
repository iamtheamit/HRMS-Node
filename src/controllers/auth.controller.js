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
    const result = await authService.login(dto);
    return sendSuccess(res, AUTH_MESSAGES.LOGIN_SUCCESS, result, StatusCodes.OK);
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  register,
  login,
};

