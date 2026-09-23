import re
import uuid
from typing import List, Dict, Any
from app.models.entities import DocumentChunk


class ChunkingService:
    """
    Hierarchical semantic chunker that preserves page boundaries,
    section titles, and token counts with sliding overlap.
    """

    def __init__(self, target_chunk_size: int = 400, overlap_size: int = 50):
        self.target_chunk_size = target_chunk_size
        self.overlap_size = overlap_size

    def estimate_tokens(self, text: str) -> int:
        """Approximate token count (1 token ≈ 4 characters or ~0.75 words)."""
        words = text.split()
        return max(1, int(len(words) * 1.3))

    def chunk_document(self, paper_id: str, pages: List[Dict[str, Any]]) -> List[DocumentChunk]:
        """
        Takes extracted pages and produces structured DocumentChunk entities.
        """
        chunks: List[DocumentChunk] = []
        global_chunk_idx = 0

        for page_data in pages:
            page_num = page_data["page_number"]
            page_text = page_data["text"]
            section = page_data.get("section", "General")

            if not page_text.strip():
                continue

            # Split into paragraphs
            paragraphs = re.split(r"\n\s*\n", page_text)
            current_buffer = []
            current_token_count = 0

            for para in paragraphs:
                clean_para = " ".join(para.split())
                if not clean_para:
                    continue

                para_tokens = self.estimate_tokens(clean_para)

                if current_token_count + para_tokens <= self.target_chunk_size:
                    current_buffer.append(clean_para)
                    current_token_count += para_tokens
                else:
                    if current_buffer:
                        chunk_text = "\n\n".join(current_buffer)
                        chunks.append(
                            DocumentChunk(
                                id=str(uuid.uuid4()),
                                paper_id=paper_id,
                                chunk_index=global_chunk_idx,
                                page_number=page_num,
                                section=section,
                                content=chunk_text,
                                token_count=current_token_count,
                            )
                        )
                        global_chunk_idx += 1

                    # Keep last paragraph or tail as overlap
                    if len(clean_para) > 2000:
                        # Para itself is huge, split by sentences
                        sentences = re.split(r"(?<=[.?!])\s+", clean_para)
                        sub_buf = []
                        sub_tokens = 0
                        for sent in sentences:
                            s_tok = self.estimate_tokens(sent)
                            if sub_tokens + s_tok > self.target_chunk_size and sub_buf:
                                chunks.append(
                                    DocumentChunk(
                                        id=str(uuid.uuid4()),
                                        paper_id=paper_id,
                                        chunk_index=global_chunk_idx,
                                        page_number=page_num,
                                        section=section,
                                        content=" ".join(sub_buf),
                                        token_count=sub_tokens,
                                    )
                                )
                                global_chunk_idx += 1
                                sub_buf = sub_buf[-1:] if len(sub_buf) > 1 else []
                                sub_tokens = sum(self.estimate_tokens(s) for s in sub_buf)
                            sub_buf.append(sent)
                            sub_tokens += s_tok

                        current_buffer = sub_buf
                        current_token_count = sub_tokens
                    else:
                        current_buffer = [clean_para]
                        current_token_count = para_tokens

            # Flush remaining buffer for this page
            if current_buffer:
                chunk_text = "\n\n".join(current_buffer)
                chunks.append(
                    DocumentChunk(
                        id=str(uuid.uuid4()),
                        paper_id=paper_id,
                        chunk_index=global_chunk_idx,
                        page_number=page_num,
                        section=section,
                        content=chunk_text,
                        token_count=current_token_count,
                    )
                )
                global_chunk_idx += 1

        return chunks
