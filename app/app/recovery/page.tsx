import { requireUser } from "@/lib/auth";
import { RecoveryClient } from "./recovery-client";

export const metadata = {
  title: "Recovery Protocols | LIFEIFY",
};

export default async function RecoveryPage() {
  await requireUser();
  return <RecoveryClient />;
}
