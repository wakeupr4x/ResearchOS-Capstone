"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  UploadCloud,
  GraduationCap,
  Microscope,
  TrendingUp,
  Sparkles,
  ArrowRight,
  BookOpen,
  Volume2,
} from "lucide-react";
import { useMode } from "@/context/ModeContext";
import { useLanguage } from "@/context/LanguageContext";
import { UserProfileDropdown } from "@/components/auth/UserProfileDropdown";
import { LanguageDropdown } from "@/components/layout/LanguageDropdown";

interface TopNavProps {
  onOpenUpload: () => void;
  onOpenAuthModal: () => void;
}

const TRENDING_PAPERS = [
  {
    title: "Attention Is All You Need",
    authors: "Vaswani et al.",
    year: "2017",
    category: "cs.CL",
    query: "Attention Is All You Need transformer",
  },
  {
    title: "DeepSeek-R1: Incentivizing Reasoning in LLMs via RL",
    authors: "DeepSeek-AI",
    year: "2025",
    category: "cs.AI",
    query: "DeepSeek-R1 reasoning reinforcement learning",
  },
  {
    title: "Retrieval-Augmented Generation for Knowledge-Intensive Tasks",
    authors: "Lewis et al.",
    year: "2020",
    category: "cs.CL",
    query: "Retrieval-Augmented Generation Lewis RAG",
  },
];

export const TopNav: React.FC<TopNavProps> = ({ onOpenUpload, onOpenAuthModal }) => {
  const router = useRouter();
  const { mode, toggleMode, isStudent } = useMode();
  const { t } = useLanguage();
  const [quickQuery, setQuickQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickQuery.trim()) {
      router.push(`/discover?q=${encodeURIComponent(quickQuery.trim())}`);
      setIsDropdownOpen(false);
      setQuickQuery("");
    }
  };

  const selectTrending = (query: string) => {
    router.push(`/discover?q=${encodeURIComponent(query)}`);
    setIsDropdownOpen(false);
  };

  return (
    <header className="h-18 border-b border-slate-200/90 bg-white/90 backdrop-blur-md px-6 md:px-8 flex items-center justify-between sticky top-0 z-40 shadow-xs">
      {/* Search Bar with Popular Research Papers Dropdown */}
      <div ref={searchContainerRef} className="relative w-80 md:w-96">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={quickQuery}
            onFocus={() => setIsDropdownOpen(true)}
            onChange={(e) => setQuickQuery(e.target.value)}
            placeholder="Search papers, arXiv topics, authors, methods..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 pl-10 pr-4 py-2.5 text-xs md:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:outline-none transition shadow-2xs font-medium"
          />
        </form>

        {isDropdownOpen && (
          <div className="absolute top-12 left-0 right-0 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl z-50 animate-fade-in space-y-2">
            <div className="flex items-center space-x-1.5 px-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <TrendingUp className="h-3.5 w-3.5 text-blue-600" />
              <span>Trending Research Publications</span>
            </div>

            <div className="space-y-1">
              {TRENDING_PAPERS.map((paper, idx) => (
                <button
                  key={idx}
                  onClick={() => selectTrending(paper.query)}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 transition group flex items-center justify-between"
                >
                  <div className="space-y-0.5 truncate pr-2">
                    <p className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition truncate">
                      {paper.title}
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {paper.authors} • {paper.year}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold shrink-0">
                    {paper.category}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Controls: Language Selector, Student vs Professional Mode, Upload & User Profile */}
      <div className="flex items-center space-x-3">
        {/* Language Selector */}
        <LanguageDropdown />

        {/* Student vs Professional Universe Switch */}
        <button
          onClick={toggleMode}
          className={`relative flex items-center space-x-2 rounded-2xl p-1.5 pr-3 text-xs font-bold transition shadow-2xs border ${
            isStudent
              ? "bg-amber-50/90 text-amber-900 border-amber-300 hover:bg-amber-100"
              : "bg-indigo-50/90 text-indigo-900 border-indigo-200 hover:bg-indigo-100"
          }`}
          title="Toggle between NotebookLM Student Mode and Professional Mode"
        >
          <div
            className={`h-7 w-7 rounded-xl flex items-center justify-center text-white shadow-2xs transition-transform duration-300 ${
              isStudent ? "bg-amber-600 rotate-0" : "bg-indigo-600 rotate-360"
            }`}
          >
            {isStudent ? (
              <GraduationCap className="h-4 w-4" />
            ) : (
              <Microscope className="h-4 w-4" />
            )}
          </div>
          <div className="text-left hidden lg:block">
            <span className="block leading-tight font-extrabold text-[11px]">
              {isStudent ? "Student Mode" : "Professional Mode"}
            </span>
            <span className="text-[9px] text-slate-500 font-medium block">
              {isStudent ? "NotebookLM View" : "Empirical & Rigorous"}
            </span>
          </div>
        </button>

        {/* Upload Paper Button */}
        <button
          onClick={onOpenUpload}
          className="hidden sm:flex items-center space-x-2 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-98 transition px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-blue-500/20"
        >
          <UploadCloud className="h-4 w-4" />
          <span>Upload Paper</span>
        </button>

        {/* User Account / Profile Panel */}
        <UserProfileDropdown onOpenProfileModal={onOpenAuthModal} />
      </div>
    </header>
  );
};
