import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { Mail, Loader2 } from 'lucide-react';
import { useLogin, useGoogleLogin } from '@/hooks/useAuth';
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
  const googleLoginMutation = useGoogleLogin();

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

  // Handle Google Sign-In success
  const handleGoogleSuccess = (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      return;
    }
    googleLoginMutation.mutate({ credential: credentialResponse.credential });
  };

  // Handle Google Sign-In error
  const handleGoogleError = () => {
    console.error('Google Sign-In failed');
  };

  const isLoading = loginMutation.isPending || googleLoginMutation.isPending;

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
          {googleLoginMutation.isError && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md text-sm">
              {googleLoginMutation.error.message || 'Google Sign-In failed. Please try again.'}
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

          {/* Google Sign-In */}
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap
              theme="outline"
              size="large"
              text="signin_with"
              width="350px"
            />
          </div>
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
