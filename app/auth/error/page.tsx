"use client";

import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, ArrowLeft, Loader2, Shield } from "lucide-react";
import Link from "next/link";
import AuthErrorContent from "./AuthErrorContent";
import { ThemeAwareLogo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function AuthErrorPage() {
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
            <ThemeAwareLogo size="2xl" />
          </div>
          <h1 className="text-3xl font-semibold text-eddura-900 dark:text-eddura-100 mb-2">
            Authentication error
          </h1>
          <p className="text-eddura-600 dark:text-eddura-400">
            Something went wrong with the authentication process
          </p>
        </div>

        <Suspense
          fallback={
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-eddura-800/80 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="w-12 h-12 bg-eddura-100 dark:bg-eddura-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-eddura-600 dark:text-eddura-400" />
                </div>
                <h2 className="text-xl font-medium text-eddura-900 dark:text-eddura-100 mb-2">
                  Loading error details
                </h2>
                <p className="text-eddura-600 dark:text-eddura-400 text-sm">
                  Please wait while we load the error information
                </p>
                <div className="mt-6">
                  <Loader2 className="h-8 w-8 animate-spin text-eddura-600 dark:text-eddura-400 mx-auto" />
                </div>
              </CardContent>
            </Card>
          }
        >
          <AuthErrorContent />
        </Suspense>
      </div>
    </div>
  );
} 