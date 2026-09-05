"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Download, X, Smartphone, CheckCircle2, Share } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true); // default true until client checks
  const [isIos, setIsIos] = useState(false);
  const [showIosInstructions, setShowIosInstructions] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if already running in standalone PWA / Android APK WebView mode
    const standaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes("android-app://");

    setIsStandalone(standaloneMode);
    if (standaloneMode) return;

    // Check if user dismissed recently (24 hours)
    const dismissedTimestamp = localStorage.getItem("lifeify_pwa_install_dismissed");
    if (dismissedTimestamp) {
      const hoursSinceDismiss = (Date.now() - Number(dismissedTimestamp)) / (1000 * 60 * 60);
      if (hoursSinceDismiss < 24) {
        setIsDismissed(true);
      } else {
        setIsDismissed(false);
      }
    } else {
      setIsDismissed(false);
    }

    // Check iOS Safari
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua) && !(window as any).MSStream;
    setIsIos(isIosDevice);

    // Listen for native Android Chrome beforeinstallprompt event
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsDismissed(false);
    };

    const handleManualTrigger = () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
      } else if (isIosDevice) {
        setShowIosInstructions(true);
      } else {
        setIsDismissed(false);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("lifeify-open-install-prompt", handleManualTrigger);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("lifeify-open-install-prompt", handleManualTrigger);
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setIsStandalone(true);
      }
      setDeferredPrompt(null);
    } else if (isIos) {
      setShowIosInstructions(true);
    } else {
      // Fallback: reload or direct prompt
      alert("To install LIFEIFY on Android, tap the three dots (⋮) in Chrome and select 'Install app' or 'Add to Home screen'.");
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem("lifeify_pwa_install_dismissed", Date.now().toString());
  };

  if (isStandalone || isDismissed) return null;

  return (
    <>
      {/* Amazon-style Sticky Mobile & Desktop Install App Banner */}
      <div className="sticky top-0 z-50 w-full bg-surface/95 backdrop-blur-md border-b border-line px-3 py-2.5 sm:px-6 shadow-xs animate-slideDown">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* App Icon */}
            <div className="relative w-10 h-10 shrink-0 rounded-xl overflow-hidden shadow-xs border border-primary/20 bg-primary">
              <img
                src="/icon-192.png"
                alt="LIFEIFY App"
                className="w-full h-full object-cover"
              />
            </div>

            {/* App Info */}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs sm:text-sm font-black text-ink truncate leading-tight">
                  LIFEIFY Health App
                </h4>
                <span className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary-soft text-primary-dark">
                  ★ 4.9 • Official
                </span>
              </div>
              <p className="text-[11px] text-ink-soft truncate leading-tight mt-0.5">
                Fast, full-screen Android &amp; Web App experience
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleInstallClick}
              className="lif-btn-primary py-1.5 px-3.5 sm:px-4 text-xs font-black shadow-xs flex items-center gap-1.5 whitespace-nowrap bg-primary hover:bg-primary-dark text-white rounded-xl"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install App</span>
            </button>

            <button
              onClick={handleDismiss}
              className="p-1.5 text-ink-muted hover:text-ink rounded-lg hover:bg-surface-subtle transition-colors"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* iOS Safari Instruction Modal */}
      {showIosInstructions && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl bg-surface border border-line p-6 shadow-xl space-y-4 animate-slideUp">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">📲</span>
                <h3 className="text-sm font-black text-ink">Install on iPhone / iPad</h3>
              </div>
              <button
                onClick={() => setShowIosInstructions(false)}
                className="text-ink-muted hover:text-ink p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-ink-soft leading-relaxed">
              Safari supports installing LIFEIFY directly as a full-screen app without the App Store:
            </p>

            <ol className="space-y-2.5 text-xs text-ink font-medium list-decimal list-inside bg-surface-subtle p-3 rounded-2xl border border-line">
              <li className="flex items-center gap-2">
                <span>1. Tap the Share button</span>
                <Share className="w-3.5 h-3.5 text-primary" />
                <span>at bottom</span>
              </li>
              <li>2. Scroll down and tap <strong>&quot;Add to Home Screen&quot;</strong></li>
              <li>3. Tap <strong>&quot;Add&quot;</strong> at top-right</li>
            </ol>

            <button
              onClick={() => setShowIosInstructions(false)}
              className="lif-btn-primary w-full py-2.5 text-xs font-bold"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
}
