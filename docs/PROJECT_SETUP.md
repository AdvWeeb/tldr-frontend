# Project Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **Git** (for version control)
- **VS Code** (recommended) or any code editor

## Initial Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd tldr
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- React 19.2.0
- TypeScript
- Vite 7.2.2
- Tailwind CSS v4
- shadcn/ui components
- Zustand (state management)
- Axios (HTTP client)
- React Router (routing)
- @react-oauth/google (Google OAuth)

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id
```

**To get a Google OAuth Client ID:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth 2.0 Client ID"
5. Configure the OAuth consent screen
6. Add authorized JavaScript origins: `http://localhost:5173`
7. Copy the Client ID and paste it in `.env`

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173/`

## Project Structure

```
tldr/
├── docs/                       # Documentation
│   ├── PROJECT_SETUP.md       # This file
│   ├── ARCHITECTURE.md        # System architecture
│   └── DEVELOPMENT_GUIDE.md   # Development guidelines
├── src/
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   └── navigation-menu.tsx
│   │   ├── Navigation.tsx     # Main navigation header
│   │   └── PrivateRoute.tsx   # Route protection wrapper
│   ├── pages/
│   │   ├── Login.tsx          # Login page
│   │   ├── Dashboard.tsx      # Public dashboard
│   │   └── Inbox.tsx          # Protected inbox
│   ├── services/
│   │   ├── apiClient.ts       # Axios instance with interceptors
│   │   └── mockAuthApi.ts     # Mock authentication backend
│   ├── store/
│   │   └── authStore.ts       # Zustand authentication store
│   ├── lib/
│   │   └── utils.ts           # Utility functions
│   ├── App.tsx                # Main app component
│   ├── main.tsx               # Entry point
│   └── index.css              # Global styles with Tailwind
├── public/                    # Static assets
├── .env                       # Environment variables (create this)
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── vite.config.ts             # Vite configuration
├── tailwind.config.js         # Tailwind CSS configuration
├── postcss.config.js          # PostCSS configuration
└── components.json            # shadcn/ui configuration
```

## Available Scripts

```bash
# Development
npm run dev          # Start dev server with hot reload

# Building
npm run build        # Build for production
npm run preview      # Preview production build

# Type Checking
npm run type-check   # Run TypeScript compiler check

# Linting
npm run lint         # Run ESLint
```

## Tech Stack Overview

### Frontend Framework
- **React 19.2.0** - UI library with latest features
- **TypeScript** - Type safety and better developer experience
- **Vite 7.2.2** - Fast build tool and dev server

### Styling
- **Tailwind CSS v4** - Utility-first CSS framework
- **shadcn/ui** - High-quality React components built on Radix UI
- **Lucide React** - Icon library
- **class-variance-authority** - Component variant management

### State Management & Routing
- **Zustand** - Lightweight state management
- **React Router v6** - Client-side routing

### HTTP & Authentication
- **Axios** - HTTP client with interceptors
- **@react-oauth/google** - Google Sign-In integration
- **JWT** - Token-based authentication

## Configuration Files

### `tsconfig.json`
TypeScript configuration with path aliases:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### `vite.config.ts`
Vite configuration with path resolution:
```typescript
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### `tailwind.config.js`
Tailwind configuration for shadcn/ui compatibility:
- Custom color system using CSS variables
- Container configuration
- Animation plugin support

### `postcss.config.js`
PostCSS configuration for Tailwind v4:
```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}
```

## Import Aliases

The project uses `@/` alias for cleaner imports:

```typescript
// ✅ Good - Using alias
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/authStore'

// ❌ Avoid - Relative paths
import { Button } from '../../../components/ui/button'
```

## Common Issues & Solutions

### Issue: Port 5173 is already in use

**Solution:**
```bash
# Kill the process using port 5173
# Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Or let Vite use another port (it will auto-select)
```

### Issue: Module not found errors

**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: Tailwind styles not applying

**Solution:**
1. Check `src/index.css` has `@import "tailwindcss"`
2. Restart dev server: `Ctrl+C` then `npm run dev`
3. Clear browser cache

### Issue: Google OAuth not working

**Solution:**
1. Verify `VITE_GOOGLE_CLIENT_ID` is set in `.env`
2. Check authorized origins in Google Cloud Console
3. Restart dev server after changing `.env`

## Next Steps

After setup, refer to:
- [Architecture Documentation](./ARCHITECTURE.md) - System design and data flow
- [Development Guide](./DEVELOPMENT_GUIDE.md) - Coding standards and practices

## Support

For issues or questions:
1. Check the documentation in `docs/` folder
2. Review existing issues in the repository
3. Contact the development team
