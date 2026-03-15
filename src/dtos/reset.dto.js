const BaseDTO = require('./base.dto');

class ResetPasswordDTO extends BaseDTO {
  constructor(data) {
    super(data, ['token', 'newPassword']);
  }
}

module.exports = {
  ResetPasswordDTO,
};
