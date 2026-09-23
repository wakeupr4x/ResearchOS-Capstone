"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  Compass,
  BookOpen,
  ExternalLink,
  BookmarkPlus,
  Check,
  Loader2,
  Sparkles,
  Filter,
  Columns,
  Globe,
  Radio,
} from "lucide-react";
import { api } from "@/lib/api";
import { DiscoveredPaper } from "@/types";

const CATEGORIES = [
  { label: "All Categories", value: "" },
  { label: "Artificial Intelligence (cs.AI)", value: "cs.AI" },
  { label: "Computation & Language (cs.CL)", value: "cs.CL" },
  { label: "Information Retrieval (cs.IR)", value: "cs.IR" },
  { label: "Machine Learning (cs.LG)", value: "cs.LG" },
  { label: "Computer Vision (cs.CV)", value: "cs.CV" },
  { label: "Quantitative Biology (q-bio)", value: "q-bio" },
];

function DiscoverContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "Retrieval Augmented Generation";
  const [query, setQuery] = useState(initialQuery);
  const [searchMode, setSearchMode] = useState<"arxiv" | "web">("arxiv");
  const [category, setCategory] = useState("");
  const [results, setResults] = useState<DiscoveredPaper[]>([]);
  const [webSynthesis, setWebSynthesis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [savingMap, setSavingMap] = useState<Record<string, boolean>>({});
  const [savedSuccessMap, setSavedSuccessMap] = useState<Record<string, boolean>>({});

  const performSearch = async (searchQuery: string, cat?: string, modeType: "arxiv" | "web" = searchMode) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setWebSynthesis(null);
    try {
      if (modeType === "web") {
        const webData = await api.performWebSearch(searchQuery.trim(), "professional", 6);
        setWebSynthesis(webData.synthesis);
        const mappedResults: DiscoveredPaper[] = webData.results.map((r, i) => ({
          title: r.title,
          authors: r.authors,
          summary: r.snippet,
          published_year: r.year,
          source: "web",
          pdf_url: r.url,
          arxiv_id: `web-${i + 1}`,
          primary_category: "Web Literature",
          in_library: false,
        }));
        setResults(mappedResults);
      } else {
        const data = await api.searchDiscovery(searchQuery, cat || undefined);
        setResults(data.results || []);
      }
    } catch (e) {
      console.error("Discovery search error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    performSearch(initialQuery, category, searchMode);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query, category, searchMode);
  };

  const handleSaveToLibrary = async (paper: DiscoveredPaper, idx: number) => {
    setSavingMap((prev) => ({ ...prev, [idx]: true }));
    try {
      await api.saveDiscoveredPaper(paper);
      setSavedSuccessMap((prev) => ({ ...prev, [idx]: true }));
      window.dispatchEvent(new Event("paper-uploaded"));
    } catch (e) {
      console.error("Failed to save paper to library:", e);
    } finally {
      setSavingMap((prev) => ({ ...prev, [idx]: false }));
    }
  };

  const handleCompareDirectly = async (paper: DiscoveredPaper) => {
    try {
      const saved = await api.saveDiscoveredPaper(paper);
      window.dispatchEvent(new Event("paper-uploaded"));
      router.push(`/compare?p1=${saved.id}`);
    } catch {
      router.push("/compare");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-7 md:p-8 shadow-xs">
        <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
          <Compass className="h-4 w-4" />
          <span>Academic Repositories & Real-Time Web Research</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
          Discover Scientific Literature
        </h1>
        <p className="text-xs md:text-sm text-slate-500 mt-1 font-medium">
          Query open-access scientific repositories (arXiv, PubMed, Semantic Scholar) or run live AI web research.
        </p>

        {/* Dual Mode Switch (arXiv vs Live Web) */}
        <div className="flex items-center space-x-2 pt-6">
          <button
            onClick={() => {
              setSearchMode("arxiv");
              performSearch(query, category, "arxiv");
            }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-2xl text-xs font-bold transition shadow-2xs ${
              searchMode === "arxiv"
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>arXiv Academic Repositories</span>
          </button>

          <button
            onClick={() => {
              setSearchMode("web");
              performSearch(query, category, "web");
            }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-2xl text-xs font-bold transition shadow-2xs ${
              searchMode === "web"
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <Globe className="h-3.5 w-3.5" />
            <span>Live Academic Web Search</span>
          </button>
        </div>
      </div>

      {/* Search Controls */}
      <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search topic, author, algorithm, or methodology (e.g. 'Clinical RAG Self-Correction')..."
            className="w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 py-3 text-xs md:text-sm text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none transition shadow-2xs font-medium"
          />
        </div>

        {searchMode === "arxiv" && (
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              performSearch(query, e.target.value, "arxiv");
            }}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs md:text-sm text-slate-800 font-bold focus:border-blue-600 focus:outline-none transition shadow-2xs"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        )}

        <button
          type="submit"
          disabled={loading}
          className="rounded-2xl bg-blue-600 px-6 py-3 text-xs md:text-sm font-bold text-white hover:bg-blue-700 transition flex items-center justify-center space-x-2 shadow-sm shadow-blue-500/20 disabled:opacity-50 active:scale-98"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          <span>Search Literature</span>
        </button>
      </form>

      {/* Web Synthesis Card (if in Web mode) */}
      {webSynthesis && (
        <div className="bg-white rounded-3xl border border-blue-200 p-7 shadow-xs space-y-3 bg-gradient-to-r from-blue-50/60 to-indigo-50/30">
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-700">
            <Sparkles className="h-4 w-4" />
            <span>AI Executive Web Synthesis</span>
          </div>
          <p className="text-xs md:text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">
            {webSynthesis}
          </p>
        </div>
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-200/90 pb-3 font-semibold">
        <span>Found {results.length} scientific publications</span>
        <span className="font-mono text-[11px]">
          Engine: {searchMode === "arxiv" ? "arXiv Academic Indexer" : "Live Academic Web Crawler"}
        </span>
      </div>

      {/* Results List */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-3 text-slate-500 text-xs">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="font-bold">Querying academic literature corpora...</span>
        </div>
      ) : results.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-16 text-center text-slate-400 text-xs">
          No papers found matching this query. Try broader keywords or change the category filter.
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((paper, idx) => {
            const isSaved = paper.in_library || savedSuccessMap[idx];
            const isSaving = savingMap[idx];

            return (
              <div
                key={paper.arxiv_id || idx}
                className="rounded-3xl border border-slate-200 bg-white p-6 hover:border-blue-300 transition shadow-xs clean-card"
              >
                <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/70">
                        {paper.primary_category || "cs.AI"}
                      </span>
                      {paper.published_year && (
                        <span className="text-[11px] text-slate-400 font-semibold">
                          {paper.published_year}
                        </span>
                      )}
                      {paper.arxiv_id && (
                        <span className="text-[11px] font-mono text-slate-400">
                          {paper.arxiv_id}
                        </span>
                      )}
                    </div>

                    <h2 className="text-base font-extrabold text-slate-900 leading-snug">
                      {paper.title}
                    </h2>

                    <p className="text-xs text-slate-500 font-medium">
                      {paper.authors.join(", ")}
                    </p>

                    <p className="text-xs md:text-sm text-slate-600 leading-relaxed pt-1 line-clamp-3 font-medium">
                      {paper.summary}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 lg:pt-0">
                    <button
                      onClick={() => handleCompareDirectly(paper)}
                      className="flex items-center space-x-1.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 px-3.5 py-2 text-xs font-bold text-slate-700 transition shadow-2xs"
                    >
                      <Columns className="h-3.5 w-3.5 text-indigo-600" />
                      <span>Compare</span>
                    </button>

                    {paper.pdf_url && (
                      <a
                        href={paper.pdf_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center space-x-1.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 px-3.5 py-2 text-xs font-bold text-slate-700 transition shadow-2xs"
                      >
                        <span>Access PDF</span>
                        <ExternalLink className="h-3 w-3 text-blue-600" />
                      </a>
                    )}

                    <button
                      onClick={() => handleSaveToLibrary(paper, idx)}
                      disabled={isSaved || isSaving}
                      className={`flex items-center space-x-1.5 rounded-2xl px-4 py-2 text-xs font-bold transition shadow-xs ${
                        isSaved
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      {isSaving ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : isSaved ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <BookmarkPlus className="h-3.5 w-3.5" />
                      )}
                      <span>{isSaved ? "Saved in Library" : "Save to Library"}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function DiscoverPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs text-slate-400">Loading academic discovery...</div>}>
      <DiscoverContent />
    </Suspense>
  );
}
