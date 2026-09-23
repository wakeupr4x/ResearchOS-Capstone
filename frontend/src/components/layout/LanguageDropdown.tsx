"use client";

import React, { useState, useRef, useEffect } from "react";
import { Globe, Check, ChevronDown } from "lucide-react";
import { useLanguage, LanguageCode } from "@/context/LanguageContext";

const LANGUAGES: { code: LanguageCode; label: string; subLabel: string; flag: string }[] = [
  { code: "en", label: "English", subLabel: "US / Global", flag: "🇺🇸" },
  { code: "hi", label: "हिन्दी", subLabel: "Hindi", flag: "🇮🇳" },
  { code: "ta", label: "தமிழ்", subLabel: "Tamil", flag: "🇮🇳" },
  { code: "te", label: "తెలుగు", subLabel: "Telugu", flag: "🇮🇳" },
  { code: "bn", label: "বাংলা", subLabel: "Bengali", flag: "🇮🇳" },
  { code: "mr", label: "मराठी", subLabel: "Marathi", flag: "🇮🇳" },
  { code: "gu", label: "ગુજરાતી", subLabel: "Gujarati", flag: "🇮🇳" },
  { code: "kn", label: "ಕನ್ನಡ", subLabel: "Kannada", flag: "🇮🇳" },
  { code: "es", label: "Español", subLabel: "Spanish", flag: "🇪🇸" },
  { code: "fr", label: "Français", subLabel: "French", flag: "🇫🇷" },
  { code: "de", label: "Deutsch", subLabel: "German", flag: "🇩🇪" },
  { code: "zh", label: "中文", subLabel: "Chinese", flag: "🇨🇳" },
  { code: "ja", label: "日本語", subLabel: "Japanese", flag: "🇯🇵" },
];

export const LanguageDropdown: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const current = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition shadow-2xs"
        title="Change Platform Language"
      >
        <span className="text-sm">{current.flag}</span>
        <span className="hidden sm:inline font-semibold">{current.label}</span>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 max-h-80 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl z-50 space-y-0.5 animate-fade-in text-xs">
          <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
            Indian & Global Languages
          </div>
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code);
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition ${
                language === lang.code
                  ? "bg-blue-50 text-blue-700 font-bold"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <span className="text-base">{lang.flag}</span>
                <div className="text-left">
                  <span className="block font-medium">{lang.label}</span>
                  <span className="block text-[10px] text-slate-400 font-normal">{lang.subLabel}</span>
                </div>
              </div>
              {language === lang.code && <Check className="h-4 w-4 text-blue-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
