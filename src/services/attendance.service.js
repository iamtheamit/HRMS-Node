// attendance.service.js
// This service implements business logic for attendance tracking such as check-in, check-out, and listing records.
// It is responsible for enforcing daily attendance rules and delegating persistence to the attendance repository.

const attendanceRepository = require('../repositories/attendance.repository');
const employeeRepository = require('../repositories/employee.repository');
const ApiError = require('../utils/apiError');
const StatusCodes = require('../constants/statusCodes');
const { ATTENDANCE_MESSAGES } = require('../constants/messages');

const ATTENDANCE_STATUSES = new Set(['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY']);

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

const punch = async (employeeId) => {
  if (!employeeId) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Forbidden: employee profile missing');
  }

  const { start, end } = getDayRange();
  const existing = await attendanceRepository.findAttendanceByEmployeeAndDate(employeeId, start, end);

  if (!existing || !existing.checkIn) {
    const record = await checkIn(employeeId);
    return { action: 'CHECK_IN', record };
  }

  if (!existing.checkOut) {
    const record = await checkOut(employeeId);
    return { action: 'CHECK_OUT', record };
  }

  throw new ApiError(StatusCodes.BAD_REQUEST, ATTENDANCE_MESSAGES.ALREADY_CHECKED_OUT);
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

const assertAttendanceStatus = (status) => {
  if (!ATTENDANCE_STATUSES.has(status)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid attendance status');
  }
};

const assertCanManageAttendance = async (actor, targetEmployeeId) => {
  if (!actor) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized');
  }

  if (actor.role === 'SUPER_ADMIN' || actor.role === 'HR_ADMIN') {
    return;
  }

  if (actor.role !== 'MANAGER' || !actor.employeeId) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Forbidden');
  }

  if (targetEmployeeId === actor.employeeId) {
    return;
  }

  const subordinates = await employeeRepository.getSubordinates(actor.employeeId);
  const allowedIds = subordinates.map((employee) => employee.id);

  if (!allowedIds.includes(targetEmployeeId)) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Forbidden: outside your team scope');
  }
};

const updateAttendanceStatus = async (attendanceId, status, actor) => {
  assertAttendanceStatus(status);

  const existing = await attendanceRepository.findAttendanceById(attendanceId);
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, ATTENDANCE_MESSAGES.NOT_FOUND);
  }

  await assertCanManageAttendance(actor, existing.employeeId);

  const patch = { status };
  if (status === 'ABSENT') {
    patch.checkIn = null;
    patch.checkOut = null;
  }

  return attendanceRepository.updateAttendance(attendanceId, patch);
};

const markAttendance = async (payload, actor) => {
  const { employeeId, date, status } = payload || {};

  if (!employeeId || !date) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Employee and date are required');
  }

  assertAttendanceStatus(status);

  const employee = await employeeRepository.getEmployeeById(employeeId);
  if (!employee) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Employee not found');
  }

  await assertCanManageAttendance(actor, employeeId);

  const { start, end } = getDayRange(date);
  const existing = await attendanceRepository.findAttendanceByEmployeeAndDate(employeeId, start, end);

  if (existing) {
    return updateAttendanceStatus(existing.id, status, actor);
  }

  const recordDate = new Date(start);
  const checkIn = status === 'ABSENT' ? null : new Date(start);

  return attendanceRepository.createAttendance({
    employeeId,
    date: recordDate,
    status,
    checkIn,
    checkOut: null,
  });
};

module.exports = {
  checkIn,
  checkOut,
  punch,
  listAttendance,
  updateAttendanceStatus,
  markAttendance,
};

