// attendance.repository.js
// This repository encapsulates data-access operations related to attendance.
// It is responsible for interacting with Prisma to manage Attendance records in the database.

const prisma = require('../config/prisma');
const uuidv7 = require('../utils/uuidv7');

const createAttendance = (data) => {
  const payload = data && data.id ? data : { id: uuidv7(), ...data };
  return prisma.attendance.create({
    data: payload,
    include: {
      employee: true,
    },
  });
};

const updateAttendance = (id, data) => {
  return prisma.attendance.update({
    where: { id },
    data,
    include: {
      employee: true,
    },
  });
};

const findAttendanceById = (id) => {
  return prisma.attendance.findUnique({
    where: { id },
    include: {
      employee: true,
    },
  });
};

const findAttendanceByEmployeeAndDate = (employeeId, startDate, endDate) => {
  return prisma.attendance.findFirst({
    where: {
      employeeId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      employee: true,
    },
  });
};

const listAttendance = (filters = {}) => {
  return prisma.attendance.findMany({
    where: filters,
    include: {
      employee: true,
    },
    orderBy: {
      date: 'desc',
    },
  });
};

module.exports = {
  createAttendance,
  updateAttendance,
  findAttendanceById,
  findAttendanceByEmployeeAndDate,
  listAttendance,
};

