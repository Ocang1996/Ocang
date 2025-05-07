# ASN Dashboard Backend Server

Backend server for ASN (Aparatur Sipil Negara) Dashboard application, providing APIs for employee management, statistics, and user administration.

## Technologies Used

- Node.js with Express.js
- TypeScript
- MongoDB with Mongoose
- JWT Authentication
- REST API

## Project Structure

```
server/
├── dist/             # Compiled JavaScript output
├── src/              # TypeScript source code
│   ├── middleware/   # Express middleware
│   ├── models/       # Mongoose data models
│   ├── routes/       # API routes
│   └── index.ts      # Main application entry point
├── .env              # Environment variables (not committed to git)
├── .env.example      # Example environment variables
├── package.json      # Dependencies and scripts
└── tsconfig.json     # TypeScript configuration
```

## Available API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get auth token

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID (admin only)
- `PUT /api/users/:id` - Update user (admin only)
- `DELETE /api/users/:id` - Delete user (superadmin only)
- `POST /api/users/change-password` - Change password (for self)
- `POST /api/users/reset-password/:id` - Reset user password (admin only)

### Employees
- `GET /api/employees` - Get all employees
- `GET /api/employees/:id` - Get employee by ID
- `POST /api/employees` - Create a new employee
- `PUT /api/employees/:id` - Update an employee
- `DELETE /api/employees/:id` - Delete an employee

### Work Units
- `GET /api/work-units` - Get all work units
- `GET /api/work-units/:id` - Get work unit by ID
- `GET /api/work-units/children/:id` - Get child units for a parent unit
- `GET /api/work-units/top-level` - Get all top-level work units
- `GET /api/work-units/tree` - Get hierarchical tree of work units
- `POST /api/work-units` - Create a new work unit
- `PUT /api/work-units/:id` - Update a work unit
- `DELETE /api/work-units/:id` - Delete a work unit

### Statistics
- `GET /api/stats/dashboard` - Get all dashboard statistics

### Health Check
- `GET /api/health` - Check server status

## Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB

### Installation

1. Clone the repository
2. Navigate to the server directory
3. Install dependencies:
   ```
   npm install
   ```
4. Copy `.env.example` to `.env` and configure environment variables:
   ```
   cp .env.example .env
   ```
5. Run the development server:
   ```
   npm run dev
   ```

### Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build production-ready code
- `npm start` - Run production server

## Authentication and Authorization

The API uses JWT (JSON Web Token) for authentication. Protected routes require an `x-auth-token` header with a valid token.

### User Roles

There are three user roles with different permissions:

1. **User** - Basic access to view data
2. **Admin** - Can manage employees and users
3. **Superadmin** - Full system access, including user role management

## Models

### User
- Username, password, email, name, role

### Employee
- Personal details, employment information, education, etc.

### WorkUnit
- Organizational structure with hierarchical relationships 