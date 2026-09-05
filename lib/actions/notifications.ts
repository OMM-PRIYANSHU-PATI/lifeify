"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import {
  markNotificationRead,
  markAllNotificationsRead,
} from "@/lib/notifications/dispatch";
import { runNotificationRules } from "@/lib/notifications/rules";

export async function markReadAction(id: string) {
  const user = await requireUser();
  await markNotificationRead(id, user.id);
  revalidatePath("/app/notifications");
  revalidatePath("/notifications");
  return { ok: true };
}

export async function markAllReadAction() {
  const user = await requireUser();
  await markAllNotificationsRead(user.id);
  revalidatePath("/app/notifications");
  revalidatePath("/notifications");
  return { ok: true };
}

export async function triggerRulesEvaluationAction() {
  const user = await requireUser();
  const result = await runNotificationRules(user.id);
  revalidatePath("/app/notifications");
  revalidatePath("/notifications");
  return { ok: true, dispatched: result.dispatched };
}
