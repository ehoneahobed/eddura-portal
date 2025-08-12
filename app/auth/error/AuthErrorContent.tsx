"use client";

import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, ArrowLeft, Home } from "lucide-react";
import Link from "next/link";

export default function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "CredentialsSignin":
        return "Invalid credentials. Please check your email and password.";
      case "CallbackRouteError":
        return "Authentication error. Please try again.";
      case "Configuration":
        return "Authentication configuration error. Please contact support.";
      case "AccessDenied":
        return "Access denied. You don't have permission to access this resource.";
      case "Verification":
        return "Email verification required. Please check your email.";
      default:
        return "An authentication error occurred. Please try again.";
    }
  };

  return (
    <Card className="border-0 shadow-lg bg-white/80 dark:bg-eddura-800/80 backdrop-blur-sm">
      <CardContent className="p-8 text-center">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-xl font-medium text-red-600 dark:text-red-400 mb-2">
          Authentication error
        </h2>
        <p className="text-eddura-600 dark:text-eddura-400 text-sm mb-6">
          {getErrorMessage(error)}
        </p>

        <div className="space-y-3">
          <Link href="/admin-auth/login">
            <Button className="w-full h-11 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to admin login
            </Button>
          </Link>
          
          <Link href="/">
            <Button 
              variant="outline" 
              className="w-full h-11 border-eddura-200 dark:border-eddura-600 text-eddura-700 dark:text-eddura-300 hover:bg-eddura-50 dark:hover:bg-eddura-700 hover:border-eddura-300 dark:hover:border-eddura-500 transition-colors rounded-lg"
            >
              <Home className="mr-2 h-4 w-4" />
              Back to main site
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
} 