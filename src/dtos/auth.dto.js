// auth.dto.js
// This DTO file defines request DTOs for the authentication domain.
// It is responsible for whitelisting and shaping login and registration payloads.

const BaseDTO = require('./base.dto');

class RegisterDTO extends BaseDTO {
  constructor(data) {
    super(data, ['email', 'password', 'role', 'firstName', 'lastName']);
  }
}

class LoginDTO extends BaseDTO {
  constructor(data) {
    super(data, ['email', 'password']);
  }
}

module.exports = {
  RegisterDTO,
  LoginDTO,
};

