import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.models.entities import Note
from app.schemas.dto import NoteCreate, NoteUpdate, NoteResponse

router = APIRouter(prefix="/api/notes", tags=["Notes"])


@router.post("", response_model=NoteResponse)
def create_note(req: NoteCreate, db: Session = Depends(get_db)):
    """Creates a research note attached to a paper or project."""
    note = Note(
        id=str(uuid.uuid4()),
        title=req.title,
        content=req.content,
        paper_id=req.paper_id,
        project_id=req.project_id,
        tags=req.tags,
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@router.get("", response_model=List[NoteResponse])
def list_notes(
    paper_id: Optional[str] = Query(None),
    project_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """Lists research notes, optionally filtered by paper or project."""
    q = db.query(Note)
    if paper_id:
        q = q.filter(Note.paper_id == paper_id)
    if project_id:
        q = q.filter(Note.project_id == project_id)
    return q.order_by(Note.updated_at.desc()).all()


@router.get("/{note_id}", response_model=NoteResponse)
def get_note(note_id: str, db: Session = Depends(get_db)):
    """Retrieves a single note."""
    note = db.query(Note).filter(Note.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found.")
    return note


@router.patch("/{note_id}", response_model=NoteResponse)
def update_note(note_id: str, req: NoteUpdate, db: Session = Depends(get_db)):
    """Updates a note."""
    note = db.query(Note).filter(Note.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found.")

    if req.title is not None:
        note.title = req.title
    if req.content is not None:
        note.content = req.content
    if req.tags is not None:
        note.tags = req.tags

    db.commit()
    db.refresh(note)
    return note


@router.delete("/{note_id}")
def delete_note(note_id: str, db: Session = Depends(get_db)):
    """Deletes a note."""
    note = db.query(Note).filter(Note.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found.")
    db.delete(note)
    db.commit()
    return {"message": "Note deleted."}
