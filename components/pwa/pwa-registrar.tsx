"use client";

import { useEffect } from "react";

export function PwaRegistrar() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          // Check for updates periodically
          reg.onupdatefound = () => {
            const installing = reg.installing;
            if (installing) {
              installing.onstatechange = () => {
                if (installing.state === "installed" && navigator.serviceWorker.controller) {
                  console.log("[LIFEIFY PWA] New version ready.");
                }
              };
            }
          };
        })
        .catch((err) => {
          console.warn("[LIFEIFY PWA] Service worker registration failed:", err);
        });

      const handleOnline = () => {
        window.dispatchEvent(new CustomEvent("lifeify-network-online"));
      };
      const handleOffline = () => {
        window.dispatchEvent(new CustomEvent("lifeify-network-offline"));
      };

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, []);

  return null;
}
