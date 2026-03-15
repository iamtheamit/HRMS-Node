// employee.repository.js
// This repository encapsulates all data-access operations related to employees and departments.
// It is responsible for interacting with Prisma to manage Employee and Department records in the database.

const prisma = require('../config/prisma');
const uuidv7 = require('../utils/uuidv7-official');

const createEmployee = (data) => {
  const payload = data && data.id ? data : { id: uuidv7(), ...data };
  return prisma.employee.create({
    data: payload,
    include: {
      department: true,
      user: true,
    },
  });
};

const getEmployees = () => {
  return prisma.employee.findMany({
    include: {
      department: true,
      user: true,
    },
  });
};

const getEmployeeById = (id) => {
  return prisma.employee.findUnique({
    where: { id },
    include: {
      department: true,
      user: true,
    },
  });
};

const updateEmployee = (id, data) => {
  return prisma.employee.update({
    where: { id },
    data,
    include: {
      department: true,
      user: true,
    },
  });
};

const deleteEmployee = (id) => {
  return prisma.employee.delete({
    where: { id },
  });
};

module.exports = {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
};

