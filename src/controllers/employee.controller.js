// employee.controller.js
// This controller handles HTTP requests for employee CRUD operations.
// It is responsible for parsing request data into DTOs, delegating to the employee service, and formatting standardized API responses.

const employeeService = require('../services/employee.service');
const { sendSuccess } = require('../utils/apiResponse');
const StatusCodes = require('../constants/statusCodes');
const { EMPLOYEE_MESSAGES } = require('../constants/messages');
const { CreateEmployeeDTO, UpdateEmployeeDTO } = require('../dtos/employee.dto');

const createEmployee = async (req, res, next) => {
  try {
    const dto = new CreateEmployeeDTO(req.body);
    const employee = await employeeService.createEmployee(dto);
    return sendSuccess(res, EMPLOYEE_MESSAGES.CREATE_SUCCESS, employee, StatusCodes.CREATED);
  } catch (err) {
    return next(err);
  }
};

const getEmployees = async (req, res, next) => {
  try {
    const employees = await employeeService.listEmployees();
    return sendSuccess(res, EMPLOYEE_MESSAGES.FETCH_ALL_SUCCESS, employees, StatusCodes.OK);
  } catch (err) {
    return next(err);
  }
};

const getEmployeeById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const employee = await employeeService.getEmployee(id);
    return sendSuccess(res, EMPLOYEE_MESSAGES.FETCH_ONE_SUCCESS, employee, StatusCodes.OK);
  } catch (err) {
    return next(err);
  }
};

const updateEmployee = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const dto = new UpdateEmployeeDTO(req.body);
    const employee = await employeeService.updateEmployee(id, dto);
    return sendSuccess(res, EMPLOYEE_MESSAGES.UPDATE_SUCCESS, employee, StatusCodes.OK);
  } catch (err) {
    return next(err);
  }
};

const deleteEmployee = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    await employeeService.deleteEmployee(id);
    return sendSuccess(res, EMPLOYEE_MESSAGES.DELETE_SUCCESS, null, StatusCodes.NO_CONTENT);
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
};

