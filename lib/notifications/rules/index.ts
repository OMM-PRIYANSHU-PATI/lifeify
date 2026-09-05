import { NotificationRule } from "./types";
import { medicationDueRule } from "./medication-due";
import { missedDoseRule } from "./missed-dose";
import { lowStockRule } from "./low-stock";
import { refillDueRule } from "./refill-due";
import { checkinDueRule } from "./checkin-due";
import { followupDueRule } from "./followup-due";
import { notify } from "../dispatch";
import { logger } from "@/lib/logger";

export const NOTIFICATION_RULES: NotificationRule[] = [
  medicationDueRule,
  missedDoseRule,
  lowStockRule,
  refillDueRule,
  checkinDueRule,
  followupDueRule,
];

/**
 * Evaluate all registered notification rules for a user and dispatch any triggered notifications.
 */
export async function runNotificationRules(userId: string) {
  const context = { userId, now: new Date() };
  let dispatched = 0;

  for (const rule of NOTIFICATION_RULES) {
    try {
      const draft = await rule(context);
      if (draft) {
        await notify(
          userId,
          draft.type,
          draft.title,
          draft.body,
          draft.data,
          draft.severity
        );
        dispatched++;
      }
    } catch (err) {
      logger.error("Error evaluating notification rule", err, { userId });
    }
  }

  return { dispatched };
}
