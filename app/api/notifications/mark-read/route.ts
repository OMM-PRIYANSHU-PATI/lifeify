import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json().catch(() => ({}));
    const { id, all = false } = body;

    if (all) {
      await prisma.notification.updateMany({
        where: { userId: user.id, read: false },
        data: { read: true, readAt: new Date() },
      });
      return NextResponse.json({ ok: true, message: "All notifications marked as read" });
    }

    if (id) {
      await prisma.notification.updateMany({
        where: { id, userId: user.id },
        data: { read: true, readAt: new Date() },
      });
      return NextResponse.json({ ok: true, message: "Notification marked as read" });
    }

    return NextResponse.json({ error: "Specify id or all: true" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
