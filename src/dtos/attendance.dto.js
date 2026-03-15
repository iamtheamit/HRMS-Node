// attendance.dto.js
// This DTO file defines request DTOs for attendance-related operations.
// It is responsible for whitelisting and shaping filters for attendance listing.

const BaseDTO = require('./base.dto');

class AttendanceFilterDTO extends BaseDTO {
  constructor(query) {
    super(query, ['employeeId']);
  }
}

module.exports = {
  AttendanceFilterDTO,
};

