/**
 * Helper to submit quiz results reliably.
 * Protects against Next.js "Server Action was not found on the server" errors
 * caused by action hash mismatches when files are recompiled or tabs stay open.
 */
export async function submitQuizSafely(
  quizType: "simulation" | "lightning" | "sleep" | "recovery" | "mood",
  payload: Record<string, unknown>,
  serverActionFn?: () => Promise<{ ok: boolean; message?: string; error?: string }>
): Promise<{ ok: boolean; message: string; error?: string }> {
  // 1. Try server action first if provided
  if (serverActionFn) {
    try {
      const res = await serverActionFn();
      if (res && res.ok) {
        return { ok: true, message: res.message || "Saved successfully!" };
      }
      if (res && !res.ok && res.error) {
        // Business validation error (e.g. invalid numbers)
        return { ok: false, message: "", error: res.error };
      }
    } catch (err) {
      console.warn("Server action call failed or desynced, triggering robust API fallback:", err);
    }
  }

  // 2. Deterministic REST API fallback
  try {
    const res = await fetch("/api/logs/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quizType, payload }),
    });
    const data = await res.json();
    if (res.ok && data.ok) {
      return { ok: true, message: data.message || "Saved successfully!" };
    }
    return { ok: false, message: "", error: data.error || "Failed to save quiz results" };
  } catch (apiErr: unknown) {
    return {
      ok: false,
      message: "",
      error:
        apiErr instanceof Error
          ? apiErr.message
          : "Connection error. Please refresh the page and try again.",
    };
  }
}
