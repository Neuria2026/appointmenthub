# AppointmentHub Deployment Guide

## Frontend — Vercel

### 1. Deploy to Vercel

```bash
cd frontend
npm run build  # Verify build works locally first

# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### 2. Environment Variables (Vercel Dashboard)

Go to your project → Settings → Environment Variables:

| Variable | Value |
|----------|-------|
| `VITE_API_BASE_URL` | `https://your-backend.railway.app` |
| `VITE_GOOGLE_CLIENT_ID` | Your Google Client ID |

### 3. Build Settings

- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### 4. Custom Domain (Optional)

In Vercel dashboard → Domains → Add your domain.

---

## Backend — Railway

### 1. Deploy to Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Create project
cd backend
railway init

# Deploy
railway up
```

### 2. Add PostgreSQL Plugin

In Railway dashboard:
- Click **+ New** → **Database** → **PostgreSQL**
- Railway automatically sets `DATABASE_URL`

### 3. Environment Variables (Railway Dashboard)

Go to your service → Variables:

| Variable | Value |
|----------|-------|
| `JWT_SECRET` | Generate strong 64-char secret |
| `JWT_EXPIRATION` | `15m` |
| `REFRESH_TOKEN_EXPIRATION` | `7d` |
| `FRONTEND_URL` | `https://your-app.vercel.app` |
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `GOOGLE_CLIENT_ID` | Your Google Client ID |
| `GOOGLE_CLIENT_SECRET` | Your Google Client Secret |
| `GOOGLE_REDIRECT_URI` | `https://your-backend.railway.app/api/auth/google/callback` |
| `TWILIO_ACCOUNT_SID` | Your Twilio SID |
| `TWILIO_AUTH_TOKEN` | Your Twilio Token |
| `TWILIO_WHATSAPP_NUMBER` | `whatsapp:+14155238886` |
| `TELEGRAM_BOT_TOKEN` | Your Bot Token |
| `ANTHROPIC_API_KEY` | Your Anthropic Key |
| `SENDGRID_API_KEY` | Your SendGrid Key |
| `SENDGRID_FROM_EMAIL` | `noreply@yourdomain.com` |

### 4. Run Migrations

In Railway shell or via CLI:

```bash
railway run psql $DATABASE_URL < database/migrations/001_initial_schema.sql
```

---

## Alternative: Docker Compose (Self-hosted)

### docker-compose.yml
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: appointmenthub
      POSTGRES_USER: app
      POSTGRES_PASSWORD: securepassword
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./backend/database/migrations:/docker-entrypoint-initdb.d

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      DATABASE_URL: postgresql://app:securepassword@postgres:5432/appointmenthub
      # ... other env vars
    depends_on:
      - postgres

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      VITE_API_BASE_URL: http://localhost:5000

volumes:
  pgdata:
```

---

## Production Checklist

- [ ] `JWT_SECRET` is at least 64 random characters
- [ ] `NODE_ENV=production` is set
- [ ] Database SSL is enabled (`?sslmode=require`)
- [ ] CORS `FRONTEND_URL` matches production frontend URL
- [ ] All API keys are set (skip optional ones if not using)
- [ ] Google OAuth redirect URIs include production URLs
- [ ] Rate limiting is configured
- [ ] Database backups are enabled (Railway auto-backups)
