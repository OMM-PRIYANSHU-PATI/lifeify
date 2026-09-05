import { redirect } from "next/navigation";

export default function MedicalRedirectPage() {
  redirect("/app/records");
}
