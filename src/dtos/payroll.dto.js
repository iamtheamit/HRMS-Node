const BaseDTO = require('./base.dto');

class PayrollFilterDTO extends BaseDTO {
  constructor(query) {
    super(query, ['month', 'year', 'employeeId']);

    if (this.year) {
      this.year = Number(this.year);
    }
  }
}

module.exports = {
  PayrollFilterDTO,
};