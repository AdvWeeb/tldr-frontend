# System Architecture

## Overview

The application is a full-stack email client built with React frontend and NestJS backend. It implements secure OAuth 2.0 authentication with Google for Gmail access, JWT-based session management, and real-time email synchronization.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    React App                           │  │
│  │                                                         │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │  │
│  │  │   Public     │  │   Protected  │  │   Login     │ │  │
│  │  │  Dashboard   │  │    Routes    │  │    Page     │ │  │
│  │  └──────────────┘  └──────────────┘  └─────────────┘ │  │
│  │           │                 │                │         │  │
│  │           └─────────────────┴────────────────┘         │  │
│  │                           │                             │  │
│  │                  ┌────────▼────────┐                   │  │
│  │                  │  React Router   │                   │  │
│  │                  └────────┬────────┘                   │  │
│  │                           │                             │  │
│  │         ┌─────────────────┼─────────────────┐          │  │
│  │         │                 │                 │          │  │
│  │    ┌────▼─────┐    ┌─────▼──────┐   ┌─────▼──────┐   │  │
│  │    │  Zustand │    │   Axios    │   │  shadcn/ui │   │  │
│  │    │  Store   │    │  Client    │   │ Components │   │  │
│  │    └────┬─────┘    └─────┬──────┘   └────────────┘   │  │
│  │         │                 │                            │  │
│  └─────────┼─────────────────┼────────────────────────────┘  │
│            │                 │                               │
└────────────┼─────────────────┼───────────────────────────────┘
             │                 │
             │           ┌─────▼──────┐
             │           │   Mock     │
             │           │  Auth API  │
             │           └────────────┘
             │           (Will be replaced with real backend)
             │
      ┌──────▼───────┐
      │ localStorage │  (Refresh Token only)
      └──────────────┘
```

## Core Components

### 1. Authentication Layer

#### Auth Store (`src/store/authStore.ts`)
- **Technology:** Zustand (lightweight state management)
- **Responsibilities:**
  - Manage user state
  - Store access token in memory (security best practice)
  - Handle refresh token in localStorage
  - Provide logout functionality
  - Expose authentication status

**State Shape:**
```typescript
{
  user: User | null,
  accessToken: string | null,
  isAuthenticated: boolean,
  setUser: (user: User, token: string) => void,
  logout: () => void
}
```

**Security Design:**
- ✅ Access token in memory (lost on page refresh - more secure)
- ✅ Refresh token in localStorage (persists across sessions)
- ✅ Automatic token cleanup on logout
- ✅ No sensitive data in localStorage

#### API Client (`src/services/apiClient.ts`)
- **Technology:** Axios with interceptors
- **Responsibilities:**
  - Attach Bearer tokens to requests
  - Handle 401 unauthorized responses
  - Automatically refresh expired tokens
  - Queue failed requests during token refresh
  - Prevent race conditions in concurrent requests

**Request Flow:**
```
Request → Interceptor → Add Token → Backend
                ↓
         Token Expired (401)
                ↓
         Refresh Token
                ↓
         Retry Original Request
                ↓
         Queue Other Requests
```

**Key Features:**
- Request queueing during token refresh
- Race condition prevention with `isRefreshing` flag
- Automatic retry of failed requests
- Error handling and logout on refresh failure

### 2. Routing Layer

#### Route Configuration
```typescript
/ (Dashboard)          → Public, shows login button if not authenticated
/login                 → Public, redirects to / if already authenticated
/inbox                 → Protected, requires authentication
```

#### Private Route Component (`src/components/PrivateRoute.tsx`)
- Wraps protected routes
- Checks authentication status from Zustand store
- Redirects to `/login` if not authenticated
- Preserves attempted route for post-login redirect

### 3. UI Layer

#### Component Hierarchy
```
App
└── AuthProvider (Session Restoration)
    └── Router
        ├── /login → Login
        ├── /auth/callback → OAuthCallback
        ├── / → Dashboard
        │   └── Navigation
        └── /inbox → PrivateRoute
            └── Inbox
                └── Navigation
```

#### Navigation Component (`src/components/Navigation.tsx`)
- Persistent header across all pages
- Conditional rendering based on auth status:
  - **Not authenticated:** Login button
  - **Authenticated:** User avatar + dropdown menu
- Uses shadcn/ui components (Button, DropdownMenu, Avatar)

#### Pages

**Dashboard (`src/pages/Dashboard.tsx`)**
- **Access:** Public
- **Purpose:** Landing page with mail service introduction
- **Features:**
  - Hero section with gradient text
  - 6 feature cards showcasing capabilities
  - Call-to-action section
  - Responsive grid layout

**Login (`src/pages/Login.tsx`)**
- **Access:** Public
- **Purpose:** Authentication entry point
- **Features:**
  - Email/password form with validation
  - Google Sign-In button
  - Error handling and feedback
  - Redirect to dashboard after successful auth

**Inbox (`src/pages/Inbox.tsx`)**
- **Access:** Protected (requires authentication)
- **Purpose:** User's email inbox
- **Features:**
  - Personalized greeting
  - Empty state with icon
  - Card-based layout

### 4. Authentication Flow

#### Email/Password Login
```
1. User enters credentials
2. Login.tsx calls authApi.login() (POST /v1/auth/login)
3. Backend returns { user, accessToken, refreshToken }
4. Store accessToken in Zustand (memory)
5. Store refreshToken in localStorage
6. Fetch user profile from GET /v1/users/me
7. Update user state
8. Redirect to /dashboard
```

#### Google OAuth Login
```
1. User clicks "Sign in with Google"
2. Frontend generates PKCE code_verifier and code_challenge
3. Redirect to Google OAuth URL with challenge and state
4. User authorizes on Google consent screen
5. Google redirects to /auth/callback?code=...&state=...
6. OAuthCallback validates state (CSRF protection)
7. Extract code, retrieve code_verifier from sessionStorage
8. Call authApi.googleLogin({ code, codeVerifier })
9. Backend exchanges code for Google tokens (server-to-server)
10. Backend stores Google refresh token (encrypted)
11. Backend returns app tokens
12. Store tokens same as email/password
13. Redirect to /inbox
```

**See `docs/OAUTH_GUIDE.md` for complete OAuth documentation.**

#### Session Restoration (Page Refresh)
```
1. App loads, AuthProvider component mounts
2. Check localStorage for refreshToken
3. If found: call POST /v1/auth/refresh
4. Backend validates refresh token
5. Backend returns new access token AND new refresh token (rotation)
6. Store both tokens
7. Call GET /v1/users/me to fetch user profile
8. Update Zustand store with user and accessToken
9. User session restored (stays logged in)
```

This happens automatically on every app load, making sessions persist across page refreshes.

#### Token Refresh Flow
```
1. API request fails with 401
2. Axios interceptor catches the error
3. Check if refresh is already in progress
4. If not, get refreshToken from localStorage
5. Call mockAuthApi.refreshToken()
6. Update accessToken in Zustand store
7. Retry original failed request
8. Process queued requests
```

#### Logout Flow
```
1. User clicks Logout in dropdown
2. Navigation.tsx calls authStore.logout()
3. Clear user and accessToken from Zustand
4. Remove refreshToken from localStorage
5. Redirect to /login
```

## Data Flow

### State Management Flow
```
User Action
    ↓
Component Event Handler
    ↓
Zustand Store Action
    ↓
Store State Update
    ↓
Component Re-render (via useAuthStore hook)
```

### API Request Flow
```
Component
    ↓
apiClient.get/post/put/delete()
    ↓
Request Interceptor (add token)
    ↓
Backend (Mock API)
    ↓
Response Interceptor (handle 401)
    ↓
Component (success/error handling)
```

## Design Patterns

### 1. **Centralized State Management**
- Single source of truth for authentication state
- No prop drilling - components access store directly via hooks
- Predictable state updates

### 2. **Interceptor Pattern**
- Axios interceptors handle cross-cutting concerns
- Automatic token attachment
- Centralized error handling
- Request/response transformation

### 3. **Protected Route Pattern**
- Higher-order component wraps protected routes
- Declarative access control
- Automatic redirection for unauthorized users

### 4. **Component Composition**
- Small, focused components
- Reusable UI components from shadcn/ui
- Separation of concerns (UI vs business logic)

### 5. **Mock Service Pattern**
- Mock API simulates real backend
- Easy to replace with real API
- Consistent interface for development

## Security Considerations

### Token Storage Strategy

**Access Token (In-Memory)**
- ✅ Stored in Zustand store (JavaScript memory)
- ✅ Lost on page refresh (intentional)
- ✅ Not accessible via XSS if no localStorage
- ✅ Short-lived (typically 15 minutes)
- ❌ Lost on page refresh (use refresh token)

**Refresh Token (localStorage)**
- ✅ Persists across sessions
- ✅ Used only for obtaining new access tokens
- ✅ Never sent in API requests (except refresh endpoint)
- ⚠️ Accessible via XSS (mitigate with httpOnly cookies in production)
- ✅ Longer-lived (typically 7 days)

### Production Recommendations

1. **Use httpOnly Cookies for Refresh Tokens**
   - Not accessible via JavaScript
   - Automatically sent with requests
   - Better XSS protection

2. **Implement CSRF Protection**
   - Use CSRF tokens for state-changing operations
   - Verify origin headers

3. **Add Rate Limiting**
   - Prevent brute force attacks
   - Limit token refresh attempts

4. **Enable HTTPS Only**
   - Encrypt all communication
   - Prevent token interception

5. **Implement Token Rotation**
   - Issue new refresh token on each refresh
   - Invalidate old refresh tokens

## Scalability Considerations

### Current Architecture
- Full-stack application with React + NestJS
- OAuth 2.0 with PKCE for Google authentication
- JWT-based session management
- PostgreSQL for data persistence
- Gmail API integration for email operations

### Future Enhancements**
   - Send/receive emails
   - Attachments support
   - Search functionality
   - Folders and labels

3. **Performance Optimizations**
   - Code splitting with React.lazy()
   - Virtual scrolling for email lists
   - Service worker for offline support
   - Image optimization

4. **Advanced Features**
   - Real-time updates with WebSockets
   - Push notifications
   - Dark mode toggle
   - Multi-language support

## Testing Strategy

### Unit Tests
- Test individual components in isolation
- Test store actions and state updates
- Test utility functions

### Integration Tests
- Test authentication flow end-to-end
- Test protected route access
- Test token refresh mechanism

### E2E Tests
- Test complete user journeys
- Test cross-browser compatibility
- Test responsive design

## Monitoring & Logging

### Recommended Metrics
- Authentication success/failure rates
- Token refresh frequency
- API response times
- Error rates by endpoint
- User session duration

### Error Tracking
- Implement error boundary components
- Log errors to monitoring service (e.g., Sentry)
- Track authentication failures
- Monitor API errors
