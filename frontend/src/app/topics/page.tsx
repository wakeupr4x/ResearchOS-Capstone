"use client";

import React, { useState } from "react";
import {
  SearchCode,
  Sparkles,
  TrendingUp,
  Compass,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  Flame,
} from "lucide-react";
import Link from "next/link";

const RESEARCH_FIELDS = [
  "Artificial Intelligence & LLMs",
  "Biomedical & Healthcare RAG",
  "Robotics & Autonomous Systems",
  "Quantum Computing Algorithms",
  "Neuroscience & Brain-Computer Interfaces",
  "Climate Science & Earth Observation",
];

const CURATED_TOPICS = [
  {
    title: "Test-Time Compute & Reinforcement Learning for Mathematical Reasoning",
    field: "Artificial Intelligence & LLMs",
    impactScore: 98,
    unsolvedQuestion: "How do we prevent reward hacking in multi-step verification chains without ground-truth labels?",
    seedKeywords: ["RLVR", "Incentivized Reasoning", "Process Reward Models"],
    arxivQuery: "reasoning test-time compute reinforcement learning",
  },
  {
    title: "Corrective RAG with Knowledge Graph Constraints in Clinical Decision Support",
    field: "Biomedical & Healthcare RAG",
    impactScore: 94,
    unsolvedQuestion: "Can sub-graph topological verification eliminate 100% of contraindicated drug recommendation hallucinations?",
    seedKeywords: ["Med-RAG", "Biomedical KGs", "Clinical Provability"],
    arxivQuery: "medical RAG knowledge graph clinical",
  },
  {
    title: "Sparse Diffusion State-Space Models for High-Frequency Sensor Fusion",
    field: "Robotics & Autonomous Systems",
    impactScore: 91,
    unsolvedQuestion: "Can selective state space architectures outpace transformers on real-time 100Hz proprioceptive control loops?",
    seedKeywords: ["Mamba", "Diffusion Policies", "Real-Time Robotics"],
    arxivQuery: "mamba state space robotics control",
  },
  {
    title: "Zero-Shot Multimodal Tabular and Chart Reasoning in Financial Reports",
    field: "Artificial Intelligence & LLMs",
    impactScore: 89,
    unsolvedQuestion: "How do we resolve numerical arithmetic inconsistencies across nested balance sheets in multi-page PDFs?",
    seedKeywords: ["Tabular Vision", "Document AI", "Numeric Reasoning"],
    arxivQuery: "document reasoning table figure PDF",
  },
];

export default function FindTopicsPage() {
  const [selectedField, setSelectedField] = useState("All");
  const [customKeyword, setCustomKeyword] = useState("");

  const filtered = CURATED_TOPICS.filter((t) =>
    selectedField === "All" ? true : t.field === selectedField
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-7 md:p-8 shadow-xs">
        <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
          <SearchCode className="h-4 w-4" />
          <span>Research Ideation & Gap Scouting</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
          Find High-Impact Research Topics
        </h1>
        <p className="text-xs md:text-sm text-slate-500 mt-1 font-medium">
          Discover promising research directions, trending frontier paradigms, and validated open scientific bottlenecks.
        </p>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2 pt-6">
          <button
            onClick={() => setSelectedField("All")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
              selectedField === "All"
                ? "bg-blue-600 text-white shadow-2xs"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            All Disciplines
          </button>
          {RESEARCH_FIELDS.map((f) => (
            <button
              key={f}
              onClick={() => setSelectedField(f)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
                selectedField === f
                  ? "bg-blue-600 text-white shadow-2xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((topic, idx) => (
          <div
            key={idx}
            className="bg-white rounded-3xl border border-slate-200 p-6 md:p-7 shadow-xs hover:border-blue-300 transition flex flex-col justify-between space-y-4 clean-card"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/70">
                  {topic.field}
                </span>
                <div className="flex items-center space-x-1 text-xs font-bold text-amber-600">
                  <Flame className="h-4 w-4" />
                  <span>{topic.impactScore}/100 Impact</span>
                </div>
              </div>

              <h3 className="font-extrabold text-base text-slate-900 leading-snug">
                {topic.title}
              </h3>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
                  Core Unsolved Problem
                </span>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {topic.unsolvedQuestion}
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {topic.seedKeywords.map((k, kIdx) => (
                  <span
                    key={kIdx}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600"
                  >
                    #{k}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <Link
                href={`/discover?q=${encodeURIComponent(topic.arxivQuery)}`}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5"
              >
                <span>Search arXiv Literature</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>

              <Link
                href={`/chat?query=${encodeURIComponent("What is the state of the art on: " + topic.title)}`}
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition shadow-2xs"
              >
                Discuss in Chat
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
