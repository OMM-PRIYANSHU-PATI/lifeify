import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const host = req.headers.get("host") || "localhost:3000";
  const protocol = req.headers.get("x-forwarded-proto") || "http";
  const redirectUri = `${protocol}://${host}/api/connect/google/callback`;

  // Deterministic OAuth URL for Google Health Connect
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=lifeify-health-connect&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=https://www.googleapis.com/auth/health.records.read&state=${user.id}`;

  return NextResponse.json({ ok: true, authUrl });
}
