"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FolderKanban,
  BookOpen,
  MessageSquare,
  Columns,
  Sparkles,
  ArrowLeft,
  Plus,
  Trash2,
  FileEdit,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { api } from "@/lib/api";
import { ResearchProject, Paper, Note } from "@/types";

export default function ProjectWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<ResearchProject | null>(null);
  const [allPapers, setAllPapers] = useState<Paper[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [projData, papersData, notesData] = await Promise.all([
        api.getProject(projectId),
        api.getPapers(),
        api.getNotes(undefined, projectId),
      ]);
      setProject(projData);
      setAllPapers(papersData);
      setNotes(notesData);
    } catch (err) {
      console.error("Error loading project workspace:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [projectId]);

  const handleCreateProjectNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim() || !newNoteContent.trim()) return;
    try {
      await api.createNote({
        title: newNoteTitle.trim(),
        content: newNoteContent.trim(),
        project_id: projectId,
        tags: ["Project Note"],
      });
      setNewNoteTitle("");
      setNewNoteContent("");
      api.getNotes(undefined, projectId).then(setNotes);
    } catch {
      alert("Failed to save note.");
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-xs text-foreground-muted">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
        <span>Loading project workspace...</span>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="py-20 text-center text-foreground-muted text-xs">
        Project not found.
      </div>
    );
  }

  const projectPaperIds = project.papers ? project.papers.map((p) => p.id) : [];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div className="flex items-center space-x-3">
          <Link
            href="/projects"
            className="p-1.5 rounded-lg border border-border bg-surface text-foreground-muted hover:text-foreground hover:bg-surface-hover transition"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-accent-purple uppercase tracking-wider">
              <FolderKanban className="h-3.5 w-3.5" />
              <span>Project Workspace</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground mt-0.5">{project.name}</h1>
            <p className="text-xs text-foreground-muted mt-1">{project.description}</p>
          </div>
        </div>

        {/* Quick Action Shortcuts */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              if (projectPaperIds.length === 0) {
                alert("No papers linked to this project yet.");
                return;
              }
              router.push(`/chat?paper_ids=${projectPaperIds.join(",")}&project_id=${project.id}`);
            }}
            className="flex items-center space-x-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-hover transition shadow-sm"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Chat Project Scope</span>
          </button>

          <button
            onClick={() => {
              if (projectPaperIds.length < 2) {
                alert("Please add at least 2 papers to compare.");
                return;
              }
              router.push(`/compare?ids=${projectPaperIds.join(",")}`);
            }}
            className="flex items-center space-x-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface-hover transition"
          >
            <Columns className="h-3.5 w-3.5 text-primary-light" />
            <span>Compare Papers</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Linked Papers & Project Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Papers (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground flex items-center space-x-2">
              <BookOpen className="h-4 w-4 text-primary-light" />
              <span>Linked Papers ({project.papers ? project.papers.length : 0})</span>
            </h2>
          </div>

          {!project.papers || project.papers.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-surface p-10 text-center text-xs text-foreground-muted">
              No papers currently linked to this project.
            </div>
          ) : (
            <div className="space-y-3">
              {project.papers.map((p) => (
                <div
                  key={p.id}
                  className="p-4 rounded-xl border border-border bg-surface hover:border-primary/30 transition flex items-start justify-between shadow-sm"
                >
                  <div className="space-y-1 pr-3">
                    <Link href={`/papers/${p.id}`} className="font-semibold text-xs text-foreground hover:text-primary-light transition">
                      {p.title}
                    </Link>
                    <p className="text-[11px] text-foreground-muted line-clamp-1">
                      {p.authors ? p.authors.join(", ") : "Unknown"} • {p.publication_year || "2024"}
                    </p>
                    {p.abstract && (
                      <p className="text-[11px] text-foreground-subtle line-clamp-2 pt-1">{p.abstract}</p>
                    )}
                  </div>
                  <Link
                    href={`/papers/${p.id}`}
                    className="shrink-0 p-1.5 rounded-lg border border-border text-xs text-foreground-muted hover:text-foreground hover:bg-surface-card transition"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Project Notes (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center space-x-2 text-sm font-bold text-foreground">
            <FileEdit className="h-4 w-4 text-accent-cyan" />
            <span>Project Research Notes</span>
          </div>

          <form onSubmit={handleCreateProjectNote} className="p-4 rounded-xl border border-border bg-surface space-y-3 text-xs shadow-sm">
            <input
              type="text"
              value={newNoteTitle}
              onChange={(e) => setNewNoteTitle(e.target.value)}
              placeholder="Note title (e.g. 'Synthesized hypothesis')..."
              className="w-full rounded-lg border border-border bg-surface-card px-3 py-2 text-foreground focus:border-primary focus:outline-none"
            />
            <textarea
              rows={3}
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              placeholder="Draft cross-paper synthesis or research notes..."
              className="w-full rounded-lg border border-border bg-surface-card px-3 py-2 text-foreground focus:border-primary focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-lg bg-primary px-3 py-1.5 font-semibold text-white hover:bg-primary-hover transition"
            >
              Add Project Note
            </button>
          </form>

          <div className="space-y-3">
            {notes.length === 0 ? (
              <p className="text-center text-xs text-foreground-muted py-6">No notes added to this project yet.</p>
            ) : (
              notes.map((note) => (
                <div key={note.id} className="p-4 rounded-xl border border-border bg-surface text-xs space-y-1">
                  <h3 className="font-semibold text-foreground">{note.title}</h3>
                  <p className="text-foreground-muted leading-relaxed whitespace-pre-line">{note.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
