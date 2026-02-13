# Research Document: Multi-Tenant SaaS Architecture

## 1. Multi-Tenancy Analysis

### Introduction to Multi-Tenancy

Multi-tenancy is a software architecture pattern where a single instance of a software application serves multiple customers, termed "tenants." This is a fundamental concept in Software-as-a-Service (SaaS) computing, where resources are shared to reduce costs while logical isolation is maintained to ensure security and privacy. In a multi-tenant environment, the application is designed to virtually partition its data and configuration so that each client works with a customized virtual application instance.

The primary challenge in designing a multi-tenant system is determining how to isolate tenant data. The choice of isolation strategy impacts every aspect of the system, including development complexity, infrastructure costs, scalability, security, and performance. Below, we analyze three common approaches to database multi-tenancy.

### Approach 1: Shared Database + Shared Schema

#### Description
In the "Shared Database, Shared Schema" approach, all tenants share the same database and the same set of tables. Tenant isolation is achieved purely at the application logic level. Typically, every table that contains tenant-specific data must have a `tenant_id` column (a Discriminator column). All SQL queries must include a `WHERE tenant_id = ?` clause to filter data for the current tenant.

#### Detailed Pros
1.  **Lowest Infrastructure Cost**: Since there is only one database instance to manage, hosting costs are minimized. You don't need to provision new RDS instances or schemas for new customers.
2.  **Simplified Deployment**: Database migrations are straightforward because there is only one schema to update. CI/CD pipelines are simpler as they target a single resource.
3.  **Resource Efficiency**: This approach maximizes the utilization of database resources (CPU, RAM, Connections). It is excellent for systems with thousands of small tenants (e.g., a freemium B2C app) where allocating dedicated resources per tenant would be wasteful.
4.  **Easy Cross-Tenant Analytics**: If business requirements demand aggregate reporting across all tenants (e.g., "Total users on the platform"), straightforward SQL queries can be run without complex data warehousing or ETL processes.

#### Detailed Cons
1.  **Security Risks**: This is the biggest drawback. Isolation depends entirely on the developer writing correct `WHERE` clauses. A single missing filter in an API endpoint or a bug in the ORM layer can expose one tenant's data to another. This is often unacceptable for enterprise clients with strict compliance needs (HIPAA, GDPR).
2.  **Performance "Noisy Neighbor" Effect**: A single tenant running a heavy reporting query can consume all database CPU/IO, degrading performance for all other tenants. There is no easy way to throttle database resources per tenant at the infrastructure level.
3.  **Backup and Restore Complexity**: You cannot easily restore data for a single tenant. Database backups are monolithic. If one tenant accidentally deletes their data, restoring it requires restoring the entire database to a temporary location and extracting the specific rows, which is operationally painful.
4.  **Hard Scaling Limits**: As the tables grow to millions of rows, indexes become larger and slower. While partitioning can help, eventually, the single database becomes a bottleneck that is hard to shard.

### Approach 2: Shared Database + Separate Schema

#### Description
In this hybrid approach, all tenants share the same physical database instance, but each tenant gets their own **Schema** (namespace). For example, Tenant A has tables in the `tenant_a` schema, and Tenant B has tables in the `tenant_b` schema. The application connects to the database and sets the `search_path` to the specific tenant's schema at the start of the request.

#### Detailed Pros
1.  **Stronger Isolation**: Data isolation is enforced at the database level. Even if a developer forgets a `WHERE` clause, the query will only execute against the currently active schema. It is physically impossible to query another tenant's data without explicitly changing the namespace.
2.  **Balanced Cost**: You still run a single database instance, keeping infrastructure costs low, but gain significant security benefits.
3.  **Tenant-Specific Customization**: Since each tenant has their own tables, it is possible (though not always recommended) to have custom columns or tables for specific VIP tenants without affecting the global schema.
4.  **Easier Management**: Backing up and restoring a single tenant is easier than the shared schema approach (using `pg_dump -n schema_name`). Dropping a tenant is as simple as `DROP SCHEMA tenant_name CASCADE`.

#### Detailed Cons
1.  **Schema Management Complexity**: Running migrations becomes more complex. You must iterate through all active schemas to apply updates. If a migration fails for one tenant, you need a robust rollback strategy.
2.  **Database Overhead**: PostgreSQL, for instance, stores schema metadata in the system catalog. having large numbers of schemas (e.g., 10,000+) can bloat the system catalog and degrade performance of internal database operations.
3.  **Connection Pooling Challenges**: Traditional connection poolers (like PgBouncer at the transaction level) can be tricky because the `search_path` is a session-level state. You must ensure connections are reset cleanly or use application-side pooling carefully.

### Approach 3: Separate Database per Tenant

#### Description
This is the most isolated approach. Every tenant is provisioned with their own completely separate database instance. The application maintains a mapping of Tenant ID to Database Connection String.

#### Detailed Pros
1.  **Maximum Isolation and Security**: This offers the highest level of security. There is zero chance of data leaking between tenants via SQL errors. It is the preferred choice for banking, healthcare, and government clients.
2.  **No "Noisy Neighbor"**: A heavy load on one tenant's database has zero impact on others, as they run on separate compute resources.
3.  **Independent Scalability**: You can scale resources per tenant. A large enterprise tenant can be moved to a high-performance DB instance, while free-tier tenants share a smaller instance.
4.  **Point-in-Time Recovery**: You can easily restore a specific tenant's database to a previous point in time without affecting anyone else.

#### Detailed Cons
1.  **High Infrastructure Cost**: Running a separate DB instance for every tenant is expensive. Even if using a single server with multiple DBs, the overhead is significant.
2.  **Operational Nightmare**: Managing backups, monitoring, and upgrades for hundreds of databases is complex and requires sophisticated DevOps automation.
3.  **Complex Aggregation**: running analytics across all tenants is extremely difficult. You need an external data warehouse (Snowflake, Redshift) and an ETL pipeline to aggregate data.

### Comparison Table

| Feature | Shared Schema | Separate Schema | Separate Database |
| :--- | :--- | :--- | :--- |
| **Isolation** | Low (Application Logic) | Medium (Logical Namespace) | High (Physical) |
| **Cost** | Lowest | Low | High |
| **Complexity** | Low | Medium | High |
| **Scalability** | High (until DB limit) | Medium (Catalog bloat) | High (Unlimited) |
| **Security** | Lowest | Medium | Highest |
| **Compliance** | Hard | Manageable | Easiest |

### Chosen Approach: Shared Database + Separate Schema (Simulated with Tenant ID)

For this project, we have selected a variation of **Approach 1 (Shared Database + Shared Schema)** but implemented with **Row-Level Security (RLS) principles**. Why?

1.  **Academic/Project Scope**: Implementing full schema-per-tenant requires complex migration scripts and dynamic connection management which complicates the evaluation. A Shared Schema approach is standard for demonstrating multi-tenancy concepts within a single codebase.
2.  **Cost Efficiency**: It allows the entire system to run in a single Docker container without overhead.
3.  **Development Speed**: We can use standard ORM (Sequelize) patterns.
4.  **Enforcement**: We implement strict Middleware that forces `tenant_id` injection, mimicking the safety of separate schemas.

This decision balances the need for a production-ready architecture with the constraints of a submission-based project. It effectively demonstrates the core logic of multi-tenancy (data partitioning) without the operational overhead of managing dynamic DDL operations.

---

## 2. Technology Stack Justification

### Backend: Node.js with Express
**Why Node.js?**
Node.js is built on Chrome's V8 JavaScript engine and uses an event-driven, non-blocking I/O model. This makes it lightweight and efficient, perfect for data-intensive real-time applications that run across distributed devices.
*   **Performance**: The non-blocking I/O is ideal for a SaaS platform where thousands of concurrent requests (waiting for DB queries) can be handled by a single thread without blocking.
*   **Unified Language**: Using JavaScript/TypeScript on both frontend and backend reduces context switching for developers and allows code sharing (e.g., validation types).
*   **Ecosystem**: NPM (Node Package Manager) is the largest software registry in the world. Libraries for JWT, hashing, ORM, and validation are mature and battle-tested.

**Why Express?**
Express is the de-facto standard server framework for Node.js. It is unopinionated, meaning it doesn't force a specific project structure, giving us the flexibility to architect our multi-tenant middleware exactly as needed. Its middleware pattern (`app.use()`) is perfect for intercepting requests to inject tenant context.

### Database: PostgreSQL
**Why PostgreSQL?**
PostgreSQL is the world's most advanced open-source relational database.
*   **ACID Compliance**: Critical for a SaaS platform where billing and data integrity are paramount.
*   **JSONB Support**: Allows us to store semi-structured data (like flexible tenant settings) within a relational schema, offering the best of SQL and NoSQL.
*   **Row-Level Security (RLS)**: Postgres has built-in features to restrict rows based on user context, which is the "holy grail" of multi-tenant security. While we enforce this in the app layer for this project, using Postgres creates a path to utilizing native RLS in the future.
*   **Extensions**: Extensions like `pgcrypto` (used for UUID generation) are built-in and highly performant.

### Frontend: React (Vite) + Tailwind CSS
**Why React?**
React's component-based architecture is the industry standard for building dynamic, interactive UIs.
*   **Virtual DOM**: Ensures high performance even with complex dashboards.
*   **State Management**: React's ecosystem (Context API) makes it easy to manage global state like "Current Tenant" and "User Role" across the application.
*   **Vite**: We chose Vite over Create-React-App because it uses native ES modules, resulting in instant server start and lightning-fast Hot Module Replacement (HMR).

**Why Tailwind CSS?**
Tailwind is a utility-first CSS framework. It allows us to build custom designs without leaving current HTML/JSX. This dramatically speeds up development and ensures consistency (spacing, colors) via a configuration file, which is crucial when theming for multiple tenants.

### Containerization: Docker & Docker Compose
**Why Docker?**
Docker ensures "Write once, run anywhere." It eliminates the "it works on my machine" problem.
*   **Isolation**: The database, frontend, and backend run in their own isolated environments, mimicking a production microservices architecture.
*   **Orchestration**: Docker Compose allows us to define the entire infrastructure (Db + App + UI) in a single YAML file, meeting the requirement for "one-command deployment."

---

## 3. Security Considerations

Security in a multi-tenant environment is paramount. A breach in a single-tenant app affects one customer; a breach in a multi-tenant SaaS can compromise thousands of organizations simultaneously.

### 1. Data Isolation & Leakage Prevention
*   **Risk**: The most critical risk is **Cross-Tenant Data Leakage**, where Tenant A accesses Tenant B's data.
*   **Mitigation**:
    *   **Middleware Enforcement**: We implemented a `tenantMiddleware` that extracts the `tenantId` from the JWT and attaches it to the request object.
    *   **ORM Scoping**: Every database query in the controller layer explicitly includes `where: { tenant_id: req.user.tenantId }`. We do NOT rely on client-side parameters for sensitive scopes.
    *   **Foreign Key Constraints**: The database schema strictly enforces foreign keys. A user cannot be assigned to a task that belongs to a project in a different tenant.

### 2. Authentication & Authorization
*   **Risk**: Unauthorized access and Privilege Escalation (e.g., a regular user acting as an Admin).
*   **Mitigation**:
    *   **JWT (JSON Web Tokens)**: We use stateless authentication. The token payload contains `{ userId, role, tenantId }`. This token is signed with a strong secret key (`HS256`).
    *   **Short Lived Tokens**: Tokens expire in 24 hours, limiting the window of opportunity if a token is stolen.
    *   **Role-Based Access Control (RBAC)**: We implemented granular middleware (`authorize('admin')`) that checks the user's role before processing the request. This ensures a 'user' cannot delete projects or invite members.

### 3. Password Security
*   **Risk**: Credential stuffing and database leaks exposing user passwords.
*   **Mitigation**:
    *   **Bcrypt Hashing**: We never store plain-text passwords. We use `bcrypt` (or `argon2`), which is a slow hashing algorithm designed to resist brute-force and rainbow table attacks.
    *   **Salting**: Bcrypt automatically handles salting, ensuring that two users with the same password have different hashes.

### 4. API Security
*   **Risk**: Injection attacks and DoS.
*   **Mitigation**:
    *   **Input Validation**: Although handled lightly in this prototype, production systems should use libraries like Joi/Zod to validate every input field against strict schemas.
    *   **Parameterization**: Sequelize ORM automatically parameterizes queries, protecting against SQL Injection attacks.
    *   **Helmet.js**: We use Helmet middleware to set secure HTTP headers (e.g., `X-Frame-Options`, `Strict-Transport-Security`) to prevent Clickjacking and XSS.
    *   **CORS Policy**: Cross-Origin Resource Sharing is configured to only allow requests from our specific frontend domain (or Docker service), preventing malicious websites from making requests on behalf of users.

### 5. Audit Logging
*   **Risk**: Non-repudiation (users denying they performed an action).
*   **Mitigation**: The system includes an `audit_logs` table. Critical actions (creating users, deleting projects) are logged with the `who`, `what`, `when`, and `IP address`. This is essential for post-incident foreclosure in enterprise environments.

