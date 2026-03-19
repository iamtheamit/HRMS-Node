const salaryRepository = require('../repositories/salary.repository');
const employeeRepository = require('../repositories/employee.repository');
const ApiError = require('../utils/apiError');
const StatusCodes = require('../constants/statusCodes');
const { SALARY_MESSAGES } = require('../constants/messages');

const SALARY_STATUS = new Set(['DRAFT', 'PROCESSED', 'PAID']);
const DEFAULT_MONTH = new Date().toLocaleString('en-US', { month: 'long' });
const DEFAULT_YEAR = new Date().getFullYear();

const defaultComponentsByDepartment = (departmentName = '') => {
  const normalized = String(departmentName || '').toLowerCase();

  if (normalized.includes('engineering')) {
    return { basic: 45000, hra: 18000, allowances: 8000, bonus: 2000, otherEarnings: 1000, otherDeductions: 900 };
  }

  if (normalized.includes('finance')) {
    return { basic: 38000, hra: 15200, allowances: 6500, bonus: 1500, otherEarnings: 800, otherDeductions: 800 };
  }

  if (normalized.includes('human')) {
    return { basic: 36000, hra: 14400, allowances: 6000, bonus: 1200, otherEarnings: 700, otherDeductions: 700 };
  }

  return { basic: 32000, hra: 12800, allowances: 5000, bonus: 1000, otherEarnings: 600, otherDeductions: 650 };
};

const mapScopeFilters = async (filters = {}, actor) => {
  const scoped = { ...filters };

  if (actor.role === 'SUPER_ADMIN' || actor.role === 'HR_ADMIN') {
    return scoped;
  }

  if (!actor.employeeId) {
    return { employeeId: '__none__' };
  }

  if (actor.role === 'MANAGER') {
    const subordinates = await employeeRepository.getSubordinates(actor.employeeId);
    const allowedIds = [actor.employeeId, ...subordinates.map((employee) => employee.id)];

    if (scoped.employeeId && !allowedIds.includes(scoped.employeeId)) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Forbidden: outside your team scope');
    }

    scoped.employeeId = scoped.employeeId ? scoped.employeeId : { in: allowedIds };
    return scoped;
  }

  if (scoped.employeeId && scoped.employeeId !== actor.employeeId) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Forbidden: self scope only');
  }

  scoped.employeeId = actor.employeeId;
  return scoped;
};

const ensureSalaryRecords = async (month, year) => {
  const employees = await employeeRepository.getEmployees();
  const existing = await salaryRepository.listSalaryRecords({ month, year });
  const existingIds = new Set(existing.map((entry) => entry.employeeId));

  const missingEmployees = employees.filter((employee) => !existingIds.has(employee.id));

  await Promise.all(
    missingEmployees.map((employee) => {
      const defaults = defaultComponentsByDepartment(employee.department?.name || '');

      return salaryRepository.createSalaryRecord({
        employeeId: employee.id,
        month,
        year,
        workingDays: 26,
        payableDays: 26,
        status: 'DRAFT',
        pfEmployeeRate: 12,
        pfEmployerRate: 12,
        esiRate: 0.75,
        tdsRate: 5,
        basic: defaults.basic,
        hra: defaults.hra,
        allowances: defaults.allowances,
        bonus: defaults.bonus,
        otherEarnings: defaults.otherEarnings,
        otherDeductions: defaults.otherDeductions,
      });
    }),
  );
};

const listSalaryRecords = async (filters = {}, actor) => {
  if (!actor) throw new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized');

  const month = filters.month || DEFAULT_MONTH;
  const year = filters.year || DEFAULT_YEAR;

  await ensureSalaryRecords(month, year);

  const scopedFilters = await mapScopeFilters({ ...filters, month, year }, actor);
  return salaryRepository.listSalaryRecords(scopedFilters);
};

const updateSalaryRecord = async (id, patch = {}, actor) => {
  if (!actor) throw new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized');

  const existing = await salaryRepository.getSalaryRecordById(id);
  if (!existing) {
    throw new ApiError(StatusCodes.NOT_FOUND, SALARY_MESSAGES.NOT_FOUND);
  }

  const scoped = await mapScopeFilters({ employeeId: existing.employeeId }, actor);
  if (scoped.employeeId === '__none__') {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Forbidden');
  }

  if (patch.status && !SALARY_STATUS.has(patch.status)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid salary status');
  }

  return salaryRepository.updateSalaryRecord(id, patch);
};

module.exports = {
  listSalaryRecords,
  updateSalaryRecord,
};