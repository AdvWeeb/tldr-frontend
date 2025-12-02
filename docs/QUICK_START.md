# Frontend Backend Integration - Quick Start

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis (optional - can use in-memory cache)
- Docker (optional, for easy DB setup)

## Quick Start (Both Services)

### Option 1: Using npm scripts

```bash
# Terminal 1 - Start backend
cd tldr-backend
npm install
docker compose up -d  # Start PostgreSQL + Redis
cp .env.example .env  # Configure environment
npm run start:dev

# Terminal 2 - Start frontend
cd Ga03
npm install
cp .env.example .env  # Default config works for dev
npm run dev
```

### Option 2: Using PowerShell

```powershell
# Start backend
cd tldr-backend
npm install
docker compose up -d
Copy-Item .env.example .env
npm run start:dev

# New terminal
cd ..\Ga03
npm install
Copy-Item .env.example .env
npm run dev
```

## Access Points

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/v1
- **Swagger Docs**: http://localhost:3000/api/docs

## Test Login

For quick testing without Gmail:

1. Go to http://localhost:5173
2. Click "Sign In"
3. Use any valid email format (e.g., test@example.com)
4. Use any password (min 6 characters)
5. Backend will create a mock account

## Environment Variables

### Backend (tldr-backend/.env)

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=tldr
DATABASE_SYNC=true
DATABASE_AUTOLOAD=true

# Redis (optional - leave empty to use in-memory cache)
REDIS_HOST=
REDIS_PORT=

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_ACCESS_TOKEN_TTL=900
JWT_REFRESH_TOKEN_TTL=604800

# Encryption (for storing OAuth tokens)
ENCRYPTION_KEY=32-character-encryption-key!!

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5173/auth/callback

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# App Config
PORT=3000
NODE_ENV=development
```

### Frontend (Ga03/.env)

```env
# API Base URL
VITE_API_BASE_URL=http://localhost:3000/v1

# Google OAuth
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_GOOGLE_REDIRECT_URI=http://localhost:5173/auth/callback
```

## Integration Status

### ✅ Completed

- JWT Authentication (login, register, token refresh)
- Email/Password authentication
- **Google OAuth 2.0 with PKCE** - Full Authorization Code flow
- User profile management (/users/me endpoint)
- Session restoration on page refresh
- Mailbox listing (connected Gmail accounts)
- Email fetching with pagination
- Email updates (read, star, pin, task status)
- Email deletion
- Mailbox sync triggering
- Token refresh with rotation
- Axios interceptor for automatic token refresh
- CORS configuration (environment-driven)
- Error handling

### ❌ Not Implemented Yet

- Email composition/sending
- Attachment downloads in UI
- Real-time email notifications (WebSocket/SSE)
- AI features (summarization, urgency scoring)
- Search functionality
- Email filters beyond basic params

## API Endpoints Available

### Authentication

- `POST /v1/auth/register` - Create new account
- `POST /v1/auth/login` - Login with email/password
- `POST /v1/auth/google` - Google OAuth (needs OAuth flow)
- `POST /v1/auth/refresh` - Refresh access token
- `POST /v1/auth/logout` - Revoke refresh token

### User

- `GET /v1/users/me` - Get current user profile (used by session restoration)
- `PATCH /v1/users/me` - Update user profile

### Mailboxes

- `GET /v1/mailboxes` - List connected mailboxes
- `GET /v1/mailboxes/:id` - Get mailbox details
- `POST /v1/mailboxes/connect/gmail` - Connect Gmail account
- `POST /v1/mailboxes/:id/sync` - Trigger sync
- `DELETE /v1/mailboxes/:id` - Disconnect mailbox

### Emails

- `GET /v1/emails` - List emails (with filters & pagination)
- `GET /v1/emails/:id` - Get email details
- `PATCH /v1/emails/:id` - Update email properties
- `DELETE /v1/emails/:id` - Soft delete email

### Attachments

- `GET /v1/attachments/:id` - Download attachment

## Troubleshooting

### Backend won't start

```bash
# Check PostgreSQL is running
docker compose ps

# Check logs
docker compose logs postgres

# Restart services
docker compose restart
```

### Frontend can't connect to backend

1. Verify backend is running: http://localhost:3000/api/docs
2. Check Vite proxy configuration in `vite.config.ts`
3. Check browser console for CORS errors

### Authentication issues

1. Clear localStorage: `localStorage.clear()`
2. Restart both services
3. Check JWT_SECRET matches between backend and frontend expectations

## Development Workflow

1. Make changes to backend code → Auto-reload via `nest start --watch`
2. Make changes to frontend code → Auto-reload via Vite HMR
3. Test API endpoints in Swagger: http://localhost:3000/api/docs
4. Use React Query Devtools to inspect cache state

## Production Deployment

See [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) for detailed production setup instructions.

## Need Help?

- Backend API Docs: http://localhost:3000/api/docs
- Backend README: ../tldr-backend/README.md
- Backend PRD: ../tldr-backend/PRD.md
- Integration Guide: ./INTEGRATION_GUIDE.md
