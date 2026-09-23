"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, GraduationCap, Microscope, Loader2 } from "lucide-react";
import { ResearchMode } from "@/context/ModeContext";

interface ModeTransitionOverlayProps {
  isTransitioning: boolean;
  targetMode: ResearchMode | null;
}

export const ModeTransitionOverlay: React.FC<ModeTransitionOverlayProps> = ({
  isTransitioning,
  targetMode,
}) => {
  const [dots, setDots] = useState("");

  useEffect(() => {
    if (!isTransitioning) return;
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 250);
    return () => clearInterval(interval);
  }, [isTransitioning]);

  if (!isTransitioning || !targetMode) return null;

  const isStudent = targetMode === "student";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md animate-fade-in text-white p-6">
      <div className="flex flex-col items-center justify-center text-center max-w-md space-y-6">
        {/* Glow Aura Icon */}
        <div className="relative">
          <div
            className={`absolute -inset-4 rounded-full blur-2xl opacity-60 animate-pulse ${
              isStudent ? "bg-amber-500" : "bg-indigo-600"
            }`}
          />
          <div
            className={`relative h-20 w-20 rounded-3xl flex items-center justify-center text-white shadow-2xl border ${
              isStudent
                ? "bg-gradient-to-tr from-amber-600 via-orange-500 to-amber-400 border-amber-300/40"
                : "bg-gradient-to-tr from-blue-700 via-indigo-600 to-cyan-500 border-indigo-300/40"
            }`}
          >
            {isStudent ? (
              <GraduationCap className="h-10 w-10 animate-bounce" />
            ) : (
              <Microscope className="h-10 w-10 animate-bounce" />
            )}
          </div>
        </div>

        {/* Text Details */}
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 text-[11px] font-bold uppercase tracking-wider text-slate-200 border border-white/15">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            <span>Switching Research Universe</span>
          </div>

          <h2 className="text-2xl font-black tracking-tight text-white font-sans">
            {isStudent
              ? "Entering Student Study Studio"
              : "Entering Professional Research Suite"}
            {dots}
          </h2>

          <p className="text-xs text-slate-300 leading-relaxed max-w-sm">
            {isStudent
              ? "Loading NotebookLM conceptual studio, 2-host audio deep dives, ELI5 analogies, and active recall flashcards."
              : "Calibrating empirical benchmarking matrices, LaTeX formulas, PRISMA methodology, and statistical power metrics."}
          </p>
        </div>

        {/* Progress Bar Animation */}
        <div className="w-64 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full animate-[shimmer_1.2s_infinite] ${
              isStudent
                ? "bg-gradient-to-r from-amber-400 via-orange-500 to-amber-300"
                : "bg-gradient-to-r from-blue-400 via-indigo-500 to-cyan-300"
            }`}
            style={{ width: "100%" }}
          />
        </div>
      </div>
    </div>
  );
};
