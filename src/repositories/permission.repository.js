const prisma = require('../config/prisma');
const { v4: uuidv4 } = require('uuid');

const findByName = (name) => {
  return prisma.permission.findUnique({ where: { name } });
};

const createPermission = (data) => {
  const payload = data && data.id ? data : { id: uuidv4(), ...data };
  return prisma.permission.create({ data: payload });
};

const assignToUser = (userId, permissionId) => {
  return prisma.userPermission.create({ data: { id: uuidv4(), userId, permissionId } });
};

const userHasPermission = async (userId, permissionId) => {
  const record = await prisma.userPermission.findFirst({ where: { userId, permissionId } });
  return !!record;
};

const listPermissions = () => {
  return prisma.permission.findMany();
};

module.exports = {
  findByName,
  createPermission,
  assignToUser,
  userHasPermission,
  listPermissions,
};
