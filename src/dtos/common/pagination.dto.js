// pagination.dto.js
// This DTO encapsulates pagination parameters such as page and limit.
// It is responsible for sanitizing pagination query input and exposing derived skip/take values.

const BaseDTO = require('../base.dto');

class PaginationDTO extends BaseDTO {
  constructor(query = {}) {
    super(query, ['page', 'limit']);

    const page = parseInt(this.page, 10) || 1;
    const limit = parseInt(this.limit, 10) || 10;

    this.page = page < 1 ? 1 : page;
    this.limit = limit < 1 ? 10 : limit;
    this.skip = (this.page - 1) * this.limit;
  }
}

module.exports = PaginationDTO;

