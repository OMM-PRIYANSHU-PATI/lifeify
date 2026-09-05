import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkDrugInteractions } from "@/lib/rules/ddi-matrix";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const {
      candidateDrugs = [],
      foodsOrSubstances = [],
      includeActiveMedications = true,
    } = body;

    const drugList: string[] = [...(Array.isArray(candidateDrugs) ? candidateDrugs : [])];

    if (includeActiveMedications || drugList.length === 0) {
      const activeMeds = await prisma.medication.findMany({
        where: {
          userId: user.id,
          active: true,
        },
        select: {
          name: true,
          activeIngredient: true,
        },
      });

      for (const m of activeMeds) {
        if (m.name) drugList.push(m.name);
        if (m.activeIngredient && m.activeIngredient !== m.name) {
          drugList.push(m.activeIngredient);
        }
      }
    }

    const report = checkDrugInteractions(drugList, { foodsOrSubstances });

    return NextResponse.json({
      ok: true,
      report,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
