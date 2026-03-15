// auth.repository.js
// This repository provides data-access operations related to authentication and users.
// It is responsible for interacting with the Prisma client to manage User records in the database.

const prisma = require('../config/prisma');
// uuid v7 is provided via ESM export; import dynamically when generating IDs

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

const uuidv7 = require('../utils/uuidv7-official');

const createUser = (data) => {
  const payload = data && data.id ? data : { id: uuidv7(), ...data };
  return prisma.user.create({
    data: payload,
  });
};

const findUserByActivationToken = (token) => {
  return prisma.user.findFirst({ where: { activationToken: token } });
};

const findUserByResetToken = (token) => {
  return prisma.user.findFirst({ where: { resetToken: token } });
};

const updateUser = (id, data) => {
  return prisma.user.update({ where: { id }, data });
};

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  findUserByActivationToken,
  findUserByResetToken,
  updateUser,
};

