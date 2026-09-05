import { requireUser } from "@/lib/auth";
import { ExportClient } from "./export-client";

export const metadata = {
  title: "Data Export | LIFEIFY",
};

export default async function ExportPage() {
  await requireUser();
  return <ExportClient />;
}
