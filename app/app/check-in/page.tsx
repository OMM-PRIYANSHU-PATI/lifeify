import { requireUser } from "@/lib/auth";
import { CheckInClient } from "./checkin-client";

export const metadata = {
  title: "Daily Health Check-In | LIFEIFY",
};

export default async function CheckInPage() {
  await requireUser();
  return <CheckInClient />;
}
