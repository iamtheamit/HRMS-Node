// employee.service.js
// This service implements business logic for employee management (CRUD operations).
// It is responsible for validating input, enforcing simple domain rules, and delegating persistence to the employee repository.

const employeeRepository = require('../repositories/employee.repository');
const authRepository = require('../repositories/auth.repository');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const ApiError = require('../utils/apiError');
const StatusCodes = require('../constants/statusCodes');
const { EMPLOYEE_MESSAGES, AUTH_MESSAGES } = require('../constants/messages');
const emailService = require('./email/email.service');
const { apiBaseUrl } = require('../config/app');
const logger = require('../utils/logger');

const SALT_ROUNDS = 10;
const USER_ROLES = ['SUPER_ADMIN', 'HR_ADMIN', 'MANAGER', 'EMPLOYEE'];
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const isUuid = (value) => UUID_RE.test(String(value || ''));

const generateTemporaryPassword = () => {
  const partA = crypto.randomBytes(6).toString('base64url');
  const partB = crypto.randomBytes(6).toString('hex');
  return `Tmp@${partA}${partB}`;
};

const normalizeEmployeePayload = (payload = {}) => {
  const normalized = { ...payload };

  if (typeof normalized.countryCode === 'string') {
    normalized.countryCode = normalized.countryCode.trim();
  }

  if (typeof normalized.mobileNumber === 'string') {
    normalized.mobileNumber = normalized.mobileNumber.trim();
  }

  if (!normalized.phone && normalized.countryCode && normalized.mobileNumber) {
    normalized.phone = `${normalized.countryCode}${normalized.mobileNumber}`;
  }

  if (typeof normalized.profileUrl === 'string') {
    normalized.profileUrl = normalized.profileUrl.trim();
  }

  if (typeof normalized.documents === 'string') {
    try {
      normalized.documents = JSON.parse(normalized.documents);
    } catch (error) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'documents must be valid JSON');
    }
  }

  return normalized;
};

const createEmployee = async (payload) => {
  const normalizedPayload = normalizeEmployeePayload(payload);

  if (!normalizedPayload.departmentId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Department is required when creating an employee');
  }

  if (!isUuid(normalizedPayload.departmentId)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid department id');
  }

  const existingUser = await authRepository.findUserByEmail(normalizedPayload.email);

  const role = (normalizedPayload.role || 'EMPLOYEE').toUpperCase();
  if (!USER_ROLES.includes(role)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid user role for employee account');
  }

  if (existingUser) {
    if (existingUser.employee) {
      throw new ApiError(StatusCodes.CONFLICT, AUTH_MESSAGES.EMAIL_ALREADY_REGISTERED);
    }

    const temporaryPassword = generateTemporaryPassword();
    const hashedPassword = await bcrypt.hash(temporaryPassword, SALT_ROUNDS);
    const activationToken = crypto.randomBytes(24).toString('hex');

    const employee = await employeeRepository.createEmployeeForExistingUser({
      employeeData: {
        ...normalizedPayload,
      },
      userId: existingUser.id,
      userData: {
        firstName: normalizedPayload.firstName,
        lastName: normalizedPayload.lastName,
        role,
        password: hashedPassword,
        isActive: false,
        activationToken,
      },
    });

    const activationLink = `${apiBaseUrl.replace(/\/$/, '')}/api/auth/activate?token=${activationToken}`;

    try {
      await emailService.sendAccountActivationEmail(employee.user, activationLink, temporaryPassword);
      logger.info('[EMPLOYEE] Activation email resent for employee linked to existing user', {
        employeeId: employee.id,
        userId: employee.user?.id,
        email: employee.user?.email,
      });
    } catch (err) {
      logger.error('[EMPLOYEE] Failed to send activation email for employee linked to existing user', err);
    }

    return employee;
  }

  const temporaryPassword = generateTemporaryPassword();
  const hashedPassword = await bcrypt.hash(temporaryPassword, SALT_ROUNDS);
  const activationToken = crypto.randomBytes(24).toString('hex');

  const employee = await employeeRepository.createEmployeeWithUser({
    employeeData: {
      ...normalizedPayload,
    },
    userData: {
      email: normalizedPayload.email,
      password: hashedPassword,
      firstName: normalizedPayload.firstName,
      lastName: normalizedPayload.lastName,
      role,
      activationToken,
    },
  });

  const activationLink = `${apiBaseUrl.replace(/\/$/, '')}/api/auth/activate?token=${activationToken}`;
  try {
    await emailService.sendAccountActivationEmail(employee.user, activationLink, temporaryPassword);
    logger.info('[EMPLOYEE] Activation email sent for newly created employee', {
      employeeId: employee.id,
      userId: employee.user?.id,
      email: employee.user?.email,
    });
  } catch (err) {
    // Keep employee creation successful even if email provider fails.
    logger.error('[EMPLOYEE] Failed to send activation email for newly created employee', err);
  }

  return employee;
};

const assertEmployeeReadableByActor = (actor, employee) => {
  if (!actor) throw new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized');
  if (actor.role === 'SUPER_ADMIN' || actor.role === 'HR_ADMIN') return;

  if (actor.role === 'MANAGER') {
    // Manager can view self and direct reports.
    if (employee.id === actor.employeeId || employee.managerId === actor.employeeId) return;
    throw new ApiError(StatusCodes.FORBIDDEN, 'Forbidden: outside your team scope');
  }

  // Employee can only view self.
  if (employee.id !== actor.employeeId) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Forbidden: self scope only');
  }
};

const listEmployees = async (actor) => {
  if (!actor) throw new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized');

  if (actor.role === 'SUPER_ADMIN' || actor.role === 'HR_ADMIN') {
    return employeeRepository.getEmployees();
  }

  if (actor.role === 'MANAGER') {
    if (!actor.employeeId) return [];
    const [self, subordinates] = await Promise.all([
      employeeRepository.getEmployeeById(actor.employeeId),
      employeeRepository.getSubordinates(actor.employeeId),
    ]);

    const rows = subordinates.slice();
    if (self) rows.unshift(self);
    return rows;
  }

  if (!actor.employeeId) return [];
  const self = await employeeRepository.getEmployeeById(actor.employeeId);
  return self ? [self] : [];
};

const getEmployee = async (id, actor) => {
  if (!isUuid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid employee id');
  }

  const employee = await employeeRepository.getEmployeeById(id);
  if (!employee) {
    throw new ApiError(StatusCodes.NOT_FOUND, EMPLOYEE_MESSAGES.NOT_FOUND);
  }

  assertEmployeeReadableByActor(actor, employee);

  return employee;
};

const updateEmployee = async (id, payload, actor) => {
  await getEmployee(id, actor);
  const normalizedPayload = normalizeEmployeePayload(payload);
  const updated = await employeeRepository.updateEmployee(id, normalizedPayload);
  return updated;
};

const deleteEmployee = async (id, actor) => {
  await getEmployee(id, actor);
  await employeeRepository.deleteEmployee(id);
  return true;
};

const changeEmployeeLifecycle = async (id, action, actor) => {
  const employee = await getEmployee(id, actor);

  const normalizedAction = String(action || '').toUpperCase();
  if (!['BLOCK', 'DELETE'].includes(normalizedAction)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid lifecycle action');
  }

  if (normalizedAction === 'BLOCK') {
    const blocked = await employeeRepository.updateEmployeeLifecycle({
      id: employee.id,
      employeePatch: {
        status: 'INACTIVE',
      },
      userPatch: {
        isActive: false,
      },
    });
    return blocked;
  }

  const deleted = await employeeRepository.updateEmployeeLifecycle({
    id: employee.id,
    employeePatch: {
      status: 'TERMINATED',
      deletedAt: new Date(),
    },
    userPatch: {
      isActive: false,
    },
  });

  return deleted;
};

module.exports = {
  createEmployee,
  listEmployees,
  getEmployee,
  updateEmployee,
  deleteEmployee,
  changeEmployeeLifecycle,
};

