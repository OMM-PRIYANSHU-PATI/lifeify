import { Metadata } from "next";
import { PharmacyClient } from "./pharmacy-client";

export const metadata: Metadata = {
  title: "E-Pharmacy Refills & Delivery | LIFEIFY",
  description: "Automated medication stock tracking, 1-click refill orders via Tata 1mg, Apollo & Netmeds, and automated inventory replenishment.",
};

export default function PharmacyPage() {
  return <PharmacyClient />;
}
