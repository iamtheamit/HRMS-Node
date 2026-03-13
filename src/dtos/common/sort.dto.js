// sort.dto.js
// This DTO encapsulates sorting parameters for list endpoints.
// It is responsible for sanitizing sortBy and order parameters from query strings.

const BaseDTO = require('../base.dto');

class SortDTO extends BaseDTO {
  constructor(query = {}, allowedSortFields = []) {
    super(query, ['sortBy', 'order']);

    if (!allowedSortFields.includes(this.sortBy)) {
      this.sortBy = null;
    }

    const normalizedOrder = (this.order || 'asc').toLowerCase();
    this.order = normalizedOrder === 'desc' ? 'desc' : 'asc';
  }
}

module.exports = SortDTO;

