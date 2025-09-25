# 🌊💰 WealthWave Backend

WealthWave is a modern personal finance application powered by **NestJS, Prisma, and PostgreSQL**.  
It enables users to track transactions, manage budgets, invest, pay bills, and participate in community challenges, with **Prisma Accelerate** ensuring top-notch performance. 🚀

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Setup](#-setup)
- [Prisma Configuration](#-prisma-configuration)
- [Running the Application](#-running-the-application)
- [Database Schema](#-database-schema)
- [Prisma Accelerate](#-prisma-accelerate)
- [API Endpoints](#-api-endpoints)
- [Testing](#-testing)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

- 🔒 **Secure Authentication**: Register, login, confirm emails with JWT + 2FA support.
- 💸 **Transaction Tracking**: Record expenses/income, sync with banks via Plaid.
- 📊 **Budget Management**: Set and monitor monthly budgets by category.
- 📈 **Investment Portfolio**: Track assets with real-time data (Alpha Vantage/CoinGecko).
- 💳 **Bill Payments**: Process payments securely via Stripe.
- 🌍 **Community Engagement**: Share posts and join savings challenges.
- 🤖 **AI Analytics**: Insights into spending and investment patterns.
- 🌱 **Sustainability Scores**: Track carbon footprints of transactions.
- 🛡️ **Robust Security**: Audit logs and rate-limiting for sensitive actions.

---

## 🛠️ Tech Stack

| Technology | Version | Purpose                        |
| ---------- | ------- | ------------------------------ |
| Node.js    | 18+     | Runtime environment            |
| NestJS     | 10+     | Backend framework (TypeScript) |
| Prisma     | 5+      | ORM with Accelerate            |
| PostgreSQL | 13+     | Relational database            |
| PNPM       | 8+      | Package manager                |
| JWT/bcrypt | -       | Authentication & hashing       |
| Plaid      | -       | Bank transaction sync          |
| Stripe     | -       | Payment processing             |
| Nodemailer | -       | Email notifications            |
| Redis      | -       | Optional caching/leaderboards  |
| MongoDB    | -       | Optional analytics logs        |

---

## 📋 Prerequisites

- **Node.js**: v18+ → [Install](https://nodejs.org/)
- **PNPM**: Install globally → `npm install -g pnpm`
- **PostgreSQL**: v13+, running locally or hosted (Render, Supabase, etc.)
- **Prisma Data Platform**: Account for Prisma Accelerate
- **Environment Variables**: Configure `.env` (see below)

---

## ⚙️ Setup

**Clone the Repository:**

```bash
git clone <repository-url>
cd wealthwave-backend
Install Dependencies:

bash
Copy code
pnpm install
Configure Environment Variables:

env
Copy code
DATABASE_URL="prisma://accelerate.prisma-data.net/?api_key=__API_KEY__"
DIRECT_DATABASE_URL="postgresql://user:password@host:port/db_name?schema=public"
JWT_SECRET="your-jwt-secret"
PLAID_CLIENT_ID="your-plaid-client-id"
PLAID_SECRET="your-plaid-secret"
STRIPE_SECRET_KEY="your-stripe-secret-key"
NODEMAILER_AUTH_USER="your-email"
NODEMAILER_AUTH_PASS="your-email-password"
Set Up Prisma:

bash
Copy code
pnpm prisma
# or individually
pnpm prisma generate
pnpm prisma db push
Verify Database: Ensure PostgreSQL is accessible via DIRECT_DATABASE_URL.

🗂️ Prisma Configuration
Datasource:

prisma
Copy code
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL") // Prisma Accelerate
  directUrl = env("DIRECT_DATABASE_URL") // Direct PostgreSQL
}
Example Model:

prisma
Copy code
model User {
  id        String     @id @default(cuid())
  email     String     @unique
  password  String
  status    UserStatus @default(PENDING)
  createdAt DateTime   @default(now())
  @@index([email])
}
Token Model:

prisma
Copy code
model Token {
  id        String   @id @default(cuid())
  user_id   String
  user      User     @relation(fields: [user_id], references: [id], onDelete: Cascade)
  token     String
  type      TokenType
  createdAt DateTime @default(now())
  expiresAt DateTime
  @@index([user_id])
  @@index([token])
}
▶️ Running the Application
Development Mode:

bash
Copy code
pnpm start:dev
Runs at: http://localhost:3000

Production Build:

bash
Copy code
pnpm build
pnpm start:prod
Browse Database:

bash
Copy code
pnpm prisma studio
🗄️ Database Schema
Model	Purpose	Key Fields
User	User profiles	email, password, status
Token	JWT/confirmation	token, type, expiresAt
Transactions	Expense/income logs	user_id, amount, date
Goals	Financial goals	target_amount, deadline

Optimizations:

Indexes: @@index([user_id]) for queries.

Relations: Foreign keys with onDelete: Cascade.

⚡ Prisma Accelerate
Installation:

bash
Copy code
pnpm add @prisma/extension-accelerate @prisma/client@latest
Configuration:

ts
Copy code
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma';
import { withAccelerate } from '@prisma/extension-accelerate';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    super({ datasources: { db: { url: process.env.DATABASE_URL } } });
    this.$extends(withAccelerate());
  }
}
Caching Example:

ts
Copy code
await prisma.transactions.findMany({
  where: { user_id: userId },
  cacheStrategy: { ttl: 3600, swr: 500 },
});
📡 API Endpoints
Endpoint	Method	Description	Auth
/auth/register	POST	Register, send confirmation email	None
/auth/confirm?token=...	GET	Confirm email, activate account	None
/auth/login	POST	Generate JWT	None
/transactions	GET	Fetch transactions (cached)	JWT

Example:

bash
Copy code
curl -X POST http://localhost:3000/auth/register \
  -d '{"email":"test@example.com","password":"pass123","name":"Test"}'
🧪 Testing
Unit Tests:

bash
Copy code
pnpm test
Database Query Example:

sql
Copy code
EXPLAIN SELECT * FROM transactions WHERE user_id = 'uuid';
🤝 Contributing
Fork & create branch:

bash
Copy code
git checkout -b feature/your-feature
Commit:

bash
Copy code
git commit -m "Add feature"
Push:

bash
Copy code
git push origin feature/your-feature
Open a pull request 🎉

📜 License
MIT License. See LICENSE.

🌟 Build the future of finance with WealthWave!
Join us on GitHub to contribute or report issues. Let’s make money management awesome 💸🚀
```
