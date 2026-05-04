# AppointmentHub

A full-stack SaaS appointment management platform with AI-powered chat, multi-channel notifications, and Google Calendar integration.

## Tech Stack

**Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Zustand, TanStack Query, React Hook Form, Zod, Recharts

**Backend:** Express.js, Node.js ESM, PostgreSQL, JWT, bcryptjs, node-cron

**Integrations:** Google Calendar API, Twilio (WhatsApp), Telegram Bot API, SendGrid (Email), Anthropic Claude AI

## Quick Start

### Prerequisites
- Node.js >= 18
- PostgreSQL >= 14

### 1. Clone and install dependencies

```bash
# Frontend
cd frontend && npm install

# Backend
cd backend && npm install
```

### 2. Set up PostgreSQL

```bash
createdb appointmenthub
psql appointmenthub < backend/database/migrations/001_initial_schema.sql
```

### 3. Configure environment variables

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Edit both .env files with your credentials
```

### 4. Start development servers

```bash
# Backend (port 5000)
cd backend && npm run dev

# Frontend (port 3000)
cd frontend && npm run dev
```

### 5. Seed sample data (optional)

```bash
cd backend && npm run seed
```

## Features

- **Appointment Management** - Full CRUD with conflict detection
- **Multi-Channel Notifications** - WhatsApp, Telegram, and Email reminders
- **Google Calendar Sync** - Auto-sync appointments to Google Calendar
- **AI Chat Assistant** - Claude-powered assistant for appointment help
- **Role-Based Access** - Client and provider roles with different dashboards
- **Analytics Dashboard** - Charts for appointments and revenue trends
- **Review System** - Star ratings and comments after completed appointments

## Test Accounts (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Provider | dr.garcia@example.com | Provider123! |
| Client | juan.perez@example.com | Client123! |

## Project Structure

```
appointmenthub/
├── frontend/         # React + TypeScript frontend
├── backend/          # Express.js backend
├── docs/             # Documentation
└── .gitignore
```

## Documentation

- [Setup Guide](docs/SETUP.md)
- [API Reference](docs/API.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
