// swagger.js
// This configuration file sets up Swagger/OpenAPI specification generation for the HRMS backend.
// It is responsible for defining Swagger options and exporting the generated spec for use in the Express server.

const swaggerJSDoc = require('swagger-jsdoc');

const createSwaggerSpec = (serverUrl) => swaggerJSDoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'HRMS Backend API',
      version: '1.0.0',
      description: 'API documentation for the HRMS backend built with Node.js, Express, PostgreSQL, and Prisma.',
    },
    ...(serverUrl
      ? {
          servers: [
            {
              url: serverUrl,
              description: 'Current API server',
            },
          ],
        }
      : {}),
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js'],
});

module.exports = {
  createSwaggerSpec,
};

