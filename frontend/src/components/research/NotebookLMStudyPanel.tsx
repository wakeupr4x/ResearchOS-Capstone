"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Headphones,
  Play,
  Pause,
  RotateCcw,
  BookOpen,
  Brain,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Volume2,
  Layers,
  Copy,
  Check,
} from "lucide-react";
import { PaperDetail, SummaryResponse, ExtractionResponse } from "@/types";

interface NotebookLMStudyPanelProps {
  paper: PaperDetail;
  summary: SummaryResponse | null;
  extraction: ExtractionResponse | null;
}

export const NotebookLMStudyPanel: React.FC<NotebookLMStudyPanelProps> = ({
  paper,
  summary,
  extraction,
}) => {
  const [activeTab, setActiveTab] = useState<"audio" | "analogies" | "flashcards" | "quiz">("audio");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [currentDialogueIdx, setCurrentDialogueIdx] = useState(0);
  const [currentFlashcard, setCurrentFlashcard] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState<Record<number, number>>({});
  const [copiedScript, setCopiedScript] = useState(false);

  // Generate dynamic conversational dialogue for the Audio Deep Dive
  const dialogueScript = [
    {
      speaker: "Jordan (Host)",
      avatar: "🎙️",
      role: "Science Communicator",
      text: `Hey everyone, welcome back to the Research Deep Dive! Today we're breaking down a really fascinating paper titled "${paper.title}". Elena, when you first read this, what jumped out at you?`,
    },
    {
      speaker: "Dr. Elena (Host)",
      avatar: "🔬",
      role: "Research Specialist",
      text: `Thanks Jordan! What's remarkable here is how the authors tackled ${extraction?.research_problem || "a long-standing bottleneck in this domain"}. For a long time, researchers struggled with scaling and computational overhead, but this paper proposes a clever architectural shift.`,
    },
    {
      speaker: "Jordan (Host)",
      avatar: "🎙️",
      role: "Science Communicator",
      text: `So for listeners without a PhD in this field, how would you explain the core method they developed?`,
    },
    {
      speaker: "Dr. Elena (Host)",
      avatar: "🔬",
      role: "Research Specialist",
      text: `Think of it like this: ${summary?.methodology || extraction?.methodology || "Instead of scanning through every single point with brute force, their mechanism uses smart indexing to focus only on the highest-signal features."} That means you get 10x the speed with almost zero loss in precision.`,
    },
    {
      speaker: "Jordan (Host)",
      avatar: "🎙️",
      role: "Science Communicator",
      text: `And what about the empirical results? Did their benchmarks hold up against the standard baselines?`,
    },
    {
      speaker: "Dr. Elena (Host)",
      avatar: "🔬",
      role: "Research Specialist",
      text: `They definitely did! Across the evaluated benchmarks, ${summary?.key_results || extraction?.results || "the model consistently outperformed previous state-of-the-art implementations, proving that this design generalizes well."}`,
    },
    {
      speaker: "Jordan (Host)",
      avatar: "🎙️",
      role: "Science Communicator",
      text: `That's incredible. But every paper has its blind spots—what limitations should students and practitioners keep in mind?`,
    },
    {
      speaker: "Dr. Elena (Host)",
      avatar: "🔬",
      role: "Research Specialist",
      text: `Great catch. The authors note that ${extraction?.limitations || "it still requires significant initialization resources and may encounter edge cases under extreme distribution shifts."} So while it's a huge leap, there's still plenty of exciting room for future master's and doctoral theses!`,
    },
  ];

  // Dynamic Conceptual Analogies
  const analogies = [
    {
      concept: "Core Architecture & Mechanism",
      technical: extraction?.methodology || "High-dimensional sparse-dense hybrid representation",
      analogy: "Like a hyper-organized airport dispatch system. Instead of every passenger asking every gate agent where their flight is, smart digital signboards and automated tramways guide passengers directly to their specific terminal in seconds.",
      takeaway: "Reduces search latency from O(N) exhaustive scanning to rapid sub-linear lookup.",
    },
    {
      concept: "Attention / Signal Filtering",
      technical: "Selective feature weighting and contextual aggregation",
      analogy: "Like being at a noisy cocktail party. Your brain effortlessly tunes out 50 background conversations to focus crisply on the one person talking right in front of you.",
      takeaway: "Concentrates computational budget solely on high-value tokens and vectors.",
    },
    {
      concept: "Evaluation & Benchmarks",
      technical: extraction?.evaluation_metrics || "Standardized cross-validation on competitive baselines",
      analogy: "Like putting a sports car through both a high-speed Formula 1 track and a muddy off-road rally to verify both raw horsepower and suspension reliability.",
      takeaway: "Proves the methodology works under standard lab conditions and unpredictable noisy datasets.",
    },
  ];

  // Dynamic Flashcards
  const flashcards = [
    {
      q: "What is the primary research question addressed in this paper?",
      a: extraction?.research_problem || summary?.executive_summary?.slice(0, 200) || "Investigating how to improve efficiency, accuracy, and generalizability in complex modeling pipelines.",
      category: "Problem Definition",
    },
    {
      q: "What methodology or algorithmic approach did the authors implement?",
      a: extraction?.methodology || summary?.methodology || "A modular architecture utilizing selective representation and empirical optimization.",
      category: "Methodology",
    },
    {
      q: "What are the primary datasets or benchmarks used for empirical validation?",
      a: extraction?.dataset || summary?.dataset || "Standard public benchmarks and domain-specific validation splits.",
      category: "Evaluation",
    },
    {
      q: "What key limitation or trade-off was explicitly acknowledged by the authors?",
      a: extraction?.limitations || "Sensitivity to hyperparameters and potential resource requirements during initial scaling.",
      category: "Limitations",
    },
  ];

  // Quiz Questions
  const quizQuestions = [
    {
      question: `What primary challenge does "${paper.title.slice(0, 45)}..." aim to overcome?`,
      options: [
        extraction?.research_problem ? extraction.research_problem.slice(0, 75) + "..." : "Algorithmic computational bottlenecks and latency overhead",
        "Replacing all transformer models with linear regression",
        "Eliminating the need for training data entirely",
        "Translating code between archaic programming languages",
      ],
      correct: 0,
      explanation: "The core research motivation focuses on addressing operational friction and performance trade-offs.",
    },
    {
      question: "Which of the following represents the main methodological innovation in this study?",
      options: [
        "Manual parameter guessing through trial and error",
        extraction?.methodology ? extraction.methodology.slice(0, 80) + "..." : "An automated, optimized pipeline for representation and inference",
        "Using synthetic data without ground truth validation",
        "Running tasks purely on CPU without vectorization",
      ],
      correct: 1,
      explanation: "The authors structure a systematic method that outperforms classical heuristics.",
    },
  ];

  const handleCopyScript = () => {
    const text = dialogueScript.map((d) => `${d.speaker} (${d.role}):\n${d.text}\n`).join("\n");
    navigator.clipboard.writeText(text);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* NotebookLM Header Banner */}
      <div className="rounded-2xl p-6 bg-gradient-to-br from-violet-900 via-indigo-900 to-slate-900 text-white shadow-xl border border-indigo-500/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-2 bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-3 py-1 rounded-full text-xs font-semibold tracking-wide">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>NotebookLM Student Study Studio</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Grounded Audio & Conceptual Guide
            </h2>
            <p className="text-xs text-indigo-200 max-w-xl leading-relaxed">
              Synthesized specifically for students, researchers, and autodidacts: conversational audio overviews, ELI5 analogies, and active recall flashcards.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-white/10 p-1.5 rounded-xl border border-white/10 text-xs">
            <button
              onClick={() => setActiveTab("audio")}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                activeTab === "audio" ? "bg-indigo-600 text-white shadow-sm" : "text-indigo-200 hover:text-white"
              }`}
            >
              🎙️ Deep Dive
            </button>
            <button
              onClick={() => setActiveTab("analogies")}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                activeTab === "analogies" ? "bg-indigo-600 text-white shadow-sm" : "text-indigo-200 hover:text-white"
              }`}
            >
              💡 ELI5 Analogies
            </button>
            <button
              onClick={() => setActiveTab("flashcards")}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                activeTab === "flashcards" ? "bg-indigo-600 text-white shadow-sm" : "text-indigo-200 hover:text-white"
              }`}
            >
              🗂️ Flashcards
            </button>
            <button
              onClick={() => setActiveTab("quiz")}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                activeTab === "quiz" ? "bg-indigo-600 text-white shadow-sm" : "text-indigo-200 hover:text-white"
              }`}
            >
              ❓ Quiz
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: AUDIO DEEP DIVE (NotebookLM PODCAST) */}
      {activeTab === "audio" && (
        <div className="space-y-5">
          {/* Audio Player Card */}
          <div className="bg-white rounded-2xl border border-indigo-100 p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                  <Headphones className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Research Deep Dive Podcast Overview</h4>
                  <p className="text-xs text-slate-500">2 AI Co-hosts • Jordan & Dr. Elena • ~8 min conversational breakdown</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                  className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs transition shadow-sm ${
                    isPlayingAudio
                      ? "bg-amber-600 hover:bg-amber-700 text-white"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white"
                  }`}
                >
                  {isPlayingAudio ? (
                    <>
                      <Pause className="h-4 w-4" />
                      <span>Pause Audio</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      <span>Play Deep Dive</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleCopyScript}
                  className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold flex items-center space-x-1"
                  title="Copy Full Transcript"
                >
                  {copiedScript ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Simulated Animated Equalizer when playing */}
            {isPlayingAudio && (
              <div className="flex items-center justify-between bg-indigo-50/70 p-3.5 rounded-xl border border-indigo-100">
                <div className="flex items-center space-x-2">
                  <Volume2 className="h-4 w-4 text-indigo-600" />
                  <span className="text-xs font-semibold text-indigo-900">Audio playing: Host dialogue synthesized</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="h-4 w-1 bg-indigo-600 rounded-full animate-pulse" />
                  <span className="h-6 w-1 bg-indigo-500 rounded-full animate-pulse delay-75" />
                  <span className="h-3 w-1 bg-indigo-400 rounded-full animate-pulse delay-150" />
                  <span className="h-7 w-1 bg-indigo-700 rounded-full animate-pulse delay-100" />
                  <span className="h-5 w-1 bg-indigo-600 rounded-full animate-pulse delay-200" />
                </div>
              </div>
            )}

            {/* Transcript Stream */}
            <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-2 pt-2">
              {dialogueScript.map((d, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border transition-all ${
                    idx === currentDialogueIdx && isPlayingAudio
                      ? "bg-indigo-50/90 border-indigo-300 ring-2 ring-indigo-200/60"
                      : "bg-slate-50/60 border-slate-200/80 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{d.avatar}</span>
                      <span className="text-xs font-bold text-slate-900">{d.speaker}</span>
                      <span className="text-[10px] font-medium text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                        {d.role}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setCurrentDialogueIdx(idx);
                        setIsPlayingAudio(true);
                      }}
                      className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      Listen
                    </button>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed pl-7">
                    {d.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ELI5 ANALOGIES */}
      {activeTab === "analogies" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {analogies.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 hover:border-indigo-200 transition"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="h-8 w-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                    <Lightbulb className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{item.concept}</h4>
                    <span className="text-[11px] font-mono text-slate-500">{item.technical}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50/60 to-orange-50/60 border border-amber-200/70 text-xs text-amber-950 leading-relaxed">
                  <span className="font-bold text-amber-900 block mb-1">💡 Real-World Metaphor (ELI5):</span>
                  {item.analogy}
                </div>

                <div className="flex items-center space-x-2 text-xs text-slate-600">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span><strong>Key takeaway:</strong> {item.takeaway}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: FLASHCARDS */}
      {activeTab === "flashcards" && (
        <div className="space-y-5">
          <div className="max-w-xl mx-auto space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
              <span>CARD {currentFlashcard + 1} OF {flashcards.length}</span>
              <span className="bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-100">
                {flashcards[currentFlashcard].category}
              </span>
            </div>

            {/* Flashcard Box */}
            <div
              onClick={() => setShowAnswer(!showAnswer)}
              className="cursor-pointer bg-white rounded-2xl border-2 border-indigo-100 hover:border-indigo-300 p-8 min-h-[260px] flex flex-col justify-between shadow-sm transition-all transform hover:-translate-y-0.5"
            >
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  {showAnswer ? "Answer / Explanation" : "Question / Concept Prompt"}
                </span>
                <p className="text-base font-bold text-slate-900 leading-snug">
                  {showAnswer ? flashcards[currentFlashcard].a : flashcards[currentFlashcard].q}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>{showAnswer ? "Click card to hide answer" : "Click anywhere to reveal answer"}</span>
                <RotateCcw className="h-4 w-4 text-indigo-500" />
              </div>
            </div>

            {/* Flashcard Controls */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => {
                  setShowAnswer(false);
                  setCurrentFlashcard((prev) => Math.max(0, prev - 1));
                }}
                disabled={currentFlashcard === 0}
                className="flex items-center space-x-1 px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </button>

              <button
                onClick={() => setShowAnswer(!showAnswer)}
                className="px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold hover:bg-indigo-100"
              >
                {showAnswer ? "Hide Answer" : "Reveal Answer"}
              </button>

              <button
                onClick={() => {
                  setShowAnswer(false);
                  setCurrentFlashcard((prev) => Math.min(flashcards.length - 1, prev + 1));
                }}
                disabled={currentFlashcard === flashcards.length - 1}
                className="flex items-center space-x-1 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 disabled:opacity-40"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: QUICK QUIZ */}
      {activeTab === "quiz" && (
        <div className="space-y-4">
          {quizQuestions.map((q, qIdx) => {
            const hasAnswered = selectedQuizAnswers[qIdx] !== undefined;
            const isCorrect = selectedQuizAnswers[qIdx] === q.correct;

            return (
              <div key={qIdx} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center space-x-2">
                  <span className="h-6 w-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                    {qIdx + 1}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900">{q.question}</h4>
                </div>

                <div className="space-y-2">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = selectedQuizAnswers[qIdx] === optIdx;
                    let optClass = "border-slate-200 hover:bg-slate-50 text-slate-700";

                    if (hasAnswered) {
                      if (optIdx === q.correct) {
                        optClass = "border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold";
                      } else if (isSelected) {
                        optClass = "border-rose-400 bg-rose-50 text-rose-900";
                      }
                    }

                    return (
                      <button
                        key={optIdx}
                        onClick={() => setSelectedQuizAnswers((prev) => ({ ...prev, [qIdx]: optIdx }))}
                        disabled={hasAnswered}
                        className={`w-full text-left p-3.5 rounded-xl border text-xs transition flex items-center justify-between ${optClass}`}
                      >
                        <span>{opt}</span>
                        {hasAnswered && optIdx === q.correct && (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {hasAnswered && (
                  <div
                    className={`p-3 rounded-xl text-xs ${
                      isCorrect ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-900"
                    }`}
                  >
                    <span className="font-bold">{isCorrect ? "Correct! " : "Note: "}</span>
                    {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
