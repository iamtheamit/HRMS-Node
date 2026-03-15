const prisma = require('../config/prisma');
const uuidv7 = require('../utils/uuidv7-official');

const listDepartments = () => {
  return prisma.department.findMany({
    include: {
      headEmployee: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      _count: {
        select: {
          employees: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });
};

const getDepartmentById = (id) => {
  return prisma.department.findUnique({
    where: { id },
    include: {
      headEmployee: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      _count: {
        select: {
          employees: true,
        },
      },
    },
  });
};

const findByName = (name) => {
  return prisma.department.findUnique({
    where: { name },
  });
};

const createDepartment = (data) => {
  return prisma.department.create({
    data: {
      id: data.id || uuidv7(),
      name: data.name,
      description: data.description || null,
    },
    include: {
      headEmployee: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      _count: {
        select: {
          employees: true,
        },
      },
    },
  });
};

const updateDepartment = (id, data) => {
  return prisma.department.update({
    where: { id },
    data,
    include: {
      headEmployee: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      _count: {
        select: {
          employees: true,
        },
      },
    },
  });
};

module.exports = {
  listDepartments,
  getDepartmentById,
  findByName,
  createDepartment,
  updateDepartment,
};
