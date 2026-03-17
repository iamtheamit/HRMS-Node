const hrAdminService = require('../services/hrAdmin.service');
const { sendSuccess } = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const StatusCodes = require('../constants/statusCodes');
const emailService = require('../services/email/email.service');

const ADMIN_ROLES = new Set(['SUPER_ADMIN', 'HR_ADMIN']);

const getOverview = async (req, res, next) => {
  try {
    const overview = await hrAdminService.getOverview(req.user);
    return sendSuccess(res, 'HR Admin overview fetched successfully', overview, StatusCodes.OK);
  } catch (err) {
    return next(err);
  }
};

const sendTestEmail = async (req, res, next) => {
  try {
    if (!req.user || !ADMIN_ROLES.has(req.user.role)) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Forbidden: admin role required');
    }

    const to = String(req.body?.to || req.user.email || '').trim().toLowerCase();
    if (!to) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Email recipient is required');
    }

    await emailService.sendWelcomeEmail({
      email: to,
      firstName: req.body?.name || 'HRMS User',
    });

    return sendSuccess(
      res,
      'Test email sent successfully',
      { to, sentAt: new Date().toISOString() },
      StatusCodes.OK,
    );
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getOverview,
  sendTestEmail,
};
