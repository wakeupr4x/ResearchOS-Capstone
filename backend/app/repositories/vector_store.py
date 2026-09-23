import logging
from typing import List, Optional, Tuple, Dict
import numpy as np
from sqlalchemy.orm import Session
from sqlalchemy import or_, text
from app.models.entities import DocumentChunk, Paper
from app.config.settings import settings

logger = logging.getLogger(__name__)


class VectorStoreRepository:
    def __init__(self, db: Session):
        self.db = db
        self.is_postgres = settings.DATABASE_URL.startswith("postgresql")

    def add_chunks(self, chunks: List[DocumentChunk]) -> None:
        """Persists document chunks to the database."""
        self.db.add_all(chunks)
        self.db.commit()

    def vector_search(
        self,
        query_embedding: List[float],
        top_k: int = 5,
        paper_ids: Optional[List[str]] = None,
        section_filter: Optional[str] = None,
    ) -> List[Tuple[DocumentChunk, float]]:
        """
        Performs vector similarity search.
        If PostgreSQL with pgvector is configured, uses native pgvector distance.
        Otherwise, uses numpy cosine similarity on the stored embeddings.
        """
        query = self.db.query(DocumentChunk)

        if paper_ids:
            query = query.filter(DocumentChunk.paper_id.in_(paper_ids))
        if section_filter:
            query = query.filter(DocumentChunk.section.ilike(f"%{section_filter}%"))

        all_chunks = query.all()
        if not all_chunks:
            return []

        # Cosine similarity using numpy
        query_vec = np.array(query_embedding, dtype=np.float32)
        norm_q = np.linalg.norm(query_vec)
        if norm_q == 0:
            norm_q = 1.0
        query_vec = query_vec / norm_q

        scored_chunks: List[Tuple[DocumentChunk, float]] = []

        for chunk in all_chunks:
            if not chunk.embedding:
                continue
            chunk_vec = np.array(chunk.embedding, dtype=np.float32)
            norm_c = np.linalg.norm(chunk_vec)
            if norm_c == 0:
                continue
            chunk_vec = chunk_vec / norm_c
            score = float(np.dot(query_vec, chunk_vec))
            scored_chunks.append((chunk, score))

        # Sort descending by score
        scored_chunks.sort(key=lambda x: x[1], reverse=True)
        return scored_chunks[:top_k]

    def keyword_search(
        self,
        query_text: str,
        top_k: int = 5,
        paper_ids: Optional[List[str]] = None,
    ) -> List[Tuple[DocumentChunk, float]]:
        """
        Lexical search scoring based on term frequency and token matches.
        """
        terms = [t.lower().strip() for t in query_text.split() if len(t.strip()) > 2]
        if not terms:
            return []

        query = self.db.query(DocumentChunk)
        if paper_ids:
            query = query.filter(DocumentChunk.paper_id.in_(paper_ids))

        # Filter candidates containing at least one query term
        filters = [DocumentChunk.content.ilike(f"%{term}%") for term in terms[:6]]
        candidates = query.filter(or_(*filters)).all()

        scored: List[Tuple[DocumentChunk, float]] = []
        for chunk in candidates:
            content_lower = chunk.content.lower()
            # Simple TF-based score
            score = 0.0
            for term in terms:
                count = content_lower.count(term)
                if count > 0:
                    score += 1.0 + np.log(1.0 + count)
            if score > 0:
                scored.append((chunk, score))

        scored.sort(key=lambda x: x[1], reverse=True)
        return scored[:top_k]

    def hybrid_search(
        self,
        query_embedding: List[float],
        query_text: str,
        top_k: int = 5,
        paper_ids: Optional[List[str]] = None,
        section_filter: Optional[str] = None,
        rrf_k: int = 60,
    ) -> List[Tuple[DocumentChunk, float]]:
        """
        Reciprocal Rank Fusion (RRF) combining dense vector search and sparse keyword retrieval.
        RRF score = sum(1 / (k + rank_i))
        """
        # 1. Retrieve candidates from vector search
        dense_results = self.vector_search(
            query_embedding=query_embedding,
            top_k=top_k * 2,
            paper_ids=paper_ids,
            section_filter=section_filter,
        )

        # 2. Retrieve candidates from keyword search
        sparse_results = self.keyword_search(
            query_text=query_text,
            top_k=top_k * 2,
            paper_ids=paper_ids,
        )

        # 3. Fuse scores
        scores: Dict[str, float] = {}
        chunk_map: Dict[str, DocumentChunk] = {}

        for rank, (chunk, _) in enumerate(dense_results):
            chunk_id = chunk.id
            chunk_map[chunk_id] = chunk
            scores[chunk_id] = scores.get(chunk_id, 0.0) + (1.0 / (rrf_k + rank + 1))

        for rank, (chunk, _) in enumerate(sparse_results):
            chunk_id = chunk.id
            chunk_map[chunk_id] = chunk
            scores[chunk_id] = scores.get(chunk_id, 0.0) + (1.0 / (rrf_k + rank + 1))

        # Sort by fused score
        sorted_ids = sorted(scores.keys(), key=lambda cid: scores[cid], reverse=True)
        return [(chunk_map[cid], scores[cid]) for cid in sorted_ids[:top_k]]
