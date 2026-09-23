from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.models.entities import Paper, ResearchProject, Conversation, SavedInsight, Note, DocumentChunk
from app.schemas.dto import DashboardStatsResponse
from app.config.settings import settings

router = APIRouter(prefix="/api", tags=["Analytics & Health"])


@router.get("/health")
def health_check():
    """System health and readiness check."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "llm_provider": settings.LLM_PROVIDER,
        "embedding_provider": settings.EMBEDDING_PROVIDER,
    }


@router.get("/stats", response_model=DashboardStatsResponse)
def get_dashboard_stats(db: Session = Depends(get_db)):
    """Aggregated research intelligence statistics for the dashboard."""
    papers_count = db.query(Paper).count()
    projects_count = db.query(ResearchProject).count()
    conversations_count = db.query(Conversation).count()
    insights_count = db.query(SavedInsight).count()
    notes_count = db.query(Note).count()
    chunks_count = db.query(DocumentChunk).count()

    return DashboardStatsResponse(
        papers_count=papers_count,
        projects_count=projects_count,
        conversations_count=conversations_count,
        insights_count=insights_count,
        notes_count=notes_count,
        indexed_chunks_count=chunks_count,
        llm_provider=settings.LLM_PROVIDER,
        embedding_provider=settings.EMBEDDING_PROVIDER,
    )
