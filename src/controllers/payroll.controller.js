const payrollService = require('../services/payroll.service');
const { sendSuccess } = require('../utils/apiResponse');
const StatusCodes = require('../constants/statusCodes');
const { PAYROLL_MESSAGES } = require('../constants/messages');
const { PayrollFilterDTO } = require('../dtos/payroll.dto');

const listPayrollRecords = async (req, res, next) => {
  try {
    const filterDto = new PayrollFilterDTO(req.query);
    const rows = await payrollService.listPayrollRecords(filterDto, req.user);
    return sendSuccess(res, PAYROLL_MESSAGES.FETCH_ALL_SUCCESS, rows, StatusCodes.OK);
  } catch (err) {
    return next(err);
  }
};

const processPayroll = async (req, res, next) => {
  try {
    const row = await payrollService.processPayroll(req.params.id, req.user);
    return sendSuccess(res, PAYROLL_MESSAGES.PROCESS_SUCCESS, row, StatusCodes.OK);
  } catch (err) {
    return next(err);
  }
};

const processAllDrafts = async (req, res, next) => {
  try {
    const filterDto = new PayrollFilterDTO(req.query);
    const rows = await payrollService.processAllDrafts(filterDto, req.user);
    return sendSuccess(res, PAYROLL_MESSAGES.PROCESS_ALL_SUCCESS, rows, StatusCodes.OK);
  } catch (err) {
    return next(err);
  }
};

const markPayrollPaid = async (req, res, next) => {
  try {
    const row = await payrollService.markPayrollPaid(req.params.id, req.user);
    return sendSuccess(res, PAYROLL_MESSAGES.MARK_PAID_SUCCESS, row, StatusCodes.OK);
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  listPayrollRecords,
  processPayroll,
  processAllDrafts,
  markPayrollPaid,
};