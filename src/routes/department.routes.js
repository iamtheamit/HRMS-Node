const express = require('express');
const departmentController = require('../controllers/department.controller');
const authMiddleware = require('../middleware/auth.middleware');
const permissionMiddleware = require('../middleware/permission.middleware');
const { PERMISSIONS } = require('../constants/permissions');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Departments
 *     description: Department management
 *
 * /api/departments:
 *   get:
 *     tags: [Departments]
 *     summary: List departments
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Departments fetched
 *
 *   post:
 *     tags: [Departments]
 *     summary: Create department
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Department created
 *
 * /api/departments/{id}:
 *   put:
 *     tags: [Departments]
 *     summary: Update department details or head
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
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               headEmployeeId:
 *                 type: string
 *                 format: uuid
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Department updated
 */

router.use(authMiddleware);

router.get(
  '/',
  permissionMiddleware(PERMISSIONS.DEPARTMENT_LIST),
  departmentController.getDepartments,
);

router.post(
  '/',
  permissionMiddleware(PERMISSIONS.DEPARTMENT_CREATE),
  departmentController.createDepartment,
);

router.put(
  '/:id',
  permissionMiddleware(PERMISSIONS.DEPARTMENT_UPDATE),
  departmentController.updateDepartment,
);

router.patch(
  '/:id/assign-employees',
  permissionMiddleware(PERMISSIONS.DEPARTMENT_UPDATE),
  departmentController.assignDepartmentEmployees,
);

module.exports = router;
