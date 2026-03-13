// attendance.controller.js
// This controller handles HTTP requests related to employee attendance such as check-in, check-out, and listing attendance.
// It is responsible for converting HTTP input into DTOs, delegating to the attendance service, and returning standardized API responses.

const attendanceService = require('../services/attendance.service');
const { sendSuccess } = require('../utils/apiResponse');
const StatusCodes = require('../constants/statusCodes');
const { ATTENDANCE_MESSAGES } = require('../constants/messages');
const { AttendanceFilterDTO } = require('../dtos/attendance.dto');

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

const listAttendance = async (req, res, next) => {
  try {
    const filterDto = new AttendanceFilterDTO(req.query);
    const records = await attendanceService.listAttendance(filterDto);
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

module.exports = {
  checkIn,
  checkOut,
  listAttendance,
};

