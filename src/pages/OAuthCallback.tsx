import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '../hooks/useAuth';
import { useEmailMutations } from '../hooks/useEmail';
import { extractOAuthParams, retrieveAndValidateOAuthState } from '../utils/oauth';

/**
 * OAuth Callback Page
 * Handles redirect from Google OAuth, exchanges code for tokens
 */
export default function OAuthCallback() {
  const navigate = useNavigate();
  const googleLoginMutation = useGoogleLogin();
  const { connectMailbox } = useEmailMutations();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Check if we have the required parameters
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');

        if (!code || !state) {
          setError('Missing OAuth parameters. Please try signing in again.');
          return;
        }

        // Extract authorization code and state from URL
        const params = extractOAuthParams(window.location.href);
        if (!params) {
          setError('Invalid OAuth callback parameters');
          return;
        }

        // Validate state and retrieve code verifier
        const codeVerifier = retrieveAndValidateOAuthState(params.state);
        if (!codeVerifier) {
          setError('OAuth session expired. Please try signing in again.');
          return;
        }

        // Check if this is for adding an additional mailbox (not login)
        const oauthPurpose = localStorage.getItem('oauth_purpose');
        localStorage.removeItem('oauth_purpose');

        if (oauthPurpose === 'mailbox_connection') {
          // Connect additional mailbox to existing logged-in user
          await connectMailbox.mutateAsync({
            code: params.code,
            codeVerifier,
          });
          
          navigate('/inbox', { replace: true });
        } else {
          // Login with Google (backend auto-creates mailbox)
          await googleLoginMutation.mutateAsync({
            code: params.code,
            codeVerifier,
          });

          navigate('/inbox', { replace: true });
        }
      } catch (err) {
        console.error('OAuth callback error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
      }
    };

    handleOAuthCallback();
  }, [googleLoginMutation, connectMailbox, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-red-600">Authentication Error</h2>
            <p className="mt-4 text-gray-600">{error}</p>
            <button
              onClick={() => navigate('/login', { replace: true })}
              className="mt-6 w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Completing sign in...</h2>
          <p className="mt-2 text-sm text-gray-600">
            Please wait while we set up your account
          </p>
        </div>
      </div>
    </div>
  );
}
