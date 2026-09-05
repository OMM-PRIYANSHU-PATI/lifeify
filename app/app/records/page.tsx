import { requireUser } from "@/lib/auth";
import { RecordsClient } from "./records-client";

export const metadata = {
  title: "Medical Records & Vault | LIFEIFY",
};

export default async function RecordsPage() {
  await requireUser();
  return <RecordsClient />;
}
