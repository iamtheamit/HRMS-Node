const express = require('express');
const salaryController = require('../controllers/salary.controller');
const authMiddleware = require('../middleware/auth.middleware');
const permissionMiddleware = require('../middleware/permission.middleware');
const { PERMISSIONS } = require('../constants/permissions');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Salary
 *     description: Salary records and updates
 *
 * components:
 *   schemas:
 *     SalaryRecord:
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
 *         designation:
 *           type: string
 *         month:
 *           type: string
 *         year:
 *           type: integer
 *         workingDays:
 *           type: number
 *         payableDays:
 *           type: number
 *         status:
 *           type: string
 *           enum: [Draft, Processed, Paid]
 *         rates:
 *           type: object
 *           properties:
 *             pfEmployeeRate:
 *               type: number
 *             pfEmployerRate:
 *               type: number
 *             esiRate:
 *               type: number
 *             tdsRate:
 *               type: number
 *         components:
 *           type: object
 *           properties:
 *             basic:
 *               type: number
 *             hra:
 *               type: number
 *             allowances:
 *               type: number
 *             bonus:
 *               type: number
 *             otherEarnings:
 *               type: number
 *             otherDeductions:
 *               type: number
 */

/**
 * @swagger
 * /api/salary:
 *   get:
 *     tags: [Salary]
 *     summary: List salary records in actor scope
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
 *         description: Salary list fetched
 */

/**
 * @swagger
 * /api/salary/{id}:
 *   patch:
 *     tags: [Salary]
 *     summary: Update salary record fields/status
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Draft, Processed, Paid]
 *               payableDays:
 *                 type: number
 *               pfEmployeeRate:
 *                 type: number
 *               pfEmployerRate:
 *                 type: number
 *               esiRate:
 *                 type: number
 *               tdsRate:
 *                 type: number
 *               basic:
 *                 type: number
 *               hra:
 *                 type: number
 *               allowances:
 *                 type: number
 *               bonus:
 *                 type: number
 *               otherEarnings:
 *                 type: number
 *               otherDeductions:
 *                 type: number
 *     responses:
 *       200:
 *         description: Salary record updated
 */

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