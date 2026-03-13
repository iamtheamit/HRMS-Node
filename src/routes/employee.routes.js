// employee.routes.js
// This routes file defines HTTP endpoints for employee CRUD operations.
// It is responsible for mapping employee-related routes to controller handlers and applying authentication middleware.

const express = require('express');
const employeeController = require('../controllers/employee.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', employeeController.getEmployees);
router.get('/:id', employeeController.getEmployeeById);
router.post('/', employeeController.createEmployee);
router.put('/:id', employeeController.updateEmployee);
router.delete('/:id', employeeController.deleteEmployee);

module.exports = router;

