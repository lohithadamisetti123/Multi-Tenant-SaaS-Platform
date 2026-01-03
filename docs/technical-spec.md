

# Project Structure & Development Setup Guide

---

## Project Structure

The project follows a **clean, modular, and scalable structure**, separating backend and frontend concerns. This organization improves maintainability, readability, and team collaboration.

---

## Backend Project Structure

```
backend/
├── src/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   ├── utils/
│   ├── config/
│   ├── validations/
│   └── app.js
├── migrations/
├── seeders/
├── tests/
├── .env
├── package.json
└── server.js
```

### Purpose of Backend Folders

* **src/**
  Contains the core application source code.

* **controllers/**
  Handles incoming HTTP requests and sends responses. Controllers coordinate between routes and services without containing business logic.

* **models/**
  Defines database models and schema representations. Each model maps to a database table or entity.

* **routes/**
  Defines API endpoints and maps them to controller functions. Routes are grouped by modules such as auth, users, tenants, and projects.

* **middleware/**
  Contains reusable middleware such as authentication (JWT verification), role-based authorization, request validation, and error handling.

* **services/**
  Holds business logic and complex operations. This layer keeps controllers thin and improves testability.

* **utils/**
  Contains helper functions such as token generation, password hashing, logging utilities, and common constants.

* **config/**
  Stores configuration files for database connections, environment settings, and third-party integrations.

* **validations/**
  Defines request validation schemas to ensure correct and secure input data.

* **migrations/**
  Contains database migration files used to create and modify database schemas.

* **seeders/**
  Holds seed scripts to populate initial or test data.

* **tests/**
  Contains unit and integration tests for APIs, services, and middleware.

* **server.js**
  Entry point that starts the backend server.

---

## Frontend Project Structure

```
frontend/
├── src/
│   ├── components/
│   ├── pages/
│   ├── layouts/
│   ├── services/
│   ├── hooks/
│   ├── context/
│   ├── routes/
│   ├── utils/
│   ├── assets/
│   └── App.js
├── public/
├── .env
├── package.json
└── index.js
```

### Purpose of Frontend Folders

* **src/**
  Contains all frontend application logic.

* **components/**
  Reusable UI components such as buttons, modals, forms, and tables.

* **pages/**
  Page-level components representing routes like login, dashboard, users, and projects.

* **layouts/**
  Layout components that define common page structures such as headers, sidebars, and footers.

* **services/**
  Handles API calls and communication with the backend.

* **hooks/**
  Custom React hooks for reusable logic such as authentication state or data fetching.

* **context/**
  Manages global state using React Context (e.g., user session, tenant context).

* **routes/**
  Defines application routes and protected route handling.

* **utils/**
  Utility functions such as date formatting, role checks, and constants.

* **assets/**
  Static assets like images, icons, and styles.

* **public/**
  Contains static files and the root HTML file.

---

## Development Setup Guide

### Prerequisites

Ensure the following are installed on your system:

* **Node.js**: v18 or higher
* **npm**: v9 or higher
* **PostgreSQL**: v13 or higher
* **Git**: Latest version
* **Code Editor**: VS Code (recommended)

---

### Environment Variables

Create a `.env` file in both backend and frontend directories.

#### Backend `.env`

```
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/dbname
JWT_SECRET=your_jwt_secret
JWT_EXPIRY=1d
NODE_ENV=development
```

#### Frontend `.env`

```
REACT_APP_API_BASE_URL=http://localhost:5000/api
```

---

### Installation Steps

#### Backend Setup

```bash
cd backend
npm install
```

#### Frontend Setup

```bash
cd frontend
npm install
```

---

### How to Run Locally

#### Run Backend

```bash
cd backend
npm run dev
```

Backend will run at:
`http://localhost:5000`

#### Run Frontend

```bash
cd frontend
npm start
```

Frontend will run at:
`http://localhost:3000`

---

### How to Run Database Migrations

```bash
cd backend
npm run migrate
```

---

### How to Run Tests

#### Backend Tests

```bash
cd backend
npm test
```

#### Frontend Tests

```bash
cd frontend
npm test
```

---

## Conclusion

This project structure and setup ensure a **clean separation of concerns**, **scalability**, and **ease of development**. The modular design allows teams to work independently on backend and frontend while maintaining consistency and maintainability.

