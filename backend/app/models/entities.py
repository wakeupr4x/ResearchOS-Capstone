import uuid
from datetime import datetime
from typing import List, Optional
from sqlalchemy import (
    Column,
    String,
    Text,
    Integer,
    Boolean,
    DateTime,
    ForeignKey,
    Table,
    JSON,
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

# Association table for Paper <-> ResearchProject
paper_projects = Table(
    "paper_projects",
    Base.metadata,
    Column("paper_id", String(36), ForeignKey("papers.id", ondelete="CASCADE"), primary_key=True),
    Column("project_id", String(36), ForeignKey("research_projects.id", ondelete="CASCADE"), primary_key=True),
)


class Paper(Base):
    __tablename__ = "papers"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(500), nullable=False)
    authors = Column(JSON, default=list)  # List[str]
    abstract = Column(Text, nullable=True)
    publication_year = Column(Integer, nullable=True)
    journal = Column(String(255), nullable=True)
    doi = Column(String(255), nullable=True)
    url = Column(String(1000), nullable=True)
    source = Column(String(50), default="upload")  # "upload", "arxiv", "manual"
    file_path = Column(String(1000), nullable=True)
    status = Column(String(50), default="uploaded")  # "uploaded", "processing", "indexing", "ready", "failed"
    error_message = Column(Text, nullable=True)
    page_count = Column(Integer, default=0)
    tags = Column(JSON, default=list)  # List[str]
    is_favorite = Column(Boolean, default=False)
    extracted_metadata = Column(JSON, default=dict)  # structured extractions
    extracted_tables = Column(JSON, default=list)  # extracted tabular structures
    extracted_figures = Column(JSON, default=list)  # extracted visual figure references
    summary = Column(JSON, default=dict)  # structured summary
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    chunks = relationship("DocumentChunk", back_populates="paper", cascade="all, delete-orphan")
    projects = relationship("ResearchProject", secondary=paper_projects, back_populates="papers")
    notes = relationship("Note", back_populates="paper", cascade="all, delete-orphan")
    insights = relationship("SavedInsight", back_populates="paper", cascade="all, delete-orphan")


class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    paper_id = Column(String(36), ForeignKey("papers.id", ondelete="CASCADE"), nullable=False, index=True)
    chunk_index = Column(Integer, nullable=False)
    page_number = Column(Integer, nullable=False)
    section = Column(String(100), default="General")
    content = Column(Text, nullable=False)
    token_count = Column(Integer, default=0)
    embedding = Column(JSON, nullable=True)  # List[float] stored in JSON for SQLite, or mapped to pgvector in PostgreSQL
    created_at = Column(DateTime, default=datetime.utcnow)

    paper = relationship("Paper", back_populates="chunks")


class ResearchProject(Base):
    __tablename__ = "research_projects"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    tags = Column(JSON, default=list)  # List[str]
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    papers = relationship("Paper", secondary=paper_projects, back_populates="projects")
    notes = relationship("Note", back_populates="project", cascade="all, delete-orphan")
    insights = relationship("SavedInsight", back_populates="project", cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="project", cascade="all, delete-orphan")


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), default="Research Conversation")
    project_id = Column(String(36), ForeignKey("research_projects.id", ondelete="SET NULL"), nullable=True)
    paper_ids = Column(JSON, default=list)  # List[str] IDs of papers scoped in chat
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    project = relationship("ResearchProject", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan", order_by="Message.created_at")


class Message(Base):
    __tablename__ = "messages"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    conversation_id = Column(String(36), ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(50), nullable=False)  # "user", "assistant", "system"
    content = Column(Text, nullable=False)
    citations = Column(JSON, default=list)  # List[dict]: {paper_id, paper_title, page_number, chunk_id, excerpt, score}
    created_at = Column(DateTime, default=datetime.utcnow)

    conversation = relationship("Conversation", back_populates="messages")


class Note(Base):
    __tablename__ = "notes"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    paper_id = Column(String(36), ForeignKey("papers.id", ondelete="SET NULL"), nullable=True, index=True)
    project_id = Column(String(36), ForeignKey("research_projects.id", ondelete="SET NULL"), nullable=True, index=True)
    tags = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    paper = relationship("Paper", back_populates="notes")
    project = relationship("ResearchProject", back_populates="notes")


class SavedInsight(Base):
    __tablename__ = "saved_insights"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False)
    insight_type = Column(String(50), default="finding")  # "finding", "result", "gap", "methodology", "quote"
    content = Column(Text, nullable=False)
    paper_id = Column(String(36), ForeignKey("papers.id", ondelete="SET NULL"), nullable=True, index=True)
    paper_title = Column(String(500), nullable=True)
    page_number = Column(Integer, nullable=True)
    project_id = Column(String(36), ForeignKey("research_projects.id", ondelete="SET NULL"), nullable=True, index=True)
    tags = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

    paper = relationship("Paper", back_populates="insights")
    project = relationship("ResearchProject", back_populates="insights")
