import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ConsentClient } from "./consent-client";

export default async function ConsentPage() {
  const user = await requireUser();

  const consents = await prisma.consent.findMany({
    where: { userId: user.id },
  });

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">Consent & Data Rights</h1>
        <p className="text-xs text-ink-soft">
          Review, grant, or revoke individual data processing and storage permissions at any time.
        </p>
      </div>

      <ConsentClient initialConsents={consents} />
    </div>
  );
}
