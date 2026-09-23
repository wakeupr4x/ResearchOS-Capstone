import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.models.entities import ResearchProject, Paper
from app.schemas.dto import ProjectCreate, ProjectUpdate, ProjectResponse

router = APIRouter(prefix="/api/projects", tags=["Research Projects"])


@router.post("", response_model=ProjectResponse)
def create_project(req: ProjectCreate, db: Session = Depends(get_db)):
    """Creates a new research project collection."""
    project = ResearchProject(
        id=str(uuid.uuid4()),
        name=req.name,
        description=req.description,
        tags=req.tags,
    )
    if req.paper_ids:
        papers = db.query(Paper).filter(Paper.id.in_(req.paper_ids)).all()
        project.papers = papers

    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@router.get("", response_model=List[ProjectResponse])
def list_projects(db: Session = Depends(get_db)):
    """Lists all research projects."""
    return db.query(ResearchProject).order_by(ResearchProject.updated_at.desc()).all()


@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(project_id: str, db: Session = Depends(get_db)):
    """Gets details and linked papers for a project."""
    project = db.query(ResearchProject).filter(ResearchProject.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")
    return project


@router.patch("/{project_id}", response_model=ProjectResponse)
def update_project(project_id: str, req: ProjectUpdate, db: Session = Depends(get_db)):
    """Updates research project metadata and linked papers."""
    project = db.query(ResearchProject).filter(ResearchProject.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")

    if req.name is not None:
        project.name = req.name
    if req.description is not None:
        project.description = req.description
    if req.tags is not None:
        project.tags = req.tags
    if req.paper_ids is not None:
        papers = db.query(Paper).filter(Paper.id.in_(req.paper_ids)).all()
        project.papers = papers

    db.commit()
    db.refresh(project)
    return project


@router.delete("/{project_id}")
def delete_project(project_id: str, db: Session = Depends(get_db)):
    """Deletes a research project."""
    project = db.query(ResearchProject).filter(ResearchProject.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")
    db.delete(project)
    db.commit()
    return {"message": "Project deleted."}
