# 🌐 Multi-Tenant SaaS Platform

> **A scalable, container-first SaaS system for managing organizations, projects, and tasks with enforced tenant isolation.**

This project is a full-stack Software-as-a-Service application that allows multiple organizations to coexist on the same platform while maintaining **strict data separation**. It is designed to demonstrate real-world SaaS architecture patterns such as **multi-tenancy**, **access control**, **subscription enforcement**, and **automated infrastructure setup**.

![Build](https://img.shields.io/badge/build-stable-brightgreen)
![Dockerized](https://img.shields.io/badge/docker-enabled-blue)
![PostgreSQL](https://img.shields.io/badge/database-postgresql-informational)

---

## 🎥 Application Demo

📌 **Complete walkthrough & system explanation**
👉 [https://youtu.be/h9bwxlI3I4I](https://youtu.be/h9bwxlI3I4I)

---

## ✨ Platform Capabilities

### 🏢 Tenant-Aware System Design

* Uses a **single database with shared schema**
* Every request is automatically scoped using `tenantId`
* Prevents cross-tenant access at the ORM level

### 🔐 Access Control & Authorization

* Role-based permissions enforced on every endpoint
* Supported roles:

  * **System Admin** – platform-wide control
  * **Organization Admin** – tenant-level management
  * **Member** – limited project/task access

### 📊 Subscription Enforcement

* Organization plans define limits:

  * Maximum users
  * Maximum projects
* API rejects creation once limits are exceeded

### 🔑 Secure Authentication

* JWT-based authentication
* Tokens expire after 24 hours
* Passwords encrypted using bcrypt hashing

### 🐳 Docker-First Deployment

* Entire system runs via Docker Compose
* Backend, frontend, and database are isolated services
* Backend startup waits for database readiness

### 🗄️ Persistent Storage

* PostgreSQL data stored using named Docker volumes
* Database state survives restarts and rebuilds

### 🔄 Zero-Touch Initialization

* Database migrations run automatically on startup
* Seed data loads without manual intervention
* No local SQL setup required

### 🛡️ Security Enhancements

* Secure HTTP headers via Helmet
* CORS policy enforced
* API input validation applied consistently

### 💻 Responsive Web Interface

* Modern React SPA
* Role-aware navigation
* Clean, responsive UI using Tailwind CSS

---

## 🧰 Technology Stack

### Frontend

* React 18 (Vite)
* JavaScript (ES6+)
* Tailwind CSS
* Axios
* Lucide Icons

### Backend

* Node.js 18
* Express.js
* PostgreSQL 15
* Sequelize ORM
* JWT Authentication

### Infrastructure

* Docker
* Docker Compose
* Alpine Linux images

---

## 🧱 System Architecture

The platform follows a layered architecture:

1. **Client Layer** – React frontend (Port 3000)
2. **API Layer** – Express backend (Port 5000)
3. **Persistence Layer** – PostgreSQL database (Port 5432)

📄 Detailed diagrams are available in `docs/architecture.md`

---

## 🚀 Running the Project Locally

### Requirements

* Docker Desktop
* Git

### Setup Instructions

**1️⃣ Clone the Repository**

```bash
git clone https://github.com/lohithadamisetti123/Multi-Tenant-SaaS-Platform.git
cd enhanced-saas-platform
```

**2️⃣ Start All Services**

```bash
docker-compose up -d --build
```

This will:

* Build all images
* Start containers
* Apply database migrations
* Insert seed data

**3️⃣ Verify Services**

* Backend health: [http://localhost:5000/api/health](http://localhost:5000/api/health)
* Frontend UI: [http://localhost:3000](http://localhost:3000)

**4️⃣ Stop Services**

```bash
docker-compose down
```

Add `-v` to remove stored database data.

---

## ⚙️ Configuration

Environment variables are handled internally via Docker Compose.

| Variable     | Purpose           | Default                                      |
| ------------ | ----------------- | -------------------------------------------- |
| PORT         | API Port          | 5000                                         |
| DB_HOST      | DB Service        | database                                     |
| DB_PORT      | DB Port           | 5432                                         |
| DB_NAME      | Database Name     | multi_tenant_db                                      |
| DB_USER      | DB User           | postgres                                     |
| DB_PASSWORD  | DB Password       | lohitha                                     |
| JWT_SECRET   | Token Signing Key | internal_secret                              |
| FRONTEND_URL | Allowed Origin    | [http://frontend:3000](http://frontend:3000) |

---

## 📘 API Reference

Complete API details are documented in `docs/API.md`.

### Example Endpoints

| Method | Route                     | Description           |
| ------ | ------------------------- | --------------------- |
| POST   | /api/auth/login           | Authenticate user     |
| POST   | /api/auth/register-tenant | Create organization   |
| GET    | /api/projects             | Fetch tenant projects |
| POST   | /api/projects             | Create project        |
| GET    | /api/tenants              | List all tenants      |

---

## 🧪 Demo Accounts (Auto-Generated)

These users are created automatically during startup.

### Organization Admin

* Email: `admin@demo.com`
* Password: `Demo@123`
* Tenant: `demo`

### Standard User

* Email: `user1@demo.com`
* Password: `User@123`
* Tenant: `demo`

### System Admin

* Email: `superadmin@system.com`
* Password: `Admin@123`

---

## 📁 Repository Layout

```bash
enhanced-saas-platform/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── scripts/
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── api/
│   └── Dockerfile
├── docs/
├── docker-compose.yml
└── submission.json
```

