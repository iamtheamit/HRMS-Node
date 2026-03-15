const hrAdminService = require('../services/hrAdmin.service');
const { sendSuccess } = require('../utils/apiResponse');
const StatusCodes = require('../constants/statusCodes');

const getOverview = async (req, res, next) => {
  try {
    const overview = await hrAdminService.getOverview(req.user);
    return sendSuccess(res, 'HR Admin overview fetched successfully', overview, StatusCodes.OK);
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getOverview,
};
