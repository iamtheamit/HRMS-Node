// leave.routes.js
// This routes file defines HTTP endpoints for leave management such as creating, approving, rejecting, and listing leave requests.
// It is responsible for mapping leave-related URLs to controller handlers and applying authentication.

const express = require('express');
const leaveController = require('../controllers/leave.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/', leaveController.createLeaveRequest);
router.get('/', leaveController.listLeaveRequests);
router.post('/:id/approve', leaveController.approveLeaveRequest);
router.post('/:id/reject', leaveController.rejectLeaveRequest);

module.exports = router;

