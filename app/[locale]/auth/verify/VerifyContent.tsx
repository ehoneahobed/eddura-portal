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
      <Card className="shadow-xl border-0 w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
          <p className="text-gray-600">Verifying your email...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-xl border-0 w-full max-w-md">
      <CardHeader className="text-center">
        {isSuccess ? (
          <>
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <CardTitle className="text-2xl text-green-600">Email Verified!</CardTitle>
            <CardDescription>
              Your email has been successfully verified. You can now sign in to your account.
            </CardDescription>
          </>
        ) : (
          <>
            <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <CardTitle className="text-2xl text-red-600">Verification Failed</CardTitle>
            <CardDescription>
              {error || "Something went wrong with the verification process."}
            </CardDescription>
          </>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isSuccess && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Your account is now active and ready to use!
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col gap-2">
          <Button asChild className="w-full">
            <Link href="/auth/signin">
              {isSuccess ? "Sign In" : "Back to Sign In"}
            </Link>
          </Button>
          
          {!isSuccess && (
            <Button variant="outline" asChild className="w-full">
              <Link href="/auth/signup">Create New Account</Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 