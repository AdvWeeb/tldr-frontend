import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Loader2 } from 'lucide-react';
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
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto w-[350px] space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Welcome Back</h1>
            <p className="text-muted-foreground">
              Sign in to access your secure inbox
            </p>
          </div>

          {/* Error Messages */}
          {loginMutation.isError && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md text-sm">
              {loginMutation.error.message || 'Login failed. Please try again.'}
            </div>
          )}
          {initiateGoogleOAuth.isError && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md text-sm">
              {initiateGoogleOAuth.error.message || 'Google Sign-In failed. Please try again.'}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                disabled={isLoading}
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                disabled={isLoading}
                {...register('password')}
              />
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          {/* Google Sign-In Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            {initiateGoogleOAuth.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting to Google...
              </>
            ) : (
              <>
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
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
           {/* Test Credentials Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm mt-4">
            <p className="font-medium text-blue-900 mb-1">Test Credentials:</p>
            <p className="text-blue-700">Email: any valid email</p>
            <p className="text-blue-700">Password: any password (min 6 chars)</p>
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:flex items-center justify-center p-10 text-white bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="text-center">
            <Mail className="mx-auto h-16 w-16 text-blue-400 mb-6"/>
            <h2 className="text-4xl font-bold mb-4">
                Secure, Fast, and Reliable
            </h2>
            <p className="text-xl text-gray-300 max-w-md mx-auto">
                Join a new era of email communication where your privacy and security come first.
            </p>
        </div>
      </div>
    </div>
  );
}
