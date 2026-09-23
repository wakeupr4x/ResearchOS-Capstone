"use client";

import React, { useState } from "react";
import { Bot, Sparkles, ArrowRight, ShieldCheck, Microscope, BookOpen, Quote, GitFork } from "lucide-react";
import Link from "next/link";

const RESEARCH_AGENTS = [
  {
    id: "scout",
    name: "Literature Scout Agent",
    role: "Automated arXiv and Semantic Scholar Discovery",
    description: "Monitors daily preprint submissions, detects keyword shifts, and flags breakthroughs matching your lab's active project scopes.",
    capabilities: ["Automated paper filtering", "Abstract summarization", "Novelty score estimation"],
    badge: "Discovery",
    icon: "🔭",
    actionLink: "/discover",
    actionLabel: "Launch Literature Scout",
  },
  {
    id: "critic",
    name: "Methodology Critic Agent",
    role: "Peer-Review & Experimental Red Teaming",
    description: "Acts as a rigorous Reviewer #2. Dissects baseline validity, statistical sample sizes, omitted ablations, and potential experimental leakage.",
    capabilities: ["Ablation auditing", "Threat to validity checks", "Sample size power analysis"],
    badge: "Evaluation",
    icon: "🔬",
    actionLink: "/compare",
    actionLabel: "Launch Reviewer Critic",
  },
  {
    id: "latex",
    name: "LaTeX & Equations Specialist",
    role: "Mathematical Typesetting & Symbolic Formulation",
    description: "Converts natural language algorithmic concepts and matrix equations directly into polished, camera-ready LaTeX equations and algorithmic blocks.",
    capabilities: ["Math formatting", "Algorithm pseudo-code", "BibTeX clean-up"],
    badge: "Authoring",
    icon: "📐",
    actionLink: "/studio",
    actionLabel: "Open in AI Writer",
  },
  {
    id: "grounding",
    name: "Evidence & Fact Verifier",
    role: "Zero-Hallucination Claim Auditor",
    description: "Scans manuscript drafts against indexed library PDF coordinates, ensuring every empirical metric asserts exact page and figure provenance.",
    capabilities: ["Citation linking", "Hallucination detection", "Numerical verification"],
    badge: "Grounding",
    icon: "🛡️",
    actionLink: "/chat",
    actionLabel: "Audit Claims in Chat",
  },
];

export default function AgentGalleryPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-7 md:p-8 shadow-xs">
        <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
          <Bot className="h-4 w-4" />
          <span>Autonomous AI Personas</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
          Specialized Research Agent Gallery
        </h1>
        <p className="text-xs md:text-sm text-slate-500 mt-1 font-medium">
          Deploy specialized AI agents tailored for individual scientific workflows across the research lifecycle.
        </p>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {RESEARCH_AGENTS.map((agent) => (
          <div
            key={agent.id}
            className="bg-white rounded-3xl border border-slate-200 p-7 shadow-xs hover:border-blue-300 transition flex flex-col justify-between space-y-5 clean-card"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl">{agent.icon}</span>
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/70">
                  {agent.badge}
                </span>
              </div>

              <div>
                <h3 className="font-black text-lg text-slate-900">{agent.name}</h3>
                <p className="text-xs font-semibold text-slate-500">{agent.role}</p>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {agent.description}
              </p>

              <div className="space-y-1.5 pt-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  Core Skills
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {agent.capabilities.map((c, cIdx) => (
                    <span
                      key={cIdx}
                      className="text-[11px] font-semibold px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-700"
                    >
                      ✓ {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <Link
                href={agent.actionLink}
                className="flex items-center space-x-1.5 rounded-2xl bg-blue-600 hover:bg-blue-700 px-4 py-2.5 text-xs font-bold text-white transition shadow-sm shadow-blue-500/20 active:scale-98"
              >
                <span>{agent.actionLabel}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
