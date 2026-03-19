const express = require('express');
const payrollController = require('../controllers/payroll.controller');
const authMiddleware = require('../middleware/auth.middleware');
const permissionMiddleware = require('../middleware/permission.middleware');
const { PERMISSIONS } = require('../constants/permissions');

const router = express.Router();

router.use(authMiddleware);

router.get(
  '/',
  permissionMiddleware(PERMISSIONS.PAYROLL_LIST),
  payrollController.listPayrollRecords,
);

router.post(
  '/process-all',
  permissionMiddleware(PERMISSIONS.PAYROLL_PROCESS),
  payrollController.processAllDrafts,
);

router.post(
  '/:id/process',
  permissionMiddleware(PERMISSIONS.PAYROLL_PROCESS),
  payrollController.processPayroll,
);

router.post(
  '/:id/mark-paid',
  permissionMiddleware(PERMISSIONS.PAYROLL_PROCESS),
  payrollController.markPayrollPaid,
);

module.exports = router;