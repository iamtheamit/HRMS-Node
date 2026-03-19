const salaryService = require('./salary.service');
const salaryRepository = require('../repositories/salary.repository');
const ApiError = require('../utils/apiError');
const StatusCodes = require('../constants/statusCodes');
const { PAYROLL_MESSAGES } = require('../constants/messages');

const round = (value) => Math.round(Number(value || 0) * 100) / 100;

const computeBreakdown = (record) => {
  const grossPay =
    Number(record.basic || 0)
    + Number(record.hra || 0)
    + Number(record.allowances || 0)
    + Number(record.bonus || 0)
    + Number(record.otherEarnings || 0);

  const pfEmployee = Number(record.basic || 0) * (Number(record.pfEmployeeRate || 0) / 100);
  const esi = grossPay * (Number(record.esiRate || 0) / 100);
  const tds = grossPay * (Number(record.tdsRate || 0) / 100);
  const totalDeductions = pfEmployee + esi + tds + Number(record.otherDeductions || 0);

  return {
    grossPay: round(grossPay),
    totalDeductions: round(totalDeductions),
    netPay: round(grossPay - totalDeductions),
  };
};

const mapPayrollStatus = (status) => {
  if (status === 'PROCESSED') return 'Processed';
  if (status === 'PAID') return 'Paid';
  return 'Draft';
};

const toPayrollRecord = (record) => {
  const breakdown = computeBreakdown(record);
  return {
    payrollId: record.id,
    employeeId: record.employeeId,
    employeeName: `${record.employee?.firstName || ''} ${record.employee?.lastName || ''}`.trim(),
    employeeCode: `EMP-${record.employeeId.replace(/-/g, '').slice(0, 6).toUpperCase()}`,
    department: record.employee?.department?.name || 'No Department',
    month: record.month,
    year: record.year,
    grossPay: breakdown.grossPay,
    totalDeductions: breakdown.totalDeductions,
    netPay: breakdown.netPay,
    status: mapPayrollStatus(record.status),
    processedAt: record.processedAt,
  };
};

const listPayrollRecords = async (filters = {}, actor) => {
  const salaryRows = await salaryService.listSalaryRecords(filters, actor);
  return salaryRows.map(toPayrollRecord);
};

const processPayroll = async (id, actor) => {
  const updated = await salaryService.updateSalaryRecord(
    id,
    { status: 'PROCESSED', processedAt: new Date() },
    actor,
  );

  return toPayrollRecord(updated);
};

const markPayrollPaid = async (id, actor) => {
  const updated = await salaryService.updateSalaryRecord(
    id,
    { status: 'PAID', processedAt: updatedAtOrNow() },
    actor,
  );

  return toPayrollRecord(updated);
};

const updatedAtOrNow = () => new Date();

const processAllDrafts = async (filters = {}, actor) => {
  const rows = await salaryService.listSalaryRecords(filters, actor);
  const drafts = rows.filter((row) => row.status === 'DRAFT');

  const processed = await Promise.all(
    drafts.map((row) => salaryRepository.updateSalaryRecord(row.id, {
      status: 'PROCESSED',
      processedAt: new Date(),
    })),
  );

  return processed.map(toPayrollRecord);
};

const getPayrollRecordById = async (id, actor) => {
  const rows = await listPayrollRecords({}, actor);
  const row = rows.find((entry) => entry.payrollId === id);

  if (!row) {
    throw new ApiError(StatusCodes.NOT_FOUND, PAYROLL_MESSAGES.NOT_FOUND);
  }

  return row;
};

module.exports = {
  listPayrollRecords,
  processPayroll,
  processAllDrafts,
  markPayrollPaid,
  getPayrollRecordById,
};