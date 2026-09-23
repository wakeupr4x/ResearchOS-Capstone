import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.models.entities import SavedInsight, Paper
from app.schemas.dto import InsightCreate, InsightResponse

router = APIRouter(prefix="/api/insights", tags=["Saved Insights"])


@router.post("", response_model=InsightResponse)
def save_insight(req: InsightCreate, db: Session = Depends(get_db)):
    """Saves a research finding, quote, or AI-generated insight."""
    paper_title = req.paper_title
    if req.paper_id and not paper_title:
        paper = db.query(Paper).filter(Paper.id == req.paper_id).first()
        if paper:
            paper_title = paper.title

    insight = SavedInsight(
        id=str(uuid.uuid4()),
        title=req.title,
        insight_type=req.insight_type,
        content=req.content,
        paper_id=req.paper_id,
        paper_title=paper_title,
        page_number=req.page_number,
        project_id=req.project_id,
        tags=req.tags,
    )
    db.add(insight)
    db.commit()
    db.refresh(insight)
    return insight


@router.get("", response_model=List[InsightResponse])
def list_insights(
    paper_id: Optional[str] = Query(None),
    project_id: Optional[str] = Query(None),
    insight_type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """Lists saved insights with optional filtering."""
    q = db.query(SavedInsight)
    if paper_id:
        q = q.filter(SavedInsight.paper_id == paper_id)
    if project_id:
        q = q.filter(SavedInsight.project_id == project_id)
    if insight_type:
        q = q.filter(SavedInsight.insight_type == insight_type)
    return q.order_by(SavedInsight.created_at.desc()).all()


@router.delete("/{insight_id}")
def delete_insight(insight_id: str, db: Session = Depends(get_db)):
    """Deletes a saved insight."""
    insight = db.query(SavedInsight).filter(SavedInsight.id == insight_id).first()
    if not insight:
        raise HTTPException(status_code=404, detail="Insight not found.")
    db.delete(insight)
    db.commit()
    return {"message": "Insight deleted."}
