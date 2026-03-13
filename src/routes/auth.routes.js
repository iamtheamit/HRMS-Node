// auth.routes.js
// This routes file defines HTTP endpoints for authentication actions such as registration and login.
// It is responsible for mapping URL paths and HTTP methods to the appropriate auth controller handlers.

const express = require('express');
const authController = require('../controllers/auth.controller');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;

