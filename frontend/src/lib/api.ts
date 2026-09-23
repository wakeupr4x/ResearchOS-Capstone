import {
  DashboardStats,
  Paper,
  PaperDetail,
  Conversation,
  Message,
  SummaryResponse,
  ExtractionResponse,
  CompareResponse,
  LiteratureReviewResponse,
  ResearchGapsResponse,
  DiscoveredPaper,
  ResearchProject,
  Note,
  SavedInsight,
} from "../types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || (typeof window !== "undefined" ? "/api" : "http://localhost:8000/api");

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    let errMsg = `Request failed: ${res.status} ${res.statusText}`;
    try {
      const errJson = await res.json();
      if (errJson.detail) errMsg = errJson.detail;
    } catch {}
    throw new Error(errMsg);
  }
  return res.json();
}

export const api = {
  // Stats & Health
  getStats: () => request<DashboardStats>("/stats"),
  getHealth: () => request<{ status: string }>("/health"),

  // Papers
  getPapers: (query?: string, tag?: string) => {
    const params = new URLSearchParams();
    if (query) params.set("query", query);
    if (tag) params.set("tag", tag);
    return request<Paper[]>(`/papers?${params.toString()}`);
  },
  getPaper: (id: string) => request<PaperDetail>(`/papers/${id}`),
  uploadPaper: async (file: File, title?: string, tags?: string): Promise<Paper> => {
    const formData = new FormData();
    formData.append("file", file);
    if (title) formData.append("title", title);
    if (tags) formData.append("tags", tags);

    const res = await fetch(`${API_BASE}/papers/upload`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Upload failed");
    }
    return res.json();
  },
  deletePaper: (id: string) => request<{ message: string }>(`/papers/${id}`, { method: "DELETE" }),
  reprocessPaper: (id: string) => request<Paper>(`/papers/${id}/process`, { method: "POST" }),
  getPaperStatus: (id: string) => request<{ id: string; status: string; error_message?: string; page_count: number; chunks_indexed: number }>(`/papers/${id}/status`),
  getPaperFileUrl: (id: string) => `${API_BASE}/papers/${id}/file`,

  // Research Intelligence
  getPaperSummary: (id: string) => request<SummaryResponse>(`/papers/${id}/summary`, { method: "POST" }),
  getPaperExtraction: (id: string) => request<ExtractionResponse>(`/papers/${id}/extract`, { method: "POST" }),
  getCitations: (id: string) => request<import("../types").CitationExportResponse>(`/papers/${id}/citations`),
  generatePresentation: (paperIds: string[], topic?: string, mode?: string) =>
    request<import("../types").PresentationResponse>("/presentation", {
      method: "POST",
      body: JSON.stringify({ paper_ids: paperIds, topic, mode: mode || "professional" }),
    }),
  draftStudioSection: (data: { section_title: string; prompt: string; paper_ids?: string[]; current_content?: string; mode?: string }) =>
    request<import("../types").StudioDraftResponse>("/studio/draft", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  performWebSearch: (query: string, mode?: string, maxResults?: number) =>
    request<import("../types").WebSearchResponse>("/web-search", {
      method: "POST",
      body: JSON.stringify({ query, mode: mode || "professional", max_results: maxResults || 6 }),
    }),
  comparePapers: (paperIds: string[], focusAspect: string = "all") =>
    request<CompareResponse>("/compare", {
      method: "POST",
      body: JSON.stringify({ paper_ids: paperIds, focus_aspect: focusAspect }),
    }),
  getLiteratureReview: (paperIds: string[], themeFocus?: string) =>
    request<LiteratureReviewResponse>("/literature-review", {
      method: "POST",
      body: JSON.stringify({ paper_ids: paperIds, theme_focus: themeFocus }),
    }),
  getResearchGaps: (paperIds: string[]) =>
    request<ResearchGapsResponse>("/research-gaps", {
      method: "POST",
      body: JSON.stringify({ paper_ids: paperIds }),
    }),

  // Chat
  sendChat: (data: {
    content: string;
    conversation_id?: string;
    paper_ids?: string[];
    project_id?: string;
    mode?: string;
    use_web_research?: boolean;
  }) =>
    request<{ conversation_id: string; message: Message; suggested_questions?: string[] }>("/chat", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getConversations: () => request<Conversation[]>("/conversations"),
  getConversation: (id: string) => request<Conversation>(`/conversations/${id}`),
  deleteConversation: (id: string) => request<{ message: string }>(`/conversations/${id}`, { method: "DELETE" }),


  // Discovery
  searchDiscovery: (q: string, category?: string) => {
    const params = new URLSearchParams({ q });
    if (category) params.set("category", category);
    return request<{ query: string; total_found: number; results: DiscoveredPaper[] }>(`/discovery/search?${params.toString()}`);
  },
  saveDiscoveredPaper: (item: DiscoveredPaper) =>
    request<Paper>("/discovery/save", {
      method: "POST",
      body: JSON.stringify(item),
    }),

  // Projects
  getProjects: () => request<ResearchProject[]>("/projects"),
  getProject: (id: string) => request<ResearchProject>(`/projects/${id}`),
  createProject: (data: { name: string; description?: string; tags?: string[]; paper_ids?: string[] }) =>
    request<ResearchProject>("/projects", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateProject: (id: string, data: { name?: string; description?: string; tags?: string[]; paper_ids?: string[] }) =>
    request<ResearchProject>(`/projects/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteProject: (id: string) => request<{ message: string }>(`/projects/${id}`, { method: "DELETE" }),

  // Notes
  getNotes: (paperId?: string, projectId?: string) => {
    const params = new URLSearchParams();
    if (paperId) params.set("paper_id", paperId);
    if (projectId) params.set("project_id", projectId);
    return request<Note[]>(`/notes?${params.toString()}`);
  },
  createNote: (data: { title: string; content: string; paper_id?: string; project_id?: string; tags?: string[] }) =>
    request<Note>("/notes", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  deleteNote: (id: string) => request<{ message: string }>(`/notes/${id}`, { method: "DELETE" }),

  // Insights
  getInsights: (paperId?: string, projectId?: string, type?: string) => {
    const params = new URLSearchParams();
    if (paperId) params.set("paper_id", paperId);
    if (projectId) params.set("project_id", projectId);
    if (type) params.set("insight_type", type);
    return request<SavedInsight[]>(`/insights?${params.toString()}`);
  },
  saveInsight: (data: { title: string; content: string; insight_type?: string; paper_id?: string; page_number?: number; project_id?: string; tags?: string[] }) =>
    request<SavedInsight>("/insights", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  createInsight: (data: { title?: string; content: string; insight_type?: string; paper_id?: string; page_number?: number; project_id?: string; tags?: string[] }) =>
    request<SavedInsight>("/insights", {
      method: "POST",
      body: JSON.stringify({ ...data, title: data.title || "Research Finding" }),
    }),
  deleteInsight: (id: string) => request<{ message: string }>(`/insights/${id}`, { method: "DELETE" }),

  // Collaboration
  getWorkspaces: () => request<import("../types").SharedWorkspace[]>("/collaboration/workspaces"),
  createWorkspace: (data: { name: string; members?: string[]; active_papers?: string[]; shared_notes?: string[] }) =>
    request<import("../types").SharedWorkspace>("/collaboration/workspaces", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getAnnotations: (paperId: string) =>
    request<import("../types").CollaborationAnnotation[]>(`/collaboration/annotations/${paperId}`),
  addAnnotation: (data: { paper_id: string; user_name: string; page_number: number; highlight_text: string; comment: string }) =>
    request<import("../types").CollaborationAnnotation>("/collaboration/annotations", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  generateShareLink: (data: { type: string; id: string; access_level?: string }) =>
    request<{ share_url: string; access_level: string; expires_in: string }>("/collaboration/share", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

