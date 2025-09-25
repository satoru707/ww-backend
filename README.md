WealthWave Backend 🌊💰

WealthWave is a modern personal finance app built with NestJS, Prisma, and PostgreSQL. Track transactions, manage budgets, invest smartly, pay bills, and join community challenges—all with blazing-fast performance thanks to Prisma Accelerate. 🚀

📋 Table of Contents

✨ Features

🛠️ Tech Stack

📋 Prerequisites

⚙️ Setup

🗄️ Prisma Configuration

🏃‍♂️ Running the Application

📚 Database Schema

⚡ Prisma Accelerate

🌐 API Endpoints

🧪 Testing

🤝 Contributing

📜 License

✨ Features

🔒 User Management: Secure registration, login, and email confirmation with JWT and 2FA.

💸 Transactions: Track expenses/income, sync with banks via Plaid.

📊 Budgets: Set monthly category-based budgets with alerts.

📈 Investments: Manage portfolios with real-time data (Alpha Vantage/CoinGecko).

💳 Bill Payments: Process payments via Stripe.

🌍 Community: Share posts and join savings challenges with leaderboards.

🤖 Analytics: AI-driven insights for spending and investments.

🌱 Sustainability: Track transaction carbon footprints.

🛡️ Security: Audit logs, rate-limiting, and secure token handling.

🛠️ Tech Stack

Technology

Version

Purpose

Node.js

18+

Runtime environment

NestJS

10+

Backend framework (TypeScript)

Prisma

5+

ORM with Accelerate

PostgreSQL

13+

Relational database

PNPM

8+

Package manager

JWT/bcrypt

-

Authentication and hashing

Plaid

-

Bank transaction sync

Stripe

-

Payment processing

Nodemailer

-

Email notifications

Redis

-

Optional caching/leaderboards

MongoDB

-

Optional analytics logs

📋 Prerequisites

Node.js: v18+ (Install)

PNPM: Install globally: npm install -g pnpm

PostgreSQL: v13+, running locally or hosted (e.g., Render, Supabase)

Prisma Data Platform: Account for Prisma Accelerate

Environment Variables: See .env.example

⚙️ Setup

Clone the Repository:

git clone <repository-url>
cd wealthwave-backend

Install Dependencies:

pnpm install

Configure Environment Variables: Copy .env.example to .env and fill in:

DATABASE_URL="prisma://accelerate.prisma-data.net/?api_key=**API_KEY**"
DIRECT_DATABASE_URL="postgresql://user:password@host:port/db_name?schema=public"
JWT_SECRET="your-jwt-secret"
PLAID_CLIENT_ID="your-plaid-client-id"
PLAID_SECRET="your-plaid-secret"
STRIPE_SECRET_KEY="your-stripe-secret-key"
NODEMAILER_AUTH_USER="your-email"
NODEMAILER_AUTH_PASS="your-email-password"

Set Up Prisma: Generate the Prisma Client and sync the schema:

pnpm prisma

This runs:

prisma generate: Creates the client in ../generated/prisma.

prisma db push: Applies the schema to PostgreSQL. Or run individually:

pnpm prisma generate
pnpm prisma db push

Verify Database: Ensure PostgreSQL is accessible via DIRECT_DATABASE_URL. The db push command creates tables and indexes.

🗄️ Prisma Configuration

The schema.prisma file defines the database structure with optimizations for performance and scalability.

Datasource

datasource db {
provider = "postgresql"
url = env("DATABASE_URL") // Prisma Accelerate
directUrl = env("DIRECT_DATABASE_URL") // Direct PostgreSQL
}

url: Routes queries through Accelerate for connection pooling/caching.

directUrl: Used for migrations (prisma db push) and introspection (prisma db pull).

Key Features

Models: Define tables like User, Token, Transactions, etc.

model User {
id String @id @default(cuid())
email String @unique
password String
status UserStatus @default(PENDING)
createdAt DateTime @default(now())
@@index([email])
}

Indexes (@@index):

Optimize queries for fields like email, user_id, date.

Example: @@index([email]) speeds up prisma.user.findUnique({ where: { email } }).

Naming (@@map):

Maps model/field names to database tables/columns (e.g., UserProfile @@map("users")).

Not used currently, as names align (e.g., User → users).

Enums: Constrain values (e.g., UserStatus: PENDING, ACTIVE).

CUID: Compact, unique IDs via @default(cuid()).

Prisma Client

Generated in ../generated/prisma.

Extended with @prisma/extension-accelerate for caching/pooling.

📖 View Full Schema Example

model Token {
id String @id @default(cuid())
user_id String
user User @relation(fields: [user_id], references: [id], onDelete: Cascade)
token String
type TokenType
createdAt DateTime @default(now())
expiresAt DateTime
@@index([user_id])
@@index([token])
}

🏃‍♂️ Running the Application

Development Mode:

pnpm start:dev

Runs at http://localhost:3000 with hot-reload.

Production Build:

pnpm build
pnpm start:prod

Explore Database:

pnpm prisma studio

Opens a web interface to browse data.

📚 Database Schema

The schema supports WealthWave’s features:

Model

Purpose

Key Fields

User

User profiles

email, password, status

Token

JWT refresh, confirmation tokens

token, type, expiresAt

Transactions

Expense/income tracking

user_id, amount, date

Goals

Financial goals

target_amount, deadline

Budget

Monthly budgets

category, limit_amount

Investment

Portfolio management

symbol, purchase_price

Payment

Bill payments

amount, stripe_payment_id

CommunityPost

Community engagement

content, user_id

Challenge

Savings challenges

name, start_date

SustainabilityScore

Carbon footprint tracking

carbon_score, transaction_id

Optimizations:

Indexes: @@index([user_id]) for fast user-specific queries.

Relations: Foreign keys (e.g., user_id) with onDelete: Cascade.

Schema Sync: pnpm prisma db push applies changes.

⚡ Prisma Accelerate

Prisma Accelerate provides connection pooling and global caching for serverless scalability.

Setup

Install Extension:

pnpm add @prisma/extension-accelerate @prisma/client@latest

Configure Client:

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

Enable Accelerate:

Sign up at prisma.io.

Add DIRECT_DATABASE_URL and get DATABASE_URL from the Prisma Data Platform.

Caching

Cache read-heavy queries:

await prisma.transactions.findMany({
where: { user_id: userId },
cacheStrategy: { ttl: 3600, swr: 500 }, // 1-hour cache
});

🌐 API Endpoints

Endpoint

Method

Description

Auth

/auth/register

POST

Register user, send confirmation

None

/auth/confirm?token=<uuid>

GET

Confirm email, activate account

None

/auth/login

POST

Generate JWT

None

/auth/resend-confirmation

POST

Resend confirmation email

None

/transactions

GET

Fetch user transactions (cached)

JWT

/transactions/sync

POST

Sync bank transactions (Plaid)

JWT

/budgets?month=2025-09

GET

Fetch monthly budgets

JWT

Example:

curl -X POST http://localhost:3000/auth/register \
 -H "Content-Type: application/json" \
 -d '{"email":"test@example.com","password":"pass123","name":"Test"}'

🧪 Testing

Unit Tests:

pnpm test

Database Queries: Verify @@index usage:

EXPLAIN SELECT \* FROM transactions WHERE user_id = 'uuid';

Performance: Monitor cache hits in the Prisma Data Platform dashboard.

🤝 Contributing

Fork the repo.

Create a branch: git checkout -b feature/your-feature.

Commit: git commit -m "Add feature".

Push: git push origin feature/your-feature.

Open a pull request.

📜 License

MIT License. See LICENSE.

🌟 Join the WealthWave revolution!
File issues or suggest features on GitHub. Let’s make finance fun and accessible! 💸🚀
