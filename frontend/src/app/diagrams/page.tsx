"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Workflow,
  Sparkles,
  Download,
  Copy,
  Check,
  RefreshCw,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileCode,
  Sliders,
} from "lucide-react";
import mermaid from "mermaid";

interface DiagramPreset {
  id: string;
  name: string;
  category: string;
  description: string;
  code: string;
}

const PRESETS: DiagramPreset[] = [
  {
    id: "system-pipeline",
    name: "System Architecture Pipeline",
    category: "System Engineering",
    description: "Multi-stage PDF ingestion, embedding, hybrid retrieval, and grounded synthesis pipeline.",
    code: `graph TD
    A[📄 Raw PDF Manuscript] --> B[⚡ PDF Parser & OCR]
    B --> C1[Structured Text Chunks]
    B --> C2[Visual Figures & Tables]
    C1 --> D[Sentence-Transformers all-MiniLM-L6-v2]
    D --> E[(HNSW Vector Index & SQLite)]
    F[🔍 User Scientific Query] --> G[Hybrid Dense-Sparse RAG Engine]
    E --> G
    G --> H[Evidence Alignment & Re-ranking]
    H --> I[ResearchOS AI Engine]
    I --> J[Grounded Answer with Page Citations [p.3]]
    I --> K[Automated Presentation Slide Deck]`,
  },
  {
    id: "prisma-flowchart",
    name: "PRISMA Systematic Review Flow",
    category: "Methodology",
    description: "Standard PRISMA statement diagram tracking academic record screening and eligibility.",
    code: `graph TD
    subgraph Identification
        A1[Records identified from arXiv: 1,420]
        A2[Records identified from PubMed: 890]
        A1 --> B[Records pooled after duplicates removed: 1,940]
        A2 --> B
    end
    subgraph Screening
        B --> C[Records screened by title & abstract: 1,940]
        C -->|Excluded: 1,510| D[Non-relevant domain studies]
        C --> E[Full-text reports assessed for eligibility: 430]
    end
    subgraph Eligibility
        E -->|Excluded with reasons: 340| F[Lacked empirical baseline evaluation]
        E --> G[Studies included in quantitative synthesis: 90]
    end
    subgraph Included
        G --> H[Final Peer-Reviewed Evidence Matrix]
    end`,
  },
  {
    id: "multi-agent-system",
    name: "Multi-Agent Research Swarm",
    category: "Autonomous AI",
    description: "Cooperative autonomous agents executing specialized scientific tasks in parallel.",
    code: `graph LR
    User[Principal Investigator] --> Orchestrator[Master Coordinator Agent]
    Orchestrator --> Agent1[Literature Scout Agent]
    Orchestrator --> Agent2[Empirical Validator Agent]
    Orchestrator --> Agent3[LaTeX & BibTeX Specialist]
    Agent1 --> Data1[arXiv & Semantic Scholar API]
    Agent2 --> Data2[Benchmarking Cross-Validation]
    Agent3 --> Data3[Formatted Publication Draft]
    Data1 --> Consensus[Consensus & Verification Engine]
    Data2 --> Consensus
    Data3 --> Consensus
    Consensus --> Final[Camera-Ready Manuscript]`,
  },
  {
    id: "experimental-protocol",
    name: "Experimental Baseline Protocol",
    category: "Empirical Science",
    description: "Ablation study and cross-validation lifecycle with statistical confidence checks.",
    code: `graph TD
    Data[Dataset Ingestion] --> Split{K-Fold Split k=5}
    Split --> Train[Training Partition 80%]
    Split --> Val[Validation Partition 10%]
    Split --> Test[Blind Holdout Test 10%]
    Train --> ModelA[Baseline Model BM25]
    Train --> ModelB[Proposed Hybrid Architecture]
    ModelA --> Eval[Standardized Metric Evaluation]
    ModelB --> Eval
    Val --> Eval
    Test --> Eval
    Eval --> Stats[Paired t-test p < 0.001]
    Stats --> Significance{Statistically Significant?}
    Significance -->|Yes| Confirm[Empirical Verification Confirmed]
    Significance -->|No| ReTune[Hyperparameter Search & Re-ablation]`,
  },
];

export default function DiagramsPage() {
  const [selectedPreset, setSelectedPreset] = useState<DiagramPreset>(PRESETS[0]);
  const [mermaidCode, setMermaidCode] = useState(PRESETS[0].code);
  const [svgContent, setSvgContent] = useState<string>("");
  const [renderError, setRenderError] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [copiedCode, setCopiedCode] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: "neutral",
      securityLevel: "loose",
      fontFamily: "Inter, sans-serif",
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: "basis",
      },
    });
  }, []);

  useEffect(() => {
    let isMounted = true;
    const renderDiagram = async () => {
      try {
        setRenderError(null);
        const uniqueId = `mermaid-render-${Date.now()}`;
        const { svg } = await mermaid.render(uniqueId, mermaidCode);
        if (isMounted) {
          setSvgContent(svg);
        }
      } catch (err: any) {
        if (isMounted) {
          setRenderError(err.message || "Failed to render Mermaid diagram syntax.");
        }
      }
    };

    const timeout = setTimeout(renderDiagram, 200);
    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, [mermaidCode]);

  const handleSelectPreset = (preset: DiagramPreset) => {
    setSelectedPreset(preset);
    setMermaidCode(preset.code);
    setZoomLevel(1);
  };

  const handleDownloadSvg = () => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedPreset.id}-diagram.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(mermaidCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-3.5">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
            <Workflow className="h-6 w-6" />
          </div>
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-[10px] font-bold text-indigo-700 uppercase tracking-wider mb-1">
              <Sparkles className="h-3 w-3 text-indigo-600" />
              <span>Dedicated Visual Engine</span>
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight font-sans">
              Flowchart & Architecture Studio
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Create, edit, and export publication-ready Mermaid system diagrams, PRISMA reviews, and agent networks
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleCopyCode}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition shadow-2xs"
          >
            {copiedCode ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            <span>{copiedCode ? "Copied Syntax" : "Copy Code"}</span>
          </button>

          <button
            onClick={handleDownloadSvg}
            disabled={!svgContent}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 transition text-xs font-bold text-white shadow-sm shadow-blue-500/25 disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            <span>Export SVG</span>
          </button>
        </div>
      </div>

      {/* Preset Selector Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {PRESETS.map((p) => (
          <div
            key={p.id}
            onClick={() => handleSelectPreset(p)}
            className={`p-4 rounded-2xl border cursor-pointer transition text-left space-y-1.5 ${
              selectedPreset.id === p.id
                ? "bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-200/60 shadow-xs"
                : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-white px-2 py-0.5 rounded-md border border-indigo-100">
                {p.category}
              </span>
              {selectedPreset.id === p.id && <Check className="h-3.5 w-3.5 text-indigo-600" />}
            </div>
            <h4 className="text-xs font-bold text-slate-900">{p.name}</h4>
            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{p.description}</p>
          </div>
        ))}
      </div>

      {/* Main Split Screen: Live Mermaid Code Editor + Interactive SVG Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[560px]">
        {/* Left: Code Editor (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <FileCode className="h-4 w-4 text-indigo-600" />
              <span className="font-extrabold text-slate-800">Mermaid.js Source Code</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Live Auto-Compile</span>
          </div>

          <div className="flex-1 p-3 bg-slate-950 font-mono text-xs">
            <textarea
              value={mermaidCode}
              onChange={(e) => setMermaidCode(e.target.value)}
              placeholder="graph TD..."
              className="w-full h-full min-h-[460px] bg-transparent text-emerald-300 placeholder-slate-600 focus:outline-none resize-none leading-relaxed p-2"
              spellCheck={false}
            />
          </div>

          {renderError && (
            <div className="p-3 bg-rose-50 border-t border-rose-200 text-rose-800 text-xs font-mono">
              Syntax Warning: {renderError}
            </div>
          )}
        </div>

        {/* Right: SVG Visual Canvas (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <Layers className="h-4 w-4 text-blue-600" />
              <span className="font-extrabold text-slate-800">{selectedPreset.name} (Rendered Preview)</span>
            </div>

            <div className="flex items-center space-x-1.5 bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.1))}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-600"
                title="Zoom Out"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <span className="text-[10px] font-bold font-mono px-1.5 text-slate-600">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(2.0, z + 0.1))}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-600"
                title="Zoom In"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-600"
                title="Reset Zoom"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div
            ref={containerRef}
            className="flex-1 p-8 bg-slate-50/60 overflow-auto flex items-center justify-center min-h-[460px]"
          >
            {svgContent ? (
              <div
                style={{ transform: `scale(${zoomLevel})`, transformOrigin: "center center", transition: "transform 0.15s ease-out" }}
                className="w-full flex justify-center [&>svg]:max-w-full [&>svg]:h-auto shadow-sm p-4 bg-white rounded-2xl border border-slate-100"
                dangerouslySetInnerHTML={{ __html: svgContent }}
              />
            ) : (
              <div className="text-center text-slate-400 space-y-2">
                <Workflow className="h-8 w-8 mx-auto text-slate-300 animate-spin" />
                <p className="text-xs font-semibold">Compiling Mermaid architecture graph...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
