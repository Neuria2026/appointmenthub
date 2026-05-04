# AppointmentHub API Reference

Base URL: `http://localhost:5000/api`

All protected routes require: `Authorization: Bearer <token>`

---

## Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | No | Register new user |
| POST | `/auth/login` | No | Login and get tokens |
| POST | `/auth/refresh` | No | Refresh access token |
| POST | `/auth/logout` | Yes | Logout current user |
| GET | `/auth/me` | Yes | Get current user |
| GET | `/auth/google/callback` | No | Google OAuth callback |

### POST /auth/register
```json
{
  "full_name": "Juan García",
  "email": "juan@example.com",
  "password": "SecurePass123",
  "role": "client"
}
```

**Response 201:**
```json
{
  "success": true,
  "user": { "id": "...", "email": "...", "role": "client", ... },
  "token": "eyJ...",
  "refresh_token": "eyJ..."
}
```

### POST /auth/login
```json
{ "email": "juan@example.com", "password": "SecurePass123" }
```

---

## Appointments

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/appointments` | Yes | Get user's appointments (paginated) |
| GET | `/appointments/:id` | Yes | Get single appointment |
| POST | `/appointments` | Yes | Create new appointment |
| PUT | `/appointments/:id` | Yes | Update appointment |
| DELETE | `/appointments/:id` | Yes | Cancel/delete appointment |
| POST | `/appointments/:id/complete` | Yes | Mark appointment as completed |
| GET | `/appointments/availability` | Yes | Get available time slots |

### Query Parameters (GET /appointments)
| Param | Type | Description |
|-------|------|-------------|
| status | string | Filter by status (pending/confirmed/completed/cancelled/all) |
| start_date | ISO date | Filter by start date |
| end_date | ISO date | Filter by end date |
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 10) |

### POST /appointments
```json
{
  "service_id": "uuid",
  "start_time": "2026-05-10T10:00:00Z",
  "end_time": "2026-05-10T10:30:00Z",
  "notes": "Primera visita"
}
```

### GET /appointments/availability?service_id=uuid&date=2026-05-10
Returns array of time slots with availability status.

---

## Users

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users/:id` | Yes | Get user profile |
| PUT | `/users/:id` | Yes | Update user profile |
| GET | `/users/:id/appointments` | Yes | Get user's appointments |
| GET | `/users/:id/services` | Yes | Get provider's services |
| POST | `/users/:id/services` | Yes | Create service (providers) |
| DELETE | `/services/:serviceId` | Yes | Delete service |

---

## Notifications

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/notifications/preferences` | Yes | Get notification preferences |
| PUT | `/notifications/preferences` | Yes | Update notification preferences |
| GET | `/notifications/history` | Yes | Get notification history |

### PUT /notifications/preferences
```json
{
  "channels": ["whatsapp", "email"],
  "reminder_times": [15, 60, 1440],
  "phone_whatsapp": "+52551234567",
  "telegram_id": "123456789"
}
```

---

## Chat (AI Assistant)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/chat` | Yes | Send message to AI |
| GET | `/chat/:appointmentId` | Yes | Get chat history for appointment |

### POST /chat
```json
{
  "message": "¿Cuándo es mi próxima cita?",
  "appointment_id": "uuid (optional)",
  "history": [
    { "role": "user", "content": "Hola" },
    { "role": "assistant", "content": "¡Hola! ¿En qué te puedo ayudar?" }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tu próxima cita es el martes 10 de mayo a las 10:00.",
  "appointment_id": "uuid or null"
}
```

---

## Reviews

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/appointments/:id/reviews` | Yes | Create review for appointment |
| GET | `/appointments/:id/reviews` | Yes | Get review for appointment |
| GET | `/users/:id/reviews` | Yes | Get all reviews for provider |

### POST /appointments/:id/reviews
```json
{
  "rating": 5,
  "comment": "Excelente servicio"
}
```

---

## Calendar

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/calendar/auth-url` | Yes | Get Google OAuth URL |
| GET | `/calendar/status` | Yes | Get sync status |
| DELETE | `/calendar/disconnect` | Yes | Disconnect Google Calendar |
| POST | `/calendar/sync` | Yes | Force sync |

---

## Services (Global)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/services` | Yes | Get all available services |
| POST | `/services` | Yes | Create service (providers) |
| DELETE | `/services/:id` | Yes | Delete service |

---

## Error Responses

All errors follow this format:
```json
{
  "success": false,
  "error": "ErrorCode",
  "message": "Human readable message"
}
```

| Status | Code | Description |
|--------|------|-------------|
| 400 | ValidationError | Invalid input data |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | NotFound | Resource not found |
| 409 | TimeConflict | Time slot not available |
| 429 | TooManyRequests | Rate limit exceeded |
| 500 | InternalServerError | Server error |
