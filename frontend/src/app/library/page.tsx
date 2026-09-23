"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Search,
  Filter,
  Grid,
  List as ListIcon,
  Star,
  Trash2,
  MessageSquare,
  Columns,
  Sparkles,
  ExternalLink,
  FileText,
  Clock,
  Tag,
  CheckSquare,
  Square,
  AlertCircle,
  RefreshCw,
  Presentation,
  GitFork,
} from "lucide-react";
import { api } from "@/lib/api";
import { Paper } from "@/types";
import { PresentationModal } from "@/components/research/PresentationModal";
import { useMode } from "@/context/ModeContext";

export default function LibraryPage() {
  const router = useRouter();
  const { mode } = useMode();
  const [papers, setPapers] = useState<Paper[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [loading, setLoading] = useState(true);

  // Presentation State
  const [isPresModalOpen, setIsPresModalOpen] = useState(false);
  const [presentation, setPresentation] = useState<any>(null);
  const [presLoading, setPresLoading] = useState(false);

  const fetchPapers = async () => {
    try {
      setLoading(true);
      const data = await api.getPapers(searchQuery || undefined, selectedTag || undefined);
      setPapers(data);
    } catch (err) {
      console.error("Error fetching library papers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPapers();
    window.addEventListener("paper-uploaded", fetchPapers);
    return () => window.removeEventListener("paper-uploaded", fetchPapers);
  }, [searchQuery, selectedTag]);

  const toggleSelectPaper = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === papers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(papers.map((p) => p.id));
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Are you sure you want to remove this paper from your library?")) {
      try {
        await api.deletePaper(id);
        setPapers((prev) => prev.filter((p) => p.id !== id));
        setSelectedIds((prev) => prev.filter((item) => item !== id));
      } catch (err) {
        alert("Failed to delete paper.");
      }
    }
  };

  const handleCompareSelected = () => {
    if (selectedIds.length < 2) {
      alert("Please select at least 2 papers to compare.");
      return;
    }
    router.push(`/compare?ids=${selectedIds.join(",")}`);
  };

  const handleChatSelected = () => {
    if (selectedIds.length === 0) return;
    router.push(`/chat?paper_ids=${selectedIds.join(",")}`);
  };

  const handleMakePresentationSelected = async () => {
    if (selectedIds.length === 0) return;
    setIsPresModalOpen(true);
    setPresLoading(true);
    try {
      const res = await api.generatePresentation(selectedIds, "Selected Papers Executive Briefing", mode);
      setPresentation(res);
    } catch (e: any) {
      alert("Failed to create presentation: " + e.message);
    } finally {
      setPresLoading(false);
    }
  };

  const allTags = Array.from(new Set(papers.flatMap((p) => p.tags || [])));

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-7 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            <BookOpen className="h-4 w-4" />
            <span>Academic Knowledge Base</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Paper Library</h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1 font-medium">
            Manage, tag, and read full-text indexed publications with section-aware provenance.
          </p>
        </div>

        {/* Multi-Select Action Bar */}
        {selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 p-2 rounded-2xl bg-blue-50/80 border border-blue-200 text-xs">
            <span className="font-extrabold text-blue-900 px-3">
              {selectedIds.length} selected
            </span>
            <button
              onClick={handleCompareSelected}
              className="flex items-center space-x-1.5 rounded-xl bg-blue-600 px-3.5 py-2 font-bold text-white hover:bg-blue-700 transition shadow-2xs"
            >
              <Columns className="h-3.5 w-3.5" />
              <span>Compare</span>
            </button>
            <button
              onClick={handleChatSelected}
              className="flex items-center space-x-1.5 rounded-xl bg-white border border-slate-200 px-3.5 py-2 font-bold text-slate-800 hover:bg-slate-50 transition shadow-2xs"
            >
              <MessageSquare className="h-3.5 w-3.5 text-blue-600" />
              <span>Chat</span>
            </button>
            <button
              onClick={handleMakePresentationSelected}
              className="flex items-center space-x-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 font-bold text-white hover:bg-indigo-700 transition shadow-2xs"
            >
              <Presentation className="h-3.5 w-3.5" />
              <span>Make Slides</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 w-full md:w-auto">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search publications by title, authors, or abstract..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 pl-11 pr-4 py-2.5 text-xs md:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:outline-none transition shadow-2xs font-medium"
          />
        </div>

        {/* Tags filter & View Mode toggles */}
        <div className="flex items-center space-x-3 w-full md:w-auto justify-between">
          <div className="flex items-center space-x-1.5 overflow-x-auto max-w-md py-1">
            <button
              onClick={() => setSelectedTag(null)}
              className={`text-xs px-3 py-1.5 rounded-xl border transition shrink-0 font-bold ${
                selectedTag === null
                  ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              All Tags
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`text-xs px-3 py-1.5 rounded-xl border transition shrink-0 font-bold ${
                  selectedTag === tag
                    ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-1 border border-slate-200 rounded-xl p-1 bg-slate-50 shrink-0">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg ${viewMode === "grid" ? "bg-white text-blue-600 shadow-2xs" : "text-slate-400 hover:text-slate-700"}`}
              title="Grid View"
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg ${viewMode === "list" ? "bg-white text-blue-600 shadow-2xs" : "text-slate-400 hover:text-slate-700"}`}
              title="List View"
            >
              <ListIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Papers View */}
      {loading ? (
        <div className="py-24 text-center text-slate-400 text-xs">
          Loading library publications...
        </div>
      ) : papers.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-20 text-center space-y-3">
          <BookOpen className="h-12 w-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-black text-slate-900">Your library is currently empty</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
            Upload your first research PDF or search open-access academic publications via Academic Discovery.
          </p>
        </div>
      ) : viewMode === "grid" ? (
        /* Grid Mode */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {papers.map((paper) => {
            const isSelected = selectedIds.includes(paper.id);

            return (
              <div
                key={paper.id}
                className={`rounded-3xl border transition flex flex-col justify-between p-6 relative group clean-card ${
                  isSelected
                    ? "border-blue-500 bg-blue-50/20 shadow-md shadow-blue-500/10"
                    : "border-slate-200 bg-white hover:border-blue-300"
                }`}
              >
                <div>
                  {/* Top Bar with Select checkbox & Status */}
                  <div className="flex items-center justify-between mb-3">
                    <button
                      onClick={() => toggleSelectPaper(paper.id)}
                      className="text-slate-400 hover:text-blue-600 transition"
                    >
                      {isSelected ? (
                        <CheckSquare className="h-5 w-5 text-blue-600" />
                      ) : (
                        <Square className="h-5 w-5" />
                      )}
                    </button>

                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {paper.status.toUpperCase()}
                      </span>
                      <button
                        onClick={(e) => handleDelete(paper.id, e)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded transition opacity-0 group-hover:opacity-100"
                        title="Delete paper"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <Link href={`/papers/${paper.id}`} className="block space-y-2">
                    <h3 className="font-extrabold text-slate-900 group-hover:text-blue-600 transition line-clamp-2 text-base leading-snug">
                      {paper.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium line-clamp-1">
                      {paper.authors.length > 0 ? paper.authors.join(", ") : "Unknown Authors"}
                    </p>
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed font-normal pt-1">
                      {paper.abstract || "No abstract available. Open workspace to analyze text."}
                    </p>
                  </Link>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-400 text-[11px] font-bold">
                    {paper.publication_year || "2024"}
                  </span>
                  <Link
                    href={`/papers/${paper.id}`}
                    className="font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <span>Open Workspace</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List Mode */
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100">
          {papers.map((paper) => {
            const isSelected = selectedIds.includes(paper.id);

            return (
              <div
                key={paper.id}
                className={`p-5 flex items-center justify-between gap-4 transition hover:bg-slate-50/70 ${
                  isSelected ? "bg-blue-50/30" : ""
                }`}
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <button
                    onClick={() => toggleSelectPaper(paper.id)}
                    className="text-slate-400 hover:text-blue-600 transition shrink-0"
                  >
                    {isSelected ? (
                      <CheckSquare className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Square className="h-5 w-5" />
                    )}
                  </button>
                  <div className="truncate space-y-0.5">
                    <Link
                      href={`/papers/${paper.id}`}
                      className="font-extrabold text-sm text-slate-900 hover:text-blue-600 transition truncate block"
                    >
                      {paper.title}
                    </Link>
                    <p className="text-xs text-slate-500 truncate font-medium">
                      {paper.authors.join(", ")} • {paper.publication_year || "2024"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <Link
                    href={`/papers/${paper.id}`}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-blue-50 hover:text-blue-700 text-xs font-bold text-slate-700 transition shadow-2xs"
                  >
                    Workspace
                  </Link>
                  <button
                    onClick={(e) => handleDelete(paper.id, e)}
                    className="text-slate-400 hover:text-rose-600 p-1.5 rounded transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Presentation Modal */}
      <PresentationModal
        isOpen={isPresModalOpen}
        onClose={() => setIsPresModalOpen(false)}
        presentation={presentation}
        loading={presLoading}
        topicTitle="Selected Papers Executive Briefing"
      />
    </div>
  );
}
