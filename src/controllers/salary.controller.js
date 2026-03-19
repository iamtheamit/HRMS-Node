const salaryService = require('../services/salary.service');
const { sendSuccess } = require('../utils/apiResponse');
const StatusCodes = require('../constants/statusCodes');
const { SALARY_MESSAGES } = require('../constants/messages');
const { SalaryFilterDTO, UpdateSalaryDTO } = require('../dtos/salary.dto');

const mapSalaryStatus = (status) => {
  if (status === 'PROCESSED') return 'Processed';
  if (status === 'PAID') return 'Paid';
  return 'Draft';
};

const mapSalaryRecord = (record) => {
  return {
    id: record.id,
    employeeId: record.employeeId,
    employeeCode: `EMP-${record.employeeId.replace(/-/g, '').slice(0, 6).toUpperCase()}`,
    employeeName: `${record.employee?.firstName || ''} ${record.employee?.lastName || ''}`.trim(),
    department: record.employee?.department?.name || 'No Department',
    designation: record.employee?.user?.role || 'EMPLOYEE',
    month: record.month,
    year: record.year,
    workingDays: record.workingDays,
    payableDays: record.payableDays,
    status: mapSalaryStatus(record.status),
    rates: {
      pfEmployeeRate: Number(record.pfEmployeeRate),
      pfEmployerRate: Number(record.pfEmployerRate),
      esiRate: Number(record.esiRate),
      tdsRate: Number(record.tdsRate),
    },
    components: {
      basic: Number(record.basic),
      hra: Number(record.hra),
      allowances: Number(record.allowances),
      bonus: Number(record.bonus),
      otherEarnings: Number(record.otherEarnings),
      otherDeductions: Number(record.otherDeductions),
    },
  };
};

const toBackendStatus = (status) => {
  if (status === 'Processed') return 'PROCESSED';
  if (status === 'Paid') return 'PAID';
  if (status === 'Draft') return 'DRAFT';
  return status;
};

const listSalaryRecords = async (req, res, next) => {
  try {
    const filterDto = new SalaryFilterDTO(req.query);
    const rows = await salaryService.listSalaryRecords(filterDto, req.user);
    return sendSuccess(
      res,
      SALARY_MESSAGES.FETCH_ALL_SUCCESS,
      rows.map(mapSalaryRecord),
      StatusCodes.OK,
    );
  } catch (err) {
    return next(err);
  }
};

const updateSalaryRecord = async (req, res, next) => {
  try {
    const dto = new UpdateSalaryDTO(req.body);
    const payload = {
      ...dto,
      ...(dto.status ? { status: toBackendStatus(dto.status) } : {}),
    };
    const row = await salaryService.updateSalaryRecord(req.params.id, payload, req.user);
    return sendSuccess(res, SALARY_MESSAGES.UPDATE_SUCCESS, mapSalaryRecord(row), StatusCodes.OK);
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  listSalaryRecords,
  updateSalaryRecord,
};