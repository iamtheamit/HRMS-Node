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

/**
 * @swagger
 * /api/hr-admin/email-test:
 *   post:
 *     tags: [HR Admin]
 *     summary: Send a test email (staging/diagnostics)
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               to:
 *                 type: string
 *                 example: qa@example.com
 *               name:
 *                 type: string
 *                 example: QA User
 *     responses:
 *       200:
 *         description: Test email sent
 */
router.post('/email-test', authMiddleware, hrAdminController.sendTestEmail);

module.exports = router;
