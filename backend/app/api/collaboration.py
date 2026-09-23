import uuid
from datetime import datetime
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.schemas.dto import (
    SharedWorkspaceResponse,
    CollaborationAnnotation,
    CollaborationAnnotationCreate,
)

router = APIRouter(prefix="/api/collaboration", tags=["Collaboration & Team Workspaces"])

# In-memory store for collaborative real-time annotations and team workspaces (backed by projects)
_workspaces_db: Dict[str, Dict[str, Any]] = {
    "ws-default": {
        "workspace_id": "ws-default",
        "name": "General AI & Foundation Models Lab",
        "members": ["Lead Researcher (You)", "Dr. Aris Thorne", "Elena Rostova"],
        "active_papers": [],
        "shared_notes": ["Baseline latency benchmarks on Qwen 2.5", "Empirical study on RRF hybrid search"],
        "annotations_count": 3,
    },
    "ws-multimodal": {
        "workspace_id": "ws-multimodal",
        "name": "Multimodal Document Intelligence Group",
        "members": ["Lead Researcher (You)", "Marcus Vance", "Sara Chen"],
        "active_papers": [],
        "shared_notes": ["PyMuPDF layout extraction experiments", "Figure caption grounding metrics"],
        "annotations_count": 2,
    },
}

_annotations_db: List[Dict[str, Any]] = [
    {
        "id": "ann-1",
        "paper_id": "p-1",
        "user_name": "Dr. Aris Thorne",
        "page_number": 2,
        "highlight_text": "Hybrid dense-sparse retrieval achieves 94.2% grounding accuracy.",
        "comment": "Crucial finding: verify if this holds for non-English academic documents.",
        "created_at": datetime.now(),
    },
    {
        "id": "ann-2",
        "paper_id": "p-1",
        "user_name": "Elena Rostova",
        "page_number": 4,
        "highlight_text": "Sub-second ResearchOS neural inference with deep theoretical citation mapping.",
        "comment": "Added to our presentation slide deck for the departmental seminar.",
        "created_at": datetime.now(),
    },
]


@router.get("/workspaces", response_model=List[SharedWorkspaceResponse])
def get_workspaces():
    """Returns team workspaces for shared research."""
    return list(_workspaces_db.values())


@router.post("/workspaces", response_model=SharedWorkspaceResponse)
def create_workspace(payload: Dict[str, Any]):
    """Creates a new shared research workspace."""
    ws_id = f"ws-{uuid.uuid4().hex[:6]}"
    name = payload.get("name", "New Research Team")
    members = payload.get("members", ["Lead Researcher (You)"])
    ws = {
        "workspace_id": ws_id,
        "name": name,
        "members": members,
        "active_papers": payload.get("active_papers", []),
        "shared_notes": payload.get("shared_notes", ["Initial project setup"]),
        "annotations_count": 0,
    }
    _workspaces_db[ws_id] = ws
    return ws


@router.get("/annotations", response_model=List[CollaborationAnnotation])
@router.get("/annotations/{paper_id}", response_model=List[CollaborationAnnotation])
def get_annotations(paper_id: str = "all"):
    """Retrieves collaborative comments and highlights for a paper or all papers."""
    if not paper_id or paper_id == "all":
        return _annotations_db
    return [a for a in _annotations_db if a.get("paper_id") == paper_id]


@router.post("/annotations", response_model=CollaborationAnnotation)
def add_annotation(payload: CollaborationAnnotationCreate):
    """Creates a collaborative highlight or annotation."""
    new_ann = {
        "id": f"ann-{uuid.uuid4().hex[:6]}",
        "paper_id": payload.paper_id,
        "user_name": payload.user_name or "Researcher",
        "page_number": payload.page_number,
        "highlight_text": payload.highlight_text,
        "comment": payload.comment,
        "created_at": datetime.now(),
    }
    _annotations_db.insert(0, new_ann)
    return new_ann


@router.post("/share")
def generate_share_link(payload: Dict[str, Any]):
    """Generates an invitation or share link for a research project or paper."""
    target_type = payload.get("type", "paper")
    target_id = payload.get("id", "library")
    share_token = uuid.uuid4().hex[:10]
    return {
        "share_url": f"https://researchos.internal/share/{target_type}/{target_id}?token={share_token}",
        "access_level": payload.get("access_level", "editor"),
        "expires_in": "30 days",
    }
