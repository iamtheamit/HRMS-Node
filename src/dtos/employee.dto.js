// employee.dto.js
// This DTO file defines request DTOs for employee-related operations.
// It is responsible for whitelisting and shaping create and update employee payloads.

const BaseDTO = require('./base.dto');

class CreateEmployeeDTO extends BaseDTO {
  constructor(data) {
    super(data, [
      'firstName',
      'lastName',
      'email',
      'phone',
      'countryCode',
      'mobileNumber',
      'profileUrl',
      'documents',
      'departmentId',
      'managerId',
      'status',
      'role',
    ]);
  }
}

class UpdateEmployeeDTO extends BaseDTO {
  constructor(data) {
    super(data, [
      'firstName',
      'lastName',
      'email',
      'phone',
      'countryCode',
      'mobileNumber',
      'profileUrl',
      'documents',
      'departmentId',
      'managerId',
      'status',
    ]);
  }
}

module.exports = {
  CreateEmployeeDTO,
  UpdateEmployeeDTO,
};

