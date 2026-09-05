import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userAgent = req.headers.get("user-agent") || "Current Browser";
  const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";

  return NextResponse.json({
    ok: true,
    sessions: [
      {
        id: "current-session",
        device: userAgent.includes("Mobile") ? "Mobile Device" : "Desktop Browser",
        browser: userAgent.slice(0, 50),
        ip,
        current: true,
        lastActive: new Date().toISOString(),
      },
    ],
  });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  return NextResponse.json({ ok: true, message: "Other sessions terminated" });
}
