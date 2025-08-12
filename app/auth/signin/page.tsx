"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Eye, EyeOff, ArrowRight } from "lucide-react";
import Link from "next/link";
import { ThemeAwareLogo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  // Show loading while checking authentication status
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-eddura-50 via-white to-eddura-100 dark:from-eddura-900 dark:via-eddura-800 dark:to-eddura-900 flex items-center justify-center">
        <div className="text-center">
          <ThemeAwareLogo size="3xl" className="mx-auto mb-4" />
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eddura-600 mx-auto"></div>
          <p className="mt-2 text-eddura-700 dark:text-eddura-300">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render the login form if already authenticated
  if (status === "authenticated") {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        portal: "user",
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-eddura-50 via-white to-eddura-100 dark:from-eddura-900 dark:via-eddura-800 dark:to-eddura-900 flex items-center justify-center p-4">
      {/* Theme toggle in top right */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm">
        {/* Logo and title */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-8 ">
            <ThemeAwareLogo size="7xl" />
          </div>
          <h1 className="text-3xl font-semibold text-eddura-900 dark:text-eddura-100 mb-2">
            Welcome back
          </h1>
          <p className="text-eddura-600 dark:text-eddura-400">
            Sign in to your account
          </p>
        </div>

        {/* Form */}
        <Card className="border-0 shadow-lg bg-white/80 dark:bg-eddura-800/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-eddura-700 dark:text-eddura-300">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={isLoading}
                  required
                  className="h-11 border-eddura-200 dark:border-eddura-600 focus:border-eddura-500 dark:focus:border-eddura-400 focus:ring-eddura-500 dark:focus:ring-eddura-400 bg-white dark:bg-eddura-700 text-eddura-900 dark:text-eddura-100 placeholder-eddura-400 dark:placeholder-eddura-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-eddura-700 dark:text-eddura-300">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    disabled={isLoading}
                    required
                    className="h-11 border-eddura-200 dark:border-eddura-600 focus:border-eddura-500 dark:focus:border-eddura-400 focus:ring-eddura-500 dark:focus:ring-eddura-400 bg-white dark:bg-eddura-700 text-eddura-900 dark:text-eddura-100 placeholder-eddura-400 dark:placeholder-eddura-500 pr-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-eddura-50 dark:hover:bg-eddura-600 text-eddura-500 dark:text-eddura-400"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive" className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                  <AlertDescription className="text-red-800 dark:text-red-200">{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full h-11 bg-eddura-600 hover:bg-eddura-700 text-white font-medium rounded-lg transition-colors"
                disabled={isLoading || !formData.email || !formData.password}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
              
              <div className="text-center text-sm text-eddura-600 dark:text-eddura-400">
                Don&apos;t have an account?{" "}
                <Link 
                  href="/auth/signup" 
                  className="text-eddura-700 dark:text-eddura-300 hover:text-eddura-800 dark:hover:text-eddura-200 font-medium"
                >
                  Sign up
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}