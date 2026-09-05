import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  return NextResponse.json({
    ok: true,
    account: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      plan: user.plan,
      createdAt: user.createdAt,
    },
  });
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await audit({
      userId: user.id,
      action: "ACCOUNT_DELETED",
      entity: "User",
      entityId: user.id,
    });

    await prisma.user.delete({
      where: { id: user.id },
    });

    const response = NextResponse.json({ ok: true, message: "Account and personal data completely purged" });
    response.cookies.set("token", "", { maxAge: 0, path: "/" });
    return response;
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
