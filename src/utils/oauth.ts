/**
 * OAuth 2.0 PKCE Utilities
 * Implements PKCE (Proof Key for Code Exchange) for secure OAuth flow
 */

/**
 * Generate a cryptographically random code verifier
 * @returns Base64 URL-encoded random string (43-128 characters)
 */
export function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64URLEncode(array);
}

/**
 * Generate code challenge from verifier using SHA-256
 * @param verifier - The code verifier string
 * @returns Base64 URL-encoded SHA-256 hash of verifier
 */
export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return base64URLEncode(new Uint8Array(hash));
}

/**
 * Generate a random state parameter for CSRF protection
 * @returns Random state string
 */
export function generateState(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return base64URLEncode(array);
}

/**
 * Base64 URL encode (without padding)
 * @param buffer - Uint8Array to encode
 * @returns Base64 URL-encoded string
 */
function base64URLEncode(buffer: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...Array.from(buffer)));
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Build Google OAuth authorization URL with PKCE
 * @param clientId - Google OAuth client ID
 * @param redirectUri - Callback URL after authorization
 * @param codeChallenge - PKCE code challenge
 * @param state - CSRF protection state
 * @returns Complete Google OAuth URL
 */
export function buildGoogleOAuthUrl(
  clientId: string,
  redirectUri: string,
  codeChallenge: string,
  state: string
): string {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: [
      'openid',
      'email',
      'profile',
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.modify',
    ].join(' '),
    access_type: 'offline', // Request refresh token
    prompt: 'consent', // Force consent screen to always get refresh token
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    state: state,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Store OAuth state in sessionStorage for verification
 * @param state - State parameter
 * @param codeVerifier - PKCE code verifier
 */
export function storeOAuthState(state: string, codeVerifier: string): void {
  sessionStorage.setItem('oauth_state', state);
  sessionStorage.setItem('oauth_code_verifier', codeVerifier);
}

/**
 * Retrieve and validate OAuth state from sessionStorage
 * @param receivedState - State parameter from OAuth callback
 * @returns Code verifier if state is valid, null otherwise
 */
export function retrieveAndValidateOAuthState(receivedState: string): string | null {
  const storedState = sessionStorage.getItem('oauth_state');
  const codeVerifier = sessionStorage.getItem('oauth_code_verifier');

  // Clean up
  sessionStorage.removeItem('oauth_state');
  sessionStorage.removeItem('oauth_code_verifier');

  if (!storedState || !codeVerifier) {
    console.error('OAuth state not found in session');
    return null;
  }

  if (storedState !== receivedState) {
    console.error('OAuth state mismatch - possible CSRF attack');
    return null;
  }

  return codeVerifier;
}

/**
 * Extract authorization code and state from OAuth callback URL
 * @param url - Current page URL
 * @returns Object with code and state, or null if invalid
 */
export function extractOAuthParams(url: string): { code: string; state: string } | null {
  const params = new URLSearchParams(new URL(url).search);
  const code = params.get('code');
  const state = params.get('state');
  const error = params.get('error');

  if (error) {
    console.error('OAuth error:', error, params.get('error_description'));
    return null;
  }

  if (!code || !state) {
    console.error('Missing code or state in OAuth callback');
    return null;
  }

  return { code, state };
}
