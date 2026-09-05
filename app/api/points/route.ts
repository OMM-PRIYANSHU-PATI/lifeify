import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getUserGamificationData } from "@/lib/actions/gamification";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await getUserGamificationData();
  return NextResponse.json({ ok: true, profile: data.profile });
}
