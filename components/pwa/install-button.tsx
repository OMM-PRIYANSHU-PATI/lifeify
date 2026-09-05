"use client";

import React, { useState, useEffect } from "react";
import { Download, Smartphone, CheckCircle } from "lucide-react";

export function PwaInstallButton({ className }: { className?: string }) {
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const standalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true;
      setIsInstalled(standalone);
    }
  }, []);

  const handleClick = () => {
    window.dispatchEvent(new Event("lifeify-open-install-prompt"));
  };

  if (isInstalled) {
    return (
      <div className="flex items-center gap-2 text-xs font-semibold text-primary bg-primary-soft px-3 py-2 rounded-xl border border-primary/20">
        <CheckCircle className="w-4 h-4" />
        <span>LIFEIFY App Installed (Standalone Mode)</span>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border border-primary/20 bg-primary-soft/40 p-4 space-y-3 ${className || ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-sm shadow-xs">
            📱
          </div>
          <div>
            <h4 className="text-xs font-bold text-ink">Install LIFEIFY on Android / iOS</h4>
            <p className="text-[11px] text-ink-soft">
              Amazon-style standalone webapp with offline caching and quick access.
            </p>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={handleClick}
        className="lif-btn-primary w-full py-2 px-3 text-xs font-bold flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white rounded-xl shadow-xs"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install WebApp / Android App</span>
      </button>
    </div>
  );
}
