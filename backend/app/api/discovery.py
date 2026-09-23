import uuid
import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.models.entities import Paper
from app.schemas.dto import DiscoverySearchResponse, DiscoveredPaperItem, PaperResponse
from app.services.discovery_service import DiscoveryService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/discovery", tags=["Discovery"])


@router.get("/search", response_model=DiscoverySearchResponse)
async def search_academic_papers(
    q: str = Query(..., description="Research query topic or keywords"),
    category: Optional[str] = Query(None, description="Optional arXiv category code, e.g. cs.AI"),
    max_results: int = Query(10, ge=1, le=30),
    db: Session = Depends(get_db),
):
    """Searches academic papers via arXiv and indicates if already saved in library."""
    response = await DiscoveryService.search_arxiv(query=q, category=category, max_results=max_results)

    # Check which items are already in user's library
    existing_titles = {p.title.lower().strip() for p in db.query(Paper.title).all()}
    for item in response.results:
        if item.title.lower().strip() in existing_titles:
            item.in_library = True

    return response


@router.post("/save", response_model=PaperResponse)
def save_discovered_paper(item: DiscoveredPaperItem, db: Session = Depends(get_db)):
    """Saves a discovered academic paper to the library."""
    # Check if already exists
    existing = db.query(Paper).filter(Paper.title.ilike(item.title.strip())).first()
    if existing:
        return existing

    tags = ["Discovered", "arXiv"]
    if item.primary_category:
        tags.append(item.primary_category)

    paper = Paper(
        id=str(uuid.uuid4()),
        title=item.title,
        authors=item.authors,
        abstract=item.summary,
        publication_year=item.published_year,
        journal=f"arXiv:{item.arxiv_id}" if item.arxiv_id else "arXiv",
        url=item.pdf_url,
        source="arxiv",
        status="ready",  # Abstract and metadata ready
        tags=tags,
    )
    db.add(paper)
    db.commit()
    db.refresh(paper)
    return paper
