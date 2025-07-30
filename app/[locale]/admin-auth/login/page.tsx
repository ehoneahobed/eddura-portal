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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-2 text-red-200">Loading...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Security Notice */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <Shield className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Admin Access</h1>
          <p className="text-red-200 text-sm">
            Restricted area. Unauthorized access attempts will be logged.
          </p>
        </div>

        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-xl text-center flex items-center justify-center gap-2">
              <Lock className="h-5 w-5 text-gray-600" />
              Administrator Login
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              Enter your admin credentials to access the management portal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-email" className="text-sm font-medium">
                  Admin Email
                </Label>
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="admin@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={isLoading}
                  className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="admin-password" className="text-sm font-medium">
                  Admin Password
                </Label>
                <div className="relative">
                  <Input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    disabled={isLoading}
                    className="border-gray-300 focus:border-red-500 focus:ring-red-500 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-red-800">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white"
                disabled={isLoading || !formData.email || !formData.password}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  "Access Admin Portal"
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-2">
                  Need help? Contact your system administrator
                </p>
                <Link 
                  href="/" 
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ← Back to main site
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-red-200">
            <AlertTriangle className="inline h-3 w-3 mr-1" />
            This is a secure administrative area. All access attempts are monitored and logged.
          </p>
        </div>
      </div>
    </div>
  );
} 