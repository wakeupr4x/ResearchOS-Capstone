"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  FileText,
  Sparkles,
  MessageSquare,
  FileSpreadsheet,
  Layers,
  FileEdit,
  ArrowLeft,
  ExternalLink,
  Download,
  Loader2,
  Check,
  Send,
  Columns,
  RefreshCw,
  Copy,
  Presentation,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Quote,
  Eye,
  SlidersHorizontal,
} from "lucide-react";
import { api } from "@/lib/api";
import {
  PaperDetail,
  SummaryResponse,
  ExtractionResponse,
  Message,
  Citation,
  CitationExportResponse,
  PresentationResponse,
} from "@/types";
import { useMode } from "@/context/ModeContext";
import { MarkdownRenderer } from "@/components/chat/MarkdownRenderer";
import { PresentationModal } from "@/components/research/PresentationModal";
import { NotebookLMStudyPanel } from "@/components/research/NotebookLMStudyPanel";

export default function PaperDetailPage() {
  const params = useParams();
  const router = useRouter();
  const paperId = params.id as string;
  const { mode, isStudent } = useMode();

  const [paper, setPaper] = useState<PaperDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Split Screen Left Pane Tab
  const [mediaTab, setMediaTab] = useState<"pdf" | "figures" | "tables" | "chunks">("pdf");

  // Split Screen Right Pane Tab
  const [intelTab, setIntelTab] = useState<"summary" | "extraction" | "chat" | "notes" | "notebooklm">("summary");

  useEffect(() => {
    if (isStudent) {
      setIntelTab("notebooklm");
    }
  }, [isStudent]);

  // Summary State
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  // Extraction State
  const [extraction, setExtraction] = useState<ExtractionResponse | null>(null);
  const [extractionLoading, setExtractionLoading] = useState(false);

  // Chat State
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([
    "What is the core contribution of this work?",
    "What datasets and evaluation benchmarks were used?",
    "What limitations do the authors acknowledge?",
  ]);

  // Citations Modal State
  const [isCitationModalOpen, setIsCitationModalOpen] = useState(false);
  const [citationsData, setCitationsData] = useState<CitationExportResponse | null>(null);
  const [citationFormat, setCitationFormat] = useState<"bibtex" | "apa" | "mla" | "ieee">("bibtex");
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  // Presentation Generator Modal State
  const [isPresModalOpen, setIsPresModalOpen] = useState(false);
  const [presentation, setPresentation] = useState<PresentationResponse | null>(null);
  const [presLoading, setPresLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Notes State
  const [notes, setNotes] = useState<any[]>([]);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");

  const fetchPaper = async () => {
    try {
      setLoading(true);
      const data = await api.getPaper(paperId);
      setPaper(data);
      if (data.summary && data.summary.executive_summary) {
        setSummary({
          paper_id: data.id,
          paper_title: data.title,
          ...data.summary,
          citations: [],
        } as SummaryResponse);
      }
      if (data.extracted_metadata && data.extracted_metadata.research_problem) {
        setExtraction({
          paper_id: data.id,
          paper_title: data.title,
          ...data.extracted_metadata,
          citations: [],
        } as ExtractionResponse);
      }
    } catch (err) {
      console.error("Error loading paper details:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotes = async () => {
    try {
      const data = await api.getNotes(paperId);
      setNotes(data);
    } catch {}
  };

  useEffect(() => {
    fetchPaper();
    fetchNotes();
  }, [paperId]);

  const handleGenerateSummary = async () => {
    setSummaryLoading(true);
    try {
      const res = await api.getPaperSummary(paperId);
      setSummary(res);
    } catch (e) {
      alert("Failed to generate summary: " + e);
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleGenerateExtraction = async () => {
    setExtractionLoading(true);
    try {
      const res = await api.getPaperExtraction(paperId);
      setExtraction(res);
    } catch (e) {
      alert("Failed to extract fields: " + e);
    } finally {
      setExtractionLoading(false);
    }
  };

  const handleOpenCitations = async () => {
    setIsCitationModalOpen(true);
    if (!citationsData) {
      try {
        const res = await api.getCitations(paperId);
        setCitationsData(res);
      } catch (e) {
        console.error("Failed to load citations:", e);
      }
    }
  };

  const copyCitation = (text: string, format: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(format);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  const handleGeneratePresentation = async () => {
    setIsPresModalOpen(true);
    if (!presentation) {
      setPresLoading(true);
      try {
        const res = await api.generatePresentation([paperId], undefined, mode);
        setPresentation(res);
        setCurrentSlide(0);
      } catch (e) {
        alert("Failed to generate presentation: " + e);
      } finally {
        setPresLoading(false);
      }
    }
  };

  const handleSendChat = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const query = customQuery || chatInput;
    if (!query.trim() || chatLoading) return;

    const userMsg: Message = {
      id: "temp-" + Date.now(),
      conversation_id: "local",
      role: "user",
      content: query,
      citations: [],
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await api.sendChat({
        content: query,
        paper_ids: [paperId],
        mode,
      });
      setMessages((prev) => [...prev, res.message]);
      if (res.suggested_questions && res.suggested_questions.length > 0) {
        setSuggestedQuestions(res.suggested_questions);
      }
    } catch (err) {
      alert("Chat error: " + err);
    } finally {
      setChatLoading(false);
    }
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim() || !newNoteContent.trim()) return;
    try {
      const res = await api.createNote({
        title: newNoteTitle,
        content: newNoteContent,
        paper_id: paperId,
      });
      setNotes((prev) => [res, ...prev]);
      setNewNoteTitle("");
      setNewNoteContent("");
    } catch (e) {
      alert("Failed to save note: " + e);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-sm font-semibold text-slate-500">Loading research document intelligence...</p>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="text-center py-20">
        <h2 className="text-lg font-bold text-slate-900">Research Document Not Found</h2>
        <Link href="/library" className="text-xs text-blue-600 hover:underline mt-2 inline-block">
          Return to Library
        </Link>
      </div>
    );
  }

  const authorsString = paper.authors && paper.authors.length > 0 ? paper.authors.join(", ") : "Unknown Authors";
  const pdfUrl = api.getPaperFileUrl(paper.id);

  return (
    <div className="space-y-6">
      {/* Top Header & Metadata */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <Link
            href="/library"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Library</span>
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            {/* 1-Click Citation Modal Trigger */}
            <button
              onClick={handleOpenCitations}
              className="flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition shadow-2xs"
            >
              <Quote className="h-3.5 w-3.5 text-blue-600" />
              <span>Cite Paper</span>
            </button>

            {/* Presentation Deck Generator Trigger */}
            <button
              onClick={handleGeneratePresentation}
              className="flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition shadow-2xs"
            >
              <Presentation className="h-3.5 w-3.5 text-indigo-600" />
              <span>Make Slides</span>
            </button>

            {/* Compare */}
            <Link
              href={`/compare?p1=${paper.id}`}
              className="flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition shadow-2xs"
            >
              <Columns className="h-3.5 w-3.5 text-purple-600" />
              <span>Compare</span>
            </Link>

            {/* Direct Open PDF / Link */}
            {paper.file_path && (
              <a
                href={pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white transition shadow-xs"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Open PDF</span>
              </a>
            )}
          </div>
        </div>

        {/* Paper Title & Prominent Authors */}
        <h1 className="text-2xl font-black text-slate-950 tracking-tight leading-snug">
          {paper.title}
        </h1>

        <div className="mt-3 flex flex-wrap items-center gap-y-2 gap-x-4 text-xs">
          <div className="flex items-center space-x-1 font-semibold text-slate-700">
            <span className="text-slate-400 font-normal">Authors:</span>
            <span className="text-blue-900 bg-blue-50 px-2 py-0.5 rounded-md font-medium">
              {authorsString}
            </span>
          </div>

          {paper.publication_year && (
            <span className="text-slate-500 font-medium">
              Year: <strong className="text-slate-700">{paper.publication_year}</strong>
            </span>
          )}

          {paper.journal && (
            <span className="text-slate-500 font-medium">
              Venue: <strong className="text-slate-700">{paper.journal}</strong>
            </span>
          )}

          {paper.doi && (
            <a
              href={`https://doi.org/${paper.doi}`}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 hover:underline flex items-center gap-1 font-mono text-[11px]"
            >
              <span>DOI: {paper.doi}</span>
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          )}

          {paper.url && (
            <a
              href={paper.url}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 hover:underline flex items-center gap-1 font-mono text-[11px]"
            >
              <span>Direct Link</span>
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          )}
        </div>
      </div>

      {/* Side-By-Side Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT PANE: Media & Document Evidence (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col h-[820px]">
          {/* Media Tabs Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setMediaTab("pdf")}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  mediaTab === "pdf"
                    ? "bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>PDF Document</span>
              </button>

              <button
                onClick={() => setMediaTab("figures")}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  mediaTab === "figures"
                    ? "bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <ImageIcon className="h-3.5 w-3.5" />
                <span>Figures & Visuals ({paper.extracted_figures?.length || 0})</span>
              </button>

              <button
                onClick={() => setMediaTab("tables")}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  mediaTab === "tables"
                    ? "bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                <span>Tables ({paper.extracted_tables?.length || 0})</span>
              </button>

              <button
                onClick={() => setMediaTab("chunks")}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  mediaTab === "chunks"
                    ? "bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                <span>Passages</span>
              </button>
            </div>

            <span className="text-[11px] font-medium text-slate-400">Side-by-Side</span>
          </div>

          {/* Media Content Body */}
          <div className="flex-1 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50/50 p-2">
            {mediaTab === "pdf" && (
              <div className="h-full w-full rounded-lg overflow-hidden bg-white">
                {paper.file_path ? (
                  <iframe
                    src={`${pdfUrl}#toolbar=1&navpanes=0`}
                    className="w-full h-full border-0"
                    title="PDF Document Viewer"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center">
                    <FileText className="h-12 w-12 text-slate-300 mb-2" />
                    <p className="text-sm font-semibold text-slate-700">No raw PDF stored locally</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm">
                      This paper was indexed via metadata or external URL. You can inspect its extracted passages, tables, and AI summaries.
                    </p>
                  </div>
                )}
              </div>
            )}

            {mediaTab === "figures" && (
              <div className="p-3 space-y-4">
                {paper.extracted_figures && paper.extracted_figures.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {paper.extracted_figures.map((fig, idx) => (
                      <div
                        key={idx}
                        className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-sm transition group"
                      >
                        <div className="bg-slate-100 p-2 flex items-center justify-between text-[11px] text-slate-600 font-medium">
                          <span>Figure {idx + 1} (Page {fig.page_number})</span>
                          <span className="font-mono text-[10px] text-slate-400">{fig.width}x{fig.height}</span>
                        </div>
                        <div className="p-2 flex items-center justify-center bg-white min-h-[160px]">
                          <img
                            src={fig.url}
                            alt={`Figure ${idx + 1}`}
                            className="max-h-48 object-contain rounded"
                          />
                        </div>
                        <div className="p-2 border-t border-slate-100 bg-slate-50/50 flex justify-end">
                          <a
                            href={fig.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                          >
                            <span>Open Full Size</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 text-slate-400">
                    <ImageIcon className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                    <p className="text-sm font-semibold text-slate-700">No figures extracted</p>
                    <p className="text-xs text-slate-500 mt-1">This document is primarily text-based or figures are vector-rendered.</p>
                  </div>
                )}
              </div>
            )}

            {mediaTab === "tables" && (
              <div className="p-3 space-y-4">
                {paper.extracted_tables && paper.extracted_tables.length > 0 ? (
                  paper.extracted_tables.map((tbl, idx) => (
                    <div key={idx} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                      <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">
                          Table {idx + 1} • Page {tbl.page_number}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {tbl.row_count} rows × {tbl.col_count} columns
                        </span>
                      </div>
                      <div className="overflow-x-auto p-2">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-100 border-b border-slate-200">
                              {tbl.headers.map((h, hIdx) => (
                                <th key={hIdx} className="p-2 font-bold text-slate-700">
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {tbl.sample_rows.map((row, rIdx) => (
                              <tr key={rIdx} className="hover:bg-slate-50">
                                {row.map((cell, cIdx) => (
                                  <td key={cIdx} className="p-2 text-slate-600">
                                    {String(cell)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16 text-slate-400">
                    <FileSpreadsheet className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                    <p className="text-sm font-semibold text-slate-700">No structured tables found</p>
                    <p className="text-xs text-slate-500 mt-1">Numerical tables will appear here if present in the document.</p>
                  </div>
                )}
              </div>
            )}

            {mediaTab === "chunks" && (
              <div className="p-3 space-y-3">
                {paper.chunks?.map((chunk) => (
                  <div
                    key={chunk.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1 shadow-2xs"
                  >
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                      <span className="text-blue-600">Passage #{chunk.chunk_index + 1} • Page {chunk.page_number}</span>
                      <span className="font-mono text-slate-400">{chunk.section}</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-normal">{chunk.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANE: AI Research Intelligence (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col h-[820px]">
          {/* Intelligence Tabs */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div className="flex items-center space-x-1">
              {isStudent && (
                <button
                  onClick={() => setIntelTab("notebooklm")}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    intelTab === "notebooklm"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                  <span>NotebookLM Studio</span>
                </button>
              )}

              <button
                onClick={() => setIntelTab("summary")}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  intelTab === "summary"
                    ? "bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                <span>Executive Summary</span>
              </button>

              <button
                onClick={() => setIntelTab("extraction")}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  intelTab === "extraction"
                    ? "bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-indigo-600" />
                <span>Extraction Matrix</span>
              </button>

              <button
                onClick={() => setIntelTab("chat")}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  intelTab === "chat"
                    ? "bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
                <span>Research Chat</span>
              </button>

              <button
                onClick={() => setIntelTab("notes")}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  intelTab === "notes"
                    ? "bg-blue-50 text-blue-700 border border-blue-200/80 shadow-2xs"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <FileEdit className="h-3.5 w-3.5 text-amber-600" />
                <span>Notes ({notes.length})</span>
              </button>
            </div>

            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
              {isStudent ? "🎓 Student Mode" : "🔬 Pro Mode"}
            </span>
          </div>

          {/* Intelligence Tab Body */}
          <div className="flex-1 overflow-y-auto pr-1">
            {/* NOTEBOOKLM STUDENT TAB */}
            {intelTab === "notebooklm" && paper && (
              <NotebookLMStudyPanel paper={paper} summary={summary} extraction={extraction} />
            )}
            {/* SUMMARY TAB */}
            {intelTab === "summary" && (
              <div className="space-y-4">
                {!summary ? (
                  <div className="text-center py-16 space-y-3">
                    <Sparkles className="h-10 w-10 mx-auto text-blue-500 animate-pulse" />
                    <h3 className="text-sm font-bold text-slate-900">Generate Structured Executive Summary</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Synthesize research problems, methodology, datasets, empirical benchmarks, and critical limitations.
                    </p>
                    <button
                      onClick={handleGenerateSummary}
                      disabled={summaryLoading}
                      className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition shadow-sm disabled:opacity-50"
                    >
                      {summaryLoading ? "Generating Executive Summary..." : "Generate Executive Summary"}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 text-xs">
                    {/* Key Takeaways Card */}
                    {summary.key_takeaways && summary.key_takeaways.length > 0 && (
                      <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-100 space-y-2">
                        <span className="font-bold text-blue-900 text-xs uppercase tracking-wider block">
                          Key Empirical Takeaways
                        </span>
                        <ul className="space-y-1.5 list-disc pl-4 text-slate-700">
                          {summary.key_takeaways.map((item, idx) => (
                            <li key={idx} className="leading-relaxed font-medium">{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Problem & Objective */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                      <span className="font-bold text-slate-900 text-xs block">Research Problem</span>
                      <p className="text-slate-700 leading-relaxed">{summary.research_problem}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                      <span className="font-bold text-slate-900 text-xs block">Methodology & Approach</span>
                      <p className="text-slate-700 leading-relaxed">{summary.methodology}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                      <span className="font-bold text-slate-900 text-xs block">Key Empirical Results</span>
                      <p className="text-slate-700 leading-relaxed">{summary.key_results}</p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                      <span className="font-bold text-slate-900 text-xs block">Limitations & Boundary Conditions</span>
                      <p className="text-slate-700 leading-relaxed">{summary.limitations}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* EXTRACTION MATRIX TAB */}
            {intelTab === "extraction" && (
              <div className="space-y-4">
                {!extraction ? (
                  <div className="text-center py-16 space-y-3">
                    <FileSpreadsheet className="h-10 w-10 mx-auto text-indigo-500" />
                    <h3 className="text-sm font-bold text-slate-900">Extract Key Parameters & Metrics</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Extract structured attributes: problem, dataset, sample sizes, models, evaluation metrics, and future work.
                    </p>
                    <button
                      onClick={handleGenerateExtraction}
                      disabled={extractionLoading}
                      className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition shadow-sm disabled:opacity-50"
                    >
                      {extractionLoading ? "Extracting..." : "Run Structured Extraction"}
                    </button>
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-200 overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <tbody className="divide-y divide-slate-100">
                        {[
                          ["Research Problem", extraction.research_problem],
                          ["Objectives", extraction.objectives],
                          ["Methodology", extraction.methodology],
                          ["Datasets", extraction.dataset],
                          ["Sample Size", extraction.sample_size],
                          ["Models & Algorithms", extraction.models_algorithms],
                          ["Evaluation Metrics", extraction.evaluation_metrics],
                          ["Empirical Results", extraction.results],
                          ["Limitations", extraction.limitations],
                          ["Future Directions", extraction.future_work],
                        ].map(([label, val], idx) => (
                          <tr key={idx} className="hover:bg-slate-50 transition">
                            <td className="p-3 font-bold text-slate-700 w-1/3 bg-slate-50/60">{label}</td>
                            <td className="p-3 text-slate-800 leading-relaxed">{val}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* RESEARCH CHAT TAB */}
            {intelTab === "chat" && (
              <div className="flex flex-col h-full justify-between space-y-4">
                {/* Messages List */}
                <div className="space-y-4 flex-1 overflow-y-auto pr-1">
                  {messages.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 space-y-2">
                      <MessageSquare className="h-8 w-8 mx-auto text-slate-300" />
                      <p className="text-xs font-semibold text-slate-700">Chat with this Research Document</p>
                      <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                        Answers cite specific pages and sections with grounded evidence.
                      </p>
                    </div>
                  ) : (
                    messages.map((m) => (
                      <div
                        key={m.id}
                        className={`flex flex-col space-y-1 ${
                          m.role === "user" ? "items-end" : "items-start"
                        }`}
                      >
                        <div
                          className={`p-3.5 rounded-2xl text-xs max-w-[90%] leading-relaxed ${
                            m.role === "user"
                              ? "bg-blue-600 text-white rounded-tr-none font-medium shadow-2xs"
                              : "bg-slate-100 text-slate-900 rounded-tl-none border border-slate-200/80"
                          }`}
                        >
                          {m.role === "user" ? (
                            <div className="whitespace-pre-wrap">{m.content}</div>
                          ) : (
                            <MarkdownRenderer content={m.content} />
                          )}

                          {/* Traceable Citations */}
                          {m.citations && m.citations.length > 0 && (
                            <div className="mt-3 pt-2 border-t border-slate-200/60 flex flex-wrap gap-1.5">
                              {m.citations.map((c, cIdx) => (
                                <span
                                  key={cIdx}
                                  className="citation-badge"
                                  title={c.excerpt}
                                >
                                  [{cIdx + 1}] p.{c.page_number} ({c.section || "Passage"})
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 px-1 font-mono">
                          {m.role === "user" ? "You" : "ResearchOS (Grounded)"}
                        </span>
                      </div>
                    ))
                  )}

                  {chatLoading && (
                    <div className="flex items-center space-x-2 text-xs text-blue-600 p-3 bg-blue-50/60 rounded-xl w-fit">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Synthesizing evidence via ResearchOS AI Engine...</span>
                    </div>
                  )}
                </div>

                {/* Suggested Follow-up Questions Chips */}
                {suggestedQuestions.length > 0 && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Suggested Questions
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {suggestedQuestions.map((q, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendChat(undefined, q)}
                          className="text-[11px] font-medium bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200/80 hover:border-blue-200 px-2.5 py-1 rounded-lg transition text-left"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Chat Input Box */}
                <form onSubmit={(e) => handleSendChat(e)} className="flex items-center space-x-2 pt-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask anything about methodology, findings, or metrics..."
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:outline-none transition shadow-2xs font-medium"
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim() || chatLoading}
                    className="rounded-xl bg-blue-600 p-2 text-white hover:bg-blue-700 transition disabled:opacity-40"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>
            )}

            {/* NOTES TAB */}
            {intelTab === "notes" && (
              <div className="space-y-4 text-xs">
                <form onSubmit={handleCreateNote} className="space-y-2 p-4 rounded-xl border border-slate-200 bg-slate-50">
                  <span className="font-bold text-slate-900 block">Add Document Note</span>
                  <input
                    type="text"
                    value={newNoteTitle}
                    onChange={(e) => setNewNoteTitle(e.target.value)}
                    placeholder="Heading (e.g., 'Ablation critique')"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                  <textarea
                    rows={3}
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    placeholder="Write insights, critiques, or ideas..."
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition shadow-2xs"
                  >
                    Save Note
                  </button>
                </form>

                <div className="space-y-2">
                  {notes.map((note) => (
                    <div key={note.id} className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                      <span className="font-bold text-slate-900 block">{note.title}</span>
                      <p className="text-slate-600 whitespace-pre-line">{note.content}</p>
                      <span className="text-[10px] text-slate-400 block pt-1">
                        {new Date(note.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 1-CLICK CITATION MODAL */}
      {isCitationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Quote className="h-5 w-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">Cite This Publication</h3>
              </div>
              <button
                onClick={() => setIsCitationModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Citation Format Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1">
              {(["bibtex", "apa", "mla", "ieee"] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setCitationFormat(fmt)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold uppercase transition ${
                    citationFormat === fmt
                      ? "bg-white text-blue-700 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>

            {/* Citation Text Area */}
            {citationsData ? (
              <div className="relative bg-slate-50 rounded-xl p-3.5 border border-slate-200 font-mono text-xs text-slate-800 leading-relaxed overflow-x-auto">
                <pre className="whitespace-pre-wrap">{citationsData[citationFormat]}</pre>
                <button
                  onClick={() => copyCitation(citationsData[citationFormat], citationFormat)}
                  className="absolute top-2.5 right-2.5 flex items-center space-x-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 text-[11px] font-semibold transition shadow-xs"
                >
                  {copiedFormat === citationFormat ? (
                    <>
                      <Check className="h-3 w-3" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* SLIDE PRESENTATION GENERATOR MODAL */}
      <PresentationModal
        isOpen={isPresModalOpen}
        onClose={() => setIsPresModalOpen(false)}
        presentation={presentation}
        loading={presLoading}
        topicTitle={paper?.title}
      />
    </div>
  );
}
