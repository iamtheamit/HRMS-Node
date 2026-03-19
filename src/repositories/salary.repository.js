const prisma = require('../config/prisma');
const uuidv7 = require('../utils/uuidv7-official');

const salaryInclude = {
  employee: {
    include: {
      department: true,
      user: true,
    },
  },
};

const listSalaryRecords = (filters = {}) => {
  return prisma.salaryRecord.findMany({
    where: filters,
    include: salaryInclude,
    orderBy: [
      { year: 'desc' },
      { month: 'desc' },
      { createdAt: 'desc' },
    ],
  });
};

const getSalaryRecordById = (id) => {
  return prisma.salaryRecord.findUnique({
    where: { id },
    include: salaryInclude,
  });
};

const createSalaryRecord = (data) => {
  const payload = data && data.id ? data : { id: uuidv7(), ...data };

  return prisma.salaryRecord.create({
    data: payload,
    include: salaryInclude,
  });
};

const updateSalaryRecord = (id, data) => {
  return prisma.salaryRecord.update({
    where: { id },
    data,
    include: salaryInclude,
  });
};

module.exports = {
  listSalaryRecords,
  getSalaryRecordById,
  createSalaryRecord,
  updateSalaryRecord,
};