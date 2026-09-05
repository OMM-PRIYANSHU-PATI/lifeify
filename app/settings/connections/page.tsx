import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ConnectionsClient } from "./connections-client";

export const metadata = {
  title: "Wearables & Platform Connections | LIFEIFY",
};

export default async function ConnectionsPage() {
  const user = await requireUser();
  const sources = await prisma.healthDataSource.findMany({
    where: { userId: user.id },
  });

  return (
    <ConnectionsClient
      initialSources={sources.map((s) => ({
        provider: s.provider,
        status: s.status,
        lastSyncAt: s.lastSyncAt ? s.lastSyncAt.toISOString() : null,
      }))}
    />
  );
}
