const prisma = require('../config/prisma');
const uuidv7 = require('../utils/uuidv7-official');

const taskInclude = {
  assignedTo: {
    include: {
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
    },
  },
  createdBy: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
    },
  },
};

const createTask = (data) => {
  const payload = data && data.id ? data : { id: uuidv7(), ...data };

  return prisma.task.create({
    data: payload,
    include: taskInclude,
  });
};

const getTaskById = (id) => {
  return prisma.task.findUnique({
    where: { id },
    include: taskInclude,
  });
};

const listTasks = (filters = {}) => {
  return prisma.task.findMany({
    where: filters,
    include: taskInclude,
    orderBy: [
      { dueDate: 'asc' },
      { createdAt: 'desc' },
    ],
  });
};

const updateTask = (id, data) => {
  return prisma.task.update({
    where: { id },
    data,
    include: taskInclude,
  });
};

module.exports = {
  createTask,
  getTaskById,
  listTasks,
  updateTask,
};