// attendance.routes.js
// This routes file defines HTTP endpoints for attendance operations such as check-in, check-out, and listing records.
// It is responsible for mapping attendance-related URLs to controller handlers and enforcing authentication.

const express = require('express');
const attendanceController = require('../controllers/attendance.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/check-in', attendanceController.checkIn);
router.post('/check-out', attendanceController.checkOut);
router.get('/', attendanceController.listAttendance);

module.exports = router;

