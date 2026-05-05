# Onboarding de Nuevo Cliente

Tiempo estimado: 30 minutos

---

## 1. Datos del cliente

Recopilar antes de empezar:

- [ ] Nombre de la empresa/negocio (ej: "Clínica García")
- [ ] Dominio propio (ej: `citas.clinicagarcia.com`) o usar subdominio de Neurian (ej: `garcia.neurian.es`)
- [ ] Email de soporte/notificaciones
- [ ] API keys que quiera activar (Anthropic, Twilio, Telegram, SendGrid)

---

## 2. Crear proyecto en Railway (backend + base de datos)

1. Ir a railway.app → **New Project** → **Deploy from GitHub** → seleccionar `appointmenthub`
2. Configurar servicio backend:
   - **Root Directory:** `backend`
   - **Start Command:** `node scripts/migrate.js && node src/index.js`
3. Añadir base de datos: **+ New** → **Database** → **PostgreSQL**
4. En **Variables** del backend, añadir:

```
APP_NAME=<nombre del negocio>
JWT_SECRET=<generar string aleatorio de 40+ caracteres>
JWT_EXPIRATION=15m
REFRESH_TOKEN_EXPIRATION=7d
NODE_ENV=production
FRONTEND_URL=https://<dominio del cliente>
PORT=5000
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Opcionales según lo que contrate:
ANTHROPIC_API_KEY=<su key>
TWILIO_ACCOUNT_SID=<su sid>
TWILIO_AUTH_TOKEN=<su token>
TWILIO_WHATSAPP_NUMBER=whatsapp:+<numero>
TELEGRAM_BOT_TOKEN=<su token>
SENDGRID_API_KEY=<su key>
SENDGRID_FROM_EMAIL=<email remitente>
```

5. Generar dominio público en Railway: **Settings** → **Domains** → **Generate Domain**
6. Anotar la URL del backend: `https://xxxx.up.railway.app`

---

## 3. Crear proyecto en Vercel (frontend)

1. Ir a vercel.com → **Add New Project** → importar `appointmenthub`
2. Configurar:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite (se detecta automáticamente)
3. En **Environment Variables**, añadir:

```
VITE_API_BASE_URL=https://<url-railway-del-backend>
VITE_APP_NAME=<nombre del negocio>
VITE_TELEGRAM_BOT_USERNAME=<usuario del bot si tiene Telegram>
```

4. Hacer **Deploy**
5. Cuando termine, ir a **Settings** → **Domains** → añadir el dominio del cliente

---

## 4. Configurar DNS en el proveedor del cliente

Añadir registro CNAME en su proveedor de dominio:
- **Host:** el subdominio (ej: `citas`)
- **Valor:** `cname.vercel-dns.com`
- **TTL:** 3600

Esperar 5-30 minutos para propagación.

---

## 5. Verificación final

- [ ] Abrir `https://<dominio-cliente>` → carga la app con el nombre correcto
- [ ] Crear cuenta de prueba → registro funciona
- [ ] Iniciar sesión → llega al dashboard
- [ ] (Si tiene IA) Probar el chat → responde correctamente
- [ ] Eliminar cuenta de prueba o entregarla al cliente como cuenta admin

---

## Costes mensuales por cliente

| Servicio | Coste |
|----------|-------|
| Railway (backend + BD) | ~$5/mes |
| Vercel (frontend) | Gratis |
| **Total infraestructura** | **~$5/mes** |

Sugerencia de precio al cliente: $49-99/mes según funcionalidades activadas.
