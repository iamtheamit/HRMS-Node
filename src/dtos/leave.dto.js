// leave.dto.js
// This DTO file defines request DTOs for leave-related operations.
// It is responsible for whitelisting and shaping create and filter leave payloads.

const BaseDTO = require('./base.dto');

class CreateLeaveDTO extends BaseDTO {
  constructor(data) {
    super(data, ['startDate', 'endDate', 'type', 'reason']);

    if (this.startDate) {
      this.startDate = new Date(this.startDate);
    }

    if (this.endDate) {
      this.endDate = new Date(this.endDate);
    }
  }
}

class LeaveFilterDTO extends BaseDTO {
  constructor(query) {
    super(query, ['employeeId', 'status']);
  }
}

module.exports = {
  CreateLeaveDTO,
  LeaveFilterDTO,
};

