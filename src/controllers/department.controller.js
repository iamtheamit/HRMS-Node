const departmentService = require('../services/department.service');
const { sendSuccess } = require('../utils/apiResponse');
const StatusCodes = require('../constants/statusCodes');
const { DEPARTMENT_MESSAGES } = require('../constants/messages');
const {
  CreateDepartmentDTO,
  UpdateDepartmentDTO,
  AssignDepartmentEmployeesDTO,
} = require('../dtos/department.dto');

const getDepartments = async (req, res, next) => {
  try {
    const departments = await departmentService.listDepartments();
    return sendSuccess(res, DEPARTMENT_MESSAGES.FETCH_ALL_SUCCESS, departments, StatusCodes.OK);
  } catch (error) {
    return next(error);
  }
};

const createDepartment = async (req, res, next) => {
  try {
    const dto = new CreateDepartmentDTO(req.body);
    const department = await departmentService.createDepartment(dto);
    return sendSuccess(res, DEPARTMENT_MESSAGES.CREATE_SUCCESS, department, StatusCodes.CREATED);
  } catch (error) {
    return next(error);
  }
};

const updateDepartment = async (req, res, next) => {
  try {
    const dto = new UpdateDepartmentDTO(req.body);
    const department = await departmentService.updateDepartment(req.params.id, dto);
    return sendSuccess(res, DEPARTMENT_MESSAGES.UPDATE_SUCCESS, department, StatusCodes.OK);
  } catch (error) {
    return next(error);
  }
};

const assignDepartmentEmployees = async (req, res, next) => {
  try {
    const dto = new AssignDepartmentEmployeesDTO(req.body);
    const department = await departmentService.assignEmployees(req.params.id, dto.employeeIds || []);
    return sendSuccess(res, DEPARTMENT_MESSAGES.ASSIGN_SUCCESS, department, StatusCodes.OK);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getDepartments,
  createDepartment,
  updateDepartment,
  assignDepartmentEmployees,
};
