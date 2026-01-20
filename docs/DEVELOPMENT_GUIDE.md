# Development Guide

## Getting Started for New Team Members

Welcome to the TL;DR project! This guide will help you understand the codebase, coding standards, and development workflow.

## Development Workflow

### 1. Before You Start

```bash
# Pull latest changes
git pull origin main

# Install/update dependencies
npm install

# Start dev server
npm run dev
```

### 2. Creating a New Feature

```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Make your changes
# Write tests
# Test locally

# Commit your changes
git add .
git commit -m "feat: add your feature description"

# Push to remote
git push origin feature/your-feature-name

# Create a Pull Request
```

### 3. Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new email compose feature
fix: resolve token refresh race condition
docs: update API documentation
style: format code with prettier
refactor: simplify authentication logic
test: add unit tests for auth store
chore: update dependencies
```

## Coding Standards

### TypeScript Guidelines

#### 1. Always Use Type Annotations
```typescript
// ✅ Good
interface User {
  id: string;
  email: string;
  name: string;
}

const getUser = (id: string): Promise<User> => {
  // ...
}

// ❌ Avoid
const getUser = (id) => {
  // ...
}
```

#### 2. Use Interfaces for Objects
```typescript
// ✅ Good
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

// ❌ Avoid inline types
const Button = (props: { label: string; onClick: () => void }) => {
  // ...
}
```

#### 3. Prefer Type Inference When Obvious
```typescript
// ✅ Good - type is obvious
const count = 5;
const users = ['Alice', 'Bob'];

// ✅ Good - type is explicit when needed
const user: User | null = null;
```

### React Best Practices

#### 1. Functional Components with Hooks
```typescript
// ✅ Good
export function Dashboard() {
  const { user } = useAuthStore();
  
  return (
    <div>
      <h1>Welcome, {user?.name}</h1>
    </div>
  );
}

// ❌ Avoid class components
class Dashboard extends React.Component {
  // ...
}
```

#### 2. Component File Structure
```typescript
// 1. Imports
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';

// 2. Types/Interfaces
interface DashboardProps {
  title: string;
}

// 3. Component
export function Dashboard({ title }: DashboardProps) {
  // 4. Hooks
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  
  // 5. Event handlers
  const handleClick = () => {
    // ...
  };
  
  // 6. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

#### 3. Custom Hooks for Reusable Logic
```typescript
// ✅ Good - Extract reusable logic
function useAuth() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return { user, handleLogout };
}

// Use in component
function Navigation() {
  const { user, handleLogout } = useAuth();
  // ...
}
```

#### 4. Component Naming
```typescript
// ✅ Good - PascalCase for components
export function UserProfile() {}
export function EmailList() {}

// ✅ Good - camelCase for instances
const userProfile = <UserProfile />;
```

### Styling with Tailwind CSS

#### 1. Use Utility Classes
```tsx
// ✅ Good
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
  <h1 className="text-2xl font-bold">Title</h1>
</div>

// ❌ Avoid inline styles
<div style={{ display: 'flex', padding: '16px' }}>
  <h1 style={{ fontSize: '24px' }}>Title</h1>
</div>
```

#### 2. Use cn() for Conditional Classes
```tsx
import { cn } from '@/lib/utils';

// ✅ Good
<button 
  className={cn(
    "px-4 py-2 rounded",
    isActive && "bg-blue-600",
    isDisabled && "opacity-50 cursor-not-allowed"
  )}
>
  Click me
</button>
```

#### 3. Use shadcn/ui Components
```tsx
// ✅ Good - Use existing shadcn components
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

<Button variant="primary">Click me</Button>

// ❌ Avoid creating custom button when shadcn exists
<button className="custom-button">Click me</button>
```

### State Management with Zustand

#### 1. Keep Store Focused
```typescript
// ✅ Good - Single responsibility
interface AuthStore {
  user: User | null;
  accessToken: string | null;
  setUser: (user: User, token: string) => void;
  logout: () => void;
}

// ❌ Avoid - Too many responsibilities
interface AppStore {
  user: User | null;
  emails: Email[];
  notifications: Notification[];
  settings: Settings;
  // ... too much
}
```

#### 2. Use Selectors for Derived State
```typescript
// ✅ Good - Select only what you need
const user = useAuthStore((state) => state.user);
const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

// ❌ Avoid - Selecting entire store
const store = useAuthStore();
```

### API Integration

#### 1. Use apiClient for All Requests
```typescript
// ✅ Good
import { apiClient } from '@/services/apiClient';

const fetchEmails = async () => {
  const response = await apiClient.get('/emails');
  return response.data;
};

// ❌ Avoid - Direct axios usage
import axios from 'axios';
const response = await axios.get('https://api.example.com/emails');
```

#### 2. Handle Errors Gracefully
```typescript
// ✅ Good
try {
  const data = await fetchEmails();
  setEmails(data);
} catch (error) {
  console.error('Failed to fetch emails:', error);
  setError('Unable to load emails. Please try again.');
}

// ❌ Avoid - No error handling
const data = await fetchEmails();
setEmails(data);
```

## Adding New Components

### Using shadcn/ui

```bash
# Add a new shadcn component
npx shadcn@latest add <component-name>

# Examples:
npx shadcn@latest add dialog
npx shadcn@latest add table
npx shadcn@latest add select
```

### Creating Custom Components

1. **Create component file** in `src/components/`
2. **Define TypeScript interface** for props
3. **Use shadcn components** as building blocks
4. **Export as named export**

```typescript
// src/components/EmailCard.tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Mail } from 'lucide-react';

interface EmailCardProps {
  subject: string;
  sender: string;
  preview: string;
  onClick: () => void;
}

export function EmailCard({ subject, sender, preview, onClick }: EmailCardProps) {
  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={onClick}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          <CardTitle className="text-lg">{subject}</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">{sender}</p>
      </CardHeader>
      <CardContent>
        <p className="text-sm line-clamp-2">{preview}</p>
      </CardContent>
    </Card>
  );
}
```

## Adding New Pages

1. **Create page component** in `src/pages/`
2. **Add route** in `src/App.tsx`
3. **Add navigation link** if needed

```typescript
// src/pages/Settings.tsx
import { Navigation } from '@/components/Navigation';

export function Settings() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        {/* Settings content */}
      </div>
    </div>
  );
}

// src/App.tsx - Add route
<Route path="/settings" element={
  <PrivateRoute>
    <Settings />
  </PrivateRoute>
} />
```

## Adding New API Endpoints

### 1. Add to Mock API (Development)
```typescript
// src/services/mockAuthApi.ts
export const mockAuthApi = {
  // ... existing methods
  
  updateProfile: async (userId: string, data: Partial<User>): Promise<User> => {
    await delay(800); // Simulate network delay
    
    // Mock implementation
    return {
      ...mockUser,
      ...data,
    };
  },
};
```

### 2. Use apiClient for Real API
```typescript
// src/services/userService.ts
import { apiClient } from './apiClient';

export const userService = {
  updateProfile: async (userId: string, data: Partial<User>) => {
    const response = await apiClient.put(`/users/${userId}`, data);
    return response.data;
  },
};
```

## Testing Guidelines

### Unit Testing Components
```typescript
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('renders with label', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
  
  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    screen.getByText('Click me').click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Testing with Zustand Store
```typescript
import { renderHook, act } from '@testing-library/react';
import { useAuthStore } from '@/store/authStore';

describe('AuthStore', () => {
  it('sets user and token', () => {
    const { result } = renderHook(() => useAuthStore());
    
    act(() => {
      result.current.setUser(mockUser, 'mock-token');
    });
    
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.accessToken).toBe('mock-token');
    expect(result.current.isAuthenticated).toBe(true);
  });
});
```

## Debugging Tips

### 1. React DevTools
- Install React DevTools browser extension
- Inspect component tree
- View props and state
- Profile performance

### 2. Redux DevTools (for Zustand)
```bash
npm install @redux-devtools/extension
```

```typescript
// Add to authStore.ts
import { devtools } from 'zustand/middleware';

export const useAuthStore = create(
  devtools(
    (set) => ({
      // ... store implementation
    }),
    { name: 'AuthStore' }
  )
);
```

### 3. Console Logging Best Practices
```typescript
// ✅ Good - Descriptive logs
console.log('User logged in:', { userId: user.id, email: user.email });

// ✅ Good - Use different log levels
console.error('Authentication failed:', error);
console.warn('Token expires in 5 minutes');
console.info('Page loaded:', performance.now());

// ❌ Avoid - Generic logs
console.log(user);
console.log('here');
```

### 4. Network Debugging
- Open Browser DevTools (F12)
- Go to Network tab
- Check API requests/responses
- Verify headers and payloads

## Performance Optimization

### 1. Code Splitting
```typescript
// ✅ Good - Lazy load heavy components
import { lazy, Suspense } from 'react';

const EmailComposer = lazy(() => import('@/components/EmailComposer'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EmailComposer />
    </Suspense>
  );
}
```

### 2. Memoization
```typescript
import { useMemo, useCallback } from 'react';

// ✅ Good - Memoize expensive calculations
const sortedEmails = useMemo(() => {
  return emails.sort((a, b) => b.date - a.date);
}, [emails]);

// ✅ Good - Memoize callbacks
const handleDelete = useCallback((id: string) => {
  deleteEmail(id);
}, []);
```

### 3. Avoid Unnecessary Re-renders
```typescript
// ✅ Good - Destructure only needed values
const { user } = useAuthStore();

// ❌ Avoid - Causes re-render on any store change
const store = useAuthStore();
```

## Common Pitfalls to Avoid

### 1. ❌ Not Handling Loading States
```typescript
// ❌ Bad
const data = await fetchData();
return <div>{data.title}</div>;

// ✅ Good
const [data, setData] = useState(null);
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  fetchData().then(setData).finally(() => setIsLoading(false));
}, []);

if (isLoading) return <div>Loading...</div>;
return <div>{data.title}</div>;
```

### 2. ❌ Mutating State Directly
```typescript
// ❌ Bad
user.name = 'New Name';

// ✅ Good
setUser({ ...user, name: 'New Name' });
```

### 3. ❌ Missing Dependencies in useEffect
```typescript
// ❌ Bad - Missing userId dependency
useEffect(() => {
  fetchUser(userId);
}, []);

// ✅ Good
useEffect(() => {
  fetchUser(userId);
}, [userId]);
```

### 4. ❌ Not Cleaning Up Side Effects
```typescript
// ❌ Bad
useEffect(() => {
  const interval = setInterval(() => {
    checkNewEmails();
  }, 30000);
}, []);

// ✅ Good
useEffect(() => {
  const interval = setInterval(() => {
    checkNewEmails();
  }, 30000);
  
  return () => clearInterval(interval);
}, []);
```

## Resources

### Documentation
- [React Docs](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [React Router](https://reactrouter.com/)

### Tools
- [VS Code](https://code.visualstudio.com/) - Recommended editor
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [TypeScript Playground](https://www.typescriptlang.org/play)

### Community
- Project Slack/Discord (if applicable)
- Code review guidelines
- Team meetings schedule

## Need Help?

1. **Check documentation** in `docs/` folder
2. **Search existing issues** on GitHub/GitLab
3. **Ask in team chat** for quick questions
4. **Create an issue** for bugs or feature requests
5. **Schedule a pairing session** for complex problems

Happy coding! 🚀
