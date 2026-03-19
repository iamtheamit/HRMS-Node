const BaseDTO = require('./base.dto');

class SalaryFilterDTO extends BaseDTO {
  constructor(query) {
    super(query, ['month', 'year', 'employeeId']);

    if (this.year) {
      this.year = Number(this.year);
    }
  }
}

class UpdateSalaryDTO extends BaseDTO {
  constructor(data) {
    super(data, [
      'status',
      'payableDays',
      'pfEmployeeRate',
      'pfEmployerRate',
      'esiRate',
      'tdsRate',
      'basic',
      'hra',
      'allowances',
      'bonus',
      'otherEarnings',
      'otherDeductions',
    ]);

    const numericFields = [
      'payableDays',
      'pfEmployeeRate',
      'pfEmployerRate',
      'esiRate',
      'tdsRate',
      'basic',
      'hra',
      'allowances',
      'bonus',
      'otherEarnings',
      'otherDeductions',
    ];

    numericFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(this, field)) {
        this[field] = Number(this[field]);
      }
    });
  }
}

module.exports = {
  SalaryFilterDTO,
  UpdateSalaryDTO,
};