import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      code: "NOT_IMPLEMENTED",
      message: "Apple Sign-in is scheduled for V2. Please use Phone OTP login.",
    },
    { status: 501 }
  );
}
