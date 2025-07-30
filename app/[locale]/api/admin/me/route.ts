import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import Admin from "@/models/Admin";
import connectDB from "@/lib/mongodb";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.type !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const admin = await Admin.findById(session.user.id).select("-password");
  if (!admin) {
    return NextResponse.json({ error: "Admin not found" }, { status: 404 });
  }

  return NextResponse.json({ admin });
} 