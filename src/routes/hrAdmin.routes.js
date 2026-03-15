const express = require('express');
const hrAdminController = require('../controllers/hrAdmin.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: HR Admin
 *     description: HR Admin dashboards and metrics
 *
 * /api/hr-admin/overview:
 *   get:
 *     tags: [HR Admin]
 *     summary: Get HR admin dashboard overview metrics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Overview fetched successfully
 */
router.get('/overview', authMiddleware, hrAdminController.getOverview);

module.exports = router;
