import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const record = await prisma.medicalRecord.findFirst({
    where: { id, userId: user.id },
    include: { file: true },
  });

  if (!record) return NextResponse.json({ error: "Record not found" }, { status: 404 });

  return NextResponse.json({
    id: record.id,
    title: record.title,
    fileUrl: record.fileUrl ?? (record.file ? record.file.path : null),
    mimeType: record.mimeType ?? (record.file ? record.file.mimeType : "application/pdf"),
  });
}
