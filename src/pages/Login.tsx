import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Loader2, Sparkles } from 'lucide-react';
import { useLogin, useInitiateGoogleOAuth } from '@/hooks/useAuth';
import { loginSchema, type LoginFormData } from '@/schemas/loginSchema';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';


export default function Login() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  
  // React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // React Query mutations
  const loginMutation = useLogin();
  const initiateGoogleOAuth = useInitiateGoogleOAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/inbox');
    }
  }, [isAuthenticated, navigate]);

  // Handle email/password login
  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  // Handle Google Sign-In button click
  const handleGoogleLogin = () => {
    initiateGoogleOAuth.mutate();
  };

  const isLoading = loginMutation.isPending || initiateGoogleOAuth.isPending;

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 bg-[#FFF8F0] relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-[#10F9A0] rounded-full blur-3xl opacity-10 animate-blob"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#C77DFF] rounded-full blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#FF6B6B] rounded-full blur-3xl opacity-10 animate-blob animation-delay-4000"></div>

      <div className="flex items-center justify-center py-16 px-8 relative z-10">
        <div className="mx-auto w-full max-w-[480px] space-y-8">
          <div className="space-y-4 text-center">
            <h1 className="text-5xl md:text-6xl font-bold italic font-serif text-[#0A0A0A] leading-tight" style={{ fontFamily: 'Instrument Serif, serif' }}>
              Welcome Back
            </h1>
            <p className="text-lg text-[#0A0A0A]/70" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Sign in to access your secure inbox
            </p>
          </div>

          {/* Error Messages */}
          {loginMutation.isError && (
            <div className="bg-[#FF6B6B]/10 border-2 border-[#FF6B6B] text-[#0A0A0A] px-6 py-4 rounded-[2rem] text-sm font-medium">
              {loginMutation.error.message || 'Login failed. Please try again.'}
            </div>
          )}
          {initiateGoogleOAuth.isError && (
            <div className="bg-[#FF6B6B]/10 border-2 border-[#FF6B6B] text-[#0A0A0A] px-6 py-4 rounded-[2rem] text-sm font-medium">
              {initiateGoogleOAuth.error.message || 'Google Sign-In failed. Please try again.'}
            </div>
          )}

          {/* Login Form Card */}
          <div className="bg-white border-2 border-[#0A0A0A] rounded-[2rem] p-8 shadow-[8px_8px_0px_0px_rgba(10,10,10,1)] relative overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] hover:shadow-[12px_12px_0px_0px_rgba(10,10,10,1)] hover:-translate-y-1">
            {/* Decorative blob */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#10F9A0] rounded-full opacity-10 animate-pulse-slow"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#C77DFF] rounded-full opacity-10 animate-pulse-slow animation-delay-1000"></div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative z-10">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-[#0A0A0A] font-bold text-sm uppercase tracking-wide" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  disabled={isLoading}
                  className="border-2 border-[#0A0A0A] rounded-2xl px-5 py-6 text-base focus:ring-2 focus:ring-[#10F9A0] focus:border-[#10F9A0] transition-all bg-[#FFF8F0]"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-sm text-[#FF6B6B] font-medium">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="password" className="text-[#0A0A0A] font-bold text-sm uppercase tracking-wide" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  disabled={isLoading}
                  className="border-2 border-[#0A0A0A] rounded-2xl px-5 py-6 text-base focus:ring-2 focus:ring-[#10F9A0] focus:border-[#10F9A0] transition-all bg-[#FFF8F0]"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}
                  {...register('password')}
                />
                {errors.password && (
                  <p className="text-sm text-[#FF6B6B] font-medium">{errors.password.message}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full bg-[#0A0A0A] text-white border-2 border-[#0A0A0A] rounded-full px-8 py-6 text-base font-bold uppercase tracking-wide shadow-[4px_4px_0px_0px_rgba(16,249,160,1)] hover:shadow-[6px_6px_0px_0px_rgba(16,249,160,1)] hover:scale-[1.02] hover:-translate-y-0.5 transition-all duration-200 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] disabled:opacity-50 disabled:cursor-not-allowed" 
                disabled={isLoading}
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <Sparkles className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t-2 border-[#0A0A0A]/20" />
              </div>
              <div className="relative flex justify-center text-xs uppercase font-bold tracking-wider">
                <span className="bg-white px-4 text-[#0A0A0A]/50" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  Or continue with
                </span>
              </div>
            </div>

            {/* Google Sign-In Button */}
            <Button
              type="button"
              className="w-full bg-white text-[#0A0A0A] border-2 border-[#0A0A0A] rounded-full px-8 py-6 text-base font-bold uppercase tracking-wide shadow-[4px_4px_0px_0px_rgba(199,125,255,1)] hover:shadow-[6px_6px_0px_0px_rgba(199,125,255,1)] hover:scale-[1.02] hover:-translate-y-0.5 transition-all duration-200 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              {initiateGoogleOAuth.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Connecting to Google...
                </>
              ) : (
                <>
                  <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign in with Google
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Right side hero section */}
      <div className="hidden lg:flex items-center justify-center p-16 relative overflow-hidden">
        {/* Gradient background with border */}
        <div className="absolute inset-8 bg-gradient-to-br from-[#10F9A0] to-[#C77DFF] rounded-[3rem] border-2 border-[#0A0A0A]"></div>
        
        {/* Content */}
        <div className="text-center relative z-10 max-w-xl">
          {/* Icon container with neo-brutalist styling */}
          <div className="mx-auto w-32 h-32 bg-[#0A0A0A] border-2 border-[#0A0A0A] rounded-[2rem] flex items-center justify-center mb-12 shadow-[8px_8px_0px_0px_rgba(255,107,107,1)] animate-float">
            <Mail className="h-16 w-16 text-[#10F9A0]"/>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-bold italic mb-6 text-[#0A0A0A]" style={{ fontFamily: 'Instrument Serif, serif' }}>
            Secure, Fast, and Reliable
          </h2>
          <p className="text-xl text-[#0A0A0A]/80 max-w-md mx-auto font-medium" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Join a new era of email communication where your privacy and security come first.
          </p>

          {/* Decorative elements */}
          <div className="absolute top-10 right-10 w-24 h-24 bg-[#FF6B6B] rounded-full border-2 border-[#0A0A0A] opacity-30 animate-pulse-slow"></div>
          <div className="absolute bottom-10 left-10 w-32 h-32 bg-white rounded-full border-2 border-[#0A0A0A] opacity-20 animate-pulse-slow animation-delay-1500"></div>
        </div>
      </div>
    </div>
  );
}
