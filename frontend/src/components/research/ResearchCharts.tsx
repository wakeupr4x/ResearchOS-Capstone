"use client";

import React from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";

// 1. Radar Chart: Multi-dimensional Academic Evaluation
export interface PaperRadarMetric {
  dimension: string;
  [paperKey: string]: string | number;
}

interface MultiDimensionRadarProps {
  data?: PaperRadarMetric[];
  paperNames?: { key: string; name: string; color: string }[];
  title?: string;
}

export const MultiDimensionRadar: React.FC<MultiDimensionRadarProps> = ({
  data,
  paperNames = [
    { key: "paperA", name: "Proposed Architecture", color: "#3B82F6" },
    { key: "paperB", name: "SOTA Baseline", color: "#8B5CF6" },
  ],
  title = "Scientific Evaluation Matrix (Multi-Dimensional Radar)",
}) => {
  const defaultData: PaperRadarMetric[] = [
    { dimension: "Empirical Rigor", paperA: 94, paperB: 82 },
    { dimension: "Method Novelty", paperA: 92, paperB: 76 },
    { dimension: "Reproducibility", paperA: 88, paperB: 85 },
    { dimension: "Benchmark Score", paperA: 95, paperB: 89 },
    { dimension: "Inference Speed", paperA: 90, paperB: 72 },
    { dimension: "Theoretical Depth", paperA: 86, paperB: 91 },
  ];

  const chartData = data && data.length > 0 ? data : defaultData;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h4 className="font-extrabold text-sm text-slate-900 tracking-tight">{title}</h4>
          <p className="text-xs text-slate-500 font-medium">Quantified evaluation across key peer-review criteria (0 - 100 scale)</p>
        </div>
        <div className="flex items-center space-x-3 text-xs">
          {paperNames.map((p) => (
            <div key={p.key} className="flex items-center space-x-1.5 font-semibold">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: p.color }} />
              <span className="text-slate-700">{p.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
            <PolarGrid stroke="#E2E8F0" />
            <PolarAngleAxis dataKey="dimension" tick={{ fill: "#475569", fontSize: 11, fontWeight: 600 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#CBD5E1" tick={{ fontSize: 9 }} />
            {paperNames.map((p) => (
              <Radar
                key={p.key}
                name={p.name}
                dataKey={p.key}
                stroke={p.color}
                fill={p.color}
                fillOpacity={0.25}
                strokeWidth={2}
              />
            ))}
            <Tooltip
              contentStyle={{
                backgroundColor: "#0F172A",
                color: "#FFFFFF",
                borderRadius: "0.75rem",
                fontSize: "12px",
                border: "none",
                boxShadow: "0 10px 15px -3px rgba(0,0,0,0.3)",
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// 2. Bar Chart: Empirical Benchmark Scores Comparison
export interface BenchmarkItem {
  benchmark: string;
  baseline: number;
  proposed: number;
  unit?: string;
}

interface BenchmarkComparisonBarProps {
  data?: BenchmarkItem[];
  title?: string;
  proposedLabel?: string;
  baselineLabel?: string;
}

export const BenchmarkComparisonBar: React.FC<BenchmarkComparisonBarProps> = ({
  data,
  title = "Empirical Evaluation Benchmarks (% Accuracy)",
  proposedLabel = "ResearchOS Hybrid RAG",
  baselineLabel = "Standard Dense-Only",
}) => {
  const defaultData: BenchmarkItem[] = [
    { benchmark: "Factuality / F1", baseline: 74.2, proposed: 91.5 },
    { benchmark: "Hallucination Reduction", baseline: 62.0, proposed: 88.4 },
    { benchmark: "Citation Precision", baseline: 68.9, proposed: 94.2 },
    { benchmark: "Multi-Hop Reasoning", baseline: 58.3, proposed: 83.7 },
    { benchmark: "Cross-Domain Transfer", baseline: 71.1, proposed: 86.9 },
  ];

  const chartData = data && data.length > 0 ? data : defaultData;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
      <div className="border-b border-slate-100 pb-3">
        <h4 className="font-extrabold text-sm text-slate-900 tracking-tight">{title}</h4>
        <p className="text-xs text-slate-500 font-medium">Standardized benchmark scores across cross-validation splits</p>
      </div>

      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="benchmark" tick={{ fill: "#64748B", fontSize: 11, fontWeight: 500 }} />
            <YAxis domain={[0, 100]} tick={{ fill: "#64748B", fontSize: 10 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0F172A",
                color: "#FFFFFF",
                borderRadius: "0.75rem",
                fontSize: "12px",
                border: "none",
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: "11px", fontWeight: 600, paddingTop: "8px" }}
            />
            <Bar dataKey="baseline" name={baselineLabel} fill="#94A3B8" radius={[6, 6, 0, 0]} />
            <Bar dataKey="proposed" name={proposedLabel} fill="#3B82F6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// 3. Area Chart: Citation Growth & Research Trajectory
export interface CitationGrowthItem {
  year: string;
  citations: number;
  papers: number;
}

export const CitationGrowthArea: React.FC<{ data?: CitationGrowthItem[]; title?: string }> = ({
  data,
  title = "Field Citation Trajectory & Knowledge Accumulation",
}) => {
  const defaultData: CitationGrowthItem[] = [
    { year: "2019", citations: 120, papers: 14 },
    { year: "2020", citations: 340, papers: 28 },
    { year: "2021", citations: 890, papers: 65 },
    { year: "2022", citations: 2150, papers: 140 },
    { year: "2023", citations: 4820, papers: 310 },
    { year: "2024", citations: 9400, papers: 620 },
    { year: "2025", citations: 14800, papers: 980 },
  ];

  const chartData = data && data.length > 0 ? data : defaultData;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
      <div className="border-b border-slate-100 pb-3">
        <h4 className="font-extrabold text-sm text-slate-900 tracking-tight">{title}</h4>
        <p className="text-xs text-slate-500 font-medium">Cumulative citation velocity and publication volume over time</p>
      </div>

      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="citationGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="year" tick={{ fill: "#64748B", fontSize: 11, fontWeight: 500 }} />
            <YAxis tick={{ fill: "#64748B", fontSize: 10 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0F172A",
                color: "#FFFFFF",
                borderRadius: "0.75rem",
                fontSize: "12px",
                border: "none",
              }}
            />
            <Area
              type="monotone"
              dataKey="citations"
              name="Citations"
              stroke="#6366F1"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#citationGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
