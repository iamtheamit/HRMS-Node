// attendance.dto.js
// This DTO file defines request DTOs for attendance-related operations.
// It is responsible for whitelisting and shaping filters for attendance listing.

const BaseDTO = require('./base.dto');

class AttendanceFilterDTO extends BaseDTO {
  constructor(query) {
    super(query, ['employeeId']);
  }
}

class UpdateAttendanceStatusDTO extends BaseDTO {
  constructor(data) {
    super(data, ['status']);
  }
}

class MarkAttendanceDTO extends BaseDTO {
  constructor(data) {
    super(data, ['employeeId', 'date', 'status']);

    if (this.date) {
      this.date = new Date(this.date);
    }
  }
}

module.exports = {
  AttendanceFilterDTO,
  UpdateAttendanceStatusDTO,
  MarkAttendanceDTO,
};

