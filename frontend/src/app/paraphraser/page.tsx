"use client";

import React, { useState } from "react";
import { Sparkles, Copy, Check, RefreshCw, Loader2, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";

type ParaphraseTone = "academic" | "concise" | "formal" | "simplified";

export default function ParaphraserPage() {
  const [inputText, setInputText] = useState("");
  const [tone, setTone] = useState<ParaphraseTone>("academic");
  const [outputText, setOutputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleParaphrase = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    try {
      const prompt = `Rewrite the following academic research text with high elegance and rigor.
Tone Mode: ${tone.toUpperCase()}
Style Guidelines:
- Academic: Maintain technical precision, academic vocabulary, and passive/objective phrasing.
- Concise: Cut fluff, maximize information density, eliminate redundant adverbs.
- Formal: Conference-ready tone suitable for Nature or NeurIPS manuscripts.
- Simplified: Clear, accessible language without altering empirical claims.

Source Text:
${inputText}

Provide ONLY the revised text without preamble.`;

      const res = await api.draftStudioSection({
        section_title: "Paraphrased Scientific Text",
        prompt,
        current_content: "",
        mode: "professional",
      });

      setOutputText(res.draft_content.trim());
    } catch (e: any) {
      alert("Paraphrasing failed: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const copyResult = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-7 md:p-8 shadow-xs">
        <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
          <Sparkles className="h-4 w-4" />
          <span>Academic Polish & Tone Adjustment</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
          Scientific Paraphraser & Rewriter
        </h1>
        <p className="text-xs md:text-sm text-slate-500 mt-1 font-medium">
          Refine draft sentences, improve flow, remove redundancies, and adjust academic tone for journal submissions.
        </p>
      </div>

      {/* Tone Mode Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-700">Target Tone:</span>
          {(["academic", "concise", "formal", "simplified"] as ParaphraseTone[]).map((t) => (
            <button
              key={t}
              onClick={() => setTone(t)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition ${
                tone === t
                  ? "bg-blue-600 text-white shadow-2xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <button
          onClick={handleParaphrase}
          disabled={loading || !inputText.trim()}
          className="flex items-center space-x-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 px-5 py-2 text-xs font-bold text-white transition shadow-sm shadow-blue-500/20 active:scale-98"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          <span>{loading ? "Polishing..." : "Paraphrase Text"}</span>
        </button>
      </div>

      {/* 2-Column Editor Canvas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Column */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 pb-2.5 font-bold">
            <span>Original Draft</span>
            <span>{inputText.length} characters</span>
          </div>
          <textarea
            rows={12}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste your paragraph, methodology description, or conclusion here to reword..."
            className="flex-1 w-full rounded-2xl border border-slate-200/90 bg-slate-50/50 p-4 text-xs md:text-sm text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none transition leading-relaxed font-medium resize-none shadow-2xs"
          />
        </div>

        {/* Output Column */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 pb-2.5 font-bold">
            <span className="text-blue-600">Polished Scientific Output</span>
            {outputText && (
              <button
                onClick={copyResult}
                className="flex items-center space-x-1 text-slate-700 hover:text-blue-600 transition"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            )}
          </div>
          <div className="flex-1 w-full rounded-2xl border border-slate-200/90 bg-slate-50/50 p-4 text-xs md:text-sm text-slate-900 leading-relaxed font-medium overflow-y-auto">
            {outputText ? (
              <p className="whitespace-pre-wrap">{outputText}</p>
            ) : (
              <p className="text-slate-400 italic">
                Paraphrased version with enhanced vocabulary and academic structure will appear here.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
