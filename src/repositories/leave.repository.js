// leave.repository.js
// This repository encapsulates data-access operations related to leave requests.
// It is responsible for interacting with Prisma to manage LeaveRequest records in the database.

const prisma = require('../config/prisma');
const uuidv7 = require('../utils/uuidv7-official');

const createLeaveRequest = (data) => {
  const payload = data && data.id ? data : { id: uuidv7(), ...data };
  return prisma.leaveRequest.create({
    data: payload,
    include: {
      employee: true,
      approver: true,
    },
  });
};

const getLeaveRequestById = (id) => {
  return prisma.leaveRequest.findUnique({
    where: { id },
    include: {
      employee: true,
      approver: true,
    },
  });
};

const updateLeaveRequest = (id, data) => {
  return prisma.leaveRequest.update({
    where: { id },
    data,
    include: {
      employee: true,
      approver: true,
    },
  });
};

const listLeaveRequests = (filters = {}) => {
  return prisma.leaveRequest.findMany({
    where: filters,
    include: {
      employee: true,
      approver: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

module.exports = {
  createLeaveRequest,
  getLeaveRequestById,
  updateLeaveRequest,
  listLeaveRequests,
};

