// base.dto.js
// This DTO base class standardizes input whitelisting and simple shaping logic for request payloads.
// It is responsible for copying only allowed fields from raw input objects into strongly-typed DTO instances.

class BaseDTO {
  constructor(data = {}, allowedFields = []) {
    allowedFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(data, field) && data[field] !== undefined) {
        this[field] = data[field];
      }
    });
  }
}

module.exports = BaseDTO;

