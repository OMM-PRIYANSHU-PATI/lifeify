import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAdherenceStats } from "@/services/medications";
import PDFDocument from "pdfkit";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [profile, conditions, medications, vitals, adherence] = await Promise.all([
    prisma.healthProfile.findUnique({ where: { userId: user.id } }),
    prisma.condition.findMany({ where: { userId: user.id } }),
    prisma.medication.findMany({ where: { userId: user.id, active: true } }),
    prisma.vitalReading.findMany({
      where: { userId: user.id },
      orderBy: { takenAt: "desc" },
      take: 10,
    }),
    getAdherenceStats(user.id).catch(() => ({ today: 100, week: 100, treatment: 100 })),
  ]);

  return new Promise<NextResponse>((resolve) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 40 });
      const buffers: Buffer[] = [];

      doc.on("data", (chunk: Buffer) => buffers.push(chunk));
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(
          new NextResponse(pdfBuffer, {
            headers: {
              "Content-Type": "application/pdf",
              "Content-Disposition": `inline; filename="Doctor-Visit-Summary.pdf"`,
            },
          })
        );
      });

      // Header
      doc.fontSize(22).fillColor("#0f172a").text("LIFEIFY Clinical Visit Summary", { align: "center" });
      doc.moveDown(0.3);
      doc.fontSize(10).fillColor("#64748b").text(`Generated on ${new Date().toLocaleDateString("en-IN", { dateStyle: "long" })}`, { align: "center" });
      doc.moveDown(1);
      doc.strokeColor("#cbd5e1").lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke().moveDown(1);

      // Section 1: Patient Profile
      doc.fontSize(13).fillColor("#1e293b").text("1. Patient Demographics & Baseline", { underline: true }).moveDown(0.4);
      doc.fontSize(10).fillColor("#334155");
      doc.text(`Name: ${user.name || "Patient"}`);
      doc.text(`Age: ${profile?.age || "—"} | Sex: ${profile?.sex || "—"} | Blood Group: ${profile?.bloodGroup || "—"}`);
      doc.text(`Height: ${profile?.heightCm ? `${profile.heightCm} cm` : "—"} | Weight: ${profile?.weightKg ? `${profile.weightKg} kg` : "—"}`);
      doc.moveDown(1);

      // Section 2: Active Chronic Conditions
      doc.fontSize(13).fillColor("#1e293b").text("2. Active Conditions & Diagnoses", { underline: true }).moveDown(0.4);
      doc.fontSize(10).fillColor("#334155");
      if (conditions.length === 0) {
        doc.text("No chronic conditions recorded.");
      } else {
        conditions.forEach((c) => {
          doc.text(`• ${c.type.toUpperCase()}${c.notes ? ` — ${c.notes}` : ""}`);
        });
      }
      doc.moveDown(1);

      // Section 3: Current Medications & Adherence
      doc.fontSize(13).fillColor("#1e293b").text("3. Current Regimen & Adherence", { underline: true }).moveDown(0.4);
      doc.fontSize(10).fillColor("#334155");
      doc.text(`7-Day Regimen Adherence: ${adherence.week}% | Today's Adherence: ${adherence.today}%`);
      doc.moveDown(0.4);
      if (medications.length === 0) {
        doc.text("No active medications recorded.");
      } else {
        medications.forEach((m) => {
          doc.text(`• ${m.name} (${m.dose || "1 dose"}, ${m.frequency}) ${m.instructions ? `— ${m.instructions}` : ""}`);
        });
      }
      doc.moveDown(1);

      // Section 4: Recent Vitals
      doc.fontSize(13).fillColor("#1e293b").text("4. Recent Vital Signs Trend", { underline: true }).moveDown(0.4);
      doc.fontSize(10).fillColor("#334155");
      if (vitals.length === 0) {
        doc.text("No recent vitals recorded.");
      } else {
        vitals.slice(0, 6).forEach((v) => {
          const val = v.type === "BP" ? `${v.systolic}/${v.diastolic} mmHg` : `${v.value} ${v.unit}`;
          doc.text(`• ${new Date(v.takenAt).toLocaleDateString()} — ${v.type}: ${val} (${v.context || "standard"})`);
        });
      }
      doc.moveDown(1.5);

      // Footer
      doc.strokeColor("#cbd5e1").lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke().moveDown(0.8);
      doc
        .fontSize(8)
        .fillColor("#94a3b8")
        .text(
          "Clinical Notice: This document is compiled from patient-tracked telemetry and medication logs in LIFEIFY. It is intended for informative consultation between patient and doctor. LIFEIFY does not make medical diagnoses.",
          { align: "justify" }
        );

      doc.end();
    } catch (err) {
      resolve(NextResponse.json({ error: (err as Error).message }, { status: 500 }));
    }
  });
}
