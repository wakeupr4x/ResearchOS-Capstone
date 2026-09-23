"use client";

import React, { useState, useEffect } from "react";
import {
  PenTool,
  Sparkles,
  BookOpen,
  Copy,
  Check,
  Download,
  Plus,
  Loader2,
  FileCode,
  Layers,
  Quote,
  Trash2,
} from "lucide-react";
import { api } from "@/lib/api";
import { Paper } from "@/types";
import { useMode } from "@/context/ModeContext";

const PAPER_SECTIONS = [
  { id: "abstract", title: "Abstract", placeholder: "High-level summary of problem, methodology, key findings, and contributions..." },
  { id: "intro", title: "Introduction", placeholder: "Motivation, background context, limitations of existing paradigms, and proposed contributions..." },
  { id: "related", title: "Related Work", placeholder: "Literature review synthesizing contemporary baselines and positioning this work..." },
  { id: "method", title: "Methodology", placeholder: "Mathematical formulation, algorithmic pipeline, and architectural components..." },
  { id: "experiments", title: "Experiments & Results", placeholder: "Datasets, evaluation metrics, quantitative tables, and baseline comparisons..." },
  { id: "discussion", title: "Discussion & Limitations", placeholder: "Threats to validity, edge cases, negative results, and ablation analysis..." },
  { id: "conclusion", title: "Conclusion & Future Work", placeholder: "Summary of impact and actionable future research directions..." },
];

export default function PaperStudioPage() {
  const { mode } = useMode();
  const [activeSectionId, setActiveSectionId] = useState("abstract");
  const [paperTitle, setPaperTitle] = useState("Untitled Frontier Research Manuscript");
  const [authorsText, setAuthorsText] = useState("Lead Author, et al.");
  const [sectionsData, setSectionsData] = useState<Record<string, string>>({
    abstract: "",
    intro: "",
    related: "",
    method: "",
    experiments: "",
    discussion: "",
    conclusion: "",
  });

  const [allPapers, setAllPapers] = useState<Paper[]>([]);
  const [selectedRefIds, setSelectedRefIds] = useState<string[]>([]);
  const [draftPrompt, setDraftPrompt] = useState("");
  const [drafting, setDrafting] = useState(false);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  useEffect(() => {
    api.getPapers()
      .then((papers) => {
        setAllPapers(papers);
        if (papers.length > 0) {
          setSelectedRefIds([papers[0].id]);
        }
      })
      .catch(() => {});
  }, []);

  const activeSection = PAPER_SECTIONS.find((s) => s.id === activeSectionId) || PAPER_SECTIONS[0];

  const handleSectionTextChange = (text: string) => {
    setSectionsData((prev) => ({
      ...prev,
      [activeSectionId]: text,
    }));
  };

  const handleInsertCitation = (paper: Paper) => {
    const auth = paper.authors && paper.authors.length > 0 ? paper.authors[0].split(" ").pop() : "Author";
    const yr = paper.publication_year || 2024;
    const citationTag = ` (${auth} et al., ${yr}) `;
    const current = sectionsData[activeSectionId] || "";
    handleSectionTextChange(current + citationTag);
  };

  const handleAiDraft = async () => {
    if (drafting) return;
    setDrafting(true);
    try {
      const res = await api.draftStudioSection({
        section_title: activeSection.title,
        prompt: draftPrompt || `Draft a rigorous scientific ${activeSection.title} based on the selected reference literature.`,
        paper_ids: selectedRefIds,
        current_content: sectionsData[activeSectionId],
        mode,
      });

      const updated = sectionsData[activeSectionId]
        ? sectionsData[activeSectionId] + "\n\n" + res.draft_content
        : res.draft_content;
      handleSectionTextChange(updated);
      setDraftPrompt("");
    } catch (e: any) {
      alert("Drafting failed: " + e.message);
    } finally {
      setDrafting(false);
    }
  };

  const generateLatex = () => {
    return `\\documentclass[11pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage{amsmath,amssymb,graphicx}

\\title{${paperTitle}}
\\author{${authorsText}}
\\date{\\today}

\\begin{document}
\\maketitle

\\begin{abstract}
${sectionsData.abstract || "No abstract provided."}
\\end{abstract}

\\section{Introduction}
${sectionsData.intro || "Content pending."}

\\section{Related Work}
${sectionsData.related || "Content pending."}

\\section{Methodology}
${sectionsData.method || "Content pending."}

\\section{Experiments and Results}
${sectionsData.experiments || "Content pending."}

\\section{Discussion and Limitations}
${sectionsData.discussion || "Content pending."}

\\section{Conclusion}
${sectionsData.conclusion || "Content pending."}

\\end{document}`;
  };

  const generateMarkdown = () => {
    return `# ${paperTitle}
**Authors:** ${authorsText}
**Date:** ${new Date().toLocaleDateString()}

## Abstract
${sectionsData.abstract || ""}

## 1. Introduction
${sectionsData.intro || ""}

## 2. Related Work
${sectionsData.related || ""}

## 3. Methodology
${sectionsData.method || ""}

## 4. Experiments & Results
${sectionsData.experiments || ""}

## 5. Discussion & Limitations
${sectionsData.discussion || ""}

## 6. Conclusion
${sectionsData.conclusion || ""}`;
  };

  const handleCopyExport = (format: "latex" | "markdown") => {
    const text = format === "latex" ? generateLatex() : generateMarkdown();
    navigator.clipboard.writeText(text);
    setCopiedFormat(format);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  const handleDownload = (format: "tex" | "md") => {
    const text = format === "tex" ? generateLatex() : generateMarkdown();
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${paperTitle.toLowerCase().replace(/[^a-z0-9]/g, "_")}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            <PenTool className="h-4 w-4" />
            <span>Research Paper Authoring Suite</span>
          </div>
          <input
            type="text"
            value={paperTitle}
            onChange={(e) => setPaperTitle(e.target.value)}
            className="text-2xl font-black text-slate-900 tracking-tight w-full bg-transparent border-b border-transparent hover:border-slate-200 focus:border-blue-500 focus:outline-none transition py-0.5"
            placeholder="Paper Title..."
          />
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-xs text-slate-400 font-medium">Authors:</span>
            <input
              type="text"
              value={authorsText}
              onChange={(e) => setAuthorsText(e.target.value)}
              className="text-xs text-slate-600 font-medium bg-transparent border-b border-transparent hover:border-slate-200 focus:border-blue-500 focus:outline-none transition py-0.5"
            />
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => handleCopyExport("latex")}
            className="flex items-center space-x-1 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition shadow-2xs"
          >
            {copiedFormat === "latex" ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            <span>LaTeX</span>
          </button>

          <button
            onClick={() => handleCopyExport("markdown")}
            className="flex items-center space-x-1 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition shadow-2xs"
          >
            {copiedFormat === "markdown" ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            <span>Markdown</span>
          </button>

          <button
            onClick={() => handleDownload("tex")}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition shadow-sm"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download .tex</span>
          </button>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Section Navigator (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1 block">
            Manuscript Sections
          </span>
          {PAPER_SECTIONS.map((sec, idx) => {
            const isActive = activeSectionId === sec.id;
            const hasContent = (sectionsData[sec.id] || "").trim().length > 0;

            return (
              <button
                key={sec.id}
                onClick={() => setActiveSectionId(sec.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? "bg-blue-600 text-white shadow-xs font-bold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-[10px] opacity-70">0{idx + 1}</span>
                  <span>{sec.title}</span>
                </div>
                {hasContent && (
                  <div
                    className={`h-2 w-2 rounded-full ${
                      isActive ? "bg-white" : "bg-emerald-500"
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Center: Authoring Editor (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col h-[750px]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">{activeSection.title}</h2>
              <span className="text-[11px] text-slate-400 font-mono">
                {(sectionsData[activeSectionId] || "").split(/\s+/).filter(Boolean).length} words
              </span>
            </div>

            <button
              onClick={() => handleSectionTextChange("")}
              className="text-[11px] text-slate-400 hover:text-rose-600 transition flex items-center gap-1 font-medium"
            >
              <Trash2 className="h-3 w-3" />
              <span>Clear Section</span>
            </button>
          </div>

          {/* Textarea Editor */}
          <textarea
            value={sectionsData[activeSectionId] || ""}
            onChange={(e) => handleSectionTextChange(e.target.value)}
            placeholder={activeSection.placeholder}
            className="flex-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 p-4 text-xs text-slate-800 leading-relaxed font-sans placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:outline-none resize-none transition shadow-2xs"
          />

          {/* AI Drafting Assist Bar */}
          <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-blue-700 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                AI Section Drafter (ResearchOS)
              </span>
              <span className="text-[10px] text-slate-400">
                Grounds draft in {selectedRefIds.length} reference paper(s)
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={draftPrompt}
                onChange={(e) => setDraftPrompt(e.target.value)}
                placeholder={`Instruct AI (e.g. 'Draft methodology comparing sparse BM25 vs dense embeddings')...`}
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:outline-none"
              />
              <button
                onClick={handleAiDraft}
                disabled={drafting}
                className="flex items-center space-x-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2 text-xs font-bold text-white transition disabled:opacity-50 shadow-xs shrink-0"
              >
                {drafting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Drafting...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Draft Section</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Library Citations & Evidence Picker (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col h-[750px]">
          <div className="border-b border-slate-100 pb-3 mb-3">
            <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
              <Quote className="h-3.5 w-3.5 text-indigo-600" />
              <span>Insert Reference Citations</span>
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Click a paper to insert inline citation into active section.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {allPapers.map((paper) => {
              const isSelectedForRef = selectedRefIds.includes(paper.id);
              const auth = paper.authors && paper.authors.length > 0 ? paper.authors[0] : "Unknown";

              return (
                <div
                  key={paper.id}
                  className={`p-3 rounded-xl border text-xs transition space-y-1.5 ${
                    isSelectedForRef
                      ? "border-blue-200 bg-blue-50/50 shadow-2xs"
                      : "border-slate-200 bg-slate-50/40 hover:bg-slate-50"
                  }`}
                >
                  <p className="font-bold text-slate-800 line-clamp-2 leading-tight">
                    {paper.title}
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium">
                    {auth} et al. ({paper.publication_year || 2024})
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => handleInsertCitation(paper)}
                      className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-0.5 hover:underline"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Insert Citation</span>
                    </button>

                    <button
                      onClick={() => {
                        if (isSelectedForRef) {
                          setSelectedRefIds((prev) => prev.filter((id) => id !== paper.id));
                        } else {
                          setSelectedRefIds((prev) => [...prev, paper.id]);
                        }
                      }}
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded border transition ${
                        isSelectedForRef
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-slate-600 border-slate-300"
                      }`}
                    >
                      {isSelectedForRef ? "Using in AI" : "+ Use in AI"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
