import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AlertTriangle, Phone, ShieldAlert, Heart, Droplets, Pill } from "lucide-react";

interface EmergencyPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EmergencyCardPage({ params }: EmergencyPageProps) {
  const { slug } = await params;

  const card = await prisma.emergencyMedicalCard.findUnique({
    where: { slug },
    include: {
      user: {
        include: {
          profile: true,
        },
      },
      contacts: {
        orderBy: { priority: "asc" },
      },
    },
  });

  if (!card || card.revoked || !card.active) {
    return (
      <div className="min-h-screen bg-background text-ink flex items-center justify-center p-6 animate-fadeIn">
        <div className="max-w-md w-full text-center space-y-4 bg-surface p-8 rounded-2xl border border-line shadow-lg">
          <ShieldAlert className="w-16 h-16 text-crisis mx-auto" />
          <h1 className="text-2xl font-bold text-ink">Emergency Link Inactive</h1>
          <p className="text-ink-muted text-sm">
            This emergency profile has been revoked, rotated, or disabled by the cardholder.
          </p>
        </div>
      </div>
    );
  }

  // Record access log asynchronously
  await prisma.emergencyMedicalCard.update({
    where: { id: card.id },
    data: { viewCount: { increment: 1 } },
  }).catch(() => undefined);

  await prisma.emergencyAccessLog.create({
    data: {
      userId: card.userId,
      cardId: card.id,
      accessedAt: new Date(),
    },
  }).catch(() => undefined);

  const allergies = card.allergies ? JSON.parse(card.allergies) : [];
  const conditions = card.conditions ? JSON.parse(card.conditions) : [];
  const medications = card.currentMedications ? JSON.parse(card.currentMedications) : [];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 animate-fadeIn">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Banner */}
        <div className="bg-crisis text-white p-4 rounded-2xl flex items-center gap-3 shadow-lg shadow-crisis/20">
          <AlertTriangle className="w-8 h-8 shrink-0 animate-pulse" />
          <div>
            <h1 className="font-black text-lg tracking-wide uppercase">Emergency Medical ID</h1>
            <p className="text-white/80 text-xs">For Paramedics, Responders, and Treating Physicians</p>
          </div>
        </div>

        {/* Patient Core Info */}
        <div className="bg-surface rounded-2xl p-6 border border-line shadow-sm space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-black text-ink">
                {card.user?.name || "Patient"}
              </h2>
              <p className="text-sm text-ink-soft">
                {card.user?.profile?.age ? `${card.user.profile.age} yrs` : ""} {card.user?.profile?.sex ? `• ${card.user.profile.sex}` : ""}
              </p>
            </div>
            {card.bloodGroup && (
              <div className="px-4 py-2 bg-crisis-soft border border-crisis/30 rounded-xl text-center">
                <div className="text-[10px] uppercase font-bold text-crisis">Blood Type</div>
                <div className="text-2xl font-black text-crisis font-mono">{card.bloodGroup}</div>
              </div>
            )}
          </div>

          {card.importantInfo && (
            <div className="p-3 bg-accent-soft border border-accent/30 rounded-xl text-xs text-accent">
              <strong>Critical Note:</strong> {card.importantInfo}
            </div>
          )}
        </div>

        {/* Allergies */}
        <div className="bg-surface rounded-2xl p-6 border border-line shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-ink flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-crisis" />
            Known Allergies
          </h3>
          {allergies.length === 0 ? (
            <p className="text-xs text-ink-muted">No known drug or food allergies recorded.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {allergies.map((all: any, i: number) => {
                const label = typeof all === "string" ? all : all.substance || all.name;
                return (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-lg bg-crisis-soft border border-crisis/30 text-crisis font-bold text-xs"
                  >
                    ⚠️ {label}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Current Medications */}
        <div className="bg-surface rounded-2xl p-6 border border-line shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-ink flex items-center gap-2">
            <Pill className="w-4 h-4 text-primary" />
            Current Regimen
          </h3>
          {medications.length === 0 ? (
            <p className="text-xs text-ink-muted">No ongoing medications listed.</p>
          ) : (
            <div className="space-y-2">
              {medications.map((m: any, i: number) => {
                const label = typeof m === "string" ? m : `${m.name} ${m.dose || ""}`.trim();
                return (
                  <div key={i} className="p-2.5 bg-surface-subtle border border-line/60 rounded-xl text-xs font-semibold text-ink">
                    {label}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Emergency Contacts with Tap-to-Call */}
        <div className="bg-surface rounded-2xl p-6 border border-line shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-ink flex items-center gap-2">
            <Phone className="w-4 h-4 text-primary" />
            Emergency Contacts (Tap to Call)
          </h3>
          <div className="space-y-2">
            {card.contacts.map((contact) => (
              <a
                key={contact.id}
                href={`tel:${contact.phone}`}
                className="flex items-center justify-between p-3.5 rounded-xl border border-line bg-surface-subtle hover:border-primary transition group"
              >
                <div>
                  <div className="font-bold text-sm text-ink group-hover:text-primary">
                    {contact.name}
                  </div>
                  <div className="text-xs text-ink-muted">{contact.relation}</div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold shadow-xs">
                  <Phone className="w-3.5 h-3.5" />
                  {contact.phone}
                </div>
              </a>
            ))}
          </div>
        </div>

        <div className="text-center text-[11px] text-ink-muted">
          Powered by LIFEIFY • Access logged securely for patient safety.
        </div>
      </div>
    </div>
  );
}
