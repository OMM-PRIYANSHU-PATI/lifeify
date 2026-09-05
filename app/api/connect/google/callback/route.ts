import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectWearableProvider } from "@/lib/actions/wearables";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Connect Google Health Connect
  await connectWearableProvider("google_health_connect");

  return NextResponse.redirect(new URL("/app/wearables?connected=google", req.url));
}
