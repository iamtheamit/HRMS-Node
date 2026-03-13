// README.md
// This file documents the HRMS backend project setup, technologies, and how each layer in the architecture should be used.
// It is responsible for guiding developers on installation, configuration, and high-level system behavior.

## HRMS Backend (Node + Express + PostgreSQL + Prisma)

This is a production-ready Human Resource Management System (HRMS) backend built with:

- **Node.js**
- **Express.js**
- **PostgreSQL**
- **Prisma ORM**
- **JWT authentication**
- **bcrypt for password hashing**

It follows a **Controller → Service → Repository** architecture with clear separation of concerns.

### Project Structure

```text
HRMS-Node
├── prisma
│   └── schema.prisma
│
├── src
│   ├── server.js
│   ├── config
│   │     └── prisma.js
│   ├── routes
│   │     ├── auth.routes.js
│   │     ├── employee.routes.js
│   │     ├── attendance.routes.js
│   │     └── leave.routes.js
│   ├── controllers
│   │     ├── auth.controller.js
│   │     ├── employee.controller.js
│   │     ├── attendance.controller.js
│   │     └── leave.controller.js
│   ├── services
│   │     ├── auth.service.js
│   │     ├── employee.service.js
│   │     ├── attendance.service.js
│   │     └── leave.service.js
│   ├── repositories
│   │     ├── auth.repository.js
│   │     ├── employee.repository.js
│   │     ├── attendance.repository.js
│   │     └── leave.repository.js
│   ├── middleware
│   │     ├── auth.middleware.js
│   │     └── error.middleware.js
│   └── utils
│         └── response.js
│
├── .env
├── package.json
└── README.md
```

### Getting Started

1. **Install dependencies**

```bash
npm install
```

2. **Configure environment**

Update `.env` with your own values:

- `PORT`
- `DATABASE_URL`
- `JWT_SECRET`

3. **Prisma setup**

```bash
npx prisma generate
npx prisma migrate dev --name init
```

4. **Run the application**

```bash
npm run dev
```

### API Overview

- **Auth**
  - `POST /api/auth/register`
  - `POST /api/auth/login`

- **Employees** (protected with JWT)
  - `GET /api/employees`
  - `GET /api/employees/:id`
  - `POST /api/employees`
  - `PUT /api/employees/:id`
  - `DELETE /api/employees/:id`

- **Attendance** (protected with JWT)
  - `POST /api/attendance/check-in`
  - `POST /api/attendance/check-out`
  - `GET /api/attendance`

- **Leave Management** (protected with JWT)
  - `POST /api/leaves`
  - `POST /api/leaves/:id/approve`
  - `POST /api/leaves/:id/reject`
  - `GET /api/leaves`

### Architecture Notes

- **Controllers**: Handle HTTP-layer concerns only (request parsing, response formatting), delegating business logic to services.
- **Services**: Contain business rules, validation, and orchestration logic; they call repositories for data access.
- **Repositories**: Encapsulate all Prisma queries and data persistence logic.
- **Middleware**: Implement cross-cutting concerns like authentication and error handling.
- **Utils**: Provide shared helpers such as standardized response formatting.

