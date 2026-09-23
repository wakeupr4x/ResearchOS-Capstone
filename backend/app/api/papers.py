import os
import uuid
import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.api.deps import get_db
from app.models.entities import Paper, DocumentChunk
from app.schemas.dto import PaperResponse, PaperDetailResponse, PaperUpdate
from app.services.storage_service import storage_service
from app.services.document_service import DocumentService
from app.services.chunking_service import ChunkingService
from app.services.embedding_service import embedding_service
from app.repositories.vector_store import VectorStoreRepository

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/papers", tags=["Papers"])


def process_paper_pipeline(paper_id: str, db_session_factory):
    """Background task to extract text, chunk, embed, and index a paper."""
    db = db_session_factory()
    try:
        paper = db.query(Paper).filter(Paper.id == paper_id).first()
        if not paper or not paper.file_path:
            return

        paper.status = "processing"
        db.commit()

        # 1. Document Extraction
        extracted = DocumentService.extract_document(paper.file_path)
        paper.page_count = extracted["page_count"]
        paper.extracted_tables = extracted.get("tables", [])
        paper.extracted_figures = extracted.get("figures", [])
        if extracted.get("title") and (not paper.title or paper.title.startswith("paper_") or paper.title.endswith(".pdf")):
            paper.title = extracted["title"]
        if extracted.get("abstract"):
            paper.abstract = extracted["abstract"]

        paper.status = "indexing"
        db.commit()

        # 2. Chunking
        chunker = ChunkingService()
        chunks = chunker.chunk_document(paper_id=paper.id, pages=extracted["pages"])

        if chunks:
            # 3. Embedding
            texts_to_embed = [c.content for c in chunks]
            embeddings = embedding_service.embed_texts(texts_to_embed)
            for c, emb in zip(chunks, embeddings):
                c.embedding = emb

            # 4. Vector Storage
            vector_repo = VectorStoreRepository(db)
            vector_repo.add_chunks(chunks)

        paper.status = "ready"
        db.commit()
        logger.info(f"Successfully processed and indexed paper {paper.id} ({len(chunks)} chunks)")

    except Exception as e:
        logger.error(f"Error processing paper {paper_id}: {e}", exc_info=True)
        try:
            paper = db.query(Paper).filter(Paper.id == paper_id).first()
            if paper:
                paper.status = "failed"
                paper.error_message = str(e)
                db.commit()
        except Exception:
            pass
    finally:
        db.close()


@router.post("/upload", response_model=PaperResponse)
async def upload_paper(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    tags: Optional[str] = Form(None),
    db: Session = Depends(get_db),
):
    """Uploads a PDF paper and queues document intelligence processing."""
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    content = await file.read()
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    # Save to disk
    unique_filename = f"{uuid.uuid4().hex}_{file.filename}"
    file_path, _ = storage_service.save_file(unique_filename, content)

    # Clean title
    paper_title = title or os.path.splitext(file.filename)[0].replace("_", " ").replace("-", " ").title()
    parsed_tags = [t.strip() for t in tags.split(",") if t.strip()] if tags else []

    paper = Paper(
        id=str(uuid.uuid4()),
        title=paper_title,
        source="upload",
        file_path=file_path,
        status="uploaded",
        tags=parsed_tags,
    )
    db.add(paper)
    db.commit()
    db.refresh(paper)

    # Trigger background pipeline
    from app.repositories.database import SessionLocal
    background_tasks.add_task(process_paper_pipeline, paper.id, SessionLocal)

    return paper


@router.get("", response_model=List[PaperResponse])
def list_papers(
    query: Optional[str] = None,
    tag: Optional[str] = None,
    status: Optional[str] = None,
    is_favorite: Optional[bool] = None,
    db: Session = Depends(get_db),
):
    """Lists papers with optional search and filtering."""
    q = db.query(Paper)
    if query:
        search_term = f"%{query.strip()}%"
        q = q.filter(or_(Paper.title.ilike(search_term), Paper.abstract.ilike(search_term)))
    if status:
        q = q.filter(Paper.status == status)
    if is_favorite is not None:
        q = q.filter(Paper.is_favorite == is_favorite)

    papers = q.order_by(Paper.created_at.desc()).all()
    if tag:
        papers = [p for p in papers if p.tags and tag.lower() in [t.lower() for t in p.tags]]
    return papers


@router.get("/{paper_id}", response_model=PaperDetailResponse)
def get_paper(paper_id: str, db: Session = Depends(get_db)):
    """Retrieves full details for a paper including chunks and metadata."""
    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found.")
    return paper


@router.get("/{paper_id}/status")
def get_paper_status(paper_id: str, db: Session = Depends(get_db)):
    """Returns the current processing status of a paper."""
    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found.")
    return {
        "id": paper.id,
        "status": paper.status,
        "error_message": paper.error_message,
        "page_count": paper.page_count,
        "chunks_indexed": len(paper.chunks),
    }


@router.post("/{paper_id}/process", response_model=PaperResponse)
def reprocess_paper(paper_id: str, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Re-triggers document parsing and indexing."""
    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found.")
    if not paper.file_path or not os.path.exists(paper.file_path):
        raise HTTPException(status_code=400, detail="Paper file is missing from storage.")

    # Delete existing chunks
    db.query(DocumentChunk).filter(DocumentChunk.paper_id == paper_id).delete()
    paper.status = "uploaded"
    paper.error_message = None
    db.commit()

    from app.repositories.database import SessionLocal
    background_tasks.add_task(process_paper_pipeline, paper.id, SessionLocal)
    return paper


@router.patch("/{paper_id}", response_model=PaperResponse)
def update_paper(paper_id: str, updates: PaperUpdate, db: Session = Depends(get_db)):
    """Updates paper metadata, tags, or favorite status."""
    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found.")

    if updates.title is not None:
        paper.title = updates.title
    if updates.authors is not None:
        paper.authors = updates.authors
    if updates.abstract is not None:
        paper.abstract = updates.abstract
    if updates.publication_year is not None:
        paper.publication_year = updates.publication_year
    if updates.journal is not None:
        paper.journal = updates.journal
    if updates.tags is not None:
        paper.tags = updates.tags
    if updates.is_favorite is not None:
        paper.is_favorite = updates.is_favorite

    db.commit()
    db.refresh(paper)
    return paper


@router.delete("/{paper_id}")
def delete_paper(paper_id: str, db: Session = Depends(get_db)):
    """Deletes paper, chunks, and storage file."""
    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found.")

    if paper.file_path:
        storage_service.delete_file(paper.file_path)

    db.delete(paper)
    db.commit()
    return {"message": "Paper successfully deleted."}


@router.get("/{paper_id}/file")
def get_paper_file(paper_id: str, db: Session = Depends(get_db)):
    """Streams the raw PDF file for in-browser rendering."""
    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if not paper or not paper.file_path or not os.path.exists(paper.file_path):
        raise HTTPException(status_code=404, detail="PDF file not found.")
    return FileResponse(
        path=paper.file_path,
        media_type="application/pdf",
        content_disposition_type="inline",
    )


@router.get("/{paper_id}/figures/{filename}")
def get_paper_figure(paper_id: str, filename: str, db: Session = Depends(get_db)):
    """Serves extracted visual figures and diagrams from PDF."""
    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if not paper or not paper.file_path:
        raise HTTPException(status_code=404, detail="Paper not found.")

    figures_dir = os.path.join(os.path.dirname(paper.file_path), "figures")
    safe_filename = os.path.basename(filename)
    fig_path = os.path.join(figures_dir, safe_filename)

    if not os.path.exists(fig_path):
        raise HTTPException(status_code=404, detail="Figure not found.")

    return FileResponse(path=fig_path)

