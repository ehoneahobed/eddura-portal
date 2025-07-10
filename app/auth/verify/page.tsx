"use client";

import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import VerifyContent from "./VerifyContent";

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Suspense
        fallback={
          <Card className="shadow-xl border-0 w-full max-w-md">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
              <p className="text-gray-600">Loading verification...</p>
            </CardContent>
          </Card>
        }
      >
        <VerifyContent />
      </Suspense>
    </div>
  );
}