// attendance.controller.js
// This controller handles HTTP requests related to employee attendance such as check-in, check-out, and listing attendance.
// It is responsible for converting HTTP input into DTOs, delegating to the attendance service, and returning standardized API responses.

const attendanceService = require('../services/attendance.service');
const { sendSuccess } = require('../utils/apiResponse');
const StatusCodes = require('../constants/statusCodes');
const { ATTENDANCE_MESSAGES } = require('../constants/messages');
const {
  AttendanceFilterDTO,
  UpdateAttendanceStatusDTO,
  MarkAttendanceDTO,
} = require('../dtos/attendance.dto');

const checkIn = async (req, res, next) => {
  try {
    const employeeId = req.user.employeeId;
    const record = await attendanceService.checkIn(employeeId);
    return sendSuccess(res, ATTENDANCE_MESSAGES.CHECK_IN_SUCCESS, record, StatusCodes.CREATED);
  } catch (err) {
    return next(err);
  }
};

const checkOut = async (req, res, next) => {
  try {
    const employeeId = req.user.employeeId;
    const record = await attendanceService.checkOut(employeeId);
    return sendSuccess(res, ATTENDANCE_MESSAGES.CHECK_OUT_SUCCESS, record, StatusCodes.OK);
  } catch (err) {
    return next(err);
  }
};

const punch = async (req, res, next) => {
  try {
    const employeeId = req.user.employeeId;
    const result = await attendanceService.punch(employeeId);
    const message = result.action === 'CHECK_IN'
      ? ATTENDANCE_MESSAGES.CHECK_IN_SUCCESS
      : ATTENDANCE_MESSAGES.CHECK_OUT_SUCCESS;
    const statusCode = result.action === 'CHECK_IN' ? StatusCodes.CREATED : StatusCodes.OK;
    return sendSuccess(res, message, result, statusCode);
  } catch (err) {
    return next(err);
  }
};

const listAttendance = async (req, res, next) => {
  try {
    const filterDto = new AttendanceFilterDTO(req.query);
    const records = await attendanceService.listAttendance(filterDto, req.user);
    return sendSuccess(
      res,
      ATTENDANCE_MESSAGES.FETCH_ALL_SUCCESS,
      records,
      StatusCodes.OK,
    );
  } catch (err) {
    return next(err);
  }
};

const updateAttendanceStatus = async (req, res, next) => {
  try {
    const dto = new UpdateAttendanceStatusDTO(req.body);
    const record = await attendanceService.updateAttendanceStatus(req.params.id, dto.status, req.user);
    return sendSuccess(
      res,
      ATTENDANCE_MESSAGES.STATUS_UPDATE_SUCCESS,
      record,
      StatusCodes.OK,
    );
  } catch (err) {
    return next(err);
  }
};

const markAttendance = async (req, res, next) => {
  try {
    const dto = new MarkAttendanceDTO(req.body);
    const record = await attendanceService.markAttendance(dto, req.user);
    return sendSuccess(res, ATTENDANCE_MESSAGES.MARK_SUCCESS, record, StatusCodes.OK);
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  checkIn,
  checkOut,
  punch,
  listAttendance,
  updateAttendanceStatus,
  markAttendance,
};

