import { NextRequest, NextResponse } from "next/server";
import { destroySession, getSession } from "@/lib/auth/session";
import { audit } from "@/lib/audit";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (session) {
    await audit({
      userId: session.sub,
      action: "LOGOUT",
      entity: "User",
      entityId: session.sub,
      ip: req.headers.get("x-forwarded-for") ?? undefined,
      userAgent: req.headers.get("user-agent") ?? undefined,
    });
  }

  await destroySession();

  return NextResponse.json({ ok: true, message: "Logged out successfully." });
}
