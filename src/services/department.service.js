const departmentRepository = require('../repositories/department.repository');
const employeeRepository = require('../repositories/employee.repository');
const ApiError = require('../utils/apiError');
const StatusCodes = require('../constants/statusCodes');
const { DEPARTMENT_MESSAGES } = require('../constants/messages');

const normalizeName = (value) => String(value || '').trim();
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const isUuid = (value) => UUID_RE.test(String(value || ''));

const listDepartments = async () => {
  return departmentRepository.listDepartments();
};

const createDepartment = async (payload) => {
  const name = normalizeName(payload.name);
  if (!name) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Department name is required');
  }

  const existing = await departmentRepository.findByName(name);
  if (existing) {
    throw new ApiError(StatusCodes.CONFLICT, DEPARTMENT_MESSAGES.NAME_EXISTS);
  }

  return departmentRepository.createDepartment({
    name,
    description: payload.description,
  });
};

const updateDepartment = async (id, payload) => {
  if (!isUuid(id)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid department id');
  }

  const existingDepartment = await departmentRepository.getDepartmentById(id);
  if (!existingDepartment) {
    throw new ApiError(StatusCodes.NOT_FOUND, DEPARTMENT_MESSAGES.NOT_FOUND);
  }

  const updates = {};

  if (typeof payload.name !== 'undefined') {
    const name = normalizeName(payload.name);
    if (!name) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Department name is required');
    }

    if (name.toLowerCase() !== existingDepartment.name.toLowerCase()) {
      const sameName = await departmentRepository.findByName(name);
      if (sameName && sameName.id !== id) {
        throw new ApiError(StatusCodes.CONFLICT, DEPARTMENT_MESSAGES.NAME_EXISTS);
      }
    }

    updates.name = name;
  }

  if (typeof payload.description !== 'undefined') {
    updates.description = payload.description || null;
  }

  if (Object.prototype.hasOwnProperty.call(payload, 'headEmployeeId')) {
    const { headEmployeeId } = payload;

    if (headEmployeeId === null || headEmployeeId === '') {
      updates.headEmployeeId = null;
    } else {
      if (!isUuid(headEmployeeId)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid head employee id');
      }

      const employee = await employeeRepository.getEmployeeById(headEmployeeId);
      if (!employee) {
        throw new ApiError(StatusCodes.NOT_FOUND, 'Head employee not found');
      }

      if (employee.departmentId !== id) {
        throw new ApiError(StatusCodes.BAD_REQUEST, DEPARTMENT_MESSAGES.HEAD_MUST_BELONG_TO_DEPARTMENT);
      }

      updates.headEmployeeId = headEmployeeId;
    }
  }

  return departmentRepository.updateDepartment(id, updates);
};

const assignEmployees = async (departmentId, employeeIds = []) => {
  if (!isUuid(departmentId)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid department id');
  }

  const existingDepartment = await departmentRepository.getDepartmentById(departmentId);
  if (!existingDepartment) {
    throw new ApiError(StatusCodes.NOT_FOUND, DEPARTMENT_MESSAGES.NOT_FOUND);
  }

  if (!Array.isArray(employeeIds)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'employeeIds must be an array');
  }

  const normalizedEmployeeIds = Array.from(
    new Set(employeeIds.map((id) => String(id || '').trim()).filter(Boolean)),
  );

  if (!normalizedEmployeeIds.every((id) => isUuid(id))) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'One or more employee ids are invalid');
  }

  if (normalizedEmployeeIds.length > 0) {
    const existingEmployees = await employeeRepository.getEmployeesByIds(normalizedEmployeeIds);
    if (existingEmployees.length !== normalizedEmployeeIds.length) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'One or more employees were not found');
    }

    await employeeRepository.assignEmployeesToDepartment(departmentId, normalizedEmployeeIds);
  }

  return departmentRepository.getDepartmentById(departmentId);
};

module.exports = {
  listDepartments,
  createDepartment,
  updateDepartment,
  assignEmployees,
};
