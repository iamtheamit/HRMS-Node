// queryBuilder.js
// This utility provides helpers for building Prisma query options from common DTOs.
// It is responsible for translating pagination, filter, and sort DTOs into Prisma-compatible query objects.

const buildPagination = (paginationDto) => {
  if (!paginationDto) return {};
  return {
    skip: paginationDto.skip,
    take: paginationDto.limit,
  };
};

const buildSort = (sortDto) => {
  if (!sortDto || !sortDto.sortBy) return {};
  return {
    orderBy: {
      [sortDto.sortBy]: sortDto.order,
    },
  };
};

const buildFilters = (filterDto) => {
  if (!filterDto) return {};
  const { ...where } = filterDto;
  return { where };
};

module.exports = {
  buildPagination,
  buildSort,
  buildFilters,
};

