import logging
import hashlib
from typing import List
import numpy as np
from app.config.settings import settings

logger = logging.getLogger(__name__)

_model_instance = None


def get_embedding_model():
    """Lazy load singleton SentenceTransformer model."""
    global _model_instance
    if _model_instance is None:
        try:
            from sentence_transformers import SentenceTransformer
            logger.info(f"Loading embedding model: {settings.EMBEDDING_MODEL}...")
            _model_instance = SentenceTransformer(settings.EMBEDDING_MODEL)
            logger.info("Embedding model loaded successfully.")
        except Exception as e:
            logger.warning(f"Could not load SentenceTransformer ({e}). Falling back to deterministic semantic hashing.")
            _model_instance = None
    return _model_instance


class EmbeddingService:
    def __init__(self):
        self.dim = settings.EMBEDDING_DIM

    def _fallback_embed(self, text: str) -> List[float]:
        """
        Deterministic pseudo-embedding for fallback when model is unavailable or in isolated environments.
        Produces normalized 384-dim vector using token ngram hashing.
        """
        vec = np.zeros(self.dim, dtype=np.float32)
        words = text.lower().split()
        for i, word in enumerate(words):
            h = int(hashlib.md5(word.encode()).hexdigest(), 16)
            idx = h % self.dim
            vec[idx] += 1.0 / (1.0 + (i * 0.05))
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        return vec.tolist()

    def embed_texts(self, texts: List[str]) -> List[List[float]]:
        """Embed a batch of texts."""
        if not texts:
            return []

        model = get_embedding_model()
        if model is not None:
            try:
                embeddings = model.encode(texts, convert_to_numpy=True, normalize_embeddings=True)
                return embeddings.tolist()
            except Exception as e:
                logger.error(f"Error encoding texts with model: {e}")

        return [self._fallback_embed(t) for t in texts]

    def embed_query(self, query: str) -> List[float]:
        """Embed a single query string."""
        results = self.embed_texts([query])
        return results[0] if results else [0.0] * self.dim


embedding_service = EmbeddingService()
