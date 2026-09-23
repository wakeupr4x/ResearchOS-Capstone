"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  BookOpen,
  Check,
  Bookmark,
  Trash2,
  AlertCircle,
  Loader2,
  TrendingUp,
  Layers,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { api } from "@/lib/api";
import { SavedInsight, Paper, LiteratureReviewResponse, ResearchGapsResponse } from "@/types";

export default function InsightsPage() {
  const [activeTab, setActiveTab] = useState<"findings" | "literature" | "gaps">("findings");
  const [insights, setInsights] = useState<SavedInsight[]>([]);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);

  // Literature Review State
  const [litReview, setLitReview] = useState<LiteratureReviewResponse | null>(null);
  const [litLoading, setLitLoading] = useState(false);

  // Research Gaps State
  const [gaps, setGaps] = useState<ResearchGapsResponse | null>(null);
  const [gapsLoading, setGapsLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [insightsData, papersData] = await Promise.all([
        api.getInsights(),
        api.getPapers(),
      ]);
      setInsights(insightsData);
      setPapers(papersData);
    } catch (err) {
      console.error("Failed to load insights:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteInsight = async (id: string) => {
    if (confirm("Delete this saved insight?")) {
      await api.deleteInsight(id);
      setInsights((prev) => prev.filter((i) => i.id !== id));
    }
  };

  const handleGenerateLiteratureReview = async () => {
    if (papers.length === 0) return;
    setLitLoading(true);
    try {
      const res = await api.getLiteratureReview(papers.map((p) => p.id));
      setLitReview(res);
    } catch (e) {
      alert("Failed to generate literature review: " + e);
    } finally {
      setLitLoading(false);
    }
  };

  const handleGenerateResearchGaps = async () => {
    if (papers.length === 0) return;
    setGapsLoading(true);
    try {
      const res = await api.getResearchGaps(papers.map((p) => p.id));
      setGaps(res);
    } catch (e) {
      alert("Failed to identify research gaps: " + e);
    } finally {
      setGapsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-accent-amber uppercase tracking-wider mb-1">
          <Sparkles className="h-4 w-4" />
          <span>Research Intelligence</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground">Findings, Synthesis & Gaps</h1>
        <p className="text-xs text-foreground-muted mt-1">
          Review saved research findings, generate cross-paper literature reviews, and explore observed potential research gaps.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-border pb-2">
        {[
          { id: "findings", label: `Saved Findings (${insights.length})`, icon: Bookmark },
          { id: "literature", label: "Literature Review", icon: BookOpen },
          { id: "gaps", label: "Potential Research Gaps", icon: TrendingUp },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                if (tab.id === "literature" && !litReview) handleGenerateLiteratureReview();
                if (tab.id === "gaps" && !gaps) handleGenerateResearchGaps();
              }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
                isActive
                  ? "bg-primary text-white shadow-sm"
                  : "text-foreground-muted hover:bg-surface-hover hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: SAVED FINDINGS */}
      {activeTab === "findings" && (
        <div className="space-y-4">
          {insights.length === 0 ? (
            <div className="rounded-xl border border-border bg-surface p-12 text-center text-foreground-muted text-xs">
              No saved insights yet. You can bookmark findings and citations while chatting with papers.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insights.map((ins) => (
                <div key={ins.id} className="rounded-xl border border-border bg-surface p-5 space-y-2 relative group shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-accent-amber/10 text-accent-amber border border-accent-amber/20 uppercase font-semibold">
                      {ins.insight_type}
                    </span>
                    <button
                      onClick={() => handleDeleteInsight(ins.id)}
                      className="text-foreground-subtle hover:text-accent-rose p-1 transition opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <h3 className="font-bold text-sm text-foreground">{ins.title}</h3>
                  <p className="text-xs text-foreground-muted leading-relaxed whitespace-pre-line">
                    {ins.content}
                  </p>

                  {ins.paper_title && (
                    <div className="pt-2 text-[11px] text-primary-light flex items-center space-x-1">
                      <BookOpen className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">
                        {ins.paper_title} {ins.page_number ? `(Page ${ins.page_number})` : ""}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: LITERATURE REVIEW */}
      {activeTab === "literature" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-xs text-foreground-muted">
              Synthesizing cross-paper insights across {papers.length} publications in your library.
            </p>
            <button
              onClick={handleGenerateLiteratureReview}
              disabled={litLoading}
              className="flex items-center space-x-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-foreground hover:bg-surface-hover transition"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${litLoading ? "animate-spin" : ""}`} />
              <span>Regenerate Synthesis</span>
            </button>
          </div>

          {litLoading ? (
            <div className="py-24 text-center text-xs text-foreground-muted space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
              <span>Synthesizing themes, consensus, and methodology progression...</span>
            </div>
          ) : litReview && (
            <div className="rounded-xl border border-border bg-surface p-6 space-y-6 text-xs shadow-sm">
              <div className="border-b border-border pb-4">
                <h2 className="text-lg font-bold text-foreground">{litReview.title}</h2>
                <p className="text-xs text-foreground-muted mt-1 leading-relaxed">{litReview.overview}</p>
              </div>

              {/* Themes */}
              <div>
                <h3 className="font-bold text-sm text-foreground text-primary-light mb-3">1. Key Research Themes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {litReview.key_themes.map((theme, idx) => (
                    <div key={idx} className="p-3.5 rounded-lg border border-border bg-surface-card space-y-1.5">
                      <h4 className="font-semibold text-foreground">{theme.theme_name}</h4>
                      <p className="text-foreground-muted text-[11px] leading-relaxed">{theme.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Methodological Progression */}
              <div>
                <h3 className="font-bold text-sm text-foreground text-accent-cyan mb-2">2. Methodological Progression</h3>
                <p className="text-foreground-muted leading-relaxed bg-surface-card p-3.5 rounded-lg border border-border">
                  {litReview.methodological_progression}
                </p>
              </div>

              {/* Consensus & Contradictions */}
              <div>
                <h3 className="font-bold text-sm text-foreground text-accent-emerald mb-2">3. Consensus & Contradictions</h3>
                <p className="text-foreground-muted leading-relaxed bg-surface-card p-3.5 rounded-lg border border-border">
                  {litReview.agreements_and_contradictions}
                </p>
              </div>

              {/* Limitations & Trends */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-foreground text-accent-rose mb-1">Open Challenges</h4>
                  <p className="text-foreground-muted leading-relaxed">{litReview.limitations_and_challenges}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-accent-purple mb-1">Emerging Trends</h4>
                  <p className="text-foreground-muted leading-relaxed">{litReview.emerging_trends}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: RESEARCH GAPS */}
      {activeTab === "gaps" && (
        <div className="space-y-6">
          {gaps && (
            <div className="p-3.5 rounded-xl bg-accent-amber/10 border border-accent-amber/25 flex items-start space-x-2 text-xs text-accent-amber">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{gaps.disclaimer}</span>
            </div>
          )}

          {gapsLoading ? (
            <div className="py-24 text-center text-xs text-foreground-muted space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
              <span>Analyzing repeated limitations and underexplored areas across papers...</span>
            </div>
          ) : gaps && (
            <div className="space-y-4">
              {gaps.potential_gaps.map((gap, idx) => (
                <div key={idx} className="rounded-xl border border-border bg-surface p-5 space-y-3 shadow-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary-light border border-primary/20 uppercase font-semibold">
                      {gap.category}
                    </span>
                    <h3 className="font-bold text-sm text-foreground">{gap.title}</h3>
                  </div>

                  <p className="text-xs text-foreground-muted leading-relaxed">
                    {gap.description}
                  </p>

                  {/* Supporting Evidence */}
                  {gap.supporting_evidence && gap.supporting_evidence.length > 0 && (
                    <div className="p-3 rounded-lg border border-border bg-surface-card text-[11px] space-y-1">
                      <span className="font-semibold text-foreground-subtle block">Supporting Paper Evidence:</span>
                      {gap.supporting_evidence.map((ev, eIdx) => (
                        <div key={eIdx} className="text-foreground-muted">
                          • <span className="text-primary-light">{ev.paper_title}</span> — Page {ev.page_number} ({ev.section})
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-2 text-xs">
                    <span className="font-semibold text-accent-emerald">Suggested Direction: </span>
                    <span className="text-foreground-muted">{gap.suggested_future_direction}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
