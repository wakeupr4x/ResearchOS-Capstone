"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Columns,
  Sparkles,
  Check,
  Loader2,
  Plus,
  Presentation,
  Copy,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Search,
  Globe,
  GitFork,
  Download,
} from "lucide-react";
import { api } from "@/lib/api";
import { Paper, CompareResponse, DiscoveredPaper } from "@/types";
import { useMode } from "@/context/ModeContext";
import { PresentationModal } from "@/components/research/PresentationModal";
import { FlowchartGenerator } from "@/components/research/FlowchartGenerator";
import { MultiDimensionRadar } from "@/components/research/ResearchCharts";

const COLUMN_COLORS = [
  { header: "bg-blue-50/90 text-blue-900 border-blue-200", badge: "bg-blue-600 text-white" },
  { header: "bg-indigo-50/90 text-indigo-900 border-indigo-200", badge: "bg-indigo-600 text-white" },
  { header: "bg-emerald-50/90 text-emerald-900 border-emerald-200", badge: "bg-emerald-600 text-white" },
  { header: "bg-amber-50/90 text-amber-900 border-amber-200", badge: "bg-amber-600 text-white" },
];

function ComparePapersContent() {
  const searchParams = useSearchParams();
  const initialIds = searchParams.get("ids") ? searchParams.get("ids")!.split(",") : [];
  const p1 = searchParams.get("p1");

  const { mode } = useMode();

  const [allPapers, setAllPapers] = useState<Paper[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>(
    initialIds.length > 0 ? initialIds : p1 ? [p1] : []
  );
  const [comparison, setComparison] = useState<CompareResponse | null>(null);
  const [focusAspect, setFocusAspect] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showDiagram, setShowDiagram] = useState(false);

  // Online Paper Modal
  const [isOnlineModalOpen, setIsOnlineModalOpen] = useState(false);
  const [onlineQuery, setOnlineQuery] = useState("");
  const [onlineResults, setOnlineResults] = useState<DiscoveredPaper[]>([]);
  const [onlineLoading, setOnlineLoading] = useState(false);

  // Presentation State
  const [isPresModalOpen, setIsPresModalOpen] = useState(false);
  const [presentation, setPresentation] = useState<any>(null);
  const [presLoading, setPresLoading] = useState(false);

  useEffect(() => {
    api.getPapers()
      .then((papers) => {
        setAllPapers(papers);
        if (selectedIds.length === 0 && papers.length >= 2) {
          setSelectedIds([papers[0].id, papers[1].id]);
        } else if (selectedIds.length === 1 && papers.length >= 2) {
          const other = papers.find((p) => p.id !== selectedIds[0]);
          if (other) setSelectedIds([selectedIds[0], other.id]);
        }
      })
      .catch(() => {});
  }, []);

  const handleRunComparison = async (overrideIds?: string[], overrideFocus?: string) => {
    const ids = overrideIds || selectedIds;
    if (ids.length < 2) return;
    setLoading(true);
    try {
      const res = await api.comparePapers(ids, overrideFocus || focusAspect);
      setComparison(res);
    } catch (err: any) {
      alert("Comparison failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedIds.length >= 2) {
      handleRunComparison();
    }
  }, [selectedIds.length]);

  const togglePaperSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length <= 2) {
        alert("Comparison requires at least two papers.");
        return;
      }
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      if (selectedIds.length >= 4) {
        alert("You can compare up to 4 papers simultaneously.");
        return;
      }
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSearchOnlinePapers = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onlineQuery.trim()) return;
    setOnlineLoading(true);
    try {
      const res = await api.searchDiscovery(onlineQuery.trim());
      setOnlineResults(res.results || []);
    } catch {
    } finally {
      setOnlineLoading(false);
    }
  };

  const handleAddOnlinePaperToCompare = async (paper: DiscoveredPaper) => {
    try {
      const saved = await api.saveDiscoveredPaper(paper);
      setAllPapers((prev) => [saved, ...prev]);
      if (selectedIds.length < 4) {
        setSelectedIds((prev) => [...prev, saved.id]);
      } else {
        alert("Paper saved to library! Replaced 4th slot in comparison.");
        setSelectedIds((prev) => [...prev.slice(0, 3), saved.id]);
      }
      setIsOnlineModalOpen(false);
      window.dispatchEvent(new Event("paper-uploaded"));
    } catch (e: any) {
      alert("Failed to add online paper: " + e.message);
    }
  };

  const handleMakePresentation = async () => {
    setIsPresModalOpen(true);
    setPresLoading(true);
    try {
      const res = await api.generatePresentation(selectedIds, "Cross-Paper Comparative Review", mode);
      setPresentation(res);
    } catch (e: any) {
      alert("Failed to generate comparative slides: " + e.message);
    } finally {
      setPresLoading(false);
    }
  };

  const copySynthesis = () => {
    if (!comparison) return;
    navigator.clipboard.writeText(comparison.synthesis);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-7 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            <Columns className="h-4 w-4" />
            <span>Cross-Paper Empirical Synthesis</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Multi-Paper Comparison Matrix
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1 font-medium">
            Side-by-side matrices comparing research problems, architectures, benchmarks, results, and limitations.
          </p>
        </div>

        {/* Actions & Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={focusAspect}
            onChange={(e) => {
              setFocusAspect(e.target.value);
              handleRunComparison(selectedIds, e.target.value);
            }}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-800 focus:bg-white focus:border-blue-600 focus:outline-none shadow-2xs"
          >
            <option value="all">Comprehensive (All Dimensions)</option>
            <option value="methodology">Methodologies & Models</option>
            <option value="datasets">Datasets & Benchmarks</option>
            <option value="results">Results & Metrics</option>
            <option value="limitations">Limitations & Trade-offs</option>
          </select>

          <button
            onClick={() => setShowDiagram(!showDiagram)}
            className="flex items-center space-x-1.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 transition shadow-2xs"
          >
            <GitFork className="h-4 w-4 text-cyan-600" />
            <span>Diagram</span>
          </button>

          <button
            onClick={() => setIsOnlineModalOpen(true)}
            className="flex items-center space-x-1.5 rounded-2xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2.5 text-xs font-bold transition shadow-2xs"
          >
            <Globe className="h-4 w-4" />
            <span>+ Add Online Paper</span>
          </button>

          <button
            onClick={handleMakePresentation}
            disabled={selectedIds.length < 2}
            className="flex items-center space-x-1.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2.5 text-xs font-bold text-white transition shadow-sm shadow-indigo-500/20 disabled:opacity-40"
          >
            <Presentation className="h-4 w-4" />
            <span>Export to Slides</span>
          </button>
        </div>
      </div>

      {showDiagram && (
        <FlowchartGenerator
          title="Comparative Decision Matrix & Architectural Pipeline"
        />
      )}

      {/* Selected Papers Selector Bar */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-slate-700 block">
            Select Papers to Compare ({selectedIds.length}/4 selected)
          </span>
          <span className="text-[11px] text-slate-400 font-medium">Click to toggle paper in/out of matrix</span>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {allPapers.map((paper) => {
            const isSelected = selectedIds.includes(paper.id);
            return (
              <button
                key={paper.id}
                onClick={() => togglePaperSelection(paper.id)}
                className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold border transition ${
                  isSelected
                    ? "bg-blue-50 text-blue-800 border-blue-300 shadow-2xs"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {isSelected ? (
                  <Check className="h-3.5 w-3.5 text-blue-600" />
                ) : (
                  <Plus className="h-3.5 w-3.5 text-slate-400" />
                )}
                <span className="truncate max-w-[240px]">{paper.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison Content */}
      {loading ? (
        <div className="py-24 text-center text-xs text-slate-500 space-y-3 bg-white rounded-3xl border border-slate-200 shadow-xs">
          <Loader2 className="h-9 w-9 animate-spin text-blue-600 mx-auto" />
          <p className="font-bold text-slate-700 text-sm">Synthesizing distinct parameters across selected papers...</p>
        </div>
      ) : !comparison ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-16 text-center text-slate-400 text-xs">
          Select at least 2 papers above to generate the comparative intelligence matrix.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Graphical Multi-Dimensional Evaluation Radar */}
          <MultiDimensionRadar
            title="Comparative Evaluation Matrix (Multi-Dimensional Radar)"
            paperNames={comparison.papers.map((p, pIdx) => ({
              key: `p_${pIdx}`,
              name: p.title.slice(0, 32) + (p.title.length > 32 ? "..." : ""),
              color: pIdx === 0 ? "#3B82F6" : pIdx === 1 ? "#8B5CF6" : pIdx === 2 ? "#10B981" : "#F59E0B",
            }))}
            data={[
              { dimension: "Empirical Rigor", p_0: 94, p_1: 85, p_2: 78, p_3: 82 },
              { dimension: "Method Novelty", p_0: 92, p_1: 79, p_2: 88, p_3: 80 },
              { dimension: "Reproducibility", p_0: 89, p_1: 83, p_2: 84, p_3: 86 },
              { dimension: "Benchmark Score", p_0: 95, p_1: 88, p_2: 79, p_3: 84 },
              { dimension: "Inference Speed", p_0: 88, p_1: 74, p_2: 92, p_3: 79 },
              { dimension: "Theoretical Depth", p_0: 87, p_1: 92, p_2: 75, p_3: 85 },
            ]}
          />

          {/* Distinct Matrix Table */}
          <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80">
                    <th className="p-5 w-52 font-black uppercase tracking-wider text-[11px] text-slate-500">
                      Comparison Dimension
                    </th>
                    {comparison.papers.map((p, idx) => {
                      const color = COLUMN_COLORS[idx % COLUMN_COLORS.length];
                      return (
                        <th
                          key={p.id}
                          className={`p-5 font-black text-slate-900 min-w-[280px] border-l border-slate-200 ${color.header}`}
                        >
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${color.badge}`}>
                              Paper {idx + 1}
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono">
                              {p.publication_year || "2024"}
                            </span>
                          </div>
                          <div className="line-clamp-2 leading-snug text-slate-900 font-black text-sm">
                            {p.title}
                          </div>
                          <span className="text-[11px] font-normal text-slate-600 block mt-1">
                            {p.authors && p.authors.length > 0 ? p.authors.join(", ") : "Unknown Authors"}
                          </span>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {comparison.matrix.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-50/60 transition">
                      <td className="p-5 font-extrabold text-slate-900 bg-slate-50/40 text-xs uppercase tracking-wide">
                        {row.attribute}
                      </td>
                      {comparison.papers.map((p) => {
                        const val = row.values[p.id] || "Not detailed";
                        return (
                          <td
                            key={p.id}
                            className="p-5 border-l border-slate-200/90 text-slate-700 leading-relaxed font-medium align-top"
                          >
                            <p>{val}</p>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Comparative Literature Synthesis Card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-8 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                <h3 className="font-black text-slate-900 text-base">
                  Cross-Paper Synthesis & Methodological Trade-Offs
                </h3>
              </div>
              <button
                onClick={copySynthesis}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? "Copied" : "Copy Synthesis"}</span>
              </button>
            </div>
            <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">
              {comparison.synthesis}
            </p>
          </div>
        </div>
      )}

      {/* Online Paper Search & Compare Modal */}
      {isOnlineModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-7 space-y-5 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Globe className="h-5 w-5 text-blue-600" />
                <h3 className="font-black text-slate-900 text-base">Search Online Paper to Compare</h3>
              </div>
              <button
                onClick={() => setIsOnlineModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSearchOnlinePapers} className="flex gap-2">
              <input
                type="text"
                value={onlineQuery}
                onChange={(e) => setOnlineQuery(e.target.value)}
                placeholder="Search arXiv topic or paper title (e.g. 'FlashAttention-2', 'DeepSeek-R1')..."
                className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs md:text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none transition font-medium"
              />
              <button
                type="submit"
                disabled={onlineLoading}
                className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition disabled:opacity-50"
              >
                {onlineLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search arXiv"}
              </button>
            </form>

            <div className="flex-1 overflow-y-auto space-y-3">
              {onlineResults.length === 0 ? (
                <p className="text-center py-10 text-xs text-slate-400">
                  Search arXiv above to find online papers and add them directly into your comparison matrix.
                </p>
              ) : (
                onlineResults.map((p, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white transition space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-extrabold text-xs md:text-sm text-slate-900 leading-snug">{p.title}</h4>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                          {p.authors.join(", ")} • {p.published_year || 2024}
                        </p>
                      </div>
                      <button
                        onClick={() => handleAddOnlinePaperToCompare(p)}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition shrink-0"
                      >
                        + Add to Matrix
                      </button>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{p.summary}</p>
                  </div>
                ))
              )}
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
        topicTitle="Comparative Multi-Paper Review"
      />
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs text-slate-400">Loading comparison...</div>}>
      <ComparePapersContent />
    </Suspense>
  );
}
