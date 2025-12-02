import { create } from 'zustand';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  isEmailVerified: boolean;
}

// Helper to get display name
export const getUserDisplayName = (user: User | null): string => {
  if (!user) return '';
  return `${user.firstName} ${user.lastName}`.trim() || user.email;
};

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setAccessToken: (token: string) => void;
  setUser: (user: User, token: string) => void;
  logout: () => void;
  clearError: () => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

// Refresh token is stored in localStorage
const REFRESH_TOKEN_KEY = 'refreshToken';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  setAccessToken: (token: string) => {
    set({ accessToken: token, isAuthenticated: true });
  },

  setUser: (user: User, token: string) => {
    set({ user, accessToken: token, isAuthenticated: true });
  },

  logout: () => {
    // Clear in-memory access token
    set({ 
      user: null, 
      accessToken: null, 
      isAuthenticated: false,
      error: null 
    });
    
    // Clear refresh token from localStorage
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  clearError: () => {
    set({ error: null });
  },

  setError: (error: string | null) => {
    set({ error, isLoading: false });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
}));

// Helper functions for refresh token management
export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const setRefreshToken = (token: string): void => {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
};

export const removeRefreshToken = (): void => {
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};
