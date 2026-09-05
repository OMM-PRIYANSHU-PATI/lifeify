import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parsePrescriptionText } from "@/services/ocr";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { rawText, recordId } = body;

    // Deterministic parsing with confidence scores
    const extracted = parsePrescriptionText(rawText ?? "Metformin 500mg OD for 30 days\nTelmisartan 40mg once daily");

    // Save as DRAFT prescription — never auto-promoted!
    const prescription = await prisma.prescription.create({
      data: {
        userId: user.id,
        recordId: recordId ?? null,
        rawText: rawText ?? null,
        status: "draft",
        medicines: {
          create: extracted.medicines.map((m) => ({
            name: m.name,
            dose: m.dose ?? null,
            frequency: m.frequency ?? "OD",
            duration: m.duration ?? null,
            instructions: m.instructions ?? null,
            confidence: m.confidence ?? 0.85,
            confirmed: false,
          })),
        },
      },
      include: { medicines: true },
    });

    return NextResponse.json({
      ok: true,
      prescriptionId: prescription.id,
      medicines: prescription.medicines,
      requiresConfirmation: true,
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
