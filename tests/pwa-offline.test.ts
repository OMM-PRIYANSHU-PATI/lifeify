import { describe, it, expect } from "vitest";
import { resolveConflict } from "../lib/pwa/offline-queue";

describe("PWA Offline Queue & Conflict Resolution", () => {
  it("enforces invariant: Server timestamp wins when server entry is newer or equal", () => {
    const clientEntry = {
      timestamp: 1000,
      value: { waterMl: 500 },
    };

    const serverEntryNewer = {
      timestamp: 2000,
      value: { waterMl: 750 },
    };

    const resServerWins = resolveConflict(clientEntry, serverEntryNewer);
    expect(resServerWins.winner).toBe("server");
    expect(resServerWins.finalValue).toEqual({ waterMl: 750 });

    const serverEntryEqual = {
      timestamp: 1000,
      value: { waterMl: 600 },
    };

    const resEqualWins = resolveConflict(clientEntry, serverEntryEqual);
    expect(resEqualWins.winner).toBe("server");
    expect(resEqualWins.finalValue).toEqual({ waterMl: 600 });
  });

  it("applies client entry when server entry is older or null", () => {
    const clientEntry = {
      timestamp: 3000,
      value: { waterMl: 1000 },
    };

    const serverEntryOlder = {
      timestamp: 1500,
      value: { waterMl: 500 },
    };

    const resClientWins = resolveConflict(clientEntry, serverEntryOlder);
    expect(resClientWins.winner).toBe("client");
    expect(resClientWins.finalValue).toEqual({ waterMl: 1000 });

    const resNullWins = resolveConflict(clientEntry, null);
    expect(resNullWins.winner).toBe("client");
    expect(resNullWins.finalValue).toEqual({ waterMl: 1000 });
  });
});
