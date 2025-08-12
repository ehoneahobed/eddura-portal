"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Eye, EyeOff, CheckCircle } from "lucide-react";
import Link from "next/link";
import { z } from "zod";
import { ThemeAwareLogo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const signupSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  const validateForm = () => {
    try {
      signupSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path) {
            newErrors[err.path[0]] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      setSuccess("Account created successfully! Please check your email to verify your account.");
      
      // Clear form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : "Registration failed");
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
          <div className="flex justify-center mb-8">
            <ThemeAwareLogo size="7xl" />
          </div>
          <h1 className="text-3xl font-semibold text-eddura-900 dark:text-eddura-100 mb-2">
            Create account
          </h1>
          <p className="text-eddura-600 dark:text-eddura-400">
            Join our platform today
          </p>
        </div>

        {/* Form */}
        <Card className="border-0 shadow-lg bg-white/80 dark:bg-eddura-800/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium text-eddura-700 dark:text-eddura-300">
                    First name
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    disabled={isLoading}
                    className={`h-11 border-eddura-200 dark:border-eddura-600 focus:border-eddura-500 dark:focus:border-eddura-400 focus:ring-eddura-500 dark:focus:ring-eddura-400 bg-white dark:bg-eddura-700 text-eddura-900 dark:text-eddura-100 placeholder-eddura-400 dark:placeholder-eddura-500 ${
                      errors.firstName ? "border-red-500 dark:border-red-400" : ""
                    }`}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.firstName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium text-eddura-700 dark:text-eddura-300">
                    Last name
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    disabled={isLoading}
                    className={`h-11 border-eddura-200 dark:border-eddura-600 focus:border-eddura-500 dark:focus:border-eddura-400 focus:ring-eddura-500 dark:focus:ring-eddura-400 bg-white dark:bg-eddura-700 text-eddura-900 dark:text-eddura-100 placeholder-eddura-400 dark:placeholder-eddura-500 ${
                      errors.lastName ? "border-red-500 dark:border-red-400" : ""
                    }`}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-eddura-700 dark:text-eddura-300">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={isLoading}
                  className={`h-11 border-eddura-200 dark:border-eddura-600 focus:border-eddura-500 dark:focus:border-eddura-400 focus:ring-eddura-500 dark:focus:ring-eddura-400 bg-white dark:bg-eddura-700 text-eddura-900 dark:text-eddura-100 placeholder-eddura-400 dark:placeholder-eddura-500 ${
                    errors.email ? "border-red-500 dark:border-red-400" : ""
                  }`}
                />
                {errors.email && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-eddura-700 dark:text-eddura-300">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    disabled={isLoading}
                    className={`h-11 border-eddura-200 dark:border-eddura-600 focus:border-eddura-500 dark:focus:border-eddura-400 focus:ring-eddura-500 dark:focus:ring-eddura-400 bg-white dark:bg-eddura-700 text-eddura-900 dark:text-eddura-100 placeholder-eddura-400 dark:placeholder-eddura-500 pr-12 ${
                      errors.password ? "border-red-500 dark:border-red-400" : ""
                    }`}
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
                {errors.password && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-eddura-700 dark:text-eddura-300">
                  Confirm password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    disabled={isLoading}
                    className={`h-11 border-eddura-200 dark:border-eddura-600 focus:border-eddura-500 dark:focus:border-eddura-400 focus:ring-eddura-500 dark:focus:ring-eddura-400 bg-white dark:bg-eddura-700 text-eddura-900 dark:text-eddura-100 placeholder-eddura-400 dark:placeholder-eddura-500 pr-12 ${
                      errors.confirmPassword ? "border-red-500 dark:border-red-400" : ""
                    }`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-eddura-50 dark:hover:bg-eddura-600 text-eddura-500 dark:text-eddura-400"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
                )}
              </div>

              {error && (
                <Alert variant="destructive" className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                  <AlertDescription className="text-red-800 dark:text-red-200">{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertDescription className="text-green-800 dark:text-green-200">{success}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full h-11 bg-eddura-600 hover:bg-eddura-700 text-white font-medium rounded-lg transition-colors"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create account"
                )}
              </Button>

              <div className="text-center text-sm text-eddura-600 dark:text-eddura-400">
                Already have an account?{" "}
                <Link 
                  href="/auth/signin" 
                  className="text-eddura-700 dark:text-eddura-300 hover:text-eddura-800 dark:hover:text-eddura-200 font-medium"
                >
                  Sign in
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}