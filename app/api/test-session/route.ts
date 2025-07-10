import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("🔍 [TEST_SESSION] Testing session...");
    const session = await auth();
    
    console.log("🔍 [TEST_SESSION] Session result:", {
      hasSession: !!session,
      hasUser: !!session?.user,
      userType: session?.user?.type,
      userEmail: session?.user?.email
    });
    
    return NextResponse.json({
      success: true,
      session: {
        hasSession: !!session,
        hasUser: !!session?.user,
        userType: session?.user?.type,
        userEmail: session?.user?.email,
        userId: session?.user?.id
      }
    });
  } catch (error) {
    console.error("❌ [TEST_SESSION] Error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
} 