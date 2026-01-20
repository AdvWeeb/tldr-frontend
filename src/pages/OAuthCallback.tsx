import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '../hooks/useAuth';
import { useEmailMutations } from '../hooks/useEmail';
import { extractOAuthParams, retrieveAndValidateOAuthState } from '../utils/oauth';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const googleLoginMutation = useGoogleLogin();
  const { connectMailbox } = useEmailMutations();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {        
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');

        if (!code || !state) {
          setError('Missing OAuth parameters. Please try signing in again.');
          setIsProcessing(false);
          return;
        }

        const params = extractOAuthParams(window.location.href);
        if (!params) {
          setError('Invalid OAuth callback parameters');
          setIsProcessing(false);
          return;
        }

        const codeVerifier = retrieveAndValidateOAuthState(params.state);
        if (!codeVerifier) {
          setError('OAuth session expired. Please try signing in again.');
          setIsProcessing(false);
          return;
        }

        const oauthPurpose = localStorage.getItem('oauth_purpose');
        localStorage.removeItem('oauth_purpose');

        if (oauthPurpose === 'mailbox_connection') {
          await connectMailbox.mutateAsync({
            code: params.code,
            codeVerifier,
          });
          navigate('/inbox', { replace: true });
        } else {
          await googleLoginMutation.mutateAsync({
            code: params.code,
            codeVerifier,
          });
          navigate('/inbox', { replace: true });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Authentication failed');
        setIsProcessing(false);
      }
    };

    handleOAuthCallback();
  }, [googleLoginMutation, connectMailbox, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF8F0]">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-3xl shadow-lg border-2 border-[#0A0A0A]">
          <div className="text-center">
            <div className="w-16 h-16 bg-[#FF6B6B] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-3xl font-['Instrument_Serif',serif] italic font-bold text-[#0A0A0A]">
              Authentication Error
            </h2>
            <p className="mt-4 text-gray-600">{error}</p>
            <button
              onClick={() => navigate('/login', { replace: true })}
              className="mt-6 w-full py-3 px-4 rounded-2xl shadow-sm text-sm font-bold text-white bg-[#0A0A0A] hover:scale-105 transition-all duration-300"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF8F0]">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-3xl shadow-lg border-2 border-[#0A0A0A]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#10F9A0] border-t-transparent"></div>
            <h2 className="mt-6 text-3xl font-['Instrument_Serif',serif] italic font-bold text-[#0A0A0A]">
              Completing sign in...
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Please wait while we set up your account
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
