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
  EMAIL_NOT_REGISTERED: 'We could not find an account with this email address',
  REFRESH_SUCCESS: 'Token refreshed successfully',
  LOGOUT_SUCCESS: 'Logged out successfully',
  LOGOUT_ALL_SUCCESS: 'Logged out from all devices successfully',
  ACCOUNT_INACTIVE: 'Account is not activated',
  ACTIVATION_SUCCESS: 'Account activated successfully',
  INVALID_ACTIVATION_TOKEN: 'Invalid activation token',
  RESET_REQUEST_SUCCESS: 'If the email exists, a reset link has been sent',
  RESET_SUCCESS: 'Password has been reset successfully',
  INVALID_RESET_TOKEN: 'Invalid or expired reset token',
  CHANGE_PASSWORD_OTP_SENT: 'OTP has been sent to your registered email',
  CHANGE_PASSWORD_SUCCESS: 'Password changed successfully',
  INVALID_CHANGE_PASSWORD_OTP: 'Invalid or expired OTP',
  CURRENT_PASSWORD_INVALID: 'Current password is incorrect',
  REFRESH_EXPIRED: 'Refresh token expired',
};

const EMPLOYEE_MESSAGES = {
  CREATE_SUCCESS: 'Employee created successfully',
  FETCH_ALL_SUCCESS: 'Employees fetched successfully',
  FETCH_ONE_SUCCESS: 'Employee fetched successfully',
  UPDATE_SUCCESS: 'Employee updated successfully',
  DELETE_SUCCESS: 'Employee deleted successfully',
  BLOCK_SUCCESS: 'Employee blocked successfully',
  LIFECYCLE_DELETE_SUCCESS: 'Employee soft deleted successfully',
  NOT_FOUND: 'Employee not found',
};

const DEPARTMENT_MESSAGES = {
  CREATE_SUCCESS: 'Department created successfully',
  FETCH_ALL_SUCCESS: 'Departments fetched successfully',
  UPDATE_SUCCESS: 'Department updated successfully',
  ASSIGN_SUCCESS: 'Employees assigned to department successfully',
  NOT_FOUND: 'Department not found',
  NAME_EXISTS: 'Department name already exists',
  HEAD_MUST_BELONG_TO_DEPARTMENT: 'Department head must belong to this department',
};

const ATTENDANCE_MESSAGES = {
  CHECK_IN_SUCCESS: 'Check-in successful',
  CHECK_OUT_SUCCESS: 'Check-out successful',
  PUNCH_SUCCESS: 'Attendance updated successfully',
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

const MEDIA_MESSAGES = {
  UPLOAD_SUCCESS: 'Media uploaded successfully',
};

const SECURITY_MESSAGES = {
  API_KEY_MISSING: 'API key is missing',
  API_KEY_INVALID: 'Invalid API key',
  API_KEY_NOT_CONFIGURED: 'API key is not configured on the server',
};

const COMMON_MESSAGES = {
  HEALTH_OK: 'HRMS API is running',
  ROUTE_NOT_FOUND: 'Route not found',
  INTERNAL_SERVER_ERROR: 'Internal server error',
};

module.exports = {
  AUTH_MESSAGES,
  EMPLOYEE_MESSAGES,
  DEPARTMENT_MESSAGES,
  ATTENDANCE_MESSAGES,
  LEAVE_MESSAGES,
  MEDIA_MESSAGES,
  SECURITY_MESSAGES,
  COMMON_MESSAGES,
};

