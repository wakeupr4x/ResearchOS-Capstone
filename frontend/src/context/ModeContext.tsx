"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { ModeTransitionOverlay } from "@/components/layout/ModeTransitionOverlay";

export type ResearchMode = "student" | "professional";

interface ModeContextType {
  mode: ResearchMode;
  setMode: (mode: ResearchMode) => void;
  toggleMode: () => void;
  isStudent: boolean;
  isProfessional: boolean;
  isTransitioning: boolean;
  targetMode: ResearchMode | null;
  // Student NotebookLM Specific Features
  isAudioOverviewPlaying: boolean;
  setIsAudioOverviewPlaying: (playing: boolean) => void;
  activeStudyCard: string | null;
  setActiveStudyCard: (cardId: string | null) => void;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export function ModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ResearchMode>("professional");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [targetMode, setTargetMode] = useState<ResearchMode | null>(null);
  const [isAudioOverviewPlaying, setIsAudioOverviewPlaying] = useState(false);
  const [activeStudyCard, setActiveStudyCard] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("researchos_mode") as ResearchMode;
    if (saved === "student" || saved === "professional") {
      setModeState(saved);
    }
  }, []);

  const setMode = (newMode: ResearchMode) => {
    if (newMode === mode) return;
    setTargetMode(newMode);
    setIsTransitioning(true);

    setTimeout(() => {
      setModeState(newMode);
      localStorage.setItem("researchos_mode", newMode);
      setTimeout(() => {
        setIsTransitioning(false);
        setTargetMode(null);
      }, 500);
    }, 850);
  };

  const toggleMode = () => {
    const next = mode === "student" ? "professional" : "student";
    setMode(next);
  };

  return (
    <ModeContext.Provider
      value={{
        mode,
        setMode,
        toggleMode,
        isStudent: mode === "student",
        isProfessional: mode === "professional",
        isTransitioning,
        targetMode,
        isAudioOverviewPlaying,
        setIsAudioOverviewPlaying,
        activeStudyCard,
        setActiveStudyCard,
      }}
    >
      {children}
      <ModeTransitionOverlay
        isTransitioning={isTransitioning}
        targetMode={targetMode}
      />
    </ModeContext.Provider>
  );
}

export function useMode() {
  const context = useContext(ModeContext);
  if (!context) {
    throw new Error("useMode must be used within a ModeProvider");
  }
  return context;
}
