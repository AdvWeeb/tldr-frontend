import apiClient from './apiClient';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  isEmailVerified: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface GoogleAuthData {
  code: string;
  codeVerifier: string;
}

export interface AuthResponse {
  userId: number;
  email: string;
  tokens: {
    accessToken: string;
    expiresIn: number;
    tokenType: string;
  };
  refreshToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export const authApi = {
  // Initiate Google OAuth flow (redirects to Google)
  initiateGoogleOAuth: async () => {
    const { generateCodeVerifier, generateCodeChallenge, generateState, buildGoogleOAuthUrl, storeOAuthState } = await import('../utils/oauth');
    
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI || `${window.location.origin}/auth/callback`;
    
    if (!clientId) {
      throw new Error('Google Client ID not configured');
    }
    
    // Generate PKCE parameters
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    const state = generateState();
    
    // Store state and verifier for callback validation
    storeOAuthState(state, codeVerifier);
    
    // Build OAuth URL and redirect
    const authUrl = buildGoogleOAuthUrl(clientId, redirectUri, codeChallenge, state);
    window.location.href = authUrl;
  },

  // Login with email and password
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  // Register new user
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  // Google OAuth authentication
  googleAuth: async (data: GoogleAuthData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/google', data);
    return response.data;
  },

  // Refresh access token
  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/refresh', {
      refreshToken,
    });
    return response.data;
  },

  // Logout (revoke refresh token)
  logout: async (refreshToken: string, revokeAll = false): Promise<void> => {
    await apiClient.post(`/auth/logout?all=${revokeAll}`, {
      refreshToken,
    });
  },

  // Get current user profile
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<User>('/users/me');
    return response.data;
  },
};
