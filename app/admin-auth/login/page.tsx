"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Eye, EyeOff, Shield, Lock, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { ThemeAwareLogo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function AdminLoginPage() {
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
      router.replace("/admin");
    }
  }, [status, router]);

  // Show loading while checking authentication status
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-eddura-900 via-eddura-800 to-eddura-900 flex items-center justify-center">
        <div className="text-center">
          <ThemeAwareLogo size="2xl" className="mx-auto mb-4" />
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eddura-400 mx-auto"></div>
          <p className="mt-2 text-eddura-300">Loading...</p>
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
    console.log("🔍 [LOGIN_FORM] Form submitted with data:", {
      email: formData.email,
      hasPassword: !!formData.password,
      portal: "admin"
    });
    
    setIsLoading(true);
    setError("");

    try {
      console.log("🔍 [LOGIN_FORM] Calling signIn...");
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        portal: "admin",
        redirect: false,
      });
      
      console.log("🔍 [LOGIN_FORM] SignIn result:", result);
      
      if (result?.error) {
        console.log("❌ [LOGIN_FORM] SignIn error:", result.error);
        setError("Invalid admin credentials. Please check your email and password.");
        setIsLoading(false);
      } else if (result?.ok) {
        console.log("✅ [LOGIN_FORM] SignIn successful, redirecting...");
        // Use window.location for a full page reload to ensure session is properly set
        window.location.href = "/admin";
      } else {
        console.log("⚠️ [LOGIN_FORM] SignIn returned unexpected result:", result);
        setError("An unexpected error occurred. Please try again.");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("❌ [LOGIN_FORM] SignIn exception:", error);
      setError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-eddura-900 via-eddura-800 to-eddura-900 flex items-center justify-center p-4">
      {/* Theme toggle in top right */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm">
        {/* Logo and title */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-8">
            <ThemeAwareLogo size="2xl" />
          </div>
          <h1 className="text-3xl font-semibold text-white mb-2">
            Admin portal
          </h1>
          <p className="text-eddura-200 text-sm">
            Administrative access to Eddura platform
          </p>
        </div>

        {/* Security Notice */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
            <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-lg font-medium text-white mb-2">Admin access</h2>
          <p className="text-red-200 dark:text-red-300 text-xs">
            Restricted area. Unauthorized access attempts will be logged.
          </p>
        </div>

        {/* Form */}
        <Card className="border-0 shadow-lg bg-white/90 dark:bg-eddura-800/90 backdrop-blur-sm">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="admin-email" className="text-sm font-medium text-eddura-700 dark:text-eddura-300">
                  Admin email
                </Label>
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="admin@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={isLoading}
                  className="h-11 border-eddura-200 dark:border-eddura-600 focus:border-eddura-500 dark:focus:border-eddura-400 focus:ring-eddura-500 dark:focus:ring-eddura-400 bg-white dark:bg-eddura-700 text-eddura-900 dark:text-eddura-100 placeholder-eddura-400 dark:placeholder-eddura-500"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="admin-password" className="text-sm font-medium text-eddura-700 dark:text-eddura-300">
                  Admin password
                </Label>
                <div className="relative">
                  <Input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    disabled={isLoading}
                    className="h-11 border-eddura-200 dark:border-eddura-600 focus:border-eddura-500 dark:focus:border-eddura-400 focus:ring-eddura-500 dark:focus:ring-eddura-400 bg-white dark:bg-eddura-700 text-eddura-900 dark:text-eddura-100 placeholder-eddura-400 dark:placeholder-eddura-500 pr-12"
                    required
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
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-red-800 dark:text-red-200">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full h-11 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                disabled={isLoading || !formData.email || !formData.password}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  "Access admin portal"
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-eddura-200 dark:border-eddura-600">
              <div className="text-center">
                <p className="text-xs text-eddura-500 dark:text-eddura-400 mb-2">
                  Need help? Contact your system administrator
                </p>
                <Link 
                  href="/" 
                  className="text-xs text-eddura-400 dark:text-eddura-500 hover:text-eddura-600 dark:hover:text-eddura-400 transition-colors"
                >
                  ← Back to main site
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-red-200 dark:text-red-300">
            <AlertTriangle className="inline h-3 w-3 mr-1" />
            This is a secure administrative area. All access attempts are monitored and logged.
          </p>
        </div>
      </div>
    </div>
  );
} 