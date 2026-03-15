const prisma = require('../config/prisma');
const { v4: uuidv4 } = require('uuid');

const createSession = (data) => {
  const payload = data && data.id ? data : { id: uuidv4(), ...data };
  return prisma.userSession.create({ data: payload });
};

const findById = (id) => {
  return prisma.userSession.findUnique({ where: { id } });
};

const deleteById = (id) => {
  return prisma.userSession.deleteMany({ where: { id } });
};

const deleteByUserId = (userId) => {
  return prisma.userSession.deleteMany({ where: { userId } });
};

const updateRefreshToken = (id, hashedToken, expiresAt) => {
  return prisma.userSession.update({ where: { id }, data: { refreshToken: hashedToken, expiresAt } });
};

module.exports = {
  createSession,
  findById,
  deleteById,
  deleteByUserId,
  updateRefreshToken,
};
