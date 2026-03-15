const BaseDTO = require('./base.dto');

class AssignPermissionDTO extends BaseDTO {
  constructor(data) {
    super(data, ['userId', 'permissionName']);
  }
}

module.exports = {
  AssignPermissionDTO,
};
