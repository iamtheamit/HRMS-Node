// filter.dto.js
// This DTO encapsulates generic filtering parameters for listing endpoints.
// It is responsible for whitelisting allowed filter fields from query strings.

const BaseDTO = require('../base.dto');

class FilterDTO extends BaseDTO {
  constructor(query = {}, allowedFilters = []) {
    super(query, allowedFilters);
  }
}

module.exports = FilterDTO;

