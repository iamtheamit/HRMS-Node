// employee.routes.js
// This routes file defines HTTP endpoints for employee CRUD operations.
// It is responsible for mapping employee-related routes to controller handlers and applying authentication middleware.

const express = require('express');
const employeeController = require('../controllers/employee.controller');
const authMiddleware = require('../middleware/auth.middleware');
const permissionMiddleware = require('../middleware/permission.middleware');
const { PERMISSIONS } = require('../constants/permissions');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Employees
 *     description: Employee management endpoints
 *
 * components:
 *   schemas:
 *     DepartmentRef:
 *       type: object
 *       nullable: true
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *     Employee:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         email:
 *           type: string
 *         phone:
 *           type: string
 *           nullable: true
 *         countryCode:
 *           type: string
 *           nullable: true
 *         mobileNumber:
 *           type: string
 *           nullable: true
 *         profileUrl:
 *           type: string
 *           nullable: true
 *         documents:
 *           type: object
 *           nullable: true
 *         status:
 *           type: string
 *         hireDate:
 *           type: string
 *           format: date-time
 *         departmentId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         managerId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         userId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         department:
 *           $ref: '#/components/schemas/DepartmentRef'
 *     EmployeeCreateRequest:
 *       type: object
 *       required: [firstName, lastName, email]
 *       properties:
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         email:
 *           type: string
 *         phone:
 *           type: string
 *         countryCode:
 *           type: string
 *         mobileNumber:
 *           type: string
 *         profileUrl:
 *           type: string
 *         documents:
 *           type: object
 *         hireDate:
 *           type: string
 *           format: date-time
 *         status:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, TERMINATED]
 *         departmentId:
 *           type: string
 *           format: uuid
 *         managerId:
 *           type: string
 *           format: uuid
 *         userId:
 *           type: string
 *           format: uuid
 *         role:
 *           type: string
 *           enum: [SUPER_ADMIN, HR_ADMIN, MANAGER, EMPLOYEE]
 */

/**
 * @swagger
 * /api/employees:
 *   get:
 *     tags: [Employees]
 *     summary: List employees in actor scope
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Employee list fetched
 */

/**
 * @swagger
 * /api/employees/{id}:
 *   get:
 *     tags: [Employees]
 *     summary: Get employee by id
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
 *         description: Employee fetched
 */

/**
 * @swagger
 * /api/employees:
 *   post:
 *     tags: [Employees]
 *     summary: Create employee
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmployeeCreateRequest'
 *     responses:
 *       201:
 *         description: Employee created
 */

/**
 * @swagger
 * /api/employees/{id}:
 *   put:
 *     tags: [Employees]
 *     summary: Update employee
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
 *     responses:
 *       200:
 *         description: Employee updated
 */

/**
 * @swagger
 * /api/employees/{id}:
 *   delete:
 *     tags: [Employees]
 *     summary: Delete employee
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
 *         description: Employee deleted
 */

/**
 * @swagger
 * /api/employees/{id}/lifecycle:
 *   patch:
 *     tags: [Employees]
 *     summary: Block or soft-delete an employee
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
 *             required: [action]
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [BLOCK, DELETE]
 *     responses:
 *       200:
 *         description: Employee lifecycle updated
 */

router.use(authMiddleware);

router.get('/', permissionMiddleware(PERMISSIONS.EMPLOYEE_LIST), employeeController.getEmployees);
router.get('/:id', permissionMiddleware(PERMISSIONS.EMPLOYEE_VIEW), employeeController.getEmployeeById);
router.post('/', permissionMiddleware(PERMISSIONS.EMPLOYEE_CREATE), employeeController.createEmployee);
router.put('/:id', permissionMiddleware(PERMISSIONS.EMPLOYEE_UPDATE), employeeController.updateEmployee);
router.patch('/:id/lifecycle', permissionMiddleware(PERMISSIONS.EMPLOYEE_DELETE), employeeController.updateEmployeeLifecycle);
router.delete('/:id', permissionMiddleware(PERMISSIONS.EMPLOYEE_DELETE), employeeController.deleteEmployee);

module.exports = router;

