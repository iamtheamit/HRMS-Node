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

const assertEmployeeReadableByActor = (actor, employee) => {
  if (!actor) throw new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized');
  if (actor.role === 'SUPER_ADMIN' || actor.role === 'HR_ADMIN') return;

  if (actor.role === 'MANAGER') {
    // Manager can view self and direct reports.
    if (employee.id === actor.employeeId || employee.managerId === actor.employeeId) return;
    throw new ApiError(StatusCodes.FORBIDDEN, 'Forbidden: outside your team scope');
  }

  // Employee can only view self.
  if (employee.id !== actor.employeeId) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Forbidden: self scope only');
  }
};

const listEmployees = async (actor) => {
  if (!actor) throw new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized');

  if (actor.role === 'SUPER_ADMIN' || actor.role === 'HR_ADMIN') {
    return employeeRepository.getEmployees();
  }

  if (actor.role === 'MANAGER') {
    if (!actor.employeeId) return [];
    const [self, subordinates] = await Promise.all([
      employeeRepository.getEmployeeById(actor.employeeId),
      employeeRepository.getSubordinates(actor.employeeId),
    ]);

    const rows = subordinates.slice();
    if (self) rows.unshift(self);
    return rows;
  }

  if (!actor.employeeId) return [];
  const self = await employeeRepository.getEmployeeById(actor.employeeId);
  return self ? [self] : [];
};

const getEmployee = async (id, actor) => {
  const employee = await employeeRepository.getEmployeeById(id);
  if (!employee) {
    throw new ApiError(StatusCodes.NOT_FOUND, EMPLOYEE_MESSAGES.NOT_FOUND);
  }

  assertEmployeeReadableByActor(actor, employee);

  return employee;
};

const updateEmployee = async (id, payload, actor) => {
  await getEmployee(id, actor);
  const updated = await employeeRepository.updateEmployee(id, payload);
  return updated;
};

const deleteEmployee = async (id, actor) => {
  await getEmployee(id, actor);
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

