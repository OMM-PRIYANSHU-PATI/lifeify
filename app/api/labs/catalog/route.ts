import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let catalog = await prisma.labTestCatalog.findMany({
      where: { active: true },
      orderBy: { partnerPriceInr: "asc" },
    });

    if (catalog.length === 0) {
      // Seed default diagnostic test catalog
      await prisma.labTestCatalog.createMany({
        data: [
          {
            code: "HBA1C-HOME",
            name: "HbA1c & Fasting Blood Glucose Panel",
            category: "DIABETIC_PROFILE",
            description: "Glycated hemoglobin (3-month average sugar) + plasma glucose test for diabetic monitoring.",
            sampleType: "BLOOD",
            fastingRequired: true,
            partnerPriceInr: 399,
            partnerLabs: JSON.stringify(["Thyrocare", "Dr Lal PathLabs", "Apollo Diagnostics"]),
          },
          {
            code: "LIPID-EXT",
            name: "Comprehensive Lipid Profile (Cholesterol, HDL, LDL, Triglycerides)",
            category: "LIPID_PROFILE",
            description: "Essential 8-parameter cardiovascular lipid panel to evaluate CVD risk.",
            sampleType: "BLOOD",
            fastingRequired: true,
            partnerPriceInr: 499,
            partnerLabs: JSON.stringify(["SRL Diagnostics", "Thyrocare", "Metropolis"]),
          },
          {
            code: "THYROID-TFT",
            name: "Thyroid Function Test (TSH, Total T3, Total T4)",
            category: "THYROID",
            description: "Gold-standard endocrine screening for hypo/hyperthyroidism.",
            sampleType: "BLOOD",
            fastingRequired: false,
            partnerPriceInr: 350,
            partnerLabs: JSON.stringify(["Thyrocare", "Apollo Diagnostics"]),
          },
          {
            code: "CBC-HEM",
            name: "Complete Blood Count (CBC) with ESR & Platelets",
            category: "CBC",
            description: "Full hematology profile checking hemoglobin, RBC, WBC count, platelet count, and inflammation.",
            sampleType: "BLOOD",
            fastingRequired: false,
            partnerPriceInr: 299,
            partnerLabs: JSON.stringify(["Dr Lal PathLabs", "SRL Diagnostics", "Redcliffe Labs"]),
          },
          {
            code: "FULL-BODY-PRO",
            name: "LIFEIFY 84-Parameter Advanced Annual Health Checkup",
            category: "COMPLETE_CHECKUP",
            description: "Liver function, kidney profile, lipid profile, iron studies, HbA1c, vitamins D & B12.",
            sampleType: "BLOOD",
            fastingRequired: true,
            partnerPriceInr: 1299,
            partnerLabs: JSON.stringify(["Thyrocare", "Apollo Diagnostics", "Healthians"]),
          },
        ],
      });

      catalog = await prisma.labTestCatalog.findMany({
        where: { active: true },
        orderBy: { partnerPriceInr: "asc" },
      });
    }

    const parsed = catalog.map((item) => ({
      ...item,
      partnerLabs: JSON.parse(item.partnerLabs || "[]"),
    }));

    return NextResponse.json({ ok: true, catalog: parsed });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
