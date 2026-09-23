"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  MessageSquare,
  Send,
  Plus,
  Trash2,
  Copy,
  Check,
  BookmarkPlus,
  Loader2,
  Globe,
  ExternalLink,
  Sparkles,
  BookOpen,
  Volume2,
  GraduationCap,
  Microscope,
  GitFork,
  Presentation,
} from "lucide-react";
import { api } from "@/lib/api";
import { Conversation, Message, Paper } from "@/types";
import { useMode } from "@/context/ModeContext";
import { MarkdownRenderer } from "@/components/chat/MarkdownRenderer";
import { FlowchartGenerator } from "@/components/research/FlowchartGenerator";
import { PresentationModal } from "@/components/research/PresentationModal";

function ResearchChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeConvIdFromQuery = searchParams.get("id");
  const scopedPaperId = searchParams.get("paper_id");
  const scopedPaperIds = searchParams.get("paper_ids")
    ? searchParams.get("paper_ids")!.split(",")
    : [];
  const queryParam = searchParams.get("query");

  const { mode, isStudent } = useMode();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(activeConvIdFromQuery);
  const [messages, setMessages] = useState<Message[]>([]);
  const [allPapers, setAllPapers] = useState<Paper[]>([]);
  const [selectedPaperIds, setSelectedPaperIds] = useState<string[]>(
    scopedPaperId ? [scopedPaperId] : scopedPaperIds
  );

  const [input, setInput] = useState(queryParam || "");
  const [loading, setLoading] = useState(false);
  const [useWebResearch, setUseWebResearch] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showDiagram, setShowDiagram] = useState(false);

  // Presentation State
  const [isPresModalOpen, setIsPresModalOpen] = useState(false);
  const [presentation, setPresentation] = useState<any>(null);
  const [presLoading, setPresLoading] = useState(false);

  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([
    "What are the primary empirical contributions across the indexed papers?",
    "Compare the benchmark datasets and evaluation metrics used.",
    "Explain the core methodology simply with an intuitive analogy.",
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadConversations = async () => {
    try {
      const convs = await api.getConversations();
      setConversations(convs);
      if (!activeConvId && convs.length > 0 && !scopedPaperId && scopedPaperIds.length === 0) {
        setActiveConvId(convs[0].id);
      }
    } catch (err) {
      console.error("Failed to load conversations:", err);
    }
  };

  const loadPapers = async () => {
    try {
      const papers = await api.getPapers();
      setAllPapers(papers);
    } catch {}
  };

  useEffect(() => {
    loadConversations();
    loadPapers();
  }, []);

  useEffect(() => {
    if (activeConvId) {
      api.getConversation(activeConvId)
        .then((conv) => {
          setMessages(conv.messages || []);
          if (conv.paper_ids && conv.paper_ids.length > 0) {
            setSelectedPaperIds(conv.paper_ids);
          }
        })
        .catch(() => {});
    } else {
      setMessages([]);
    }
  }, [activeConvId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleNewChat = () => {
    setActiveConvId(null);
    setMessages([]);
    setSelectedPaperIds([]);
    router.push("/chat");
  };

  const handleDeleteConv = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Delete this research conversation?")) {
      await api.deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConvId === id) {
        handleNewChat();
      }
    }
  };

  const handleSendMessage = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const queryText = customQuery || input.trim();
    if (!queryText || loading) return;

    const userMessage: Message = {
      id: "temp-" + Date.now(),
      conversation_id: activeConvId || "new",
      role: "user",
      content: queryText,
      citations: [],
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.sendChat({
        conversation_id: activeConvId || undefined,
        content: queryText,
        paper_ids: selectedPaperIds,
        use_web_research: useWebResearch,
        mode,
      });

      setMessages((prev) => [...prev, res.message]);
      if (res.conversation_id && !activeConvId) {
        setActiveConvId(res.conversation_id);
        loadConversations();
      }
      if (res.suggested_questions && res.suggested_questions.length > 0) {
        setSuggestedQuestions(res.suggested_questions);
      }
    } catch (err: any) {
      alert("Error sending message: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveInsight = async (content: string) => {
    try {
      await api.createInsight({
        content,
        insight_type: "finding",
        paper_id: selectedPaperIds[0] || undefined,
      });
      alert("Finding saved to your research insights!");
    } catch {
      alert("Failed to save insight.");
    }
  };

  const handleGenerateSlidesFromChat = async () => {
    if (selectedPaperIds.length === 0 && allPapers.length > 0) {
      selectedPaperIds.push(allPapers[0].id);
    }
    if (selectedPaperIds.length === 0) {
      alert("Please select at least one paper in scope to generate slides.");
      return;
    }
    setIsPresModalOpen(true);
    setPresLoading(true);
    try {
      const res = await api.generatePresentation(
        selectedPaperIds,
        "Research Synthesis Slide Deck",
        mode
      );
      setPresentation(res);
    } catch (e: any) {
      alert("Presentation creation failed: " + e.message);
    } finally {
      setPresLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-7rem)] flex space-x-6 max-w-7xl mx-auto animate-fade-in">
      {/* Left Sidebar: Conversations & Scope */}
      <div className="w-80 border border-slate-200 rounded-3xl bg-white flex flex-col shrink-0 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center space-x-2 rounded-2xl bg-blue-50 hover:bg-blue-100/90 border border-blue-200 px-4 py-2.5 text-xs font-bold text-blue-700 active:scale-98 transition shadow-2xs"
          >
            <Plus className="h-4 w-4 text-blue-600" />
            <span>New Research Chat</span>
          </button>
        </div>

        {/* Paper Scope Selector */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/70 space-y-3">
          <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
            <span>Research Document Scope</span>
            {selectedPaperIds.length > 0 && (
              <button
                onClick={() => setSelectedPaperIds([])}
                className="text-[10px] text-blue-600 hover:underline font-bold"
              >
                Reset to All
              </button>
            )}
          </label>
          <select
            value={selectedPaperIds[0] || ""}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedPaperIds(val ? [val] : []);
            }}
            className="w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 focus:border-blue-600 focus:outline-none shadow-2xs font-semibold"
          >
            <option value="">All Papers in Library ({allPapers.length})</option>
            {allPapers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title.length > 35 ? p.title.slice(0, 35) + "..." : p.title}
              </option>
            ))}
          </select>

          {/* Web Research Live Switch */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-bold text-slate-700">Web Research</span>
            </div>
            <button
              onClick={() => setUseWebResearch(!useWebResearch)}
              className={`text-[11px] font-bold px-3 py-1 rounded-full border transition ${
                useWebResearch
                  ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                  : "bg-slate-200 text-slate-600 border-slate-300"
              }`}
            >
              {useWebResearch ? "ON (arXiv)" : "OFF"}
            </button>
          </div>
        </div>

        {/* Conversations History */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <span className="text-[10px] font-black text-slate-400 px-3 py-1.5 uppercase tracking-wider block">
            Past Conversations
          </span>
          {conversations.length === 0 ? (
            <p className="text-center text-xs text-slate-400 py-8">No previous chats.</p>
          ) : (
            conversations.map((c) => (
              <div
                key={c.id}
                onClick={() => setActiveConvId(c.id)}
                className={`flex items-center justify-between p-3 rounded-2xl text-xs cursor-pointer transition group ${
                  activeConvId === c.id
                    ? "bg-blue-50 text-blue-800 font-bold border border-blue-200/70 shadow-2xs"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"
                }`}
              >
                <div className="flex items-center space-x-2.5 truncate pr-2">
                  <MessageSquare className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-blue-600" />
                  <span className="truncate">{c.title}</span>
                </div>
                <button
                  onClick={(e) => handleDeleteConv(c.id, e)}
                  className="opacity-0 group-hover:opacity-100 hover:text-rose-600 transition p-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col border border-slate-200 rounded-3xl bg-white overflow-hidden shadow-xs">
        {/* Top Header */}
        <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center space-x-2.5">
            <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-extrabold text-xs md:text-sm text-slate-900">
              {isStudent ? "Student Mode: Intuitive Conceptual Q&A" : "Professional Mode: Citation-Grounded Research Engine"}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowDiagram(!showDiagram)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition shadow-2xs"
            >
              <GitFork className="h-3.5 w-3.5 text-cyan-600" />
              <span>Diagram</span>
            </button>
            <button
              onClick={handleGenerateSlidesFromChat}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white transition shadow-sm shadow-indigo-500/20"
            >
              <Presentation className="h-3.5 w-3.5" />
              <span>Make Slides</span>
            </button>
          </div>
        </div>

        {showDiagram && (
          <div className="p-4 border-b border-slate-100">
            <FlowchartGenerator title="Hypothesis & Experimental Flow" />
          </div>
        )}

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-16">
              <div className="h-14 w-14 rounded-3xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs">
                <Sparkles className="h-7 w-7" />
              </div>
              <div className="space-y-1.5 max-w-md">
                <h3 className="font-black text-slate-900 text-lg">
                  {isStudent ? "Welcome to your AI Research Tutor" : "Grounded Scientific Research Chat"}
                </h3>
                <p className="text-xs md:text-sm text-slate-500 font-medium leading-relaxed">
                  Every answer provides traceable bracket citations linking directly to verified paper passages, page numbers, and figures.
                </p>
              </div>

              <div className="w-full max-w-lg space-y-2 pt-4 text-left">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block px-1">
                  Suggested Prompts
                </span>
                {suggestedQuestions.map((suggested, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(undefined, suggested)}
                    className="w-full text-left p-3.5 rounded-2xl border border-slate-200/80 bg-slate-50/70 hover:bg-blue-50 hover:border-blue-200 text-xs md:text-sm text-slate-800 hover:text-blue-900 transition font-semibold shadow-2xs"
                  >
                    &quot;{suggested}&quot;
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col space-y-2 max-w-3xl ${
                  msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                }`}
              >
                <div
                  className={`rounded-3xl p-5 md:p-6 text-xs md:text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-none shadow-xs font-medium"
                      : "bg-white border border-slate-200/90 text-slate-900 rounded-bl-none shadow-xs"
                  }`}
                >
                  <MarkdownRenderer content={msg.content} citations={msg.citations} />

                  {/* Sources Drawer / Cards */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-5 pt-4 border-t border-slate-200/90 space-y-2.5">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
                        Verified Sources & Citations ({msg.citations.length})
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {msg.citations.map((c, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-2xl border border-slate-200 bg-white text-xs space-y-1 shadow-2xs"
                          >
                            <div className="flex items-center justify-between font-bold text-blue-700">
                              <span className="truncate max-w-[200px]">{c.paper_title}</span>
                              <span className="font-mono text-slate-400 text-[11px]">p.{c.page_number}</span>
                            </div>
                            <p className="text-slate-600 line-clamp-2 text-[11px] leading-normal font-normal">
                              {c.excerpt}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Assistant Message Actions */}
                {msg.role === "assistant" && (
                  <div className="flex items-center space-x-3 text-xs text-slate-400 px-2 font-semibold">
                    <button
                      onClick={() => handleCopy(msg.content, msg.id)}
                      className="hover:text-blue-600 flex items-center space-x-1 transition"
                    >
                      {copiedId === msg.id ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                      <span>{copiedId === msg.id ? "Copied" : "Copy"}</span>
                    </button>
                    <span>•</span>
                    <button
                      onClick={() => handleSaveInsight(msg.content)}
                      className="hover:text-blue-600 flex items-center space-x-1 transition"
                    >
                      <BookmarkPlus className="h-3.5 w-3.5" />
                      <span>Save as Insight</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}

          {loading && (
            <div className="flex items-center space-x-3 p-4 rounded-2xl border border-blue-100 bg-blue-50/70 text-xs md:text-sm text-blue-900 max-w-md shadow-2xs">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              <span className="font-bold">Searching evidence and synthesizing response...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions Bar */}
        {suggestedQuestions.length > 0 && messages.length > 0 && (
          <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center gap-2 overflow-x-auto">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 shrink-0">
              Next Questions:
            </span>
            <div className="flex items-center gap-2 overflow-x-auto py-0.5">
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(undefined, q)}
                  className="text-xs font-semibold whitespace-nowrap bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 px-3 py-1.5 rounded-xl transition shadow-2xs"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-4 px-6 border-t border-slate-100 bg-white flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask research question, compare empirical findings, or explore methodology..."
            className="flex-1 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-xs md:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:outline-none transition shadow-2xs font-medium"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="h-11 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 flex items-center justify-center space-x-2 text-white font-bold text-xs md:text-sm transition shadow-sm shadow-blue-500/25 active:scale-95 shrink-0"
          >
            <span>Ask</span>
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>

      {/* Presentation Modal */}
      <PresentationModal
        isOpen={isPresModalOpen}
        onClose={() => setIsPresModalOpen(false)}
        presentation={presentation}
        loading={presLoading}
        topicTitle="Research Chat Synthesis Slides"
      />
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs text-slate-400">Loading chat...</div>}>
      <ResearchChatContent />
    </Suspense>
  );
}
