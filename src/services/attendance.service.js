// attendance.service.js
// This service implements business logic for attendance tracking such as check-in, check-out, and listing records.
// It is responsible for enforcing daily attendance rules and delegating persistence to the attendance repository.

const attendanceRepository = require('../repositories/attendance.repository');
const ApiError = require('../utils/apiError');
const StatusCodes = require('../constants/statusCodes');
const { ATTENDANCE_MESSAGES } = require('../constants/messages');

const getDayRange = (date = new Date()) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

const checkIn = async (employeeId) => {
  const { start, end } = getDayRange();

  const existing = await attendanceRepository.findAttendanceByEmployeeAndDate(
    employeeId,
    start,
    end,
  );

  if (existing && existing.checkIn) {
    throw new ApiError(StatusCodes.BAD_REQUEST, ATTENDANCE_MESSAGES.ALREADY_CHECKED_IN);
  }

  if (existing) {
    return attendanceRepository.updateAttendance(existing.id, {
      checkIn: new Date(),
    });
  }

  const record = await attendanceRepository.createAttendance({
    employeeId,
    date: new Date(),
    checkIn: new Date(),
  });

  return record;
};

const checkOut = async (employeeId) => {
  const { start, end } = getDayRange();

  const existing = await attendanceRepository.findAttendanceByEmployeeAndDate(
    employeeId,
    start,
    end,
  );

  if (!existing || !existing.checkIn) {
    throw new ApiError(StatusCodes.BAD_REQUEST, ATTENDANCE_MESSAGES.NO_CHECKIN_FOUND);
  }

  if (existing.checkOut) {
    throw new ApiError(StatusCodes.BAD_REQUEST, ATTENDANCE_MESSAGES.ALREADY_CHECKED_OUT);
  }

  const updated = await attendanceRepository.updateAttendance(existing.id, {
    checkOut: new Date(),
  });

  return updated;
};

const listAttendance = async (filters = {}) => {
  const records = await attendanceRepository.listAttendance(filters);
  return records;
};

module.exports = {
  checkIn,
  checkOut,
  listAttendance,
};

