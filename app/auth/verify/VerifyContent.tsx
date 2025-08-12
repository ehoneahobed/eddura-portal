"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

export default function VerifyContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const verifyEmail = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Verification failed");
      }

      setIsSuccess(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Verification failed");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setError("Invalid verification link");
      setIsLoading(false);
      return;
    }

    verifyEmail();
  }, [token, verifyEmail]);

  if (isLoading) {
    return (
      <Card className="border-0 shadow-lg bg-white/80 dark:bg-eddura-800/80 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <div className="w-12 h-12 bg-eddura-100 dark:bg-eddura-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="h-6 w-6 text-eddura-600 dark:text-eddura-400 animate-spin" />
          </div>
          <h2 className="text-xl font-medium text-eddura-900 dark:text-eddura-100 mb-2">
            Verifying your account
          </h2>
          <p className="text-eddura-600 dark:text-eddura-400 text-sm">
            Please wait while we verify your email address
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg bg-white/80 dark:bg-eddura-800/80 backdrop-blur-sm">
      <CardContent className="p-8 text-center">
        {isSuccess ? (
          <>
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl font-medium text-green-600 dark:text-green-400 mb-2">
              Email verified!
            </h2>
            <p className="text-eddura-600 dark:text-eddura-400 text-sm mb-6">
              Your email has been successfully verified. You can now sign in to your account.
            </p>
            <Button 
              asChild 
              className="w-full h-11 bg-eddura-600 hover:bg-eddura-700 text-white font-medium rounded-lg transition-colors"
            >
              <Link href="/auth/signin">
                Sign in
              </Link>
            </Button>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-medium text-red-600 dark:text-red-400 mb-2">
              Verification failed
            </h2>
            <p className="text-eddura-600 dark:text-eddura-400 text-sm mb-6">
              {error || "Something went wrong with the verification process."}
            </p>
            <div className="space-y-3">
              <Button 
                asChild 
                className="w-full h-11 bg-eddura-600 hover:bg-eddura-700 text-white font-medium rounded-lg transition-colors"
              >
                <Link href="/auth/signin">
                  Back to sign in
                </Link>
              </Button>
              <Button 
                variant="outline" 
                asChild 
                className="w-full h-11 border-eddura-200 dark:border-eddura-600 text-eddura-700 dark:text-eddura-300 hover:bg-eddura-50 dark:hover:bg-eddura-700 hover:border-eddura-300 dark:hover:border-eddura-500 transition-colors rounded-lg"
              >
                <Link href="/auth/signup">Create new account</Link>
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
} 