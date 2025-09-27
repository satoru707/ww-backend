# 🌊💰 WealthWave Backend(IN PRODUCTION)

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


## 📜 License
MIT License. See LICENSE.
##

🌟 Build the future of finance with WealthWave!
Join us on GitHub to contribute or report issues. Let’s make money management awesome 💸🚀

```
