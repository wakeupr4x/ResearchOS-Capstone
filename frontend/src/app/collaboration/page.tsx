"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Share2,
  Plus,
  MessageSquare,
  BookOpen,
  Check,
  Copy,
  ExternalLink,
  Highlighter,
  UserCheck,
  FolderKanban,
  Sparkles,
} from "lucide-react";
import { api } from "@/lib/api";
import { SharedWorkspace, CollaborationAnnotation, Paper } from "@/types";

export default function CollaborationPage() {
  const [workspaces, setWorkspaces] = useState<SharedWorkspace[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>("ws-default");
  const [annotations, setAnnotations] = useState<CollaborationAnnotation[]>([]);
  const [allPapers, setAllPapers] = useState<Paper[]>([]);

  // New annotation state
  const [selectedPaperId, setSelectedPaperId] = useState<string>("");
  const [userName, setUserName] = useState<string>("Researcher (You)");
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [highlightText, setHighlightText] = useState<string>("");
  const [commentText, setCommentText] = useState<string>("");

  // Share Modal
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [shareLink, setShareLink] = useState<string>("");
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  useEffect(() => {
    api.getWorkspaces().then(setWorkspaces).catch(() => {});
    api.getAnnotations("all").then(setAnnotations).catch(() => {});
    api.getPapers().then((p) => {
      setAllPapers(p);
      if (p.length > 0) setSelectedPaperId(p[0].id);
    }).catch(() => {});
  }, []);

  const activeWorkspace =
    workspaces.find((w) => w.workspace_id === activeWorkspaceId) || workspaces[0];

  const handleAddAnnotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!highlightText.trim() || !commentText.trim()) return;

    try {
      const newAnn = await api.addAnnotation({
        paper_id: selectedPaperId || (allPapers[0] ? allPapers[0].id : "p-1"),
        user_name: userName,
        page_number: Number(pageNumber) || 1,
        highlight_text: highlightText,
        comment: commentText,
      });
      setAnnotations((prev) => [newAnn, ...prev]);
      setHighlightText("");
      setCommentText("");
    } catch (e: any) {
      alert("Failed to add annotation: " + e.message);
    }
  };

  const handleOpenShare = async () => {
    setIsShareModalOpen(true);
    try {
      const res = await api.generateShareLink({
        type: "workspace",
        id: activeWorkspaceId,
        access_level: "editor",
      });
      setShareLink(res.share_url);
    } catch {
      setShareLink("https://researchos.internal/share/workspace/default?token=94f83a21");
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            <Users className="h-4 w-4" />
            <span>Collaborative Intelligence Hub</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Shared Research Workspaces</h1>
          <p className="text-xs text-slate-500 mt-1">
            Co-author research, share highlighted paper passages, and collaborate on literature reviews in real time.
          </p>
        </div>

        <button
          onClick={handleOpenShare}
          className="flex items-center space-x-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2.5 text-xs font-bold text-white transition shadow-sm"
        >
          <Share2 className="h-4 w-4" />
          <span>Share Project & Invite</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Workspaces & Members (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Workspaces List */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Active Research Labs
            </span>
            <div className="space-y-2">
              {workspaces.map((ws) => {
                const isActive = ws.workspace_id === activeWorkspaceId;
                return (
                  <div
                    key={ws.workspace_id}
                    onClick={() => setActiveWorkspaceId(ws.workspace_id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition ${
                      isActive
                        ? "bg-blue-50/70 border-blue-200 shadow-2xs"
                        : "bg-slate-50/50 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{ws.name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100/70 text-blue-700">
                        {ws.members.length} members
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {ws.shared_notes.length} shared research milestones
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Members Card */}
          {activeWorkspace && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Lab Members ({activeWorkspace.members.length})
              </span>
              <div className="space-y-2">
                {activeWorkspace.members.map((member, idx) => (
                  <div key={idx} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-slate-50">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-2xs">
                      {member[0]}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{member}</p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {idx === 0 ? "Project Lead / Principal Investigator" : "Co-Investigator"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Shared Goals / Notes */}
          {activeWorkspace && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Shared Lab Objectives
              </span>
              <ul className="space-y-2 text-xs text-slate-700">
                {activeWorkspace.shared_notes.map((note, idx) => (
                  <li key={idx} className="flex items-start space-x-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Column: Collaborative Annotations & Highlights Stream (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Add Annotation Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center space-x-2">
              <Highlighter className="h-4 w-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">Add Peer Highlight & Annotation</h2>
            </div>

            <form onSubmit={handleAddAnnotation} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">Target Document</label>
                  <select
                    value={selectedPaperId}
                    onChange={(e) => setSelectedPaperId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none font-medium"
                  >
                    {allPapers.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title.length > 35 ? p.title.slice(0, 35) + "..." : p.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-1">Page Number</label>
                  <input
                    type="number"
                    min={1}
                    value={pageNumber}
                    onChange={(e) => setPageNumber(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">Highlighted Quote / Excerpt</label>
                <input
                  type="text"
                  value={highlightText}
                  onChange={(e) => setHighlightText(e.target.value)}
                  placeholder="Paste excerpt or empirical claim from paper..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none font-medium"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">Your Peer Comment / Critique</label>
                <textarea
                  rows={2}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Share analysis, verification note, or suggestion for co-authors..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none font-medium"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="flex items-center space-x-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2 text-xs font-bold text-white transition shadow-xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Post Annotation</span>
                </button>
              </div>
            </form>
          </div>

          {/* Annotations Stream */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-900">
                Shared Annotations & Highlights Stream ({annotations.length})
              </span>
              <span className="text-[11px] text-slate-400">Synchronized</span>
            </div>

            <div className="space-y-3">
              {annotations.length === 0 ? (
                <p className="text-center py-10 text-xs text-slate-400">No collaborative annotations posted yet.</p>
              ) : (
                annotations.map((ann) => (
                  <div
                    key={ann.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2 hover:bg-slate-50 transition"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2 font-bold text-slate-800">
                        <span className="text-blue-600 font-extrabold">{ann.user_name}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-500 font-normal">Page {ann.page_number}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(ann.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Highlighted text block */}
                    <div className="p-3 bg-amber-50/70 border-l-3 border-amber-400 rounded-r-lg text-xs text-amber-950 font-medium italic">
                      &ldquo;{ann.highlight_text}&rdquo;
                    </div>

                    {/* Comment */}
                    <p className="text-xs text-slate-700 leading-relaxed font-normal pt-1">
                      {ann.comment}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Share2 className="h-5 w-5 text-blue-600" />
                <h3 className="font-extrabold text-slate-900 text-sm">Share Research Workspace</h3>
              </div>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Invite collaborators to review literature, run joint RAG queries, and comment on papers.
            </p>

            <div className="flex items-center space-x-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <input
                type="text"
                readOnly
                value={shareLink}
                className="flex-1 bg-transparent text-xs text-slate-700 font-mono outline-none"
              />
              <button
                onClick={copyShareLink}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs shrink-0"
              >
                {copiedLink ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                <span>{copiedLink ? "Copied" : "Copy"}</span>
              </button>
            </div>

            <div className="pt-2 text-[11px] text-slate-400 text-center">
              Shared links grant collaborative editor access for 30 days.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
