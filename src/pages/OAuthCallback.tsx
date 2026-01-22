import { useEffect, useState, useRef } from 'react';
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
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent double execution in React StrictMode
    if (hasProcessed.current) {
      return;
    }
    hasProcessed.current = true;

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
          // Don't use mutateAsync - use mutate to avoid catching internal errors
          googleLoginMutation.mutate({
            code: params.code,
            codeVerifier,
          }, {
            onError: (err) => {
              // Only set error for actual mutation failures
              console.error('Google login failed:', err);
              setError(err instanceof Error ? err.message : 'Authentication failed');
            }
          });
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
      <div className="min-h-screen flex items-center justify-center bg-[#FFF8F0] relative overflow-hidden">
        {/* Background decorative blobs */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-[#FF6B6B] rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-[#C77DFF] rounded-full blur-3xl opacity-15"></div>
        
        <div className="relative max-w-lg w-full mx-8">
          <div className="bg-white border-2 border-[#0A0A0A] rounded-[2rem] shadow-[8px_8px_0px_0px_rgba(10,10,10,0.1)] p-12 space-y-6">
            {/* Error Icon */}
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-[#FF6B6B]/10 border-2 border-[#FF6B6B] rounded-2xl flex items-center justify-center">
                <svg className="w-10 h-10 text-[#FF6B6B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            
            <div className="text-center space-y-4">
              <h2 
                className="text-4xl font-bold text-[#FF6B6B] italic leading-tight" 
                style={{ fontFamily: 'Instrument Serif, serif' }}
              >
                Authentication Error
              </h2>
              <p className="text-[#0A0A0A]/70 text-lg leading-relaxed" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                {error}
              </p>
            </div>
            
            <button
              onClick={() => navigate('/login', { replace: true })}
              className="w-full py-4 px-6 bg-[#10F9A0] text-[#0A0A0A] border-2 border-[#0A0A0A] rounded-2xl font-bold text-lg shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] hover:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] hover:scale-[1.02] hover:-translate-y-0.5 transition-all duration-200 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF8F0] relative overflow-hidden">
      {/* Background decorative blobs */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-[#10F9A0] rounded-full blur-3xl opacity-20"></div>
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-[#C77DFF] rounded-full blur-3xl opacity-15"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#FF6B6B] rounded-full blur-3xl opacity-10"></div>
      
      <div className="relative max-w-lg w-full mx-8">
        <div className="bg-white border-2 border-[#0A0A0A] rounded-[2rem] shadow-[8px_8px_0px_0px_rgba(10,10,10,0.1)] p-12 space-y-8">
          <div className="text-center space-y-6">
            {/* Animated loading spinner */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-[#10F9A0] to-[#0FD88E] border-2 border-[#0A0A0A] rounded-2xl flex items-center justify-center animate-pulse">
                  <div className="w-12 h-12 border-4 border-[#0A0A0A] border-t-transparent rounded-full animate-spin"></div>
                </div>
                {/* Decorative elements */}
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-[#FFD700] border-2 border-[#0A0A0A] rounded-full"></div>
                <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-[#FF6B6B] border-2 border-[#0A0A0A] rounded-full"></div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h2 
                className="text-4xl font-bold text-[#0A0A0A] italic leading-tight" 
                style={{ fontFamily: 'Instrument Serif, serif' }}
              >
                Completing sign in...
              </h2>
              <p className="text-[#0A0A0A]/60 text-lg leading-relaxed" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Please wait while we set up your account
              </p>
            </div>
            
            {/* Progress indicator dots */}
            <div className="flex justify-center gap-2 pt-4">
              <div className="w-2 h-2 bg-[#10F9A0] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-[#10F9A0] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-[#10F9A0] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
