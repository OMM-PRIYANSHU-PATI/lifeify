import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { computeAnalytics } from "@/services/analytics";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  const { searchParams } = new URL(req.url);
  const range = searchParams.get("range") || "30d"; // 7d, 30d, 90d, 12m

  const data = await computeAnalytics(user?.id, range);
  return NextResponse.json({
    ok: true,
    ...data,
  });
}
