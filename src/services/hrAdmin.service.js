const prisma = require('../config/prisma');
const ApiError = require('../utils/apiError');
const StatusCodes = require('../constants/statusCodes');

const PENDING_STATUSES = ['PENDING', 'MANAGER_PENDING', 'HR_PENDING'];

const assertHrAdminAccess = (actor) => {
  if (!actor) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized');
  }

  if (!['HR_ADMIN', 'SUPER_ADMIN'].includes(actor.role)) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Forbidden: HR admin access required');
  }
};

const getDayRange = (date = new Date()) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

const getMonthRange = (date = new Date()) => {
  const start = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
};

const getOverview = async (actor) => {
  assertHrAdminAccess(actor);

  const { start: dayStart, end: dayEnd } = getDayRange();
  const { start: monthStart, end: monthEnd } = getMonthRange();

  const [
    totalEmployees,
    activeEmployees,
    departments,
    pendingLeaves,
    approvedLeavesThisMonth,
    todaysAttendance,
    recentPendingLeaves,
    newHiresThisMonth,
  ] = await Promise.all([
    prisma.employee.count(),
    prisma.employee.count({ where: { status: 'ACTIVE' } }),
    prisma.department.count(),
    prisma.leaveRequest.count({ where: { status: { in: PENDING_STATUSES } } }),
    prisma.leaveRequest.count({
      where: {
        status: 'APPROVED',
        updatedAt: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
    }),
    prisma.attendance.findMany({
      where: {
        date: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
      select: {
        id: true,
        checkIn: true,
        checkOut: true,
      },
    }),
    prisma.leaveRequest.findMany({
      where: { status: { in: ['PENDING', 'HR_PENDING'] } },
      include: {
        employee: {
          include: {
            department: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 6,
    }),
    prisma.employee.count({
      where: {
        hireDate: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
    }),
  ]);

  const checkedInCount = todaysAttendance.filter((row) => row.checkIn).length;
  const checkedOutCount = todaysAttendance.filter((row) => row.checkOut).length;

  return {
    summary: {
      totalEmployees,
      activeEmployees,
      departments,
      pendingLeaves,
      approvedLeavesThisMonth,
      newHiresThisMonth,
      todayCheckedIn: checkedInCount,
      todayCheckedOut: checkedOutCount,
    },
    pendingLeaveRequests: recentPendingLeaves.map((request) => ({
      id: request.id,
      employeeId: request.employeeId,
      employeeName: `${request.employee.firstName} ${request.employee.lastName}`.trim(),
      department: request.employee.department ? request.employee.department.name : 'Unassigned',
      type: request.type,
      startDate: request.startDate,
      endDate: request.endDate,
      reason: request.reason,
      createdAt: request.createdAt,
      status: request.status,
    })),
  };
};

module.exports = {
  getOverview,
};
