// auth.service.js
// This service implements business logic for user authentication, including registration and login.
// It is responsible for hashing passwords, validating credentials, and issuing JWT tokens via the auth repository.

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authRepository = require('../repositories/auth.repository');
const ApiError = require('../utils/apiError');
const StatusCodes = require('../constants/statusCodes');
const { AUTH_MESSAGES } = require('../constants/messages');

const SALT_ROUNDS = 10;

const register = async ({ email, password, role = 'EMPLOYEE' }) => {
  const existingUser = await authRepository.findUserByEmail(email);
  if (existingUser) {
    throw new ApiError(StatusCodes.CONFLICT, AUTH_MESSAGES.EMAIL_ALREADY_REGISTERED);
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await authRepository.createUser({
    email,
    password: hashedPassword,
    role,
  });

  const { password: _, ...safeUser } = user;
  return safeUser;
};

const login = async ({ email, password }) => {
  const user = await authRepository.findUserByEmail(email);
  if (!user) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, AUTH_MESSAGES.INVALID_CREDENTIALS);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, AUTH_MESSAGES.INVALID_CREDENTIALS);
  }

  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    employeeId: user.employee ? user.employee.id : null,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '8h',
  });

  const { password: _, ...safeUser } = user;

  return { token, user: safeUser };
};

module.exports = {
  register,
  login,
};

