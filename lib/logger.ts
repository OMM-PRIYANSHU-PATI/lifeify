type LogLevel = "debug" | "info" | "warn" | "error";

interface LogPayload {
  message: string;
  level: LogLevel;
  timestamp: string;
  context?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

// Keys that must be redacted for privacy and security
const SENSITIVE_KEYS = new Set([
  "password",
  "token",
  "secret",
  "cookie",
  "authorization",
  "code",
  "codehash",
  "phonehash",
  "bloodgroup",
  "conditions",
  "allergies",
  "medications",
]);

function redact(obj: unknown, depth = 0): unknown {
  if (depth > 4 || obj == null) return obj;
  if (typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => redact(item, depth + 1));
  }

  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.has(k.toLowerCase())) {
      result[k] = "[REDACTED]";
    } else if (typeof v === "object" && v !== null) {
      result[k] = redact(v, depth + 1);
    } else {
      result[k] = v;
    }
  }
  return result;
}

function formatLog(level: LogLevel, message: string, context?: Record<string, unknown>, err?: unknown): LogPayload {
  const payload: LogPayload = {
    level,
    message,
    timestamp: new Date().toISOString(),
  };

  if (context && Object.keys(context).length > 0) {
    payload.context = redact(context) as Record<string, unknown>;
  }

  if (err instanceof Error) {
    payload.error = {
      name: err.name,
      message: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    };
  }

  return payload;
}

function outputLog(payload: LogPayload) {
  const isDev = process.env.NODE_ENV === "development";

  if (isDev) {
    const colors: Record<LogLevel, string> = {
      debug: "\x1b[34m", // blue
      info: "\x1b[32m",  // green
      warn: "\x1b[33m",  // yellow
      error: "\x1b[31m", // red
    };
    const reset = "\x1b[0m";
    const color = colors[payload.level];
    const prefix = `${color}[LIFEIFY][${payload.level.toUpperCase()}]${reset} ${payload.message}`;
    const ctx = payload.context ? ` ${JSON.stringify(payload.context)}` : "";
    if (payload.level === "error") {
      console.error(prefix + ctx, payload.error ?? "");
    } else if (payload.level === "warn") {
      console.warn(prefix + ctx);
    } else {
      console.log(prefix + ctx);
    }
  } else {
    // Structured JSON log for production log aggregators
    console.log(JSON.stringify(payload));
  }
}

export const logger = {
  debug: (message: string, context?: Record<string, unknown>) => {
    if (process.env.NODE_ENV !== "production") {
      outputLog(formatLog("debug", message, context));
    }
  },
  info: (message: string, context?: Record<string, unknown>) => {
    outputLog(formatLog("info", message, context));
  },
  warn: (message: string, context?: Record<string, unknown>) => {
    outputLog(formatLog("warn", message, context));
  },
  error: (message: string, err?: unknown, context?: Record<string, unknown>) => {
    outputLog(formatLog("error", message, context, err));
  },
};
