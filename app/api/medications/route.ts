import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createMedication, checkAllergyMatch, checkDuplicateIngredient } from "@/services/medications";
import { audit } from "@/lib/audit";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status"); // active, completed, archived, all

  const where: any = { userId: user.id };
  if (status && status !== "all") {
    if (status === "active") {
      where.active = true;
    } else {
      where.status = status;
    }
  }

  const medications = await prisma.medication.findMany({
    where,
    include: {
      stock: true,
      schedule: true,
      _count: {
        select: { doses: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ ok: true, medications });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const {
      name,
      activeIngredient,
      dose,
      doseUnit = "tablet",
      frequency = "OD",
      customTimes,
      durationDays,
      condition,
      instructions,
      prescribedBy,
      initialStockQty = 30,
      stockUnit = "tablets",
      forceConfirm = false,
    } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Medication name is required" }, { status: 400 });
    }

    // Allergy check
    const allergyMatches = await checkAllergyMatch(user.id, name, activeIngredient);
    if (allergyMatches.length > 0 && !forceConfirm) {
      return NextResponse.json({
        ok: false,
        error: `Allergy conflict: ${allergyMatches.map((a: any) => a.substance || a.name || "Allergen").join(", ")}`,
        allergyWarning: true,
      }, { status: 409 });
    }

    // Duplicate check
    const { warnings } = await checkDuplicateIngredient(user.id, name, activeIngredient);

    const med = await createMedication({
      userId: user.id,
      name: name.trim(),
      activeIngredient: activeIngredient?.trim() || null,
      dose: dose || null,
      doseUnit,
      frequency,
      customTimes,
      durationDays: durationDays ? Number(durationDays) : null,
      condition: condition?.trim() || null,
      instructions: instructions?.trim() || null,
      prescribedBy: prescribedBy?.trim() || null,
      initialStockQty: initialStockQty ? Number(initialStockQty) : null,
      stockUnit,
    });

    await audit({
      userId: user.id,
      action: "MEDICATION_ADDED",
      entity: "Medication",
      entityId: med.id,
      metadata: { name: med.name },
    });

    return NextResponse.json({
      ok: true,
      medication: med,
      duplicateWarnings: warnings,
    }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
