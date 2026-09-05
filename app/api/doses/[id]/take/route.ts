import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { markDose } from "@/services/medications";
import { audit } from "@/lib/audit";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const updated = await markDose(id, user.id, "TAKEN");
    await audit({
      userId: user.id,
      action: "DOSE_TAKEN",
      entity: "MedicationDose",
      entityId: id,
      metadata: { medicationId: updated.medicationId },
    });

    return NextResponse.json({ ok: true, dose: updated });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
