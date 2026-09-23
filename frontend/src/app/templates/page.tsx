"use client";

import React, { useState } from "react";
import { FileSpreadsheet, Download, Copy, Check, ExternalLink, ArrowRight } from "lucide-react";
import Link from "next/link";

const TEMPLATES = [
  {
    title: "IEEE Two-Column Conference Paper Template",
    category: "Manuscript LaTeX",
    description: "Standard IEEE transaction style with mathematical notation headers, algorithm blocks, and dual-column layout formatting.",
    format: "LaTeX / .tex",
    badge: "IEEE",
    content: `\\documentclass[conference]{IEEEtran}
\\usepackage{cite}
\\usepackage{amsmath,amssymb,amsfonts}
\\usepackage{algorithmic}
\\usepackage{graphicx}
\\usepackage{textcomp}
\\usepackage{xcolor}

\\begin{document}
\\title{Title of Frontier Research Manuscript}
\\author{\\IEEEauthorblockN{Dr. Pushkar Verma}
\\IEEEauthorblockA{\\textit{Dept. of Computer Science} \\\\
\\textit{Stanford AI Lab}\\\\
Stanford, CA}}
\\maketitle

\\begin{abstract}
Structured abstract detailing problem, methodology, empirical findings, and primary contributions.
\\end{abstract}

\\section{Introduction}
Motivation and background...
\\end{document}`,
  },
  {
    title: "Systematic Literature Review PRISMA Checklist Matrix",
    category: "Literature Review",
    description: "PRISMA-compliant table format recording identification, screening, eligibility, and inclusion metrics for systematic reviews.",
    format: "Markdown / CSV",
    badge: "PRISMA",
    content: `# PRISMA Systematic Review Protocol
| Phase | Identified Records | Excluded Criteria | Included in Synthesis |
|---|---|---|---|
| Identification (arXiv) | 240 | Duplicates (42) | 198 |
| Screening (Abstracts) | 198 | Off-domain (85) | 113 |
| Full-Text Eligibility | 113 | Incomplete evaluation (40) | 73 |
| Final Quantitative Synthesis | 73 | - | 73 Papers |`,
  },
  {
    title: "NSF & NIH Research Proposal Narrative Template",
    category: "Grant Proposal",
    description: "Comprehensive grant structure covering Intellectual Merit, Broader Impacts, Specific Aims, and Multi-Year Milestones.",
    format: "Markdown / Word",
    badge: "Grant",
    content: `# SPECIFIC AIMS & PROJECT SUMMARY
## 1. Executive Intellectual Merit
Addressing critical grounding bottlenecks in scientific RAG...

## 2. Specific Aim 1: Robust Multimodal Figure & Table Ingestion
Benchmarking hierarchical section detection against academic PDFs.

## 3. Specific Aim 2: Active Claim Verification Checkpoints
Eliminating factual hallucination through reciprocal rank fusion.

## 4. Broader Impacts & Educational Outreach
Integration into university AI curriculum and open-source tooling.`,
  },
  {
    title: "ACM Master Manuscript Format (TAPS Ready)",
    category: "Manuscript LaTeX",
    description: "Official ACM Master Article Template configured for SIGGRAPH, CHI, and KDD publication proceedings.",
    format: "LaTeX / .tex",
    badge: "ACM",
    content: `\\documentclass[sigconf]{acmart}
\\begin{document}
\\title{Grounded Literature Intelligence at Scale}
\\author{Pushkar Verma}
\\affiliation{\\institution{Stanford University}}
\\begin{abstract}
A multi-paper synthesis framework...
\\end{abstract}
\\maketitle
\\end{document}`,
  },
];

export default function TemplatesPage() {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleCopy = (content: string, idx: number) => {
    navigator.clipboard.writeText(content);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleDownload = (filename: string, content: string) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-7 md:p-8 shadow-xs">
        <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
          <FileSpreadsheet className="h-4 w-4" />
          <span>Standardized Academic Layouts</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
          Scientific & Grant Templates
        </h1>
        <p className="text-xs md:text-sm text-slate-500 mt-1 font-medium">
          Ready-to-use academic publication templates, grant proposal frameworks, and systematic review tables.
        </p>
      </div>

      {/* Templates List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {TEMPLATES.map((tpl, idx) => (
          <div
            key={idx}
            className="bg-white rounded-3xl border border-slate-200 p-7 shadow-xs flex flex-col justify-between space-y-4 clean-card"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/70">
                  {tpl.badge}
                </span>
                <span className="text-xs font-bold text-slate-400">{tpl.format}</span>
              </div>

              <h3 className="font-extrabold text-base text-slate-900 leading-snug">{tpl.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">{tpl.description}</p>

              <div className="p-3.5 rounded-2xl bg-slate-900 text-slate-200 font-mono text-[11px] leading-relaxed max-h-36 overflow-y-auto">
                <pre>{tpl.content}</pre>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => handleCopy(tpl.content, idx)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition"
              >
                {copiedIdx === idx ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedIdx === idx ? "Copied" : "Copy Template"}</span>
              </button>

              <button
                onClick={() => handleDownload(`${tpl.badge.toLowerCase()}_template.txt`, tpl.content)}
                className="flex items-center space-x-1.5 px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition shadow-sm shadow-blue-500/20 active:scale-95"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
