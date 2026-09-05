export interface NotificationRuleContext {
  userId: string;
  now?: Date;
  [key: string]: unknown;
}

export interface RuleNotificationDraft {
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  severity: "INFO" | "WARNING" | "CRITICAL";
}

export type NotificationRule = (
  context: NotificationRuleContext
) => Promise<RuleNotificationDraft | null> | RuleNotificationDraft | null;
