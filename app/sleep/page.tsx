import { redirect } from "next/navigation";

export default function SleepRedirectPage() {
  redirect("/app/plans/sleep");
}
