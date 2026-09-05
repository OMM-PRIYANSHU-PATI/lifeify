"use client";

import { useState, useEffect } from "react";

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা" },
  { code: "mr", name: "Marathi", nativeName: "मराठी" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી" },
];

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const [selectedLang, setSelectedLang] = useState<string>("en");
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    const saved = localStorage.getItem("lifeify_locale") || "en";
    setSelectedLang(saved);
  }, []);

  const handleSelect = (code: string) => {
    setSelectedLang(code);
    localStorage.setItem("lifeify_locale", code);
    document.cookie = `lifeify_locale=${code}; path=/; max-age=31536000`;
    setIsOpen(false);
  };

  const currentOption = SUPPORTED_LANGUAGES.find((l) => l.code === selectedLang) || SUPPORTED_LANGUAGES[0];

  return (
    <div className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink shadow-sm hover:bg-background transition-colors focus:outline-none"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span className="lif-emoji" aria-hidden>🌐</span>
        <span>{currentOption.nativeName}</span>
        <svg className="w-3.5 h-3.5 text-ink-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 bottom-full mb-2 z-50 w-44 rounded-xl border border-line bg-surface p-1 shadow-lg ring-1 ring-black/5">
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-ink-muted">
              Select Language / भाषा
            </div>
            <div className="max-h-56 overflow-y-auto space-y-0.5">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelect(lang.code)}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-left font-medium transition-colors ${
                    selectedLang === lang.code
                      ? "bg-primary-soft text-primary-dark font-bold"
                      : "text-ink hover:bg-background"
                  }`}
                >
                  <span>{lang.nativeName}</span>
                  <span className="text-[10px] text-ink-muted">{lang.name}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
