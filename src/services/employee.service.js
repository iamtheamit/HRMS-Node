// employee.service.js
// This service implements business logic for employee management (CRUD operations).
// It is responsible for validating input, enforcing simple domain rules, and delegating persistence to the employee repository.

const employeeRepository = require('../repositories/employee.repository');
const ApiError = require('../utils/apiError');
const StatusCodes = require('../constants/statusCodes');
const { EMPLOYEE_MESSAGES } = require('../constants/messages');

const createEmployee = async (payload) => {
  const employee = await employeeRepository.createEmployee(payload);
  return employee;
};

const listEmployees = async () => {
  const employees = await employeeRepository.getEmployees();
  return employees;
};

const getEmployee = async (id) => {
  const employee = await employeeRepository.getEmployeeById(id);
  if (!employee) {
    throw new ApiError(StatusCodes.NOT_FOUND, EMPLOYEE_MESSAGES.NOT_FOUND);
  }
  return employee;
};

const updateEmployee = async (id, payload) => {
  await getEmployee(id);
  const updated = await employeeRepository.updateEmployee(id, payload);
  return updated;
};

const deleteEmployee = async (id) => {
  await getEmployee(id);
  await employeeRepository.deleteEmployee(id);
  return true;
};

module.exports = {
  createEmployee,
  listEmployees,
  getEmployee,
  updateEmployee,
  deleteEmployee,
};

