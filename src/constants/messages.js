// messages.js
// This constants file centralizes all user-facing success and error messages for the HRMS backend.
// It is responsible for providing reusable, descriptive messages so that controllers and middleware never hardcode strings.

const AUTH_MESSAGES = {
  TOKEN_MISSING: 'Authorization token is missing',
  INVALID_TOKEN: 'Invalid or expired token',
  LOGIN_SUCCESS: 'User logged in successfully',
  REGISTER_SUCCESS: 'User registered successfully',
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_ALREADY_REGISTERED: 'Email is already registered',
};

const EMPLOYEE_MESSAGES = {
  CREATE_SUCCESS: 'Employee created successfully',
  FETCH_ALL_SUCCESS: 'Employees fetched successfully',
  FETCH_ONE_SUCCESS: 'Employee fetched successfully',
  UPDATE_SUCCESS: 'Employee updated successfully',
  DELETE_SUCCESS: 'Employee deleted successfully',
  NOT_FOUND: 'Employee not found',
};

const ATTENDANCE_MESSAGES = {
  CHECK_IN_SUCCESS: 'Check-in successful',
  CHECK_OUT_SUCCESS: 'Check-out successful',
  FETCH_ALL_SUCCESS: 'Attendance records fetched successfully',
  ALREADY_CHECKED_IN: 'Employee already checked in for today',
  NO_CHECKIN_FOUND: 'No check-in record found for today',
  ALREADY_CHECKED_OUT: 'Employee already checked out for today',
};

const LEAVE_MESSAGES = {
  CREATE_SUCCESS: 'Leave request created successfully',
  FETCH_ALL_SUCCESS: 'Leave requests fetched successfully',
  APPROVE_SUCCESS: 'Leave request approved successfully',
  REJECT_SUCCESS: 'Leave request rejected successfully',
  NOT_FOUND: 'Leave request not found',
  ONLY_PENDING_MUTABLE: 'Only pending leave requests can be modified',
};

const COMMON_MESSAGES = {
  HEALTH_OK: 'HRMS API is running',
  ROUTE_NOT_FOUND: 'Route not found',
  INTERNAL_SERVER_ERROR: 'Internal server error',
};

module.exports = {
  AUTH_MESSAGES,
  EMPLOYEE_MESSAGES,
  ATTENDANCE_MESSAGES,
  LEAVE_MESSAGES,
  COMMON_MESSAGES,
};

