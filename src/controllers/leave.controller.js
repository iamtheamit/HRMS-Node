// leave.controller.js
// This controller handles HTTP requests for employee leave management.
// It is responsible for receiving leave-related requests, delegating to the leave service, and returning standardized API responses.

const leaveService = require('../services/leave.service');
const { sendSuccess } = require('../utils/apiResponse');
const StatusCodes = require('../constants/statusCodes');
const { LEAVE_MESSAGES } = require('../constants/messages');
const { CreateLeaveDTO, LeaveFilterDTO } = require('../dtos/leave.dto');

const createLeaveRequest = async (req, res, next) => {
  try {
    const employeeId = req.user.employeeId;
    const dto = new CreateLeaveDTO(req.body);

    const request = await leaveService.createLeaveRequest({
      ...dto,
      employeeId,
    });

    return sendSuccess(res, LEAVE_MESSAGES.CREATE_SUCCESS, request, StatusCodes.CREATED);
  } catch (err) {
    return next(err);
  }
};

const listLeaveRequests = async (req, res, next) => {
  try {
    const filterDto = new LeaveFilterDTO(req.query);
    const requests = await leaveService.listLeaveRequests(filterDto);
    return sendSuccess(res, LEAVE_MESSAGES.FETCH_ALL_SUCCESS, requests, StatusCodes.OK);
  } catch (err) {
    return next(err);
  }
};

const approveLeaveRequest = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const approverId = req.user.employeeId;
    const updated = await leaveService.approveLeaveRequest(id, approverId);
    return sendSuccess(res, LEAVE_MESSAGES.APPROVE_SUCCESS, updated, StatusCodes.OK);
  } catch (err) {
    return next(err);
  }
};

const rejectLeaveRequest = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const approverId = req.user.employeeId;
    const updated = await leaveService.rejectLeaveRequest(id, approverId);
    return sendSuccess(res, LEAVE_MESSAGES.REJECT_SUCCESS, updated, StatusCodes.OK);
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  createLeaveRequest,
  listLeaveRequests,
  approveLeaveRequest,
  rejectLeaveRequest,
};

