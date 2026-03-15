// attendance.service.js
// This service implements business logic for attendance tracking such as check-in, check-out, and listing records.
// It is responsible for enforcing daily attendance rules and delegating persistence to the attendance repository.

const attendanceRepository = require('../repositories/attendance.repository');
const employeeRepository = require('../repositories/employee.repository');
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
  if (!employeeId) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Forbidden: employee profile missing');
  }

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
  if (!employeeId) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Forbidden: employee profile missing');
  }

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

const listAttendance = async (filters = {}, actor) => {
  if (!actor) throw new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized');

  const scopedFilters = { ...filters };

  if (actor.role === 'SUPER_ADMIN' || actor.role === 'HR_ADMIN') {
    const records = await attendanceRepository.listAttendance(scopedFilters);
    return records;
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

    const records = await attendanceRepository.listAttendance(scopedFilters);
    return records;
  }

  if (scopedFilters.employeeId && scopedFilters.employeeId !== actor.employeeId) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Forbidden: self scope only');
  }

  scopedFilters.employeeId = actor.employeeId;

  const records = await attendanceRepository.listAttendance(scopedFilters);
  return records;
};

module.exports = {
  checkIn,
  checkOut,
  listAttendance,
};

