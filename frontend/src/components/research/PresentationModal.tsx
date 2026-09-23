"use client";

import React, { useState } from "react";
import {
  Presentation,
  Download,
  ChevronLeft,
  ChevronRight,
  Loader2,
  FileText,
  Copy,
  Check,
  Maximize2,
  Sparkles,
} from "lucide-react";
import { PresentationResponse, PresentationSlide } from "@/types";

interface PresentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  presentation: PresentationResponse | null;
  loading: boolean;
  topicTitle?: string;
}

export const PresentationModal: React.FC<PresentationModalProps> = ({
  isOpen,
  onClose,
  presentation,
  loading,
  topicTitle,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [copiedMd, setCopiedMd] = useState(false);

  if (!isOpen) return null;

  const slides = presentation?.slides || [];

  const handleDownloadMarkdown = () => {
    if (!presentation) return;
    let md = `# ${presentation.title}\n*${presentation.author_attribution || "ResearchOS Presentation"}*\n\n---\n\n`;
    presentation.slides.forEach((s) => {
      md += `## Slide ${s.slide_number}: ${s.title}\n`;
      if (s.subtitle) md += `*${s.subtitle}*\n\n`;
      s.bullets.forEach((b) => (md += `- ${b}\n`));
      if (s.key_metric_or_callout) md += `\n**Key Takeaway / Highlight:** ${s.key_metric_or_callout}\n`;
      if (s.speaker_notes) md += `\n> **Speaker Notes:** ${s.speaker_notes}\n`;
      md += `\n---\n\n`;
    });

    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(presentation.title || "Research_Presentation").replace(/\s+/g, "_")}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadHtmlPresentation = () => {
    if (!presentation) return;
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${presentation.title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0F172A; color: #F8FAFC; margin: 0; padding: 40px; }
    .slide { max-width: 900px; margin: 0 auto 40px auto; background: #1E293B; border: 1px solid #334155; border-radius: 20px; padding: 50px; box-shadow: 0 10px 30px rgba(0,0,0,0.4); page-break-after: always; }
    .slide-num { font-size: 12px; color: #38BDF8; font-family: monospace; font-weight: bold; letter-spacing: 1px; }
    h1 { font-size: 28px; margin-top: 10px; color: #FFFFFF; font-weight: 800; }
    h3 { font-size: 16px; color: #94A3B8; margin-top: -10px; margin-bottom: 24px; }
    ul { font-size: 16px; line-height: 1.8; color: #E2E8F0; padding-left: 20px; }
    .callout { background: rgba(56, 189, 248, 0.1); border-left: 4px solid #38BDF8; padding: 12px 20px; border-radius: 8px; margin-top: 25px; font-weight: 600; color: #7DD3FC; }
    .notes { background: #0F172A; border: 1px dashed #475569; padding: 15px; border-radius: 10px; margin-top: 20px; font-size: 13px; color: #CBD5E1; font-style: italic; }
  </style>
</head>
<body>
  ${presentation.slides
    .map(
      (s) => `
    <div class="slide">
      <div class="slide-num">SLIDE ${s.slide_number} OF ${presentation.slides.length}</div>
      <h1>${s.title}</h1>
      ${s.subtitle ? `<h3>${s.subtitle}</h3>` : ""}
      <ul>
        ${s.bullets.map((b) => `<li>${b}</li>`).join("")}
      </ul>
      ${s.key_metric_or_callout ? `<div class="callout">💡 Key Highlight: ${s.key_metric_or_callout}</div>` : ""}
      ${s.speaker_notes ? `<div class="notes">🗣️ Speaker Notes: ${s.speaker_notes}</div>` : ""}
    </div>
  `
    )
    .join("")}
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(presentation.title || "Research_Presentation").replace(/\s+/g, "_")}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const copySlidesMarkdown = () => {
    if (!presentation) return;
    let md = `# ${presentation.title}\n\n`;
    presentation.slides.forEach((s) => {
      md += `## Slide ${s.slide_number}: ${s.title}\n${s.bullets.map((b) => `- ${b}`).join("\n")}\n\n`;
    });
    navigator.clipboard.writeText(md);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/65 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full p-7 md:p-8 space-y-6 relative max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Presentation className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base md:text-lg">
                {presentation ? presentation.title : topicTitle || "Generating Dynamic Slide Deck..."}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {presentation ? presentation.author_attribution : "Synthesizing with ResearchOS AI Engine"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 text-sm font-bold transition"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
            <div className="text-center space-y-1">
              <p className="text-sm font-bold text-slate-800">Synthesizing Distinct Scientific Slides...</p>
              <p className="text-xs text-slate-500">Formulating methodology, empirical benchmarks, and speaker notes</p>
            </div>
          </div>
        ) : presentation && slides.length > 0 ? (
          <div className="flex-1 overflow-y-auto space-y-4">
            {/* Active Slide Canvas */}
            <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 md:p-10 min-h-[380px] flex flex-col justify-between shadow-xl border border-indigo-900/50 relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center justify-between text-xs text-indigo-300 font-mono mb-4">
                  <span className="font-bold tracking-wider">
                    SLIDE {currentSlide + 1} OF {slides.length}
                  </span>
                  <span className="bg-indigo-900/90 border border-indigo-700/60 px-3 py-1 rounded-full text-indigo-200 text-[11px] font-sans font-bold">
                    {slides[currentSlide].subtitle || "Academic Presentation"}
                  </span>
                </div>

                <h2 className="text-xl md:text-2xl font-black text-white tracking-tight mb-5 leading-tight">
                  {slides[currentSlide].title}
                </h2>

                <ul className="space-y-3 text-xs md:text-sm text-slate-200 list-disc pl-6 leading-relaxed">
                  {slides[currentSlide].bullets.map((b, bIdx) => (
                    <li key={bIdx} className="font-medium">
                      {b}
                    </li>
                  ))}
                </ul>
              </div>

              {slides[currentSlide].key_metric_or_callout && (
                <div className="mt-6 pt-4 border-t border-indigo-800/60 flex items-center justify-between text-xs relative z-10">
                  <span className="text-indigo-300 font-bold uppercase tracking-wider text-[11px]">
                    Key Takeaway:
                  </span>
                  <span className="bg-white/10 text-cyan-300 font-bold px-3 py-1.5 rounded-xl border border-cyan-400/20 shadow-2xs">
                    {slides[currentSlide].key_metric_or_callout}
                  </span>
                </div>
              )}

              {/* Subtle background glow */}
              <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            </div>

            {/* Speaker Notes */}
            {slides[currentSlide].speaker_notes && (
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-xs text-slate-700 space-y-1">
                <span className="font-extrabold text-slate-900 block text-[11px] uppercase tracking-wider">
                  Speaker Notes:
                </span>
                <p className="italic leading-relaxed">{slides[currentSlide].speaker_notes}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="py-20 text-center text-sm text-slate-500">
            No slides generated yet. Please select a valid document or topic.
          </div>
        )}

        {/* Footer Navigation & Download Controls */}
        {presentation && slides.length > 0 && !loading && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 pt-4 shrink-0">
            {/* Slide Navigation */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentSlide((prev) => Math.max(0, prev - 1))}
                disabled={currentSlide === 0}
                className="flex items-center space-x-1 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 disabled:opacity-40 transition shadow-2xs"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </button>

              <div className="flex items-center space-x-1 px-2">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-2.5 rounded-full transition-all ${
                      idx === currentSlide ? "w-6 bg-indigo-600" : "w-2.5 bg-slate-300 hover:bg-slate-400"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={() => setCurrentSlide((prev) => Math.min(slides.length - 1, prev + 1))}
                disabled={currentSlide === slides.length - 1}
                className="flex items-center space-x-1 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 disabled:opacity-40 transition shadow-2xs"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Export & Download Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={copySlidesMarkdown}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition shadow-2xs"
              >
                {copiedMd ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-slate-500" />}
                <span>{copiedMd ? "Copied Markdown" : "Copy MD"}</span>
              </button>

              <button
                onClick={handleDownloadMarkdown}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition shadow-2xs"
              >
                <FileText className="h-3.5 w-3.5 text-indigo-600" />
                <span>Export .MD</span>
              </button>

              <button
                onClick={handleDownloadHtmlPresentation}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white transition shadow-sm shadow-indigo-500/20"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download Slides (.HTML/PPT)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
