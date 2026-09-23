"use client";

import React, { useState } from "react";
import { GitFork, Sparkles, RefreshCw, ZoomIn, Download, Layers } from "lucide-react";

interface FlowchartGeneratorProps {
  title?: string;
  sourceContext?: string;
  defaultSteps?: { label: string; desc: string; type?: "input" | "process" | "decision" | "output" }[];
}

export const FlowchartGenerator: React.FC<FlowchartGeneratorProps> = ({
  title = "Methodological Architecture & Pipeline Flowchart",
  sourceContext,
  defaultSteps = [
    { label: "Corpus Input", desc: "Scientific literature ingestion & PDF layout detection", type: "input" },
    { label: "Hierarchical Chunking", desc: "Section-aware token grouping (400-token windows)", type: "process" },
    { label: "Dense & Sparse Fusion", desc: "Reciprocal Rank Fusion (all-MiniLM-L6-v2 + BM25)", type: "decision" },
    { label: "Evidence Grounding", desc: "Citation verification against document provenance", type: "process" },
    { label: "Grounded Synthesis", desc: "Zero-hallucination structured research output", type: "output" },
  ],
}) => {
  const [steps, setSteps] = useState(defaultSteps);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const getStepBg = (type?: string, isHighlighted?: boolean) => {
    if (isHighlighted) return "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20";
    switch (type) {
      case "input":
        return "bg-cyan-50/90 text-cyan-900 border-cyan-200";
      case "decision":
        return "bg-amber-50/90 text-amber-900 border-amber-200";
      case "output":
        return "bg-emerald-50/90 text-emerald-900 border-emerald-200";
      default:
        return "bg-indigo-50/90 text-indigo-900 border-indigo-200";
    }
  };

  const handleDownloadSvg = () => {
    const svgElement = document.getElementById("flowchart-svg-canvas");
    if (!svgElement) return;
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title.toLowerCase().replace(/\s+/g, "_")}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-xs">
            <GitFork className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm md:text-base">{title}</h3>
            <p className="text-xs text-slate-500 font-medium">Visual architecture diagram generated from document context</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSteps([...steps].reverse())}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition"
            title="Invert Pipeline Flow"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Invert Flow</span>
          </button>
          <button
            onClick={handleDownloadSvg}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition shadow-2xs"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download SVG</span>
          </button>
        </div>
      </div>

      {/* Interactive Visual Canvas */}
      <div className="bg-slate-50/70 rounded-2xl p-6 border border-slate-200/80 overflow-x-auto">
        <div className="min-w-[650px] flex items-center justify-between gap-3 relative py-4">
          {steps.map((step, idx) => {
            const isLast = idx === steps.length - 1;
            const isSelected = activeStep === idx;

            return (
              <React.Fragment key={idx}>
                {/* Node Box */}
                <div
                  onClick={() => setActiveStep(isSelected ? null : idx)}
                  className={`flex-1 min-w-[130px] rounded-2xl border p-4 cursor-pointer transition-all duration-200 ${getStepBg(
                    step.type,
                    isSelected
                  )} hover:scale-102`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold mb-1 opacity-70">
                    <span>STEP 0{idx + 1}</span>
                    <span className="uppercase text-[9px]">{step.type || "Process"}</span>
                  </div>
                  <h4 className="font-black text-xs leading-snug">{step.label}</h4>
                  <p className="text-[11px] mt-1 leading-normal opacity-90 line-clamp-3">
                    {step.desc}
                  </p>
                </div>

                {/* Arrow Connector */}
                {!isLast && (
                  <div className="flex flex-col items-center justify-center shrink-0 text-slate-400">
                    <span className="text-sm font-bold">→</span>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Hidden SVG Representation for Clean Export */}
      <svg id="flowchart-svg-canvas" className="hidden" width="800" height="180" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#F8FAFC" rx="16" />
        {steps.map((s, i) => (
          <g key={i} transform={`translate(${30 + i * 150}, 30)`}>
            <rect width="130" height="110" rx="12" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
            <text x="12" y="24" fontFamily="Inter, sans-serif" fontSize="10" fontWeight="bold" fill="#64748B">STEP 0{i + 1}</text>
            <text x="12" y="44" fontFamily="Inter, sans-serif" fontSize="12" fontWeight="bold" fill="#0F172A">{s.label.slice(0, 16)}</text>
            <text x="12" y="64" fontFamily="Inter, sans-serif" fontSize="9" fill="#475569">{s.desc.slice(0, 24)}...</text>
          </g>
        ))}
      </svg>
    </div>
  );
};
