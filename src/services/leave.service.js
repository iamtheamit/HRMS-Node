// leave.service.js
// This service implements business logic for employee leave management.
// It is responsible for creating leave requests, changing their status, and delegating persistence to the leave repository.

const leaveRepository = require('../repositories/leave.repository');
const employeeRepository = require('../repositories/employee.repository');
const ApiError = require('../utils/apiError');
const StatusCodes = require('../constants/statusCodes');
const { LEAVE_MESSAGES } = require('../constants/messages');

const createLeaveRequest = async (payload) => {
  if (!payload?.employeeId) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Forbidden: employee profile missing');
  }

  const request = await leaveRepository.createLeaveRequest(payload);
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

const assertCanReviewLeaveRequest = (actor, request) => {
  if (!actor) throw new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized');

  if (actor.role === 'SUPER_ADMIN' || actor.role === 'HR_ADMIN') {
    return;
  }

  if (actor.role !== 'MANAGER') {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Forbidden: only approvers can review leave');
  }

  if (!actor.employeeId) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Forbidden: approver profile missing');
  }

  if (request.employee && request.employee.managerId === actor.employeeId) {
    return;
  }

  throw new ApiError(StatusCodes.FORBIDDEN, 'Forbidden: outside your team scope');
};

const approveLeaveRequest = async (id, approverId, actor) => {
  const existing = await leaveRepository.getLeaveRequestById(id);
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, LEAVE_MESSAGES.NOT_FOUND);
  }

  assertCanReviewLeaveRequest(actor, existing);

  if (existing.status !== 'PENDING') {
    throw new ApiError(StatusCodes.BAD_REQUEST, LEAVE_MESSAGES.ONLY_PENDING_MUTABLE);
  }

  const updated = await leaveRepository.updateLeaveRequest(id, {
    status: 'APPROVED',
    approverId,
  });

  return updated;
};

const rejectLeaveRequest = async (id, approverId, actor) => {
  const existing = await leaveRepository.getLeaveRequestById(id);
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, LEAVE_MESSAGES.NOT_FOUND);
  }

  assertCanReviewLeaveRequest(actor, existing);

  if (existing.status !== 'PENDING') {
    throw new ApiError(StatusCodes.BAD_REQUEST, LEAVE_MESSAGES.ONLY_PENDING_MUTABLE);
  }

  const updated = await leaveRepository.updateLeaveRequest(id, {
    status: 'REJECTED',
    approverId,
  });

  return updated;
};

module.exports = {
  createLeaveRequest,
  listLeaveRequests,
  approveLeaveRequest,
  rejectLeaveRequest,
};

