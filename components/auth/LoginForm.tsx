'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { ThemeAwareLogo } from '@/components/ui/logo';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { LanguageSelector } from '@/components/ui/language-selector';
import { useFormTranslation } from '@/hooks/useTranslation';
import { createLocalizedValidation } from '@/lib/validation';

type LoginFormData = {
  email: string;
  password: string;
};

export default function LoginForm() {
  const { t } = useFormTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const messageParam = searchParams.get('message');
    if (messageParam) {
      setMessage(messageParam);
    }
  }, [searchParams]);

  // Create localized validation schema
  const validation = createLocalizedValidation(t);
  const loginSchema = z.object({
    email: validation.email(),
    password: validation.required(),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Login failed');
      }

      setSubmitSuccess(true);
      
      // Redirect to dashboard or quiz results after successful login
      setTimeout(() => {
        const fromParam = searchParams.get('from');
        if (fromParam === 'quiz-results') {
          router.push('/quiz/results');
        } else {
          router.push('/dashboard');
        }
      }, 1000);

    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-eddura-50 via-white to-eddura-100 dark:from-eddura-900 dark:via-eddura-800 dark:to-eddura-900 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-full max-w-sm border-0 shadow-lg bg-white/80 dark:bg-eddura-800/80 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-semibold text-eddura-900 dark:text-eddura-100 mb-2">Login successful!</h2>
              <p className="text-eddura-700 dark:text-eddura-300 mb-6">
                Redirecting you to your dashboard...
              </p>
              <div className="animate-pulse">
                <div className="w-4 h-4 bg-eddura-500 rounded-full mx-auto"></div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-eddura-50 via-white to-eddura-100 dark:from-eddura-900 dark:via-eddura-800 dark:to-eddura-900 flex items-center justify-center px-4">
      {/* Language selector and theme toggle in top right */}
      <div className="absolute top-6 right-6 flex items-center space-x-3">
        <LanguageSelector variant="compact" showLabel={false} />
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-8">
            <ThemeAwareLogo size="2xl" />
          </div>
          <h2 className="text-3xl font-semibold text-eddura-900 dark:text-eddura-100 mb-2">Welcome back</h2>
          <p className="text-eddura-600 dark:text-eddura-400">
            Sign in to access your quiz results and personalized recommendations
          </p>
        </motion.div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-eddura-800/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Success Message */}
                {message && (
                  <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <AlertDescription className="text-green-800 dark:text-green-200">
                      {message}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-eddura-700 dark:text-eddura-300">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-eddura-400 dark:text-eddura-500" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="john.doe@example.com"
                      className="pl-10 h-11 border-eddura-200 dark:border-eddura-600 focus:border-eddura-500 dark:focus:border-eddura-400 focus:ring-eddura-500 dark:focus:ring-eddura-400 bg-white dark:bg-eddura-700 text-eddura-900 dark:text-eddura-100 placeholder-eddura-400 dark:placeholder-eddura-500"
                      {...register('email')}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-eddura-700 dark:text-eddura-300">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-eddura-400 dark:text-eddura-500" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      className="pl-10 pr-12 h-11 border-eddura-200 dark:border-eddura-600 focus:border-eddura-500 dark:focus:border-eddura-400 focus:ring-eddura-500 dark:focus:ring-eddura-400 bg-white dark:bg-eddura-700 text-eddura-900 dark:text-eddura-100 placeholder-eddura-400 dark:placeholder-eddura-500"
                      {...register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-eddura-400 dark:text-eddura-500 hover:text-eddura-600 dark:hover:text-eddura-400"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Error Alert */}
                {submitError && (
                  <Alert variant="destructive" className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-red-800 dark:text-red-200">{submitError}</AlertDescription>
                  </Alert>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={!isValid || isSubmitting}
                  className="w-full h-11 bg-eddura-600 hover:bg-eddura-700 text-white font-medium rounded-lg transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-eddura-200 dark:border-eddura-600" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-eddura-800 px-2 text-eddura-500 dark:text-eddura-400">Or</span>
                </div>
              </div>

              {/* Register Link */}
              <div className="text-center">
                <p className="text-sm text-eddura-600 dark:text-eddura-400">
                  Don&apos;t have an account?{' '}
                  <Link href="/auth/register" className="text-eddura-700 dark:text-eddura-300 hover:text-eddura-800 dark:hover:text-eddura-200 font-medium">
                    Create one here
                  </Link>
                </p>
              </div>

              {/* Forgot Password */}
              <div className="text-center">
                <Link href="/auth/forgot-password" className="text-sm text-eddura-700 dark:text-eddura-300 hover:text-eddura-800 dark:hover:text-eddura-200">
                  Forgot your password?
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
} 