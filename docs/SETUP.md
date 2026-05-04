# AppointmentHub Setup Guide

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL >= 14
- (Optional) Twilio account for WhatsApp notifications
- (Optional) Telegram Bot token
- (Optional) SendGrid account for email
- (Optional) Google Cloud project with Calendar API
- (Optional) Anthropic API key for AI chat

## Step 1: Clone & Install

```bash
git clone https://github.com/your-org/appointmenthub.git
cd appointmenthub

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

## Step 2: PostgreSQL Setup

```bash
# Create database
createdb appointmenthub

# Run migrations
psql -U your_user -d appointmenthub -f backend/database/migrations/001_initial_schema.sql

# Seed sample data (optional)
cd backend && npm run seed
```

## Step 3: Backend Environment Variables

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
DATABASE_URL=postgresql://your_user:your_password@localhost:5432/appointmenthub
JWT_SECRET=generate-a-32-char-secret-here
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Google Calendar (Optional)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project and enable Calendar API
3. Create OAuth2 credentials
4. Set redirect URI to `http://localhost:5000/api/auth/google/callback`

```env
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback
```

### Twilio WhatsApp (Optional)
1. Create account at [twilio.com](https://twilio.com)
2. Get Account SID and Auth Token
3. Join the WhatsApp sandbox

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxx
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

### Telegram Bot (Optional)
1. Message [@BotFather](https://t.me/BotFather) on Telegram
2. Create a bot with `/newbot`
3. Copy the token

```env
TELEGRAM_BOT_TOKEN=123456:ABCdefGhi
```

### SendGrid Email (Optional)
1. Create account at [sendgrid.com](https://sendgrid.com)
2. Create an API key with Mail Send permissions
3. Verify your sender email

```env
SENDGRID_API_KEY=SG.xxxxxxxx
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
```

### Anthropic AI Chat (Optional)
1. Get API key from [console.anthropic.com](https://console.anthropic.com)

```env
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxx
```

## Step 4: Frontend Environment Variables

```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000
```

## Step 5: Run Development Servers

**Backend:**
```bash
cd backend
npm run dev
# Server starts at http://localhost:5000
```

**Frontend:**
```bash
cd frontend
npm run dev
# App opens at http://localhost:3000
```

## Verify Installation

1. Open [http://localhost:3000](http://localhost:3000) — should show landing page
2. Go to [http://localhost:5000/health](http://localhost:5000/health) — should return `{"status":"ok",...}`
3. Register a new account or use seeded credentials

## Common Issues

**PostgreSQL connection error:** Verify `DATABASE_URL` format and that PostgreSQL is running.

**CORS errors:** Make sure `FRONTEND_URL` in backend `.env` matches the frontend URL.

**JWT errors:** Ensure `JWT_SECRET` is at least 32 characters long.
