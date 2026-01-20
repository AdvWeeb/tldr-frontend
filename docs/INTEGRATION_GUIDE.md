# Frontend-Backend Integration Guide

This document explains how the frontend (tldr) integrates with the backend (tldr-backend).

## Architecture Overview

- **Frontend**: React + Vite running on `http://localhost:5173`
- **Backend**: NestJS API running on `http://localhost:3000`
- **Communication**: REST API with JWT authentication

## Setup Instructions

### 1. Backend Setup

```bash
cd tldr-backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your PostgreSQL, Redis, and Google OAuth credentials

# Start infrastructure (PostgreSQL + Redis)
docker compose up -d

# Run database migrations
npm run typeorm:run

# Start backend server
npm run start:dev
```

Backend will run on `http://localhost:3000` with Swagger docs at `http://localhost:3000/api/docs`.

### 2. Frontend Setup

```bash
cd tldr

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# The default configuration uses Vite proxy - no changes needed for development

# Start frontend dev server
npm run dev
```

Frontend will run on `http://localhost:5173`.

## Authentication Flow

### Email/Password Login

1. User enters email/password on login page
2. Frontend calls `POST /v1/auth/login` with credentials
3. Backend validates and returns:
   ```json
   {
     "userId": 1,
     "email": "user@example.com",
     "tokens": {
       "accessToken": "eyJhbGci...",
       "expiresIn": 900,
       "tokenType": "Bearer"
     },
     "refreshToken": "uuid:tokenId"
   }
   ```
4. Frontend stores:
   - Access token in memory (Zustand store)
   - Refresh token in localStorage
5. Frontend fetches user profile from `GET /v1/users/me`

### Google OAuth Login

1. User clicks "Sign in with Google" button
2. Frontend generates PKCE code_verifier and code_challenge
3. Frontend redirects to Google OAuth URL with challenge
4. User approves permissions on Google consent screen
5. Google redirects back to `/auth/callback?code=...&state=...`
6. Frontend validates state parameter (CSRF protection)
7. Frontend sends code and codeVerifier to `POST /v1/auth/google`
8. Backend exchanges code for Google tokens (server-to-server)
9. Backend stores Google refresh token (encrypted in database)
10. Backend returns app tokens (same format as email/password login)
11. Frontend stores tokens and redirects to dashboard

**Note**: See `docs/OAUTH_GUIDE.md` for complete OAuth implementation details.

### Session Restoration

When user refreshes the page or returns to the app:

1. `AuthProvider` component checks localStorage for refresh token
2. If found, calls `POST /v1/auth/refresh`
3. Backend validates refresh token and returns new tokens
4. Frontend calls `GET /v1/users/me` to fetch user profile
5. Session is restored automatically (user stays logged in)

This happens transparently on every app load.

### Token Refresh

1. When access token expires (401 response), axios interceptor triggers
2. Frontend calls `POST /v1/auth/refresh` with refresh token
3. Backend returns new access token AND new refresh token (rotation)
4. Frontend updates both tokens
5. Original request is retried with new token

### Logout

1. User clicks logout
2. Frontend calls `POST /v1/auth/logout` with refresh token
3. Backend revokes the refresh token
4. Frontend clears all stored tokens and redirects to login

## Email Operations

### Fetching Mailboxes

```typescript
// Frontend
const { data: mailboxes } = useMailboxes();

// Backend endpoint
GET /v1/mailboxes
// Returns array of connected Gmail accounts
```

### Fetching Emails

```typescript
// Frontend
const { data: emails } = useEmails({
  mailboxId: 1,
  page: 1,
  limit: 50,
  isRead: false,
  category: 'primary'
});

// Backend endpoint
GET /v1/emails?mailboxId=1&page=1&limit=50&isRead=false&category=primary
// Returns paginated email list with metadata
```

### Updating Email

```typescript
// Frontend
const { mutate: updateEmail } = useEmailMutations();
updateEmail({ 
  id: 123, 
  data: { 
    isRead: true, 
    isStarred: true,
    taskStatus: 'todo' 
  }
});

// Backend endpoint
PATCH /v1/emails/123
// Updates email properties
```

### Syncing Mailbox

```typescript
// Frontend
const { mutate: syncMailbox } = useEmailMutations();
syncMailbox(mailboxId);

// Backend endpoint
POST /v1/mailboxes/{mailboxId}/sync
// Triggers incremental sync with Gmail
```

## API Client Configuration

### Development Proxy

Vite is configured to proxy `/v1` requests to the backend:

```typescript
// vite.config.ts
server: {
  proxy: {
    '/v1': {
      target: 'http://localhost:3000',
      changeOrigin: true,
    },
  },
}
```

This means frontend can make requests to `/v1/auth/login` and Vite will forward them to `http://localhost:3000/v1/auth/login`.

### Production Build

For production, update `VITE_API_BASE_URL` in `.env` to point to your deployed backend:

```bash
VITE_API_BASE_URL=https://api.yourdomain.com/v1
```

## Data Adapters

The frontend uses adapter utilities to convert backend data structures to frontend types:

```typescript
// Backend types (from NestJS API)
interface BackendEmail {
  id: number;
  fromEmail: string;
  fromName: string | null;
  // ...
}

// Frontend types (for React components)
interface FrontendEmail {
  id: string;
  sender: {
    name: string;
    email: string;
    avatar?: string;
  };
  // ...
}

// Adapter function
export const adaptBackendEmailToFrontend = (email: BackendEmail): FrontendEmail => {
  // Convert backend format to frontend format
};
```

## Error Handling

### Authentication Errors

- **401 Unauthorized**: Token expired → Auto-refresh via interceptor
- **401 on refresh**: Invalid refresh token → Logout and redirect to login
- **403 Forbidden**: Insufficient permissions → Show error message

### API Errors

All API errors are caught and displayed with appropriate user feedback:

```typescript
const loginMutation = useLogin();

if (loginMutation.isError) {
  // Display error message
  console.error(loginMutation.error.message);
}
```

## State Management

### Global State (Zustand)

```typescript
// Auth state
interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  // ...actions
}
```

### Server State (React Query)

```typescript
// Email data cached and automatically refetched
const { data, isLoading, error } = useEmails(params);

// Mutations invalidate related queries
const { mutate } = useEmailMutations();
```

## Known Limitations

1. **Component Types**: Some components temporarily use 'any' for props due to mismatches between mock and backend types. Needs proper type definitions.

2. **Real-time Updates**: Email sync is triggered manually or on schedule. No WebSocket/SSE for real-time updates yet.

3. **Attachment Downloads**: Backend API supports attachments, but frontend UI for download is not fully implemented.

4. **AI Features**: Backend has fields for AI summary/urgency, but AI processing is not implemented yet.

## Testing

### Manual Testing

1. Start both backend and frontend
2. Register a new account via `POST /v1/auth/register`
3. Login with credentials
4. Connect a Gmail account (requires OAuth setup)
5. View synced emails in the dashboard

### Using Swagger

Backend API documentation is available at `http://localhost:3000/api/docs` for testing endpoints directly.

## Troubleshooting

### CORS Errors

Backend CORS is configured via environment variables. In `tldr-backend/.env`:

```env
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

The backend reads this and splits by comma to allow multiple origins. Restart backend after changing.

### Connection Refused

- Verify backend is running on port 3000
- Check PostgreSQL and Redis are running
- Verify environment variables in backend `.env`

### Token Refresh Loop

If you see infinite refresh attempts:
- Check refresh token is being stored correctly
- Verify backend refresh endpoint returns new tokens
- Check for clock skew between frontend/backend

## Next Steps

1. ~~**Implement Google OAuth Flow**~~: ✅ COMPLETED - Full Authorization Code flow with PKCE
2. **Fix Component Types**: Replace 'any' with proper type definitions
3. **Add Email Composer**: Implement sending emails via Gmail API
3. **Real-time Sync**: Add WebSocket for instant email notifications
4. **AI Integration**: Implement email summarization and urgency scoring
5. **Attachment Handling**: Complete attachment download/preview UI
