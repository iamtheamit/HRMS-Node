// leave.routes.js
// This routes file defines HTTP endpoints for leave management such as creating, approving, rejecting, and listing leave requests.
// It is responsible for mapping leave-related URLs to controller handlers and applying authentication.

const express = require('express');
const leaveController = require('../controllers/leave.controller');
const authMiddleware = require('../middleware/auth.middleware');
const permissionMiddleware = require('../middleware/permission.middleware');
const { PERMISSIONS } = require('../constants/permissions');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Leaves
 *     description: Leave request creation and approvals
 *
 * components:
 *   schemas:
 *     LeaveRequest:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         employeeId:
 *           type: string
 *           format: uuid
 *         startDate:
 *           type: string
 *           format: date-time
 *         endDate:
 *           type: string
 *           format: date-time
 *         type:
 *           type: string
 *           enum: [ANNUAL, SICK, UNPAID, OTHER]
 *         status:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED]
 *         reason:
 *           type: string
 *           nullable: true
 *         approverId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *     LeaveCreateRequest:
 *       type: object
 *       required: [startDate, endDate, type]
 *       properties:
 *         startDate:
 *           type: string
 *           format: date-time
 *         endDate:
 *           type: string
 *           format: date-time
 *         type:
 *           type: string
 *           enum: [ANNUAL, SICK, UNPAID, OTHER]
 *         reason:
 *           type: string
 */

/**
 * @swagger
 * /api/leaves:
 *   post:
 *     tags: [Leaves]
 *     summary: Create leave request for authenticated employee
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LeaveCreateRequest'
 *     responses:
 *       201:
 *         description: Leave request created
 */

/**
 * @swagger
 * /api/leaves:
 *   get:
 *     tags: [Leaves]
 *     summary: List leave requests in actor scope
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: employeeId
 *         required: false
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED]
 *     responses:
 *       200:
 *         description: Leave list fetched
 */

/**
 * @swagger
 * /api/leaves/{id}/approve:
 *   post:
 *     tags: [Leaves]
 *     summary: Approve pending leave request
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
 *         description: Leave approved
 */

/**
 * @swagger
 * /api/leaves/{id}/reject:
 *   post:
 *     tags: [Leaves]
 *     summary: Reject pending leave request
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
 *         description: Leave rejected
 */

router.use(authMiddleware);

router.post(
	'/',
	permissionMiddleware(PERMISSIONS.LEAVE_CREATE),
	leaveController.createLeaveRequest,
);
router.get(
	'/',
	permissionMiddleware(PERMISSIONS.LEAVE_LIST),
	leaveController.listLeaveRequests,
);
router.post(
	'/:id/approve',
	permissionMiddleware(PERMISSIONS.LEAVE_APPROVE),
	leaveController.approveLeaveRequest,
);
router.post(
	'/:id/reject',
	permissionMiddleware(PERMISSIONS.LEAVE_REJECT),
	leaveController.rejectLeaveRequest,
);

module.exports = router;

