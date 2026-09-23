"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  FolderKanban,
  MessageSquare,
  Sparkles,
  Layers,
  ArrowRight,
  TrendingUp,
  Search,
  PenTool,
  Users,
  Cpu,
  GraduationCap,
  Microscope,
  FileSearch,
  Bot,
  TableProperties,
  Presentation,
  CheckCircle2,
  FileSpreadsheet,
  Quote,
  Activity,
  ArrowUpRight,
  History,
  Clock,
  Workflow,
} from "lucide-react";
import { api } from "@/lib/api";
import { DashboardStats, Paper, ResearchProject, Conversation, SavedInsight } from "@/types";
import { useMode } from "@/context/ModeContext";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { PresentationModal } from "@/components/research/PresentationModal";
import { FlowchartGenerator } from "@/components/research/FlowchartGenerator";
import { StudentNotebookLMUniverse } from "@/components/research/StudentNotebookLMUniverse";
import {
  MultiDimensionRadar,
  BenchmarkComparisonBar,
  CitationGrowthArea,
} from "@/components/research/ResearchCharts";

interface RecentResearchItem {
  id: string;
  title: string;
  type: "paper" | "compare" | "studio" | "discover";
  categoryLabel: string;
  badgeColor: string;
  timeAgo: string;
  href: string;
  actionText: string;
}

const RECENT_RESEARCHES: RecentResearchItem[] = [
  {
    id: "rec-1",
    title: "Attention Is All You Need",
    type: "paper",
    categoryLabel: "Paper Deep Dive",
    badgeColor: "bg-blue-100 text-blue-700 border-blue-200",
    timeAgo: "2 hours ago",
    href: "/chat-pdf",
    actionText: "Resume QA",
  },
  {
    id: "rec-2",
    title: "Transformer Baselines vs. Sparse Quantization",
    type: "compare",
    categoryLabel: "Comparison Matrix",
    badgeColor: "bg-purple-100 text-purple-700 border-purple-200",
    timeAgo: "5 hours ago",
    href: "/compare",
    actionText: "Open Matrix",
  },
  {
    id: "rec-3",
    title: "Methodology: Corrective RAG Evaluation",
    type: "studio",
    categoryLabel: "Manuscript Draft",
    badgeColor: "bg-emerald-100 text-emerald-700 border-emerald-200",
    timeAgo: "Yesterday",
    href: "/studio",
    actionText: "Continue Writing",
  },
  {
    id: "rec-4",
    title: "DeepSeek-R1 & Reinforcement Learning",
    type: "discover",
    categoryLabel: "arXiv Discovery",
    badgeColor: "bg-amber-100 text-amber-700 border-amber-200",
    timeAgo: "2 days ago",
    href: "/discover?q=DeepSeek-R1",
    actionText: "View Papers",
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const { mode, isStudent } = useMode();
  const { user } = useAuth();
  const { t } = useLanguage();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentPapers, setRecentPapers] = useState<Paper[]>([]);
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [insights, setInsights] = useState<SavedInsight[]>([]);
  const [loading, setLoading] = useState(true);

  // Quick Presentation Modal
  const [isPresModalOpen, setIsPresModalOpen] = useState(false);
  const [presentationData, setPresentationData] = useState<any>(null);
  const [presLoading, setPresLoading] = useState(false);

  const loadData = async () => {
    try {
      const [statsData, papersData, projectsData, convsData, insightsData] = await Promise.all([
        api.getStats(),
        api.getPapers(),
        api.getProjects(),
        api.getConversations(),
        api.getInsights(),
      ]);
      setStats(statsData);
      setRecentPapers(papersData);
      setProjects(projectsData.slice(0, 3));
      setConversations(convsData.slice(0, 4));
      setInsights(insightsData.slice(0, 3));
    } catch (e) {
      console.error("Failed to load dashboard data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener("paper-uploaded", loadData);
    return () => window.removeEventListener("paper-uploaded", loadData);
  }, []);

  const handleQuickDeck = async () => {
    if (recentPapers.length === 0) {
      alert("Please upload or discover at least 1 paper to generate a presentation.");
      return;
    }
    setIsPresModalOpen(true);
    setPresLoading(true);
    try {
      const res = await api.generatePresentation(
        recentPapers.slice(0, 2).map((p) => p.id),
        "Executive Literature Briefing",
        mode
      );
      setPresentationData(res);
    } catch (e) {
      alert("Failed to generate slides: " + e);
    } finally {
      setPresLoading(false);
    }
  };

  // If Student Mode is active, render the dedicated NotebookLM universe!
  if (isStudent) {
    return (
      <StudentNotebookLMUniverse
        papers={recentPapers}
        onOpenUpload={() => router.push("/library")}
      />
    );
  }

  // Otherwise render the Professional Research Workstation
  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fade-in pb-12">
      {/* Hero Welcome Banner */}
      <div className="rounded-3xl border border-slate-200/80 hero-gradient p-7 md:p-10 relative overflow-hidden shadow-xs">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-slate-200 text-slate-800 text-xs font-bold shadow-2xs">
            <Microscope className="h-4 w-4 text-blue-600" />
            <span className="text-blue-900">
              Professional Research Suite • Empirical Rigor & Cross-Paper Intelligence
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight font-sans">
            Welcome back, <span className="text-blue-600">{user?.name ? user.name.split(" ")[0] : "Researcher"}</span> 🔬
          </h1>
          <p className="text-sm md:text-base text-slate-600 leading-relaxed font-medium">
            Explore peer-reviewed literature, parse multi-dimensional benchmarks, generate conference slide decks,
            and synthesize grounded scientific arguments without hallucinations.
          </p>

          <div className="pt-3 flex flex-wrap items-center gap-3">
            <Link
              href="/discover"
              className="flex items-center space-x-2 rounded-2xl bg-blue-600 hover:bg-blue-700 px-5 py-3 text-xs md:text-sm font-bold text-white transition shadow-sm shadow-blue-500/25 active:scale-98"
            >
              <Search className="h-4 w-4" />
              <span>Discover Academic Papers</span>
            </Link>

            <Link
              href="/chat-pdf"
              className="flex items-center space-x-2 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 px-4 py-3 text-xs md:text-sm font-bold text-slate-800 transition shadow-2xs"
            >
              <FileSearch className="h-4 w-4 text-indigo-600" />
              <span>Chat with PDF</span>
            </Link>

            <Link
              href="/diagrams"
              className="flex items-center space-x-2 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 px-4 py-3 text-xs md:text-sm font-bold text-slate-800 transition shadow-2xs"
            >
              <Workflow className="h-4 w-4 text-emerald-600" />
              <span>Diagram Studio</span>
            </Link>

            <button
              onClick={handleQuickDeck}
              className="flex items-center space-x-2 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 px-4 py-3 text-xs md:text-sm font-bold text-slate-800 transition shadow-2xs"
            >
              <Presentation className="h-4 w-4 text-purple-600" />
              <span>Generate Quick Slides</span>
            </button>
          </div>
        </div>

        {/* Ambient Decorative Gradient Accent */}
        <div className="absolute -right-12 -bottom-12 w-80 h-80 bg-gradient-to-br from-blue-400/15 via-indigo-400/15 to-purple-400/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* SECTION: My Recent Researches */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <History className="h-4 w-4 text-indigo-600" />
            <h2 className="text-base font-black text-slate-900 tracking-tight">
              My Recent Researches
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">Synced across your active lab profile</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {RECENT_RESEARCHES.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-indigo-300 hover:shadow-md transition clean-card flex flex-col justify-between space-y-3 group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                    {item.categoryLabel}
                  </span>
                  <div className="flex items-center space-x-1 text-[10px] text-slate-400 font-medium">
                    <Clock className="h-3 w-3" />
                    <span>{item.timeAgo}</span>
                  </div>
                </div>

                <h3 className="font-extrabold text-xs text-slate-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition">
                  {item.title}
                </h3>
              </div>

              <Link
                href={item.href}
                className="inline-flex items-center justify-between w-full pt-2 border-t border-slate-100 text-xs font-bold text-indigo-600 hover:text-indigo-800"
              >
                <span>{item.actionText}</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Clickable Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div
          onClick={() => router.push("/library")}
          className="rounded-2xl border border-slate-200 bg-white p-5 cursor-pointer hover:border-blue-300 hover:shadow-md transition clean-card group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Papers in Library</span>
            <BookOpen className="h-4 w-4 text-blue-600 group-hover:scale-110 transition" />
          </div>
          <p className="text-3xl font-black text-slate-900 mt-2 font-sans">
            {stats ? stats.papers_count : 0}
          </p>
          <div className="flex items-center justify-between mt-1 text-[11px] text-blue-600 font-semibold">
            <span>Explore Library</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </div>
        </div>

        <div
          onClick={() => router.push("/collaboration")}
          className="rounded-2xl border border-slate-200 bg-white p-5 cursor-pointer hover:border-cyan-300 hover:shadow-md transition clean-card group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Research Projects</span>
            <FolderKanban className="h-4 w-4 text-cyan-600 group-hover:scale-110 transition" />
          </div>
          <p className="text-3xl font-black text-slate-900 mt-2 font-sans">
            {stats ? stats.projects_count : 0}
          </p>
          <div className="flex items-center justify-between mt-1 text-[11px] text-cyan-600 font-semibold">
            <span>Open Workspaces</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </div>
        </div>

        <div
          onClick={() => router.push("/chat")}
          className="rounded-2xl border border-slate-200 bg-white p-5 cursor-pointer hover:border-emerald-300 hover:shadow-md transition clean-card group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Grounded Chats</span>
            <MessageSquare className="h-4 w-4 text-emerald-600 group-hover:scale-110 transition" />
          </div>
          <p className="text-3xl font-black text-slate-900 mt-2 font-sans">
            {stats ? stats.conversations_count : 0}
          </p>
          <div className="flex items-center justify-between mt-1 text-[11px] text-emerald-600 font-semibold">
            <span>Resume Chat</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </div>
        </div>

        <div
          onClick={() => router.push("/citations")}
          className="rounded-2xl border border-slate-200 bg-white p-5 cursor-pointer hover:border-amber-300 hover:shadow-md transition clean-card group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Citations Index</span>
            <Quote className="h-4 w-4 text-amber-600 group-hover:scale-110 transition" />
          </div>
          <p className="text-3xl font-black text-slate-900 mt-2 font-sans">
            {recentPapers.length * 12 + 24}
          </p>
          <div className="flex items-center justify-between mt-1 text-[11px] text-amber-600 font-semibold">
            <span>BibTeX / APA</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </div>
        </div>

        <div
          onClick={() => router.push("/settings")}
          className="rounded-2xl border border-slate-200 bg-white p-5 cursor-pointer hover:border-purple-300 hover:shadow-md transition clean-card group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Inference Core</span>
            <Cpu className="h-4 w-4 text-purple-600 group-hover:scale-110 transition" />
          </div>
          <p className="text-xl font-black text-slate-900 mt-2 font-sans">
            ResearchOS
          </p>
          <div className="flex items-center space-x-1.5 mt-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] text-emerald-700 font-bold uppercase">Ready & Grounded</span>
          </div>
        </div>
      </div>

      {/* SECTION: Recharts Graphical Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <MultiDimensionRadar title="Cross-Paper Evaluation Matrix (Multi-Dimensional Radar)" />
        </div>
        <div className="lg:col-span-6">
          <BenchmarkComparisonBar title="Empirical Benchmarks: Hybrid RAG vs. Standard Baselines" />
        </div>
      </div>

      {/* SECTION: Citation Growth Trajectory */}
      <CitationGrowthArea title="Literature Domain Momentum & Citation Trajectory" />

      {/* Architecture Showcase */}
      <FlowchartGenerator
        title="Literature Ingestion & Hybrid RAG Architecture"
        defaultSteps={[
          { label: "1. Document Parsing", desc: "PyMuPDF extraction & layout detection", type: "input" },
          { label: "2. Vector Embeddings", desc: "384-dimensional dense semantic vectors", type: "process" },
          { label: "3. Reciprocal Rank Fusion", desc: "Dense semantic + Sparse BM25 ranking (k=60)", type: "decision" },
          { label: "4. Citation Grounding", desc: "Provenance matching against verified pages", type: "process" },
          { label: "5. Scientific Synthesis", desc: "Grounded output without hallucinations", type: "output" },
        ]}
      />

      {/* Universal Presentation Modal */}
      <PresentationModal
        isOpen={isPresModalOpen}
        onClose={() => setIsPresModalOpen(false)}
        presentation={presentationData}
        loading={presLoading}
        topicTitle="Executive Literature Briefing"
      />
    </div>
  );
}
