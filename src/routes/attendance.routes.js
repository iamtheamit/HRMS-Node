// attendance.routes.js
// This routes file defines HTTP endpoints for attendance operations such as check-in, check-out, and listing records.
// It is responsible for mapping attendance-related URLs to controller handlers and enforcing authentication.

const express = require('express');
const attendanceController = require('../controllers/attendance.controller');
const authMiddleware = require('../middleware/auth.middleware');
const permissionMiddleware = require('../middleware/permission.middleware');
const { PERMISSIONS } = require('../constants/permissions');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Attendance
 *     description: Attendance check-in/check-out and listing
 *
 * components:
 *   schemas:
 *     Attendance:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         employeeId:
 *           type: string
 *           format: uuid
 *         date:
 *           type: string
 *           format: date-time
 *         checkIn:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         checkOut:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         status:
 *           type: string
 *           enum: [PRESENT, ABSENT, LATE, HALF_DAY]
 */

/**
 * @swagger
 * /api/attendance/check-in:
 *   post:
 *     tags: [Attendance]
 *     summary: Check in for the current employee
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Checked in successfully
 */

/**
 * @swagger
 * /api/attendance/check-out:
 *   post:
 *     tags: [Attendance]
 *     summary: Check out for the current employee
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Checked out successfully
 */

/**
 * @swagger
 * /api/attendance/punch:
 *   post:
 *     tags: [Attendance]
 *     summary: Single punch endpoint (auto check-in or check-out)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Attendance updated successfully
 */

/**
 * @swagger
 * /api/attendance:
 *   get:
 *     tags: [Attendance]
 *     summary: List attendance records in actor scope
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: employeeId
 *         required: false
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Optional employee filter (subject to actor scope)
 *     responses:
 *       200:
 *         description: Attendance list fetched
 */

/**
 * @swagger
 * /api/attendance/mark:
 *   post:
 *     tags: [Attendance]
 *     summary: Mark attendance for an employee on a given date (manager/HR scope)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [employeeId, date, status]
 *             properties:
 *               employeeId:
 *                 type: string
 *                 format: uuid
 *               date:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *                 enum: [PRESENT, ABSENT, LATE, HALF_DAY]
 *     responses:
 *       200:
 *         description: Attendance marked
 */

/**
 * @swagger
 * /api/attendance/{id}/status:
 *   patch:
 *     tags: [Attendance]
 *     summary: Update status for an existing attendance record (manager/HR scope)
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
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PRESENT, ABSENT, LATE, HALF_DAY]
 *     responses:
 *       200:
 *         description: Attendance status updated
 */

router.use(authMiddleware);

router.post(
	'/punch',
	permissionMiddleware(PERMISSIONS.ATTENDANCE_CHECK_IN),
	attendanceController.punch,
);
router.post(
	'/check-in',
	permissionMiddleware(PERMISSIONS.ATTENDANCE_CHECK_IN),
	attendanceController.checkIn,
);
router.post(
	'/check-out',
	permissionMiddleware(PERMISSIONS.ATTENDANCE_CHECK_OUT),
	attendanceController.checkOut,
);
router.get(
	'/',
	permissionMiddleware(PERMISSIONS.ATTENDANCE_LIST),
	attendanceController.listAttendance,
);
router.post(
	'/mark',
	permissionMiddleware(PERMISSIONS.ATTENDANCE_UPDATE),
	attendanceController.markAttendance,
);
router.patch(
	'/:id/status',
	permissionMiddleware(PERMISSIONS.ATTENDANCE_UPDATE),
	attendanceController.updateAttendanceStatus,
);

module.exports = router;

