import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { generateDoctorAccessCodeAction, redeemDoctorAccessCodeAction } from "@/lib/actions/doctor";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { action, code } = body;

    if (action === "generate") {
      const res = await generateDoctorAccessCodeAction();
      return NextResponse.json(res);
    }

    if (action === "redeem") {
      if (!code) {
        return NextResponse.json({ error: "Access code is required" }, { status: 400 });
      }
      const res = await redeemDoctorAccessCodeAction(code);
      if (!res.ok) {
        return NextResponse.json(res, { status: 400 });
      }
      return NextResponse.json(res);
    }

    return NextResponse.json({ error: "Invalid action. Use 'generate' or 'redeem'" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
