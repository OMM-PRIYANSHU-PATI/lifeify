import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateMedicationEffectiveness } from "@/lib/rules/pharmacokinetics";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const medication = await prisma.medication.findFirst({
      where: { id, userId: user.id },
      include: {
        stock: true,
        schedule: true,
        doses: {
          where: {
            scheduledAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // last 30 days
            },
          },
          select: {
            status: true,
            scheduledAt: true,
          },
        },
      },
    });

    if (!medication) {
      return NextResponse.json({ error: "Medication not found" }, { status: 404 });
    }

    // Calculate days on regimen
    const start = medication.startDate ? new Date(medication.startDate).getTime() : new Date(medication.createdAt).getTime();
    const daysSinceStarted = Math.max(1, Math.round((Date.now() - start) / (24 * 60 * 60 * 1000)));

    // Calculate adherence rate over last 30 days
    let adherenceRate = 90; // baseline if no scheduled doses yet
    if (medication.doses.length > 0) {
      const takenCount = medication.doses.filter((d) => d.status === "taken").length;
      adherenceRate = Math.round((takenCount / medication.doses.length) * 100);
    }

    // Frequency per day
    const frequencyPerDay = medication.schedule.length > 0 ? medication.schedule.length : 1;

    const drugQueryName = medication.activeIngredient || medication.name;
    const projection = calculateMedicationEffectiveness({
      drugName: drugQueryName,
      daysSinceStarted,
      adherenceRate,
      frequencyPerDay,
    });

    return NextResponse.json({
      ok: true,
      medication: {
        id: medication.id,
        name: medication.name,
        activeIngredient: medication.activeIngredient,
        brandName: medication.brandName,
        dose: medication.dose,
        frequency: medication.frequency,
        startDate: medication.startDate,
        daysSinceStarted,
      },
      projection,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
