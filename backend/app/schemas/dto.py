from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


# -------------------------------------------------------------
# Base & Common
# -------------------------------------------------------------
class CitationDTO(BaseModel):
    paper_id: str
    paper_title: str
    page_number: int
    chunk_id: Optional[str] = None
    section: Optional[str] = "General"
    excerpt: str
    score: float = 0.0


# -------------------------------------------------------------
# Papers
# -------------------------------------------------------------
class PaperBase(BaseModel):
    title: str
    authors: List[str] = []
    abstract: Optional[str] = None
    publication_year: Optional[int] = None
    journal: Optional[str] = None
    doi: Optional[str] = None
    url: Optional[str] = None
    tags: List[str] = []


class PaperCreate(PaperBase):
    source: str = "upload"


class PaperUpdate(BaseModel):
    title: Optional[str] = None
    authors: Optional[List[str]] = None
    abstract: Optional[str] = None
    publication_year: Optional[int] = None
    journal: Optional[str] = None
    tags: Optional[List[str]] = None
    is_favorite: Optional[bool] = None


class ChunkDTO(BaseModel):
    id: str
    paper_id: str
    chunk_index: int
    page_number: int
    section: str
    content: str
    token_count: int

    model_config = ConfigDict(from_attributes=True)


class PaperResponse(PaperBase):
    id: str
    source: str
    status: str
    error_message: Optional[str] = None
    page_count: int
    is_favorite: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PaperDetailResponse(PaperResponse):
    summary: Optional[Dict[str, Any]] = None
    extracted_metadata: Optional[Dict[str, Any]] = None
    extracted_tables: Optional[List[Dict[str, Any]]] = []
    extracted_figures: Optional[List[Dict[str, Any]]] = []
    chunks: Optional[List[ChunkDTO]] = None


# -------------------------------------------------------------
# Chat & Conversations
# -------------------------------------------------------------
class MessageDTO(BaseModel):
    id: str
    conversation_id: str
    role: str
    content: str
    citations: List[CitationDTO] = []
    suggested_questions: List[str] = []
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ChatRequest(BaseModel):
    conversation_id: Optional[str] = None
    content: str
    paper_ids: Optional[List[str]] = None
    project_id: Optional[str] = None
    mode: Optional[str] = "professional"  # "student" or "professional"
    use_web_research: Optional[bool] = False


class ChatResponse(BaseModel):
    conversation_id: str
    message: MessageDTO
    suggested_questions: List[str] = []


class ConversationResponse(BaseModel):
    id: str
    title: str
    project_id: Optional[str] = None
    paper_ids: List[str] = []
    messages: List[MessageDTO] = []
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# -------------------------------------------------------------
# Research Features: Summary, Extraction, Compare, Literature, Gaps
# -------------------------------------------------------------
class SummaryResponse(BaseModel):
    paper_id: str
    paper_title: str
    executive_summary: str
    research_problem: str
    research_objective: str
    methodology: str
    dataset: str
    model_approach: str
    key_results: str
    limitations: str
    conclusion: str
    key_takeaways: List[str]
    citations: List[CitationDTO] = []


class ExtractionResponse(BaseModel):
    paper_id: str
    paper_title: str
    research_problem: str
    objectives: str
    methodology: str
    dataset: str
    sample_size: str
    models_algorithms: str
    evaluation_metrics: str
    results: str
    limitations: str
    future_work: str
    citations: List[CitationDTO] = []


class CompareRequest(BaseModel):
    paper_ids: List[str]
    focus_aspect: Optional[str] = "all"  # "methodology", "datasets", "results", "limitations", "all"


class PaperComparisonRow(BaseModel):
    attribute: str
    values: Dict[str, str]  # paper_id -> extracted value/summary


class CompareResponse(BaseModel):
    papers: List[Dict[str, Any]]  # id, title, year, authors
    matrix: List[PaperComparisonRow]
    synthesis: str
    citations: List[CitationDTO] = []


class LiteratureReviewRequest(BaseModel):
    paper_ids: List[str]
    theme_focus: Optional[str] = None


class LiteratureReviewResponse(BaseModel):
    title: str
    overview: str
    key_themes: List[Dict[str, Any]]  # theme_name, description, supporting_papers
    methodological_progression: str
    agreements_and_contradictions: str
    limitations_and_challenges: str
    emerging_trends: str
    citations: List[CitationDTO] = []


class ResearchGapsRequest(BaseModel):
    paper_ids: List[str]


class PotentialGapItem(BaseModel):
    title: str
    category: str  # "methodological", "data", "evaluation", "application"
    description: str
    supporting_evidence: List[CitationDTO]
    suggested_future_direction: str


class ResearchGapsResponse(BaseModel):
    analyzed_papers_count: int
    potential_gaps: List[PotentialGapItem]
    disclaimer: str = (
        "Potential research gaps are AI-assisted hypotheses derived from observed limitations "
        "and under-explored areas in the selected papers, and should be validated through comprehensive literature indexing."
    )


# -------------------------------------------------------------
# Presentation & Slide Deck
# -------------------------------------------------------------
class SlideItem(BaseModel):
    slide_number: int
    title: str
    subtitle: Optional[str] = None
    bullet_points: List[str] = []
    key_takeaway: Optional[str] = None
    citation_note: Optional[str] = None


class PresentationResponse(BaseModel):
    paper_title: str
    target_audience: str  # "Student / General" or "Professional / Conference"
    slides: List[SlideItem]
    markdown_deck: str



# -------------------------------------------------------------
# Paper Discovery
# -------------------------------------------------------------
class DiscoverySearchRequest(BaseModel):
    query: str
    category: Optional[str] = None
    max_results: int = 10


class DiscoveredPaperItem(BaseModel):
    title: str
    authors: List[str]
    summary: str
    published_year: Optional[int] = None
    published_date: Optional[str] = None
    arxiv_id: Optional[str] = None
    doi: Optional[str] = None
    pdf_url: Optional[str] = None
    primary_category: Optional[str] = None
    source: str = "arxiv"
    in_library: bool = False


class DiscoverySearchResponse(BaseModel):
    query: str
    total_found: int
    results: List[DiscoveredPaperItem]


# -------------------------------------------------------------
# Projects
# -------------------------------------------------------------
class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    tags: List[str] = []


class ProjectCreate(ProjectBase):
    paper_ids: Optional[List[str]] = []


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[List[str]] = None
    paper_ids: Optional[List[str]] = None


class ProjectResponse(ProjectBase):
    id: str
    papers: List[PaperResponse] = []
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# -------------------------------------------------------------
# Notes
# -------------------------------------------------------------
class NoteCreate(BaseModel):
    title: str
    content: str
    paper_id: Optional[str] = None
    project_id: Optional[str] = None
    tags: List[str] = []


class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    tags: Optional[List[str]] = None


class NoteResponse(BaseModel):
    id: str
    title: str
    content: str
    paper_id: Optional[str] = None
    project_id: Optional[str] = None
    tags: List[str] = []
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# -------------------------------------------------------------
# Saved Insights
# -------------------------------------------------------------
class InsightCreate(BaseModel):
    title: str
    insight_type: str = "finding"
    content: str
    paper_id: Optional[str] = None
    paper_title: Optional[str] = None
    page_number: Optional[int] = None
    project_id: Optional[str] = None
    tags: List[str] = []


class InsightResponse(BaseModel):
    id: str
    title: str
    insight_type: str
    content: str
    paper_id: Optional[str] = None
    paper_title: Optional[str] = None
    page_number: Optional[int] = None
    project_id: Optional[str] = None
    tags: List[str] = []
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# -------------------------------------------------------------
# Dashboard Stats & Health
# -------------------------------------------------------------
class DashboardStatsResponse(BaseModel):
    papers_count: int
    projects_count: int
    conversations_count: int
    insights_count: int
    notes_count: int
    indexed_chunks_count: int
    llm_provider: str
    embedding_provider: str


# -------------------------------------------------------------
# Presentation / Slide Generator
# -------------------------------------------------------------
class PresentationSlide(BaseModel):
    slide_number: int
    title: str
    subtitle: Optional[str] = None
    bullets: List[str] = []
    key_metric_or_callout: Optional[str] = None
    speaker_notes: Optional[str] = None


class PresentationRequest(BaseModel):
    paper_ids: List[str]
    topic: Optional[str] = None
    mode: Optional[str] = "professional"  # student or professional


class PresentationResponse(BaseModel):
    title: str
    author_attribution: str
    slides: List[PresentationSlide]


# -------------------------------------------------------------
# Research Paper Studio
# -------------------------------------------------------------
class StudioDraftRequest(BaseModel):
    section_title: str
    prompt: str
    paper_ids: Optional[List[str]] = []
    current_content: Optional[str] = ""
    mode: Optional[str] = "professional"


class StudioDraftResponse(BaseModel):
    section_title: str
    draft_content: str
    suggested_citations: List[str] = []


# -------------------------------------------------------------
# Citations Export
# -------------------------------------------------------------
class CitationExportResponse(BaseModel):
    paper_id: str
    paper_title: str
    bibtex: str
    apa: str
    mla: str
    ieee: str
    chicago: str


# -------------------------------------------------------------
# Web Research & Trending Discovery
# -------------------------------------------------------------
class WebSearchRequest(BaseModel):
    query: str
    mode: Optional[str] = "professional"
    max_results: Optional[int] = 6


class WebSearchResultItem(BaseModel):
    title: str
    authors: List[str] = []
    year: Optional[int] = None
    snippet: str
    url: str
    source: str = "arXiv"


class WebSearchResponse(BaseModel):
    query: str
    synthesis: str
    results: List[WebSearchResultItem]


# -------------------------------------------------------------
# Shared / Collaborative Workspace
# -------------------------------------------------------------
class CollaborationAnnotation(BaseModel):
    id: str
    paper_id: str
    user_name: str
    page_number: int
    highlight_text: str
    comment: str
    created_at: datetime


class CollaborationAnnotationCreate(BaseModel):
    paper_id: str
    user_name: str
    page_number: int
    highlight_text: str
    comment: str


class SharedWorkspaceResponse(BaseModel):
    workspace_id: str
    name: str
    members: List[str]
    active_papers: List[str]
    shared_notes: List[str]
    annotations_count: int

