import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { VoiceClient } from "./voice-client";

export default async function VoicePage() {
  const user = await requireUser();

  const recentVoiceLogs = await prisma.voiceLog.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 15,
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Voice Health Logging</h1>
        <p className="text-sm text-ink-soft">
          Log water, vitals, sleep, mood, or medication using speech with mandatory structured confirmation.
        </p>
      </div>

      <VoiceClient recentVoiceLogs={recentVoiceLogs} />
    </div>
  );
}
