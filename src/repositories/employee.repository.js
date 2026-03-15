// employee.repository.js
// This repository encapsulates all data-access operations related to employees and departments.
// It is responsible for interacting with Prisma to manage Employee and Department records in the database.

const prisma = require('../config/prisma');
const uuidv7 = require('../utils/uuidv7-official');

const employeeInclude = {
  department: true,
  user: true,
  manager: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    },
  },
};

const createEmployee = (data) => {
  const payload = data && data.id ? data : { id: uuidv7(), ...data };
  return prisma.employee.create({
    data: payload,
    include: employeeInclude,
  });
};

const createEmployeeWithUser = ({ employeeData, userData }) => {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        id: userData.id || uuidv7(),
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        isActive: false,
        activationToken: userData.activationToken,
      },
    });

    const employee = await tx.employee.create({
      data: {
        id: employeeData.id || uuidv7(),
        firstName: employeeData.firstName,
        lastName: employeeData.lastName,
        email: employeeData.email,
        phone: employeeData.phone,
        countryCode: employeeData.countryCode,
        mobileNumber: employeeData.mobileNumber,
        profileUrl: employeeData.profileUrl,
        documents: employeeData.documents,
        departmentId: employeeData.departmentId,
        managerId: employeeData.managerId,
        status: employeeData.status,
        userId: user.id,
      },
      include: employeeInclude,
    });

    return employee;
  });
};

const createEmployeeForExistingUser = ({ employeeData, userId, userData }) => {
  return prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
      },
    });

    const employee = await tx.employee.create({
      data: {
        id: employeeData.id || uuidv7(),
        firstName: employeeData.firstName,
        lastName: employeeData.lastName,
        email: employeeData.email,
        phone: employeeData.phone,
        countryCode: employeeData.countryCode,
        mobileNumber: employeeData.mobileNumber,
        profileUrl: employeeData.profileUrl,
        documents: employeeData.documents,
        departmentId: employeeData.departmentId,
        managerId: employeeData.managerId,
        status: employeeData.status,
        userId,
      },
      include: employeeInclude,
    });

    return employee;
  });
};

const getEmployees = () => {
  return prisma.employee.findMany({
    where: {
      deletedAt: null,
    },
    include: employeeInclude,
  });
};

const getSubordinates = (managerId) => {
  return prisma.employee.findMany({
    where: {
      managerId,
      deletedAt: null,
    },
    include: employeeInclude,
  });
};

const getEmployeeById = (id) => {
  return prisma.employee.findFirst({
    where: {
      id,
      deletedAt: null,
    },
    include: employeeInclude,
  });
};

const updateEmployee = (id, data) => {
  return prisma.employee.update({
    where: { id },
    data,
    include: employeeInclude,
  });
};

const deleteEmployee = (id) => {
  return prisma.employee.delete({
    where: { id },
  });
};

const updateEmployeeLifecycle = ({ id, employeePatch, userPatch }) => {
  return prisma.$transaction(async (tx) => {
    const employee = await tx.employee.update({
      where: { id },
      data: employeePatch,
      include: employeeInclude,
    });

    if (employee.userId && userPatch) {
      await tx.user.update({
        where: { id: employee.userId },
        data: userPatch,
      });
    }

    return employee;
  });
};

module.exports = {
  createEmployee,
  createEmployeeWithUser,
  createEmployeeForExistingUser,
  getEmployees,
  getSubordinates,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  updateEmployeeLifecycle,
};

