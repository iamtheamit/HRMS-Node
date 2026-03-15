const dashboardService = require('../services/dashboard.service');
const { sendSuccess } = require('../utils/apiResponse');
const StatusCodes = require('../constants/statusCodes');

const getOverview = async (req, res, next) => {
  try {
    const data = await dashboardService.getOverview(req.user);
    return sendSuccess(res, 'Dashboard overview fetched successfully', data, StatusCodes.OK);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getOverview,
};
