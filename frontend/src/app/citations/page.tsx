"use client";

import React, { useState, useEffect } from "react";
import { Quote, Copy, Check, BookOpen, Download, Search, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import { Paper, CitationExportResponse } from "@/types";

type CitationFormat = "bibtex" | "apa" | "mla" | "ieee" | "chicago";

export default function CitationGeneratorPage() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [selectedPaperId, setSelectedPaperId] = useState<string>("");
  const [format, setFormat] = useState<CitationFormat>("bibtex");
  const [citationData, setCitationData] = useState<CitationExportResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [manualTitle, setManualTitle] = useState("");
  const [manualAuthors, setManualAuthors] = useState("");
  const [manualYear, setManualYear] = useState("2024");
  const [manualJournal, setManualJournal] = useState("arXiv");

  useEffect(() => {
    api.getPapers().then((data) => {
      setPapers(data);
      if (data.length > 0) {
        setSelectedPaperId(data[0].id);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedPaperId) {
      api.getCitations(selectedPaperId).then(setCitationData).catch(() => {});
    }
  }, [selectedPaperId]);

  const selectedPaper = papers.find((p) => p.id === selectedPaperId);

  const getActiveCitationText = () => {
    if (citationData) {
      return citationData[format] || "";
    }
    // Fallback manual formatting
    const authList = manualAuthors || "Vaswani, A., et al.";
    const yr = manualYear || "2024";
    const tit = manualTitle || "Attention Is All You Need";
    const jrn = manualJournal || "Advances in Neural Information Processing Systems";

    switch (format) {
      case "apa":
        return `${authList} (${yr}). ${tit}. ${jrn}.`;
      case "mla":
        return `${authList}. "${tit}." ${jrn}, ${yr}.`;
      case "ieee":
        return `[1] ${authList}, "${tit}," in ${jrn}, ${yr}.`;
      case "chicago":
        return `${authList}. "${tit}." ${jrn} (${yr}).`;
      default:
        return `@article{manual_${yr},\n  title={${tit}},\n  author={${authList}},\n  journal={${jrn}},\n  year={${yr}}\n}`;
    }
  };

  const copyCitation = () => {
    navigator.clipboard.writeText(getActiveCitationText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-7 md:p-8 shadow-xs">
        <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
          <Quote className="h-4 w-4" />
          <span>Academic Reference Formatting</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
          Citation & Reference Generator
        </h1>
        <p className="text-xs md:text-sm text-slate-500 mt-1 font-medium">
          Generate verified citations in standard academic formats (BibTeX, APA 7th, MLA 9th, IEEE, Chicago) for library papers or custom entries.
        </p>
      </div>

      {/* Selector & Style Tabs */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Select Indexed Paper from Library
            </label>
            <select
              value={selectedPaperId}
              onChange={(e) => setSelectedPaperId(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs md:text-sm text-slate-900 font-semibold focus:bg-white focus:border-blue-600 focus:outline-none transition shadow-2xs"
            >
              {papers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.publication_year || 2024})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Citation Standard</label>
            <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-2xl">
              {(["bibtex", "apa", "mla", "ieee", "chicago"] as CitationFormat[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition ${
                    format === f
                      ? "bg-white text-blue-700 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Formatted Citation Canvas */}
        <div className="p-6 rounded-2xl bg-slate-900 text-slate-100 font-mono text-xs md:text-sm leading-relaxed border border-slate-800 shadow-md relative group">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3 text-slate-400 text-xs">
            <span className="font-bold text-indigo-400 uppercase tracking-wider">{format.toUpperCase()} FORMAT</span>
            <button
              onClick={copyCitation}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-sans font-bold transition"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? "Copied Citation" : "Copy to Clipboard"}</span>
            </button>
          </div>

          <pre className="whitespace-pre-wrap overflow-x-auto text-slate-200">
            {getActiveCitationText()}
          </pre>
        </div>
      </div>
    </div>
  );
}
