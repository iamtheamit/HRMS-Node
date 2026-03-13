// leave.service.js
// This service implements business logic for employee leave management.
// It is responsible for creating leave requests, changing their status, and delegating persistence to the leave repository.

const leaveRepository = require('../repositories/leave.repository');
const ApiError = require('../utils/apiError');
const StatusCodes = require('../constants/statusCodes');
const { LEAVE_MESSAGES } = require('../constants/messages');

const createLeaveRequest = async (payload) => {
  const request = await leaveRepository.createLeaveRequest(payload);
  return request;
};

const listLeaveRequests = async (filters = {}) => {
  const requests = await leaveRepository.listLeaveRequests(filters);
  return requests;
};

const approveLeaveRequest = async (id, approverId) => {
  const existing = await leaveRepository.getLeaveRequestById(id);
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, LEAVE_MESSAGES.NOT_FOUND);
  }

  if (existing.status !== 'PENDING') {
    throw new ApiError(StatusCodes.BAD_REQUEST, LEAVE_MESSAGES.ONLY_PENDING_MUTABLE);
  }

  const updated = await leaveRepository.updateLeaveRequest(id, {
    status: 'APPROVED',
    approverId,
  });

  return updated;
};

const rejectLeaveRequest = async (id, approverId) => {
  const existing = await leaveRepository.getLeaveRequestById(id);
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, LEAVE_MESSAGES.NOT_FOUND);
  }

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

