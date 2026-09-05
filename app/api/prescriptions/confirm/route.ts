import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createMedication, checkAllergyMatch, checkDuplicateIngredient } from "@/services/medications";
import { audit } from "@/lib/audit";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { prescriptionId, medicines: editedMeds, forceConfirm = false } = body;

    if (!prescriptionId) {
      return NextResponse.json({ error: "Prescription ID is required" }, { status: 400 });
    }

    const prescription = await prisma.prescription.findFirst({
      where: { id: prescriptionId, userId: user.id },
      include: { medicines: true },
    });

    if (!prescription) {
      return NextResponse.json({ error: "Prescription not found" }, { status: 404 });
    }

    // Use edited medicines if provided, otherwise existing parsed medicines
    const medsToProcess = editedMeds && Array.isArray(editedMeds) && editedMeds.length > 0
      ? editedMeds
      : prescription.medicines;

    const createdMedications = [];
    const allergyWarnings: string[] = [];
    const duplicateWarnings: string[] = [];

    for (const item of medsToProcess) {
      const medName = item.name || item.medicineName || "Unknown Medication";
      const activeIngredient = item.activeIngredient || item.saltName || null;

      // Allergy check
      const allergyMatches = await checkAllergyMatch(user.id, medName, activeIngredient);
      if (allergyMatches.length > 0) {
        allergyWarnings.push(`${medName} conflicts with allergy: ${allergyMatches.map((a: any) => a.substance || a.name || "Allergen").join(", ")}`);
        if (!forceConfirm) {
          continue; // skip or block unless force confirmed
        }
      }

      // Duplicate check
      const { warnings } = await checkDuplicateIngredient(user.id, medName, activeIngredient);
      if (warnings.length > 0) {
        duplicateWarnings.push(...warnings);
      }

      const durationDays = typeof item.durationDays === "number" ? item.durationDays : (parseInt(item.duration) || 30);
      const frequency = item.frequency || "OD";
      
      const created = await createMedication({
        userId: user.id,
        prescriptionId: prescription.id,
        name: medName,
        activeIngredient,
        dose: item.dose || "1",
        doseUnit: item.doseUnit || "tablet",
        frequency,
        durationDays,
        instructions: item.instructions || null,
        initialStockQty: durationDays > 0 ? durationDays : 30,
        stockUnit: item.doseUnit || "tablets",
      });

      createdMedications.push(created);

      // If item had an ID in DB, update confirmed status
      if (item.id) {
        await prisma.prescriptionMedicine.update({
          where: { id: item.id },
          data: { confirmed: true, name: medName, frequency, dose: item.dose },
        }).catch(() => undefined);
      }
    }

    await prisma.prescription.update({
      where: { id: prescription.id },
      data: { status: "confirmed" },
    });

    await audit({
      userId: user.id,
      action: "PRESCRIPTION_CONFIRMED",
      entity: "Prescription",
      entityId: prescription.id,
      metadata: { medicationCount: createdMedications.length },
    });

    return NextResponse.json({
      ok: true,
      prescriptionId: prescription.id,
      createdMedications,
      allergyWarnings,
      duplicateWarnings,
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
