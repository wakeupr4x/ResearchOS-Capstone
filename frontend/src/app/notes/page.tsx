"use client";

import React, { useState, useEffect } from "react";
import { FileEdit, Plus, Trash2, Tag, Search, BookOpen, Clock, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { Note, Paper } from "@/types";

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [paperId, setPaperId] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [notesData, papersData] = await Promise.all([api.getNotes(), api.getPapers()]);
      setNotes(notesData);
      setPapers(papersData);
    } catch (err) {
      console.error("Error loading notes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    try {
      await api.createNote({
        title: title.trim(),
        content: content.trim(),
        paper_id: paperId || undefined,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      });
      setTitle("");
      setContent("");
      setPaperId("");
      setTags("");
      loadData();
    } catch {
      alert("Failed to save note.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this note?")) {
      await api.deleteNote(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
    }
  };

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-accent-cyan uppercase tracking-wider mb-1">
          <FileEdit className="h-4 w-4" />
          <span>Research Logbook</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground">Research Notes</h1>
        <p className="text-xs text-foreground-muted mt-1">
          Jot down hypotheses, literature observations, experimental ideas, and paper critiques.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Create Note Form (4 cols) */}
        <div className="lg:col-span-4">
          <form onSubmit={handleCreate} className="p-5 rounded-xl border border-border bg-surface space-y-4 text-xs shadow-sm sticky top-20">
            <h2 className="text-sm font-bold text-foreground">Create New Note</h2>

            <div>
              <label className="block text-foreground-muted mb-1">Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Note heading..."
                className="w-full rounded-lg border border-border bg-surface-card px-3 py-2 text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-foreground-muted mb-1">Content (Markdown supported)</label>
              <textarea
                rows={5}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write observations, equations, or takeaways..."
                className="w-full rounded-lg border border-border bg-surface-card px-3 py-2 text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-foreground-muted mb-1">Attach to Paper (Optional)</label>
              <select
                value={paperId}
                onChange={(e) => setPaperId(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface-card px-3 py-2 text-foreground focus:border-primary focus:outline-none"
              >
                <option value="">None (General Note)</option>
                {papers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title.slice(0, 40)}...
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-foreground-muted mb-1">Tags</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g. Critique, Experiment"
                className="w-full rounded-lg border border-border bg-surface-card px-3 py-2 text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-primary py-2 font-semibold text-white hover:bg-primary-hover transition shadow-sm"
            >
              Save Note
            </button>
          </form>
        </div>

        {/* Notes Feed (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-foreground-subtle" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes..."
              className="w-full rounded-xl border border-border bg-surface pl-10 pr-4 py-2 text-xs text-foreground placeholder-foreground-subtle focus:border-primary focus:outline-none"
            />
          </div>

          {loading ? (
            <div className="py-20 text-center text-xs text-foreground-muted">Loading notes...</div>
          ) : filteredNotes.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-surface p-12 text-center text-xs text-foreground-muted">
              No notes found.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotes.map((note) => {
                const attachedPaper = papers.find((p) => p.id === note.paper_id);
                return (
                  <div key={note.id} className="p-5 rounded-xl border border-border bg-surface space-y-2 relative group shadow-sm text-xs">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-foreground">{note.title}</h3>
                      <button
                        onClick={() => handleDelete(note.id)}
                        className="text-foreground-subtle hover:text-accent-rose p-1 transition opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <p className="text-foreground-muted leading-relaxed whitespace-pre-wrap">{note.content}</p>

                    <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-2 text-[11px] text-foreground-subtle">
                      {attachedPaper ? (
                        <span className="flex items-center space-x-1 text-primary-light font-medium">
                          <BookOpen className="h-3 w-3" />
                          <span className="truncate max-w-[240px]">{attachedPaper.title}</span>
                        </span>
                      ) : (
                        <span>General Note</span>
                      )}

                      <div className="flex items-center space-x-2">
                        {note.tags && note.tags.map((t) => (
                          <span key={t} className="px-1.5 py-0.2 rounded bg-border text-foreground-muted text-[10px]">
                            {t}
                          </span>
                        ))}
                        <span>•</span>
                        <span>{new Date(note.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
