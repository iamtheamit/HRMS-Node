const prisma = require('../config/prisma');
const ApiError = require('../utils/apiError');
const StatusCodes = require('../constants/statusCodes');

const PENDING_STATUSES = ['PENDING', 'MANAGER_PENDING', 'HR_PENDING'];

const assertDashboardAccess = (actor) => {
  if (!actor) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized');
  }

  if (!['SUPER_ADMIN', 'MANAGER'].includes(actor.role)) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Forbidden: dashboard access denied');
  }
};

const getDayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

const getOverview = async (actor) => {
  assertDashboardAccess(actor);

  const { start, end } = getDayRange();

  if (actor.role === 'SUPER_ADMIN') {
    const [totalEmployees, activeEmployees, managers, pendingLeaves, todaysAttendance] = await Promise.all([
      prisma.employee.count(),
      prisma.employee.count({ where: { status: 'ACTIVE' } }),
      prisma.user.count({ where: { role: 'MANAGER' } }),
      prisma.leaveRequest.count({ where: { status: { in: PENDING_STATUSES } } }),
      prisma.attendance.findMany({
        where: {
          date: {
            gte: start,
            lte: end,
          },
        },
        select: {
          checkIn: true,
          checkOut: true,
        },
      }),
    ]);

    return {
      scope: 'GLOBAL',
      summary: {
        totalEmployees,
        activeEmployees,
        managers,
        pendingLeaves,
        todayCheckedIn: todaysAttendance.filter((row) => row.checkIn).length,
        todayCheckedOut: todaysAttendance.filter((row) => row.checkOut).length,
      },
    };
  }

  if (!actor.employeeId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Manager is not linked to employee profile');
  }

  const team = await prisma.employee.findMany({
    where: {
      managerId: actor.employeeId,
    },
    select: {
      id: true,
      status: true,
    },
  });

  const teamIds = team.map((member) => member.id);

  if (teamIds.length === 0) {
    return {
      scope: 'TEAM',
      summary: {
        teamSize: 0,
        activeTeamMembers: 0,
        pendingApprovals: 0,
        todayCheckedIn: 0,
        todayCheckedOut: 0,
      },
      pendingLeaveRequests: [],
    };
  }

  const [pendingApprovals, todaysAttendance, pendingLeaveRequests] = await Promise.all([
    prisma.leaveRequest.count({
      where: {
        employeeId: {
          in: teamIds,
        },
        status: { in: ['PENDING', 'MANAGER_PENDING'] },
      },
    }),
    prisma.attendance.findMany({
      where: {
        employeeId: {
          in: teamIds,
        },
        date: {
          gte: start,
          lte: end,
        },
      },
      select: {
        checkIn: true,
        checkOut: true,
      },
    }),
    prisma.leaveRequest.findMany({
      where: {
        employeeId: {
          in: teamIds,
        },
        status: { in: ['PENDING', 'MANAGER_PENDING'] },
      },
      include: {
        employee: {
          include: {
            department: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 6,
    }),
  ]);

  return {
    scope: 'TEAM',
    summary: {
      teamSize: teamIds.length,
      activeTeamMembers: team.filter((member) => member.status === 'ACTIVE').length,
      pendingApprovals,
      todayCheckedIn: todaysAttendance.filter((row) => row.checkIn).length,
      todayCheckedOut: todaysAttendance.filter((row) => row.checkOut).length,
    },
    pendingLeaveRequests: pendingLeaveRequests.map((request) => ({
      id: request.id,
      employeeName: `${request.employee.firstName} ${request.employee.lastName}`.trim(),
      department: request.employee.department ? request.employee.department.name : 'Unassigned',
      type: request.type,
      startDate: request.startDate,
      endDate: request.endDate,
      status: request.status,
    })),
  };
};

module.exports = {
  getOverview,
};
