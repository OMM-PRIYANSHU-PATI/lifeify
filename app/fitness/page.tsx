import { redirect } from "next/navigation";

export default function FitnessRedirectPage() {
  redirect("/app/plans/fitness");
}
