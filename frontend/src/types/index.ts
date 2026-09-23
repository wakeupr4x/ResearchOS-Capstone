export interface Citation {
  paper_id: string;
  paper_title: string;
  page_number: number;
  chunk_id?: string;
  section?: string;
  excerpt: string;
  score: number;
}

export interface DocumentChunk {
  id: string;
  paper_id: string;
  chunk_index: number;
  page_number: number;
  section: string;
  content: string;
  token_count: number;
}

export interface Paper {
  id: string;
  title: string;
  authors: string[];
  abstract?: string;
  publication_year?: number;
  journal?: string;
  doi?: string;
  url?: string;
  file_path?: string;
  source: string;
  status: "uploaded" | "processing" | "indexing" | "ready" | "failed";
  error_message?: string;
  page_count: number;
  tags: string[];
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExtractedTable {
  page_number: number;
  row_count: number;
  col_count: number;
  headers: string[];
  sample_rows: any[][];
}

export interface ExtractedFigure {
  page_number: number;
  filename: string;
  url: string;
  width: number;
  height: number;
}

export interface PaperDetail extends Paper {
  summary?: Record<string, any>;
  extracted_metadata?: Record<string, any>;
  extracted_tables?: ExtractedTable[];
  extracted_figures?: ExtractedFigure[];
  chunks?: DocumentChunk[];
}

export interface Message {
  id: string;
  conversation_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  citations: Citation[];
  suggested_questions?: string[];
  created_at: string;
}


export interface Conversation {
  id: string;
  title: string;
  project_id?: string;
  paper_ids: string[];
  messages?: Message[];
  created_at: string;
  updated_at: string;
}

export interface SummaryResponse {
  paper_id: string;
  paper_title: string;
  executive_summary: string;
  research_problem: string;
  research_objective: string;
  methodology: string;
  dataset: string;
  model_approach: string;
  key_results: string;
  limitations: string;
  conclusion: string;
  key_takeaways: string[];
  citations: Citation[];
}

export interface ExtractionResponse {
  paper_id: string;
  paper_title: string;
  research_problem: string;
  objectives: string;
  methodology: string;
  dataset: string;
  sample_size: string;
  models_algorithms: string;
  evaluation_metrics: string;
  results: string;
  limitations: string;
  future_work: string;
  citations: Citation[];
}

export interface ComparisonRow {
  attribute: string;
  values: Record<string, string>;
}

export interface CompareResponse {
  papers: Array<{
    id: string;
    title: string;
    authors: string[];
    publication_year?: number;
  }>;
  matrix: ComparisonRow[];
  synthesis: string;
  citations: Citation[];
}

export interface LiteratureTheme {
  theme_name: string;
  description: string;
  supporting_papers: string[];
}

export interface LiteratureReviewResponse {
  title: string;
  overview: string;
  key_themes: LiteratureTheme[];
  methodological_progression: string;
  agreements_and_contradictions: string;
  limitations_and_challenges: string;
  emerging_trends: string;
  citations: Citation[];
}

export interface PotentialGapItem {
  title: string;
  category: string;
  description: string;
  supporting_evidence: Citation[];
  suggested_future_direction: string;
}

export interface ResearchGapsResponse {
  analyzed_papers_count: number;
  potential_gaps: PotentialGapItem[];
  disclaimer: string;
}

export interface DiscoveredPaper {
  title: string;
  authors: string[];
  summary: string;
  published_year?: number;
  published_date?: string;
  arxiv_id?: string;
  doi?: string;
  pdf_url?: string;
  primary_category?: string;
  source: string;
  in_library: boolean;
}

export interface ResearchProject {
  id: string;
  name: string;
  description?: string;
  tags: string[];
  papers?: Paper[];
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  paper_id?: string;
  project_id?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface SavedInsight {
  id: string;
  title: string;
  insight_type: string;
  content: string;
  paper_id?: string;
  paper_title?: string;
  page_number?: number;
  project_id?: string;
  tags: string[];
  created_at: string;
}

export interface DashboardStats {
  papers_count: number;
  projects_count: number;
  conversations_count: number;
  insights_count: number;
  notes_count: number;
  indexed_chunks_count: number;
  llm_provider: string;
  embedding_provider: string;
}

export interface PresentationSlide {
  slide_number: number;
  title: string;
  subtitle?: string;
  bullets: string[];
  key_metric_or_callout?: string;
  speaker_notes?: string;
}

export interface PresentationResponse {
  title: string;
  author_attribution: string;
  slides: PresentationSlide[];
}

export interface CitationExportResponse {
  paper_id: string;
  paper_title: string;
  bibtex: string;
  apa: string;
  mla: string;
  ieee: string;
  chicago: string;
}

export interface StudioDraftResponse {
  section_title: string;
  draft_content: string;
  suggested_citations: string[];
}

export interface WebSearchResultItem {
  title: string;
  authors: string[];
  year?: number;
  snippet: string;
  url: string;
  source: string;
}

export interface WebSearchResponse {
  query: string;
  synthesis: string;
  results: WebSearchResultItem[];
}

export interface CollaborationAnnotation {
  id: string;
  paper_id: string;
  user_name: string;
  page_number: number;
  highlight_text: string;
  comment: string;
  created_at: string;
}

export interface SharedWorkspace {
  workspace_id: string;
  name: string;
  members: string[];
  active_papers: string[];
  shared_notes: string[];
  annotations_count: number;
}

