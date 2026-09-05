import { requireUser } from "@/lib/auth";
import { ScanClient } from "./scan-client";

export const metadata = {
  title: "Prescription OCR Scanner | LIFEIFY",
};

export default async function ScanPage() {
  await requireUser();
  return <ScanClient />;
}
