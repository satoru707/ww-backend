# 🌊💰 WealthWave Backend

WealthWave is a modern personal finance application powered by **NestJS, Prisma## 📋 Prerequisites

1. **Required Software**
   - Node.js (v18 or higher)
   - PNPM (v8 or higher)
   - PostgreSQL (v13 or higher)
   - MongoDB (v6 or higher)
   - Redis (v6 or higher)

2. **Required Accounts/Services**
   - PostgreSQL database
   - MongoDB instance
   - Redis instance
   - SMTP server for emails

---

## 🚀 Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/wealthwave-backend.git
   cd wealthwave-backend
   ```

2. **Install Dependencies**
   ```bash
   pnpm install
   ```

3. **Configure Environment**
   Create a .env file with the following variables:
   ```env
   # App
   PORT=3000
   NODE_ENV=development

   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/wealthwave"
   MONGO_URI="mongodb://localhost:27017/wealthwave"

   # Redis
   REDIS_HOST="localhost"
   REDIS_PORT=6379

   # JWT
   JWT_SECRET="your-secret-key"
   JWT_REFRESH_SECRET="your-refresh-secret"

   # Email
   SMTP_HOST=smtp.example.com
   SMTP_PORT=587
   SMTP_USER=your-email
   SMTP_PASS=your-password
   ```

4. **Database Setup**
   ```bash
   pnpm prisma generate
   pnpm prisma migrate dev
   ```

5. **Start the Application**
   ```bash
   # Development
   pnpm start:dev

   # Production
   pnpm build
   pnpm start:prod
   ```

---

## 📁 Project Structure

```
src/
├── app.module.ts              # Main application module
├── main.ts                   # Application entry point
├── common/                   # Shared utilities and helpers
├── module/                   # Feature modules
│   ├── auth/                # Authentication module
│   ├── user/                # User management
│   ├── family/              # Family management
│   ├── budget/              # Budget tracking
│   ├── investment/          # Investment management
│   ├── goal/                # Financial goals
│   ├── transactions/        # Transaction tracking
│   ├── debtplan/           # Debt management
│   ├── notification/        # Notifications
│   └── audit_log/          # Audit logging
├── services/                # Shared services
└── types/                   # TypeScript type definitions
```

---

## 🔒 Security Features

- **Authentication**
  - JWT-based authentication with refresh tokens
  - Two-factor authentication support
  - Password hashing with bcrypt
  - Email verification

- **Authorization**
  - Role-based access control
  - Guard-based route protection
  - Resource ownership validation

- **Data Protection**
  - Request rate limiting
  - Input validation and sanitization
  - SQL injection prevention via Prisma
  - XSS protection

- **Audit & Monitoring**
  - Comprehensive audit logging
  - User activity tracking
  - Error logging and monitoring
  - Security event notifications

---

## 📝 API Documentation

API documentation is available via Swagger UI at `/api/docs` when running in development mode.

Key API Endpoints:

- **Authentication**
  - POST /auth/register
  - POST /auth/login
  - POST /auth/refresh
  - POST /auth/logout

- **User Management**
  - GET /user/me
  - PATCH /user/me
  - GET /user/export

- **Family Management**
  - POST /family
  - GET /family
  - PATCH /family/:id
  - POST /family/member

- **Financial Management**
  - Transactions: CRUD at /transactions
  - Budgets: CRUD at /budget
  - Investments: CRUD at /investment
  - Goals: CRUD at /goal
  - Debt Plans: CRUD at /debit-plan

---

## 🔄 Caching Strategy

WealthWave implements a sophisticated caching strategy using Redis:

1. **User-Aware Caching**
   - Cache keys include user IDs for isolation
   - Automatic cache invalidation on updates
   - Configurable TTL for different data types

2. **Cache Areas**
   - User profiles and preferences
   - Family data and members
   - Financial transactions
   - Investment portfolios
   - Budget information

3. **Cache Management**
   - Automatic cache clearing on updates
   - Cache versioning for updates
   - Configurable cache timeouts

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

Please ensure your PR:
- Follows the existing code style
- Includes tests if applicable
- Updates documentation as needed
- Describes the changes made

---

## 📜 License

MIT License. See LICENSE file for details.

---

🌟 Built with ❤️ by the WealthWave Team*. 
It enables users to track transactions, manage budgets, invest, pay bills, and participate in family finances, with advanced caching and performance optimizations. 🚀

---

## 📑 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Setup](#-setup)
- [Project Structure](#-project-structure)
- [Modules](#-modules)
- [Caching Strategy](#-caching-strategy)
- [Security](#-security)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### Core Features
- 🔒 **Advanced Authentication**
  - JWT-based authentication with refresh tokens
  - Two-factor authentication (2FA)
  - Email verification system
  - Role-based access control (User, Family Admin, Admin)

- �‍👩‍👧‍👦 **Family Management**
  - Create and manage family groups
  - Add family members
  - Shared financial tracking
  - Family admin privileges

- � **Financial Management**
  - Transaction tracking with categories
  - Budget planning and monitoring
  - Investment portfolio tracking
  - Debt management plans
  - Financial goal setting

- � **Monitoring & Analytics**
  - Comprehensive audit logging
  - User activity tracking
  - Financial reports and insights
  - Push notifications for important events

### Technical Features
- 🚀 **Performance Optimizations**
  - Redis-based caching with user-aware cache keys
  - Request throttling for API security
  - Efficient database queries with Prisma

- 🔐 **Security Features**
  - JWT token rotation
  - Rate limiting
  - Role-based authorization
  - Audit logging for sensitive operations

- � **Real-time Updates**
  - Push notifications
  - Real-time financial data updates
  - Instant family member synchronization

---

## 🏗 Architecture

WealthWave follows a modular monolith architecture using NestJS modules:

- **Core Modules**
  - Auth Module: Handles authentication and authorization
  - User Module: User management and profiles
  - Family Module: Family group management
  - Notification Module: Real-time notifications
  - Audit Log Module: System-wide activity tracking

- **Financial Modules**
  - Transaction Module: Financial transaction management
  - Budget Module: Budget planning and tracking
  - Investment Module: Investment portfolio management
  - Goal Module: Financial goal setting and tracking
  - Debt Plan Module: Debt management and planning

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|----------|
| Node.js | 18+ | Runtime environment |
| NestJS | 10+ | Backend framework |
| Prisma | 5+ | Database ORM |
| PostgreSQL | 13+ | Primary database |
| MongoDB | 6+ | Audit & notification storage |
| Redis | 6+ | Caching layer |
| PNPM | 8+ | Package manager |
| TypeScript | 5+ | Programming language |

---

## 📋 Prerequisites

- **Node.js**: v18+ → [Install](https://nodejs.org/)
- **PNPM**: Install globally → `npm install -g pnpm`
- **PostgreSQL**: v13+, running locally or hosted (Render, Supabase, etc.)
- **Prisma Data Platform**: Account for Prisma Accelerate
- **Environment Variables**: Configure `.env` (see below)

---


## 📜 License
MIT License. See LICENSE.
##

🌟 Build the future of finance with WealthWave!
Join us on GitHub to contribute or report issues. Let’s make money management awesome 💸🚀
