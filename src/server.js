// server.js
// This file bootstraps and configures the Express HTTP server for the HRMS backend.
// It is responsible for loading middleware, registering routes, wiring global error handling, and starting the application.

require('dotenv').config();

const cookieParser = require('cookie-parser');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');

const authRoutes = require('./routes/auth.routes');
const employeeRoutes = require('./routes/employee.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const leaveRoutes = require('./routes/leave.routes');
const errorMiddleware = require('./middleware/error.middleware');
const swaggerSpec = require('./config/swagger');
const { corsOrigins } = require('./config/app');

const app = express();

const corsOptions = {
  credentials: true,
  origin(origin, callback) {
    if (!origin || corsOrigins.length === 0 || corsOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
};

// Core middleware
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'HRMS API is running',
  });
});

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Route registrations
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);

// 404 handler
app.use((req, res, next) => {
  const error = new Error('Route not found');
  error.statusCode = 404;
  next(error);
});

// Global error handler
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`HRMS backend server is running on port http://localhost:${PORT}`);
  console.log(`API documentation is available at http://localhost:${PORT}/api-docs`);
});

