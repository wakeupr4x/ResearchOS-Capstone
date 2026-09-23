import re
import logging
from typing import List, Optional, Dict, Any, Tuple
from sqlalchemy.orm import Session
from app.models.entities import Paper, DocumentChunk
from app.repositories.vector_store import VectorStoreRepository
from app.services.embedding_service import embedding_service
from app.ai.factory import get_llm_provider
from app.schemas.dto import CitationDTO

logger = logging.getLogger(__name__)

RAG_SYSTEM_PROMPT = """You are ResearchOS, an elite AI research assistant and literature intelligence engine.
Your mission is to provide rigorous, deeply grounded, factually accurate answers to scientific research queries.

CRITICAL RULES:
1. Ground your response STRICTLY in the provided Research Context.
2. Every major claim or empirical assertion MUST cite its source using inline bracket notation, e.g. [1], [2].
3. Clearly distinguish between:
   - FACT: Directly quoted or supported by a source.
   - SYNTHESIS: Logical combination of findings across multiple sources.
   - INFERENCE: Cautious extrapolation not directly asserted.
4. If the retrieved evidence is insufficient or does not mention the topic, EXPLICITLY state that the available papers do not contain sufficient evidence.
5. NEVER fabricate citations, page numbers, authors, or experimental metrics.
"""


class RAGService:
    def __init__(self, db: Session):
        self.db = db
        self.vector_store = VectorStoreRepository(db)
        self.llm = get_llm_provider()

    def answer_query(
        self,
        query: str,
        paper_ids: Optional[List[str]] = None,
        top_k: int = 6,
        mode: str = "professional",
        use_web_research: bool = False,
    ) -> Tuple[str, List[CitationDTO], List[str]]:
        """
        Executes the full RAG pipeline:
        Query -> Embedding -> Hybrid Search (Vector + Keyword RRF) -> Web Research (optional) -> Context Assembly -> LLM -> Citation Resolution & Follow-up Questions.
        """
        logger.info(f"Executing RAG query: '{query}' over paper_ids: {paper_ids}, mode: {mode}, web: {use_web_research}")

        # 1. Embed query
        query_embedding = embedding_service.embed_query(query)

        # 2. Hybrid Retrieval (Dense Vector + Sparse Keyword RRF)
        scored_chunks = self.vector_store.hybrid_search(
            query_embedding=query_embedding,
            query_text=query,
            top_k=top_k,
            paper_ids=paper_ids,
        )

        # 3. Retrieve paper titles and author metadata for clean citation mapping
        paper_cache: Dict[str, Paper] = {}
        for chunk, _ in scored_chunks:
            if chunk.paper_id not in paper_cache:
                p = self.db.query(Paper).filter(Paper.id == chunk.paper_id).first()
                if p:
                    paper_cache[chunk.paper_id] = p

        # If user explicitly asked for specific papers or library papers, load them even if chunks score low
        if paper_ids:
            for pid in paper_ids:
                if pid not in paper_cache:
                    p = self.db.query(Paper).filter(Paper.id == pid).first()
                    if p:
                        paper_cache[pid] = p

        # 4. Assemble Context & Citations
        context_blocks = []
        citations_list: List[CitationDTO] = []

        for idx, (chunk, score) in enumerate(scored_chunks, start=1):
            paper = paper_cache.get(chunk.paper_id)
            title = paper.title if paper else "Research Document"
            authors_str = ", ".join(paper.authors) if (paper and paper.authors) else "Unknown Authors"
            year_str = str(paper.publication_year) if (paper and paper.publication_year) else "N/A"
            doi_str = f" | DOI: {paper.doi}" if (paper and paper.doi) else ""
            url_str = f" | URL: {paper.url}" if (paper and paper.url) else ""

            # Create citation metadata
            excerpt = chunk.content[:300] + "..." if len(chunk.content) > 300 else chunk.content
            cit = CitationDTO(
                paper_id=chunk.paper_id,
                paper_title=title,
                page_number=chunk.page_number,
                chunk_id=chunk.id,
                section=chunk.section,
                excerpt=excerpt,
                score=round(score, 4),
            )
            citations_list.append(cit)

            context_blocks.append(
                f"[SOURCE {idx}]: \"{title}\"\n"
                f"Authors: {authors_str} ({year_str}){doi_str}{url_str}\n"
                f"Section: {chunk.section}, Page {chunk.page_number}\n"
                f"Content:\n{chunk.content}"
            )

        # Also provide full paper header info if the user asked about authors / papers
        if paper_cache:
            papers_header = "Available Indexed Papers in Scope:\n" + "\n".join(
                [f"- \"{p.title}\" | Authors: {', '.join(p.authors) if p.authors else 'Unknown'} | Year: {p.publication_year or 'N/A'}"
                 for p in paper_cache.values()]
            )
            context_blocks.insert(0, papers_header)

        # Optional live web research via arXiv
        web_context_blocks = []
        if use_web_research:
            try:
                import httpx
                import xml.etree.ElementTree as ET
                clean_q = "+".join(query.strip().split()[:6])
                arxiv_resp = httpx.get(
                    f"http://export.arxiv.org/api/query?search_query=all:{clean_q}&max_results=3&sortBy=relevance",
                    timeout=5.0
                )
                if arxiv_resp.status_code == 200:
                    root = ET.fromstring(arxiv_resp.text)
                    ns = {"atom": "http://www.w3.org/2005/Atom"}
                    for e_idx, entry in enumerate(root.findall("atom:entry", ns), start=1):
                        w_title = " ".join((entry.find("atom:title", ns).text or "").split())
                        w_summary = " ".join((entry.find("atom:summary", ns).text or "").split())
                        w_authors = [a.find("atom:name", ns).text.strip() for a in entry.findall("atom:author", ns) if a.find("atom:name", ns) is not None]
                        w_id = entry.find("atom:id", ns).text or ""
                        web_context_blocks.append(
                            f"[WEB SOURCE {e_idx}]: \"{w_title}\"\nAuthors: {', '.join(w_authors[:4])}\nLink: {w_id}\nAbstract:\n{w_summary[:500]}..."
                        )
            except Exception as e:
                logger.warning(f"Live web search timed out or encountered error: {e}")

        if web_context_blocks:
            context_blocks.append("--- LIVE WEB RESEARCH FINDINGS (arXiv) ---\n" + "\n\n".join(web_context_blocks))

        if not context_blocks:
            fallback_ans = (
                "No relevant passages were found in the selected papers to answer this question. "
                "Please verify that the papers have been processed and indexed, or enable Web Research."
            )
            fallback_questions = [
                "What are the main research goals of the indexed papers?",
                "Which methodologies are employed across the literature?",
                "What datasets or benchmarks are analyzed?",
            ]
            return fallback_ans, [], fallback_questions

        assembled_context = "\n\n".join(context_blocks)

        mode_instruction = (
            "STUDENT MODE 🎓:\n"
            "- Explain concepts intuitively with clear language and real-world analogies.\n"
            "- Define complex scientific terminology simply.\n"
            "- Provide structured key takeaways and practical summaries."
            if mode == "student"
            else
            "PROFESSIONAL MODE 🔬:\n"
            "- Deliver deep academic and methodological precision.\n"
            "- Cite empirical metrics, sample sizes, benchmark results, and architectural tradeoffs.\n"
            "- Critically highlight limitations, theoretical foundations, and scientific validity."
        )

        prompt = f"""Question: {query}

Research Context:
{assembled_context}

Instructions:
1. Provide a comprehensive, factual, citation-backed answer. Use bracket citations like [1], [2] matching the sources above.
2. CRITICAL: If asked about authors, author names, researchers, publication year, or source details, ALWAYS provide the exact author names and publication year from the Source metadata.
3. {mode_instruction}
4. At the very end of your response, add a section exactly like this:
---SUGGESTED_QUESTIONS---
- [Suggest an insightful follow-up question related to this topic]
- [Suggest a second follow-up question]
- [Suggest a third follow-up question]
"""

        # 5. Generate Answer via LLM
        try:
            raw_answer = self.llm.generate(
                prompt=prompt,
                system_instruction=RAG_SYSTEM_PROMPT,
                temperature=0.2,
            )
        except Exception as e:
            logger.error(f"LLM generation failed: {e}")
            raw_answer = f"Error generating answer: {str(e)}"

        # 6. Extract suggested questions
        suggested_questions = []
        if "---SUGGESTED_QUESTIONS---" in raw_answer:
            parts = raw_answer.split("---SUGGESTED_QUESTIONS---")
            main_answer = parts[0].strip()
            q_lines = parts[1].strip().splitlines()
            for line in q_lines:
                clean_q = line.strip().lstrip("-*123456789. ")
                if len(clean_q) > 6:
                    suggested_questions.append(clean_q)
            raw_answer = main_answer
        else:
            suggested_questions = [
                f"How does the methodology compare with previous baselines?",
                f"What are the main limitations identified in this work?",
                f"What future research directions do the authors propose?",
            ]

        return raw_answer, citations_list, suggested_questions[:4]

