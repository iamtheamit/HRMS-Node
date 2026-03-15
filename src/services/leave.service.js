// leave.service.js
// This service implements business logic for employee leave management.
// It is responsible for creating leave requests, changing their status, and delegating persistence to the leave repository.

const leaveRepository = require('../repositories/leave.repository');
const employeeRepository = require('../repositories/employee.repository');
const prisma = require('../config/prisma');
const ApiError = require('../utils/apiError');
const StatusCodes = require('../constants/statusCodes');
const { LEAVE_MESSAGES } = require('../constants/messages');
const emailService = require('./email/email.service');

const REVIEWABLE_STATUSES = new Set(['PENDING', 'MANAGER_PENDING', 'HR_PENDING']);

const formatDate = (value) => {
  if (!value) return '';
  return new Date(value).toISOString().slice(0, 10);
};

const getEmployeeName = (employee) => {
  if (!employee) return 'Employee';
  const fullName = `${employee.firstName || ''} ${employee.lastName || ''}`.trim();
  return fullName || employee.email || 'Employee';
};

const getHrApprovers = async () => {
  const users = await prisma.user.findMany({
    where: {
      role: { in: ['HR_ADMIN', 'SUPER_ADMIN'] },
      isActive: true,
    },
    select: {
      email: true,
    },
  });

  return [...new Set(users.map((user) => user.email).filter(Boolean))];
};

const getReviewStage = (request) => {
  const hasManager = Boolean(request.employee?.managerId);

  if (!hasManager) {
    return 'HR';
  }

  if (request.status === 'HR_PENDING') {
    return 'HR';
  }

  return 'MANAGER';
};

const assertCanReviewStage = (actor, request, stage) => {
  if (!actor) throw new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized');

  if (stage === 'MANAGER') {
    if (actor.role !== 'MANAGER') {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Forbidden: manager approval required at this stage');
    }

    if (!actor.employeeId || request.employee?.managerId !== actor.employeeId) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Forbidden: outside your team scope');
    }

    return;
  }

  if (!['HR_ADMIN', 'SUPER_ADMIN'].includes(actor.role)) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Forbidden: HR approval required at this stage');
  }
};

const createLeaveRequest = async (payload) => {
  if (!payload?.employeeId) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Forbidden: employee profile missing');
  }

  const employee = await employeeRepository.getEmployeeById(payload.employeeId);
  if (!employee) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Employee not found');
  }

  const initialStatus = employee.managerId ? 'MANAGER_PENDING' : 'HR_PENDING';

  const request = await leaveRepository.createLeaveRequest({
    ...payload,
    status: initialStatus,
  });

  const employeeName = getEmployeeName(employee);
  const startDate = formatDate(request.startDate);
  const endDate = formatDate(request.endDate);

  if (employee.manager?.email) {
    emailService.sendLeaveAppliedEmail({
      to: employee.manager.email,
      employeeName,
      startDate,
      endDate,
      type: request.type,
      reason: request.reason,
    });
  }

  const hrApprovers = await getHrApprovers();
  hrApprovers.forEach((email) => {
    emailService.sendLeaveAppliedEmail({
      to: email,
      employeeName,
      startDate,
      endDate,
      type: request.type,
      reason: request.reason,
    });
  });

  return request;
};

const listLeaveRequests = async (filters = {}, actor) => {
  if (!actor) throw new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized');

  const scopedFilters = { ...filters };

  if (actor.role === 'SUPER_ADMIN' || actor.role === 'HR_ADMIN') {
    const requests = await leaveRepository.listLeaveRequests(scopedFilters);
    return requests;
  }

  if (!actor.employeeId) {
    return [];
  }

  if (actor.role === 'MANAGER') {
    const subordinates = await employeeRepository.getSubordinates(actor.employeeId);
    const allowedIds = [actor.employeeId, ...subordinates.map((employee) => employee.id)];

    if (scopedFilters.employeeId && !allowedIds.includes(scopedFilters.employeeId)) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Forbidden: outside your team scope');
    }

    scopedFilters.employeeId = scopedFilters.employeeId
      ? scopedFilters.employeeId
      : { in: allowedIds };

    const requests = await leaveRepository.listLeaveRequests(scopedFilters);
    return requests;
  }

  if (scopedFilters.employeeId && scopedFilters.employeeId !== actor.employeeId) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Forbidden: self scope only');
  }

  scopedFilters.employeeId = actor.employeeId;

  const requests = await leaveRepository.listLeaveRequests(scopedFilters);
  return requests;
};

const approveLeaveRequest = async (id, approverId, actor) => {
  const existing = await leaveRepository.getLeaveRequestById(id);
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, LEAVE_MESSAGES.NOT_FOUND);
  }

  if (!REVIEWABLE_STATUSES.has(existing.status)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, LEAVE_MESSAGES.ONLY_PENDING_MUTABLE);
  }

  const stage = getReviewStage(existing);
  assertCanReviewStage(actor, existing, stage);

  if (!approverId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Approver profile missing');
  }

  if (stage === 'MANAGER') {
    const updated = await leaveRepository.updateLeaveRequest(id, {
      status: 'HR_PENDING',
      approverId,
    });

    const hrApprovers = await getHrApprovers();
    const employeeName = getEmployeeName(existing.employee);
    const startDate = formatDate(existing.startDate);
    const endDate = formatDate(existing.endDate);

    hrApprovers.forEach((email) => {
      emailService.sendLeaveEscalatedToHrEmail({
        to: email,
        employeeName,
        startDate,
        endDate,
        type: existing.type,
      });
    });

    return updated;
  }

  const updated = await leaveRepository.updateLeaveRequest(id, {
    status: 'APPROVED',
    approverId,
  });

  if (existing.employee?.email) {
    emailService.sendLeaveApprovedEmail({
      to: existing.employee.email,
      employeeName: getEmployeeName(existing.employee),
      startDate: formatDate(existing.startDate),
      endDate: formatDate(existing.endDate),
      type: existing.type,
    });
  }

  return updated;
};

const rejectLeaveRequest = async (id, approverId, actor) => {
  const existing = await leaveRepository.getLeaveRequestById(id);
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, LEAVE_MESSAGES.NOT_FOUND);
  }

  if (!REVIEWABLE_STATUSES.has(existing.status)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, LEAVE_MESSAGES.ONLY_PENDING_MUTABLE);
  }

  const stage = getReviewStage(existing);
  assertCanReviewStage(actor, existing, stage);

  if (!approverId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Approver profile missing');
  }

  const updated = await leaveRepository.updateLeaveRequest(id, {
    status: 'REJECTED',
    approverId,
  });

  if (existing.employee?.email) {
    emailService.sendLeaveRejectedEmail({
      to: existing.employee.email,
      employeeName: getEmployeeName(existing.employee),
      startDate: formatDate(existing.startDate),
      endDate: formatDate(existing.endDate),
      type: existing.type,
    });
  }

  return updated;
};

module.exports = {
  createLeaveRequest,
  listLeaveRequests,
  approveLeaveRequest,
  rejectLeaveRequest,
};

