import { useEffect, useState } from 'react';
import { useAuthStore, getRefreshToken, setRefreshToken } from '@/store/authStore';
import { authApi } from '@/services/authApi';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setAccessToken, logout } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        setIsChecking(false);
        return;
      }

      try {
        console.log('AuthProvider: Refreshing token...');
        // Use the real API to refresh the token
        const response = await authApi.refreshToken(refreshToken);
        console.log('AuthProvider: Token refreshed successfully, userId:', response.userId);
        
        // Update the access token in the store
        setAccessToken(response.tokens.accessToken);
        
        // The backend might issue a new rotated refresh token
        setRefreshToken(response.refreshToken);
        console.log('AuthProvider: Tokens stored, fetching user profile...');

        // Fetch user profile with the new access token
        const user = await authApi.getProfile();
        console.log('AuthProvider: User profile fetched:', user.email);
        setUser(user, response.tokens.accessToken);
        console.log('AuthProvider: Session restored successfully');

      } catch (error) {
        console.error('Failed to restore session:', error);
        logout(); // Clear invalid token
      } finally {
        setIsChecking(false);
      }
    };

    initAuth();
  }, [setUser, setAccessToken, logout]);

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

