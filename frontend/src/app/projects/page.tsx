"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FolderKanban, Plus, BookOpen, Trash2, Calendar, Tag, ArrowRight, Loader2, X } from "lucide-react";
import { api } from "@/lib/api";
import { ResearchProject, Paper } from "@/types";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [selectedPaperIds, setSelectedPaperIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [projs, paps] = await Promise.all([api.getProjects(), api.getPapers()]);
      setProjects(projs);
      setPapers(paps);
    } catch (e) {
      console.error("Error loading projects:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await api.createProject({
        name: name.trim(),
        description: description.trim(),
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        paper_ids: selectedPaperIds,
      });
      setName("");
      setDescription("");
      setTags("");
      setSelectedPaperIds([]);
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      alert("Failed to create project.");
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Delete this research project? (Linked papers remain in library)")) {
      await api.deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-accent-purple uppercase tracking-wider mb-1">
            <FolderKanban className="h-4 w-4" />
            <span>Research Organization</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Research Projects</h1>
          <p className="text-xs text-foreground-muted mt-1">
            Organize papers into dedicated project workspaces for group synthesis, notes, and focused RAG.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-hover transition shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-foreground-muted">
          Loading projects...
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface p-16 text-center text-xs text-foreground-muted">
          No research projects created yet. Click &quot;New Project&quot; above to organize your literature.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((proj) => (
            <Link
              key={proj.id}
              href={`/projects/${proj.id}`}
              className="rounded-xl border border-border bg-surface p-5 hover:border-accent-purple/50 hover:bg-surface-hover transition flex flex-col justify-between group shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-accent-purple/10 text-accent-purple border border-accent-purple/20">
                    WORKSPACE
                  </span>
                  <button
                    onClick={(e) => handleDelete(proj.id, e)}
                    className="text-foreground-subtle hover:text-accent-rose p-1 transition opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <h2 className="text-sm font-bold text-foreground group-hover:text-accent-purple transition line-clamp-1">
                  {proj.name}
                </h2>
                <p className="text-xs text-foreground-muted mt-1 line-clamp-2 leading-relaxed">
                  {proj.description || "No project description provided."}
                </p>

                {proj.tags && proj.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {proj.tags.map((t) => (
                      <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-border text-foreground-muted">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-border flex items-center justify-between text-xs text-foreground-subtle">
                <span className="flex items-center space-x-1">
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>{proj.papers ? proj.papers.length : 0} Papers</span>
                </span>
                <span className="flex items-center space-x-1 text-primary-light font-semibold group-hover:translate-x-0.5 transition">
                  <span>Open Workspace</span>
                  <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-surface p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h2 className="text-sm font-bold text-foreground">Create Research Project</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-foreground-muted hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block text-foreground-muted mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Clinical QA Benchmarks"
                  className="w-full rounded-lg border border-border bg-surface-card px-3 py-2 text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-foreground-muted mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Goals, hypotheses, and scope..."
                  className="w-full rounded-lg border border-border bg-surface-card px-3 py-2 text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-foreground-muted mb-1">Tags (Comma-separated)</label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="e.g. Healthcare, RAG, Benchmarks"
                  className="w-full rounded-lg border border-border bg-surface-card px-3 py-2 text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-foreground-muted mb-1">Attach Papers from Library</label>
                <div className="max-h-36 overflow-y-auto space-y-1 rounded-lg border border-border p-2 bg-surface-card">
                  {papers.map((p) => {
                    const isChecked = selectedPaperIds.includes(p.id);
                    return (
                      <label key={p.id} className="flex items-center space-x-2 text-xs p-1 hover:bg-surface-hover rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            setSelectedPaperIds((prev) =>
                              prev.includes(p.id) ? prev.filter((i) => i !== p.id) : [...prev, p.id]
                            );
                          }}
                        />
                        <span className="truncate">{p.title}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-border flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-border text-foreground-muted hover:bg-surface-hover"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-primary font-semibold text-white hover:bg-primary-hover"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
