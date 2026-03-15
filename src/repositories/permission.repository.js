const prisma = require('../config/prisma');
const findByName = (name) => {
  return prisma.permission.findUnique({ where: { name } });
};

const uuidv7 = require('../utils/uuidv7-official');

const createPermission = (data) => {
  const payload = data && data.id ? data : { id: uuidv7(), ...data };
  return prisma.permission.create({ data: payload });
};

const assignToUser = (userId, permissionId) => {
  return prisma.userPermission.create({ data: { id: uuidv7(), userId, permissionId } });
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
