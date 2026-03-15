// server.js
// Entry point for local runtime. Keeps app creation in app.js so serverless platforms can import the app safely.

require('dotenv').config();

const app = require('./app');

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`HRMS backend server is running on port http://localhost:${PORT}`);
    console.log(`API documentation is available at http://localhost:${PORT}/api-docs`);
  });
}

module.exports = app;

