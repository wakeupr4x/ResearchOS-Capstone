"use client";

import React, { useState, useEffect } from "react";
import {
  BookMarked,
  Sparkles,
  Loader2,
  Copy,
  Check,
  Download,
  Presentation,
  CheckSquare,
  Square,
  BookOpen,
  ArrowRight,
  GitFork,
} from "lucide-react";
import { api } from "@/lib/api";
import { Paper, LiteratureReviewResponse } from "@/types";
import { MarkdownRenderer } from "@/components/chat/MarkdownRenderer";
import { PresentationModal } from "@/components/research/PresentationModal";
import { FlowchartGenerator } from "@/components/research/FlowchartGenerator";

export default function LiteratureReviewPage() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [themeFocus, setThemeFocus] = useState("");
  const [review, setReview] = useState<LiteratureReviewResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showDiagram, setShowDiagram] = useState(false);

  // Presentation State
  const [isPresModalOpen, setIsPresModalOpen] = useState(false);
  const [presentation, setPresentation] = useState<any>(null);
  const [presLoading, setPresLoading] = useState(false);

  useEffect(() => {
    api.getPapers().then((data) => {
      setPapers(data);
      if (data.length >= 2) {
        setSelectedIds([data[0].id, data[1].id]);
      } else if (data.length === 1) {
        setSelectedIds([data[0].id]);
      }
    }).catch(() => {});
  }, []);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleGenerate = async () => {
    if (selectedIds.length === 0) {
      alert("Please select at least one paper to synthesize.");
      return;
    }
    setLoading(true);
    try {
      const res = await api.getLiteratureReview(selectedIds, themeFocus.trim() || undefined);
      setReview(res);
    } catch (e: any) {
      alert("Literature Review error: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMakePresentation = async () => {
    if (!review) return;
    setIsPresModalOpen(true);
    setPresLoading(true);
    try {
      const res = await api.generatePresentation(
        selectedIds,
        review.title || "Thematic Literature Review",
        "professional"
      );
      setPresentation(res);
    } catch (e: any) {
      alert("Presentation generation failed: " + e.message);
    } finally {
      setPresLoading(false);
    }
  };

  const copySynthesis = () => {
    if (!review) return;
    const text = `# ${review.title}\n\n${review.overview}\n\n## Methodological Progression\n${review.methodological_progression}\n\n## Agreements and Contradictions\n${review.agreements_and_contradictions}\n\n## Limitations & Challenges\n${review.limitations_and_challenges}\n\n## Emerging Trends\n${review.emerging_trends}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-7 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            <BookMarked className="h-4 w-4" />
            <span>Automated Systematic Synthesis</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Literature Review Generator
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1 font-medium">
            Cross-paper thematic synthesis analyzing methodological progressions, points of consensus, contradictions, and emerging trends.
          </p>
        </div>

        {review && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowDiagram(!showDiagram)}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition shadow-2xs"
            >
              <GitFork className="h-4 w-4 text-cyan-600" />
              <span>Diagram</span>
            </button>
            <button
              onClick={handleMakePresentation}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white transition shadow-sm shadow-indigo-500/20"
            >
              <Presentation className="h-4 w-4" />
              <span>Export to Slides</span>
            </button>
            <button
              onClick={copySynthesis}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition shadow-2xs"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              <span>{copied ? "Copied" : "Copy Text"}</span>
            </button>
          </div>
        )}
      </div>

      {showDiagram && (
        <FlowchartGenerator
          title="Literature Review Thematic Convergence & Progression"
        />
      )}

      {/* Configuration Box */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-5">
        <h2 className="text-sm font-extrabold text-slate-900">
          1. Select Publications to Include in Review ({selectedIds.length} selected)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {papers.map((p) => {
            const isSelected = selectedIds.includes(p.id);
            return (
              <div
                key={p.id}
                onClick={() => toggleSelect(p.id)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-start space-x-3 ${
                  isSelected
                    ? "bg-blue-50/80 border-blue-300 shadow-2xs"
                    : "bg-slate-50/60 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div className="mt-0.5">
                  {isSelected ? (
                    <CheckSquare className="h-4 w-4 text-blue-600" />
                  ) : (
                    <Square className="h-4 w-4 text-slate-400" />
                  )}
                </div>
                <div className="space-y-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                    {p.title}
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium">
                    {p.authors ? p.authors[0] : "Author"} • {p.publication_year || 2024}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-2">
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            2. Thematic Focus or Research Hypothesis (Optional)
          </label>
          <input
            type="text"
            value={themeFocus}
            onChange={(e) => setThemeFocus(e.target.value)}
            placeholder="e.g. Grounded reasoning, inference scaling laws, hallucination mitigation..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs md:text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none transition shadow-2xs font-medium"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleGenerate}
            disabled={loading || selectedIds.length === 0}
            className="flex items-center space-x-2 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 px-6 py-3 text-xs md:text-sm font-bold text-white transition shadow-sm shadow-blue-500/25 active:scale-98"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            <span>{loading ? "Synthesizing Cross-Paper Literature Review..." : "Generate Literature Review"}</span>
          </button>
        </div>
      </div>

      {/* Results Canvas */}
      {review && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6 animate-fade-in">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">{review.title}</h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">{review.overview}</p>
          </div>

          {/* Key Thematic Pillars */}
          {review.key_themes && review.key_themes.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider text-[11px] text-blue-600">
                Core Identified Research Themes
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {review.key_themes.map((t, idx) => (
                  <div key={idx} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-1.5 shadow-2xs">
                    <h4 className="font-extrabold text-sm text-slate-900">{t.theme_name}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">{t.description}</p>
                    {t.supporting_papers && t.supporting_papers.length > 0 && (
                      <div className="pt-2 text-[10px] text-slate-400 font-semibold">
                        Papers: {t.supporting_papers.join(", ")}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Structured Analysis Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs md:text-sm">
            <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-2">
              <span className="font-black text-slate-900 text-xs uppercase tracking-wider block text-indigo-600">
                📈 Methodological Progression
              </span>
              <p className="text-slate-700 leading-relaxed font-medium">{review.methodological_progression}</p>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-2">
              <span className="font-black text-slate-900 text-xs uppercase tracking-wider block text-amber-600">
                ⚖️ Agreements & Contradictions
              </span>
              <p className="text-slate-700 leading-relaxed font-medium">{review.agreements_and_contradictions}</p>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-2">
              <span className="font-black text-slate-900 text-xs uppercase tracking-wider block text-rose-600">
                ⚠️ Current Limitations & Bottlenecks
              </span>
              <p className="text-slate-700 leading-relaxed font-medium">{review.limitations_and_challenges}</p>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-2">
              <span className="font-black text-slate-900 text-xs uppercase tracking-wider block text-emerald-600">
                🚀 Emerging Trends & Future Horizons
              </span>
              <p className="text-slate-700 leading-relaxed font-medium">{review.emerging_trends}</p>
            </div>
          </div>
        </div>
      )}

      {/* Presentation Modal */}
      <PresentationModal
        isOpen={isPresModalOpen}
        onClose={() => setIsPresModalOpen(false)}
        presentation={presentation}
        loading={presLoading}
        topicTitle={review?.title || "Literature Review Presentation"}
      />
    </div>
  );
}
