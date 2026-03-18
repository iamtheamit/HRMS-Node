const BaseDTO = require('./base.dto');

class CreateDepartmentDTO extends BaseDTO {
  constructor(data) {
    super(data, ['name', 'description']);
  }
}

class UpdateDepartmentDTO extends BaseDTO {
  constructor(data) {
    super(data, ['name', 'description', 'headEmployeeId']);
  }
}

class AssignDepartmentEmployeesDTO extends BaseDTO {
  constructor(data) {
    super(data, ['employeeIds']);
  }
}

module.exports = {
  CreateDepartmentDTO,
  UpdateDepartmentDTO,
  AssignDepartmentEmployeesDTO,
};
