import { Metadata } from "next";
import { LabsClient } from "./labs-client";

export const metadata: Metadata = {
  title: "Diagnostic Lab Partnerships | LIFEIFY",
  description: "Schedule certified home phlebotomy diagnostic checkups and automate electronic lab report ingestion.",
};

export default function LabsPage() {
  return <LabsClient />;
}
