import { useEffect, useState } from 'react';
import { useAuthStore, getRefreshToken } from '@/store/authStore';
import { mockAuthApi } from '@/services/mockAuthApi';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, logout } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        setIsChecking(false);
        return;
      }

      try {
        // Try to restore session using refresh token
        const response = await mockAuthApi.refreshToken(refreshToken);
        setUser(response.user, response.accessToken);
      } catch (error) {
        console.error('Failed to restore session:', error);
        logout(); // Clear invalid token
      } finally {
        setIsChecking(false);
      }
    };

    initAuth();
  }, [setUser, logout]);

  if (isChecking) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Restoring session...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

