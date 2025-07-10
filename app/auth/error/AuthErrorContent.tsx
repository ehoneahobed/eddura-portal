"use client";

import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, ArrowLeft } from "lucide-react";
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
    <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
      <CardHeader className="space-y-1 pb-6">
        <CardTitle className="text-xl text-center flex items-center justify-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          Authentication Error
        </CardTitle>
        <CardDescription className="text-center text-gray-600">
          There was a problem with your authentication
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-red-800">
            {getErrorMessage(error)}
          </AlertDescription>
        </Alert>

        <div className="flex flex-col space-y-2">
          <Link href="/admin-auth/login">
            <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Admin Login
            </Button>
          </Link>
          
          <Link href="/">
            <Button variant="outline" className="w-full">
              Back to Main Site
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
} 