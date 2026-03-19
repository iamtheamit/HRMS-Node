const express = require('express');
const taskController = require('../controllers/task.controller');
const authMiddleware = require('../middleware/auth.middleware');
const permissionMiddleware = require('../middleware/permission.middleware');
const { PERMISSIONS } = require('../constants/permissions');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Tasks
 *     description: Task assignment and tracking
 */

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     tags: [Tasks]
 *     summary: Create a new task in actor scope
 *     security:
 *       - bearerAuth: []
 *   get:
 *     tags: [Tasks]
 *     summary: List tasks in actor scope
 *     security:
 *       - bearerAuth: []
 */

/**
 * @swagger
 * /api/tasks/{id}/status:
 *   patch:
 *     tags: [Tasks]
 *     summary: Update task status for the assignee
 *     security:
 *       - bearerAuth: []
 */

router.use(authMiddleware);

router.post(
  '/',
  permissionMiddleware(PERMISSIONS.TASK_CREATE),
  taskController.createTask,
);
router.get(
  '/',
  permissionMiddleware(PERMISSIONS.TASK_LIST),
  taskController.listTasks,
);
router.patch(
  '/:id/status',
  permissionMiddleware(PERMISSIONS.TASK_UPDATE),
  taskController.updateTaskStatus,
);

module.exports = router;