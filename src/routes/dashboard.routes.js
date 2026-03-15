const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const dashboardController = require('../controllers/dashboard.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Dashboard
 *     description: Role-based dashboard overview
 *
 * /api/dashboard/overview:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get role-based dashboard overview for super admin and manager
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard overview fetched successfully
 */
router.get('/overview', authMiddleware, dashboardController.getOverview);

module.exports = router;
