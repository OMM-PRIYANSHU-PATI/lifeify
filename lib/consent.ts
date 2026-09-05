import "server-only";
import { prisma } from "@/lib/db";
import { audit } from "@/lib/audit";
import { ForbiddenError } from "@/lib/errors";

export const CONSENT_TYPES = [
  "data_processing",
  "medical_storage",
  "emergency_card",
  "analytics",
] as const;

export type ConsentType = (typeof CONSENT_TYPES)[number];

export const CONSENT_METADATA: Record<ConsentType, { label: string; description: string; requiredForFeature?: string }> = {
  data_processing: {
    label: "Core Health Data Processing",
    description: "Required to store and analyze personal health logs, calculate health scores, and track adherence.",
    requiredForFeature: "Platform Access",
  },
  medical_storage: {
    label: "Private Medical File Storage",
    description: "Enables encrypted storage of lab reports, scan documents, and prescription photos in your private vault.",
    requiredForFeature: "Medical Records",
  },
  emergency_card: {
    label: "Emergency Medical Card & QR",
    description: "Allows generating a time-limited, privacy-screened public emergency profile for first responders.",
    requiredForFeature: "Emergency Card",
  },
  analytics: {
    label: "Trend Insights & Aggregations",
    description: "Permits computing 7-day and 30-day statistical trends to show health progress over time.",
  },
};

export async function hasConsent(userId: string, type: ConsentType): Promise<boolean> {
  const consent = await prisma.consent.findUnique({
    where: { userId_type: { userId, type } },
  });
  return Boolean(consent?.granted && !consent.revokedAt);
}

export async function requireConsent(userId: string, type: ConsentType): Promise<void> {
  const granted = await hasConsent(userId, type);
  if (!granted) {
    const meta = CONSENT_METADATA[type];
    throw new ForbiddenError(
      `Consent for ${meta.label} is required to access this feature. Please review and update your settings at /settings/privacy.`
    );
  }
}

export async function grantConsent(userId: string, type: ConsentType, version = "1.0") {
  const record = await prisma.consent.upsert({
    where: { userId_type: { userId, type } },
    create: {
      userId,
      type,
      version,
      granted: true,
      grantedAt: new Date(),
      revokedAt: null,
    },
    update: {
      granted: true,
      revokedAt: null,
      version,
    },
  });

  await audit({
    userId,
    action: "CONSENT_GRANTED",
    entity: "Consent",
    entityId: record.id,
    metadata: { type, version },
  });

  return record;
}

export async function revokeConsent(userId: string, type: ConsentType) {
  const record = await prisma.consent.upsert({
    where: { userId_type: { userId, type } },
    create: {
      userId,
      type,
      version: "1.0",
      granted: false,
      grantedAt: new Date(),
      revokedAt: new Date(),
    },
    update: {
      granted: false,
      revokedAt: new Date(),
    },
  });

  await audit({
    userId,
    action: "CONSENT_REVOKED",
    entity: "Consent",
    entityId: record.id,
    metadata: { type },
  });

  return record;
}

export async function getUserConsents(userId: string) {
  const rows = await prisma.consent.findMany({
    where: { userId },
  });

  const consentMap: Record<string, { granted: boolean; grantedAt: Date; revokedAt: Date | null; version: string }> = {};
  for (const r of rows) {
    consentMap[r.type] = {
      granted: r.granted && !r.revokedAt,
      grantedAt: r.grantedAt,
      revokedAt: r.revokedAt,
      version: r.version,
    };
  }

  return CONSENT_TYPES.map((type) => {
    const existing = consentMap[type];
    return {
      type,
      ...CONSENT_METADATA[type],
      granted: existing ? existing.granted : type === "data_processing", // data_processing defaulted on onboarding
      grantedAt: existing?.grantedAt ?? null,
      revokedAt: existing?.revokedAt ?? null,
      version: existing?.version ?? "1.0",
    };
  });
}
