import { requireUser } from "@/lib/auth";
import { AccountClient } from "./account-client";

export const metadata = {
  title: "Account Settings | LIFEIFY",
};

export default async function AccountPage() {
  await requireUser();
  return <AccountClient />;
}
