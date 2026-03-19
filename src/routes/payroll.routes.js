const express = require('express');
const payrollController = require('../controllers/payroll.controller');
const authMiddleware = require('../middleware/auth.middleware');
const permissionMiddleware = require('../middleware/permission.middleware');
const { PERMISSIONS } = require('../constants/permissions');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Payroll
 *     description: Payroll listing and processing
 *
 * components:
 *   schemas:
 *     PayrollRecord:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         employeeId:
 *           type: string
 *           format: uuid
 *         employeeCode:
 *           type: string
 *         employeeName:
 *           type: string
 *         department:
 *           type: string
 *         role:
 *           type: string
 *         payPeriod:
 *           type: string
 *         month:
 *           type: string
 *         year:
 *           type: integer
 *         status:
 *           type: string
 *           enum: [Draft, Processed, Paid]
 *         grossPay:
 *           type: number
 *         totalDeductions:
 *           type: number
 *         netPay:
 *           type: number
 */

/**
 * @swagger
 * /api/payroll:
 *   get:
 *     tags: [Payroll]
 *     summary: List payroll records in actor scope
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: year
 *         required: false
 *         schema:
 *           type: integer
 *       - in: query
 *         name: employeeId
 *         required: false
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Payroll list fetched
 */

/**
 * @swagger
 * /api/payroll/process-all:
 *   post:
 *     tags: [Payroll]
 *     summary: Process all draft payroll records in current filter scope
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         required: false
 *         schema:
 *           type: string
 *       - in: query
 *         name: year
 *         required: false
 *         schema:
 *           type: integer
 *       - in: query
 *         name: employeeId
 *         required: false
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Draft payroll records processed
 */

/**
 * @swagger
 * /api/payroll/{id}/process:
 *   post:
 *     tags: [Payroll]
 *     summary: Process a single payroll record
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Payroll processed
 */

/**
 * @swagger
 * /api/payroll/{id}/mark-paid:
 *   post:
 *     tags: [Payroll]
 *     summary: Mark a payroll record as paid
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Payroll marked as paid
 */

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