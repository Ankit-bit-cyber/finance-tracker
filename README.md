# 💰 Personal Finance Tracker

> A full-stack web application to track income, expenses, budgets, and investments — built with Node.js, Express, and PostgreSQL.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.18-000000?style=flat&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-4169E1?style=flat&logo=postgresql&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-orange?style=flat&logo=jsonwebtokens)
![Google OAuth](https://img.shields.io/badge/OAuth-Google-4285F4?style=flat&logo=google)
![SendGrid](https://img.shields.io/badge/Email-SendGrid-00B2FF?style=flat&logo=sendgrid)

---

## 📌 Table of Contents

- [Overview](#overview)
- [Live Demo](#live-demo)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Edge Cases Handled](#edge-cases-handled)
- [Screenshots](#screenshots)
- [Deployment](#deployment)

---

## 🔍 Overview

Personal Finance Tracker is a comprehensive full-stack web application that helps users manage their financial health. Users can track income and expenses, set category-wise budgets, generate monthly and yearly reports, upload receipts, convert currencies, and receive email alerts when budgets are exceeded.

Built as part of the **FJ-BE-R2 Backend Developer Round 2 Assignment**.

---

## ✨ Features

### Day 1-2 — Core Features
- ✅ **User Authentication** — Register & login with JWT tokens, secure password hashing (bcrypt)
- ✅ **Transaction Management** — Add, edit, delete income & expense transactions with filters and pagination
- ✅ **Category Management** — System default + custom user categories with emoji icons
- ✅ **Dashboard** — Real-time financial overview with Chart.js bar chart and donut chart
- ✅ **Monthly & Yearly Reports** — Visual reports with daily breakdown and category analysis
- ✅ **Budget Goals** — Set monthly budgets per category with progress tracking and overrun detection

### Day 3 — Additional Features
- ✅ **Google OAuth** — One-click sign in with Google
- ✅ **Email Notifications** — Budget overrun alerts via SendGrid with nightly cron job
- ✅ **Receipt Uploading** — Attach and manage receipts for transactions (JPEG, PNG, PDF)
- ✅ **Multi-Currency** — 10+ currencies with live exchange rates and auto-conversion

### Day 4 — Deployment
- ✅ **Production Ready** — Configured for Render / Railway / Heroku deployment

### Day 5 — Testing
- ✅ **Jest Tests** — Unit tests for decimal precision and budget calculations
- ✅ **Integration Tests** — Auth, Transactions, and Budgets API tests with Supertest

### Bonus
- ✅ **Animated Landing Page** — 3D particle animation with floating currency symbols
- ✅ **Responsive UI** — Clean, modern design with Glassmorphism navbar

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js v18+ |
| Framework | Express.js 4.18 |
| Database | PostgreSQL 14+ (raw SQL, no ORM) |
| Authentication | JWT + Passport.js (Google OAuth 2.0) |
| Email | SendGrid (Twilio) |
| File Upload | Multer |
| Validation | Joi |
| Decimal Math | decimal.js |
| Scheduling | node-cron |
| Logging | Winston |
| Testing | Jest + Supertest |
| Frontend | Vanilla HTML/CSS/JS + Chart.js |

---

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- PostgreSQL 14+
- npm

### 1. Clone the Repository

```bash
git clone https://github.com/Ankit-bit-cyber/finance-tracker.git
cd finance-tracker
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment

```bash
cp .env.example .env
# Fill in your values (see Environment Variables section)
```

### 4. Create Database

```bash
createdb finance_tracker
```

### 5. Run Migrations

```bash
npm run migrate
```

### 6. Start Development Server

```bash
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## ⚙️ Environment Variables

```env
# Server
PORT=3000
NODE_ENV=development

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=finance_tracker
DB_USER=your_pg_username
DB_PASSWORD=
DB_SSL=false

# JWT
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_EXPIRES_IN=7d

# Session (for OAuth)
SESSION_SECRET=your_session_secret

# Google OAuth
# Get from: https://console.cloud.google.com
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# SendGrid Email
# Get from: https://sendgrid.com
SENDGRID_API_KEY=SG.your_key_here
FROM_EMAIL=your_verified_email@gmail.com
FROM_NAME=Finance Tracker

# Currency Exchange API
# Get from: https://app.exchangerate-api.com (free tier)
EXCHANGE_RATE_API_KEY=your_key_here
EXCHANGE_RATE_BASE_URL=https://v6.exchangerate-api.com/v6

# File Uploads
UPLOAD_DIR=uploads
MAX_FILE_SIZE_MB=5

# App URL
APP_URL=http://localhost:3000
```

> **Note:** In development, `SENDGRID_API_KEY` and `EXCHANGE_RATE_API_KEY` can be left blank. App uses mock rates and logs emails to console.

---

## 📋 NPM Commands

| Command | Description |
|---|---|
| `npm run dev` | Start with nodemon (auto-reload) |
| `npm start` | Start production server |
| `npm run migrate` | Run all DB migrations + seed default categories |
| `npm test` | Run all Jest tests |
| `npm run test:watch` | Run tests in watch mode |

---

## 📡 API Documentation

All protected routes require header: `Authorization: Bearer <token>`

### Auth Routes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Register with email + password |
| POST | `/api/auth/login` | ❌ | Login, receive JWT token |
| GET | `/api/auth/me` | ✅ | Get current user profile |
| PUT | `/api/auth/profile` | ✅ | Update name / base currency |
| PUT | `/api/auth/change-password` | ✅ | Change password |
| GET | `/api/auth/google` | ❌ | Initiate Google OAuth |
| GET | `/api/auth/google/callback` | ❌ | Google OAuth callback |

### Transaction Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/transactions` | List with filters & pagination |
| GET | `/api/transactions/:id` | Get single transaction |
| POST | `/api/transactions` | Create transaction |
| PUT | `/api/transactions/:id` | Update transaction |
| DELETE | `/api/transactions/:id` | Delete transaction |

**Query Params:** `type`, `category_id`, `start_date`, `end_date`, `sort`, `order`, `page`, `limit`

### Other Routes
GET/POST/PUT/DELETE /api/categories
GET/POST/PUT/DELETE /api/budgets
GET /api/dashboard/summary
GET /api/reports/monthly?month=7&year=2025
GET /api/reports/yearly?year=2025
GET/POST/DELETE /api/receipts
GET/PUT /api/notifications
GET /api/currencies
GET /api/currencies/convert?from=USD&to=INR&amount=100
GET /api/health


## 🛡 Edge Cases Handled

| Case | Solution |
|------|----------|
| Zero amount | Rejected by Joi + DB CHECK constraint |
| Negative amount | Allowed — treated as refund |
| Decimal precision | `decimal.js` library — never native JS floats for money |
| Delete category with transactions | Transactions set to NULL, not deleted |
| Duplicate email registration | 409 Conflict response |
| Multi-currency transactions | Stored in original + converted to user base currency |
| Budget alerts | Sent only once per period via `alerted` flag |
| SQL injection | Parameterized queries throughout |
| Rate limiting | 20 requests / 15 min on auth routes |
| Expired JWT | 401 Unauthorized response |
| Invalid UUID | 400 Bad Request via PostgreSQL error handling |

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Unit tests only
npx jest tests/unit

# Integration tests only
npx jest tests/integration
```

**Test Coverage:**
- ✅ Auth — register, login, duplicate email, weak password, JWT guard
- ✅ Transactions — CRUD, zero amount, negative/refund, cross-user access prevention
- ✅ Budgets — create, progress calculation, negative amount rejection
- ✅ Unit — decimal precision, money arithmetic, budget progress logic

---

## 🌐 Deployment

### Render.com (Recommended — Free Tier)

1. Push code to GitHub
2. Go to [render.com](https://render.com) → **New Web Service**
3. Connect your GitHub repo
4. Set commands:
5. Add **PostgreSQL** database on Render
6. Set all environment variables in Render dashboard
7. Set `DB_SSL=true` for Render's managed Postgres

---

## 👨‍💻 Author

**Ankit Kumar**
- GitHub: [@Ankit-bit-cyber](https://github.com/Ankit-bit-cyber)
- Repository: [finance-tracker](https://github.com/Ankit-bit-cyber/finance-tracker)

---

*Assignment: FJ-BE-R2 — Backend Developer Round 2*