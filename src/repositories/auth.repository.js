// auth.repository.js
// This repository provides data-access operations related to authentication and users.
// It is responsible for interacting with the Prisma client to manage User records in the database.

const prisma = require('../config/prisma');

const findUserByEmail = (email) => {
  return prisma.user.findUnique({
    where: { email },
    include: {
      employee: true,
    },
  });
};

const findUserById = (id) => {
  return prisma.user.findUnique({
    where: { id },
    include: {
      employee: true,
    },
  });
};

const createUser = (data) => {
  return prisma.user.create({
    data,
  });
};

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
};

