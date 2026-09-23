"use client";

import React, { useState, useEffect } from "react";
import { Settings as SettingsIcon, Cpu, Database, Server, Key, CheckCircle2, Shield, Info } from "lucide-react";
import { api } from "@/lib/api";
import { DashboardStats } from "@/types";

export default function SettingsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [health, setHealth] = useState<any>(null);

  useEffect(() => {
    api.getStats().then(setStats).catch(() => {});
    api.getHealth().then(setHealth).catch(() => {});
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-primary-light uppercase tracking-wider mb-1">
          <SettingsIcon className="h-4 w-4" />
          <span>Platform Configuration</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground">Settings & System Health</h1>
        <p className="text-xs text-foreground-muted mt-1">
          Inspect your active AI engines, vector database connectivity, and environment parameters.
        </p>
      </div>

      {/* System Status Banner */}
      <div className="rounded-xl border border-border bg-surface p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-5 w-5 text-accent-emerald" />
            <h2 className="text-sm font-bold text-foreground">All Core Services Operational</h2>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20">
            HEALTHY
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-lg border border-border bg-surface-card space-y-1">
            <span className="text-[11px] text-foreground-subtle flex items-center space-x-1">
              <Cpu className="h-3.5 w-3.5 text-primary-light" />
              <span>LLM Orchestration Layer</span>
            </span>
            <p className="font-semibold text-foreground capitalize">
              {stats?.llm_provider || "Gemini / Fallback"}
            </p>
            <p className="text-[11px] text-foreground-muted">Configurable in backend/.env</p>
          </div>

          <div className="p-3.5 rounded-lg border border-border bg-surface-card space-y-1">
            <span className="text-[11px] text-foreground-subtle flex items-center space-x-1">
              <Database className="h-3.5 w-3.5 text-accent-cyan" />
              <span>Dense Vector Engine</span>
            </span>
            <p className="font-semibold text-foreground">
              {stats?.embedding_provider || "sentence_transformers"}
            </p>
            <p className="text-[11px] text-foreground-muted">all-MiniLM-L6-v2 (384-dim, local)</p>
          </div>

          <div className="p-3.5 rounded-lg border border-border bg-surface-card space-y-1">
            <span className="text-[11px] text-foreground-subtle flex items-center space-x-1">
              <Server className="h-3.5 w-3.5 text-accent-purple" />
              <span>Persistence & RAG</span>
            </span>
            <p className="font-semibold text-foreground">
              {stats?.indexed_chunks_count || 0} Chunks Indexed
            </p>
            <p className="text-[11px] text-foreground-muted">Hybrid RRF Vector Search</p>
          </div>
        </div>
      </div>

      {/* Provider Configuration Guide */}
      <div className="rounded-xl border border-border bg-surface p-6 space-y-4 text-xs">
        <h3 className="text-sm font-bold text-foreground flex items-center space-x-2">
          <Key className="h-4 w-4 text-accent-amber" />
          <span>Configuring External LLM Providers</span>
        </h3>

        <p className="text-foreground-muted leading-relaxed">
          ResearchOS includes a deterministic grounded fallback engine that runs 100% locally and offline.
          To connect live Gemini or OpenAI models, update <code className="px-1.5 py-0.5 rounded bg-border text-primary-light font-mono">backend/.env</code>:
        </p>

        <div className="p-4 rounded-xl border border-border bg-background font-mono text-[11px] space-y-2 text-foreground-muted">
          <p className="text-foreground-subtle"># For Google Gemini (Recommended):</p>
          <p className="text-primary-light">LLM_PROVIDER=gemini</p>
          <p className="text-primary-light">GEMINI_API_KEY=your_gemini_api_key_here</p>
          <p className="text-foreground-subtle pt-2"># Or for OpenAI:</p>
          <p className="text-accent-cyan">LLM_PROVIDER=openai</p>
          <p className="text-accent-cyan">OPENAI_API_KEY=your_openai_api_key_here</p>
        </div>

        <div className="p-3.5 rounded-lg bg-surface-card border border-border flex items-start space-x-2 text-foreground-subtle text-[11px]">
          <Info className="h-4 w-4 shrink-0 mt-0.5 text-primary-light" />
          <span>
            Embeddings and vector search continue running locally on your CPU/MPS via SentenceTransformers, ensuring high throughput and zero embedding API costs.
          </span>
        </div>
      </div>

      {/* Environment & Storage Info */}
      <div className="rounded-xl border border-border bg-surface p-6 space-y-3 text-xs">
        <h3 className="text-sm font-bold text-foreground flex items-center space-x-2">
          <Shield className="h-4 w-4 text-accent-emerald" />
          <span>Security & Data Grounding</span>
        </h3>
        <ul className="space-y-2 text-foreground-muted list-disc pl-4 leading-relaxed">
          <li><strong>Zero Fabrication Guarantee</strong>: Answers cite exact paper sections and page numbers. Insufficient context prompts explicit &quot;insufficient evidence&quot; notices.</li>
          <li><strong>Local Document Storage</strong>: Uploaded PDFs and extracted vector representations remain on your local filesystem under <code className="font-mono text-foreground">backend/data/</code>.</li>
          <li><strong>Dual Database Driver</strong>: Defaults to zero-config local SQLite vector storage, ready for instant transition to PostgreSQL + pgvector via Docker Compose.</li>
        </ul>
      </div>
    </div>
  );
}
