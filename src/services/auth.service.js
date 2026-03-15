// auth.service.js
// Implements authentication flows: register, login, refresh, logout, account activation and password reset.
// Uses sessions for multi-device support and stores hashed refresh tokens.

const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const authRepository = require('../repositories/auth.repository');
const sessionRepository = require('../repositories/session.repository');
const permissionRepository = require('../repositories/permission.repository');
const ApiError = require('../utils/apiError');
const StatusCodes = require('../constants/statusCodes');
const { AUTH_MESSAGES } = require('../constants/messages');
const emailService = require('./email/email.service');

const SALT_ROUNDS = 10;
const ACCESS_TOKEN_EXPIRES = '15m';
const REFRESH_TOKEN_EXPIRES_DAYS = 7; // used for expiresAt

const createAccessToken = (user, sessionId) => {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    sessionId,
  };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES });
};

// helper to build an opaque refresh token string containing sessionId and raw token
const buildRefreshTokenString = (sessionId, rawToken) => {
  const combined = `${sessionId}:${rawToken}`;
  return Buffer.from(combined).toString('base64');
};

const parseRefreshTokenString = (refreshToken) => {
  try {
    const decoded = Buffer.from(refreshToken, 'base64').toString('utf8');
    const [sessionId, rawToken] = decoded.split(':');
    if (!sessionId || !rawToken) return null;
    return { sessionId, rawToken };
  } catch (err) {
    return null;
  }
};

const register = async ({ email, password, role = 'EMPLOYEE', firstName, lastName }) => {
  const existingUser = await authRepository.findUserByEmail(email);
  if (existingUser) throw new ApiError(StatusCodes.CONFLICT, AUTH_MESSAGES.EMAIL_ALREADY_REGISTERED);

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // generate activation token
  const activationToken = crypto.randomBytes(24).toString('hex');

  const user = await authRepository.createUser({
    email,
    password: hashedPassword,
    role,
    firstName,
    lastName,
    activationToken,
    isActive: false,
  });

  const { password: _, ...safeUser } = user;
  // In production, send activation email with activationToken
  try {
    const appUrl = process.env.APP_URL || `http://localhost:${process.env.PORT || 5000}`;
    const activationLink = `${appUrl}/api/auth/activate?token=${activationToken}`;
    // fire-and-forget; errors are logged inside the service
    emailService.sendAccountActivationEmail(user, activationLink).catch((err) => console.error('Activation email failed:', err));
  } catch (err) {
    console.error('prepare activation email failed:', err);
  }
  return safeUser;
};

const login = async ({ email, password, deviceInfo = '', ipAddress = '' }) => {
  const user = await authRepository.findUserByEmail(email);
  if (!user) throw new ApiError(StatusCodes.UNAUTHORIZED, AUTH_MESSAGES.INVALID_CREDENTIALS);

  if (!user.isActive) throw new ApiError(StatusCodes.FORBIDDEN, AUTH_MESSAGES.ACCOUNT_INACTIVE);

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new ApiError(StatusCodes.UNAUTHORIZED, AUTH_MESSAGES.INVALID_CREDENTIALS);

  // create session
  const rawRefresh = crypto.randomBytes(48).toString('hex');
  const hashedRefresh = await bcrypt.hash(rawRefresh, SALT_ROUNDS);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000);

  const createdSession = await sessionRepository.createSession({
    userId: user.id,
    refreshToken: hashedRefresh,
    deviceInfo,
    ipAddress,
    expiresAt,
  });

  const refreshTokenString = buildRefreshTokenString(createdSession.id, rawRefresh);
  const accessToken = createAccessToken(user, createdSession.id);

  const { password: _, ...safeUser } = user;
  return {
    accessToken,
    refreshToken: refreshTokenString,
    expiresAt: createdSession.expiresAt,
    user: safeUser,
  };
};

const refresh = async (refreshTokenString) => {
  const parsed = parseRefreshTokenString(refreshTokenString);
  if (!parsed) throw new ApiError(StatusCodes.UNAUTHORIZED, AUTH_MESSAGES.INVALID_TOKEN);

  const { sessionId, rawToken } = parsed;
  const session = await sessionRepository.findById(sessionId);
  if (!session) throw new ApiError(StatusCodes.UNAUTHORIZED, AUTH_MESSAGES.INVALID_TOKEN);
  if (new Date() > session.expiresAt) {
    await sessionRepository.deleteById(sessionId);
    throw new ApiError(StatusCodes.UNAUTHORIZED, AUTH_MESSAGES.REFRESH_EXPIRED);
  }

  const isMatch = await bcrypt.compare(rawToken, session.refreshToken);
  if (!isMatch) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, AUTH_MESSAGES.INVALID_TOKEN);
  }

  const user = await authRepository.findUserById(session.userId);
  if (!user) throw new ApiError(StatusCodes.UNAUTHORIZED, AUTH_MESSAGES.INVALID_TOKEN);

  // rotate refresh token: issue a new raw token and update session
  const newRaw = crypto.randomBytes(48).toString('hex');
  const newHashed = await bcrypt.hash(newRaw, SALT_ROUNDS);
  const newExpiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000);
  await sessionRepository.updateRefreshToken(sessionId, newHashed, newExpiresAt);

  const newRefreshTokenString = buildRefreshTokenString(sessionId, newRaw);
  const newAccessToken = createAccessToken(user, sessionId);

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshTokenString,
    expiresAt: newExpiresAt,
  };
};

const logout = async (refreshTokenString) => {
  const parsed = parseRefreshTokenString(refreshTokenString);
  if (!parsed) return;
  const { sessionId } = parsed;
  await sessionRepository.deleteById(sessionId);
};

const logoutAll = async (userId) => {
  await sessionRepository.deleteByUserId(userId);
};

const activateAccount = async (activationToken) => {
  const user = await authRepository.findUserByActivationToken(activationToken);
  if (!user) throw new ApiError(StatusCodes.BAD_REQUEST, AUTH_MESSAGES.INVALID_ACTIVATION_TOKEN);
  await authRepository.updateUser(user.id, { isActive: true, activationToken: null });
  return true;
};

const requestPasswordReset = async (email) => {
  const user = await authRepository.findUserByEmail(email);
  if (!user) return; // do not reveal existence

  const token = crypto.randomBytes(24).toString('hex');
  const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await authRepository.updateUser(user.id, { resetToken: token, resetTokenExpiry: expiry });
  // In production, send email with token
  return true;
};

const resetPassword = async (token, newPassword) => {
  const user = await authRepository.findUserByResetToken(token);
  if (!user || !user.resetTokenExpiry || new Date() > user.resetTokenExpiry) {
    throw new ApiError(StatusCodes.BAD_REQUEST, AUTH_MESSAGES.INVALID_RESET_TOKEN);
  }
  const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await authRepository.updateUser(user.id, { password: hashed, resetToken: null, resetTokenExpiry: null });
  return true;
};

// Permission helpers
const userHasPermission = async (userId, permissionName) => {
  // SUPER_ADMIN always allowed
  const user = await authRepository.findUserById(userId);
  if (!user) return false;
  if (user.role === 'SUPER_ADMIN') return true;

  const perm = await permissionRepository.findByName(permissionName);
  if (!perm) return false;

  const has = await permissionRepository.userHasPermission(userId, perm.id);
  return has;
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  logoutAll,
  activateAccount,
  requestPasswordReset,
  resetPassword,
  userHasPermission,
};

