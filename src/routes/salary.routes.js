const express = require('express');
const salaryController = require('../controllers/salary.controller');
const authMiddleware = require('../middleware/auth.middleware');
const permissionMiddleware = require('../middleware/permission.middleware');
const { PERMISSIONS } = require('../constants/permissions');

const router = express.Router();

router.use(authMiddleware);

router.get(
  '/',
  permissionMiddleware(PERMISSIONS.SALARY_LIST),
  salaryController.listSalaryRecords,
);

router.patch(
  '/:id',
  permissionMiddleware(PERMISSIONS.SALARY_UPDATE),
  salaryController.updateSalaryRecord,
);

module.exports = router;